const CITY_PRESETS = {
  berlin: { label: 'Berlin', latitude: 52.52, longitude: 13.405 },
  hamburg: { label: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
  muenchen: { label: 'München', latitude: 48.1374, longitude: 11.5755 },
  koeln: { label: 'Köln', latitude: 50.9375, longitude: 6.9603 },
  frankfurt: { label: 'Frankfurt am Main', latitude: 50.1109, longitude: 8.6821 },
  stuttgart: { label: 'Stuttgart', latitude: 48.7758, longitude: 9.1829 },
  leipzig: { label: 'Leipzig', latitude: 51.3397, longitude: 12.3731 },
  freiburg: { label: 'Freiburg', latitude: 47.999, longitude: 7.8421 }
};

const GARDEN_LABELS = {
  balcony: 'Balkon',
  small: 'Kleiner Garten',
  garden: 'Garten',
  vegetable: 'Gemüsegarten',
  frontyard: 'Vorgarten',
  lawn: 'Rasenfläche'
};

const TASKS = [
  {
    id: 'water-check',
    title: 'Gießbedarf prüfen',
    description: 'Prüfe zuerst die trockensten Stellen mit der Fingerprobe. Gieße langsam nur dort, wo die Erde wirklich trocken ist.',
    duration: 8,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 52,
    tools: ['Fingerprobe', 'Gießkanne'],
    why: 'Kleine Gießrunden helfen mehr als große Routinen nach Gefühl.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 32, why: 'In den letzten Tagen fiel wenig Regen.' },
      { when: ctx => ctx.weather.isHot, points: 16, why: 'Hohe Temperaturen trocknen Töpfe und obere Bodenschichten schnell aus.' }
    ]
  },
  {
    id: 'deadhead',
    title: 'Verblühtes entfernen',
    description: 'Schneide oder zupfe welke Blüten ab und nimm gelbe Blätter mit. Konzentriere dich auf die Pflanzen, die du direkt siehst.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [5, 6, 7, 8, 9],
    base: 56,
    tools: ['Gartenschere', 'Eimer'],
    why: 'Im Sommer bleiben viele Pflanzen vitaler, wenn Verblühtes regelmäßig wegkommt.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Das Wetter ist ruhig genug für eine schnelle Pflegerunde.' }
    ]
  },
  {
    id: 'slug-round',
    title: 'Schneckenrunde drehen',
    description: 'Sieh unter Blättern, Töpfen und Brettern nach. Entferne Schnecken besonders bei jungen Pflanzen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['all', 'vegetable'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 42,
    tools: ['Handschuhe', 'Eimer'],
    why: 'Feuchte Phasen bringen Schnecken schnell an empfindliche Pflanzen.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 34, why: 'Der viele Regen der letzten Tage macht Schnecken aktiver.' },
      { when: ctx => ctx.weather.isRainingNow, points: 20, why: 'Bei feuchtem Wetter findest du sie besonders leicht.' }
    ]
  },
  {
    id: 'wind-secure',
    title: 'Lockeres sichern',
    description: 'Kontrolliere Rankhilfen, Töpfe, leichte Deko und junge Triebe. Alles, was wackelt, bekommt Halt.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 38,
    tools: ['Pflanzdraht', 'Schnur'],
    why: 'Windschäden lassen sich mit wenigen Minuten Vorbereitung oft verhindern.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 44, why: 'Die Windwerte sind heute erhöht.' },
      { when: ctx => ctx.weather.rainSoon, points: 12, why: 'Vor Regen lohnt sich ein kurzer Stabilitätscheck.' }
    ]
  },
  {
    id: 'frost-cover',
    title: 'Frostschutz bereitlegen',
    description: 'Lege Vlies bereit und rücke empfindliche Töpfe näher an die Hauswand. Decke erst abends ab.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all', 'balcony', 'vegetable'],
    months: [1, 2, 3, 4, 10, 11, 12],
    base: 48,
    tools: ['Vlies', 'Klammern'],
    why: 'Nächte nahe null Grad treffen junge und getriebene Pflanzen besonders hart.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 44, why: 'Die Tiefstwerte deuten auf Frostgefahr hin.' }
    ]
  },
  {
    id: 'balcony-pots',
    title: 'Töpfe anheben',
    description: 'Hebe jeden Topf kurz an. Sehr leichte Töpfe gießt du, schwere Töpfe lässt du in Ruhe.',
    duration: 8,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 58,
    tools: ['Gießkanne'],
    why: 'Töpfe trocknen schneller aus als Beete und verraten ihren Wasserbedarf über das Gewicht.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 26, why: 'Trockenes Wetter macht Kübelpflanzen durstiger.' },
      { when: ctx => ctx.weather.isHot, points: 16, why: 'Hitze stresst Balkonpflanzen besonders schnell.' }
    ]
  },
  {
    id: 'balcony-shade',
    title: 'Schatten für Töpfe schaffen',
    description: 'Rücke empfindliche Töpfe aus der Mittagssonne oder gruppiere sie so, dass größere Pflanzen kleinere beschatten.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [6, 7, 8],
    base: 42,
    tools: ['Untersetzer', 'Pflanzenroller'],
    why: 'Auf Balkonen staut sich Hitze schneller als im Garten.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 42, why: 'Die Temperatur spricht für Hitzeschutz statt Zusatzstress.' }
    ]
  },
  {
    id: 'small-corner',
    title: 'Die sichtbarste Ecke klären',
    description: 'Wähle eine kleine Stelle, die du täglich siehst. Entferne nur Offensichtliches und höre nach dem Zeitfenster auf.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['small', 'garden', 'frontyard'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 50,
    tools: ['Eimer', 'Handschuhe'],
    why: 'Ein klarer Blickpunkt verbessert den Garten sofort, ohne dass du alles anfassen musst.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Ruhiges Wetter eignet sich gut für eine schnelle Ordnungsrunde.' }
    ]
  },
  {
    id: 'edge-clean',
    title: 'Beetkante befreien',
    description: 'Ziehe Gras und Beikraut an einer Kante entlang heraus. Eine saubere Linie macht den Garten sofort ruhiger.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['small', 'garden', 'frontyard'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 51,
    tools: ['Handschuhe', 'Kantenstecher'],
    why: 'Kantenarbeit hat eine große sichtbare Wirkung pro Minute.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Der Boden ist bei mildem Wetter gut zu bearbeiten.' }
    ]
  },
  {
    id: 'stake-perennials',
    title: 'Stauden stützen',
    description: 'Binde hohe oder aufgeweichte Stauden locker an. Arbeite von den Pflanzen mit der größten Bruchgefahr aus.',
    duration: 20,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [5, 6, 7, 8, 9],
    base: 48,
    tools: ['Stäbe', 'Schnur'],
    why: 'Hohe Triebe kippen nach Regen oder Wind besonders leicht um.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 30, why: 'Wind erhöht heute die Bruchgefahr.' },
      { when: ctx => ctx.weather.rainSoon, points: 18, why: 'Vor Regen stehen hohe Stauden mit Stütze besser.' }
    ]
  },
  {
    id: 'mulch-gap',
    title: 'Mulchlücken schließen',
    description: 'Bedecke nackte Erde dünn mit Rasenschnitt, Laubkompost oder anderem Mulch. Lass den Stängelansatz frei.',
    duration: 30,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'vegetable'],
    months: [4, 5, 6, 7, 8, 9],
    base: 48,
    tools: ['Mulch', 'Schaufel'],
    why: 'Mulch hält Feuchtigkeit im Boden und bremst Unkraut.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 28, why: 'Trockenheit macht offenen Boden unnötig verletzlich.' },
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Bei Hitze schützt Mulch die Wurzeln.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'tomato-prune',
    title: 'Tomaten ausgeizen',
    description: 'Brich kleine Seitentriebe in den Blattachseln vorsichtig aus und entferne gelbe untere Blätter.',
    duration: 10,
    difficulty: 'Mittel',
    gardenTypes: ['vegetable'],
    months: [6, 7, 8],
    base: 66,
    tools: ['Saubere Hände', 'Gartenschere'],
    why: 'Tomaten wachsen jetzt schnell und profitieren von Luft und klarer Führung.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Bei trocken-mildem Wetter verheilen kleine Verletzungen besser.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'veg-pest-check',
    title: 'Gemüsebeet kontrollieren',
    description: 'Sieh an Blattunterseiten und Triebspitzen nach Läusen, Fraßspuren und gelben Blättern. Entferne nur, was eindeutig befallen ist.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [4, 5, 6, 7, 8, 9],
    base: 52,
    tools: ['Handschuhe', 'Schüssel'],
    why: 'Frühe Kontrollen verhindern, dass kleine Probleme das Beet übernehmen.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 20, why: 'Feuchte Phasen fördern Schnecken und Pilzdruck.' },
      { when: ctx => ctx.weather.isHot, points: 8, why: 'Wärme beschleunigt viele Schädlingszyklen.' }
    ]
  },
  {
    id: 'harvest-ready',
    title: 'Reifes ernten',
    description: 'Ernte zuerst Reifes und Angeschlagenes. Was heute runterkommt, spart der Pflanze Kraft.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [6, 7, 8, 9, 10],
    base: 53,
    tools: ['Schüssel', 'Schere'],
    why: 'Regelmäßiges Ernten hält viele Gemüsearten produktiv.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 10, why: 'Vor Hitzeperioden lohnt sich Ernten, bevor Früchte leiden.' }
    ]
  },
  {
    id: 'front-entrance',
    title: 'Eingang freimachen',
    description: 'Entferne nur, was Wege, Türbereich oder Klingel verdeckt. Der Rest darf warten.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['frontyard'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 56,
    tools: ['Besen', 'Eimer'],
    why: 'Der Eingangsbereich hat die größte sichtbare Wirkung für wenig Arbeit.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Das Wetter passt für eine kurze Runde direkt vor der Tür.' }
    ]
  },
  {
    id: 'path-weeds',
    title: 'Wegfugen jäten',
    description: 'Arbeite nur eine Wegstrecke ab. Feuchte Fugen lassen sich leichter reinigen als trockene.',
    duration: 20,
    difficulty: 'Mittel',
    gardenTypes: ['frontyard', 'small', 'garden'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Fugenkratzer', 'Besen'],
    why: 'Ein sauberer Weg lässt den ganzen Bereich gepflegter wirken.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 18, why: 'Nach Regen lösen sich Pflanzen aus Fugen leichter.' }
    ]
  },
  {
    id: 'lawn-pause',
    title: 'Rasenmähen verschieben',
    description: 'Lass den Rasen heute höher stehen. Prüfe nur trockene Ränder und gieße nicht in der Mittagshitze.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [6, 7, 8],
    base: 44,
    tools: ['Kein Werkzeug'],
    why: 'Bei Hitze oder Trockenheit schützt längerer Rasen den Boden.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 30, why: 'Trockenheit macht Mähen heute eher schädlich als hilfreich.' },
      { when: ctx => ctx.weather.isHot, points: 28, why: 'Hitze stresst frisch gemähten Rasen stark.' }
    ]
  },
  {
    id: 'lawn-mow',
    title: 'Rasen mähen',
    description: 'Mähe nicht zu kurz und lass Schnittgut nur liegen, wenn es fein verteilt ist.',
    duration: 45,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 50,
    tools: ['Rasenmäher', 'Rechen'],
    why: 'Mildes, trockenes Wetter ist ein gutes Mähfenster.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 20, why: 'Heute ist es weder zu nass noch zu heiß fürs Mähen.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Vor Regen kann ein Schnitt sinnvoll sein, wenn der Rasen trocken ist.' }
    ],
    excludes: [ctx => ctx.weather.isDry || ctx.weather.isHot || ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'lawn-edges',
    title: 'Rasenkante schneiden',
    description: 'Schneide nur die Kanten an Wegen oder Beeten nach. Das wirkt ordentlicher als eine komplette Rasenrunde.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['lawn', 'frontyard', 'garden'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Kantenschneider', 'Handschuhe'],
    why: 'Kantenpflege bringt schnell sichtbare Ordnung.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Das Wetter ist stabil genug für sauberes Arbeiten an der Kante.' }
    ]
  },
  {
    id: 'lawn-seed',
    title: 'Kahlstellen nachsäen',
    description: 'Lockere kleine Kahlstellen, streue Saat aus und drücke sie leicht an. Danach feucht halten.',
    duration: 30,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 9, 10],
    base: 50,
    tools: ['Rasensaat', 'Rechen'],
    why: 'Kühle, feuchte Phasen helfen frischer Saat beim Keimen.',
    boosts: [
      { when: ctx => ctx.weather.rainSoon, points: 20, why: 'Die Regenprognose kann beim Anwachsen helfen.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  }
];

TASKS.push(...[
  {
    id: 'rain-barrel-check',
    title: 'Regentonne vorbereiten',
    description: 'Prüfe Zulauf, Deckel und Überlauf. Stelle sicher, dass Regenwasser sauber gesammelt wird und nichts neben die Tonne läuft.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 44,
    tools: ['Handschuhe', 'Bürste'],
    why: 'Gesammeltes Regenwasser hilft besonders in trockenen Phasen.',
    boosts: [
      { when: ctx => ctx.weather.rainSoon, points: 28, why: 'Vor Regen lohnt sich ein kurzer Check der Sammelstellen.' },
      { when: ctx => ctx.weather.isDry, points: 14, why: 'Nach trockenen Tagen ist jeder Liter Regenwasser wertvoll.' }
    ]
  },
  {
    id: 'drainage-after-rain',
    title: 'Staunässe suchen',
    description: 'Gehe Beete, Töpfe und Wege ab. Wo Wasser steht, lockerst du vorsichtig die Oberfläche oder öffnest Abflusslöcher.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 42,
    tools: ['Handschuhe', 'Handkralle'],
    why: 'Staunässe schadet Wurzeln schneller als viele andere Wetterprobleme.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 34, why: 'Nach viel Regen ist ein Drainagecheck besonders sinnvoll.' },
      { when: ctx => ctx.weather.isRainingNow, points: 10, why: 'Während Regen siehst du sofort, wo Wasser stehen bleibt.' }
    ]
  },
  {
    id: 'storm-damage-check',
    title: 'Sturmschäden einsammeln',
    description: 'Sammle abgebrochene Zweige, lose Etiketten und umgekippte Kleinteile ein. Schneide nur sauber nach, was klar gebrochen ist.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 40,
    tools: ['Eimer', 'Gartenschere'],
    why: 'Nach Wind sind kleine Schäden schnell behoben, bevor sie größere Folgen haben.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 36, why: 'Die Windwerte sprechen für einen Sicherheitsrundgang.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Vor weiterem Regen ist Aufräumen leichter als danach.' }
    ]
  },
  {
    id: 'tool-clean-oil',
    title: 'Werkzeug kurz pflegen',
    description: 'Entferne Erde von Schere, Schaufel und Handgerät. Trockne Metallteile ab und gib bei Bedarf einen Tropfen Öl auf Gelenke.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [1, 2, 3, 4, 10, 11, 12],
    base: 46,
    tools: ['Lappen', 'Bürste', 'Öl'],
    why: 'Sauberes Werkzeug schneidet besser und überträgt weniger Krankheiten.',
    boosts: [
      { when: ctx => ctx.weather.isRainingNow, points: 18, why: 'Bei Regen ist Werkzeugpflege eine gute Gartenaufgabe ohne Bodendruck.' },
      { when: ctx => ctx.weather.isWet, points: 10, why: 'Feuchte Tage sind gut, um benutztes Werkzeug zu trocknen und zu pflegen.' }
    ]
  },
  {
    id: 'weed-seedheads-cut',
    title: 'Samenstände von Beikraut kappen',
    description: 'Schneide blühendes oder samenbildendes Beikraut ab, bevor es sich verteilt. Die Wurzeln können später warten.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Schere', 'Eimer'],
    why: 'Wer Samenbildung stoppt, spart sich viele spätere Jäterunden.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Ruhiges Wetter passt gut für eine schnelle Kontrollrunde.' },
      { when: ctx => ctx.weather.isDry, points: 8, why: 'Bei Trockenheit lassen sich trockene Samenstände sauber einsammeln.' }
    ]
  },
  {
    id: 'disease-leaves-remove',
    title: 'Kranke Blätter entfernen',
    description: 'Entferne fleckige, matschige oder stark befallene Blätter. Wirf sie in den Restmüll, wenn Pilzbefall sichtbar ist.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [4, 5, 6, 7, 8, 9, 10, 11],
    base: 46,
    tools: ['Handschuhe', 'Schere'],
    why: 'Weniger befallenes Laub senkt den Krankheitsdruck im Bestand.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 24, why: 'Feuchte Phasen erhöhen Pilzdruck und Blattprobleme.' },
      { when: ctx => ctx.weather.rainSoon, points: 10, why: 'Vor Regen lohnt es sich, stark befallenes Laub zu reduzieren.' }
    ]
  },
  {
    id: 'heat-stress-scan',
    title: 'Hitzestress erkennen',
    description: 'Suche nach eingerollten Blättern, schlaffen Trieben und trockenen Topfrändern. Hilf zuerst kleinen und frisch gepflanzten Pflanzen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [5, 6, 7, 8, 9],
    base: 42,
    tools: ['Gießkanne'],
    why: 'Frühe Hitzesignale lassen sich oft mit wenig Wasser oder Schatten abfangen.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 34, why: 'Die Temperatur spricht für eine kurze Stresskontrolle.' },
      { when: ctx => ctx.weather.isDry, points: 18, why: 'Trockenheit verstärkt Hitzestress deutlich.' }
    ]
  },
  {
    id: 'morning-water-plan',
    title: 'Gießrunde für morgens planen',
    description: 'Stelle Kanne oder Schlauch bereit und markiere die trockensten Pflanzen. Gegossen wird am besten früh statt in der Mittagshitze.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [5, 6, 7, 8, 9],
    base: 43,
    tools: ['Gießkanne', 'Schlauch'],
    why: 'Gute Vorbereitung verhindert hektisches und oberflächliches Gießen.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 30, why: 'Vor heißen Tagen hilft eine klare Gießreihenfolge.' },
      { when: ctx => ctx.weather.isDry, points: 20, why: 'Nach trockenen Tagen lohnt sich geplantes statt pauschales Gießen.' }
    ]
  },
  {
    id: 'compost-balance',
    title: 'Kompost ausbalancieren',
    description: 'Mische feuchte Küchenreste mit trockenem Laub, Häcksel oder Karton. Lockere verdichtete Stellen nur oberflächlich.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'vegetable'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 48,
    tools: ['Grabegabel', 'Trockenmaterial'],
    why: 'Ein ausgewogener Kompost riecht weniger und liefert später bessere Erde.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Mildes Wetter hält den Kompost aktiv.' },
      { when: ctx => ctx.weather.isWet, points: 8, why: 'Nach nassen Tagen hilft trockenes Material gegen Verdichtung.' }
    ]
  },
  {
    id: 'autumn-leaf-mulch',
    title: 'Laub als Mulch nutzen',
    description: 'Verteile gesundes Laub dünn unter Sträuchern oder auf freien Beetflächen. Wege und Rasen bleiben frei.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [10, 11, 12],
    base: 52,
    tools: ['Rechen', 'Handschuhe'],
    why: 'Laub schützt Bodenleben und offene Erde über den Winter.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Bei mildem Wetter lässt sich Laub gut verteilen.' },
      { when: ctx => ctx.weather.isWindy, points: 8, why: 'Vor Wind lohnt es sich, Laub gezielt in Beete zu bringen.' }
    ]
  },
  {
    id: 'winter-evergreen-water',
    title: 'Immergrüne wässern',
    description: 'Gieße immergrüne Töpfe und frisch gesetzte Gehölze sparsam, wenn der Boden offen und trocken ist.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['all'],
    months: [1, 2, 3, 11, 12],
    base: 43,
    tools: ['Gießkanne'],
    why: 'Immergrüne verdunsten auch im Winter Wasser und leiden bei trockenem Frost besonders.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 30, why: 'Trockenes Wetter macht immergrüne Pflanzen durstig.' },
      { when: ctx => ctx.weather.frostRisk === 'mittel', points: 12, why: 'Vor kühlen Nächten hilft ein leicht feuchter Wurzelballen.' }
    ],
    excludes: [ctx => ctx.weather.frostRisk === 'hoch' || ctx.weather.isRainingNow]
  },
  {
    id: 'snow-load-shake',
    title: 'Schneelast abschütteln',
    description: 'Klopfe schwere Last vorsichtig von immergrünen Sträuchern, Bambus und jungen Gehölzen. Arbeite von unten nach oben.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony'],
    months: [1, 2, 3, 11, 12],
    base: 36,
    tools: ['Handschuhe', 'Besen'],
    why: 'Schwere Last kann junge Triebe und immergrüne Kronen auseinanderdrücken.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk === 'hoch', points: 30, why: 'Die Tiefstwerte sprechen für winterliche Belastung empfindlicher Pflanzen.' },
      { when: ctx => ctx.weather.isWet, points: 12, why: 'Nasse Auflage ist besonders schwer.' }
    ]
  },
  {
    id: 'frost-heave-firm',
    title: 'Hochgefrorene Pflanzen andrücken',
    description: 'Drücke kleine Stauden, Erdbeeren oder Jungpflanzen vorsichtig zurück in Bodenkontakt. Nicht ziehen, nur festigen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'vegetable', 'frontyard'],
    months: [1, 2, 3, 11, 12],
    base: 42,
    tools: ['Handschuhe'],
    why: 'Frostwechsel können Wurzeln freilegen und Jungpflanzen austrocknen lassen.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 28, why: 'Frostgefahr macht Bodenkontakt für kleine Pflanzen wichtiger.' }
    ]
  },
  {
    id: 'hose-leak-check',
    title: 'Schlauch und Anschlüsse prüfen',
    description: 'Lass kurz Wasser laufen und prüfe Kupplungen, Brause und Schlauch auf Lecks. Tausche spröde Dichtungen direkt aus.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'vegetable', 'frontyard', 'lawn'],
    months: [3, 4, 5, 6, 7, 8, 9],
    base: 45,
    tools: ['Ersatzdichtung', 'Gießbrause'],
    why: 'Dichte Anschlüsse sparen Wasser und Nerven in der Hauptsaison.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 18, why: 'Vor trockenen Tagen sollte die Bewässerung zuverlässig funktionieren.' },
      { when: ctx => ctx.weather.isHot, points: 10, why: 'Bei Hitze fallen undichte Stellen besonders ungünstig auf.' }
    ]
  },
  {
    id: 'balcony-drainage-check',
    title: 'Abflusslöcher freimachen',
    description: 'Hebe Töpfe kurz an und prüfe, ob Abflusslöcher frei sind. Entferne Erde, Laub oder Wurzeln vor den Löchern.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 50,
    tools: ['Holzstäbchen', 'Handschuhe'],
    why: 'Gute Drainage schützt Balkonpflanzen vor faulen Wurzeln.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 24, why: 'Nach viel Regen sind verstopfte Töpfe besonders kritisch.' },
      { when: ctx => ctx.weather.rainSoon, points: 14, why: 'Vor Regen lohnt sich freie Drainage.' }
    ]
  },
  {
    id: 'balcony-saucer-empty',
    title: 'Untersetzer leeren',
    description: 'Leere Untersetzer und Übertöpfe, in denen Wasser steht. Fülle nur bei durstigen Pflanzen später gezielt nach.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Kein Werkzeug'],
    why: 'Stehendes Wasser nimmt Wurzeln Luft und zieht Mücken an.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 28, why: 'Nach Regen stehen Untersetzer schnell voll.' },
      { when: ctx => ctx.weather.isRainingNow, points: 12, why: 'Bei Regen siehst du volle Untersetzer sofort.' }
    ]
  },
  {
    id: 'balcony-herbs-harvest',
    title: 'Kräuter beernten',
    description: 'Schneide Kräuter über einem Blattpaar. Ernte lieber kleine Spitzen als ganze verholzte Triebe.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony', 'vegetable'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 54,
    tools: ['Schere', 'Schüssel'],
    why: 'Regelmäßiges Ernten hält viele Kräuter kompakt und aromatisch.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Mildes Wetter passt gut für einen sauberen Schnitt.' },
      { when: ctx => ctx.weather.isHot, points: 8, why: 'Vor Hitze lohnt sich Ernten, bevor zarte Spitzen leiden.' }
    ]
  },
  {
    id: 'balcony-feed-light',
    title: 'Balkonpflanzen schwach düngen',
    description: 'Dünge nur Pflanzen im aktiven Wachstum und niedriger als auf der Packung angegeben. Trockene Ballen vorher leicht anfeuchten.',
    duration: 10,
    difficulty: 'Mittel',
    gardenTypes: ['balcony'],
    months: [5, 6, 7, 8],
    base: 46,
    tools: ['Flüssigdünger', 'Gießkanne'],
    why: 'Topfpflanzen verbrauchen Nährstoffe schneller als Beetpflanzen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 18, why: 'Mildes Wetter ist besser zum Düngen als Hitze.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isDry || ctx.weather.isRainingNow]
  },
  {
    id: 'balcony-aphid-shower',
    title: 'Läuse abduschen',
    description: 'Dusche befallene Triebspitzen mit einem sanften Wasserstrahl ab. Stütze zarte Triebe mit der Hand.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony', 'vegetable'],
    months: [4, 5, 6, 7, 8, 9],
    base: 48,
    tools: ['Sprühflasche', 'Wasser'],
    why: 'Frühes Abduschen reicht bei leichtem Befall oft aus.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Wärme beschleunigt viele Schädlingszyklen.' },
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Bei ruhigem Wetter trocknen die Pflanzen danach gut ab.' }
    ]
  },
  {
    id: 'balcony-windowbox-trim',
    title: 'Balkonkasten ausputzen',
    description: 'Entferne welke Blüten, gelbe Blätter und abgestorbene Triebe aus einem Kasten. Arbeite nur die sichtbarste Reihe ab.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [5, 6, 7, 8, 9, 10],
    base: 54,
    tools: ['Schere', 'Eimer'],
    why: 'Saubere Kästen blühen länger und sehen sofort gepflegter aus.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Das Wetter passt für eine kurze Pflegerunde.' }
    ]
  },
  {
    id: 'balcony-rail-safety',
    title: 'Balkonkästen sichern',
    description: 'Prüfe Halterungen, Haken und schwere Töpfe am Geländer. Ziehe nach oder rücke Wackelkandidaten nach innen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 42,
    tools: ['Schraubendreher', 'Handschuhe'],
    why: 'Sichere Kästen sind bei Wind wichtiger als jede Pflegemaßnahme.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 42, why: 'Die Windwerte machen Sicherheit am Geländer wichtig.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Vor Regen und Böen lohnt sich ein kurzer Sitzcheck.' }
    ]
  },
  {
    id: 'balcony-cold-night-move',
    title: 'Empfindliche Töpfe einrücken',
    description: 'Stelle Kräuter, Jungpflanzen und mediterrane Töpfe näher an die Hauswand. Kleine Töpfe kommen über Nacht geschützt zusammen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [1, 2, 3, 4, 10, 11, 12],
    base: 46,
    tools: ['Pflanzenroller', 'Vlies'],
    why: 'Hauswände puffern kalte Nächte und Wind etwas ab.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 36, why: 'Die Tiefstwerte sprechen für Schutz empfindlicher Töpfe.' },
      { when: ctx => ctx.weather.isWindy, points: 10, why: 'Wind kühlt Topfpflanzen zusätzlich aus.' }
    ]
  },
  {
    id: 'balcony-soil-top-up',
    title: 'Topferde auffüllen',
    description: 'Fülle abgesackte Erde in Töpfen nach und drücke sie nur leicht an. Lass einen Gießrand frei.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['balcony'],
    months: [3, 4, 5, 6, 7],
    base: 48,
    tools: ['Pflanzerde', 'Handschaufel'],
    why: 'Genug Erde stabilisiert Feuchtigkeit und Wurzeln im Topf.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Mildes Wetter eignet sich gut für kleine Topfarbeiten.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'balcony-seedlings-harden',
    title: 'Jungpflanzen abhärten',
    description: 'Stelle Jungpflanzen für kurze Zeit schattig nach draußen und hole sie wieder rein. Direkte Sonne und Wind vermeidest du.',
    duration: 15,
    difficulty: 'Mittel',
    gardenTypes: ['balcony', 'vegetable'],
    months: [3, 4, 5],
    base: 50,
    tools: ['Tablett', 'Vlies'],
    why: 'Abhärten verhindert Schock, wenn Jungpflanzen dauerhaft nach draußen ziehen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Mildes Wetter ist ideal für kurze Abhärtungsrunden.' }
    ],
    excludes: [ctx => ctx.weather.isWindy || ctx.weather.frostRisk !== 'niedrig' || ctx.weather.isRainingNow]
  },
  {
    id: 'shrub-water-basin',
    title: 'Gießrand um Sträucher formen',
    description: 'Ziehe um frisch gepflanzte Sträucher einen flachen Erdwall. So läuft Wasser nicht sofort weg.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Handschaufel', 'Gießkanne'],
    why: 'Ein Gießrand bringt Wasser dorthin, wo junge Wurzeln es brauchen.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 22, why: 'Trockenheit macht gezieltes Wässern wichtiger.' },
      { when: ctx => ctx.weather.isHot, points: 10, why: 'Bei Hitze verdunstet oberflächliches Wasser schnell.' }
    ]
  },
  {
    id: 'rose-wild-shoots',
    title: 'Wildtriebe an Rosen entfernen',
    description: 'Suche Triebe, die unterhalb der Veredelungsstelle austreiben. Reiße sie möglichst nah am Ansatz ab statt sie nur zu kürzen.',
    duration: 15,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [4, 5, 6, 7, 8, 9],
    base: 50,
    tools: ['Handschuhe', 'Gartenschere'],
    why: 'Wildtriebe nehmen der Rose Kraft und überwachsen sie langfristig.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Bei mildem Wetter lässt sich ruhig und sauber arbeiten.' }
    ]
  },
  {
    id: 'rose-deadwood-spring',
    title: 'Totes Rosenholz schneiden',
    description: 'Schneide braune, abgestorbene Rosentriebe bis ins gesunde Holz zurück. Entferne nur klar totes Material.',
    duration: 20,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [3, 4],
    base: 52,
    tools: ['Rosenschere', 'Handschuhe'],
    why: 'Totes Holz stört den Austrieb und kann Krankheiten begünstigen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Mildes Frühlingswetter ist ein gutes Schnittfenster.' }
    ],
    excludes: [ctx => ctx.weather.frostRisk === 'hoch' || ctx.weather.isRainingNow]
  },
  {
    id: 'spring-shrub-afterbloom',
    title: 'Frühblüher nach der Blüte schneiden',
    description: 'Kürze abgeblühte Triebe von Forsythie, Zierjohannisbeere oder ähnlichen Sträuchern behutsam ein.',
    duration: 30,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [5, 6],
    base: 48,
    tools: ['Gartenschere', 'Astschere'],
    why: 'Viele Frühblüher bilden ihre Blütenknospen früh und profitieren direkt nach der Blüte vom Schnitt.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Trocken-mildes Wetter ist gut für Schnittarbeiten.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'lavender-trim',
    title: 'Lavendel leicht zurückschneiden',
    description: 'Kürze verblühte Lavendeltriebe, ohne tief ins alte Holz zu schneiden. Eine Handbreit Grün bleibt stehen.',
    duration: 20,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony'],
    months: [7, 8, 9],
    base: 50,
    tools: ['Schere', 'Korb'],
    why: 'Ein leichter Schnitt hält Lavendel kompakt und verhindert Verkahlen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Trocken-mildes Wetter passt gut für Lavendelschnitt.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'catmint-recut',
    title: 'Katzenminze zurücknehmen',
    description: 'Schneide zerfallene Katzenminze oder Salbeiähnliches handhoch zurück. Danach treibt vieles frischer nach.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [6, 7, 8],
    base: 49,
    tools: ['Schere', 'Eimer'],
    why: 'Ein Sommerschnitt bringt Ordnung und oft eine zweite Blüte.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Mildes Wetter reduziert Stress nach dem Rückschnitt.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isRainingNow]
  },
  {
    id: 'perennial-seedheads-select',
    title: 'Samenstände auswählen',
    description: 'Entferne matschige Samenstände und lass stabile, schöne Köpfe für Struktur und Tiere stehen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [9, 10, 11],
    base: 48,
    tools: ['Schere', 'Eimer'],
    why: 'Gezieltes Stehenlassen wirkt gepflegt und unterstützt den Garten im Winter.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 10, why: 'Nach Nässe fallen matschige Stängel schneller um.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter passt für eine ruhige Herbstrunde.' }
    ]
  },
  {
    id: 'divide-perennial-clump',
    title: 'Staudenhorst teilen',
    description: 'Teile einen zu dichten Horst am Rand, pflanze vitale Stücke neu ein und gieße sie gut an.',
    duration: 45,
    difficulty: 'Mittel',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [3, 4, 9, 10],
    base: 46,
    tools: ['Spaten', 'Gießkanne'],
    why: 'Geteilte Stauden bleiben blühfreudig und schließen Lücken ohne Neukauf.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 18, why: 'Mildes Wetter erleichtert das Anwachsen.' },
      { when: ctx => ctx.weather.rainSoon, points: 10, why: 'Regen in Aussicht hilft frisch gesetzten Teilstücken.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'bulb-planting',
    title: 'Blumenzwiebeln setzen',
    description: 'Setze Frühlingszwiebeln in kleinen Gruppen. Pflanztiefe ist grob zwei- bis dreimal die Zwiebelhöhe.',
    duration: 30,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony'],
    months: [9, 10, 11],
    base: 54,
    tools: ['Pflanzschaufel', 'Zwiebeln'],
    why: 'Herbstpflanzung entscheidet über Farbe im nächsten Frühling.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Mildes Herbstwetter ist ideal zum Setzen.' }
    ],
    excludes: [ctx => ctx.weather.frostRisk === 'hoch' || ctx.weather.isRainingNow]
  },
  {
    id: 'bulb-foliage-care',
    title: 'Zwiebelblätter stehen lassen',
    description: 'Entferne nur verwelkte Blüten von Tulpen, Narzissen und Co. Das grüne Laub bleibt stehen, bis es gelb wird.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony'],
    months: [4, 5, 6],
    base: 50,
    tools: ['Schere'],
    why: 'Das Laub füllt die Zwiebeln für die nächste Saison wieder auf.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Eine kurze Pflegerunde passt gut in ruhiges Wetter.' }
    ]
  },
  {
    id: 'runner-control',
    title: 'Ausläufer begrenzen',
    description: 'Ziehe Ausläufer von Minze, Erdbeeren oder wuchernden Stauden dort heraus, wo sie Wege und Nachbarn bedrängen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'vegetable'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 47,
    tools: ['Handschuhe', 'Handgabel'],
    why: 'Frühes Begrenzen hält wüchsige Pflanzen freundlich statt dominant.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 12, why: 'Feuchter Boden macht Ausläufer leichter lösbar.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Ruhiges Wetter passt für genaue Handarbeit.' }
    ]
  },
  {
    id: 'tree-tie-check',
    title: 'Baumanbindungen lockern',
    description: 'Prüfe junge Bäume und Hochstämme. Lockere zu enge Bänder und ersetze scheuernde Stellen.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    base: 46,
    tools: ['Schnur', 'Schere'],
    why: 'Zu enge Bindungen schneiden schnell ein und schwächen junge Gehölze.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 18, why: 'Bei Wind muss Halt sicher sein, ohne einzuschneiden.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter ist gut für eine sorgfältige Kontrolle.' }
    ]
  },
  {
    id: 'path-sweep',
    title: 'Wege sauber kehren',
    description: 'Kehre Erde, Blütenreste und Schnittgut von der wichtigsten Wegstrecke. Danach wirkt der Garten sofort geordneter.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    base: 48,
    tools: ['Besen', 'Kehrblech'],
    why: 'Freie Wege verbessern den Eindruck und reduzieren Rutschstellen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Ruhiges Wetter passt für eine schnelle sichtbare Aufgabe.' },
      { when: ctx => ctx.weather.isWet, points: 8, why: 'Nach Regen sind rutschige Stellen besonders sichtbar.' }
    ]
  },
  {
    id: 'leaf-path-clear',
    title: 'Laub von Wegen nehmen',
    description: 'Räume nasses Laub von Stufen, Platten und Eingang. Das Laub darf als Mulch unter Sträucher wandern.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [9, 10, 11, 12],
    base: 54,
    tools: ['Rechen', 'Besen'],
    why: 'Nasses Laub auf Wegen wird schnell rutschig.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 20, why: 'Nasses Laub ist heute besonders rutschig.' },
      { when: ctx => ctx.weather.isWindy, points: 8, why: 'Vor Wind lohnt es sich, Wege einmal frei zu machen.' }
    ]
  },
  {
    id: 'soil-cover-winter',
    title: 'Offene Erde abdecken',
    description: 'Bedecke freie Erde dünn mit Laub, Kompost oder Pflanzenresten. Lass Kronen und Stängelansätze frei.',
    duration: 25,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'vegetable'],
    months: [10, 11, 12, 1, 2],
    base: 50,
    tools: ['Laub', 'Kompost', 'Rechen'],
    why: 'Bedeckter Boden verschlämmt weniger und bleibt lebendiger.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 14, why: 'Vor Frost schützt eine leichte Bodendecke.' },
      { when: ctx => ctx.weather.rainSoon, points: 10, why: 'Vor Regen hilft Abdeckung gegen Verschlämmung.' }
    ]
  },
  {
    id: 'spring-bed-clear',
    title: 'Beet vorsichtig freiräumen',
    description: 'Entferne nur matschige Reste und löse Laub von jungen Austrieben. Stabile Stängel dürfen noch stehen bleiben.',
    duration: 25,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard'],
    months: [2, 3, 4],
    base: 48,
    tools: ['Schere', 'Handschuhe'],
    why: 'Sanftes Freiräumen gibt Licht, ohne frühe Nützlinge unnötig zu stören.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Mildes Wetter macht frühe Beetpflege sinnvoll.' }
    ],
    excludes: [ctx => ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'compost-spread-bed',
    title: 'Kompost dünn verteilen',
    description: 'Verteile reifen Kompost dünn um Stauden oder Gemüseflächen und arbeite ihn nur oberflächlich ein.',
    duration: 30,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'vegetable'],
    months: [3, 4, 5, 9, 10],
    base: 48,
    tools: ['Kompost', 'Rechen'],
    why: 'Reifer Kompost füttert Bodenleben und verbessert die Bodenstruktur.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Mildes Wetter passt gut für Bodenpflege.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Leichter Regen kann Kompost sanft einschlämmen.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isRainingNow]
  },
  {
    id: 'climber-guide',
    title: 'Kletterpflanzen einleiten',
    description: 'Führe junge Triebe von Clematis, Bohnen, Wicken oder Geißblatt locker an Rankhilfe oder Schnur entlang.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['garden', 'small', 'frontyard', 'balcony', 'vegetable'],
    months: [4, 5, 6, 7, 8],
    base: 50,
    tools: ['Schnur', 'Pflanzclips'],
    why: 'Früh geführte Triebe brechen weniger und wachsen dorthin, wo sie hin sollen.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 16, why: 'Bei Wind brauchen junge Ranktriebe besonders guten Halt.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Ruhiges Wetter erleichtert feine Bindearbeit.' }
    ]
  },
  {
    id: 'salad-sow',
    title: 'Schnittsalat nachsäen',
    description: 'Säe eine kurze Reihe Schnittsalat dünn aus und halte sie gleichmäßig feucht. Im Sommer lieber halbschattig säen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [3, 4, 5, 6, 7, 8, 9],
    base: 50,
    tools: ['Saatgut', 'Gießkanne'],
    why: 'Kleine Folgesaaten liefern länger frische Blätter als eine große Aussaat.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Mildes Wetter hilft Salat beim Keimen.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Regen in Aussicht unterstützt gleichmäßige Feuchte.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'radish-sow',
    title: 'Radieschen aussäen',
    description: 'Säe Radieschen dünn in eine kurze Reihe oder einen Balkonkasten. Drücke die Erde leicht an und gieße fein.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [3, 4, 5, 8, 9],
    base: 52,
    tools: ['Saatgut', 'Gießkanne'],
    why: 'Radieschen sind schnelle Lückenfüller für kühle Wochen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Kühle bis milde Tage sind ideal für Radieschen.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Feuchte Tage unterstützen die Keimung.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'seedling-thin',
    title: 'Sämlinge vereinzeln',
    description: 'Ziehe zu dicht stehende Sämlinge vorsichtig heraus oder knipse sie ab. Die stärksten Pflanzen bekommen Platz.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [4, 5, 6, 7, 8, 9],
    base: 54,
    tools: ['Schere', 'Gießkanne'],
    why: 'Mehr Abstand bringt kräftigere Pflanzen und weniger Pilzdruck.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Mildes Wetter stresst junge Pflanzen weniger.' }
    ],
    excludes: [ctx => ctx.weather.isHot]
  },
  {
    id: 'veg-row-weed',
    title: 'Gemüsereihen jäten',
    description: 'Jäte nur eine Reihe oder ein Beetstück. Entferne Beikraut, solange es klein ist und Gemüse nicht bedrängt.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 52,
    tools: ['Handschuhe', 'Handhacke'],
    why: 'Kleine Jäterunden schonen Gemüse stärker als große Rettungsaktionen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Mildes Wetter ist angenehm für genaue Beetarbeit.' },
      { when: ctx => ctx.weather.isWet, points: 8, why: 'Feuchter Boden gibt kleine Wurzeln leichter frei.' }
    ]
  },
  {
    id: 'hoe-soil-crust',
    title: 'Bodenkruste lockern',
    description: 'Hacke die oberste Bodenschicht zwischen Gemüse flach auf. Arbeite nicht tief, damit Wurzeln ungestört bleiben.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [4, 5, 6, 7, 8, 9],
    base: 48,
    tools: ['Handhacke', 'Kultivator'],
    why: 'Eine lockere Oberfläche nimmt Wasser besser auf und bremst Verdunstung.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 18, why: 'Trockene Krusten lassen Wasser schlecht einsickern.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Bei mildem Wetter ist flaches Hacken stressarm.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'cucumber-tie',
    title: 'Gurken hochbinden',
    description: 'Leite Gurkentriebe locker an Schnur oder Rankgitter. Entferne keine großen Blätter ohne klaren Grund.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [5, 6, 7, 8],
    base: 52,
    tools: ['Schnur', 'Pflanzclips'],
    why: 'Geführte Gurken trocknen besser ab und Früchte bleiben sauberer.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 12, why: 'Nach feuchten Phasen hilft mehr Luft an den Trieben.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Ruhiges Wetter ist gut für feine Bindearbeit.' }
    ]
  },
  {
    id: 'zucchini-harvest',
    title: 'Zucchini jung ernten',
    description: 'Ernte kleine bis mittelgroße Zucchini und kontrolliere unter den Blättern. Zu große Früchte bremsen neue Ansätze.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [6, 7, 8, 9],
    base: 56,
    tools: ['Messer', 'Korb'],
    why: 'Regelmäßige Ernte hält Zucchini produktiv und zart.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 10, why: 'Bei Wärme wachsen Zucchini besonders schnell.' },
      { when: ctx => ctx.weather.isMild, points: 6, why: 'Ruhiges Wetter passt für eine schnelle Ernte.' }
    ]
  },
  {
    id: 'tomato-base-water',
    title: 'Tomaten bodennah gießen',
    description: 'Gieße Tomaten langsam direkt an die Erde und lasse die Blätter trocken. Mulch bleibt um den Stängel herum locker.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [5, 6, 7, 8, 9],
    base: 50,
    tools: ['Gießkanne'],
    why: 'Bodennahes Gießen versorgt Tomaten besser und reduziert Blattkrankheiten.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 28, why: 'Trockenheit macht gezieltes Gießen wichtig.' },
      { when: ctx => ctx.weather.isHot, points: 14, why: 'Hitze erhöht den Wasserbedarf stark.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'tomato-blight-leaf',
    title: 'Tomatenblätter auslichten',
    description: 'Entferne gelbe oder bodennahe Tomatenblätter, besonders wenn sie Erde berühren. Gesunde obere Blätter bleiben dran.',
    duration: 15,
    difficulty: 'Mittel',
    gardenTypes: ['vegetable', 'balcony'],
    months: [6, 7, 8, 9],
    base: 50,
    tools: ['Saubere Schere', 'Eimer'],
    why: 'Mehr Luft am unteren Bereich senkt das Risiko für Braunfäule.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 24, why: 'Feuchte Phasen erhöhen den Pilzdruck an Tomaten.' },
      { when: ctx => ctx.weather.rainSoon, points: 10, why: 'Vor Regen lohnt sich mehr Abstand zum Boden.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'potato-earth-up',
    title: 'Kartoffeln anhäufeln',
    description: 'Ziehe lockere Erde an Kartoffeltriebe, solange sie noch handlich sind. Blätter bleiben frei.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['vegetable'],
    months: [5, 6, 7],
    base: 50,
    tools: ['Hacke', 'Handschuhe'],
    why: 'Anhäufeln schützt Knollen vor Licht und fördert stabilere Pflanzen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Mildes Wetter passt gut für Bodenarbeit.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Regen kann die angehäufelte Erde setzen.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isHot]
  },
  {
    id: 'bean-guide',
    title: 'Bohnen anleiten',
    description: 'Wickle junge Bohnen vorsichtig in Wuchsrichtung um Stangen oder Schnüre. Lose Triebe bekommen Halt.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [5, 6, 7, 8],
    base: 50,
    tools: ['Schnur', 'Rankstab'],
    why: 'Früh angeleitete Bohnen finden schneller Halt und brechen seltener.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 16, why: 'Wind macht Halt für junge Triebe wichtiger.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Ruhiges Wetter erleichtert das Anleiten.' }
    ]
  },
  {
    id: 'brassica-net-check',
    title: 'Kohlnetz kontrollieren',
    description: 'Prüfe, ob das Netz dicht aufliegt und keine Blätter dagegen drücken. Schließe offene Ränder mit Steinen oder Klammern.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 52,
    tools: ['Klammern', 'Steine'],
    why: 'Ein dichtes Netz hält viele Schädlinge ab, ohne Pflanzen zu behandeln.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 18, why: 'Wind hebt Netze und öffnet Lücken.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter ist gut für eine kurze Kontrolle.' }
    ]
  },
  {
    id: 'carrot-cover-check',
    title: 'Möhren abdecken',
    description: 'Prüfe Vlies oder Kulturschutznetz über Möhren. Schließe Ränder und entferne Beikraut, das das Netz anhebt.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [4, 5, 6, 7, 8, 9],
    base: 48,
    tools: ['Vlies', 'Klammern'],
    why: 'Geschlossene Abdeckung hilft gegen Möhrenfliege und Austrocknung.',
    boosts: [
      { when: ctx => ctx.weather.isWindy, points: 16, why: 'Wind kann Abdeckungen lösen.' },
      { when: ctx => ctx.weather.isDry, points: 8, why: 'Abdeckung hält die Oberfläche gleichmäßiger feucht.' }
    ]
  },
  {
    id: 'herb-dry-harvest',
    title: 'Kräuter zum Trocknen schneiden',
    description: 'Schneide gesunde Kräutertriebe am Vormittag und bündle sie locker. Nasses oder krankes Material bleibt draußen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony', 'garden'],
    months: [5, 6, 7, 8, 9],
    base: 48,
    tools: ['Schere', 'Schnur'],
    why: 'Rechtzeitig geschnittene Kräuter behalten mehr Aroma.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Trocken-mildes Wetter ist gut für die Kräuterernte.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'lettuce-bolt-remove',
    title: 'Schießenden Salat räumen',
    description: 'Entferne bittere, schießende Salate und nutze den Platz für Nachsaat oder Mulch. Gesunde äußere Blätter kannst du noch ernten.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [5, 6, 7, 8],
    base: 46,
    tools: ['Messer', 'Eimer'],
    why: 'Schießender Salat blockiert Platz, ohne noch gute Ernte zu liefern.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 24, why: 'Hitze lässt Salat schnell schießen.' },
      { when: ctx => ctx.weather.isDry, points: 8, why: 'Trockenheit verstärkt Stress im Salatbeet.' }
    ]
  },
  {
    id: 'garlic-harvest-check',
    title: 'Knoblauch erntereif prüfen',
    description: 'Prüfe, ob ein Teil des Laubs gelb und trocken ist. Hebe eine Knolle testweise vorsichtig an.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [6, 7],
    base: 50,
    tools: ['Grabegabel', 'Korb'],
    why: 'Rechtzeitige Ernte verbessert Lagerfähigkeit und verhindert Aufplatzen.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 14, why: 'Trockenes Wetter ist gut für Knoblauchernte und Abtrocknen.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter passt für vorsichtiges Roden.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'spinach-autumn-sow',
    title: 'Spinat für den Herbst säen',
    description: 'Säe Spinat in eine kurze Reihe und gieße fein an. Bei Wärme wählst du einen kühleren, leicht schattigen Platz.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [8, 9, 10],
    base: 50,
    tools: ['Saatgut', 'Gießkanne'],
    why: 'Herbstspinat nutzt kühle Wochen und freie Beetflächen gut aus.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Mildes Herbstwetter hilft Spinat beim Keimen.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Regen kann die Saat gleichmäßig feucht halten.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'fleece-seedlings',
    title: 'Jungpflanzen mit Vlies schützen',
    description: 'Lege Vlies locker über frisch gesetzte oder junge Pflanzen und beschwere die Ränder. Blätter sollen nicht gequetscht werden.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [2, 3, 4, 5, 9, 10, 11],
    base: 46,
    tools: ['Vlies', 'Klammern'],
    why: 'Vlies puffert Kälte, Wind und starke Verdunstung.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 30, why: 'Die Tiefstwerte sprechen für Schutz junger Pflanzen.' },
      { when: ctx => ctx.weather.isWindy, points: 10, why: 'Wind trocknet Jungpflanzen schnell aus.' }
    ]
  },
  {
    id: 'greenhouse-ventilate',
    title: 'Gewächshaus lüften',
    description: 'Öffne Tür oder Fenster und entferne Kondenswasser an kritischen Stellen. Schließe rechtzeitig vor kalten Nächten.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'garden'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 46,
    tools: ['Tuch', 'Kein Werkzeug'],
    why: 'Luftbewegung reduziert Pilzdruck und Hitzestau.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 28, why: 'Hitze macht Lüften im geschützten Anbau wichtig.' },
      { when: ctx => ctx.weather.isWet, points: 12, why: 'Feuchte Luft erhöht Pilzdruck.' }
    ],
    excludes: [ctx => ctx.weather.isWindy || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'tomato-pollination',
    title: 'Tomatenblüten sanft rütteln',
    description: 'Rüttle mittags oder am frühen Nachmittag leicht an den Tomatenstäben. Das hilft der Bestäubung im geschützten Anbau.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [6, 7, 8],
    base: 44,
    tools: ['Kein Werkzeug'],
    why: 'Ein kurzes Rütteln kann bei stiller Luft den Fruchtansatz verbessern.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Trocken-mildes Wetter passt gut für Bestäubung.' },
      { when: ctx => ctx.weather.isHot, points: 8, why: 'Bei Hitze lohnt sich ein Blick auf Blüten und Fruchtansatz.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.isWet]
  },
  {
    id: 'seedbed-water',
    title: 'Saatbett feucht halten',
    description: 'Gieße frische Saat sehr fein und nur so viel, dass die Oberfläche gleichmäßig feucht bleibt.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Brause', 'Gießkanne'],
    why: 'Keimende Samen dürfen weder austrocknen noch verschlämmen.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 26, why: 'Trockenheit gefährdet frische Saat besonders schnell.' },
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Wärme trocknet Saatbeete rasch aus.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.rainSoon]
  },
  {
    id: 'tomato-mulch',
    title: 'Tomaten mulchen',
    description: 'Lege eine dünne Mulchschicht um Tomaten, aber nicht direkt an den Stängel. Vorher einmal gründlich gießen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable', 'balcony'],
    months: [5, 6, 7, 8],
    base: 48,
    tools: ['Mulch', 'Gießkanne'],
    why: 'Mulch hält Feuchtigkeit gleichmäßiger und reduziert Spritzwasser vom Boden.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 24, why: 'Trockenheit macht Mulch besonders wertvoll.' },
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Bei Hitze schützt Mulch die Wurzeln.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow]
  },
  {
    id: 'spent-crops-clear',
    title: 'Abgeerntete Pflanzen räumen',
    description: 'Räume eine abgeerntete Kultur ab und lasse gesunde Reste als Mulch oder Kompostmaterial weiterarbeiten.',
    duration: 25,
    difficulty: 'Einfach',
    gardenTypes: ['vegetable'],
    months: [6, 7, 8, 9, 10, 11],
    base: 48,
    tools: ['Schere', 'Eimer'],
    why: 'Freier Platz kann neu genutzt werden und kranke Reste bleiben nicht liegen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 10, why: 'Mildes Wetter passt für Aufräumen und Nachkultur.' },
      { when: ctx => ctx.weather.isWet, points: 8, why: 'Nach feuchten Phasen lohnt sich das Entfernen kranker Reste.' }
    ]
  },
  {
    id: 'lawn-deep-water',
    title: 'Rasen tief wässern',
    description: 'Wässere nur, wenn es wirklich nötig ist, dafür durchdringend und früh am Morgen. Kurzes tägliches Sprengen vermeidest du.',
    duration: 30,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [5, 6, 7, 8, 9],
    base: 42,
    tools: ['Regner', 'Schlauch'],
    why: 'Selteneres, tiefes Wässern fördert tiefere Wurzeln.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 30, why: 'Trockenheit macht durchdringendes Wässern sinnvoller als kurze Sprengerläufe.' },
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Hitze erhöht den Wasserbedarf, besonders auf leichten Böden.' }
    ],
    excludes: [ctx => ctx.weather.rainSoon || ctx.weather.isRainingNow]
  },
  {
    id: 'lawn-footprint-check',
    title: 'Rasen-Trockenheit prüfen',
    description: 'Tritt über den Rasen und prüfe, ob Halme liegen bleiben. Bleibende Fußspuren zeigen Trockenstress.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [5, 6, 7, 8, 9],
    base: 46,
    tools: ['Kein Werkzeug'],
    why: 'Der Fußspuren-Test verhindert unnötiges oder zu spätes Wässern.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 24, why: 'Nach trockenen Tagen ist ein echter Bedarfstest sinnvoll.' },
      { when: ctx => ctx.weather.isHot, points: 12, why: 'Bei Hitze kippt Rasen schneller in Stress.' }
    ]
  },
  {
    id: 'lawn-clippings-rake',
    title: 'Schnittgutnester verteilen',
    description: 'Reche dicke Schnittgutklumpen auseinander oder nimm sie ab. Fein verteiltes Material darf liegen bleiben.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [4, 5, 6, 7, 8, 9, 10],
    base: 48,
    tools: ['Rechen'],
    why: 'Dicke Nester ersticken Gras und fördern gelbe Flecken.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 14, why: 'Feuchtes Schnittgut verklumpt schneller.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter eignet sich gut für eine kurze Korrektur.' }
    ]
  },
  {
    id: 'lawn-aerate-small',
    title: 'Verdichtete Stelle lüften',
    description: 'Stich eine kleine verdichtete Stelle mit der Grabegabel ein und bewege sie leicht. Danach Sand oder Kompost dünn einrechen.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 9, 10],
    base: 46,
    tools: ['Grabegabel', 'Sand'],
    why: 'Lokales Lüften hilft dort, wo Wasser steht oder Gras schlecht wächst.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Mildes Wetter ist ideal für Rasenregeneration.' },
      { when: ctx => ctx.weather.isWet, points: 8, why: 'Nach Regen erkennst du verdichtete Stellen gut.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'lawn-spring-feed',
    title: 'Rasen moderat düngen',
    description: 'Dünge gleichmäßig und eher sparsam. Danach sollte Regen kommen oder du wässerst leicht ein.',
    duration: 30,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 9],
    base: 46,
    tools: ['Rasendünger', 'Streuwagen'],
    why: 'Gezielte Nährstoffe helfen Rasen in Wachstumsphasen dichter zu werden.',
    boosts: [
      { when: ctx => ctx.weather.rainSoon, points: 18, why: 'Regen in Aussicht hilft beim Einwaschen.' },
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Mildes Wetter passt besser zum Düngen als Hitze.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isDry || ctx.weather.isRainingNow]
  },
  {
    id: 'lawn-leaf-clear',
    title: 'Laub vom Rasen nehmen',
    description: 'Reche Laub von der Rasenfläche und nutze es unter Sträuchern oder im Kompost. Eine dünne Spur ist okay, Matten nicht.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [9, 10, 11, 12],
    base: 56,
    tools: ['Laubrechen', 'Korb'],
    why: 'Dicke Laubdecken nehmen Rasen Licht und Luft.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 16, why: 'Nasses Laub bildet schnell dichte Matten.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter macht Laubarbeit leichter.' }
    ]
  },
  {
    id: 'lawn-moss-rake',
    title: 'Moosstelle ausrechen',
    description: 'Reche eine kleine Moosstelle aus und lockere den Boden leicht. Große Flächen hebst du dir für ein eigenes Zeitfenster auf.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 9, 10],
    base: 44,
    tools: ['Rechen', 'Handvertikutierer'],
    why: 'Kleine Moosstellen lassen sich gut behandeln, bevor sie größer werden.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 16, why: 'Mildes Wetter hilft dem Rasen bei der Erholung.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isDry || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'lawn-wildflower-edge',
    title: 'Blühkante im Rasen anlegen',
    description: 'Markiere einen schmalen Rand, den du seltener mähst. Entferne dort nur grobe Störer und lass Blüten stehen.',
    duration: 20,
    difficulty: 'Einfach',
    gardenTypes: ['lawn', 'frontyard', 'garden'],
    months: [4, 5, 6],
    base: 44,
    tools: ['Schnur', 'Steckmarke'],
    why: 'Eine kleine Blühkante bringt Leben in den Rasen, ohne die ganze Fläche umzustellen.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 12, why: 'Mildes Wetter ist gut für kleine Gestaltungsarbeiten.' }
    ]
  },
  {
    id: 'lawn-repair-edge',
    title: 'Rasenkante nachfüllen',
    description: 'Fülle abgesackte Kanten mit Erde-Sand-Gemisch auf und drücke sie leicht an. Danach fein wässern.',
    duration: 25,
    difficulty: 'Mittel',
    gardenTypes: ['lawn', 'frontyard', 'garden'],
    months: [3, 4, 5, 9, 10],
    base: 46,
    tools: ['Erde', 'Sand', 'Rechen'],
    why: 'Stabile Kanten erleichtern Mähen und sehen sauber aus.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 14, why: 'Mildes Wetter hilft Gras an reparierten Rändern.' },
      { when: ctx => ctx.weather.rainSoon, points: 8, why: 'Regen unterstützt das Anwachsen.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'lawn-winter-rest',
    title: 'Rasen im Winter schonen',
    description: 'Meide unnötige Wege über gefrorenen oder sehr nassen Rasen. Stelle Töpfe und Möbel nicht dauerhaft auf die Fläche.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [1, 2, 11, 12],
    base: 42,
    tools: ['Kein Werkzeug'],
    why: 'Gefrorene und nasse Halme brechen leicht und erholen sich langsam.',
    boosts: [
      { when: ctx => ctx.weather.frostRisk !== 'niedrig', points: 28, why: 'Frostgefahr macht Betreten für den Rasen riskanter.' },
      { when: ctx => ctx.weather.isWet, points: 12, why: 'Nasser Boden verdichtet schnell.' }
    ]
  },
  {
    id: 'lawn-scarify-window',
    title: 'Vertikutierfenster prüfen',
    description: 'Prüfe, ob der Rasen trocken, im Wachstum und nicht gestresst ist. Vertikutiere heute nur eine kleine Testfläche.',
    duration: 30,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [4, 5, 9],
    base: 42,
    tools: ['Vertikutierer', 'Rechen'],
    why: 'Vertikutieren hilft nur, wenn der Rasen danach gut regenerieren kann.',
    boosts: [
      { when: ctx => ctx.weather.isMild, points: 18, why: 'Mildes Wetter ist entscheidend für Erholung nach dem Vertikutieren.' }
    ],
    excludes: [ctx => ctx.weather.isHot || ctx.weather.isDry || ctx.weather.isWet || ctx.weather.isRainingNow || ctx.weather.frostRisk === 'hoch']
  },
  {
    id: 'lawn-dandelion-remove',
    title: 'Löwenzahn ausstechen',
    description: 'Stich einzelne Rosetten mit möglichst viel Wurzel aus. Fülle größere Löcher direkt mit Erde nach.',
    duration: 15,
    difficulty: 'Einfach',
    gardenTypes: ['lawn', 'frontyard'],
    months: [3, 4, 5, 6, 9, 10],
    base: 48,
    tools: ['Unkrautstecher', 'Eimer'],
    why: 'Einzelne Rosetten sind leicht zu entfernen, bevor sie sich versamen.',
    boosts: [
      { when: ctx => ctx.weather.isWet, points: 14, why: 'Feuchter Boden gibt Pfahlwurzeln leichter frei.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter passt für kleine Rasenpflege.' }
    ]
  },
  {
    id: 'lawn-high-cut-before-heat',
    title: 'Mähhöhe vor Hitze anheben',
    description: 'Stelle den Mäher höher ein oder notiere die neue Höhe für den nächsten Schnitt. Kurzer Rasen leidet bei Hitze stärker.',
    duration: 5,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [5, 6, 7, 8, 9],
    base: 44,
    tools: ['Rasenmäher'],
    why: 'Höherer Rasen beschattet den Boden und bleibt robuster.',
    boosts: [
      { when: ctx => ctx.weather.isHot, points: 30, why: 'Hitze spricht klar für eine höhere Mähstufe.' },
      { when: ctx => ctx.weather.isDry, points: 16, why: 'Trockenheit macht kurze Schnitte riskant.' }
    ]
  },
  {
    id: 'lawn-seed-keep-moist',
    title: 'Nachsaat feucht halten',
    description: 'Kontrolliere nachgesäte Stellen und gieße fein, wenn die Oberfläche trocken ist. Keimende Saat darf nicht austrocknen.',
    duration: 10,
    difficulty: 'Einfach',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 9, 10],
    base: 48,
    tools: ['Gießkanne', 'Brause'],
    why: 'Gleichmäßige Feuchte entscheidet über den Erfolg von Nachsaat.',
    boosts: [
      { when: ctx => ctx.weather.isDry, points: 24, why: 'Trockenes Wetter gefährdet frische Nachsaat.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Mildes Wetter unterstützt Keimung.' }
    ],
    excludes: [ctx => ctx.weather.isRainingNow || ctx.weather.rainSoon]
  },
  {
    id: 'mower-blade-check',
    title: 'Mähmesser kontrollieren',
    description: 'Prüfe, ob das Messer sauber und nicht sichtbar beschädigt ist. Für Schärfen oder Wechsel trennst du den Mäher sicher vom Strom.',
    duration: 15,
    difficulty: 'Mittel',
    gardenTypes: ['lawn'],
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    base: 44,
    tools: ['Handschuhe', 'Bürste'],
    why: 'Scharfe Messer schneiden sauberer und stressen den Rasen weniger.',
    boosts: [
      { when: ctx => ctx.weather.isRainingNow, points: 12, why: 'Bei Regen ist Wartung sinnvoller als Mähen.' },
      { when: ctx => ctx.weather.isMild, points: 8, why: 'Vor der nächsten Mährunde lohnt ein kurzer Check.' }
    ]
  }
]);

