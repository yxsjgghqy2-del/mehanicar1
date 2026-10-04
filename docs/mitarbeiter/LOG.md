# Tagebuch — mehanicar-Mitarbeiter

Neueste Einträge oben.

## 04.10.2026 (2. Lauf) — Version 2.42: Barrierefreiheit Runde 2
- **Recherche:** entfallen (Fortsetzung B7).
- **Gebaut:** `sheet()` setzt `role="dialog" aria-modal` und `aria-labelledby`, merkt sich den Auslöser und setzt den Fokus auf den Blatt-Titel. Bewusst nicht auf das erste Eingabefeld, weil sonst auf dem iPhone die Tastatur aufspringt. `closeSheet()` gibt den Fokus an den Auslöser zurück. Globale Esc-Taste schließt Rückfrage oder Blatt. `linkLabels()` verbindet nach jedem Render und in jedem Blatt `.fld > label` per `for` mit dem Feld (vergibt bei Bedarf eine ID). Die 10 runden „+“-Knöpfe haben jetzt sprechende `aria-label` („Neuer Kunde“ usw.).
- **Test:** Smoke-Test grün (390/1280). Er prüft: Fokus im Blatt, Dialog-Rolle, Label verbunden, Esc schließt, Fokus zurück auf „+“. SW v43.
- **B7 damit abgeschlossen.**
- **Offen / nächster Handgriff:** Nächster Lauf ist ein Design-Lauf: Kundenliste, plus Farbvorschlag statt Lime unter `/designs/akzent.html` (nur Vorschlag, Frage an den Inhaber). E-Rechnung Scheibe 2 nach Antwort.

## 04.10.2026 — Version 2.41: Design-Lauf 1 (Startseite „Planung“)
- **Recherche:** entfallen (Design-Lauf).
- **Befund (390 px hell/dunkel):** Im hellen Modus war „Heute“ ein dunkler Block (`.fix`, `.sw-row.dark`) und brach den hellen Stil. Die KPI-Kacheln waren unausgewogen: Zahlen 33 px, „Überfällig“ leer unter der 0. Der Lime-Akzent („alles im Plan“, Rechnungs-Knopf) wirkt fast neonfarben. Das ist ein Richtungsthema, nicht angefasst, siehe Offen.
- **Gebaut:** Im hellen Modus (theme-light oder auto + hell) werden `.fix` und `.sw-row.dark` zur hellen Karte, mit Textfarben aus den Tokens. Der dunkle Modus ist unverändert. KPI-Zahlen von 33 auf 29 px. Unterzeilen „alles pünktlich / Abgabe verpasst“, „noch nicht abgerechnet“, „AW zu Arbeitszeit“. Smoke-Test macht jetzt Bilder `planung-hell.png` / `planung-dunkel.png`, wenn SHOTS gesetzt ist.
- **Test:** Smoke-Test grün (390/1280). SW v42.
- **Offen / nächster Handgriff:** Normaler Lauf: B7 Barrierefreiheit Runde 2. Nächster Design-Lauf: Kundenliste. Den Lime-Akzent als Vorschlag unter `/designs/` zeigen (z. B. gedecktes Blau oder Petrol) und den Inhaber fragen.

## 03.10.2026 (abends) — Neuer Dauerauftrag: Design
- **Inhaber:** „Kümmere dich auch regelmäßig um das Design.“ → in BACKLOG (A) und ROUTINE.md aufgenommen: jeder 3. Lauf ist ein Design-Lauf.
- **Gesundheitscheck:** Live 2.40, Smoke-Test grün (390/1280), Wecker aktiv (3:47/9:47/15:47/21:47 Berlin).
- **Offen / nächster Handgriff:** Nächster Lauf = Design-Lauf, Startseite „Planung“ (390 px hell + dunkel).

## 03.10.2026 (4. Lauf) — Version 2.40: „Rückgängig“ statt Rückfrage
- **Recherche:** entfallen (heute schon erledigt). Umsetzung der C-Idee vom Vormittag, im Release-Update angekündigt.
- **Gebaut:** `mitRueckgaengig(label, fn)` merkt sich den Stand (`JSON.stringify(S)`), führt aus, speichert und zeigt 6 s einen Toast mit „Rückgängig“ (44 px). Schutz: Der neue Zähler `saveN` in `save()` sperrt Rückgängig, sobald inzwischen etwas anderes gespeichert wurde. Umgestellt: `pos-del`, `komm-del`, `apdb-del`, `apkombi-del`, `pvorlage-del`. Mit Dialog bleiben: Auftrag, Paket, Kunde, Fahrzeug, Lagerteil, Foto, Anfrage, Bestellung, Mitarbeiter, Rechnung, Daten löschen.
- **Test:** Smoke-Test grün (390/1280). Er prüft: Löschen ohne Dialog, Rückgängig stellt wieder her, Rückgängig nach anderer Änderung ist gesperrt. SW v41.
- **Offen / nächster Handgriff:** B7 Barrierefreiheit Runde 2 (Fokus in Sheets). E-Rechnung Scheibe 2 nach Antwort des Inhabers.

