# Design Plan: Pflanzen-Character fuer Gartenzeit

Ziel: Gartenzeit soll sich waermer, niedlicher und motivierender anfuehlen, inspiriert von der freundlichen Begleiter-Logik in Apps wie Finch, aber als eigenstaendiges Gartenzeit-Design. Im Zentrum steht eine kleine putzige Pflanze als Character, die den Nutzer durch die App begleitet, Status sichtbar macht und kleine Erfolgsmomente verstaerkt.

Dieser Plan ist so geschrieben, dass ein Coding Agent ihn Schritt fuer Schritt umsetzen kann.

## Leitplanken

- Keine 1:1-Kopie von Finch. Keine Vogel-Figur, keine Finch-spezifischen Illustrationen, keine Adventure-/Pet-Care-Mechanik.
- Gartenzeit bleibt eine schnelle Aufgaben-App: Zeit waehlen, Standort/Gartentyp optional anpassen, Vorschlaege erhalten.
- Der Character ist Begleitung und Atmosphaere, keine neue Pflichtinteraktion.
- Keine Accounts, keine Streaks, kein Gamification-Druck.
- Die App soll niedlich wirken, aber nicht kindlich-chaotisch. Sie bleibt ruhig, klar und mobile-first.
- Animationen sind subtil und muessen `prefers-reduced-motion` respektieren.
- Der Character darf wichtige Inhalte nicht verdecken.
- Bestehende Privacy-First- und PWA-Entscheidungen bleiben gueltig.

## Ausgangslage

Aktuelle relevante Dateien:

```text
index.html
src/main.js
src/app/dom.js
src/app/ui.js
src/styles/main.css
assets/gartenzeit-hero.png
assets/gartenzeit-comic-hero.png
sw.js
manifest.webmanifest
```

Die aktuelle App hat:

- einen grossen Hero mit Hintergrundbild `assets/gartenzeit-hero.png`.
- ein sachliches Planer-Panel.
- Statusmeldungen ueber `statusLine` und `ui.setStatus(...)`.
- Ergebnis-Karten in `src/app/ui.js`.
- PWA-Dateien und gecachte statische Assets.

## Zielzustand

Nach der Umsetzung soll die erste Ansicht klar signalisieren:

- Gartenzeit hat einen kleinen Pflanzen-Begleiter.
- Die Kernfrage bleibt sofort sichtbar: "Wie viel Zeit hast du?"
- Der Planer bleibt direkt bedienbar.
- Der Character reagiert auf App-Zustaende.
- Aufgaben und "Nichts-Tun-Modus" fuehlen sich freundlicher und belohnender an.

## Character-Konzept

Arbeitstitel: `Pflanzi`

Der Name muss nicht prominent in der UI stehen. Er dient primaer als internes Konzept.

### Aussehen

Der Character ist eine kleine Pflanze in einem Topf:

- rundlicher Terrakotta-Topf.
- zwei bis drei grosse Blaetter.
- kleines Gesicht auf Topf oder Pflanzenkoerper.
- optionale kleine Blume/Spross als Akzent.
- klare Silhouette, auch auf kleinen Bildschirmen erkennbar.

Empfohlene Umsetzung fuer MVP:

- als HTML/CSS-Illustration direkt in `index.html` und `src/styles/main.css`.
- keine externen Bildabhengigkeiten fuer den ersten Schritt.
- CSS Custom Properties fuer Farben und spaetere Varianten.

Optionale spaetere Variante:

- ein generiertes Bitmap-Asset unter `assets/mascot/plant-character.png`.
- nur nutzen, wenn es sichtbar hochwertiger ist als die CSS-Version.
- Falls ein neues Asset fuer die App Shell verwendet wird, `sw.js` Cache-Liste aktualisieren.

### Zustaende

Der Character bekommt folgende visuelle States:

```text
idle       Startzustand, leichtes Atmen/Wippen
thinking   Wetter und Aufgaben werden geladen
happy      Aufgaben wurden gefunden
resting    Nichts-Tun-Modus
done       Nutzer markiert eine Aufgabe als erledigt
weather    optional fuer Wetter-Hinweise
```

CSS-Klassen oder Data-Attribute:

```html
<div class="mascot" id="mascot" data-mascot-state="idle">
```

