import { TASKS } from '../data/tasks.js';

export function buildContext(state, now = new Date()) {
  return {
    month: now.getMonth() + 1,
    minutes: state.minutes,
    selectedTypes: [...state.selectedTypes],
    location: state.location,
    weather: state.weather
  };
}

export function selectTasks(context, tasks = TASKS) {
  const scored = tasks
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

export function scoreTask(task, context) {
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

export function priorityForScore(score) {
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

export function isCalmDay(context) {
  const weather = context.weather;
  return weather.isMild &&
    !weather.isDry &&
    !weather.isWet &&
    !weather.isWindy &&
    !weather.rainSoon &&
    weather.frostRisk === 'niedrig';
}
