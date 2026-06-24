const WEATHER_TIMEOUT_MS = 7000;
const GEOCODING_TIMEOUT_MS = 6000;

export async function fetchWeather(location, options = {}) {
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

  const response = await fetch(url, {
    signal: timeoutSignal(options.timeout ?? WEATHER_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error('Wetter nicht erreichbar');

  return normalizeWeather(await response.json(), options.now);
}

export async function findCity(query, options = {}) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({
    name: query,
    count: '1',
    language: 'de',
    format: 'json'
  }).toString();

  const response = await fetch(url, {
    signal: timeoutSignal(options.timeout ?? GEOCODING_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error('Geocoding nicht erreichbar');

  const data = await response.json();
  const match = data.results?.[0];
  if (!match) return null;

  return {
    label: [match.name, match.admin1, match.country_code].filter(Boolean).join(', '),
    latitude: match.latitude,
    longitude: match.longitude
  };
}

export function normalizeWeather(data, now = new Date()) {
  const today = data.current?.time?.slice(0, 10) || now.toISOString().slice(0, 10);
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

export function fallbackWeather(now = new Date()) {
  const month = now.getMonth() + 1;
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

function timeoutSignal(milliseconds) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(milliseconds);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), milliseconds);
  return controller.signal;
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
