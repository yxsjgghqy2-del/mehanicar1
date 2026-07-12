# mehanicar — Finale Version: Arbeitsstand

Fortschrittsdatei. Wird nach jeder Phase aktualisiert, damit bei Sitzungsende nichts verloren geht.

## Status

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Rechtliches: Impressum, Datenschutz (aus Firmendaten generiert), Links in Einstellungen + Buchen | ⬜ offen |
| 2 | Design: Aufträge (Suche + Gruppenliste), Planung (Jetzt-wichtig), Kunden (A–Z + Suche), Anfragen (Triage) | ⬜ offen |
| 3 | Funktion: KI-Analyse via /api/analyse, Schein-Scan via /api/scan, Onboarding, PNG-Icons, Empty-States | ⬜ offen |
| 4 | QA: JS-Syntax-Check, Selftest, SW-Bump, Merge → main (Vercel-Prod) | ⬜ offen |

## Architektur-Notizen (für Wiedereinstieg)

- Alles in `index.html` (~3300 Zeilen). State `S` in localStorage `mehanicar_v2`.
- Views: `vPlanung` 922, `vAuftraege` 993, `vAuftrag` 1060, `vKunden` 1651, `vKunde` 1667,
  `vFahrzeuge` 1725, `vFinanzen` 1842, `vEinstellungen` 1928, `vAnfragen` 2301, `vAnfrage` 2505,
  `vKalender` 2625, `vTermine` 2981, `vBuchen` 3070, `render` 3144, `viewHtml` 3183, `selftest` 3272.
  (Zeilennummern verschieben sich bei Edits — per grep neu suchen.)
- Handler: `ACT[...]` für data-act Klicks, `FSET[...]` für data-f Inputs.
- `ruleAnalyze` (2229) = heuristische Anfragen-Analyse; `/api/analyse` = KI (braucht ANTHROPIC_API_KEY auf Vercel).
- Deploy: Push auf beliebigen Branch = Preview; Merge in `main` = Produktion (mehanicar1.vercel.app).
- Branch: `fix/nav-segctrl` (aktuell), PR-merge via GitHub MCP, SW-Cache-Version bei UI-Änderungen bumpen (aktuell v3).

## Wichtige Regel

Online-Terminbuchung: Anfragen IMMER mit status 'neu' anlegen — Inhaber bestätigt selbst. Nie auto-bestätigen.