## 03.10.2026 (3. Lauf) — Version 2.39: Barrierefreiheit (Runde 1)
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** Neue Prüfung `a11y()` in `tests/smoke.mjs`. Sie meldet sichtbare Knöpfe ohne Text, `aria-label` oder `title` in allen Hauptansichten, im Auftrag und in der Kunden-Maske. Gefunden und behoben: `sheet-close`, `cl-del`, `doc-del`, `install-hint-done`, `watpl-del`. Sie haben jetzt `aria-label` und 44 px (Sheet-„x“ über eine unsichtbare Trefferfläche, sieht aus wie vorher). Kontrast: `--ink3` im hellen Modus von #A6A6AE (2,4:1) auf #74747C (≈4,7:1 auf Weiß) angehoben, der dunkle Modus war schon ok (5,1:1).
- **Test:** Smoke-Test grün (390/1280), 0 Knöpfe ohne Beschriftung. SW v40.
- **Offen / nächster Handgriff:** Barrierefreiheit Runde 2 (optional): Fokusreihenfolge in Sheets und Fokus zurück nach dem Schließen, Formular-Labels mit `for=` verbinden. Sonst eine C-Idee nehmen: „Rückgängig“ statt „Sind Sie sicher?“ oder Zahl am App-Symbol. E-Rechnung Scheibe 2 nach Antwort des Inhabers.

## 03.10.2026 (2. Lauf) — Version 2.38: Backup-Erinnerung verbessert
- **Recherche:** entfallen (heute schon erledigt).
- **Fehlerfund:** Die wiederherstellbare JSON-Sicherung (`data-export`) hat `lastBackup` nicht gesetzt. Nur der Excel-Export hat die Erinnerung zurückgesetzt. Behoben.
- **Gebaut:** `bkStatus()` als zentrale Logik: fällig, wenn Cloud-Backup aus ist und 15 Änderungen oder 7 Tage seit der letzten Sicherung erreicht sind. Ohne jede Sicherung zählt `S.meta.since` (neu, wird in `migrate2` gesetzt). „X“ pausiert jetzt 24 h (`S.meta.bkSnooze`, gespeichert) statt nur bis zum nächsten App-Start. Die Warnzeile in der Planung bietet „Jetzt sichern“ (JSON, wieder einspielbar) mit 44-px-Knöpfen. Neue Karte „Datensicherung“ unter „Mehr“ mit „Letzte Sicherung vor X Tagen“ und Knopf, ausgeblendet bei funktionierendem Cloud-Backup.
- **Test:** Smoke-Test grün (390/1280). Er prüft: Hinweis nach 8 Tagen, Ausblenden, Karte in „Mehr“, „Jetzt sichern“ setzt zurück. SW v39.
- **Offen / nächster Handgriff:** B7 Barrierefreiheit (Icon-Knöpfe ohne Beschriftung finden: `grep 'data-act' | grep -v aria-label` bei reinen Icon-Buttons, Kontraste `--ink3`). E-Rechnung Scheibe 2 nach Antwort des Inhabers.

## 03.10.2026 — Version 2.37: E-Rechnung, Scheibe 1 (Firmenkunde vorbereiten)
- **Recherche (c) UX mobile Business-Apps:** Für umkehrbare Aktionen empfiehlt die aktuelle Praxis „Rückgängig“-Toast statt „Sind Sie sicher?“-Dialog, weil Dialoge zum blinden Wegtippen erziehen. Außerdem: einhändige Bedienung, 48-px-Ziele, gut sichtbarer Status. → Idee ins BACKLOG (C). Quellen: smashingmagazine.com (Dangerous Actions, 2024), dolfy.ai (Confirmation Dialog Problem), team400.ai (Field Service Design Patterns).
- **Gebaut:** In der Kunden-Maske gibt es das neue Feld „USt-IdNr.“. Es wird beim Speichern großgeschrieben und Leerzeichen werden entfernt (`k.ustid`). Die Kundenakte zeigt die USt-IdNr. und bei Firmen den Hinweis „E-Rechnung ab 2028 nötig“. In der Rechnungsliste steht die Markierung „E-Rechnung“ bei Firmenkunden über 250 € brutto (`eReNoetig`). Auf der gedruckten Rechnung steht die USt-IdNr. des Kunden unter der Adresse. Neues optionales Feld, keine Migration nötig.
- **Test:** Smoke-Test grün (390/1280). Er prüft die USt-IdNr.-Normalisierung und `eReNoetig` (privat / Firma > 250 € / Firma = 250 €). SW v38.
- **Offen / nächster Handgriff:** E-Rechnung Scheibe 2, XRechnung-Export (CII-XML) mit Pflichtfeld-Prüfung. Vorher die Antwort des Inhabers abwarten (Umsatz > 800.000 €?), bis dahin B6 Backup-Erinnerung.

