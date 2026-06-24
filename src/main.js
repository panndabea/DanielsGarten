import { getElements } from './app/dom.js';
import { registerServiceWorker, setupInstallPrompt, setupNetworkStatus } from './app/pwa.js';
import { buildContext, selectTasks } from './domain/task-engine.js';
import { createUi } from './app/ui.js';
import {
  CITY_PRESETS,
  CUSTOM_MINUTES_DEBOUNCE_MS,
  DEFAULT_CITY,
  DEFAULT_GARDEN_TYPE,
  GARDEN_LABELS,
  MAX_MINUTES,
  MIN_MINUTES
} from './data/app-config.js';
import { fallbackWeather, fetchWeather, findCity } from './services/weather.js';

const state = {
  minutes: null,
  selectedTypes: new Set([DEFAULT_GARDEN_TYPE]),
  location: DEFAULT_CITY,
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

  if (!Number.isFinite(minutes) || minutes < MIN_MINUTES) {
    state.minutes = null;
    clearRecommendationTimer();
    resetRecommendations();
    elements.minutesFeedback.textContent = `Mindestens ${MIN_MINUTES} Minuten.`;
    ui.updateTimeButtons();
    return;
  }

  state.minutes = Math.min(minutes, MAX_MINUTES);
  elements.minutesFeedback.textContent = minutes > MAX_MINUTES
    ? `Maximal ${MAX_MINUTES} Minuten. Ich rechne mit ${MAX_MINUTES}.`
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

  if (minutes < MIN_MINUTES) {
    elements.customMinutes.value = String(MIN_MINUTES);
    state.minutes = MIN_MINUTES;
    elements.minutesFeedback.textContent = `Ich rechne mit ${MIN_MINUTES} Minuten.`;
    ui.updateTimeButtons();
    ui.updateFlowSignal();
    markMinutesSelected(state.minutes);
    queueRecommendations();
  } else if (minutes > MAX_MINUTES) {
    elements.customMinutes.value = String(MAX_MINUTES);
    state.minutes = MAX_MINUTES;
    elements.minutesFeedback.textContent = `Ich rechne mit maximal ${MAX_MINUTES} Minuten.`;
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
    ui.setAgentStatus({
      step: 'Garten prüfen',
      last: 'Kein Gartentyp gewählt',
      next: 'Mindestens einen Typ aktiv lassen'
    });
    return;
  }

  state.selectedTypes = new Set(checked.map(input => input.value));
  ui.updateSettingsSummary();
  markContextUpdated('Gartentyp aktualisiert', 'Gartentyp aktualisiert.');
}

function handlePresetCity() {
  const value = elements.citySelect.value;
  if (value === 'custom') {
    elements.cityInput.focus();
    return;
  }

  selectLocation(CITY_PRESETS[value]);
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

      selectLocation(location, { selectValue: 'custom' });
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

      selectLocation({
        label: 'Aktueller Standort',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }, {
        selectValue: 'custom',
        last: 'Standort übernommen',
        status: 'Standort übernommen. Die Koordinaten bleiben nur in dieser Sitzung.'
      });
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
    ui.setAgentStatus({
      step: 'Zeit wählen',
      last: 'Kein Zeitfenster gewählt',
      next: 'Zeitfenster antippen',
      status: 'Wähle zuerst ein Zeitfenster.'
    });
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
  return Number.isFinite(state.minutes) && state.minutes >= MIN_MINUTES;
}

function selectLocation(location, { selectValue, last, status } = {}) {
  state.location = location;
  if (selectValue) {
    elements.citySelect.value = selectValue;
  }

  ui.updateSettingsSummary();
  markContextUpdated(
    last || `${location.label} ausgewählt`,
    status || `${location.label} ist ausgewählt.`
  );
}

function markContextUpdated(last, status) {
  const hasMinutes = hasValidMinutes();
  ui.setAgentStatus({
    step: hasMinutes ? 'Kontext aktualisiert' : 'Zeit wählen',
    last,
    next: hasMinutes ? 'Vorschlag aktualisieren' : 'Zeitfenster antippen',
    status
  });
}

function markMinutesSelected(minutes) {
  ui.setAgentStatus({
    step: 'Berechnung startet',
    last: `${minutes} min gewählt`,
    next: 'Vorschläge erscheinen gleich',
    status: 'Zeitfenster gewählt. Ich rechne automatisch.'
  });
}

init();
