# Kunden-Statusseite & Fälligkeiten — Konzept (Stand 06.10.2026)

## Warum
- Laut DEKRA/Ipsos 2026 wünschen sich 56 % der Autobesitzer Einblick in HU- und Service-Fälligkeiten, aber nur 17 % der Werkstätten bieten das an (Quelle: catama-software.de).
- Wettbewerber wie SmartWerkstatt haben Kundenportale mit Status und Freigabe von Zusatzarbeiten (Recherche 01.10.2026).
- Für den Inhaber bedeutet das weniger Rückfragen am Telefon („Ist mein Auto fertig?“), mehr HU-/Service-Termine und einen professionellen Auftritt.

## Was der Kunde sehen soll (bewusst wenig)
| Angabe | Beispiel | Warum unbedenklich |
|---|---|---|
| Kennzeichen, gekürzt | HU-SM ••7 | Erkennt sein Auto, Fremde erfahren wenig |
| Status | In Arbeit · voraussichtlich fertig 17:00 | Kern der Seite |
| HU fällig | 03/2027 | Erinnerungswert |
| Nächster Service (Schätzung) | ca. 10/2027 | Erinnerungswert |
| Werkstatt-Kontakt | Name, Telefon, WhatsApp-Knopf | Rückruf mit einem Tipp |
| **Nicht** angezeigt | Kundenname, Adresse, Preise, Fotos, Notizen | Datensparsamkeit (DSGVO Art. 5) |

## Drei Wege — von klein nach groß
**A · Status-Nachricht per WhatsApp (ohne Server, sofort möglich)**
Ein Knopf im Auftrag: „Status an Kunden senden“. Erzeugt einen fertigen Text (Status, voraussichtlich fertig, HU-Monat) und öffnet WhatsApp. Keine neuen Daten im Internet, kein Datenschutz-Zusatzaufwand. *Aufwand: 1 Lauf.*

**B · Statusseite per Link (Supabase, schreibgeschützt)**
- Eigene kleine Tabelle `status_links`: Zufallsschlüssel (128 Bit), gekürztes Kennzeichen, Status, Fertig-Zeit, HU-Monat, Service-Schätzung, Werkstatt-Kontakt, Ablaufdatum (30 Tage nach Abholung).
- Öffentlich lesbar **nur über den genauen Schlüssel** (Supabase-Zeilenregel / RPC). Die bestehende Gesamt-Sicherung bleibt davon getrennt und privat.
- Die App aktualisiert die Zeile bei Statuswechsel. Der Kunde bekommt den Link einmal per WhatsApp.
- Seite `status.html` (hell, mobil, ohne Anmeldung).
- **Der Inhaber muss tun:** einmal ein vorbereitetes SQL-Stück in seinem Supabase-Projekt ausführen (ich liefere es fertig), Supabase-Region EU prüfen, Datenschutzerklärung um einen Absatz ergänzen (Textvorschlag liefere ich). Keine Kosten im kostenlosen Supabase-Tarif bei dieser Datenmenge.
- *Aufwand: 2–3 Läufe.*

**C · Freigabe von Zusatzarbeiten über den Link**
Der Kunde sieht Befund und Foto und tippt auf „Freigeben“. Das braucht Schreibrechte, Missbrauchsschutz und ein Freigabe-Protokoll (mit Zeitstempel, ähnlich wie die heutige Freigabe per WhatsApp). Erst nach B sinnvoll. *Aufwand: 3+ Läufe.*

## Empfehlung
Jetzt **A** bauen (sofort nützlich, ohne Risiko). **B** erst, wenn der Inhaber zustimmt und das Supabase-Projekt bestätigt.

## Frage an den Inhaber
Soll ich mit **A** (Status per WhatsApp-Knopf) anfangen? Und möchten Sie später **B** (eigene Statusseite per Link), wofür Sie einmal 5 Minuten in Supabase klicken müssten?
