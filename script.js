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

let deferredInstallPrompt = null;

const elements = {
  todayLabel: document.getElementById('todayLabel'),
  flowSignal: document.getElementById('flowSignal'),
  gardenSummary: document.getElementById('gardenSummary'),
  locationSummary: document.getElementById('locationSummary'),
  plannerForm: document.getElementById('plannerForm'),
  timeButtons: [...document.querySelectorAll('.time-option')],
  customMinutes: document.getElementById('customMinutes'),
  minutesFeedback: document.getElementById('minutesFeedback'),
  typeInputs: [...document.querySelectorAll('input[name="gardenType"]')],
  citySelect: document.getElementById('citySelect'),
  cityInput: document.getElementById('cityInput'),
  useGps: document.getElementById('useGps'),
  searchCity: document.getElementById('searchCity'),
  installButton: document.getElementById('installButton'),
  generateButton: document.getElementById('generateButton'),
  generateButtonIcon: document.getElementById('generateButtonIcon'),
  generateButtonLabel: document.getElementById('generateButtonLabel'),
  regenerateButton: document.getElementById('regenerateButton'),
  statusLine: document.getElementById('statusLine'),
  resultsPanel: document.getElementById('resultsPanel'),
  contextLabel: document.getElementById('contextLabel'),
  resultTitle: document.getElementById('resultTitle'),
  resultSummary: document.getElementById('resultSummary'),
  taskList: document.getElementById('taskList'),
  emptyState: document.getElementById('emptyState'),
  weatherDetails: document.getElementById('weatherDetails'),
  weatherSummary: document.getElementById('weatherSummary'),
  tempValue: document.getElementById('tempValue'),
  rainPastValue: document.getElementById('rainPastValue'),
  rainFutureValue: document.getElementById('rainFutureValue'),
  windValue: document.getElementById('windValue'),
  frostValue: document.getElementById('frostValue'),
  emptyKicker: document.getElementById('emptyKicker'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptyText: document.getElementById('emptyText')
};

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

  setupNetworkStatus();
  setupInstallPrompt();
  registerServiceWorker();
  updateTimeButtons();
  updateSettingsSummary();
  renderWeather(null);
  renderIntroState();
}

function setupNetworkStatus() {
  let wasOffline = !navigator.onLine;

  if (!navigator.onLine) {
    setStatus('Du bist offline. Gartenzeit nutzt den saisonalen Fallback, wenn Wetterdaten nicht erreichbar sind.');
  }

  window.addEventListener('offline', () => {
    wasOffline = true;
    setStatus('Du bist offline. Gartenzeit nutzt den saisonalen Fallback, wenn Wetterdaten nicht erreichbar sind.');
  });

  window.addEventListener('online', () => {
    if (wasOffline) {
      setStatus('Du bist wieder online. Wetterdaten werden bei der nächsten Berechnung frisch geladen.');
    }
    wasOffline = false;
  });
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIosLikeBrowser() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isTouchMac = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(userAgent) || isTouchMac;
}

function setupInstallPrompt() {
  if (!elements.installButton || isStandaloneDisplay()) return;

  if (isIosLikeBrowser()) {
    elements.installButton.dataset.installMode = 'ios-help';
    elements.installButton.hidden = false;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.dataset.installMode = 'prompt';
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      if (elements.installButton.dataset.installMode === 'ios-help') {
        setStatus('Auf iPhone oder iPad: Teilen öffnen und "Zum Home-Bildschirm" wählen.');
      }
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);

    if (choice?.outcome === 'accepted') {
      setStatus('Installation gestartet. Gartenzeit ist gleich als PWA verfügbar.');
    } else {
      setStatus('Installation abgebrochen. Der Browser bietet den Button später erneut an.');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
    setStatus('Gartenzeit ist installiert und kann vom Startbildschirm geöffnet werden.');
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Service Worker is an enhancement; the app still works without it.
    });
  });
}

function selectMinutes(minutes) {
  state.minutes = minutes;
  elements.customMinutes.value = '';
  elements.minutesFeedback.textContent = '';
  updateTimeButtons();
  updateFlowSignal();
}

function handleCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  const minutes = Number(rawValue);

  if (!rawValue) {
    elements.minutesFeedback.textContent = '';
    updateTimeButtons();
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
  updateTimeButtons();
  updateFlowSignal();
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

  updateTimeButtons();
  updateFlowSignal();
}

