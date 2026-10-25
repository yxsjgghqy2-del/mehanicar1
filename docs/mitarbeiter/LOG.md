# Tagebuch — mehanicar-Mitarbeiter

Neueste Einträge oben.

## 25.10.2026 (Auftrag Inhaber, Nacht) — 2.88 iPhone-Look, Schritt 1
- **Inhaber:** „Ich möchte, dass es aussieht wie eine iPhone-App, gestalte gerne um. Außer die Kalkulationsseite.“
- **Gebaut (nur CSS-Ebene am Ende von app.css, `body.ios`, nicht auf `body.r-kalk`):** Systemschrift (SF Pro auf iPhone/Mac), große Titel 34 px (Unterseiten 22 px, beim Scrollen 17 px), durchscheinende Kopfleiste mit Haarlinie, Tab-Leiste unten über die ganze Breite mit Tönung, Karten ohne Schatten/Rahmen mit Radius 12, Listenzeilen 17 px mit Haarlinien, graues Suchfeld, Filter-Kapseln, Segmented Control, Aktionsleiste im Auftrag als Werkzeugleiste, farbige Symbole unter „Mehr“, runde Initialen bei Kunden. Kalkulationsseite unverändert (geprüft). SW v89.
- **Test:** Smoke-Test grün (390/1280). Screenshots hell/dunkel geprüft (im Test-Browser ohne SF-Schrift).
- **Nächste Schritte:** Seite für Seite verfeinern (Planung-Kacheln, Auftrag-Detail als gruppierte Liste, Blätter/Formulare wie iOS, Schalter). Inhaber nach Eindruck auf dem echten iPhone fragen.

## 25.10.2026 (Auftrag Inhaber, spät) — 2.87 Eigene Art
- **Inhaber:** Möchte die Art des Kundenanliegens selbst benennen können (z. B. Versicherung). Ordnername benennt er ohnehin selbst.
- **Gebaut:** Feld „Eigene Art“ (`pk.klassTxt`, jetzt für jede Art) in „Neues Kundenanliegen“ und im Blatt „Name, Art, wer zahlt“. `klassName(pk)` überall in der Anzeige, auf Ausdruck und im Export. Farbe/Logik bleibt bei der gewählten Art. SW v88.
- **Test:** Smoke-Test grün (390/1280), prüft Anlegen + Ändern der eigenen Art.

## 25.10.2026 (Abendlauf) — 2.86 Freigabe-Link für die Erweiterung
- **Prüfung (Lehre vom Morgen):** Alle Klapp-Elemente in allen Ansichten, Auftrag und Kalkulation (Liste/Kalkulation/Tabelle) bei 390 und 1280 px automatisch durchgeklickt – alle reagieren (Abschnitte im Auftrag, Einstellungen, Blätter mit `<details>`).
- **Fehler gefunden:** Der Freigabe-Link schickte nur die Abhilfe (`wbAbh`). Positionen im neuen Abschnitt „Während der Arbeit festgestellt“ fehlten, Betrag falsch, und die Antwort landete bei der Abhilfe.
- **Behoben:** `frZiel(a,pk)` entscheidet: erst Abhilfe; ist die freigegeben, die Erweiterung. Link zeigt dann „Erweiterung zu …“, nur deren Befund/Positionen/Betrag; Antwort setzt `pk.frei.erw` (`freiAnfrage.ph`). Knopf erscheint im passenden Abschnitt. SW v87.
- **Test:** Smoke-Test grün (390/1280), prüft Link-Inhalt und Antwort für die Erweiterung.
- **Offen:** Antworten des Inhabers (alte Fund-Ordner umziehen? weitere Arten? Nachkalkulation? Briefing-Rest).

## 25.10.2026 (Auftrag Inhaber) — 2.85 Kundenanliegen + Erweiterung als Abschnitt
- **Inhaber 25.10.:** Diagnose/Abhilfe sind Abschnitte im selben Ordner – so soll auch „Während der Arbeit festgestellt“ sein (kein neuer Ordner, Kunde sieht: Erweiterung zur laufenden Arbeit). Knopf für neuen Ordner heißt jetzt „Kundenanliegen“ mit Art TBA / Kd.-Wunsch / Bei Rep. festgestellt / Zusatzleistung / … Ausklappen ging nicht – hätte ich selbst merken müssen.
- **Fehler gefunden:** `pak-tog` schaltete nur die Klasse um, der Inhalt geschlossener Ordner wird aber gar nicht gebaut → Aufklappen zeigte nichts. Jetzt neu zeichnen. Smoke-Test prüft Auf- und Zuklappen.
- **Gebaut:** Phase `erw` für Positionen/Befunde: eigener Abschnitt nach Abhilfe mit eigener Freigabe (`pk.frei.erw`), Summe Erweiterung, Freigabe-Link-Knopf, Ausdruck mit Zwischenüberschrift. Positionen dort sind immer `ext`. Ohne Freigabe der Erweiterung steht der Ordner auf „Freigabe ausstehend“. Knopf „+ Während der Arbeit festgestellt“ unten (mit Auswahl des Kundenanliegens) und im Ordner. Verschieben kennt den neuen Bereich. Neue Art `rf` „Bei Reparatur festgestellt“. Alte Fund-Ordner bleiben unverändert. SW v86.
- **Test:** Smoke-Test grün (390/1280), neuer Ablauf „Kundenanliegen“.
- **Lehre:** Bei jedem Lauf auch Grundfunktionen (Auf-/Zuklappen, Knöpfe in geschlossenem Zustand) wirklich durchklicken, nicht nur den offenen Zustand ansehen.

## 25.10.2026 (Morgenlauf) — 2.84 Design-Durchgang Kalkulation
- **Angesehen:** Werkstattbericht mit Kostenvoranschlag-Hinweis und Alternativ-Teilen, Positionsblatt, 390 px hell/dunkel.
- **Behoben:** Die klebende Summenleiste unten war mit beiden Hinweisen fast halb so hoch wie der Bildschirm und verdeckte Positionen → Hinweise kürzer und flacher, „Alternativen übernehmen“ als Textknopf (44 px) in einer Zeile, Zielpreis-Knopf enger. Titel im Blatt hatte einen schwarzen Fokus-Rahmen → entfernt (Fokus bleibt für Bildschirmleser). SW v85.
- **Test:** Smoke-Test grün (390/1280).
- **Offen / nächster Handgriff:** Kalkulation 7 (Nachkalkulation) wartet auf Antwort des Inhabers (Stechuhr entfernt). Sonst: Briefing-Rest KP4–7 abwarten; bis dahin Mac-Ansicht der Kalkulation (Katalog rechts daneben) als Vorschlag.

## 24.10.2026 (Abendlauf) — 2.83 Preis-Varianten
- **Gebaut:** Jedes Teil kann im Positionsblatt eine „Alternative für den Kunden“ bekommen (Bezeichnung, EK, VK; `x.alt`). Im Werkstattbericht steht sie unter dem Teil, unter der Summe „Mit Alternativ-Teilen zahlt der Kunde …“ mit Knopf „Kunde wählt Alternativen“ (tauscht alle, das alte Teil bleibt als Alternative, Eintrag im Verlauf). Einzeln tauschen im Positionsblatt. Kostenvoranschlag/Übersicht zeigen „oder alternativ: …“ und die Summe mit Alternativen; Rechnungen nicht. SW v84.
- **Test:** Smoke-Test grün (390/1280), neuer Ablauf „Preis-Varianten“.
- **Offen / nächster Handgriff:** Kalkulation Punkt 7 (Nachkalkulation geplante AW vs. gestempelte Zeit) – Achtung: Stechuhr wurde im Auftrag entfernt, vorher Inhaber fragen. Wartet weiter auf Briefing-Rest (KP4–7).

## 24.10.2026 (Morgenlauf) — 2.82 Kostenvoranschlag mit Gültigkeit
- **Gebaut:** Drucken im Auftrag fragt jetzt: „Kostenvoranschlag“ oder „Auftragsübersicht“. Der Kostenvoranschlag trägt Überschrift, „Gültig bis“ (Einstellung `kvaTage`, Standard 30 Tage) und den Satz zur 15-%-Grenze. Beim Drucken merkt sich der Auftrag Betrag und Datum (`a.kva`, Eintrag im Verlauf). Im Werkstattbericht steht unter der Summe ein Hinweis: bis 15 % mehr gelb, darüber rot („Kunde vorher fragen“), abgelaufen = Hinweis. SW v83.
- **Test:** Smoke-Test grün (390/1280), neuer Ablauf „Kostenvoranschlag“.
- **Offen / nächster Handgriff:** Kalkulation Punkt 6 (Preis-Varianten). Wartet auf Inhaber: Rest des Briefings („Bekannte Probleme“, KP4–7), Öffnungszeiten bestätigen, SQL in Supabase neu ausführen.

