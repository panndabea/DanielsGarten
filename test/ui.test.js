import test from 'node:test';
import assert from 'node:assert/strict';
import { actionButtonCopy, mascotVisualFor, mascotVisualNameFor, mascotWeatherMood, weatherMascotMessage } from '../src/app/ui.js';

const calmWeather = {
  source: 'Open-Meteo',
  isDry: false,
  isWet: false,
  isRainingNow: false,
  rainSoon: false,
  isWindy: false,
  isHot: false,
  isMild: true,
  frostRisk: 'niedrig'
};

test('mascotWeatherMood maps every garden weather constellation to a character mood', () => {
  assert.equal(mascotWeatherMood(null), 'idle');
  assert.equal(mascotWeatherMood(calmWeather), 'mild');
  assert.equal(mascotWeatherMood({ ...calmWeather, source: 'Fallback' }), 'fallback');
  assert.equal(mascotWeatherMood({ ...calmWeather, isDry: true }), 'dry');
  assert.equal(mascotWeatherMood({ ...calmWeather, isHot: true }), 'hot');
  assert.equal(mascotWeatherMood({ ...calmWeather, rainSoon: true }), 'rainSoon');
  assert.equal(mascotWeatherMood({ ...calmWeather, isWet: true }), 'wet');
  assert.equal(mascotWeatherMood({ ...calmWeather, isRainingNow: true }), 'rain');
  assert.equal(mascotWeatherMood({ ...calmWeather, isWindy: true }), 'wind');
  assert.equal(mascotWeatherMood({ ...calmWeather, frostRisk: 'mittel' }), 'frost');
});

test('mascotWeatherMood keeps safety-relevant weather ahead of comfort states', () => {
  assert.equal(mascotWeatherMood({
    ...calmWeather,
    source: 'Fallback',
    isDry: true,
    isHot: true,
    isWindy: true,
    frostRisk: 'hoch'
  }), 'frost');

  assert.equal(mascotWeatherMood({
    ...calmWeather,
    isRainingNow: true,
    isHot: true,
    isDry: true
  }), 'rain');

  assert.equal(mascotWeatherMood({
    ...calmWeather,
    temperature: 31,
    rainSoon: true,
    isHot: true,
    isDry: true
  }), 'hot');
});

test('weatherMascotMessage uses the mood-specific copy', () => {
  const copy = {
    happy: 'Standard',
    dry: 'Trocken',
    idle: 'Start'
  };

  assert.equal(weatherMascotMessage({ ...calmWeather, isDry: true }, copy), 'Trocken');
  assert.equal(weatherMascotMessage(null, copy), 'Start');
});

test('mascotVisualNameFor maps character states and weather moods to 3d loops', () => {
  assert.equal(mascotVisualNameFor('idle', 'mild'), 'idle');
  assert.equal(mascotVisualNameFor('thinking', 'mild'), 'wave');
  assert.equal(mascotVisualNameFor('weather', 'fallback'), 'wave');
  assert.equal(mascotVisualNameFor('happy', 'rainSoon'), 'wave');
  assert.equal(mascotVisualNameFor('happy', 'dry'), 'watering');
  assert.equal(mascotVisualNameFor('happy', 'hot'), 'watering');
  assert.equal(mascotVisualNameFor('happy', 'rain'), 'watering');
  assert.equal(mascotVisualNameFor('happy', 'wet'), 'watering');
  assert.equal(mascotVisualNameFor('happy', 'wind'), 'wilted');
  assert.equal(mascotVisualNameFor('resting', 'mild'), 'wilted');
  assert.equal(mascotVisualNameFor('done', 'dry'), 'bounce');
});

test('mascotVisualFor switches animated 3d loops to static reduced-motion images', () => {
  assert.equal(
    mascotVisualFor('happy', 'dry', false),
    'assets/character/plant-pot-mascot-watering-loop.webp'
  );
  assert.equal(
    mascotVisualFor('happy', 'dry', true),
    'assets/character/plant-pot-mascot-watering.png'
  );
});

test('actionButtonCopy matches the automatic recommendation flow', () => {
  assert.deepEqual(actionButtonCopy({
    isBusy: false,
    hasMinutes: false,
    hasGenerated: false
  }), {
    icon: '→',
    label: 'Zeitfenster wählen',
    disabled: true
  });

  assert.deepEqual(actionButtonCopy({
    isBusy: false,
    hasMinutes: true,
    hasGenerated: false
  }), {
    icon: '↻',
    label: 'Vorschlag aktualisieren',
    disabled: false
  });

  assert.deepEqual(actionButtonCopy({
    isBusy: true,
    hasMinutes: true,
    hasGenerated: true
  }), {
    icon: '↻',
    label: 'Berechne...',
    disabled: true
  });
});