## 02.10.2026 (4. Lauf) — E-Rechnung: Recherche + Konzept (keine App-Änderung)
- **Recherche (d) Recht & Pflichten:** Empfang seit 2025 Pflicht (E-Mail-Postfach reicht). Ausstellen an Firmenkunden ab 2027 bei Vorjahresumsatz > 800.000 €, sonst ab 2028. B2C und Kleinbetragsrechnungen ≤ 250 € sind ausgenommen. Formate: XRechnung oder ZUGFeRD (EN 16931). Quellen in `docs/e-rechnung.md`.
- **Erstellt:** `docs/e-rechnung.md` mit Pflichten-Tabelle, Plan in 4 Scheiben (Firmenkunde/USt-IdNr → XRechnung-CII-Export im Browser → Validator-Test → optional ZUGFeRD) und einer Frage an den Inhaber.
- **Test:** Keine App-Änderung, Smoke-Test nicht nötig. Version bleibt 2.36.
- **Offen / nächster Handgriff:** E-Rechnung Scheibe 1 (Kundenfeld „USt-IdNr.“ in `kunde-edit` + Hinweis an Firmenrechnungen > 250 €). Die Antwort des Inhabers entscheidet über das Tempo.

## 02.10.2026 (3. Lauf) — Version 2.36: „Teil hinzufügen“ im neuen Stil
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** `add-teil` hat einen Vorschau-Kopf (Bezeichnung, Menge × EK → VK, Summe, Aufschlag € / %, Lagerhinweis „Lager: n da“ oder „nur n im Lager — wird bestellt“). Balken: „Aus dem Lager“ und „Teil & Preis“. IDs sind unverändert, `teil-save` wurde nicht angefasst.
- **Test:** Smoke-Test grün (390/1280), wählt ein Lagerteil, prüft die Vorschau, fügt das Teil hinzu und prüft Bestand −1. Danach wird zurückgesetzt. SW v37.
- **Offen / nächster Handgriff:** B5 E-Rechnung, Scheibe 1: Recherche (Pflichten 2025/2027/2028, ZUGFeRD vs. XRechnung, Pflichtangaben) → Konzept `docs/e-rechnung.md` → Frage an den Inhaber.

## 02.10.2026 (2. Lauf) — Version 2.35: Anlege-Masken, Scheibe 3 (Position)
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** `posSheet` (Arbeit/Teil neu und bearbeiten) hat einen Vorschau-Kopf: Bezeichnung, Gesamtpreis, bei Arbeit „AW × Satz“, bei Teil „Menge × EK → VK“ und Aufschlag in € und %. Neue Balken: Arbeit/Teil & Preis (offen), Rabatt & Abrechnung, Bestellung (nur Teile), Notizen. Gefüllte Bereiche sind beim Bearbeiten offen. Bei Teilen steht EK jetzt in der Preiszeile (Menge/EK/VK). Alle IDs sind unverändert, `pos-save` wurde nicht angefasst.
- **Test:** Smoke-Test grün (390/1280), prüft die Arbeit-Vorschau (2 AW × Satz), den Teil-Aufschlag und dass Speichern ohne Änderung die Werte nicht verändert. SW v36.
- **A4 Anlege-Masken damit abgeschlossen.** Rest-Kleinigkeit: Das Blatt „Teil hinzufügen“ aus dem Lager (`add-teil`) ist noch im alten Stil, eventuell später angleichen.
- **Offen / nächster Handgriff:** B5 E-Rechnung, Scheibe 1: Recherche (Pflichten 2025/2027/2028, ZUGFeRD vs. XRechnung, Mindestangaben) → Konzept unter `docs/` und Entscheidungsfrage an den Inhaber (betrifft nur Firmenkunden).

