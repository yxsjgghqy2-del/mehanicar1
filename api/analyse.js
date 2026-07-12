export default async function handler(req, res) {
 if (req.method !== 'POST') return res.status(405).end();

 const { text, kanal, name, model } = req.body || {};
 if (!text) return res.status(400).json({ error: 'text required' });

 const key = process.env.ANTHROPIC_API_KEY;
 if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nicht konfiguriert' });

 const sys = `Du bist ein KFZ-Werkstatt-Assistent. Analysiere Kundenanfragen und antworte NUR mit JSON im Format:
{"prio":"hoch"|"mittel"|"niedrig","betreff":"kurzer Betreff","grund":"1-2 Sätze Begründung","antwort":"fertige freundliche Antwort auf Deutsch","wert":Zahl in Cent}

Prioritäten:
- hoch: Sicherheitsrelevant (Bremsen, Lenkung, Beleuchtung), Fahrzeug nicht fahrbar, Notfall
- mittel: Termingebunden (HU/TÜV fällig, Garantie läuft), Komforteinschränkung
- niedrig: Reifenservice, Inspektion, Klimaservice, reine Preisanfragen

Wert: realistischer Auftragswert in Euro-Cent (z.B. Bremsen VA: 45000, Inspektion: 18000, Steuerkette: 90000)
Antwort: professionell, persönlich (${name ? 'an ' + name : 'an den Kunden'}), kein "Sehr geehrte/r", max. 3 Sätze`;

 try {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
   method: 'POST',
   headers: {
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
   },
   body: JSON.stringify({
    model: model || 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: sys,
    messages: [{ role: 'user', content: `Kanal: ${kanal || 'unbekannt'}\n\nKundenanfrage:\n${text}` }]
   })
  });

  if (!r.ok) {
   const e = await r.text();
   return res.status(r.status).json({ error: 'Anthropic: ' + e });
  }

  const d = await r.json();
  const raw = (d.content?.[0]?.text || '{}').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  const parsed = m ? JSON.parse(m[0]) : {};

  return res.status(200).json({
   prio: parsed.prio || 'mittel',
   betreff: parsed.betreff || '',
   grund: parsed.grund || '',
   antwort: parsed.antwort || '',
   wert: typeof parsed.wert === 'number' ? parsed.wert : null,
   quelle: 'ki'
  });
 } catch (e) {
  return res.status(500).json({ error: String(e) });
 }
}
