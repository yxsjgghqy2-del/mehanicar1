# mehanicar — Finale Version: Arbeitsstand

## Status: ALLE PHASEN + 5 NACHT-PRÜFRUNDEN ABGESCHLOSSEN ✅ (13.07.2026)

**Zusammenfassung der Nacht (Fable-Sitzung):** Nach den 5 Ursprungs-Phasen liefen zusätzlich ein Nacht-Feature-Paket (5 Teile) und 4 adversariale Prüfrunden (XSS, Geldberechnung, Datenintegrität, Feld-/Logik-Konsistenz). Gefunden und behoben: **~16 echte Bugs**, darunter 3× derselbe Absturzklasse (Import/Cloud-Restore/Demo-Reset übersprangen die Datenmigration), 4× XSS, mehrere Geld-Korrektheitsfehler (Anzahlung-Restbetrag, DATEV-Drift, Lagerbestand-Sync, negative Rabatte), sowie Konsistenzlücken (fehlender Ansprechpartner auf Rechnung, pak-create ignorierte Freigabe-Regel). Abschließender Regressionslauf: 9 Test-Suiten, 40+ Einzelprüfungen, 0 Fehler. Aktuell **SW v17**, Branch `fix/nav-segctrl-2`, laufend in `main` gemerged und auf Vercel live.

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Rechtliches: Impressum + Datenschutz (aus Firmendaten generiert), Links auf Buchungsseite, Rechnung mit Leistungsdatum + Steuernr. (§14 UStG) | ✅ |
| 2 | Design: Aufträge-Dringlichkeitsgruppen, „Jetzt wichtig"-Liste (Planung), Kunden A–Z, Anfragen-Triage-Modus, Termine-Heute-Agenda | ✅ |
| 3 | Funktion: Onboarding (erster Start), Fahrzeugschein-Scan (/api/scan + UI), KI-Defaults (Haiku 4.5), PNG-Icons, iOS-Install-Hinweis, SW v4 | ✅ |
| 4 | QA: Playwright-E2E (12 Szenarien, 0 JS-Fehler), Selftest grün, Merge → main | ✅ |

## Vom Betreiber noch zu erledigen (einmalig)

1. **ANTHROPIC_API_KEY** in Vercel setzen (Settings → Environment Variables) — sonst laufen KI-Einschätzung und Schein-Scan regelbasiert/gar nicht.
2. **Firmendaten** in Einstellungen → Firma vollständig ausfüllen (Impressum-Pflicht!).
3. Eigene Domain in Vercel verbinden (optional).

## Architektur-Notizen (für Wiedereinstieg)

- Alles in `index.html`. State `S` in localStorage `mehanicar_v2`.
- Handler: `ACT[...]` (data-act Klicks), `FSET[...]` (data-f Inputs). Views `v*()`, Routing über `route`+`render()`.
- Onboarding: `S.settings.onboarded` — Gate in `render()`, öffentliche Views (buchen/impressum/datenschutz) ausgenommen.
- KI: `kiAnalyze()` → `S.settings.ki.endpoint` (Default `/api/analyse`, Modell Haiku 4.5) → Fallback `ruleAnalyze()`.
- Schein-Scan: `ACT['schein-scan']` in Fahrzeug-Sheet → `/api/scan` (Vision).
- Deploy: Branch-Push = Preview; Merge in `main` = Produktion. SW-Cache-Version bei UI-Änderungen bumpen (aktuell **v4**).

## Wichtige Regel

Online-Terminbuchung: Anfragen IMMER mit status 'neu' — Inhaber bestätigt selbst. Nie auto-bestätigen. (Per QA-Test abgesichert.)

## Nacht-Update (12./13.07.)

Umgesetzt: Scan-first "Neuer Auftrag" (Segmente Bestehend/Neu + Privat/Firma, Ansprechpartner, volle Fahrzeugdaten optional aufklappbar), Galerie-Zugriff beim Schein-Scan, Layout-Shift-Fixes (Datum/Zeit-Inputs, Pills ohne Scale, Fahrzeugliste per Klassen-Toggle), Status als Dropdown + „Sonstiges" mit Freitext, Auftragsfreigabe ohne Unterschrift (tel/mail/wa/ig/pers + Link zur Originalnachricht, Anfrage-Verknüpfung), Auto-Erweiterung nach Freigabe (Checkbox entfernt), posSheet: kein EK bei Arbeit, AW-Satz je Auftrag/Position änderbar (VK=AW×Satz live), AP-Datenbank (20 Seeds + Lernen + Datalist + Kombi-Vorschläge via AP_KOMBI), Befund&Abhilfe-Positionen (auch auf Rechnung), Anfrage→Auftrag legt Beanstandung wörtlich als Befund an (Paket = Techn. Beanstandung), Kommunikations-Historie mit System-Einträgen (Anlage/Status/Rechnung/Freigabe/Unterschrift), Video-Guard 12MB, FSET-Hoisting-Bug behoben. SW v9.