## 02.10.2026 — Version 2.34: Anlege-Masken, Scheibe 2 (Fahrzeug)
- **Recherche (b) iOS/Safari/PWA:** Ab iOS 26 öffnet jede zum Home-Bildschirm hinzugefügte Seite als Web-App. Seit iOS 16.4 gibt es Push und App-Icon-Badges (Badge API, braucht Mitteilungs-Erlaubnis), seit Safari 18.4 Declarative Web Push und Screen Wake Lock. → Zwei Ideen ins BACKLOG (C). Quellen: mobiloud.com (PWA iOS Guide 2026), en.wikipedia.org/wiki/IOS_26.
- **Gebaut:** Die Fahrzeug-Maske (`fzg-edit`) hat einen dunklen Vorschau-Kopf mit Kennzeichen als Nummernschild (`.mk-plate`), Marke/Modell und Halter, live über input/click/change. Neue Balken: Halter, Fahrzeug, Technik, HU & Wartung, Farbe & Zustand. Die IDs sind unverändert. Beim Schein-Scan löst `setV` jetzt ein `input`-Event aus, damit die Vorschau mitzieht (geprüft: die betroffenen Felder haben kein `data-input`/`data-f`).
- **Test:** Smoke-Test grün (390/1280), legt ein Testfahrzeug mit Halter-Suche an, prüft die Vorschau und löscht es wieder. SW v35.
- **Offen / nächster Handgriff:** Scheibe 3, Positions-Maske (`pos-edit` / `add-arbeit` / `add-teil`) mit `mSec` und Kopf (Bezeichnung + Preis, bei Teilen EK→VK + Aufschlag).

## 01.10.2026 (4. Lauf) — Version 2.33: Anlege-Masken, Scheibe 1 (Kunde)
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** Die Kunden-Maske (`kunde-edit`) hat jetzt einen dunklen Vorschau-Kopf (Initialen, Name, Telefon · Ort, live per `input`-Listener) und aufklappbare Balken über `<details class="msec">`: Person, Kontakt, Adresse, Werkstatt-Infos. Beim Bearbeiten sind gefüllte Bereiche offen. Die Zahlungsmoral ist jetzt eine Knopfreihe (`.mseg`, Radio, 44 px) statt Auswahlliste. Die Feld-IDs sind unverändert, `kunde-save` liest nur die Moral neu aus. Neue Helfer `mSec` und `mIni` sind für die nächsten Masken wiederverwendbar.
- **Test:** Smoke-Test grün (390/1280), legt einen Testkunden an (Vorschau, Moral „Mittel“), prüft ihn und löscht ihn wieder. SW v34.
- **Offen / nächster Handgriff:** Scheibe 2: Fahrzeug-Maske (`fzg-edit` o. ä. suchen) mit `mSec`, im Kopf Kennzeichen + Marke/Modell. Danach Scheibe 3: Positions-Maske.

## 01.10.2026 (3. Lauf) — Version 2.32: Starke Suchleiste, Scheibe 3 (Schnellbefehle)
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** Gruppe „Schnellbefehle“ ganz oben in der Suche (`GS_CMDS`): neuer Auftrag / Kunde / Termin, Bestellliste. „bestell <teil>“ zeigt passende Lagerteile. Nach einer Rückfrage (`confirmBox`) wird eine Bestellung mit Menge wie in der Bestellliste angelegt (`ACT['gs-bestell']`), danach öffnet sich „Bestellungen“. Es wird nichts verschickt.
- **Test:** Smoke-Test grün (390/1280), prüft dass „neuer auftrag“ die Maske öffnet und „bestell bremsbel“ eine Bestellung anlegt. SW v33.
- **A3 Suchleiste damit abgeschlossen.**
- **Offen / nächster Handgriff:** A4 Anlege-Masken (Kunde zuerst) im Stil von Entwurf 14 mit aufklappbaren Balken. Erst die bestehende `kunde-edit`-Maske lesen.

## 01.10.2026 (2. Lauf) — Version 2.31: Starke Suchleiste, Scheibe 2
- **Recherche:** entfallen (heute schon erledigt).
- **Gebaut:** `gSucheTreffer` hat neue Gruppen: Arbeiten & Teile in Aufträgen (→ Auftrag), Rechnungen (→ Auftrag), Termine (→ `termin-open`), Anfragen (→ Anfrage), Lager (→ `lager-edit`). Treffer mit `data-a` rufen den passenden Handler auf, sonst `nav`.
- **Test:** Smoke-Test grün (390/1280), sucht „brems“, prüft die Gruppen und öffnet den Lager-Treffer. SW v32.
- **Offen / nächster Handgriff:** A3 Scheibe 3, Schnellbefehle in der Suche (z. B. „neuer auftrag“, „bestell dot4“ → Bestellliste), danach A4 Anlege-Masken.

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