const state = {
  minutes: 20,
  selectedTypes: new Set(['garden']),
  location: CITY_PRESETS.berlin,
  weather: null,
  busy: false,
  hasGenerated: false
};

const elements = {
  todayLabel: document.getElementById('todayLabel'),
  flowSignal: document.getElementById('flowSignal'),
  gardenSummary: document.getElementById('gardenSummary'),
  locationSummary: document.getElementById('locationSummary'),
  plannerForm: document.getElementById('plannerForm'),
  timeButtons: [...document.querySelectorAll('.time-option')],
  customMinutes: document.getElementById('customMinutes'),
  minutesFeedback: document.getElementById('minutesFeedback'),
  typeInputs: [...document.querySelectorAll('input[name="gardenType"]')],
  citySelect: document.getElementById('citySelect'),
  cityInput: document.getElementById('cityInput'),
  useGps: document.getElementById('useGps'),
  searchCity: document.getElementById('searchCity'),
  generateButton: document.getElementById('generateButton'),
  generateButtonIcon: document.getElementById('generateButtonIcon'),
  generateButtonLabel: document.getElementById('generateButtonLabel'),
  regenerateButton: document.getElementById('regenerateButton'),
  statusLine: document.getElementById('statusLine'),
  resultsPanel: document.getElementById('resultsPanel'),
  contextLabel: document.getElementById('contextLabel'),
  resultTitle: document.getElementById('resultTitle'),
  resultSummary: document.getElementById('resultSummary'),
  taskList: document.getElementById('taskList'),
  emptyState: document.getElementById('emptyState'),
  weatherDetails: document.getElementById('weatherDetails'),
  weatherSummary: document.getElementById('weatherSummary'),
  tempValue: document.getElementById('tempValue'),
  rainPastValue: document.getElementById('rainPastValue'),
  rainFutureValue: document.getElementById('rainFutureValue'),
  windValue: document.getElementById('windValue'),
  frostValue: document.getElementById('frostValue'),
  emptyKicker: document.getElementById('emptyKicker'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptyText: document.getElementById('emptyText')
};

function init() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  elements.timeButtons.forEach(button => button.addEventListener('click', () => selectMinutes(Number(button.dataset.minutes))));
  elements.customMinutes.addEventListener('input', handleCustomMinutes);
  elements.customMinutes.addEventListener('blur', normalizeCustomMinutes);
  elements.typeInputs.forEach(input => input.addEventListener('change', handleGardenTypes));
  elements.citySelect.addEventListener('change', handlePresetCity);
  elements.useGps.addEventListener('click', useGeolocation);
  elements.searchCity.addEventListener('click', searchCity);
  elements.plannerForm.addEventListener('submit', event => {
    event.preventDefault();
    generateRecommendations();
  });
  elements.regenerateButton.addEventListener('click', generateRecommendations);

  updateTimeButtons();
  updateSettingsSummary();
  renderWeather(null);
  renderIntroState();
}