## 23.10.2026 (Abendlauf) — 2.81 Design-Durchgang
- **Angesehen:** Auftrag mit allen neuen Hinweiskarten und Planung, 390 px hell/dunkel.
- **Behoben:** Hinweiskarten (Gewährleistung, Annahme, Teile, abgelehnt) kompakter; Karte „Terminerinnerungen fällig“ hatte keinen Innenabstand (Überschrift links abgeschnitten); Teile-Karte zeigte eine fremde Zeitleisten-Linie, weil die Klasse `tl` schon belegt war → `tlb`. SW v82.
- **Test:** Smoke-Test grün.

## 23.10.2026 (Morgenlauf) — 2.80 Zielpreis rückwärts + Mindestmarge (Kalkulations-Plan Punkt 4)
- **Gebaut:** Unter der Summe im Bericht „Zielpreis: Kunde zahlt …“ → Blatt mit Brutto-Ziel, Live-Vorschau (Rabatt, Gewinn, Marge danach, Warnung bei Verlust/Mindestmarge, Hinweis wenn über dem vollen Preis) → setzt Auftragsrabatt in € (`zielRabatt`, centgenau inkl. MwSt-Rundung), Verlauf; „Rabatt entfernen“. Summe zeigt jetzt Marge % und Rabatt. Einstellung „Mindestmarge %“ (`settings.minMarge`, 0 = aus) → roter Hinweis in der Summe. SW v81.
- **Test:** Smoke-Test grün (Ziel 90 % → Brutto exakt, Warnung bei Mindestmarge).
- **Warten weiter auf Inhaber:** Rest Briefing (Bekannte Probleme, KP4), Öffnungszeiten bestätigen, SQL erneut ausführen, Buchungslink neu teilen.

## 22.10.2026 (Abendlauf) — 2.79 KP1: freie Zeiten + Zeiten blockieren
- **Gebaut:** `S.settings.oeffnung` {tage, von, bis, slot} (Standard Mo–Fr 08–17 Uhr, 60 Min, in Einstellungen änderbar – Vorgabe, keine Erfindung des Inhabers; bitte bestätigen lassen). Buchungsinfo trägt Öffnungszeiten + belegte Zeiten (nur Datum/Uhrzeit, keine Namen; `belegtListe`, 60 Tage). Buchungsformular zeigt freie Uhrzeiten als Knöpfe (`freieSlots`), heute erst ab jetzt (kurzfristig erlaubt), belegte/blockierte Zeiten ausgeblendet; ohne Info bleibt das Uhrzeitfeld. Termintyp „Blockiert“ (frei im Kalender, Bezeichnung optional). Auftrag → Organisation: „Auto dauert länger – Zeit im Kalender blockieren“ → Block-Termine je Öffnungstag bis Datum/Uhrzeit, Fertig-Termin wird angepasst, Verlauf. SW v80.
- **Test:** Smoke-Test grün (Slot-Rechnung, Überschneidung, geschlossene Tage, Blockieren → Folgetag voll, Endtag ab 12:00 frei; Buchungstest wählt jetzt einen Slot).
- **KP1 damit komplett** bis auf Kleinigkeiten (Öffnungszeiten vom Inhaber bestätigen lassen).

## 22.10.2026 (Morgenlauf) — 2.78 KP1: Termin bestätigen + Erinnerungen
- **Gebaut:** In der Anfrage (Status neu) Knopf „Termin bestätigen · Wunsch …“ → Datum/Uhrzeit vorbelegt → Termin (`t.anfrageId`, Name/Telefon/E-Mail) + Anfrage „Termin“ → Nachrichtenblatt: mit E-Mail „Per E-Mail senden“ (fertige Mail), ohne E-Mail Hinweis + „Kunden anrufen“ (= Aufgabe anrufen), dazu SMS und WhatsApp, „Schon erledigt“. Termin-Blatt: Telefon/E-Mail + „Termin beim Kunden bestätigen“. Erinnerungen: `S.settings.erinnTage` (Standard 3, 1; Einstellungen → Kalkulation & Preise), `erinnFaellig()` (kleinster erreichter Vorlauf, noch nicht gesendet) → Karte „Terminerinnerungen fällig“ oben in Planung und Kalender → fertige Nachricht. SMS als weiterer Weg (Briefing). SW v79.
- **Test:** Smoke-Test grün (Anfrage → Termin am Wunschtag, ohne E-Mail → Anrufen-Knopf, bestätigt, Erinnerung 3 Tage fällig + Karte, nach Senden erledigt).
- **Noch offen KP1:** freie Slots im Buchungsformular, Zeiten blockieren (am Auftrag + frei).

## 21.10.2026 (Abendlauf) — 2.77 KP1: neues Anfrageformular + Bestandskunden-Erkennung
- **Gebaut:** Buchungsformular nach Briefing: Kategorie (Wartung/Inspektion, Problem/Reparatur, Reifen/Räder, HU/AU, Klima, Sonstiges) Pflicht; Name, Telefon Pflicht; E-Mail freiwillig; FIN (17 Zeichen) ODER Foto Fahrzeugschein Pflicht (nur angehängt, nicht ausgelesen); Kilometerstand Pflicht; EIN Anliegen-Feld „so genau wie möglich“; bis 3 Bilder freiwillig (verkleinert); Wunschtermin. Fehlende Pflichtangaben werden genannt. `anfrageAusBuchung` erkennt Bestandskunden/-fahrzeuge über FIN, Kennzeichen oder Telefon (`q.kundeId/fzgId`, Notiz „Bestandskunde …“), übernimmt Kategorie, km, E-Mail, FIN, Fotos. Auftrag aus Anfrage nutzt Kunde/Fahrzeug/km (`anfFzgId` legt Fahrzeug mit FIN an, falls neu). Status „Neu – Bestätigung ausstehend“. SQL: Grenze für Anfragen 4000 → 900000 Zeichen (Fotos); bei alter Einrichtung sendet die Seite automatisch nur Text + Hinweis. SW v78.
- **Inhaber muss:** „Einmalige Einrichtung“ erneut in Supabase ausführen (für Fotos), Buchungslink neu weitergeben (seit 2.76).
- **Noch offen KP1:** Wunschtermin aus freien Slots, Zeiten blockieren (am Auftrag + frei), Bestätigung per Mail / Aufgabe „anrufen“ / SMS, Erinnerungen 3+1 Tage.
- **Test:** Smoke-Test grün (ohne Pflichtfelder kein Versand; mit FIN eines Bestandsfahrzeugs → richtig zugeordnet, km/Kategorie übernommen). Formular-Screenshot angesehen.

## 21.10.2026 (Morgenlauf) — 2.76 Freigabe-Link + Kundenlinks mit eigenem Cloud-Projekt
- **Fehlerfund (wichtig):** Status- und Buchungsseite benutzten auf Kunden-Handys immer das Voreinstellungs-Projekt (`SYNC_DEF`), nicht das neue eigene Supabase-Projekt des Inhabers → Online-Anfragen/Status wären nie angekommen. Lösung: Links tragen jetzt einen Projektcode (`#/status/<id>/<code>`, `#/buchen/<id>/<code>`, `pubCfgCode`/`pubCfgAusHash`/`pubCfg`); angenommen wird nur `https://….supabase.co` (kein Umleiten auf fremde Server). **Inhaber muss den Buchungslink neu weitergeben.**
- **Gebaut (KP3 NEU):** Knopf „Freigabe beim Kunden anfragen (Link)“ bei Paketen mit „Freigabe ausstehend“ → `pk.freiAnfrage` {Befund, Abhilfe-Positionen brutto, Summe, bis 3 Fotos verkleinert} in die Statusdaten (`fr`, `bid`) → WhatsApp oder fertige E-Mail mit Link. Kundenseite: Karte mit Befund, Fotos, Positionen, Summe, „Freigeben“ (mit Rückfrage) / „Ablehnen“ → über vorhandenes `anfrage_neu` (kein neues SQL nötig) → `anfragenHolen` erkennt `typ:'freigabe'` → `freigabeAntwort`: Ja → `pk.frei.abh` (wie: Freigabe-Link), Nein → `fzg.abgelehnt`; Verlauf + Hinweis. Nachhaken: Paketkopf „Freigabe angefragt vor X Std – nachhaken“ ab 3 Std. Abgelehnte Arbeiten (Link-Ablehnung + Befund „will nichts“) als Karte beim nächsten Auftrag desselben Fahrzeugs. Freigabe eintragen: Feld „Mit wem gesprochen?“. SW v77.
- **Test:** Smoke-Test grün (Projektcode, fremde Server abgelehnt, nachhaken, Ablehnung → nächster Besuch). Zusätzlich lokal Werkstatt + Kunde als zwei Browser mit simulierter Cloud: Link → Kunde sieht Freigabe → Freigeben → Werkstatt trägt automatisch ein; Kunde sprach nur mit dem eigenen Projekt.