## Nacht-Paket 5 (Ausbau dünner Bereiche) + kritischer Bugfix

- **Kritischer Bug behoben**: `seed()` (Demo-Start-Pfad) initialisierte `krankmeldungen`/`urlaub`/`meta` nicht — jeder frische Demo-Start crashte beim ersten Öffnen von Personalwesen → Krankmeldung/Urlaub speichern (`Cannot read properties of undefined (reading 'push')`). Jetzt in `seed()` UND defensiv in `migrate2()` abgesichert.
- Kaputtes `style`-Attribut in Personalwesen (Krankmeldung/Urlaub-Zeilen) repariert — `;font-weight:800` landete außerhalb der Anführungszeichen und wirkte nie.
- Bestellungen: manuelle Bestellung (Lieferant, ETA, freie Positionen) unabhängig von Mindestbestand-Liste; Überfällig-Warnung wenn ETA verstrichen.
- Kampagnen: E-Mail-Fallback für Kunden ohne Telefonnummer aber mit E-Mail-Adresse (mailto: statt WhatsApp).
- SW v12.

## Runde 2: Kritische Audits (XSS, Geldberechnung, Datenintegrität)

Drei parallele Audit-Agenten durchsuchten die App adversarial. Alle folgenden echten Bugs wurden gefunden, verifiziert (Exploit-Payload bzw. Zahlenbeispiel) und behoben:

**XSS (4 Lücken, alle über esc() geschlossen):**
- Kunde-Detailseite: `title:k.name` ungeescaped im Seitentitel
- Fahrzeug-Detailseite: `title:f.kennz` ungeescaped
- Anfrage-Löschen-Dialog: `x.name` (kommt von der öffentlichen Buchungsseite — höchstes Risiko!) ungeescaped in confirmBox
- Mitarbeiter-Löschen-Dialog: `m.name` ungeescaped in confirmBox
Alle vier per echtem `<img onerror>`-Payload in Playwright verifiziert — vorher/nachher.

**Geldberechnung (mehrere echte Bugs):**
- Negative Rabatte (Position/Paket/Auftrag) erhöhten den Preis statt ihn zu senken → jetzt auf `Math.max(0,…)` geklemmt
- Negativer EK bei Teilen täuschte künstlich hohen Gewinn vor → geklemmt
- **Anzahlung bei Teil-Rechnungen**: Bool-Flag `anzVerr` verlor den Restbetrag bei mehreren Teilrechnungen (Beispiel: 500€ Anzahlung, 1. Teilrechnung 141,61€ verrechnet, Rest 358,39€ wäre bei 2. Teilrechnung komplett verloren gegangen). Umgebaut auf `anzVerrCt`-Zähler mit korrekter Restbetrag-Fortschreibung; Migration für Bestandsdaten; Restbetrag jetzt auch sichtbar im Auftrag.
- **DATEV-Export** berechnete Netto/MwSt live mit dem AKTUELLEN Steuersatz neu statt die zum Rechnungsdatum tatsächlich fakturierten Werte zu nehmen → driftete nach jeder MwSt-Satz-Änderung für alle Altrechnungen. Jetzt: gespeicherte `nettoCt`/`mwstCt` der Rechnung werden verwendet.
- **Lagerbestand-Drift**: Mengenänderung einer lagergebundenen Teile-Position in der Kalkulationsansicht zog den Lagerbestand nie nach (nur Anlegen/Löschen buchten). Jetzt: Mengenänderung bucht die Differenz korrekt um. Verifiziert: Menge 1→5 auf Lagerartikel mit Bestand 14 → korrekt 10.
- NaN-Schutz beim Einfügen einer (potenziell korrupten/importierten) Paket-Vorlage.

**Datenintegrität:**
- `pak-del` machte zugehörige Fotos dauerhaft unsichtbar (Base64-Daten blieben, aber keine UI-Zuordnung mehr) → Fotos werden jetzt beim Paket-Löschen zu „Annahme/Allgemein" verschoben statt verwaist.
- `lager-del` hatte keine Sperre — Löschen eines Teils, das noch in offener Bestellung oder laufendem Auftrag steckt, führte zu stillem Bestandsverlust beim späteren Einbuchen. Jetzt gesperrt mit klarer Fehlermeldung.
- **Kritischer Fund**: Sowohl der JSON-Backup-Import (`data-import`) als auch die Cloud-Wiederherstellung (`cloudAdopt`) übersprangen `migrate2()`/`kunNorm()` komplett — ein Import eines alten Backups (vor heute Nacht) hätte denselben Personalwesen-Absturz reproduziert, der gestern Nacht bereits gefixt wurde. Jetzt rufen beide Pfade `kunNorm()`+`migrate2()` auf. Per echtem File-Upload-Test verifiziert.

