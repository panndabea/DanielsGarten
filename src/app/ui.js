import { MIN_MINUTES } from '../data/app-config.js';
import { busyMascotMessage, busyStep, MASCOT_COPY, mascotVisualFor, mascotVisualNameFor, mascotWeatherMood, taskMascotState } from './mascot.js';
import { createTaskCard } from './task-card.js';

export { mascotVisualFor, mascotVisualNameFor, mascotWeatherMood, weatherMascotMessage } from './mascot.js';

export function createUi(elements, state, gardenLabels) {
  let resultMascot = { state: 'idle', message: MASCOT_COPY.idle };
  let currentMascotState = 'idle';
  let currentWeatherMood = 'idle';
  const reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  if (reducedMotionQuery?.addEventListener) {
    reducedMotionQuery.addEventListener('change', updateMascotVisual);
  } else if (reducedMotionQuery?.addListener) {
    reducedMotionQuery.addListener(updateMascotVisual);
  }

  elements.taskList.addEventListener('taskdone', event => {
    if (event.detail?.isDone) {
      setMascot('done', MASCOT_COPY.done);
      return;
    }

    setMascot(resultMascot.state, resultMascot.message);
  });

  function renderIntroState() {
    resultMascot = { state: 'idle', message: MASCOT_COPY.idle };
    setMascotWeather(null);
    setMascot(resultMascot.state, resultMascot.message);
    updateFlowSignal();
    updateSettingsSummary();
    elements.resultsPanel.hidden = true;
    elements.contextLabel.textContent = contextLabelText(state.location, state.minutes);
    elements.resultsPanel.classList.add('is-intro');
    elements.resultTitle.textContent = 'Nächster Schritt';
    elements.resultSummary.textContent = 'Zeitfenster wählen; die Empfehlung startet automatisch.';
    elements.regenerateButton.hidden = true;
    elements.weatherDetails.hidden = true;
    elements.emptyKicker.textContent = 'Bereit';
    elements.emptyTitle.textContent = 'Zeit wählen';
    elements.emptyText.textContent = `${state.location.label} ist vorausgewählt; Standortfreigabe ist optional.`;
    elements.taskList.replaceChildren();
    elements.emptyState.classList.add('is-visible');
    setAgentStatus({
      step: 'Zeit wählen',
      last: `${state.location.label} vorausgewählt`,
      next: 'Zeitfenster antippen',
      status: 'Bereit.'
    });
    updateActionState();
  }

  function renderWeather(weather) {
    if (!weather) {
      setMascotWeather(null);
      elements.tempValue.textContent = '--';
      elements.rainPastValue.textContent = '--';
      elements.rainFutureValue.textContent = '--';
      elements.windValue.textContent = '--';
      elements.frostValue.textContent = '--';
      elements.weatherSummary.textContent = 'Wetterdetails anzeigen';
      return;
    }

    setMascotWeather(weather);
    elements.tempValue.textContent = `${Math.round(weather.temperature)} °C`;
    elements.rainPastValue.textContent = `${Math.round(weather.pastRain)} mm`;
    elements.rainFutureValue.textContent = `${Math.round(weather.forecastRain)} mm`;
    elements.windValue.textContent = `${Math.round(weather.wind)} km/h`;
    elements.frostValue.textContent = weather.frostRisk;
    elements.weatherSummary.textContent = weatherSummaryText(weather);
  }

  function renderTasks(tasks, context) {
    const typeText = context.selectedTypes.map(type => gardenLabels[type]).join(', ');
    const fallbackText = context.weather.source === 'Open-Meteo' ? '' : ' mit saisonalem Fallback';
    resultMascot = taskMascotState(tasks, context, MASCOT_COPY);
    setMascot(resultMascot.state, resultMascot.message);

    elements.resultsPanel.hidden = false;
    elements.resultsPanel.classList.remove('is-intro');
    elements.contextLabel.textContent = '';
    elements.resultTitle.textContent = tasks.length
      ? 'Das könntest Du heute im Garten machen'
      : 'Heute nichts Dringendes';
    elements.resultSummary.textContent = tasks.length
      ? ''
      : 'Heute darf der Garten einfach Garten sein. Wenn sich Wetter oder Zeitfenster ändern, rechnen wir neu.';
    elements.regenerateButton.hidden = false;
    elements.weatherDetails.hidden = false;
    elements.emptyKicker.textContent = 'Nichts-Tun-Modus';
    elements.emptyTitle.textContent = 'Heute gibt es nichts Dringendes. Genieße deinen Garten.';
    elements.emptyText.textContent = 'Wenn sich Wetter oder Zeitfenster ändern, berechnen wir die Vorschläge neu.';
    elements.taskList.replaceChildren(...tasks.map((item, index) => createTaskCard(item, index)));
    elements.emptyState.classList.toggle('is-visible', !tasks.length);
    setAgentStatus({
      step: tasks.length ? 'Vorschlag bereit' : 'Ruhemodus',
      last: tasks.length ? `${tasks.length} Vorschläge berechnet` : 'Keine dringende Aufgabe gefunden',
      next: tasks.length ? 'Aufgabe markieren oder aktualisieren' : 'Zeit oder Garten ändern'
    });

    if (tasks.length) {
      setStatus(`${tasks.length} Vorschläge für ${typeText}${fallbackText}.`);
    } else {
      setStatus(`Keine dringenden Aufgaben für ${typeText}${fallbackText}.`);
    }
  }

  function setBusy(isBusy, message) {
    state.busy = isBusy;
    updateActionState();
    elements.regenerateButton.disabled = isBusy;
    elements.useGps.disabled = isBusy;
    elements.searchCity.disabled = isBusy;
    if (isBusy) {
      setMascot('thinking', busyMascotMessage(message, MASCOT_COPY));
      setAgentStatus({
        step: busyStep(message),
        last: shortMinutesLabel(state.minutes),
        next: 'Vorschläge berechnen'
      });
    }
    if (message) setStatus(message);
  }

  function setStatus(message) {
    if (!elements.statusLine) return;

    elements.statusLine.textContent = message;
  }

  function setAgentStatus({ step, last, next, status } = {}) {
    if (step && elements.agentStep) {
      elements.agentStep.textContent = step;
    }

    if (last && elements.agentLast) {
      elements.agentLast.textContent = last;
    }

    if (next && elements.agentNext) {
      elements.agentNext.textContent = next;
    }

    if (status) {
      setStatus(status);
    }
  }

  function setMascot(stateName, message) {
    if (!elements.mascot || !elements.mascotBubble) return;

    currentMascotState = stateName;
    elements.mascot.dataset.mascotState = stateName;
    updateMascotVisual();
    if (message) {
      elements.mascotBubble.textContent = message;
    }
  }

  function setMascotWeather(weather) {
    if (!elements.mascot) return;

    currentWeatherMood = mascotWeatherMood(weather);
    elements.mascot.dataset.weatherMood = currentWeatherMood;
    updateMascotVisual();
  }

  function updateMascotVisual() {
    if (!elements.mascot || !elements.mascotImage) return;

    const visualName = mascotVisualNameFor(currentMascotState, currentWeatherMood);
    const source = mascotVisualFor(currentMascotState, currentWeatherMood, reducedMotionQuery?.matches);
    elements.mascot.dataset.mascotVisual = visualName;
    if (elements.mascotImage.getAttribute('src') !== source) {
      elements.mascotImage.setAttribute('src', source);
    }
  }

  function updateFlowSignal() {
    elements.flowSignal.textContent = shortMinutesLabel(state.minutes);
    if (!state.hasGenerated) {
      elements.contextLabel.textContent = contextLabelText(state.location, state.minutes);
    }
    updateActionState();
  }

  function updateTimeButtons() {
    elements.timeButtons.forEach(button => {
      const isActive = Number(button.dataset.minutes) === state.minutes && !elements.customMinutes.value.trim();
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateSettingsSummary() {
    const selectedLabels = [...state.selectedTypes].map(type => gardenLabels[type]);
    const firstType = selectedLabels[0] || 'Garten';
    const typeText = selectedLabels.length > 1
      ? `${firstType} +${selectedLabels.length - 1}`
      : firstType;

    elements.gardenSummary.textContent = typeText;
    elements.locationSummary.textContent = state.location.label;
  }

  function revealResults() {
    requestAnimationFrame(() => {
      elements.resultTitle.focus({ preventScroll: true });
      elements.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function updateActionState() {
    const hasMinutes = Number.isFinite(state.minutes) && state.minutes >= MIN_MINUTES;
    const copy = actionButtonCopy({
      isBusy: state.busy,
      hasMinutes
    });

    if (!elements.generateButton) return;

    elements.generateButton.disabled = copy.disabled;
    elements.generateButton.classList.toggle('is-loading', state.busy);
    elements.generateButtonIcon.textContent = copy.icon;
    elements.generateButtonLabel.textContent = copy.label;
  }

  return {
    renderIntroState,
    renderWeather,
    renderTasks,
    setBusy,
    setStatus,
    setAgentStatus,
    setMascot,
    updateFlowSignal,
    updateTimeButtons,
    updateSettingsSummary,
    revealResults
  };
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

function contextLabelText(location, minutes) {
  return `${location.label} · ${minutesLabel(minutes)}`;
}

function minutesLabel(minutes) {
  return Number.isFinite(minutes) ? `${minutes} Minuten` : 'Zeit wählen';
}

function shortMinutesLabel(minutes) {
  return Number.isFinite(minutes) ? `${minutes} min` : 'Zeit wählen';
}

export function actionButtonCopy({ isBusy, hasMinutes }) {
  if (isBusy) {
    return { icon: '↻', label: 'Berechne...', disabled: true };
  }

  if (!hasMinutes) {
    return { icon: '→', label: 'Zeitfenster wählen', disabled: true };
  }

  return {
    icon: '↻',
    label: 'Vorschlag aktualisieren',
    disabled: false
  };
}