function handleGardenTypes(event) {
  const checked = elements.typeInputs.filter(input => input.checked);
  if (!checked.length) {
    event.target.checked = true;
    setStatus('Wähle mindestens einen Gartentyp.');
    return;
  }

  state.selectedTypes = new Set(checked.map(input => input.value));
  updateSettingsSummary();
}

function handlePresetCity() {
  const value = elements.citySelect.value;
  if (value === 'custom') {
    elements.cityInput.focus();
    return;
  }

  state.location = CITY_PRESETS[value];
  updateSettingsSummary();
  setStatus(`${state.location.label} ist ausgewählt.`);
}

async function searchCity() {
  const query = elements.cityInput.value.trim();
  if (query.length < 2) {
    setStatus('Bitte gib mindestens zwei Zeichen ein.');
    return;
  }

  setBusy(true, 'Suche Stadt...');
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({
      name: query,
      count: '1',
      language: 'de',
      format: 'json'
    }).toString();

    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding nicht erreichbar');

    const data = await response.json();
    const match = data.results?.[0];
    if (!match) {
      setStatus('Diese Stadt habe ich nicht gefunden.');
      return;
    }

    state.location = {
      label: [match.name, match.admin1, match.country_code].filter(Boolean).join(', '),
      latitude: match.latitude,
      longitude: match.longitude
    };
    elements.citySelect.value = 'custom';
    updateSettingsSummary();
    setStatus(`${state.location.label} ist ausgewählt.`);
    setBusy(false);
    await generateRecommendations();
  } catch (error) {
    setStatus('Die Stadtsuche ist gerade nicht erreichbar.');
  } finally {
    setBusy(false);
  }
}

function useGeolocation() {
  if (!navigator.geolocation) {
    setStatus('GPS ist in diesem Browser nicht verfügbar.');
    return;
  }

  setBusy(true, 'Warte auf Standortfreigabe...');
  navigator.geolocation.getCurrentPosition(
    async position => {
      state.location = {
        label: 'Aktueller Standort',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      elements.citySelect.value = 'custom';
      updateSettingsSummary();
      setStatus('Standort übernommen. Die Koordinaten bleiben nur in dieser Sitzung.');
      setBusy(false);
      await generateRecommendations();
    },
    () => {
      setStatus('Standort nicht freigegeben. Du kannst stattdessen eine Stadt nutzen.');
      setBusy(false);
    },
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 0 }
  );
}

async function generateRecommendations() {
  if (state.busy) return;

  setBusy(true, 'Lade Wetter und berechne Aufgaben...');
  try {
    state.weather = await fetchWeather(state.location);
    setStatus(`Wetter für ${state.location.label} geladen.`);
  } catch (error) {
    state.weather = fallbackWeather();
    setStatus('Wetterdienst nicht erreichbar. Ich nutze einen saisonalen Fallback.');
  }

  const context = buildContext();
  const tasks = selectTasks(context);
  state.hasGenerated = true;
  renderWeather(state.weather);
  renderTasks(tasks, context);
  setBusy(false);
  revealResults();
}

async function fetchWeather(location) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,precipitation,wind_speed_10m',
    daily: 'precipitation_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max,wind_speed_10m_max',
    past_days: '7',
    forecast_days: '7',
    timezone: 'auto'
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error('Wetter nicht erreichbar');

  return normalizeWeather(await response.json());
}

function normalizeWeather(data) {
  const today = data.current?.time?.slice(0, 10) || new Date().toISOString().slice(0, 10);
  const daily = data.daily || {};
  const days = daily.time || [];
  const precipitation = daily.precipitation_sum || [];
  const probabilities = daily.precipitation_probability_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const maxTemps = daily.temperature_2m_max || [];
  const maxWinds = daily.wind_speed_10m_max || [];

  const pastIndexes = days.map((day, index) => ({ day, index })).filter(item => item.day < today).slice(-7).map(item => item.index);
  const futureIndexes = days.map((day, index) => ({ day, index })).filter(item => item.day >= today).slice(0, 3).map(item => item.index);
  const forecastIndexes = days.map((day, index) => ({ day, index })).filter(item => item.day >= today).slice(0, 7).map(item => item.index);

  const pastRain = sumIndexes(precipitation, pastIndexes);
  const forecastRain = sumIndexes(precipitation, forecastIndexes);
  const soonRain = sumIndexes(precipitation, futureIndexes);
  const rainProbability = maxIndexes(probabilities, futureIndexes);
  const minForecastTemp = Math.min(...futureIndexes.map(index => safeNumber(minTemps[index], 99)));
  const maxForecastTemp = Math.max(...futureIndexes.map(index => safeNumber(maxTemps[index], -99)));
  const maxWind = Math.max(safeNumber(data.current?.wind_speed_10m, 0), maxIndexes(maxWinds, futureIndexes));
  const temperature = safeNumber(data.current?.temperature_2m, average(maxForecastTemp, minForecastTemp));
  const currentRain = safeNumber(data.current?.precipitation, 0);

  const frostRisk = minForecastTemp <= 0 ? 'hoch' : minForecastTemp <= 3 ? 'mittel' : 'niedrig';

  return {
    source: 'Open-Meteo',
    temperature,
    pastRain,
    forecastRain,
    soonRain,
    rainProbability,
    wind: safeNumber(data.current?.wind_speed_10m, maxWind),
    maxWind,
    minForecastTemp,
    maxForecastTemp,
    currentRain,
    frostRisk,
    isDry: pastRain < 5 && soonRain < 4,
    isWet: pastRain > 18 || currentRain > 0.4,
    isRainingNow: currentRain > 0.2,
    rainSoon: rainProbability >= 60 || soonRain >= 6,
    isWindy: maxWind >= 35,
    isHot: temperature >= 28 || maxForecastTemp >= 30,
    isMild: temperature >= 8 && temperature <= 26 && maxWind < 30 && currentRain <= 0.2
  };
}

