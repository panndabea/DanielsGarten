import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContext, priorityForScore, scoreTask, selectTasks } from '../src/domain/task-engine.js';

const weather = {
  isMild: false,
  isDry: true,
  isWet: false,
  isWindy: false,
  rainSoon: false,
  frostRisk: 'niedrig'
};

test('buildContext creates a serializable recommendation context', () => {
  const context = buildContext({
    minutes: 20,
    selectedTypes: new Set(['garden', 'lawn']),
    location: { label: 'Berlin', latitude: 52.52, longitude: 13.405 },
    weather
  }, new Date('2026-06-24T10:00:00Z'));

  assert.equal(context.month, 6);
  assert.deepEqual(context.selectedTypes, ['garden', 'lawn']);
  assert.equal(context.location.label, 'Berlin');
});

test('scoreTask filters by duration, month, type, and excludes', () => {
  const context = {
    month: 6,
    minutes: 20,
    selectedTypes: ['garden'],
    weather
  };

  const baseTask = {
    id: 'task',
    title: 'Task',
    description: 'Task',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['garden'],
    months: [6],
    base: 50,
    tools: [],
    why: 'Basisgrund'
  };

  assert.equal(scoreTask({ ...baseTask, duration: 25 }, context), null);
  assert.equal(scoreTask({ ...baseTask, months: [7] }, context), null);
  assert.equal(scoreTask({ ...baseTask, gardenTypes: ['balcony'] }, context), null);
  assert.equal(scoreTask({ ...baseTask, excludes: [ctx => ctx.weather.isDry] }, context), null);

  const scored = scoreTask({
    ...baseTask,
    boosts: [{ when: ctx => ctx.weather.isDry, points: 20, why: 'Trockenheit zählt.' }]
  }, context);

  assert.equal(scored.score, 82);
  assert.equal(scored.reason, 'Trockenheit zählt.');
  assert.equal(scored.priority.label, 'Hoch');
});

test('selectTasks returns the strongest unique tasks within the available time', () => {
  const context = {
    month: 6,
    minutes: 20,
    selectedTypes: ['garden', 'balcony'],
    weather
  };

  const tasks = [
    {
      id: 'garden-strong',
      title: 'Garden strong',
      description: '',
      duration: 10,
      difficulty: 'Einfach',
      gardenTypes: ['garden'],
      months: [6],
      base: 70,
      tools: [],
      why: 'A'
    },
    {
      id: 'balcony-strong',
      title: 'Balcony strong',
      description: '',
      duration: 8,
      difficulty: 'Einfach',
      gardenTypes: ['balcony'],
      months: [6],
      base: 68,
      tools: [],
      why: 'B'
    },
    {
      id: 'too-long',
      title: 'Too long',
      description: '',
      duration: 30,
      difficulty: 'Mittel',
      gardenTypes: ['garden'],
      months: [6],
      base: 99,
      tools: [],
      why: 'C'
    }
  ];

  const selected = selectTasks(context, tasks);

  assert.deepEqual(selected.map(item => item.task.id), ['garden-strong', 'balcony-strong']);
});

test('priorityForScore maps scores to user-facing priorities', () => {
  assert.equal(priorityForScore(82).label, 'Hoch');
  assert.equal(priorityForScore(64).label, 'Mittel');
  assert.equal(priorityForScore(10).label, 'Niedrig');
});
