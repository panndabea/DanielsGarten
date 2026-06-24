export const MASCOT_COPY = {
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

const mascotVisualAssets = {
  idle: {
    animated: 'assets/character/plant-pot-mascot-idle-breathe.webp',
    static: 'assets/character/plant-pot-mascot-idle.png'
  },
  wave: {
    animated: 'assets/character/plant-pot-mascot-wave-loop.webp',
    static: 'assets/character/plant-pot-mascot-wave.png'
  },
  watering: {
    animated: 'assets/character/plant-pot-mascot-watering-loop.webp',
    static: 'assets/character/plant-pot-mascot-watering.png'
  },
  bounce: {
    animated: 'assets/character/plant-pot-mascot-bounce-loop.webp',
    static: 'assets/character/plant-pot-mascot-bounce.png'
  },
  wilted: {
    animated: 'assets/character/plant-pot-mascot-wilted-sway.webp',
    static: 'assets/character/plant-pot-mascot-wilted.png'
  }
};

export function taskMascotState(tasks, context, copy = MASCOT_COPY) {
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

export function busyMascotMessage(message, copy = MASCOT_COPY) {
  if (message?.includes('Stadt')) return 'Ich suche deine Stadt.';
  if (message?.includes('Standort')) return 'Ich warte kurz auf den Standort.';
  return copy.thinking;
}

export function busyStep(message) {
  if (message?.includes('Stadt')) return 'Stadt suchen';
  if (message?.includes('Standort')) return 'Standort prüfen';
  if (message?.includes('Wetter')) return 'Wetter prüfen';
  return 'Berechnen';
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

export function weatherMascotMessage(weather, copy = MASCOT_COPY) {
  const mood = mascotWeatherMood(weather);
  return copy[mood] || copy.happy;
}

export function mascotVisualNameFor(stateName = 'idle', weatherMood = 'idle') {
  if (stateName === 'thinking' || stateName === 'weather') return 'wave';
  if (stateName === 'done') return 'bounce';
  if (stateName === 'resting') return 'wilted';
  if (weatherMood === 'frost' || weatherMood === 'wind') return 'wilted';
  if (['dry', 'hot', 'rain', 'wet'].includes(weatherMood)) return 'watering';
  if (weatherMood === 'rainSoon' || weatherMood === 'fallback') return 'wave';
  if (stateName === 'happy') return 'bounce';
  return 'idle';
}

export function mascotVisualFor(stateName = 'idle', weatherMood = 'idle', isReducedMotion = false) {
  const visualName = mascotVisualNameFor(stateName, weatherMood);
  const asset = mascotVisualAssets[visualName] || mascotVisualAssets.idle;
  return isReducedMotion ? asset.static : asset.animated;
}