function fallbackWeather() {
  const month = new Date().getMonth() + 1;
  const summer = [6, 7, 8].includes(month);
  const winter = [12, 1, 2].includes(month);
  const springAutumn = [3, 4, 5, 9, 10, 11].includes(month);
  const temperature = summer ? 22 : winter ? 5 : 14;
  const pastRain = summer ? 8 : springAutumn ? 14 : 18;
  const forecastRain = springAutumn ? 9 : 4;
  const frostRisk = winter ? 'mittel' : 'niedrig';

  return {
    source: 'Fallback',
    temperature,
    pastRain,
    forecastRain,
    soonRain: Math.min(forecastRain, 5),
    rainProbability: springAutumn ? 45 : 25,
    wind: 14,
    maxWind: 20,
    minForecastTemp: winter ? 2 : 9,
    maxForecastTemp: summer ? 25 : 16,
    currentRain: 0,
    frostRisk,
    isDry: summer && pastRain < 10,
    isWet: pastRain > 18,
    isRainingNow: false,
    rainSoon: forecastRain >= 8,
    isWindy: false,
    isHot: false,
    isMild: !winter
  };
}

function buildContext() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    minutes: state.minutes,
    selectedTypes: [...state.selectedTypes],
    location: state.location,
    weather: state.weather
  };
}

function selectTasks(context) {
  const scored = TASKS
    .map(task => scoreTask(task, context))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.task.duration - b.task.duration);

  if (!scored.length) return [];

  const calm = isCalmDay(context);
  if (calm && scored[0].score < 62) return [];

  const selected = [];
  context.selectedTypes.forEach(type => {
    const match = scored.find(item => !selected.some(selectedItem => selectedItem.task.id === item.task.id) && item.task.gardenTypes.includes(type));
    if (match && match.score >= 52) selected.push(match);
  });

  scored.forEach(item => {
    if (selected.length >= 5) return;
    if (selected.some(selectedItem => selectedItem.task.id === item.task.id)) return;
    if (item.score >= 52 || (!calm && selected.length < 3)) selected.push(item);
  });

  return selected.slice(0, 5).sort((a, b) => b.score - a.score || a.task.duration - b.task.duration);
}

function scoreTask(task, context) {
  if (task.duration > context.minutes) return null;
  if (!task.gardenTypes.includes('all') && !task.gardenTypes.some(type => context.selectedTypes.includes(type))) return null;
  if (!task.months.includes(context.month)) return null;
  if (task.excludes?.some(exclude => exclude(context))) return null;

  const matchingBoosts = task.boosts?.filter(boost => boost.when(context)) || [];
  const typeMatchCount = task.gardenTypes.filter(type => context.selectedTypes.includes(type)).length;
  const quickFit = task.duration <= Math.max(10, context.minutes * .45) ? 4 : 0;
  const score = task.base + matchingBoosts.reduce((total, boost) => total + boost.points, 0) + typeMatchCount * 8 + quickFit;

  return {
    task,
    score,
    reason: matchingBoosts[0]?.why || task.why,
    priority: priorityForScore(score)
  };
}

