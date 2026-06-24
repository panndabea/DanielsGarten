import test from 'node:test';
import assert from 'node:assert/strict';
import { installButtonCopy } from '../src/app/pwa.js';

test('installButtonCopy keeps native and iOS install modes distinct', () => {
  assert.deepEqual(installButtonCopy('prompt'), {
    kicker: 'Als PWA',
    label: 'Installieren',
    ariaLabel: 'Gartenzeit als PWA installieren'
  });

  assert.deepEqual(installButtonCopy('ios-help'), {
    kicker: 'iPhone',
    label: 'Zum Home',
    ariaLabel: 'Gartenzeit zum Home-Bildschirm hinzufügen'
  });
});
