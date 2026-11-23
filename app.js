const KEY_STORE = "depsync_apikey";
const $ = (id) => document.getElementById(id);

$("keyInp").value = localStorage.getItem(KEY_STORE) || "";
function saveKey() { localStorage.setItem(KEY_STORE, $("keyInp").value.trim()); }
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
  const apiKey = $("keyInp").value.trim();
  if (!apiKey) throw new Error("X-APIKEY belum diisi.");
  const r = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, payload, apiKey })
  });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt; }
  const lim = d?.limit?.free_left ?? d?.limit?.remaining ?? d?.limit?.total;
  if (lim !== undefined && lim !== null) $("limitVal").innerText = lim;
  return { status: r.status, d };
}

async function sendLink() {
  const gmail = $("mailSend").value.trim();
  if (!gmail) return log("[ERROR] Gmail wajib diisi.");
  $("sentBox").classList.add("hidden");
  log(`[SEND] Mengirim magic link ke ${gmail}...`);
  try {
    const { status, d } = await callApi("/api/send", { gmail });
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
    const { status, d } = await callApi("/api/verify", { gmail, link });
    if (status >= 200 && status < 300 && d?.success !== false) {
      log(`[HTTP ${status}]\n` + JSON.stringify(d, null, 2));
      $("verMsg").innerText = `Aktif: ${d?.userData?.email || gmail} (${d?.userData?.planName || "Premium"})`;
      $("verBox").classList.remove("hidden");
    } else log(`[HTTP ${status}]\n` + JSON.stringify(d, null, 2));
  } catch (e) { log("[ERROR] " + e.message); }
}

function copyLog() { navigator.clipboard.writeText($("logOut").innerText); }
                                        