function selectMinutes(minutes) {
  state.minutes = minutes;
  elements.customMinutes.value = '';
  elements.minutesFeedback.textContent = '';
  updateTimeButtons();
  updateFlowSignal();
}

function handleCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  const minutes = Number(rawValue);

  if (!rawValue) {
    elements.minutesFeedback.textContent = '';
    updateTimeButtons();
    return;
  }

  if (!Number.isFinite(minutes) || minutes < 5) {
    elements.minutesFeedback.textContent = 'Mindestens 5 Minuten.';
    elements.timeButtons.forEach(button => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    return;
  }

  state.minutes = Math.min(minutes, 180);
  elements.minutesFeedback.textContent = minutes > 180
    ? 'Maximal 180 Minuten. Ich rechne mit 180.'
    : '';
  updateTimeButtons();
  updateFlowSignal();
}

function normalizeCustomMinutes() {
  const rawValue = elements.customMinutes.value.trim();
  if (!rawValue) return;

  const minutes = Number(rawValue);
  if (!Number.isFinite(minutes)) return;

  if (minutes < 5) {
    elements.customMinutes.value = '5';
    state.minutes = 5;
    elements.minutesFeedback.textContent = 'Ich rechne mit 5 Minuten.';
  }

  if (minutes > 180) {
    elements.customMinutes.value = '180';
    state.minutes = 180;
    elements.minutesFeedback.textContent = 'Ich rechne mit maximal 180 Minuten.';
  }

  updateTimeButtons();
  updateFlowSignal();
}

