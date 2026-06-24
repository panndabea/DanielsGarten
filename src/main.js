import { getElements } from './app/dom.js';
import { registerServiceWorker, setupInstallPrompt, setupNetworkStatus } from './app/pwa.js';
import { buildContext, selectTasks } from './domain/task-engine.js';
import { createUi } from './app/ui.js';
import { fallbackWeather, fetchWeather, findCity } from './services/weather.js';

const CITY_PRESETS = {
  berlin: { label: 'Berlin', latitude: 52.52, longitude: 13.405 },
  hamburg: { label: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
  muenchen: { label: 'München', latitude: 48.1374, longitude: 11.5755 },
  koeln: { label: 'Köln', latitude: 50.9375, longitude: 6.9603 },
  frankfurt: { label: 'Frankfurt am Main', latitude: 50.1109, longitude: 8.6821 },
  stuttgart: { label: 'Stuttgart', latitude: 48.7758, longitude: 9.1829 },
  leipzig: { label: 'Leipzig', latitude: 51.3397, longitude: 12.3731 },
  freiburg: { label: 'Freiburg', latitude: 47.999, longitude: 7.8421 }
};

const GARDEN_LABELS = {
  balcony: 'Balkon',
  small: 'Kleiner Garten',
  garden: 'Garten',
  vegetable: 'Gemüsegarten',
  frontyard: 'Vorgarten',
  lawn: 'Rasenfläche'
};

const state = {
  minutes: 20,
  selectedTypes: new Set(['garden']),
  location: CITY_PRESETS.berlin,
  weather: null,
  busy: false,
  hasGenerated: false
};

const elements = getElements();
const ui = createUi(elements, state, GARDEN_LABELS);

function init() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  elements.timeButtons.forEach(button => button.addEventListener('click', () => selectMinutes(Number(button.dataset.minutes))));
  elements.customMinutes.addEventListener('input', handleCustomMinutes);
  elements.customMinutes.addEventListener('blur', normalizeCustomMinutes);
  elements.typeInputs.forEach(input => input.addEventListener('change', handleGardenTypes));
  elements.citySelect.addEventListener('change', handlePresetCity);
  elements.useGps.addEventListener('click', useGeolocation);
  elements.searchCity.addEventListener('click', searchCity);
  elements.plannerForm.addEventListener('submit', event => {
    event.preventDefault();
    generateRecommendations();
  });
  elements.regenerateButton.addEventListener('click', generateRecommendations);

  setupNetworkStatus({ setStatus: ui.setStatus });
  setupInstallPrompt({ elements, setStatus: ui.setStatus });
  registerServiceWorker();
  ui.updateTimeButtons();
  ui.updateSettingsSummary();
  ui.renderWeather(null);
  ui.renderIntroState();
}

function selectMinutes(minutes) {
  state.minutes = minutes;
  elements.customMinutes.value = '';
  elements.minutesFeedback.textContent = '';
  ui.updateTimeButtons();
  ui.updateFlowSignal();
}

function handleCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  const minutes = Number(rawValue);

  if (!rawValue) {
    elements.minutesFeedback.textContent = '';
    ui.updateTimeButtons();
    return;
  }

  if (!Number.isFinite(minutes) || minutes < 5) {
    elements.minutesFeedback.textContent = 'Mindestens 5 Minuten.';
    elements.timeButtons.forEach(button => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    return;
  }

  state.minutes = Math.min(minutes, 180);
  elements.minutesFeedback.textContent = minutes > 180
    ? 'Maximal 180 Minuten. Ich rechne mit 180.'
    : '';
  ui.updateTimeButtons();
  ui.updateFlowSignal();
}

function normalizeCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  if (!rawValue) return;

  const minutes = Number(rawValue);
  if (!Number.isFinite(minutes)) return;

  if (minutes < 5) {
    elements.customMinutes.value = '5';
    state.minutes = 5;
    elements.minutesFeedback.textContent = 'Ich rechne mit 5 Minuten.';
  }

  if (minutes > 180) {
    elements.customMinutes.value = '180';
    state.minutes = 180;
    elements.minutesFeedback.textContent = 'Ich rechne mit maximal 180 Minuten.';
  }

  ui.updateTimeButtons();
  ui.updateFlowSignal();
}

function handleGardenTypes(event) {
  const checked = elements.typeInputs.filter(input => input.checked);
  if (!checked.length) {
    event.target.checked = true;
    ui.setStatus('Wähle mindestens einen Gartentyp.');
    return;
  }

  state.selectedTypes = new Set(checked.map(input => input.value));
  ui.updateSettingsSummary();
}

function handlePresetCity() {
  const value = elements.citySelect.value;
  if (value === 'custom') {
    elements.cityInput.focus();
    return;
  }

  state.location = CITY_PRESETS[value];
  ui.updateSettingsSummary();
  ui.setStatus(`${state.location.label} ist ausgewählt.`);
}

async function searchCity() {
  const query = elements.cityInput.value.trim();
  if (query.length < 2) {
    ui.setStatus('Bitte gib mindestens zwei Zeichen ein.');
    return;
  }

  let didSelectCity = false;
  try {
    didSelectCity = await withBusy('Suche Stadt...', async () => {
      const location = await findCity(query);
      if (!location) {
        ui.setStatus('Diese Stadt habe ich nicht gefunden.');
        return false;
      }

      state.location = location;
      elements.citySelect.value = 'custom';
      ui.updateSettingsSummary();
      ui.setStatus(`${state.location.label} ist ausgewählt.`);
      return true;
    });
  } catch (error) {
    ui.setStatus('Die Stadtsuche ist gerade nicht erreichbar.');
  }

  if (didSelectCity) {
    await generateRecommendations();
  }
}

async function useGeolocation() {
  if (!navigator.geolocation) {
    ui.setStatus('GPS ist in diesem Browser nicht verfügbar.');
    return;
  }

  let didSelectLocation = false;
  try {
    didSelectLocation = await withBusy('Warte auf Standortfreigabe...', async () => {
      const position = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 0
      });

      state.location = {
        label: 'Aktueller Standort',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      elements.citySelect.value = 'custom';
      ui.updateSettingsSummary();
      ui.setStatus('Standort übernommen. Die Koordinaten bleiben nur in dieser Sitzung.');
      return true;
    });
  } catch (error) {
    ui.setStatus('Standort nicht freigegeben. Du kannst stattdessen eine Stadt nutzen.');
  }

  if (didSelectLocation) {
    await generateRecommendations();
  }
}

async function generateRecommendations() {
  const didGenerate = await withBusy('Lade Wetter und berechne Aufgaben...', async () => {
    try {
      state.weather = await fetchWeather(state.location);
      ui.setStatus(`Wetter für ${state.location.label} geladen.`);
    } catch (error) {
      state.weather = fallbackWeather();
      ui.setStatus('Wetterdienst nicht erreichbar. Ich nutze einen saisonalen Fallback.');
    }

    const context = buildContext(state);
    const tasks = selectTasks(context);
    state.hasGenerated = true;
    ui.renderWeather(state.weather);
    ui.renderTasks(tasks, context);
  });

  if (didGenerate) {
    ui.revealResults();
  }
}

async function withBusy(message, action) {
  if (state.busy) return false;

  ui.setBusy(true, message);
  try {
    const result = await action();
    return result ?? true;
  } finally {
    ui.setBusy(false);
  }
}

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

init();