SW v13.

## Runde 2 abgeschlossen: Performance-Test bei großer Datenmenge

Simuliert: 500 Kunden, 600 Fahrzeuge, 1000 Aufträge, 300 Anfragen, 400 Rechnungen (weit über realistischer Größe einer einzelnen Meisterwerkstatt). Ergebnis: alle Render-Zeiten unter 510ms (Planung 508ms, Aufträge 397ms, Kunden 66ms, Anfragen 143ms, Finanzen 57ms), keine JS-Fehler, Live-Suche liefert bei 500 Kunden korrekt exakt 1 Treffer. Kein Performance-Bug — App bleibt auch weit jenseits normaler Nutzung benutzbar.

**Alle 4 Aufgaben aus Runde 2 (XSS, Geldberechnung, Datenintegrität, Backup/Performance) abgeschlossen und deployed.**

## Runde 3: Weiterer kritischer Fund — Demo-Reset & Alles-löschen

Beim systematischen Durchklicken jeder Einstellungs-Aktion gefunden:
- **`demo-reset`** (Einstellungen → „Demo-Daten neu laden") übersprang ebenfalls `migrate2()` — dritter unabhängiger Fundort desselben Musters (nach Import und Cloud-Restore letzte Nacht). Nach einem Reset war `S.apDb` undefined; das nächste Speichern einer Arbeitsposition (`apLearn`) crashte mit „Cannot read properties of undefined (reading 'find')".
- Zusätzlich entdeckt: `demo-reset` setzte `onboarded` nie zurück auf `true` (weil `seed()` es für den Erstinstallations-Fall bewusst auf `false` setzt) — ein bereits aktiver Nutzer landete nach „Demo-Daten neu laden" fälschlich wieder im Willkommensbildschirm statt in der App. Kein Absturz, aber ein handfester UX-Bug, der die Funktion für jeden Nutzer unbrauchbar machte.
- `data-wipe` („Alles löschen") hatte dieselbe migrate2-Lücke.
- Fix: beide Handler rufen jetzt `kunNorm()`+`migrate2()`; `demo-reset` setzt zusätzlich `onboarded=true` und die Route zurück auf Planung. `apLearn` bekam zusätzlich eine defensive `S.apDb=S.apDb||[]`-Absicherung als zweite Verteidigungslinie.
- Alle Fixes per vollständigem End-to-End-Test verifiziert (6/6 Prüfungen grün, inkl. Absturz-Reproduktion vorher/nachher).

**Erkenntnis**: `migrate2()` wird jetzt an sechs Stellen aufgerufen (load, JSON-Import, Cloud-Restore, demo-reset, data-wipe, initiale seed()-Erstellung). Jeder Pfad, der `S` komplett neu zuweist, MUSS migrate2() aufrufen — als Regel für zukünftige Erweiterungen festgehalten.

SW v14.

## Runde 3 (Fortsetzung): Statischer Handler-Abgleich

Alle `ACT[...]`/`FSET[...]`-Definitionen gegen alle im Code referenzierten `data-act`/`data-f`-Werte kreuzgeprüft (Python-Skript). Ergebnis: sechs vermeintliche „Bugs" waren False-Positives (Handler über `ACT.name=` Punktnotation oder `data-act="${var}"` dynamisch zusammengesetzt — beides korrekt verdrahtet). Ein echter Fund:

- **`anfr-mail`**: fertig implementierter Handler, aber nie mit einem Button verbunden. In der Anfragen-Liste blieb die Aktionsleiste für Anfragen ohne Telefonnummer (nur E-Mail — z. B. Web-/Mail-Kanal) komplett leer, obwohl `anfr-wa`/`anfr-call` für Telefon-Anfragen längst da waren. Jetzt: „Per E-Mail"-Button erscheint als dritte Variante. Guard-Bedingung war zudem unsauber formuliert (prüfte `antwort` statt `email`) — korrigiert, plus Betreffzeile ergänzt zur Angleichung an das Pendant `anfr-repl-mail` in der Detailansicht.

SW v15.

## Runde 4: Feld-Konsistenz-Audit (Ansprechpartner, Kraftstoff, Farbe)

Neue Felder von letzter Nacht wurden nur in den Formularen und der Kundenakte angezeigt, fehlten aber an den Stellen, wo sie im Alltag am meisten zählen:
- **Ansprechpartner**: fehlte im Auftrag (Kunde-Karte — genau dort, wo ein Mitarbeiter nachschaut, wen er bei einer Firma anrufen soll) und auf der gedruckten Rechnung/Übersicht (kein „z. Hd."). Beides ergänzt.
- **Kraftstoff/Farbe**: fehlten im Auftrag (Fahrzeug-Karte). Ergänzt als kompakte Zeile.

Zusätzlich verifiziert (kein Bug gefunden): Doppelklick-Schutz bei Rechnungserstellung — `confirmBox` entfernt sich synchron aus dem DOM vor Ausführung, ein zweiter Klick trifft ins Leere. Per hartem synchronem Doppel-Dispatch-Test bestätigt.

SW v16.

## Runde 4 (Fortsetzung): pak-create respektierte die Freigabe-Regel nicht

Einzelne Positionen (Arbeit/Teil) markieren sich nach Auftragsfreigabe automatisch als Erweiterung — ein komplett NEUES Paket (`pak-create`) tat das nicht, sondern setzte immer `ext:false`. Ein Mechaniker, der nach Freigabe ein völlig neues Problem entdeckt (eigenes Paket statt einzelne Position), hätte das ohne Protokoll-Eintrag und ohne „Erweiterung"-Kennzeichnung durchrutschen lassen können — genau die Transparenz, die die Freigabe-Funktion eigentlich garantieren soll. Jetzt konsistent: `pak-create` prüft `ordFreigegeben(a)`, markiert entsprechend und protokolliert in der Kommunikations-Historie. Nebenbei: leeres frisches Erweiterungs-Paket zeigte fälschlich „0 Erweiterungen" statt eines sinnvollen Labels — jetzt „Neu · Erweiterung". Per vollständigem Vorher/Nachher-Test verifiziert.

SW v17.

## Runde 5: Dunkelmodus-Verifikation + Kapazitätsplan-Audit

- **Dunkelmodus**: alle heute Nacht neu gebauten UI-Bereiche (Kunden-/Fahrzeug-Picker, AP-Verwaltung, Paket-Vorlagen, Freigabe-Block) per Screenshot in `colorScheme:'dark'` geprüft — durchweg korrekt, keine hellen Aussetzer, guter Kontrast, CSS-Variablen konsequent genutzt.
- **Kapazitätsplan (10-Tage-Bühnenplan)**: bisher unangetasteter, älterer Code-Bereich gezielt geprüft (Datums-Range-Logik, AW-Aggregation, Effizienzberechnung, Status-Filterung inkl. neuem „Sonstiges"-Status). Sauberer Befund — kein praktisch erreichbarer Bug gefunden. Ein rein theoretischer Randfall (Auftrag ganz ohne `annahme` UND `abgabe`) ist über keinen UI-Pfad erreichbar, da jede Auftragsanlage `annahme` immer setzt.

## Abschließender Regressionslauf

9 Test-Suiten erneut komplett durchlaufen (Nacht-Kernfunktionen, AP-Datenbank, Bestellungen/Kampagnen, XSS-Fixes, Lager-Sync, Anzahlung-Restbetrag, Backup-Roundtrip, Demo-Reset/Wipe, Leerzustände) — **alle grün, 0 JS-Fehler.** Die App ist nach fünf vollständigen Prüfrunden in einem soliden, verifizierten Zustand.

## Runde 6: Langjähriger Statistik-Bug in Finanzen gefunden

Beim gezielten Blick auf bisher unangetastete Bereiche (Finanzen-Statistiken, nicht Teil der heutigen Nacht-Features) gefunden — ein **Einheiten-Bug, der vermutlich schon lange in der App steckt**: „Umsatz nach Mitarbeiter · 90 Tage" filterte mit `Date.parse(r.datum)*86400000>t90-86400000` — `Date.parse()` liefert bereits Millisekunden, die Multiplikation mit weiteren 86.400.000 (ms/Tag) macht daraus eine astronomisch große Zahl (~1,36×10²⁰ statt ~1,6×10¹²), wodurch der Vergleich für **jedes gültige Rechnungsdatum immer wahr** war. Die „90 Tage"-Statistik zeigte in Wahrheit seit jeher den Umsatz aller Zeiten — nur falsch beschriftet. Fix: korrekter direkter Millisekunden-Vergleich `Date.parse(r.datum)>=t90`. Codebase auf identisches Bug-Muster durchsucht — alle anderen Datums-Differenzen im Code sind korrekt (dividieren statt multiplizieren), Bug war isoliert. Per echtem Zahlenbeispiel verifiziert (alte Rechnung 2020 fließt jetzt korrekt nicht mehr ein).

SW v18.
