export function createUi(elements, state, gardenLabels) {
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
    const typeText = context.selectedTypes.map(type => gardenLabels[type]).join(', ');
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

  return {
    renderIntroState,
    renderWeather,
    renderTasks,
    setBusy,
    setStatus,
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
