# Tagebuch — mehanicar-Mitarbeiter

Neueste Einträge oben.

## 01.10.2026 — Version 2.30: Starke Suchleiste, Scheibe 1
- **Recherche (a) Konkurrenz:** Aktuelle Werkstattsoftware (SmartWerkstatt, easyWerkstatt, Zeitmechanik) hat als Standard: digitale Annahme mit Schadensfotos, Kundenportal, in dem der Kunde Zusatzarbeiten inkl. Video-Check freigibt, Live-Status für das Büro. → C-Idee „Kunden-Statusseite“ geschärft. Quellen: fuer-gruender.de (Vergleich 09/2026), smartwerkstatt.cloud.
- **Gebaut:** Lupe (44 px) im Kopf aller Hauptseiten, außerdem Strg/⌘+K oder „/“ am Desktop. Öffnet eine Vollbild-Suche mit Live-Treffern, gruppiert nach Kunden, Fahrzeugen und Aufträgen (je max. 8). Kennzeichen werden ohne Leerzeichen und Bindestrich verglichen („sm247“ findet „HU-SM 247“), mehrere Wörter müssen alle passen. Enter öffnet den ersten Treffer, Esc schließt. Code: `gSucheTreffer`/`openSuche` nach `closeSheet`.
- **Test:** Smoke-Test grün (390/1280), sucht „sm247“, prüft die Gruppen, kein horizontales Scrollen, Treffer öffnet die Akte. SW v31.
- **Offen / nächster Handgriff:** Scheibe 2: weitere Gruppen in `gSucheTreffer` (Positionen → Auftrag, Rechnungen, Termine, Anfragen, Lager).

## 30.09.2026 (4. Lauf) — Version 2.29: Kalk-Kopf PRO, Scheibe 3 (Feinschliff)
- **Recherche:** entfallen (Folgelauf am selben Tag).
- **Gebaut:** Rabatt-Schnellwahl 0/5/10 % auf den Auftrag direkt in der Detail-Kalkulation (`ACT['orab-q']`, 44-px-Knöpfe, eigene Zeile). „Bereits abgerechnet“ nutzt jetzt die echten Rechnungsbeträge (`S.rechnungen` mit `auftragId`), bei Altdaten ohne Rechnung den abgeleiteten Wert. Passt Brutto − Abgerechnetes nicht zum offenen Betrag (Rabatt nach Teilabrechnung geändert), erscheint ein kurzer Hinweis. Hell-Modus per Screenshot geprüft.
- **Test:** Smoke-Test grün (390/1280), klickt jetzt 10 % und prüft Rabatt + Kopf, setzt danach zurück. SW v30.
- **Kalk-Kopf PRO (A2) damit abgeschlossen.**
- **Offen / nächster Handgriff:** Backlog A3 „Starke Suchleiste“, Scheibe 1: Suchfeld (Lupe im Kopf) + Treffer über Kunden, Fahrzeuge (auch „tr51“), Aufträge, gruppiert und antippbar. Vorlage `designs/jarvis/05-befehlszeile.html`.

## 30.09.2026 (3. Lauf) — Version 2.28: Kalk-Kopf PRO, Scheibe 2 (Detail-Kalkulation)
- **Recherche:** entfallen (Folgelauf am selben Tag).
- **Gebaut:** Neue Hilfsfunktion `ordKalk(a)` (nach TEST-END), die Kopf und Detail gemeinsam nutzen. Im Modus „Kalkulation“ steht oben die Detail-Kalkulation: Arbeitslohn (AW × Satz), Teile (Menge × EK → VK, Aufschlag), Sonstiges, Pakete (ab 2), Zwischensumme, Paket- und Auftragsrabatt, Netto/MwSt/Brutto, bereits abgerechnet, Rest-Anzahlung, „Zu zahlen bei Abholung“, Wareneinsatz, Deckungsbeitrag, Lohn/Teile-Balken. Darunter wie bisher die Eingaben („Preise & Rabatte anpassen“).
- **Test:** Smoke-Test grün (390/1280), prüft jetzt Summe Positionen − Rabatte = Netto und „Zu zahlen“. SW v29.
- **Offen / nächster Handgriff:** Scheibe 3 (Feinschliff): Auftragsrabatt-Schnellwahl 0/5/10 % direkt in der Detail-Kalkulation, Hell-Modus-Screenshot prüfen. Danach Backlog A3 (Suchleiste).

## 30.09.2026 (2. Lauf) — Version 2.27: Kalk-Kopf PRO, Scheibe 1
- **Recherche:** entfallen (kurzer Folgelauf am selben Tag).
- **Gebaut:** Dunkler Kalk-Kopf (#2C3E50, wie Entwurf 14) im Kopfbereich der Auftragsmaske (`shell(...,{kopf})`), bleibt beim Scrollen sichtbar (kompakt, ohne Unterzeile). Zeigt Netto/MwSt/Brutto/Gewinn aus der bestehenden Engine, Unterzeile: verfügbare Anzahlung, „Noch offen“ (= nicht abgerechnete Pakete brutto − Rest-Anzahlung), Marge %. Untere Leiste zeigt nur noch PDF + Rechnung (keine doppelten Zahlen).
- **Test:** Smoke-Test grün (390/1280), prüft jetzt auch Kalk-Kopf-Brutto. SW v28.
- **Offen / nächster Handgriff:** Scheibe 2 — Detail-Kalkulation (Lohn, Teile EK→VK, Zwischensummen, Rabatt, Anzahlung, „Zu zahlen bei Abholung“, Deckungsbeitrag, Lohn/Teile-Balken) als neuer Inhalt des Modus „Kalkulation“ in `calcHtml()`.

## 30.09.2026 — Version 2.26: „Was ist neu“
- **Recherche:** entfallen (erster Lauf, Fokus auf Einrichtung + Paket A1).
- **Gebaut:** Mehr → Versionsnummer ist jetzt ein Knopf (44 px) „Was ist neu?“. Öffnet ein Blatt mit allen Versionen (Datum, 1–3 Punkte). Roter Punkt, solange die aktuelle Version nicht angesehen wurde (`S.settings.seenVer`, optional, keine Migration nötig). Liste steht in `WHATSNEW` direkt unter `APP_VER` — bei jeder Version oben einen Eintrag ergänzen.
- **Test:** `tests/smoke.mjs` um den „Was ist neu“-Ablauf erweitert. SW v27.
- **Offen / nächster Handgriff:** Backlog A2 „Kalk-Kopf PRO“, Scheibe 1: klebender Kalkulations-Kopf in der echten Auftragsmaske.

## 28.09.2026 — Start des Mitarbeiter-Modus
- **Vereinbart mit dem Inhaber:** Jeden Tag gibt es mindestens einen Fortschritt. Er geht nach Tests direkt live und kommt mit einem Release-Update per E-Mail. Die Routine startet täglich um 03:47 Uhr (Europe/Berlin).
- **Ausgangsstand:** App-Version 2.25, SW v26. Unter `/designs/` liegen die Kataloge: Auftragsmasken (Favorit 14 „Kalk-Kopf PRO“), Masken, Layout-Welten und 8 Jarvis-Entwürfe. `/designs/` wird nicht mehr vom Service Worker gecacht.
- **Offen:** Der Inhaber muss noch einen Jarvis-Entwurf wählen. Kalk-Kopf PRO ist noch nicht in der echten App.
- **Nächstes Paket:** „Was ist neu“ in der App (Backlog A1).