function priorityForScore(score) {
  if (score >= 82) {
    return {
      label: 'Hoch',
      className: 'priority-high',
      meaning: 'Heute zuerst erledigen: Wetter oder Saison machen diese Aufgabe gerade besonders wirksam.'
    };
  }

  if (score >= 64) {
    return {
      label: 'Mittel',
      className: 'priority-medium',
      meaning: 'Sinnvoll, wenn nach den wichtigsten Aufgaben noch Zeit bleibt.'
    };
  }

  return {
    label: 'Niedrig',
    className: 'priority-low',
    meaning: 'Optional: gut machbar, aber heute nicht dringend.'
  };
}

function isCalmDay(context) {
  const weather = context.weather;
  return weather.isMild &&
    !weather.isDry &&
    !weather.isWet &&
    !weather.isWindy &&
    !weather.rainSoon &&
    weather.frostRisk === 'niedrig';
}

function renderIntroState() {
  updateFlowSignal();
  updateSettingsSummary();
  elements.contextLabel.textContent = `${state.location.label} · ${state.minutes} Minuten`;
  elements.resultTitle.textContent = 'Bereit für deine Aufgabe';
  elements.resultSummary.textContent = 'Wähle dein Zeitfenster und starte mit einem Klick.';
  elements.regenerateButton.hidden = true;
  elements.weatherDetails.hidden = true;
  elements.emptyKicker.textContent = 'Startbereit';
  elements.emptyTitle.textContent = 'Wähle dein Zeitfenster und starte.';
  elements.emptyText.textContent = `${state.location.label} ist vorausgewählt; Standortfreigabe ist optional.`;
  elements.taskList.replaceChildren();
  elements.emptyState.classList.add('is-visible');
}

function renderWeather(weather) {
  if (!weather) {
    elements.tempValue.textContent = '--';
    elements.rainPastValue.textContent = '--';
    elements.rainFutureValue.textContent = '--';
    elements.windValue.textContent = '--';
    elements.frostValue.textContent = '--';
    elements.weatherSummary.textContent = 'Wetterdetails anzeigen';
    return;
  }

  elements.tempValue.textContent = `${Math.round(weather.temperature)} °C`;
  elements.rainPastValue.textContent = `${Math.round(weather.pastRain)} mm`;
  elements.rainFutureValue.textContent = `${Math.round(weather.forecastRain)} mm`;
  elements.windValue.textContent = `${Math.round(weather.wind)} km/h`;
  elements.frostValue.textContent = weather.frostRisk;
  elements.weatherSummary.textContent = weatherSummaryText(weather);
}

function renderTasks(tasks, context) {
  const typeText = context.selectedTypes.map(type => GARDEN_LABELS[type]).join(', ');
  const sourceText = context.weather.source === 'Open-Meteo' ? 'Wetter' : 'Saison';
  const fallbackText = context.weather.source === 'Open-Meteo' ? '' : ' mit saisonalem Fallback';
  elements.contextLabel.textContent = `${context.location.label} · ${context.minutes} Minuten · ${sourceText}`;
  elements.resultTitle.textContent = tasks.length
    ? `${context.minutes} Minuten in ${context.location.label}`
    : 'Heute nichts Dringendes';
  elements.resultSummary.textContent = tasks.length
    ? `Zuerst: ${tasks[0].task.title}. ${tasks[0].reason}`
    : 'Heute darf der Garten einfach Garten sein. Wenn sich Wetter oder Zeitfenster ändern, rechnen wir neu.';
  elements.regenerateButton.hidden = false;
  elements.weatherDetails.hidden = false;
  elements.emptyKicker.textContent = 'Nichts-Tun-Modus';
  elements.emptyTitle.textContent = 'Heute gibt es nichts Dringendes. Genieße deinen Garten.';
  elements.emptyText.textContent = 'Wenn sich Wetter oder Zeitfenster ändern, berechnen wir die Vorschläge neu.';
  elements.taskList.replaceChildren(...tasks.map((item, index) => createTaskCard(item, index)));
  elements.emptyState.classList.toggle('is-visible', !tasks.length);

  if (tasks.length) {
    setStatus(`${tasks.length} Vorschläge für ${typeText}${fallbackText}.`);
  } else {
    setStatus(`Keine dringenden Aufgaben für ${typeText}${fallbackText}.`);
  }
}

