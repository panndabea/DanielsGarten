export const CITY_PRESETS = {
  berlin: { label: 'Berlin', latitude: 52.52, longitude: 13.405 },
  hamburg: { label: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
  muenchen: { label: 'München', latitude: 48.1374, longitude: 11.5755 },
  koeln: { label: 'Köln', latitude: 50.9375, longitude: 6.9603 },
  frankfurt: { label: 'Frankfurt am Main', latitude: 50.1109, longitude: 8.6821 },
  stuttgart: { label: 'Stuttgart', latitude: 48.7758, longitude: 9.1829 },
  leipzig: { label: 'Leipzig', latitude: 51.3397, longitude: 12.3731 },
  freiburg: { label: 'Freiburg', latitude: 47.999, longitude: 7.8421 }
};

export const DEFAULT_CITY = CITY_PRESETS.berlin;
export const DEFAULT_GARDEN_TYPE = 'garden';

export const GARDEN_LABELS = {
  balcony: 'Balkon',
  small: 'Kleiner Garten',
  garden: 'Garten',
  vegetable: 'Gemüsegarten',
  frontyard: 'Vorgarten',
  lawn: 'Rasenfläche'
};

export const MIN_MINUTES = 5;
export const MAX_MINUTES = 180;
export const CUSTOM_MINUTES_DEBOUNCE_MS = 350;
