import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackWeather, normalizeWeather } from '../src/services/weather.js';

test('normalizeWeather derives rain, wind, frost, and comfort flags', () => {
  const weather = normalizeWeather({
    current: {
      time: '2026-06-24T12:00',
      temperature_2m: 29,
      precipitation: 0,
      wind_speed_10m: 12
    },
    daily: {
      time: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'],
      precipitation_sum: [1, 2, 0, 3, 2],
      precipitation_probability_max: [10, 20, 70, 30, 25],
      temperature_2m_min: [8, 9, 4, 2, 5],
      temperature_2m_max: [20, 21, 30, 31, 25],
      wind_speed_10m_max: [12, 14, 20, 36, 18]
    }
  });

  assert.equal(weather.source, 'Open-Meteo');
  assert.equal(weather.pastRain, 3);
  assert.equal(weather.soonRain, 5);
  assert.equal(weather.forecastRain, 5);
  assert.equal(weather.rainProbability, 70);
  assert.equal(weather.maxWind, 36);
  assert.equal(weather.frostRisk, 'mittel');
  assert.equal(weather.isHot, true);
  assert.equal(weather.rainSoon, true);
  assert.equal(weather.isWindy, true);
});

test('fallbackWeather stays deterministic when a date is supplied', () => {
  const winter = fallbackWeather(new Date('2026-01-10T10:00:00Z'));
  const summer = fallbackWeather(new Date('2026-07-10T10:00:00Z'));

  assert.equal(winter.source, 'Fallback');
  assert.equal(winter.frostRisk, 'mittel');
  assert.equal(winter.isMild, false);
  assert.equal(summer.temperature, 22);
  assert.equal(summer.isDry, true);
});
