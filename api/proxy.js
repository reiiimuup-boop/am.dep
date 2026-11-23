const API_KEY = "amk_b1d6b2285424f1c9d3b84c97e0a1727ac47d9bd0";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const { path, payload } = req.body || {};
  if (!["/api/send", "/api/verify", "/api/bulk"].includes(path)) return res.status(400).json({ ok: false, error: "Invalid path" });
  try {
    const up = await fetch(`https://am.dapjisync.my.id${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": API_KEY },
      body: JSON.stringify(payload || {})
    });
    const txt = await up.text();
    try { return res.status(up.status).json(JSON.parse(txt)); } catch { return res.status(up.status).send(txt); }
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
                                            }