Empfohlene CSS-Selektoren:

```css
.mascot[data-mascot-state="idle"] { ... }
.mascot[data-mascot-state="thinking"] { ... }
.mascot[data-mascot-state="happy"] { ... }
.mascot[data-mascot-state="resting"] { ... }
.mascot[data-mascot-state="done"] { ... }
```

## UX-Copy

Die Texte sollen kurz, freundlich und handlungsnah bleiben.

Empfohlene Character-Bubble-Texte:

```text
idle: "Wie viel Gartenzeit hast du heute?"
thinking: "Ich schaue kurz aufs Wetter."
happy: "Das lohnt sich heute wirklich."
resting: "Heute darf dein Garten einfach atmen."
done: "Schoen gemacht."
weather fallback: "Ich nutze heute Saisonwissen."
gps denied: "Kein Problem, eine Stadt reicht."
```

Wichtig:

- Sichtbare Bubble-Texte duerfen den Status ergaenzen.
- `statusLine` bleibt die verlaessliche Live-Region fuer technische und operative Meldungen.
- Keine langen Erklaertexte in der Hero-Ansicht.

## Informationsarchitektur

Die bestehende App-Struktur bleibt erhalten:

1. Header mit Brand, Install-Button und Datum.
2. Hero/Planner als erste Hauptansicht.
3. Ergebnisse darunter.
4. Wetterdetails als ausklappbarer Bereich.

Aenderung:

- Im Hero entsteht eine `mascot-stage`, die Character und kurze Bubble enthaelt.
- Der Planer bleibt im Hero sichtbar.
- Das bestehende grosse Hintergrundbild kann reduziert, ersetzt oder als weicher Hintergrund genutzt werden.

Empfohlene erste Ansicht:

```text
Hero
  links/oben:
    Mascot Stage
    H1: Wie viel Zeit hast du?
    Tagline
  rechts/unten:
    Planner Panel
```

Auf Mobile:

```text
Mascot Stage
Headline
Planner Panel
```

## Dateien und konkrete Anpassungen

### `index.html`

Anpassen:

- Innerhalb `.hero-content` vor oder in `.hero-copy` eine Mascot-Zone ergaenzen.
- IDs fuer DOM-Zugriff anlegen.
- Keine wichtigen Inhalte ausschliesslich als dekorative Grafik ausgeben.

Vorgeschlagene Struktur:

```html
<div class="mascot-stage" aria-label="Gartenzeit Begleiter">
  <div class="mascot" id="mascot" data-mascot-state="idle" aria-hidden="true">
    <span class="mascot-pot"></span>
    <span class="mascot-face">
      <span class="mascot-eye"></span>
      <span class="mascot-eye"></span>
      <span class="mascot-mouth"></span>
    </span>
    <span class="mascot-stem"></span>
    <span class="mascot-leaf mascot-leaf-left"></span>
    <span class="mascot-leaf mascot-leaf-right"></span>
    <span class="mascot-sprout"></span>
  </div>
  <p class="mascot-bubble" id="mascotBubble">Wie viel Gartenzeit hast du heute?</p>
</div>
```

Hinweis:

- `aria-hidden="true"` nur auf die grafische Pflanze setzen.
- Die Bubble bleibt normaler sichtbarer Text.
- Falls die Bubble spaeter live aktualisiert wird, nicht zusaetzlich als `aria-live` auszeichnen, solange `statusLine` bereits `aria-live="polite"` nutzt. Sonst entstehen doppelte Screenreader-Ansagen.

### `src/app/dom.js`

Neue Elemente aufnehmen:

```js
mascot: document.getElementById('mascot'),
mascotBubble: document.getElementById('mascotBubble')
```

### `src/app/ui.js`

Neue Hilfsfunktion ergaenzen:

```js
function setMascot(stateName, message) {
  if (!elements.mascot || !elements.mascotBubble) return;
  elements.mascot.dataset.mascotState = stateName;
  if (message) elements.mascotBubble.textContent = message;
}
```

In `createUi(...)` exportieren:

```js
setMascot
```

Empfohlene Einbindungen:

- `renderIntroState()` setzt `idle`.
- `setBusy(true, ...)` setzt `thinking`.
- `renderTasks(tasks, context)` setzt:
  - `happy`, wenn `tasks.length > 0`.
  - `resting`, wenn `tasks.length === 0`.
