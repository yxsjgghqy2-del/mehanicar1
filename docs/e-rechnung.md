# E-Rechnung — Konzept für mehanicar (Stand 02.10.2026)

## Was gilt (Kurzfassung)
| Ab | Pflicht | Betrifft mehanicar? |
|---|---|---|
| 01.01.2025 | Jedes Unternehmen muss E-Rechnungen **empfangen** können (E-Mail-Postfach reicht). | Ja, aber schon erfüllt: E-Mail-Postfach. |
| 01.01.2027 | **Ausstellen** an Firmenkunden (B2B, Inland) Pflicht, wenn der **Vorjahresumsatz über 800.000 €** lag. | Nur wenn Umsatz 2026 > 800.000 €. |
| 01.01.2028 | Ausstellen an Firmenkunden Pflicht für **alle** (außer Kleinunternehmer nach § 19 UStG). | Ja. |

- **Privatkunden (B2C) sind nicht betroffen.** Für sie bleibt die normale PDF- oder Papierrechnung erlaubt. Das ist der Großteil der Werkstattkunden.
- **Kleinbetragsrechnungen bis 250 € brutto** sind ausgenommen.
- **Erlaubte Formate:** XRechnung (reines XML) oder ZUGFeRD ab Profil EN 16931 (PDF mit eingebettetem XML). Ein normales PDF zählt **nicht** als E-Rechnung.

Quellen: rechnex.de/e-rechnung-pflicht, zdh.de (Fachbereich Steuern, elektronische Rechnung), e-rechnung-vergleich.de/e-rechnung-pflicht-2027, belegschmied.de/blog/e-rechnung-pflicht-2027-2028. Abgerufen am 02.10.2026. Das ist keine Steuerberatung, im Zweifel fragt der Inhaber seinen Steuerberater.

## Vorschlag für die App (in Scheiben)
1. **Firmenkunde erkennen:** In der Kunden-Maske gibt es „Firma“ schon. Neu dazu kommt das optionale Feld „USt-IdNr. des Kunden“. Rechnungen an Firmenkunden über 250 € bekommen den Hinweis „E-Rechnung nötig (ab 2028)“.
2. **XRechnung-Export (CII-XML):** Ein Knopf „E-Rechnung (XML)“ an der Rechnung. Die Datei wird im Browser erzeugt, ohne Server und ohne Kosten. Sie wird gespeichert oder per E-Mail/WhatsApp geteilt. Inhalt: Rechnungsnummer, Datum, Verkäufer (Firma, Adresse, USt-ID/Steuernr., IBAN), Käufer, Positionen (Menge, Einheit, Netto, MwSt-Satz), Summen und Zahlungsziel. Pflichtfelder werden vor dem Export geprüft, fehlende Angaben werden klar benannt.
3. **Prüfung:** Die erzeugte Datei mit einem öffentlichen Validator (KoSIT) testen und die Testdatei im Repo ablegen.
4. **Später, optional: ZUGFeRD** (PDF mit eingebettetem XML). Das ist technisch aufwendiger, weil es PDF/A-3 braucht. Es lohnt sich erst, wenn Firmenkunden lieber ein „lesbares“ PDF wollen.

Warum zuerst XRechnung: Sie lässt sich ohne zusätzliche Bibliothek komplett im Browser erzeugen. Sie ist für alle Empfänger gültig und reicht für die Pflicht aus.

## Offene Frage an den Inhaber
Lag der Umsatz der Werkstatt **2026 über 800.000 €**?
- **Nein:** Die Pflicht gilt erst ab 2028. Wir bauen in Ruhe Scheibe 1 und 2 (fertig weit vor Ende 2027).
- **Ja:** Die Pflicht gilt schon ab 01.01.2027. Dann ziehen wir Scheibe 1 bis 3 nach vorn.
