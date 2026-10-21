# Backlog — mehanicar

Priorität von oben nach unten. Erledigtes wird entfernt und im LOG vermerkt. Jede Idee hat eine Herkunft (Inhaber / Recherche / Fehlerfund).

## A — Wünsche des Inhabers
- **NEU 19.10.: Prozesskonzept des Inhabers → `docs/mitarbeiter/PROZESSE.md` (7 Kernprozesse). Hat Vorrang vor allem Übrigen in A.** Vor jedem Baustein Rückfragen stellen (Inhaber-Wunsch). Bausteine (Reihenfolge mit Inhaber klären):
  - KP1: Anfrageformular neu (Kategorie, Pflichtfelder Name/Tel/FIN-oder-Scheinfoto/km/Anliegen, optional Mail/Medien), Bestandskunden-Erkennung (Tel/FIN), Status „Bestätigung ausstehend“, Slots blockieren (am Auftrag + frei), Bestätigung (Mail / Aufgabe „anrufen“ / SMS), Erinnerungen 3+1 Tage (einstellbar)
  - KP2: ~~Dialogannahme (2.70/2.71)~~ – ~~Checkliste für Kunden ausdrucken~~ (2.75). Ursprünglich: Dialogannahme mit vorausgefüllter Beanstandung + Unterschrift, roter Hinweis beim Überspringen, Kostenrahmen (Diagnose-Betrag bzw. KVA + Pauschale), Checkliste ✓/✗ mit Fotos (4 Seiten Pflicht), ✗ → technische Beanstandung (eigener Ordner, keine Positionen), Zusatzleistungen unten, „Räder einlagern?“ bei Räderwechsel
  - KP3: ~~Freigabe-Link, Erinnerung, abgelehnte Arbeiten (2.76)~~ · Diagnose-Freigabe Standard 500 €, Freigabe-Protokoll (Kanal/Zeit/Betrag/mit wem), Freigabe-Link per E-Mail (Freigeben/Ablehnen), Erinnerung bei fehlender Freigabe, abgelehnte Arbeiten beim nächsten Besuch zeigen
- **FOKUS 17.–20.10.2026: nur Kalkulation** *(Inhaber 17.10.: „Konzentrier dich jetzt bitte 3 Tage lang nur auf die Kalkulation und gib alles, diese weiter auszubauen.“)* Alles andere ruht bis 20.10. abends (auch Design-Läufe und „Einfach“-Umbau). Reihenfolge:
  1. ~~Teile-Aufschlag-Staffel + VK-Vorschlag~~ (2.60)
  2. ~~Kleinmaterial- & Entsorgungs-Pauschale automatisch (% vom Lohn mit Min/Max, Altöl/Altteile), je Auftrag abschaltbar, auf Rechnung/E-Rechnung~~ → 2.63 (18.10.)
  3. ~~Stundensätze nach Arbeitsart (Mechanik, Elektrik/Diagnose, Karosserie, Lack) – Satz je Position wählbar~~ → 2.65 (18.10.)
  4. Zielpreis rückwärts: „Kunde zahlt X € brutto“ → Rabatt automatisch, Rest-Marge sichtbar; Mindestmarge mit Warnung
  5. Kostenvoranschlag: Ausdruck/Teilen mit Gültigkeit, Freigabe-Grenze (+15 %) mit Warnung bei Überschreitung
  6. Preis-Varianten im Angebot (z. B. Original- vs. Qualitätsteile), Kunde wählt
  7. Nachkalkulation: geplante AW vs. gestempelte Zeit je Auftrag (Gewinn wirklich?)
  - ~~**Inhaber 18.10. (Nacht): Kalkulation nach Ablauf + Kostenrahmen**~~ → Inhaber wählte Vorlage 5 (Werkstattbericht) fürs Handy, ohne Balken oben, Freigabe als Hinweis rechts neben Diagnose, Prüfung als Unterpunkt der Diagnose → 2.67. Offen: Mac-Ansicht (Vorlage 7?), Freigabe der Abhilfe direkt per WhatsApp-Link vom Kunden bestätigen lassen.
  - ~~Vorlagen `designs/kalkulation-vorlagen.html`~~ – überholt durch `kalkulation-ablauf.html` (Nr. 5 gebaut).
  - ~~**Inhaber 18.10.: Kalkulation am Handy**~~ → 2.66 Liste (Paket = Ordner, Zeilen Text/AW/Preis, Details beim Antippen, Befund/Abhilfe, Hinweis, Beschreibung unter jeder Arbeit, eigene Positionen, Arbeit aus Katalog). Offen dazu: Mac-Ansicht mit Katalog rechts daneben, Kategorien im Katalog, passende Teile automatisch vorschlagen, Positionen verschieben.
  - **Inhaber 17.10.: „Der Prozess, wie ich den Auftrag mit den Positionen erstelle, gefällt mir nicht.“** 20 Eingabe-Konzepte in `designs/kalkulation-20.html`. Inhaber wählte **Nr. 5 (Tabelle)** → gebaut in 2.62. Nächste Schritte dazu: Paket-Spalte/Paket wechseln per Tastatur, ~~Rabatt-Spalte~~ (2.63), ~~Zeilen verschieben~~ (2.68 im Bericht).