## 20.10.2026 (Abendlauf) — 2.75 Prüfprotokoll der Annahme drucken
- **Gebaut:** `dlgDruckHtml(a)` (Firmenkopf, Kunde, Fahrzeug mit FIN/km/Tank, Beanstandung, Diagnose-Freigabe, 4 Seitenfotos, alle Prüfpunkte nach Gruppen mit ✓ i.O. / ✗ n.i.O. + Bemerkung, gewünschte Zusatzleistungen, Bestätigungstext + Unterschrift). Knopf „Prüfprotokoll für den Kunden drucken“ in der abgeschlossenen Annahme (Drucken oder als PDF sichern über das Druckmenü). Druck immer auf weißem Hintergrund (auch im Dunkelmodus). SW v76.
- **Test:** Smoke-Test grün (Protokoll enthält ✗-Punkt mit Notiz), Druckansicht angesehen.
- **Offen beim Inhaber:** Rest des Briefings (Bekannte Probleme, KP4) – zweimal erinnert.

## 20.10.2026 (Morgenlauf) — 2.74 KP3 Teile & Bestellung
- **Gebaut:** BEST-Status neu `inbest` „muss bestellt werden“, `lager` heißt „im Haus“; Auftragsstatus neu `teileda` „Teile da“ (auch auf der Kunden-Statusseite als „In Arbeit“). „Teil hinzufügen“ hat Feld Teilenummer (`x.artnr`); Lager-Treffer per Auswahl, Teilenummer oder gleichem Namen → im Haus (Bestand reserviert), sonst `inbest` (auch in der Tabelle). Karte „N Teile müssen bestellt werden“ im Auftrag und im Bericht → Blatt „Sollen diese Teile wirklich bestellt werden?“ (Auswahl, Lieferant gemerkt, Liefertermin) → Bestellung mit Auftragsbezug (`b.auftragId`, `p.oid/xid`), Teile „bestellt“, Auftrag „Wartet auf Teile“, Verlauf. Beim Verlassen des Auftrags fragt die App einmal je Sitzung. Bestellungen: „per E-Mail an Lieferant“ (fertige Mail, Inhaber-Entscheidung). Wareneingang (Einbuchen jetzt per Index): Auftragsteile gehen nicht ins Lager, sondern auf „eingetroffen“; sind alle da → Auftrag „Teile da“ + Hinweis + Verlauf. SW v75.
- **Test:** Smoke-Test grün, neue Prüfung (Teilenummer → im Haus + Bestand −1, freies Teil → muss bestellt, Rückfrage beim Verlassen, Bestellung, Einbuchen → Teile da, Lager unverändert).
- **Nächstes:** Bekannte Probleme + KP4 (warten auf den Rest der Nachricht), Checkliste drucken, Freigabe-Link.

## 19.10.2026 (Abendlauf) — 2.73 KP3 Teil 2: Räder, Probefahrt, Wartung, Fehlerspeicher
- **Gebaut:** `spezOf(x)` erkennt besondere Arbeiten am Text. **Räder:** jede Rad-Arbeit heißt „Räder komplett ab- und anmontieren“, pro Auftrag nur EINE (zweite wird mit Hinweis verworfen) – ersetzt die 2.71-Frage. Abschluss-Liste im Positionsblatt (`x.spz`): einlagern Ja/Nein (Ja → Position „Räder einlagern“ ohne Preis + Blatt), „mit vorgeschriebenem Drehmoment angezogen“, „RDKS geprüft bzw. angelernt“; kein 50-km-Hinweis. **Probefahrt:** km/Uhrzeit Start+Ende, Ergebnis. **Wartung** (Inspektion/Wartung/Ölservice): Service-Reset als Pflicht-Haken (Verlauf), nächster Service Datum+km → `fzg.naechsterService` (in „Automatische Erinnerungen“). **Fehlerspeicher:** Kasten unten im Bericht mit Haken „gelöscht“ (`a.fsGeloescht`) und Protokoll vorher/nachher (Bild/PDF, `fo.fs`). Bei „Fertig“ Erinnerung an offene Pflichtpunkte (`spezOffen`). Katalog: Räder komplett…, Probefahrt durchführen, Ausgangskurztest (nur Eintrag, nichts automatisch). SW v74.
- **Nicht automatisch:** Ausgangskurztest fügt der Inhaber selbst hinzu (wie gewünscht). Intervall für den nächsten Service nicht vorbelegt (nichts erfunden).
- **Test:** Smoke-Test grün, neue Prüfung (Umbenennen, nur eine Rad-Position, Abschluss-Liste, Einlagern-Position, Reset + nächster Service am Fahrzeug, Probefahrt-km, Fehlerspeicher-Kasten, Erinnerung bei Fertig). Screenshot angesehen.
- **Nächstes:** Teile & Bestellung (Lager-Prüfung, Bestell-Rückfrage, Wareneingang → „Teile da“). Bekannte Probleme + KP4 warten auf den Rest der Nachricht des Inhabers.

## 19.10.2026 (Mittag) — 2.72 KP3 Teil 1 (Briefing-Update)
- **Anlass:** Briefing-Update des Inhabers (KP3 fertig, KP4 weitgehend) – „kannst es schon einführen“, AW-Feedback nur To-Do. Nachricht kam abgeschnitten an (ab „Bekannte Probleme … NEUE Kategorie“, KP4 fehlt) → Rest angefragt. Inhalt in PROZESSE.md.
- **Gebaut:** Stechuhr aus dem Auftrag entfernt (Abschnitt heißt „Checkliste & Dokumente“; Team-Zeiterfassung unverändert). Freigabe je Paket (`pkFrei`: Summe `pk.frei` oder Auftragsfreigabe ohne Erweiterung) im Bericht-Kopf „x € freigegeben“ / „Freigabe ausstehend“; `doBill` fragt bei ausstehender Freigabe nach („Trotzdem fortfahren“, keine Sperre). Knopf „Während der Arbeit festgestellt“ → Ordner „Während der Arbeit festgestellt: …“ (tb, `pk.fund`, Befund drin, Verlauf). Anhänge je Position im Positionsblatt (Bild/Video/PDF bis 6 MB, `fo.posId`, `isFile`), Zähler in der Zeile, Dateikachel in Fotos. Gewährleistungs-Hinweis (`gewHinweis`: gleicher Kunde/Fahrzeug/Kennzeichen/FIN, fertig/abgeholt in den letzten 365 Tagen). Altteile-Frage (`a.altteile`) + „Was wurde gemacht?“ (`a.wasGemacht`, Abfrage bei Fertig über `nachFertig`) – beides auf dem Ausdruck. SW v73.
- **Test:** Smoke-Test grün, neue Prüfung (ausstehend → Rückfrage → freigegeben, Fund-Ordner, Fertig → Zusammenfassung, PDF-Anhang per Datei-Knopf, Gewährleistung). Fehlerfund: Datei-Feld war erst nach Knopfdruck verbunden → jetzt beim Öffnen des Blatts.
- **Nächste KP3-Bausteine:** Räder als EINE Position mit Abschluss-Liste (ersetzt die 2.71-Frage), Probefahrt-Position mit km/Uhrzeit, Service-Reset-Pflicht + nächster Service am Fahrzeug, Fehlerspeicher-gelöscht-Haken mit Protokoll vorher/nachher, Teile & Bestellung (Lager-Prüfung, Bestell-Rückfrage, Wareneingang → „Teile da“), Bekannte Probleme (wartet auf Rest der Nachricht).

