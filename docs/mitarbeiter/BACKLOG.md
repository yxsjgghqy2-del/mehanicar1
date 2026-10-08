# Backlog — mehanicar

Priorität von oben nach unten. Erledigtes wird entfernt und im LOG vermerkt. Jede Idee hat eine Herkunft (Inhaber / Recherche / Fehlerfund).

## A — Wünsche des Inhabers
- **Akzentfarbe frei wählbar** *(Inhaber, 08.10.2026: „Keine von den Akzentfarben gefällt mir … die App sollte individuell sein können.“)* In den Einstellungen unter „Darstellung“ einen Farbwähler plus einige ruhige Vorschläge. Gespeichert in `S.settings.akzent`, setzt `--acc/--acc-ink/--acc-bg` für hell und dunkel; Schriftfarbe auf dem Akzent automatisch hell/dunkel nach Kontrast. Vorschau sofort, „Zurücksetzen“ auf Standard. `designs/akzent.html` ist damit erledigt.
- **Kunden-Statusseite per Link (Stufe B)** *(Inhaber, 08.10.2026: „Ja, der Kunde soll den Auftragsstand über einen Link sehen können.“)* Umsetzung laut `docs/kundenportal.md` Stufe B: Seite `#/status/<schlüssel>`, Tabelle `status_links`, fertiges SQL-Stück + Anleitung für den Inhaber (einmal in Supabase ausführen), Textvorschlag Datenschutz. Bis das SQL läuft, bleibt der Knopf ausgeblendet bzw. zeigt einen Hinweis.
- **Design regelmäßig pflegen** *(Inhaber, 03.10.2026: „Kümmere dich auch regelmäßig um das Design.“)* Dauerauftrag: Jeder 3. Lauf ist ein Design-Lauf (siehe ROUTINE.md). Dabei eine Ansicht bei 390 px hell und dunkel ansehen und Abstände, Schriftgrößen, Ausrichtung, Farben und Einheitlichkeit mit dem Stil von Entwurf 14 verbessern. Erledigt: Planung (2.41), Kundenliste (2.43), Finanzen (2.45), Einstellungen (2.47), Auftragsliste (2.49), Termine (2.51). Nächste: Anfragen, Auftragsmaske-Details.

## B — Qualität & Pflichten
4. **Kunden-Statusseite** — Stufe A erledigt in 2.50, Stufe B zugestimmt (siehe A). Stufe C (Freigabe) erst nach B.
5. **E-Rechnung** — Konzept steht in `docs/e-rechnung.md` (02.10.2026). Pflicht gilt nur für Firmenkunden: ab 2028, bei > 800.000 € Vorjahresumsatz schon ab 2027. Inhaber 08.10.2026: Umsatz liegt bei 800.000 € (nicht darüber) → Pflicht ab 01.01.2028. Inhaber wünscht: App soll für jede Werkstatt passen, also Export für alle bauen. Scheibe 1 erledigt in 2.37. Scheibe 2 (XRechnung-Export) nach den beiden A-Paketen.

## C — Ideen (aus Recherche, noch zu bewerten)
- Digitale Fahrzeugannahme mit Schadensfotos am Fahrzeugschema
- **Kunden-Statusseite per Link mit Freigabe von Zusatzarbeiten** („Ihr Auto ist fertig“, Erweiterung per Foto/Video freigeben) — Wettbewerber (SmartWerkstatt u. a.) bieten Kundenportal mit Freigabe + Video-Check als Standard. *(Recherche 01.10.2026, Quelle: fuer-gruender.de Vergleich 09/2026, smartwerkstatt.cloud)*
- **Fälligkeiten-Einblick für Kunden** (HU, Service) per Link, passt zur Kunden-Statusseite. 56 % der Kunden wünschen das, 17 % der Werkstätten bieten es. *(Recherche 05.10.2026, DEKRA/Ipsos via catama-software.de)*
- Teile-Preisvergleich / Bestellstatus
- Wiederkehrende Wartungsverträge

## Bekannte Hinweise
- `ANTHROPIC_API_KEY` in Vercel muss der Inhaber setzen, sonst laufen KI-Einschätzung und Schein-Scan nur regelbasiert. Nicht selbst ändern.