- Beim Erledigt-Klick in `createTaskCard(...)` optional Custom Event feuern, damit die Haupt-UI `done` setzen kann.

Moeglicher Event-Ansatz:

```js
article.dispatchEvent(new CustomEvent('taskdone', {
  bubbles: true,
  detail: { isDone }
}));
```

Dann in `src/main.js` oder beim Rendern der Task-Liste lauschen.

Einfachere MVP-Alternative:

- In `createTaskCard(...)` nach dem Erledigt-Klick nur die Karte selbst animieren.
- Character-`done` State erst in einer spaeteren Phase nachziehen.

### `src/main.js`

Falls `ui.setMascot(...)` exportiert wird:

- Beim Start nach `ui.renderIntroState()` kein Extra-Code noetig, wenn `renderIntroState()` den State setzt.
- In Fehlerfaellen optional spezifische Character-Bubble setzen:

```js
ui.setMascot('weather', 'Ich nutze heute Saisonwissen.');
```

Nicht uebertreiben:

- `setStatus(...)` bleibt fuer genaue Statusmeldungen.
- `setMascot(...)` bleibt fuer kurze, emotionale Begleitung.

### `src/styles/main.css`

Design-Tokens erweitern:

```css
:root {
  --petal: #f5a3b7;
  --soil: #8f5a36;
  --pot: #d98251;
  --pot-dark: #9f5535;
  --leaf-soft: #8fd39b;
  --leaf-bright: #52ad65;
  --bubble: #ffffff;
}
```

Hinweis:

- Palette darf nicht zu einfarbig gruen werden.
- Warmes Terrakotta, helles Himmelblau und kleine rosa/gelbe Akzente helfen gegen monotones Gruen.

Neue CSS-Bereiche:

```css
.mascot-stage { ... }
.mascot { ... }
.mascot-pot { ... }
.mascot-face { ... }
.mascot-eye { ... }
.mascot-mouth { ... }
.mascot-stem { ... }
.mascot-leaf { ... }
.mascot-sprout { ... }
.mascot-bubble { ... }
```

Animationen:

```css
@keyframes mascot-breathe { ... }
@keyframes mascot-think { ... }
@keyframes leaf-wave { ... }
@keyframes mascot-pop { ... }
```

Reduced Motion:

```css
@media (prefers-reduced-motion: reduce) {
  .mascot,
  .mascot *,
  .task-card {
    animation: none !important;
    transition-duration: .01ms !important;
  }
}
```

### `sw.js`

Nur anpassen, falls neue statische Assets eingebunden werden, z. B.:

```text
assets/mascot/plant-character.png
```

Dann:

- Asset in die App-Shell-Cache-Liste aufnehmen.
- Cache-Version erhoehen.

Bei reiner HTML/CSS-Mascot-Version:

- Keine neue Asset-Datei noetig.
- Trotzdem Cache-Version pruefen, falls `sw.js` selbst statische Dateien mit Versionsnamen verwaltet.

## Phase 0: Preflight

### Ziel

Vor dem Umbau sicherstellen, dass die aktuelle App-Struktur verstanden ist.

### Pruefen

- `index.html` laedt `src/styles/main.css` und `src/main.js`.
- `.hero-content`, `.hero-copy` und `.planner-panel` sind die relevanten Hero-Bereiche.
- `src/app/dom.js` sammelt alle DOM-Elemente.
- `src/app/ui.js` rendert Intro, Wetter, Tasks und Busy State.
- `src/main.js` orchestriert Events und Recommendation Flow.
- Tests existieren fuer Wetter und Task Engine, aber nicht fuer UI.

### Akzeptanzkriterien

- Keine bestehenden Features werden entfernt.
- Zeitwahl, Gartentyp, Standort, Wetterfallback und Aufgabenliste funktionieren nach dem Umbau weiter.

## Phase 1: Layout-Grundlage

### Ziel

Hero so umbauen, dass der Character sichtbar ist, ohne den Planer zu verdraengen.

### Schritte

