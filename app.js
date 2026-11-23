const $ = (id) => document.getElementById(id);
function log(t) { $("logOut").innerText = t; }

function tab(m) {
  const isS = m === "send";
  $("pSend").classList.toggle("hidden", !isS);
  $("pVer").classList.toggle("hidden", isS);
  $("tSend").className = `py-2 rounded-lg ${isS ? "bg-slate-900 text-amber-300" : "bg-white text-slate-900"}`;
  $("tVer").className = `py-2 rounded-lg ${!isS ? "bg-slate-900 text-amber-300" : "bg-white text-slate-900"}`;
}

function toVerify() {
  $("mailVer").value = $("mailSend").value.trim();
  $("verBox").classList.add("hidden");
  tab("ver");
  $("linkVer").focus();
}

function resetAll() {
  $("sentBox").classList.add("hidden");
  $("verBox").classList.add("hidden");
  $("mailSend").value = ""; $("mailVer").value = ""; $("linkVer").value = "";
  tab("send");
  log("[SYSTEM] Siap digunakan.");
}

async function callApi(path, payload) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const txt = await r.text();
  try { return { status: r.status, d: JSON.parse(txt) }; }
  catch { return { status: r.status, d: txt }; }
}

async function sendLink() {
  const gmail = $("mailSend").value.trim();
  if (!gmail) return log("[ERROR] Gmail wajib diisi.");
  $("sentBox").classList.add("hidden");
  log(`[SEND] Mengirim magic link ke ${gmail}...`);
  try {
    const { status, d } = await callApi("/api/proxy", { path: "/api/send", payload: { gmail } });
    if (status >= 200 && status < 300 && d?.success !== false) {
      log(`[SEND] Mengirim magic link ke ${gmail}...\n[OK] Magic link terkirim.`);
      $("sentMsg").innerText = `Magic link berhasil dikirim ke ${gmail}. Cek inbox/spam lalu klik Lanjut Verifikasi.`;
      $("sentBox").classList.remove("hidden");
    } else log(`[HTTP ${status}]\n` + JSON.stringify(d, null, 2));
  } catch (e) { log("[ERROR] " + e.message); }
}

async function verifyLink() {
  const gmail = $("mailVer").value.trim(), link = $("linkVer").value.trim();
  if (!gmail || !link) return log("[ERROR] Gmail dan magic link wajib diisi.");
  $("verBox").classList.add("hidden");
  log(`[VERIFY] Memverifikasi link untuk ${gmail}...`);
  try {
    const { status, d } = await callApi("/api/proxy", { path: "/api/verify", payload: { gmail, link } });
    if (status >= 200 && status < 300 && d?.success !== false) {
      log(`[HTTP ${status}]\n` + JSON.stringify(d, null, 2));
      $("verMsg").innerText = `Aktif: ${d?.userData?.email || gmail} (${d?.userData?.planName || "Premium"})`;
      $("verBox").classList.remove("hidden");
    } else log(`[HTTP ${status}]\n` + JSON.stringify(d, null, 2));
  } catch (e) { log("[ERROR] " + e.message); }
}

function copyLog() { navigator.clipboard.writeText($("logOut").innerText); }
    
