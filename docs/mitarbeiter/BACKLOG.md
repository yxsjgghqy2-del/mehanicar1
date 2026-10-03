# Backlog — mehanicar

Priorität von oben nach unten. Erledigtes wird entfernt und im LOG vermerkt. Jede Idee hat eine Herkunft (Inhaber / Recherche / Fehlerfund).

## A — Wünsche des Inhabers
- *(aktuell keine offenen Inhaber-Wünsche — neue Wünsche hier oben eintragen)*

## B — Qualität & Pflichten
5. **E-Rechnung** — Konzept steht in `docs/e-rechnung.md` (02.10.2026). Pflicht gilt nur für Firmenkunden: ab 2028, bei > 800.000 € Vorjahresumsatz schon ab 2027. **Wartet auf Antwort des Inhabers (Umsatz 2026 über 800.000 €?).** Scheibe 1 (USt-IdNr. + Markierung) erledigt in 2.37. Scheibe 2 (XRechnung-Export) nach Antwort des Inhabers, bis dahin Punkt 7.
7. **Barrierefreiheit prüfen:** Kontraste, Fokusreihenfolge, Beschriftungen der Icon-Buttons.

## C — Ideen (aus Recherche, noch zu bewerten)
- Digitale Fahrzeugannahme mit Schadensfotos am Fahrzeugschema
- **Kunden-Statusseite per Link mit Freigabe von Zusatzarbeiten** („Ihr Auto ist fertig“, Erweiterung per Foto/Video freigeben) — Wettbewerber (SmartWerkstatt u. a.) bieten Kundenportal mit Freigabe + Video-Check als Standard. *(Recherche 01.10.2026, Quelle: fuer-gruender.de Vergleich 09/2026, smartwerkstatt.cloud)*
- Teile-Preisvergleich / Bestellstatus
- Wiederkehrende Wartungsverträge
- **„Rückgängig“ statt „Sind Sie sicher?“** bei umkehrbaren Aktionen (z. B. Paket abrechnen, Status ändern, Position löschen → Toast mit „Rückgängig“ für ~6 s). Echte Löschungen mit Datenverlust behalten den Dialog. *(Recherche 03.10.2026, Smashing Magazine / dolfy.ai)*
- **Zahl am App-Symbol** für neue Anfragen (Badge API, iOS ab 16.4 bei Home-Bildschirm-App, braucht Mitteilungs-Erlaubnis). Klein und schnell umsetzbar. *(Recherche 02.10.2026, mobiloud.com)*
- **Bildschirm bleibt an** im Werkstatt-Modus (Screen Wake Lock, Safari 18.4+), z. B. während der Zeiterfassung oder Checkliste. *(Recherche 02.10.2026)*

## Bekannte Hinweise
- `ANTHROPIC_API_KEY` in Vercel muss der Inhaber setzen, sonst laufen KI-Einschätzung und Schein-Scan nur regelbasiert. Nicht selbst ändern.
