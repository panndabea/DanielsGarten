export function createUi(elements, state, gardenLabels) {
  const mascotCopy = {
    idle: 'Wie viel Gartenzeit hast du heute?',
    thinking: 'Ich schaue kurz aufs Wetter.',
    happy: 'Das lohnt sich heute wirklich.',
    resting: 'Heute darf dein Garten einfach atmen.',
    done: 'Schön gemacht.',
    weather: 'Ich nutze heute Saisonwissen.',
    fallback: 'Saisonwissen an: ich bleibe aufmerksam.',
    frost: 'Frost im Blick: ich ziehe die Blätter ein.',
    wind: 'Windiger Tag: ich halte mich gut fest.',
    rain: 'Regenmodus: ich trage Tropfen mit Haltung.',
    wet: 'Alles feucht: ich stehe lieber etwas erhöht.',
    rainSoon: 'Vielleicht später Regen: ich halte den Himmel im Blick.',
    hot: 'Hitzetag: ich mache kleinen Schatten.',
    dry: 'Trockenmodus: heute zählt jeder Tropfen.',
    mild: 'Ruhiges Wetter: ich wachse ganz entspannt.'
  };
  let resultMascot = { state: 'idle', message: mascotCopy.idle };

  elements.taskList.addEventListener('taskdone', event => {
    if (event.detail?.isDone) {
      setMascot('done', mascotCopy.done);
      return;
    }

    setMascot(resultMascot.state, resultMascot.message);
  });

  function renderIntroState() {
    resultMascot = { state: 'idle', message: mascotCopy.idle };
    setMascotWeather(null);
    setMascot(resultMascot.state, resultMascot.message);
    updateFlowSignal();
    updateSettingsSummary();
    elements.contextLabel.textContent = contextLabelText(state.location, state.minutes);
    elements.resultsPanel.classList.add('is-intro');
    elements.resultTitle.textContent = 'Nächster Schritt';
    elements.resultSummary.textContent = 'Zeitfenster wählen; die Empfehlung startet automatisch.';
    elements.regenerateButton.hidden = true;
    elements.weatherDetails.hidden = true;
    elements.emptyKicker.textContent = 'Schritt 1';
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
    const sourceText = context.weather.source === 'Open-Meteo' ? 'Wetter' : 'Saison';
    const fallbackText = context.weather.source === 'Open-Meteo' ? '' : ' mit saisonalem Fallback';
    resultMascot = taskMascotState(tasks, context, mascotCopy);
    setMascot(resultMascot.state, resultMascot.message);

    elements.resultsPanel.classList.remove('is-intro');
    elements.contextLabel.textContent = `${contextLabelText(context.location, context.minutes)} · ${sourceText}`;
    elements.resultTitle.textContent = tasks.length
      ? `${minutesLabel(context.minutes)} in ${context.location.label}`
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
      setMascot('thinking', busyMascotMessage(message, mascotCopy));
      setAgentStatus({
        step: busyStep(message),
        last: shortMinutesLabel(state.minutes),
        next: 'Vorschläge berechnen'
      });
    }
    if (message) setStatus(message);
  }

  function setStatus(message) {
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

    elements.mascot.dataset.mascotState = stateName;
    if (message) {
      elements.mascotBubble.textContent = message;
    }
  }

  function setMascotWeather(weather) {
    if (!elements.mascot) return;

    elements.mascot.dataset.weatherMood = mascotWeatherMood(weather);
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
    const hasMinutes = Number.isFinite(state.minutes) && state.minutes >= 5;
    const copy = actionButtonCopy({
      isBusy: state.busy,
      hasMinutes
    });

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

function createTaskCard(item, index = 0) {
  const article = document.createElement('article');
  article.className = `task-card ${item.priority.className}${index === 0 ? ' is-featured' : ''}`;
  article.dataset.taskId = item.task.id;

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
  if (index === 0) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'task-eyebrow';
    eyebrow.textContent = 'Jetzt zuerst';
    content.append(eyebrow);
  }

  content.append(meta, title, reason, more);

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
    article.dispatchEvent(new CustomEvent('taskdone', {
      bubbles: true,
      detail: { isDone, taskId: item.task.id }
    }));
  });

  action.append(doneButton);
  article.append(content, action);
  return article;
}

function taskMascotState(tasks, context, copy) {
  if (!tasks.length) {
    return {
      state: 'resting',
      message: weatherMascotMessage(context.weather, copy)
    };
  }

  if (context.weather.source !== 'Open-Meteo') {
    return { state: 'weather', message: weatherMascotMessage(context.weather, copy) };
  }

  return { state: 'happy', message: weatherMascotMessage(context.weather, copy) };
}

function busyMascotMessage(message, copy) {
  if (message?.includes('Stadt')) return 'Ich suche deine Stadt.';
  if (message?.includes('Standort')) return 'Ich warte kurz auf den Standort.';
  return copy.thinking;
}

function busyStep(message) {
  if (message?.includes('Stadt')) return 'Stadt suchen';
  if (message?.includes('Standort')) return 'Standort prüfen';
  if (message?.includes('Wetter')) return 'Wetter prüfen';
  return 'Berechnen';
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

export function mascotWeatherMood(weather) {
  if (!weather) return 'idle';
  if (weather.frostRisk !== 'niedrig') return 'frost';
  if (weather.isWindy) return 'wind';
  if (weather.isRainingNow) return 'rain';
  if (weather.isWet) return 'wet';
  if (weather.isHot) return 'hot';
  if (weather.isDry) return 'dry';
  if (weather.rainSoon) return 'rainSoon';
  if (weather.source !== 'Open-Meteo') return 'fallback';
  if (weather.isMild) return 'mild';
  return 'mild';
}

export function weatherMascotMessage(weather, copy) {
  const mood = mascotWeatherMood(weather);
  return copy[mood] || copy.happy;
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