function createTaskCard(item, index = 0) {
  const article = document.createElement('article');
  article.className = `task-card ${item.priority.className}${index === 0 ? ' is-featured' : ''}`;
  article.dataset.taskId = item.task.id;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'task-eyebrow';
  eyebrow.textContent = index === 0 ? 'Jetzt zuerst' : 'Weitere Aufgabe';

  const meta = document.createElement('div');
  meta.className = 'task-top';
  meta.append(
    pill(item.priority.label, 'priority-pill'),
    pill(`${item.task.duration} min`, 'task-pill'),
    pill(item.task.difficulty, 'task-pill')
  );

  const title = document.createElement('h3');
  title.textContent = item.task.title;

  const reason = document.createElement('p');
  reason.className = 'task-reason';
  reason.textContent = item.reason;

  const more = document.createElement('details');
  more.className = 'task-more';

  const moreSummary = document.createElement('summary');
  moreSummary.textContent = 'Details';

  const details = document.createElement('dl');
  details.className = 'task-details';
  details.append(
    detailBlock('Aufgabe', item.task.description),
    detailBlock('Priorität', item.priority.meaning),
    detailBlock('Werkzeug', item.task.tools.join(', '))
  );
  more.append(moreSummary, details);

  const content = document.createElement('div');
  content.className = 'task-content';
  content.append(eyebrow, meta, title, reason, more);

  const action = document.createElement('div');
  action.className = 'task-action';

  const doneButton = document.createElement('button');
  doneButton.className = 'task-done';
  doneButton.type = 'button';
  doneButton.setAttribute('aria-pressed', 'false');

  const doneIcon = document.createElement('span');
  doneIcon.setAttribute('aria-hidden', 'true');
  doneIcon.textContent = '✓';

  const doneLabel = document.createElement('span');
  doneLabel.textContent = 'Erledigt markieren';

  doneButton.append(doneIcon, doneLabel);
  doneButton.addEventListener('click', () => {
    const isDone = article.classList.toggle('is-done');
    doneButton.setAttribute('aria-pressed', String(isDone));
    doneLabel.textContent = isDone ? 'Erledigt' : 'Erledigt markieren';
    more.open = !isDone && more.open;
  });

  action.append(doneButton);
  article.append(content, action);
  return article;
}

function pill(text, className) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function detailBlock(term, description) {
  const wrapper = document.createElement('div');
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = term;
  dd.textContent = description;
  wrapper.append(dt, dd);
  return wrapper;
}

function setBusy(isBusy, message) {
  state.busy = isBusy;
  elements.generateButton.disabled = isBusy;
  elements.generateButton.classList.toggle('is-loading', isBusy);
  elements.generateButtonIcon.textContent = isBusy ? '↻' : '→';
  elements.generateButtonLabel.textContent = isBusy ? 'Berechne...' : 'Aufgabe finden';
  elements.regenerateButton.disabled = isBusy;
  elements.useGps.disabled = isBusy;
  elements.searchCity.disabled = isBusy;
  if (message) setStatus(message);
}

function setStatus(message) {
  elements.statusLine.textContent = message;
}

function updateFlowSignal() {
  elements.flowSignal.textContent = `${state.minutes} min`;
  if (!state.hasGenerated) {
    elements.contextLabel.textContent = `${state.location.label} · ${state.minutes} Minuten`;
  }
}

function updateTimeButtons() {
  elements.timeButtons.forEach(button => {
    const isActive = Number(button.dataset.minutes) === state.minutes && !elements.customMinutes.value.trim();
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateSettingsSummary() {
  const selectedLabels = [...state.selectedTypes].map(type => GARDEN_LABELS[type]);
  const firstType = selectedLabels[0] || 'Garten';
  const typeText = selectedLabels.length > 1
    ? `${firstType} +${selectedLabels.length - 1}`
    : firstType;

  elements.gardenSummary.textContent = typeText;
  elements.locationSummary.textContent = state.location.label;
}

function weatherSummaryText(weather) {
  const rainText = weather.isDry
    ? 'trocken'
    : weather.isWet
      ? 'feucht'
      : `${Math.round(weather.forecastRain)} mm Regenprognose`;
  const windText = weather.isWindy ? ', windig' : '';
  const sourceText = weather.source === 'Open-Meteo' ? 'Wetter' : 'Saison-Fallback';

  return `${sourceText}: ${Math.round(weather.temperature)} °C, ${rainText}${windText}. Details anzeigen`;
}

function revealResults() {
  requestAnimationFrame(() => {
    elements.resultTitle.focus({ preventScroll: true });
    elements.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function sumIndexes(values, indexes) {
  return indexes.reduce((total, index) => total + safeNumber(values[index], 0), 0);
}

function maxIndexes(values, indexes) {
  return indexes.reduce((max, index) => Math.max(max, safeNumber(values[index], 0)), 0);
}

function safeNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function average(a, b) {
  return (safeNumber(a, 0) + safeNumber(b, 0)) / 2;
}

init();
