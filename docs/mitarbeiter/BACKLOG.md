# Backlog — mehanicar

Priorität von oben nach unten. Erledigtes wird entfernt und im LOG vermerkt. Jede Idee hat eine Herkunft (Inhaber / Recherche / Fehlerfund).

## A — Wünsche des Inhabers
2. **Kalk-Kopf PRO in die echte Auftragsmaske übernehmen** (Prototyp: `designs/auftrag.html#/a/14`). Das umfasst den dunklen Kalkulations-Kopf, der oben klebt, die Unterzeile mit Anzahlung, offenem Betrag und Marge sowie die Detail-Kalkulation (Lohn, Teile mit EK→VK, Aufschlag, Zwischensummen, Rabatt, Anzahlung, „Zu zahlen bei Abholung“, Deckungsbeitrag, Lohn/Teile-Balken). Mit echten Daten, bestehenden Rabatten und dem AW-Teiler. *(Inhaber: „14 gefällt mir am meisten, Kalkulation viel detaillierter und übersichtlicher“)* Wird in 2–3 Tagesscheiben zerlegt. **Scheibe 1 (Kopf + Unterzeile) erledigt in 2.27.** **Scheibe 2 (Detail-Kalkulation) erledigt in 2.28.** Als Nächstes: Scheibe 3 Feinschliff (Rabatt-Schnellwahl 0/5/10 %, Hell-Modus prüfen).
3. **Starke Suchleiste für alle Daten** *(Inhaber, 28.09.: „Jarvis ist gar nicht so wichtig, eine starke Suchleiste für alle Daten ist auch in Ordnung.“)*: Eine Suche oben in der App, die über Kunden, Fahrzeuge (auch kompakt wie „tr51“), Aufträge, Positionen, Rechnungen, Termine, Anfragen und Lager geht. Die Treffer sind gruppiert und sofort antippbar. Vorlage ist der Prototyp `designs/jarvis/05-befehlszeile.html` (Live-Filter, Tastatur, Vorschau). Zuerst die reine Suche mit echten Daten aus `S`, danach als Ausbau einfache Befehle wie „bestell dot4“. Jarvis selbst ist zurückgestellt.
4. **Anlege-Masken Kunde/Fahrzeug/Position** modernisieren, im Stil der gewählten Auftragsmaske (14) mit aufklappbaren Balken. Der Inhaber mag keine langweiligen Nur-Formular-Masken.

## B — Qualität & Pflichten
5. **E-Rechnung vorbereiten:** Seit 01.01.2025 müssen Unternehmen E-Rechnungen im B2B-Verkehr empfangen können. Ab 2027 bzw. 2028 gilt die Ausstellungspflicht, abhängig vom Umsatz. Zu prüfen ist ein ZUGFeRD/XRechnung-Export für Firmenkunden wie das Autohaus Schmidt. *(Recherche nötig)*
6. **Backup-Erinnerung verbessern**, weil die Daten nur lokal liegen: Hinweis, wenn Cloud-Backup aus ist und länger als 7 Tage nicht gesichert wurde.
7. **Barrierefreiheit prüfen:** Kontraste, Fokusreihenfolge, Beschriftungen der Icon-Buttons.

## C — Ideen (aus Recherche, noch zu bewerten)
- Digitale Fahrzeugannahme mit Schadensfotos am Fahrzeugschema
- Kunden-Statusseite per Link („Ihr Auto ist fertig“)
- Teile-Preisvergleich / Bestellstatus
- Wiederkehrende Wartungsverträge

## Bekannte Hinweise
- `ANTHROPIC_API_KEY` in Vercel muss der Inhaber setzen, sonst laufen KI-Einschätzung und Schein-Scan nur regelbasiert. Nicht selbst ändern.