- `index.html`: `mascot-stage` in `.hero-copy` ergaenzen.
- `src/styles/main.css`: Hero-Grid anpassen.
- Auf Desktop Character und Text links, Planer rechts.
- Auf Mobile Character oben, dann H1, Tagline, Planer.
- Das bestehende Hero-Bild entweder:
  - stark soften und als Hintergrund behalten, oder
  - visuell zuruecknehmen und spaeter ersetzen.

Empfehlung fuer MVP:

- Hero-Bild behalten, aber Scrim und Layout so anpassen, dass Character und Planer die Hauptrolle haben.

### Akzeptanzkriterien

- H1 und Planer sind auf Mobile ohne horizontales Scrollen sichtbar.
- Character verdeckt keine Controls.
- Header, Install-Button und Datum bleiben intakt.

## Phase 2: CSS-Mascot bauen

### Ziel

Pflanzen-Character als robuste CSS/HTML-Illustration erstellen.

### Schritte

- `mascot` als relativ positionierten Container mit fester, responsiver Groesse bauen.
- Topf mit abgerundeter Form und Terrakotta-Farbe.
- Gesicht mit einfachen Augen und Mund.
- Stiel und Blaetter mit pseudoorganischen Formen.
- Sprout/Blume als kleiner Akzent.
- Bubble neben oder unter Character positionieren.

Empfohlene Groessen:

```css
.mascot {
  width: clamp(132px, 18vw, 210px);
  aspect-ratio: 1;
}
```

### Akzeptanzkriterien

- Character ist bei 320px Viewport noch erkennbar.
- Keine Textueberlaeufe in Bubble.
- Keine negativen Letter-Spacings.
- Keine SVG-Orbs oder rein dekorativen Blob-Hintergruende.

## Phase 3: Character-States integrieren

### Ziel

Der Character reagiert auf die wichtigsten App-Zustaende.

### Schritte

- `dom.js`: `mascot` und `mascotBubble` ergaenzen.
- `ui.js`: `setMascot(...)` implementieren und exportieren.
- `renderIntroState()`: `idle`.
- `setBusy(true, ...)`: `thinking`.
- `renderTasks(...)`: `happy` oder `resting`.
- Wetterfallback: optional Bubble "Ich nutze heute Saisonwissen."

Empfohlene Mapping-Tabelle:

```text
App State              Mascot State   Bubble
Intro                  idle           Wie viel Gartenzeit hast du heute?
Loading                thinking       Ich schaue kurz aufs Wetter.
Tasks found            happy          Das lohnt sich heute wirklich.
No tasks               resting        Heute darf dein Garten einfach atmen.
Weather fallback       weather        Ich nutze heute Saisonwissen.
Task marked done       done           Schoen gemacht.
```

### Akzeptanzkriterien

- Bei Klick auf "Aufgabe finden" wechselt der Character sichtbar in `thinking`.
- Nach erfolgreicher Berechnung wechselt er in `happy` oder `resting`.
- Bei Wetterfehler bleibt die App bedienbar und die Bubble bleibt kurz und freundlich.

## Phase 4: Ergebnisbereich niedlicher machen

### Ziel

Die Ergebnisansicht soll zur Character-Welt passen, ohne an Klarheit zu verlieren.

### Schritte

- Task Cards leicht weicher, freundlicher und weniger streng gestalten.
- Prioritaets-Pills klar lesbar lassen.
- Featured Task visuell als "heute zuerst" hervorheben.
- Done-State mit kleinem Erfolgsmoment versehen.
- Empty State mit `resting` Ton abstimmen.

Moegliche CSS-Ideen:

- dezente Blattmarke bei Featured Card.
- kleine Success-Animation auf `.task-card.is-done`.
- waermere Surface-Farbe fuer Empty State.
- nicht mehr als eine kleine dekorative Illustration pro Bereich.

### Akzeptanzkriterien

- Aufgaben bleiben scanbar.
- Dauer, Schwierigkeit, Prioritaet und Werkzeugdetails bleiben sichtbar.
- Done-State ist visuell eindeutig.
- Kein Layout Shift beim Markieren als erledigt.

## Phase 5: Responsive und Accessibility

### Ziel

Der neue Look funktioniert auf kleinen und grossen Screens und bleibt zuganglich.

### Breakpoints pruefen

```text
320x568
375x667
390x844
768x1024
1366x768
1440x900
```

### Accessibility-Regeln

