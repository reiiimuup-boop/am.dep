export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const { path, payload, apiKey } = req.body || {};
  if (!["/api/send", "/api/verify", "/api/bulk"].includes(path)) return res.status(400).json({ ok: false, error: "Invalid path" });
  if (!apiKey) return res.status(400).json({ ok: false, error: "Missing x-apikey" });
  try {
    const up = await fetch(`https://am.dapjisync.my.id${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apiKey },
      body: JSON.stringify(payload || {})
    });
    const txt = await up.text();
    try { return res.status(up.status).json(JSON.parse(txt)); } catch { return res.status(up.status).send(txt); }
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
}
