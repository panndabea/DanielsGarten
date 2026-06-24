# PRD – Gartenzeit

## Product Name

Gartenzeit

## Tagline

Sag uns, wie viel Zeit du hast. Wir sagen dir, was sich heute im Garten lohnt.

---

# Vision

Gartenzeit ist ein radikal einfacher Garten-Coach.

Der Nutzer muss keine Pflanzen erfassen, kein Konto anlegen und keine Daten pflegen.

Die einzige Frage lautet:

"Wie viel Zeit hast du?"

Basierend auf Jahreszeit, Wetter und Gartentyp erhält der Nutzer konkrete Aufgaben für sein verfügbares Zeitfenster.

Die App soll sich anfühlen wie ein erfahrener Nachbar, der genau weiß, welche Gartenarbeit sich heute wirklich lohnt.

---

# Problem Statement

Die meisten Garten-Apps verlangen:

* Pflanzen erfassen
* Beete anlegen
* Garten dokumentieren
* Pflegepläne verwalten

Die meisten Menschen möchten jedoch lediglich wissen:

"Ich habe 20 Minuten Zeit. Was sollte ich jetzt tun?"

---

# Core User Story

Als Gartenbesitzer möchte ich meine verfügbare Zeit angeben und sofort sinnvolle Gartenaufgaben erhalten, ohne etwas konfigurieren zu müssen.

---

# Product Principles

## Zero Setup

Keine Registrierung.

Keine Pflanzendatenbank.

Keine Gartenverwaltung.

---

## Action First

Keine langen Texte.

Keine Lexikonartikel.

Sofort konkrete Aufgaben.

---

## Privacy First

Alle Daten bleiben lokal im Browser.

Keine Accounts.

Keine Cloud.

---

## Calm Technology

Die App darf auch sagen:

"Heute gibt es nichts Dringendes."

---

# Target Platform

Responsive Web App.

Mobile First.

Funktioniert auf:

* iPhone Safari
* Android Chrome
* Desktop Browser

Keine Backend-Abhängigkeit für MVP.

---

# MVP Features

## 1. Zeitauswahl

Startscreen zeigt:

* 10 Minuten
* 20 Minuten
* 30 Minuten
* 60 Minuten

Optional:

* Freie Eingabe

---

## 2. Gartentyp

Nutzer wählt:

* Balkon
* Kleiner Garten
* Garten
* Gemüsegarten
* Vorgarten
* Rasenfläche

Mehrfachauswahl möglich.

---

## 3. Standort

Option A:

GPS erlauben.

Option B:

Stadt auswählen.

Die App speichert nichts dauerhaft.

---

## 4. Wetterintegration

Kostenlose Wetter-API.

Benötigte Daten:

* Temperatur
* Niederschlag letzte 7 Tage
* Niederschlagsprognose
* Wind
* Frostwahrscheinlichkeit

---

## 5. Aufgaben-Engine

Regelbasierte Engine.

Keine KI notwendig.

Input:

* Monat
* Wetter
* Zeitbudget
* Gartentyp

Output:

3–5 Aufgaben.

---

## 6. Aufgabenkarte

Jede Aufgabe enthält:

Titel

Beispiel:

"Tomaten ausgeizen"

Geschätzte Dauer

Beispiel:

5 Minuten

Schwierigkeit

* Einfach
* Mittel
* Anspruchsvoll

Warum jetzt?

Kurze Erklärung.

Benötigte Werkzeuge

Beispiel:

* Gartenschere

---

## 7. Priorisierung

Aufgaben erhalten:

* Hoch
* Mittel
* Niedrig

Der Nutzer sieht immer zuerst die wichtigsten Aufgaben.

---

## 8. Nichts-Tun-Modus

Wenn keine sinnvolle Aufgabe vorliegt:

"Heute gibt es nichts Dringendes. Genieße deinen Garten."

---

# Data Model

Task

* id
* title
* description
* duration
* difficulty
* season
* gardenTypes
* weatherConditions
* priority

GardenType

* balcony
* garden
* vegetable
* lawn
* frontyard

---

# UX Flow

Landing

↓

Zeit auswählen

↓

Gartentyp auswählen

↓

Standort erlauben oder Stadt wählen

↓

Aufgaben generieren

↓

Aufgabenkarten anzeigen

↓

Neue Vorschläge generieren

---

# Design Requirements

Modern, minimalistisch.

Inspiriert von:

* Linear
* Raycast
* Notion Calendar
* Apple Human Interface Guidelines

Design Eigenschaften:

* große Typografie
* viel Weißraum
* sanfte Animationen
* Glas- und Blur-Effekte sparsam
* dunkler und heller Modus
* mobile first

---

# Non Goals

Nicht Teil von MVP:

* Accounts
* Login
* Pflanzenverwaltung
* Fotoanalyse
* KI-Chat
* Satellitendaten
* Erinnerungen
* Community
* Social Features
* Shop
* Gamification

---

# Success Metrics

MVP erfolgreich wenn:

* Nutzer erhalten erste Aufgabe in unter 10 Sekunden
* 80 % der Nutzer erreichen den Ergebnisbildschirm
* Durchschnittlich mindestens 2 Aufgabenkarten pro Session geöffnet
* Nutzer bewerten die Vorschläge als hilfreich

---

# Future Versions

V2

* Pflanzen-Fotoanalyse
* Personalisierte Aufgaben
* Erinnerungen

V3

* Gartenmodell
* Wetterhistorie
* Standortbasierte Empfehlungen
* Satellitendaten
* Lokale Bodeninformationen