## 19.10.2026 (Vormittag, Nachtrag) — 2.71 Annahme: Zusatzleistung als Ordner, 300 €, Räder einlagern
- **Anlass:** Antworten des Inhabers auf die Rückfragen (siehe PROZESSE.md, Entscheidungen).
- **Gebaut:** neue Paket-Art `zl` „Zusatzleistung“; angekreuzte Zusatzleistungen erzeugen beim Abschluss je einen leeren Ordner (`pk.zus`). Standard-Diagnosefreigabe 300 € (`settings.diagFreiStd`, Migration von 500). `raederFrage()` nach dem Anlegen einer Arbeit (Katalog, Positionsblatt, Tabelle): Räderwechsel → „Räder einlagern?“ → Position ohne Preis + Blatt öffnet sich. SW v72.
- **Test:** Smoke-Test grün (Ordner „Batterietest“ entsteht leer; Räderwechsel → Frage → Position 0 € + Blatt).
- **Offen:** Checkliste für den Kunden ausdrucken.

## 19.10.2026 (Vormittag) — Prozesskonzept + 2.70 Fahrzeugannahme (KP2)
- **Anlass:** Inhaber schickt Briefing aus Voice-Chat (7 Kernprozesse, KP1+2 fertig, KP3 begonnen) → abgelegt in `docs/mitarbeiter/PROZESSE.md`, BACKLOG oben. Rückfragen gestellt: Reihenfolge „egal“ → Start mit KP2-Annahme; E-Mails = App öffnet fertige Mail; Freigabe-Link per E-Mail UND WhatsApp; Annahme auf iPad und iPhone.
- **Gebaut:** Route `annahme` (`vAnnahme`), Daten `a.dlg` {txt, km, tank, frei, chk{id:{v,note,fotos}}, f4, zus, sig, done, skip}. Beanstandung vorausgefüllt (`dlgVorschlagTxt`: Paket-Problem → „Kundenbeanstandung (wörtlich)“ → Anfrage). Checkliste `DLG_CHK` (Außen, Beleuchtung einzeln, Kombi, Reifen Profil+Tragbild je Rad, Bremse granular, Flüssigkeiten, Fehlerspeicher, Innenraum, angehoben) nur ✓/✗, Foto je Punkt, Notiz bei ✗. Pflicht: 4 Seitenfotos + Unterschrift. Zusatzleistungen unten (Batterietest, Klima, HU-Vorbereitung, Unterbodenschutz, Wertgutachten) als „Kunde interessiert“. Abschluss (`dlgAbschluss`): km/Tank in Auftrag, Text → Problem des Beanstandungs-Pakets, Diagnose-Freigabe (Standard 500 €, `settings.diagFreiStd`) → `pk.frei.diag` (wie: Unterschrift), jedes ✗ → Befund im Ordner „Technische Beanstandungen (Fahrzeugcheck)“ (`pk.dlgCheck`, keine Positionen/Preise), Verlauf-Eintrag. Karte oben im Auftrag (starten / ✓ / rot „Keine Dialogannahme“ nach Überspringen). Befund: „Kunde informiert – will nichts gemacht haben“ (`x.nein`, im Bericht blau). SW v71.
- **Test:** Smoke-Test grün (Karte, ✓/✗, Notiz, echtes Foto per Datei-Knopf, Pflichtprüfung, Abschluss → Befund-Text „Bremsbeläge hinten nicht in Ordnung – 2 mm“, keine Preise, Freigabe 500 €, Überspringen → rot). Screenshots iPhone + iPad angesehen.
- **Offen dazu (nachfragen):** Was passiert mit angehakten Zusatzleistungen (nur Vermerk oder als Position anlegen)? „Räder einlagern?“-Frage bei Räderwechsel. Standard-Diagnosefreigabe in den Einstellungen änderbar machen.

## 19.10.2026 (Morgenlauf) — 2.69 Geräte-Abgleich Handy ↔ Mac
- **Anlass:** Inhaber hat Supabase neu eingerichtet (eigenes Projekt, 18.10. abends). Danach: „sehe die Autos vom iPhone auf meinem Mac nicht, bei beiden Backup aktiv“ → jedes Gerät hatte beim Einschalten einen eigenen Backup-Code erzeugt. Außerdem überschrieb bisher das zuletzt sichernde Gerät blind das andere; abgeglichen wurde nur beim Start.
- **Gebaut:** `c.base` (zuletzt mit der Cloud geteilter Stand, `meta.savedAt`), `syncVergleich(row)` → gleich/holen/senden/konflikt, `syncPruefen()` beim Start, beim Zurückkehren in die App (`visibilitychange`) und jede Minute (`syncTakt`), vor dem Senden (wenn > 45 s nicht geprüft). Beide geändert → Blatt „Zwei Geräte – zwei Stände“ (übernehmen / behalten), kein stilles Überschreiben. Einschalten fragt: „Erstes Gerät – neues Backup“ oder „Mit anderem Gerät verbinden (Backup-Code)“. Hinweis „denselben Backup-Code“. SW v70. Ausnahme vom Kalkulations-Fokus: Datensicherheit geht vor.
- **Test:** Smoke-Test grün (neue Prüfung Vergleichslogik inkl. Uhr-Abweichung + Einschalt-Frage). Zusätzlich lokal zwei Browser-„Geräte“ mit simulierter Cloud: verbinden, Abgleich beide Richtungen, Konflikt fragt nach, „behalten“ überschreibt, anderes Gerät holt danach – alles richtig.

## 18.10.2026 (Nacht, Nachtrag) — 2.68 Summe Diagnose + Auswahl (verschieben, RKZ, löschen)
- **Anlass:** Inhaber: „Summe Diagnose bitte separat, Positionen verschieben können, mehrere markieren können um z. B. RKZ zu ändern.“
- **Gebaut:** Zeile „Summe Diagnose“. Auswahlmodus (`wbSel`, Link „Positionen auswählen …“): Zeilen bekommen Kästchen, Leiste oben (klebt) mit ↑ ↓ (innerhalb des Bereichs, `wb-mv`), Verschieben (Paket + Diagnose/Abhilfe, `wb-move`), RKZ (`x.zahler`, `wb-rkz`), Löschen (Lager zurückbuchen) – alles über `mitRueckgaengig`. RKZ abweichend vom Paket steht in der Zeile. Auswahl endet beim Verlassen des Auftrags. SW v69.
- **Test:** Smoke-Test grün, neue Prüfung (Summe, ↑, RKZ für 2, Verschieben nach Abhilfe, Löschen + Rückgängig). Screenshot angesehen; doppeltes „Fertig“ → „Auswahl beenden“.

## 18.10.2026 (Nacht) — 2.67 Kalkulation als Werkstattbericht
- **Anlass:** Inhaber: Ablauf „Kunde kommt mit Problem → Diagnosekosten klären → Prüfen → Befund → Abhilfe = Auftragserweiterung“; Kostenrahmen sichtbar, bei Überschreitung erst große Meldung, nach Bestätigung dauerhaft schlicht. Vorlagen `designs/kalkulation-ablauf.html` → gewählt Nr. 5 fürs Handy, ohne Live-Balken, Freigabe rechts neben Diagnose, Prüfung als Unterpunkt.
- **Gebaut:** `lsHtml` neu: je Paket Abschnitte Beanstandung (`pk.problem`) · Diagnose (Positionen mit `x.phase='diag'`, Unterpunkt Prüfung `pk.pruefung`) · Befund (Befund-Positionen) · Abhilfe (alle übrigen Arbeiten/Teile) · Hinweise. Zeilen mit Punktlinie bis zum Preis, antippen = Details. Kundenwunsch-Pakete zeigen nur „Arbeiten“ (+ Link für vollen Ablauf, `pk.ablauf`). Freigaben `pk.frei.diag/abh` {ct,wie,ts} als Hinweis-Chip; Eintrag im Verlauf. `rahmenCheck()` nach jedem Zeichnen: Überschreitung → große Meldung (einmal je Betrag, `pk.rahmenAck`), danach gelber Chip + „Freigabe überschritten“ im Paketkopf. Positions-Blatt: „Gehört zu“ Diagnose/Abhilfe. Druck: Beanstandung, Prüfung, Befund/Hinweis beschriftet. Umschalter heißt „Bericht“. SW v68.
- **Test:** Smoke-Test grün, neue Prüfung (Reihenfolge, Texte, Diagnose-Position, Freigabe 200 € → Meldung → Hinweis „50 € darüber“, Details). Screenshots hell/dunkel angesehen.