function handleGardenTypes(event) {
  const checked = elements.typeInputs.filter(input => input.checked);
  if (!checked.length) {
    event.target.checked = true;
    setStatus('Wähle mindestens einen Gartentyp.');
    return;
  }

  state.selectedTypes = new Set(checked.map(input => input.value));
  updateSettingsSummary();
}

function handlePresetCity() {
  const value = elements.citySelect.value;
  if (value === 'custom') {
    elements.cityInput.focus();
    return;
  }

  state.location = CITY_PRESETS[value];
  updateSettingsSummary();
  setStatus(`${state.location.label} ist ausgewählt.`);
}

async function searchCity() {
  const query = elements.cityInput.value.trim();
  if (query.length < 2) {
    setStatus('Bitte gib mindestens zwei Zeichen ein.');
    return;
  }

  setBusy(true, 'Suche Stadt...');
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({
      name: query,
      count: '1',
      language: 'de',
      format: 'json'
    }).toString();

    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding nicht erreichbar');

    const data = await response.json();
    const match = data.results?.[0];
    if (!match) {
      setStatus('Diese Stadt habe ich nicht gefunden.');
      return;
    }

    state.location = {
      label: [match.name, match.admin1, match.country_code].filter(Boolean).join(', '),
      latitude: match.latitude,
      longitude: match.longitude
    };
    elements.citySelect.value = 'custom';
    updateSettingsSummary();
    setStatus(`${state.location.label} ist ausgewählt.`);
    setBusy(false);
    await generateRecommendations();
  } catch (error) {
    setStatus('Die Stadtsuche ist gerade nicht erreichbar.');
  } finally {
    setBusy(false);
  }
}

