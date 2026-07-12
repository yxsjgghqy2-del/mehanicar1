// Vercel Serverless Function: /api/scan
// Proxy zur Anthropic-API, damit der API-Schlüssel NICHT im Browser landet.
// Benötigt die Umgebungsvariable ANTHROPIC_API_KEY in den Vercel-Projekteinstellungen.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(501).json({ error: "ANTHROPIC_API_KEY fehlt in den Vercel-Einstellungen" });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const media_type = body && body.media_type;
    const data = body && body.data;
    if (!data) {
      res.status(400).json({ error: "Kein Bild übergeben" });
      return;
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media_type || "image/jpeg", data } },
            { type: "text", text: "Das ist ein deutscher Fahrzeugschein / Zulassungsbescheinigung Teil I. Lies die Daten und gib NUR reines JSON zurück mit den Feldern: kennzeichen, vin, marke, modell, baujahr, erstzulassung (YYYY-MM-DD), hu_datum (YYYY-MM-DD), kraftstoff, hubraum, kw, farbe, farb_code. Nicht lesbare Felder weglassen. Keine Erklärungen." }
          ]
        }]
      })
    });
    const j = await r.json();
    if (!r.ok) {
      res.status(502).json({ error: "Anthropic-Fehler", detail: j });
      return;
    }
    const txt = ((j.content || []).find(c => c.type === "text") || {}).text || "{}";
    let fields = {};
    try { fields = JSON.parse(txt.replace(/```json|```/g, "").trim() || "{}"); } catch (e) { fields = {}; }
    res.status(200).json({ fields });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