## 18.10.2026 (Abend, Nachtrag) — 2.66 Kalkulation als Liste
- **Anlass:** Inhaber: Tabelle mit seitlichem Wischen „klares NO GO“. Paket als Ordner, darunter Zeilen mit Arbeit, Preis, AW; Details (Positionscode, Teile …) beim Antippen; Befund/Abhilfe und Hinweispositionen je Paket wichtig; Arbeitstext ändern + darunter weiterschreiben (Prüfung, Messwerte); individuelle Positionen.
- **Gebaut:** `lsHtml(a)` – neue Standard-Ansicht „Liste“ (im Auftrag und im Vollbild). Ordner auf-/zuklappbar (`pakOpen`), Zeilen: Text + Beschreibung (bis 4 Zeilen) + AW + Preis; Befund (Abhilfe) mit Ocker-Rand, Hinweis mit Blau-Rand; Pauschale grau. Je Ordner: + Arbeit (`ls-kat`: Katalog aus `S.apDb` mit Suche, „eigene Arbeit“), + Teil, + Befund, + Hinweis, „Paket: Name, Art, wer zahlt“ (`pak-opts`). Summe unten (im Vollbild klebend). Positions-Blatt: „Beschreibung – was geprüft/gemacht, Messwerte“ (= `notizKunde`, steht auf der Rechnung, jetzt mehrzeilig gedruckt) und „Positionscode“ (`x.code`, auf Rechnung vor dem Text) oben. „Textposition“ heißt jetzt „Hinweis“. Tabelle bleibt am Mac wählbar, am Handy ausgeblendet; „Übersicht“ aus der Umschaltung entfernt. SW v67.
- **Fehlerfund unterwegs:** eigene Arbeit aus der Suche wurde kleingeschrieben übernommen – behoben.
- **Test:** Smoke-Test grün, neue Prüfung (Ordner offen, kein Überlauf, Katalog fügt hinzu, eigene Arbeit, Text/Beschreibung/Code speichern + sichtbar, Befund/Hinweis). Screenshots 390 hell/dunkel angesehen.

## 18.10.2026 (Abendlauf) — Kalkulations-Fokus Tag 2: 2.65 Stundensätze nach Arbeitsart
- **Vorher am Tag:** 2.64 Vollbild-Kalkulation (Inhaber-Wunsch), Vorschlag `designs/kalkulation-handy.html` (Inhaber: Handy „nicht so benutzerfreundlich“; wartet auf OK). `claude/wip` (30.09., „Was ist neu“) ist längst in main enthalten – ignoriert.
- **Gebaut:** `S.settings.arten` (Mechanik, Elektrik/Diagnose, Karosserie, Lack; `stdCt` null = wie Mechanik), `artSatz(a,id)` (Stundensatz ÷ AW-Teiler). Tabelle: Spalte „Art“ bietet Mechanik/Elektrik/Karosserie/Lack/Teil; Wahl setzt `x.art` + `x.awSatz` und rechnet VK neu; leere Zeile merkt sich die Art. Übersicht zeigt die Art bei Arbeiten. Einstellungen → Kalkulation & Preise: Satz je Art. SW v66.
- **Test:** Smoke-Test grün, neue Prüfung (Optionen, Elektrik 150 €/Std → VK neu). Screenshots angesehen.

## 18.10.2026 (Vormittag) — 2.64 Kalkulation im Vollbild
- **Anlass:** Inhaber: „Die Kalkulation muss im Vollbild passieren, nichts anderes sollte dabei sein außer das Relevante für die Positionen.“
- **Gebaut:** Neue Ansicht `vKalk` (Route `kalk`): nur Tabelle je Paket, Summenleiste (klebt unten), „Neues Paket“. Kein Menü, kein Kalk-Kopf, keine Abschnitte. Kopf: Kennzeichen + „Kalkulation“ + Knopf „Fertig“ (zurück zum Auftrag). Einstieg: Knopf „Positionen im Vollbild bearbeiten“ oben in „Pakete & Kalkulation“. Handy: Bezeichnung-Spalte breiter (seitlich wischen). SW v65.
- **Test:** Smoke-Test grün, neue Prüfung (öffnet, nur Tabelle, Fertig → Auftrag). Screenshots 390/1280 angesehen.

## 18.10.2026 (Morgenlauf) — Kalkulations-Fokus Tag 2: 2.63 Kleinmaterial-Pauschale + Rabatt-Spalte
- **Gebaut:** `kmBetrag/kmSync/kmSyncAlle` – Pauschale „Kleinmaterial & Entsorgung“ als automatische Position (`auto:'km'`, Art Teil) im ersten offenen Paket: % vom Arbeitslohn (Standard 5 %, min 5 €, max 25 €), wird bei jedem `save()` nachgeführt. In der Tabelle als graue „auto“-Zeile, × schaltet sie pro Auftrag ab (`a.kmAus`), Knopf zum Wiedereinschalten. Schutz: bestehende Aufträge bekommen sie bei der Umstellung nicht (Migration setzt `kmAus`), freigegebene/unterschriebene und abgeholte Aufträge werden nie verändert. Einstellungen → Kalkulation & Preise: an/aus, %, Min, Max, Bezeichnung. Tabelle: neue Spalte „Rabatt“ (`ktRab`: „10 %“ oder „10,00“ €). SW v64.
- **Fehler unterwegs:** `ACT['km-tog']` stand vor `const ACT` → App startete nicht. Verschoben zu den anderen Positions-Aktionen.
- **Test:** Smoke-Test grün (390/1280), neue Prüfung: Min/Max/Mitte, auto-Zeile, Rabatt 10 % senkt Lohn und Pauschale, × schaltet ab.

## 17.10.2026 (Abend) — 2.62 Positionen als Tabelle (Variante 5)
- **Anlass:** Inhaber wählt aus `designs/kalkulation-20.html` die Nummer **5 – Tabelle wie Excel, nur mit Tastatur**.
- **Gebaut:** Im Auftrag „Pakete & Kalkulation“ neue erste Ansicht „Tabelle“ (`ktHtml`): je Paket eine Tabelle # · Art · Bezeichnung · Menge · AW · EK · VK · Gesamt · ×, darunter eine leere Zeile zum Eintippen. Speichern beim Verlassen eines Feldes (`ktCommit`), Fokus wird nach dem Neuzeichnen wiederhergestellt. Tab = nächstes Feld, Enter/↓/↑ = Zeile, Strg/⌘+Entf = löschen (mit Rückgängig). Arbeit: AW × Satz → VK, AW-Vorschlag aus dem Arbeitswert-Katalog; Teil: EK → VK aus Aufschlag-Staffel, Lagerteile per Name erkannt (EK/VK/Bestand), leere Zeile merkt sich die zuletzt gewählte Art. Abgerechnete Pakete nur lesbar. Nach Freigabe werden neue Zeilen automatisch als Erweiterung protokolliert. Summenleiste Lohn/Teile/Netto/MwSt/Brutto/Gewinn.
- **Test:** Smoke-Test mit echten Tastatureingaben (Playwright): Arbeit anlegen, Teil mit VK-Automatik, Enter-Navigation, Summenleiste, Art-Merken. Screenshots Mac/Handy angesehen (Handy: seitlich wischen). SW v63.

## 17.10.2026 (spät, Nachtrag) — 2.61 Schrift Manrope
- **Anlass:** Inhaber: „Schriftart von PayPal bitte.“ PayPal Sans ist proprietär (nicht lizenzierbar) → nächstliegende freie Schrift Manrope (SIL OFL), selbst gehostet unter `fonts/` (latin + latin-ext, variabel 200–800, ~40 KB), Lizenz `fonts/OFL-Manrope.txt`. Kein Google-Fonts-Abruf (Datenschutz). In SW-SHELL, SW v62.
- **Test-Umbau:** `tests/smoke.mjs` startet jetzt einen lokalen Webserver statt `file://` (Schriften wurden per CORS blockiert). Smoke-Test grün.