function useGeolocation() {
  if (!navigator.geolocation) {
    setStatus('GPS ist in diesem Browser nicht verfügbar.');
    return;
  }

  setBusy(true, 'Warte auf Standortfreigabe...');
  navigator.geolocation.getCurrentPosition(
    async position => {
      state.location = {
        label: 'Aktueller Standort',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      elements.citySelect.value = 'custom';
      updateSettingsSummary();
      setStatus('Standort übernommen. Die Koordinaten bleiben nur in dieser Sitzung.');
      setBusy(false);
      await generateRecommendations();
    },
    () => {
      setStatus('Standort nicht freigegeben. Du kannst stattdessen eine Stadt nutzen.');
      setBusy(false);
    },
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 0 }
  );
}

async function generateRecommendations() {
  if (state.busy) return;

  setBusy(true, 'Lade Wetter und berechne Aufgaben...');
  try {
    state.weather = await fetchWeather(state.location);
    setStatus(`Wetter für ${state.location.label} geladen.`);
  } catch (error) {
    state.weather = fallbackWeather();
    setStatus('Wetterdienst nicht erreichbar. Ich nutze einen saisonalen Fallback.');
  }

  const context = buildContext();
  const tasks = selectTasks(context);
  state.hasGenerated = true;
  renderWeather(state.weather);
  renderTasks(tasks, context);
  setBusy(false);
  revealResults();
}