- Grafische Mascot-Teile sind `aria-hidden="true"`.
- Bubble-Text darf sichtbar sein, aber nicht die einzige Quelle wichtiger Informationen sein.
- `statusLine` bleibt `aria-live="polite"`.
- Buttons behalten sichtbare Fokus-Zustaende.
- Farbkontraste fuer Text und Controls pruefen.
- Animationen bei `prefers-reduced-motion: reduce` deaktivieren oder stark reduzieren.

### Akzeptanzkriterien

- Tastaturbedienung funktioniert unveraendert.
- Fokus springt nach Ergebnisberechnung weiterhin sinnvoll zu `resultTitle`.
- Kein Screenreader-relevanter Inhalt ist nur in CSS-Pseudo-Elementen enthalten.
- Keine sich dauerhaft stark bewegenden Elemente.

## Phase 6: Optionale Asset-Politur

### Ziel

Wenn die CSS-Mascot nicht hochwertig genug wirkt, kann ein Bitmap-Asset erstellt werden.

### Schritte

- Neues Asset unter `assets/mascot/` ablegen.
- Dateinamen klein und stabil halten, z. B.:

```text
assets/mascot/plant-idle.png
assets/mascot/plant-happy.png
assets/mascot/plant-resting.png
```

- Nur 1x/2x Assets verwenden, wenn sie wirklich gebraucht werden.
- Alt-Text leer lassen, wenn die Grafik dekorativ ist.
- `sw.js` Cache-Liste aktualisieren und Cache-Version erhoehen.

### Akzeptanzkriterien

- Keine 404-Fehler fuer neue Assets.
- App startet nach erstem Online-Besuch weiterhin offline.
- Neue Bilder sind nicht riesig. Ziel: deutlich unter 300 KB pro State.

## Phase 7: Tests und manuelle Pruefung

### Automatische Tests

Bestehende Tests ausfuehren:

```bash
uv --link-mode copy run python -m unittest
```

Falls das Projekt inzwischen npm-Skripte fuer Tests hat:

```bash
npm test
```

### Manuelle Checks

- App lokal starten, z. B. mit:

```bash
python -m http.server 8000
```

- Im Browser pruefen:
  - Startansicht.
  - Zeitbuttons.
  - eigene Minuten.
  - Gartentyp-Auswahl.
  - Stadt-Auswahl.
  - Stadtsuche.
  - GPS-Ablehnung.
  - Wetterfallback durch offline/network failure.
  - Ergebnisse mit Aufgaben.
  - Empty State.
  - Aufgabe erledigt.
  - PWA-Install-Button, falls verfuegbar.

### Visuelle Checks

- Keine ueberlappenden Texte.
- Keine abgeschnittenen Buttons.
- Keine Cards in Cards hinzufuegen.
- Keine einfarbig-gruene Gesamtwirkung.
- Character ist sichtbar, aber nicht lauter als die Aufgabe.
- Die App wirkt wie Gartenzeit, nicht wie eine Finch-Kopie.

## Definition of Done

- `todo/plant-character-design-plan.md` wurde umgesetzt oder aktualisiert.
- Die App hat einen kleinen Pflanzen-Character in der ersten Ansicht.
- Character-States `idle`, `thinking`, `happy` und `resting` funktionieren.
- Aufgaben-Flow funktioniert unveraendert.
- Mobile Layout ist stabil ab 320px Breite.
- Reduced-Motion wird respektiert.
- Keine neuen Netzwerk- oder Backend-Abhaengigkeiten.
- Bestehende Tests laufen.
- Manuelle Smoke-Tests wurden dokumentiert.

## Empfohlene Umsetzungsreihenfolge fuer den Agent

1. Preflight lesen und relevante Dateien oeffnen.
2. `index.html` um `mascot-stage` erweitern.
3. `src/styles/main.css` fuer Layout und CSS-Mascot anpassen.
4. `src/app/dom.js` um Mascot-Elemente erweitern.
5. `src/app/ui.js` um `setMascot(...)` und State-Wechsel erweitern.
6. Optional `src/main.js` fuer Wetterfallback- oder Done-State-Meldungen anbinden.
7. Responsive und Reduced-Motion pruefen.
8. Tests ausfuehren.
9. Bei neuen Assets `sw.js` und ggf. Manifest/Icon-Strategie pruefen.