- **To-Do (Inhaber 19.10.): Selbstlernende AW-Vorgaben.** Jede AW-Position wird anhand der tatsächlich gebrauchten Arbeitszeit bewertet. Brauchen Mechaniker für eine mit 3 Std kalkulierte Reparatur regelmäßig 4 Std, erkennt die App die Abweichung und schlägt eine neue AW-Vorgabe vor. Zusätzlich können Mechaniker jede AW-Position bewerten und Feedback geben. Außergewöhnliche Verzögerungen werden berücksichtigt (nicht mitgelernt). Passt zu KP3 „Zeiterfassung pro Position“ und Plan-Punkt 7 „Nachkalkulation“. Grundlage vorhanden: Arbeitswert-Katalog `S.apDb` (lernt bisher nur eingetippte AW), Stechuhr je Auftrag. **Vor dem Bau klären:** Einmannbetrieb heute – gilt es für den Inhaber selbst oder für spätere Mitarbeiter (je Mechaniker getrennt)? Zeit je Position per Start/Stopp oder am Ende eintragen? Wie viele Aufträge, bis ein Vorschlag kommt (z. B. ab 3)? Feedback-Form (z. B. „zu knapp / passt / zu viel“ + Grund)?
- **App viel einfacher / intuitiver** *(Inhaber 17.10.2026: „Das soll bitte alles noch viel viel einfacher aussehen, so dass es wirklich jeder versteht … nur intuitiver. Trotzdem komplexe Funktionen.“)* Vorschlag `designs/einfach.html` (Startseite „Heute“ mit Hauptknopf „Auto annehmen“, Anfragen als Hinweis, Auto-Karten mit 4-Schritt-Balken und einem nächsten Schritt; Auto-Detail: Preis, Arbeiten, zwei Knöpfe, Rest unter „Mehr“; Navigation Heute/Autos/Kunden/Kalender/Mehr). **Wartet auf Zustimmung**, dann Umbau Seite für Seite (zuerst Startseite, dann Auto-Detail, dann Navigation).
- **Inhaber 18.10.: eigenes Supabase-Projekt angelegt** (Region Europe). Offen beim Inhaber: SQL-Befehl ausgeführt? Beide Geräte mit **demselben Backup-Code** verbinden (Mac: „Mit anderem Gerät verbinden“). Datenbank-Passwort stand im Chat → Inhaber geraten, es in Supabase zurückzusetzen. Neuen Buchungslink weitergeben.
- **Design regelmäßig pflegen** *(Inhaber, 03.10.2026: „Kümmere dich auch regelmäßig um das Design.“)* Dauerauftrag: Jeder 3. Lauf ist ein Design-Lauf (siehe ROUTINE.md). Dabei eine Ansicht bei 390 px hell und dunkel ansehen und Abstände, Schriftgrößen, Ausrichtung, Farben und Einheitlichkeit mit dem Stil von Entwurf 14 verbessern. Erledigt: Planung (2.41), Kundenliste (2.43), Finanzen (2.45), Einstellungen (2.47), Auftragsliste (2.49), Termine (2.51), Anfragen (2.58). Akzentfarbe frei wählbar seit 2.52. Nächste: Auftragsmaske-Details.

## B — Qualität & Pflichten
0. Online-Terminbuchung: erledigt in 2.54. Nach Liveschaltung Inhaber an neuen Buchungslink erinnern.
4. **Kunden-Statusseite** — Stufe A 2.50, Stufe B 2.53. Stufe C (Freigabe von Zusatzarbeiten) später, nach Rücksprache.
5. **E-Rechnung** — Konzept steht in `docs/e-rechnung.md` (02.10.2026). Pflicht gilt nur für Firmenkunden: ab 2028, bei > 800.000 € Vorjahresumsatz schon ab 2027. Inhaber 08.10.2026: Umsatz liegt bei 800.000 € (nicht darüber) → Pflicht ab 01.01.2028. Inhaber wünscht: App soll für jede Werkstatt passen, also Export für alle bauen. Scheibe 1 erledigt in 2.37. Scheibe 2 (XRechnung-Export) erledigt in 2.56. Offen: Scheibe 3 (ZUGFeRD-PDF) nur bei Bedarf; Feld „Leitweg-ID/Bestellnummer“ in der Kundenmaske.

## B2 — Technik (nebenbei, je Lauf höchstens ein Schritt)
- **index.html aufteilen** *(Inhaber 16.10.2026: „alles umsetzen“)*: ~~1. CSS → `app.css`~~ (2.57); 2. Demo-Daten → `demo.js`; 3. Sync/Supabase → `sync.js`. Jeweils in `sw.js` SHELL aufnehmen, Cache-Version erhöhen, Smoke-Test grün.

## C — Ideen (aus Recherche, noch zu bewerten)
- Digitale Fahrzeugannahme mit Schadensfotos am Fahrzeugschema
- **Kunden-Statusseite per Link mit Freigabe von Zusatzarbeiten** („Ihr Auto ist fertig“, Erweiterung per Foto/Video freigeben) — Wettbewerber (SmartWerkstatt u. a.) bieten Kundenportal mit Freigabe + Video-Check als Standard. *(Recherche 01.10.2026, Quelle: fuer-gruender.de Vergleich 09/2026, smartwerkstatt.cloud)*
- **Fälligkeiten-Einblick für Kunden** (HU, Service) per Link, passt zur Kunden-Statusseite. 56 % der Kunden wünschen das, 17 % der Werkstätten bieten es. *(Recherche 05.10.2026, DEKRA/Ipsos via catama-software.de)*
- Teile-Preisvergleich / Bestellstatus
- Wiederkehrende Wartungsverträge

## Bekannte Hinweise
- `ANTHROPIC_API_KEY` in Vercel muss der Inhaber setzen, sonst laufen KI-Einschätzung und Schein-Scan nur regelbasiert. Nicht selbst ändern.