async function fetchWeather(location) {
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

  const response = await fetch(url);
  if (!response.ok) throw new Error('Wetter nicht erreichbar');

  return normalizeWeather(await response.json());
}

function normalizeWeather(data) {
  const today = data.current?.time?.slice(0, 10) || new Date().toISOString().slice(0, 10);
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

function fallbackWeather() {
  const month = new Date().getMonth() + 1;
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

function buildContext() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    minutes: state.minutes,
    selectedTypes: [...state.selectedTypes],
    location: state.location,
    weather: state.weather
  };
}

function selectTasks(context) {
  const scored = TASKS
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

function scoreTask(task, context) {
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

function priorityForScore(score) {
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

function isCalmDay(context) {
  const weather = context.weather;
  return weather.isMild &&
    !weather.isDry &&
    !weather.isWet &&
    !weather.isWindy &&
    !weather.rainSoon &&
    weather.frostRisk === 'niedrig';
}

function renderIntroState() {
  updateFlowSignal();
  updateSettingsSummary();
  elements.contextLabel.textContent = `${state.location.label} · ${state.minutes} Minuten`;
  elements.resultTitle.textContent = 'Bereit für deine Aufgabe';
  elements.resultSummary.textContent = 'Wähle dein Zeitfenster und starte mit einem Klick.';
  elements.regenerateButton.hidden = true;
  elements.weatherDetails.hidden = true;
  elements.emptyKicker.textContent = 'Startbereit';
  elements.emptyTitle.textContent = 'Wähle dein Zeitfenster und starte.';
  elements.emptyText.textContent = `${state.location.label} ist vorausgewählt; Standortfreigabe ist optional.`;
  elements.taskList.replaceChildren();
  elements.emptyState.classList.add('is-visible');
}

function renderWeather(weather) {
  if (!weather) {
    elements.tempValue.textContent = '--';
    elements.rainPastValue.textContent = '--';
    elements.rainFutureValue.textContent = '--';
    elements.windValue.textContent = '--';
    elements.frostValue.textContent = '--';
    elements.weatherSummary.textContent = 'Wetterdetails anzeigen';
    return;
  }

  elements.tempValue.textContent = `${Math.round(weather.temperature)} °C`;
  elements.rainPastValue.textContent = `${Math.round(weather.pastRain)} mm`;
  elements.rainFutureValue.textContent = `${Math.round(weather.forecastRain)} mm`;
  elements.windValue.textContent = `${Math.round(weather.wind)} km/h`;
  elements.frostValue.textContent = weather.frostRisk;
  elements.weatherSummary.textContent = weatherSummaryText(weather);
}

function renderTasks(tasks, context) {
  const typeText = context.selectedTypes.map(type => GARDEN_LABELS[type]).join(', ');
  const sourceText = context.weather.source === 'Open-Meteo' ? 'Wetter' : 'Saison';
  elements.contextLabel.textContent = `${context.location.label} · ${context.minutes} Minuten · ${sourceText}`;
  elements.resultTitle.textContent = tasks.length
    ? `${context.minutes} Minuten in ${context.location.label}`
    : 'Heute nichts Dringendes';
  elements.resultSummary.textContent = tasks.length
    ? `Zuerst: ${tasks[0].task.title}. ${tasks[0].reason}`
    : 'Heute darf der Garten einfach Garten sein. Wenn sich Wetter oder Zeitfenster ändern, rechnen wir neu.';
  elements.regenerateButton.hidden = false;
  elements.weatherDetails.hidden = false;
  elements.emptyKicker.textContent = 'Nichts-Tun-Modus';
  elements.emptyTitle.textContent = 'Heute gibt es nichts Dringendes. Genieße deinen Garten.';
  elements.emptyText.textContent = 'Wenn sich Wetter oder Zeitfenster ändern, berechnen wir die Vorschläge neu.';
  elements.taskList.replaceChildren(...tasks.map((item, index) => createTaskCard(item, index)));
  elements.emptyState.classList.toggle('is-visible', !tasks.length);

  if (tasks.length) {
    setStatus(`${tasks.length} Vorschläge für ${typeText}.`);
  } else {
    setStatus(`Keine dringenden Aufgaben für ${typeText}.`);
  }
}

function createTaskCard(item, index = 0) {
  const article = document.createElement('article');
  article.className = `task-card ${item.priority.className}${index === 0 ? ' is-featured' : ''}`;
  article.dataset.taskId = item.task.id;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'task-eyebrow';
  eyebrow.textContent = index === 0 ? 'Jetzt zuerst' : 'Weitere Aufgabe';

  const meta = document.createElement('div');
  meta.className = 'task-top';
  meta.append(
    pill(item.priority.label, 'priority-pill'),
    pill(`${item.task.duration} min`, 'task-pill'),
    pill(item.task.difficulty, 'task-pill')
  );

  const title = document.createElement('h3');
  title.textContent = item.task.title;

  const reason = document.createElement('p');
  reason.className = 'task-reason';
  reason.textContent = item.reason;

  const more = document.createElement('details');
  more.className = 'task-more';

  const moreSummary = document.createElement('summary');
  moreSummary.textContent = 'Details';

  const details = document.createElement('dl');
  details.className = 'task-details';
  details.append(
    detailBlock('Aufgabe', item.task.description),
    detailBlock('Priorität', item.priority.meaning),
    detailBlock('Werkzeug', item.task.tools.join(', '))
  );
  more.append(moreSummary, details);

  const content = document.createElement('div');
  content.className = 'task-content';
  content.append(eyebrow, meta, title, reason, more);

  const action = document.createElement('div');
  action.className = 'task-action';

  const doneButton = document.createElement('button');
  doneButton.className = 'task-done';
  doneButton.type = 'button';
  doneButton.setAttribute('aria-pressed', 'false');

  const doneIcon = document.createElement('span');
  doneIcon.setAttribute('aria-hidden', 'true');
  doneIcon.textContent = '✓';

  const doneLabel = document.createElement('span');
  doneLabel.textContent = 'Erledigt markieren';

  doneButton.append(doneIcon, doneLabel);
  doneButton.addEventListener('click', () => {
    const isDone = article.classList.toggle('is-done');
    doneButton.setAttribute('aria-pressed', String(isDone));
    doneLabel.textContent = isDone ? 'Erledigt' : 'Erledigt markieren';
    more.open = !isDone && more.open;
  });

  action.append(doneButton);
  article.append(content, action);
  return article;
}

function pill(text, className) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function detailBlock(term, description) {
  const wrapper = document.createElement('div');
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = term;
  dd.textContent = description;
  wrapper.append(dt, dd);
  return wrapper;
}

function setBusy(isBusy, message) {
  state.busy = isBusy;
  elements.generateButton.disabled = isBusy;
  elements.generateButton.classList.toggle('is-loading', isBusy);
  elements.generateButtonIcon.textContent = isBusy ? '↻' : '→';
  elements.generateButtonLabel.textContent = isBusy ? 'Berechne...' : 'Aufgabe finden';
  elements.regenerateButton.disabled = isBusy;
  elements.useGps.disabled = isBusy;
  elements.searchCity.disabled = isBusy;
  if (message) setStatus(message);
}

function setStatus(message) {
  elements.statusLine.textContent = message;
}

function updateFlowSignal() {
  elements.flowSignal.textContent = `${state.minutes} min`;
  if (!state.hasGenerated) {
    elements.contextLabel.textContent = `${state.location.label} · ${state.minutes} Minuten`;
  }
}

function updateTimeButtons() {
  elements.timeButtons.forEach(button => {
    const isActive = Number(button.dataset.minutes) === state.minutes && !elements.customMinutes.value.trim();
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateSettingsSummary() {
  const selectedLabels = [...state.selectedTypes].map(type => GARDEN_LABELS[type]);
  const firstType = selectedLabels[0] || 'Garten';
  const typeText = selectedLabels.length > 1
    ? `${firstType} +${selectedLabels.length - 1}`
    : firstType;

  elements.gardenSummary.textContent = typeText;
  elements.locationSummary.textContent = state.location.label;
}

function weatherSummaryText(weather) {
  const rainText = weather.isDry
    ? 'trocken'
    : weather.isWet
      ? 'feucht'
      : `${Math.round(weather.forecastRain)} mm Regenprognose`;
  const windText = weather.isWindy ? ', windig' : '';
  const sourceText = weather.source === 'Open-Meteo' ? 'Wetter' : 'Saison-Fallback';

  return `${sourceText}: ${Math.round(weather.temperature)} °C, ${rainText}${windText}. Details anzeigen`;
}

function revealResults() {
  requestAnimationFrame(() => {
    elements.resultTitle.focus({ preventScroll: true });
    elements.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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

init();
