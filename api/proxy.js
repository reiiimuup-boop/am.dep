export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { path, payload, apiKey } = req.body || {};
    const allowedPaths = ["/api/send", "/api/verify", "/api/bulk"];

    if (!allowedPaths.includes(path)) {
      return res.status(400).json({ ok: false, error: "Endpoint tidak diizinkan" });
    }

    if (!apiKey) {
      return res.status(400).json({ ok: false, error: "x-apikey wajib diisi" });
    }

    const upstreamRes = await fetch(`https://am.dapjisync.my.id${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-apikey": apiKey
      },
      body: JSON.stringify(payload || {})
    });

    const rawText = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: "Gagal menghubungi server upstream",
      detail: err.message
    });
  }
}
