# mehanicar — Finale Version: Arbeitsstand

## Status: ALLE PHASEN ABGESCHLOSSEN ✅ (12.07.2026)

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
