export function getElements() {
  return {
    todayLabel: byId('todayLabel'),
    mascot: byId('mascot'),
    mascotImage: byId('mascotImage'),
    mascotBubble: byId('mascotBubble'),
    flowSignal: byId('flowSignal'),
    gardenSummary: byId('gardenSummary'),
    locationSummary: byId('locationSummary'),
    plannerForm: byId('plannerForm'),
    timeButtons: all('.time-option'),
    customMinutes: byId('customMinutes'),
    minutesFeedback: byId('minutesFeedback'),
    typeInputs: all('input[name="gardenType"]'),
    citySelect: byId('citySelect'),
    cityInput: byId('cityInput'),
    useGps: byId('useGps'),
    searchCity: byId('searchCity'),
    installButton: byId('installButton'),
    installHelp: byId('installHelp'),
    generateButton: byId('generateButton'),
    generateButtonIcon: byId('generateButtonIcon'),
    generateButtonLabel: byId('generateButtonLabel'),
    regenerateButton: byId('regenerateButton'),
    agentStep: byId('agentStep'),
    agentLast: byId('agentLast'),
    agentNext: byId('agentNext'),
    statusLine: byId('statusLine'),
    resultsPanel: byId('resultsPanel'),
    contextLabel: byId('contextLabel'),
    resultTitle: byId('resultTitle'),
    resultSummary: byId('resultSummary'),
    taskList: byId('taskList'),
    emptyState: byId('emptyState'),
    weatherDetails: byId('weatherDetails'),
    weatherSummary: byId('weatherSummary'),
    tempValue: byId('tempValue'),
    rainPastValue: byId('rainPastValue'),
    rainFutureValue: byId('rainFutureValue'),
    windValue: byId('windValue'),
    frostValue: byId('frostValue'),
    emptyKicker: byId('emptyKicker'),
    emptyTitle: byId('emptyTitle'),
    emptyText: byId('emptyText')
  };
}

function byId(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing DOM element: #${id}`);
  }

  return element;
}

function all(selector) {
  const elements = [...document.querySelectorAll(selector)];
  if (!elements.length) {
    throw new Error(`Missing DOM elements: ${selector}`);
  }

  return elements;
}