## 17.10.2026 (spät) — Kalkulations-Fokus Tag 1: 2.60 Aufschlag-Staffel
- **Anlass:** Inhaber: 3 Tage nur Kalkulation. Plan mit 7 Paketen in BACKLOG (A, oben).
- **Gebaut:** `AUFSCHLAG_STD` (bis 20 € +80 %, bis 100 € +50 %, bis 500 € +35 %, darüber +25 %), `vkVorschlag(ek)` mit Rundung auf x,90 € (ab 5 €) bzw. 10 Cent, `vkAuto()` koppelt EK- und VK-Feld in „Teil hinzufügen“ und „Position bearbeiten“: VK folgt dem Vorschlag, bis er von Hand geändert wird; danach Hinweis „Vorschlag … – antippen zum Übernehmen“. Lager-Teile behalten ihren Lager-VK. Einstellungen → Kalkulation & Preise: Staffel (4 Stufen) editierbar, Rundung an/aus, Live-Beispiel. Migration `S.settings.aufschlag`.
- **Test:** Smoke-Test grün, neue Prüfung (Formel, Automatik, Handeingabe bleibt, Einstellungen). SW v61.

## 17.10.2026 (Abend, Nachtrag) — 2.59 Ruhige Farben
- **Anlass:** Inhaber: „Farben sind eine Katastrophe, das sieht eher nach Zirkus aus als Professionalität.“
- **Gebaut:** Neuer Farbblock am Ende von `app.css`: Akzent Anthrazit (#2F3A44, dunkel #D5DADF), gedeckte Statusfarben (Stahlblau, Grün #2E7650, Ocker #9C6420, Rot #B53A3A), Violett → Schiefergrau, Hintergrund ohne Raster und ohne farbige Leuchtflecken, Karten im Dunkelmodus einfarbig ohne Glas-Effekt. Harte Farbwerte in `index.html` (#0A5FFF, #6B4DD6, #0E8F4E, #C2710A, #E0353B …) auf dieselben gedeckten Töne umgestellt. Alter Gelbgrün-Akzent bleibt als Vorschlag in der Farbauswahl. SW v60.
- **Test:** Smoke-Test grün (390/1280), Screenshots Planung/Anfragen hell und dunkel angesehen.
- **Regel ab jetzt:** Neue Farben nur über die Tokens (`--blue/--green/--amber/--red`), keine neuen Hex-Werte in `index.html`.

## 17.10.2026 (Abendlauf) — 2.58 Design-Lauf Anfragen
- **Gebaut:** „Triage starten“-Karte (blauer Verlauf, Fachwort) → ruhige Karte „Neue Anfragen nacheinander abarbeiten“ mit Akzent-Hintergrund. Vier große Kennzahl-Kacheln + bunte Kanal-Kacheln → eine kompakte Karte: 4 Zahlen in einer Zeile, darunter „Herkunft“ als Textzeile. Erste Anfrage jetzt ohne Scrollen sichtbar. Fehlerfund: `KICON` (Kanal-Symbole) hatten keine Linienfarbe und wurden schwarz gefüllt gezeichnet – jetzt `stroke=currentColor`, betrifft auch die Anfrage-Karten. CSS in `app.css`. SW v59.
- **Test:** Smoke-Test grün (390/1280), Screenshots hell/dunkel angesehen; `anfragen` in die Screenshot-Liste aufgenommen.

## 17.10.2026 (Morgenlauf) — 2.56 E-Rechnung + 2.57 CSS ausgelagert
- **2.56 E-Rechnung (Scheibe 2):** `xrechnungXml(r)` erzeugt XRechnung 3.0 (CII) im Browser: Positionen, Rabatt als Nachlass auf Belegebene, USt 19 % (Kategorie S), Anzahlung als TotalPrepaid, IBAN (Code 58), Zahlungsziel, Leistungsdatum, Käufer-Referenz = Auftragsnummer (oder `k.leitwegId`). `eRechDaten` prüft Pflichtangaben und nennt Fehlendes in Alltagssprache. Neue Rechnungen speichern jetzt einen Positions-Schnappschuss (`r.pos`, `anzCt`, `leistung`, `mwstSatz`); alte werden aus dem Auftrag rekonstruiert. Knopf „E-Rechnung“ in Finanzen bei Firmenkunden (gelb, wenn nötig und noch nicht erzeugt). Teilen-Dialog oder Download.
- **Nicht geprüft:** offizielle KoSIT-Validierung (offline nicht verfügbar). Smoke-Test prüft wohlgeformtes XML, Summenregeln (Zeilen − Nachlass = Basis, Basis + USt = Brutto, Brutto − Anzahlung = Zahlbetrag) und Pflichtelemente. Empfehlung an Inhaber: erste Datei einmal durch einen Online-Prüfdienst oder den Steuerberater prüfen lassen.
- **2.57:** CSS aus `index.html` nach `app.css` (814 Zeilen), in `sw.js` SHELL, SW v58. Screenshots unverändert.
- **Test:** Smoke-Test grün (390/1280).

## 16.10.2026 — 2.51–2.54 live (PR #70) + Effizienz
- **GitHub wieder verbunden** (Ausfall 06.–16.10.). Gesammelte Pakete 2.51–2.54 per PR #70 gemergt, live geprüft (APP_VER 2.54, SW v55). Inhaber hat Anleitung für das Supabase-SQL und den neuen Buchungslink bekommen.
- **Inhaber-Wunsch „schneller und effizienter“, Antwort „alles umsetzen“:** Weckzeiten von 4× auf 2× täglich (06:47 und 18:47 Berlin), dafür 1–2 Pakete pro Lauf. GitHub-Prüfung `smoke.yml` (Smoke-Test bei jedem PR). `index.html` wird nebenbei schrittweise aufgeteilt (BACKLOG).

## 08.10.2026 (4. Lauf) — Version 2.54: Online-Terminbuchung kommt an
- **Fehler:** `buchen-send` legte die Anfrage nur im Browser des Kunden ab. Behoben über Supabase: `buch_keys` (öffentlicher Buchungs-Schlüssel → Werkstatt, mit Werkstatt-Infos), `anfragen_eingang`; Funktionen `buchung_an` (nur mit Backup-Code), `buchung_info`, `anfrage_neu` (nur einfügen, Pflichtfelder, max. 4000 Zeichen, max. 30/Stunde), `anfragen_holen` (holt und löscht, nur mit Backup-Code). Alles in `SB_SQL` ergänzt.
- **App:** Buchungs-Schlüssel `S.settings.buchId` wird beim Cloud-Backup angelegt und angemeldet; Link `#/buchen/<schlüssel>`. Buchungsseite zeigt Werkstattdaten aus Supabase (vorher Standarddaten im Kunden-Browser). Werkstatt holt beim Start und alle 3 Minuten (wenn sichtbar) ab; Status immer `neu`. Ohne Schlüssel im Link bleibt das alte Verhalten (Vorschau auf dem eigenen Gerät). Hinweis in den Einstellungen, solange Cloud-Backup aus ist.
- **Test:** Smoke-Test grün (390/1280), neue Prüfung mit nachgebildeten Funktionen: Anmelden → Link → Kunde sendet → liegt im Eingang, nicht lokal → Werkstatt holt ab → Anfrage „neu“. SW v55.
- **Achtung:** GitHub weiter nicht verbunden. Lokal auf `claude/termine-design` (2.51–2.54). Nach dem Hochladen muss der Inhaber das SQL ausführen und den neuen Buchungslink weitergeben.

## 08.10.2026 (3. Lauf) — Version 2.53: Kunden-Statusseite per Link (Stufe B) + Sicherung geschützt
- **Gebaut:** Öffentliche Seite `#/status/<schlüssel>` (ohne Menü, ohne Einrichtung im Kunden-Browser): Werkstatt, Fahrzeug + gekürztes Kennzeichen (`kzKurz`), Status groß, 4-Stufen-Leiste, voraussichtlich fertig, HU-Monat, „Werkstatt anrufen“. Kein Name, keine Preise. Im Blatt „Status an Kunden senden“ Häkchen „Link zur Statusseite anhängen“ (nur bei eingeschaltetem Cloud-Backup). Schlüssel 128 Bit (`stlId`). Nach jeder Sicherung werden geänderte Statusseiten nachgezogen (`statusLinksPush`). Ablauf: 60 Tage gleitend, 30 Tage nach Abholung. Datenschutz-Abschnitt 2a ergänzt.
- **Sicherheitsfund:** Die bisherige Regel `backup_all` (using true) erlaubte jedem mit dem öffentlichen App-Schlüssel, **alle** Sicherungen zu lesen (`/rest/v1/backup?select=*`). Neues SQL (`SB_SQL`, in Einstellungen mit „Befehl kopieren“) sperrt die Tabellen und erlaubt nur noch Funktionen mit genauem Schlüssel: `backup_get/backup_put/status_get/status_put`. App nutzt die Funktionen, fällt bei 404 auf den alten Weg zurück (läuft also vor und nach dem SQL). Nicht selbst in Supabase geprüft oder ausgeführt.
- **Fehlerfund (nicht behoben):** Online-Terminbuchung speichert Anfragen nur im Browser des Kunden (`S.anfragen.push` in `buchen-send`) – sie kommen in der Werkstatt nie an. → BACKLOG ganz oben.
- **Test:** Smoke-Test grün (390/1280). Neue Prüfung mit nachgebildeten Supabase-Funktionen: Link im Text, Daten sparsam, Seite zeigt Stand ohne Menü, Aktualisierung nach Statuswechsel, abgelaufener Link, Rückfall ohne Einrichtung. Seite hell/dunkel bei 390 px angesehen. SW v54.
- **Achtung:** GitHub weiter nicht verbunden. Liegt lokal auf `claude/termine-design` (2.51–2.53). Nicht live.

## 08.10.2026 (2. Lauf) — Version 2.52: Akzentfarbe frei wählbar
- **Anlass:** Inhaber 08.10.: keiner der Vorschläge A/B/C gefällt, „die App sollte individuell sein können“. Außerdem entschieden: Umsatz bei 800.000 € (E-Rechnung-Pflicht ab 2028, Export trotzdem für alle bauen), Statusseite per Link (Stufe B) gewünscht.
- **Gebaut:** Einstellungen → Erscheinungsbild → „Akzentfarbe“: 7 ruhige Vorschläge (erster = Standard/zurücksetzen) + bunter Kreis mit Farbwähler für jede Farbe. `S.settings.akzent`, `applyAkzent()` (aus `applyTheme`) setzt `--acc/--acc-ink/--acc-bg` als Inline-Stil am body, gilt hell und dunkel. Schriftfarbe auf dem Akzent per WCAG-Kontrast automatisch dunkel/weiß. Kreise 44 px, umbrechend.
- **Test:** Smoke-Test grün (390/1280), neue Prüfung: Vorschlag setzen, eigene dunkle/helle Farbe → Schrift weiß/dunkel, Zurücksetzen. Screenshots Einstellungen hell/dunkel angesehen (erster Entwurf lief rechts aus der Karte, behoben). SW v53.
- **Achtung:** GitHub weiter nicht verbunden. Liegt lokal auf `claude/termine-design` zusammen mit 2.51. Nicht live.
- **Nächster Handgriff:** Sobald GitHub geht: hochladen, PR, mergen, live prüfen. Dann Statusseite per Link (Stufe B).

## 06.10.2026 (4. Lauf) — Version 2.51: Design-Lauf Terminkalender
- **Achtung:** GitHub-Zugang in dieser Sitzung fehlt (git fetch/push und GitHub-Werkzeuge abgelehnt: kein GitHub-Konto verbunden). Arbeit liegt fertig auf dem lokalen Zweig `claude/termine-design`, noch nicht live. Live ist weiter 2.50.
- **Gebaut:** Wochenraster passt bei 390 px ohne Seitwärts-Wischen (7 Tage, Spalten `flex:1;min-width:0`, min-width 330). Sa/So leicht grau, heutiger Tag in Akzent-Türkis statt altem Blau. Uhrzeiten 10 px statt 8,5 px, Termine 10 px mit Uhrzeit oben. Kopf: Wochentag klein, Tageszahl groß. Knopf „Heute“ (nur in anderen Wochen). Pfeile mit aria-label. Buchungslink-Karte mit normaler Überschrift und lesbarer Schrift (12 px), Text in Sie-Form und Hinweis, dass erst der Inhaber bestätigt.
- **Test:** Smoke-Test grün (390/1280), neue Prüfung „alle 7 Tage sichtbar + Heute-Knopf“. Screenshots hell/dunkel angesehen. SW v52.
- **Offen / nächster Handgriff:** Sobald GitHub wieder geht: Zweig hochladen, PR, mergen, live prüfen. Danach nächstes Paket. Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €, Kundenportal Stufe B.

## 06.10.2026 (3. Lauf) — Version 2.50: Kundenportal Stufe A („Status an Kunden senden“)
- **Recherche:** entfallen (Umsetzung von `docs/kundenportal.md`, Stufe A).
- **Gebaut:** `statusMsg(a)` schreibt einen fertigen Text: Gruß mit Kundenname, Fahrzeug + Kennzeichen, Status in Alltagssprache (bei „Wartet auf Teile“ mit Liefertermin aus bestellten Teilen), „voraussichtlich fertig“ aus `abgabe`/`abgabeZeit`, bei „fertig“ „Zu zahlen bei Abholung“ aus `ordKalk`, nächste HU, Werkstatt-Telefon, `wsGruss()`. Knopf „Status an Kunden senden“ im Kunden-Bereich des Auftrags öffnet ein Blatt mit änderbarem Text. „Per WhatsApp senden“ protokolliert in `a.komm` und öffnet wa.me. Ohne Telefonnummer wird der Text kopiert. Kein Server, keine neuen Daten im Netz.
- **Test:** Smoke-Test grün (390/1280). Er prüft Textinhalt für „In Arbeit“ und „Fertig“ sowie den Ablauf Knopf → Blatt → Senden → Protokolleintrag. SW v51.
- **Offen / nächster Handgriff:** Nächster Lauf ist ein Design-Lauf: Termine. Stufe B (Statusseite per Link) nur nach Zustimmung des Inhabers. Weitere offene Antworten: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 06.10.2026 (2. Lauf) — Konzept Kunden-Statusseite (keine App-Änderung)
- **Erstellt:** `docs/kundenportal.md`. Begründung aus den Recherchen 01.10. und 05.10. Datensparsame Feldliste: gekürztes Kennzeichen, Status, HU-Monat, Service-Schätzung, Werkstatt-Kontakt, **kein** Name, keine Preise und keine Fotos. Drei Stufen: A WhatsApp-Status-Knopf ohne Server, B Link-Statusseite mit eigener Supabase-Tabelle `status_links` (128-Bit-Schlüssel, nur per Schlüssel lesbar, Ablauf 30 Tage nach Abholung, getrennt von der Gesamt-Sicherung), C Freigabe von Zusatzarbeiten über den Link.
- **Technischer Befund:** Das Cloud-Backup speichert den ganzen Stand `S` in einer Zeile. Eine öffentliche Seite darf auf keinen Fall darauf zugreifen, deshalb ist eine eigene Tabelle Pflicht.
- **Test:** Keine App-Änderung. Version bleibt 2.49.
- **Offen / nächster Handgriff:** Stufe A bauen: Knopf „Status an Kunden senden“ im Auftrag (Text aus Status, `abgabeZeit`, HU-Monat, `wsGruss()`, öffnet WhatsApp und protokolliert in der Kommunikation). Danach Design-Lauf Termine. B erst nach Zustimmung des Inhabers.

## 06.10.2026 — Version 2.49: Design-Lauf 5 (Auftragsliste)
- **Recherche:** entfallen (Design-Lauf).
- **Befund:** Rechte Spalte in `ordRow`: Der Status stand als farbiger Text mit hängendem „·“, die AW als `<b>` darunter in Preisgröße (erbt `.lr b`). Das sah unruhig aus. Der rote Punkt (Notiz) hatte keine Erklärung.
- **Gebaut:** `.ord-meta` mit Status als kleinem Schild (`.ord-st`, Statusfarbe auf 8 % Fläche) und AW dezent als `<em>`. Der Notiz-Punkt hat jetzt `title`/`aria-label` „Notiz vorhanden“. Der Smoke-Test macht auch `auftraege-hell/-dunkel.png`.
- **Test:** Smoke-Test grün (390/1280). SW v50.
- **Offen / nächster Handgriff:** Normaler Lauf: C-Idee bewerten (Fälligkeiten-Einblick/Kunden-Statusseite braucht Server und Datenschutz, also erst Konzept unter `docs/`). Alternativ kleine Qualitätsrunde. Nächster Design-Lauf: Termine. Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 05.10.2026 (4. Lauf) — Version 2.48: HU-/Wartungs-Erinnerungen mit eigenem Werkstattnamen
- **Recherche (e) Kfz-Branche:** Laut DEKRA/Ipsos-Studie 2026 wünschen sich 56 % der Autobesitzer Einblick in Service- und HU-Fälligkeiten, aber nur 17 % der Werkstätten bieten das an. HU/AU-Erinnerungen 4–6 Wochen vorher führen laut Ratgeber zu über 80 % Buchungen. Quellen: catama-software.de (DEKRA/Ipsos-Studie, Ratgeber automatische Erinnerungen), autohaus.de. → Die Funktion gibt es in mehanicar schon (Anfragen → Wartung & HU), deshalb Feinschliff statt Neubau.
- **Gebaut:** `wsGruss()` gibt „Ihre <Werkstattname aus Einstellungen>“ zurück. Alle festen Signaturen „Ihre mehanicar Meisterwerkstatt“ in Erinnerungs- und Antworttexten sind ersetzt, in den Kampagnen-Vorlagen steht jetzt der Platzhalter `{firma}` (`kampFill` ersetzt ihn, auch für alte gespeicherte Texte). Startseite: „überfällig“ nur noch bei echt überfälligen Einträgen, sonst „bald fällig“ mit Hinweis auf 4–6 Wochen Vorlauf.
- **Test:** Smoke-Test grün (390/1280), prüft Werkstattname in Radar-HU-Nachricht und Kampagnen-Vorlage. SW v49.
- **Offen / nächster Handgriff:** Nächster Lauf ist ein Design-Lauf: Auftragsliste. C-Idee aus Recherche: Kunden-Statusseite / Fälligkeiten-Einblick per Link (größer, erst Konzept). Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 05.10.2026 (3. Lauf) — Version 2.47: Design-Lauf 4 (Einstellungen) + Fehlerbehebung
- **Fehlerfund (eigener aus 2.46):** In den Einstellungen wurde der Knopf „Einschalten“ (Zahl am App-Symbol) zu einer senkrechten Buchstabenspalte gestaucht, weil `.kv .k` `flex-shrink:0` hat und der lange Beschreibungstext keinen Platz ließ. Behoben mit `.kv.kv-flex` (Beschriftung darf schrumpfen) und `.kv .v .btn{white-space:nowrap}`. Die 2.46 war seit ca. 6 h live, betroffen war nur dieser eine Knopf.
- **Lehre / neue Prüfung:** `a11y()` im Smoke-Test meldet jetzt „gestauchte Knöpfe“ (kurzer Text, Höhe > 64 px und > 1,5 × Breite). Gegenprobe: Ohne die Korrektur schlägt der Test an.
- **Design:** Platzhalter-Texte jetzt dünn und hellgrau (`::placeholder` font-weight 400), sie wirkten sonst wie echte Eingaben. Die Bilder im Smoke-Test warten jetzt, bis die Einblend-Animation fertig ist.
- **Test:** Smoke-Test grün (390/1280). SW v48.
- **Offen / nächster Handgriff:** Normaler Lauf: Recherche (e) Kfz-Branche + passende Kleinigkeit, oder C-Idee. Nächster Design-Lauf: Auftragsliste. Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 05.10.2026 (2. Lauf) — Version 2.46: Zahl am App-Symbol
- **Recherche:** entfallen (C-Idee vom 02.10. umgesetzt).
- **Gebaut:** `syncBadge()` nach jedem Render setzt `navigator.setAppBadge(n)` mit n = Anfragen mit Status „neu“, aber nur bei `S.settings.badge` (neues optionales Feld, Standard aus). In Einstellungen → Erscheinungsbild gibt es „Zahl am App-Symbol“ mit Knopf Einschalten/Ausschalten. Die Mitteilungs-Erlaubnis (auf iOS nötig) wird nur auf diesen Tipp abgefragt, bei „gesperrt“ kommt ein Hinweis. Ohne Badge-Unterstützung steht dort „auf diesem Gerät nicht möglich“. Grenze: Die Zahl wird nur aktualisiert, wenn die App läuft, es gibt kein Push. Das steht ehrlich im „Was ist neu“.
- **Test-Fund:** Der Smoke-Test rief echtes Cloud-Backup (Supabase) auf. In dieser Umgebung ist der Host gesperrt, deshalb gab es zeitweise einen Konsolenfehler. Der Test beantwortet externe Aufrufe jetzt lokal (`ctx.route`), damit ist er unabhängig vom Netz. Mit `NETLOG=1` werden fehlgeschlagene Netz-Aufrufe ausgegeben.
- **Test:** Smoke-Test grün (390/1280), mit simuliertem `setAppBadge`: aus → 0, ein → Anzahl neuer Anfragen, aus → 0. SW v47.
- **Offen / nächster Handgriff:** Nächster Lauf ist ein Design-Lauf: Einstellungen. Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 05.10.2026 — Version 2.45: Design-Lauf 3 (Finanzen)
- **Recherche:** entfallen (Design-Lauf).
- **Befund:** Die Schalter „Sichtbare Bereiche“ (`.tag` ohne Hintergrund) wirkten wie Fließtext, und ihr Zustand war nur an der Deckkraft erkennbar. Das Diagramm zeigte ohne Rechnungen nur leere Balken und hatte keine Legende.
- **Gebaut:** `.fchip` mit 36 px: an = graue Fläche mit ✓, aus = gestrichelter Rand, dazu `aria-pressed`. Leerhinweis im Diagramm (`.fin-leer`) und Legende Umsatz/Gewinn (`.fin-leg`). Smoke-Test macht jetzt auch `finanzen-hell/-dunkel.png`.
- **Test:** Smoke-Test grün (390/1280). SW v46.
- **Offen / nächster Handgriff:** Normaler Lauf: C-Idee „Zahl am App-Symbol“ (Badge API) oder Recherche-Thema (e) Kfz-Branche. Nächster Design-Lauf: Einstellungen. Antworten des Inhabers offen: Akzentfarbe A/B/C, Umsatz > 800.000 €.

## 04.10.2026 (4. Lauf) — Version 2.44: Bildschirm bleibt an bei laufender Stechuhr
- **Recherche:** entfallen (C-Idee vom 02.10. umgesetzt).
- **Gebaut:** `syncWakeLock()` läuft nach jedem Render und bei `visibilitychange`. Läuft in irgendeinem Auftrag `timerStart` und ist die App sichtbar, wird `navigator.wakeLock.request('screen')` angefordert, sonst freigegeben. Sicher gegen ein Wettrennen bei noch laufender Anforderung. Ohne Wake-Lock-Unterstützung passiert nichts. Unter der Stechuhr steht der Hinweis „Bildschirm bleibt an, solange die Zeit läuft“. Keine Erlaubnis nötig, keine Daten-Migration.
- **Test:** Smoke-Test grün (390/1280), mit simuliertem `navigator.wakeLock`: Start → 1 Anforderung, Pause → 1 Freigabe. SW v45.
- **Offen / nächster Handgriff:** Nächster Lauf ist ein Design-Lauf: Finanzen. Antworten des Inhabers offen: Akzentfarbe A/B/C und Umsatz > 800.000 €.

## 04.10.2026 (3. Lauf) — Version 2.43: Design-Lauf 2 (Kundenliste) + Farbvorschlag
- **Recherche:** entfallen (Design-Lauf).
- **Befund:** Kürzel-Kreise in 5 bunten Farben (zufällig nach Name) wirkten unruhig, Firmenkunden waren nicht erkennbar.
- **Gebaut:** Einheitliche Kürzel (`.kav-privat` grau, `.kav-firma` Schiefer, dunkel gedämpftes Blaugrau) und das Schild „Firma“ in der Kundenliste. Vorschlagsseite `designs/akzent.html` mit A Gelbgrün (heute), B Petrol, C Werkstatt-Blau, je hell/dunkel an Knopf, „+“, Menü und Schild. Die Akzentfarbe liegt zentral in `--acc` / `--acc-ink` / `--acc-bg` (Zeilen ~23, 664, 702, 738), ein Wechsel ist also schnell. Smoke-Test macht jetzt auch `kunden-hell/-dunkel.png`.
- **Test:** Smoke-Test grün (390/1280). Vorschlagsseite: 0 JS-Fehler, kein horizontales Scrollen. SW v44.
- **Offen / nächster Handgriff:** Antwort des Inhabers zur Akzentfarbe (A/B/C) abwarten. Bei B oder C die 4 `--acc`-Blöcke tauschen und Kontrast prüfen (weiße Schrift auf Akzent ≥ 4,5:1). Nächster normaler Lauf: C-Idee „Zahl am App-Symbol“ oder „Bildschirm bleibt an“. Nächster Design-Lauf: Finanzen.

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
