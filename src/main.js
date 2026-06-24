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

const CUSTOM_MINUTES_DEBOUNCE_MS = 350;

const state = {
  minutes: null,
  selectedTypes: new Set(['garden']),
  location: CITY_PRESETS.berlin,
  weather: null,
  busy: false,
  hasGenerated: false
};

const elements = getElements();
const ui = createUi(elements, state, GARDEN_LABELS);
let recommendationTimer = null;
let pendingRecommendation = false;

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
    void generateRecommendations();
  });
  elements.regenerateButton.addEventListener('click', () => {
    void generateRecommendations();
  });

  setupNetworkStatus({ setStatus: ui.setStatus });
  setupInstallPrompt({ elements, setStatus: ui.setStatus });
  registerServiceWorker();
  ui.updateTimeButtons();
  ui.updateSettingsSummary();
  ui.renderWeather(null);
  ui.renderIntroState();
}

function selectMinutes(minutes) {
  if (!Number.isFinite(minutes)) return;

  state.minutes = minutes;
  elements.customMinutes.value = '';
  elements.minutesFeedback.textContent = '';
  ui.updateTimeButtons();
  ui.updateFlowSignal();
  markMinutesSelected(minutes);
  queueRecommendations();
}

function handleCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  const minutes = Number(rawValue);

  if (!rawValue) {
    state.minutes = null;
    clearRecommendationTimer();
    resetRecommendations();
    elements.minutesFeedback.textContent = '';
    ui.updateTimeButtons();
    return;
  }

  if (!Number.isFinite(minutes) || minutes < 5) {
    state.minutes = null;
    clearRecommendationTimer();
    resetRecommendations();
    elements.minutesFeedback.textContent = 'Mindestens 5 Minuten.';
    ui.updateTimeButtons();
    return;
  }

  state.minutes = Math.min(minutes, 180);
  elements.minutesFeedback.textContent = minutes > 180
    ? 'Maximal 180 Minuten. Ich rechne mit 180.'
    : '';
  ui.updateTimeButtons();
  ui.updateFlowSignal();
  markMinutesSelected(state.minutes);
  queueRecommendations(CUSTOM_MINUTES_DEBOUNCE_MS);
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
    ui.updateTimeButtons();
    ui.updateFlowSignal();
    markMinutesSelected(state.minutes);
    queueRecommendations();
  } else if (minutes > 180) {
    elements.customMinutes.value = '180';
    state.minutes = 180;
    elements.minutesFeedback.textContent = 'Ich rechne mit maximal 180 Minuten.';
    ui.updateTimeButtons();
    ui.updateFlowSignal();
    markMinutesSelected(state.minutes);
    queueRecommendations();
  }
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
  ui.setStatus('Gartentyp aktualisiert.');
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
        ui.setMascot('idle', 'Diese Stadt finde ich gerade nicht.');
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
    ui.setMascot('idle', 'Kein Problem, eine Stadt aus der Liste reicht.');
  }

  if (didSelectCity && hasValidMinutes()) {
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
    ui.setMascot('idle', 'Kein Problem, eine Stadt reicht.');
  }

  if (didSelectLocation && hasValidMinutes()) {
    await generateRecommendations();
  }
}

async function generateRecommendations() {
  clearRecommendationTimer();

  if (!hasValidMinutes()) {
    pendingRecommendation = false;
    ui.setStatus('Wähle zuerst ein Zeitfenster.');
    ui.setMascot('idle', 'Wie viel Gartenzeit hast du heute?');
    return false;
  }

  if (state.busy) {
    pendingRecommendation = true;
    return false;
  }

  const didGenerate = await withBusy('Lade Wetter und berechne Aufgaben...', async () => {
    try {
      state.weather = await fetchWeather(state.location);
      ui.setStatus(`Wetter für ${state.location.label} geladen.`);
    } catch (error) {
      state.weather = fallbackWeather();
      ui.setStatus('Wetterdienst nicht erreichbar. Ich nutze einen saisonalen Fallback.');
    }

    if (!hasValidMinutes()) {
      resetRecommendations();
      return false;
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

  if (pendingRecommendation) {
    pendingRecommendation = false;
    return generateRecommendations();
  }

  return didGenerate;
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

function queueRecommendations(delay = 0) {
  clearRecommendationTimer();
  if (!hasValidMinutes()) return;

  recommendationTimer = setTimeout(() => {
    recommendationTimer = null;
    void generateRecommendations();
  }, delay);
}

function clearRecommendationTimer() {
  if (recommendationTimer === null) return;

  clearTimeout(recommendationTimer);
  recommendationTimer = null;
}

function resetRecommendations() {
  pendingRecommendation = false;
  state.weather = null;
  state.hasGenerated = false;
  ui.renderWeather(null);
  ui.renderIntroState();
}

function hasValidMinutes() {
  return Number.isFinite(state.minutes) && state.minutes >= 5;
}

function markMinutesSelected(minutes) {
  ui.setStatus('Zeitfenster gewählt. Ich rechne automatisch.');
}

init();
