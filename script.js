const FEEDS = {
  status: "/status.json",
  players: "/players.json",
  ksp: "/luna_players.json"
};
const MAX_STATUS_AGE_MS = 120000;
const MAX_PLAYER_AGE_MS = 90000;

async function getJson(url) {
  const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function isFresh(timestamp, maxAge) {
  if (!timestamp) return false;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) && Date.now() - parsed <= maxAge && Date.now() - parsed >= -60000;
}
function setStatus(prefix, state) {
  const dot = document.getElementById(`${prefix}-dot`);
  const label = document.getElementById(`${prefix}-state`);
  if (!dot || !label) return;
  dot.className = "status-indicator " + state;
  label.textContent = state === "online" ? "Online" : state === "offline" ? "Offline" : "Unavailable";
}
function setPlayers(prefix, count) {
  const node = document.getElementById(`${prefix}-players`);
  if (node) node.textContent = Number.isFinite(Number(count)) && count !== null ? String(count) : "—";
}
async function refreshStatus() {
  try {
    const data = await getJson(FEEDS.status);
    const updated = document.getElementById("updated-at");
    if (updated) updated.textContent = isFresh(data.updatedAt, MAX_STATUS_AGE_MS)
      ? "Last updated " + new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Status feed may be out of date";
    for (const [key, service] of Object.entries({ stormworks: data.services?.stormworks })) {
      if (service && isFresh(data.updatedAt, MAX_STATUS_AGE_MS)) setStatus(key, service.online ? "online" : "offline");
      else setStatus(key, "unknown");
    }
  } catch {
    setStatus("stormworks", "unknown");
    const updated = document.getElementById("updated-at");
    if (updated) updated.textContent = "Status feed unavailable";
  }
  try {
    const data = await getJson(FEEDS.players);
    if (isFresh(data.updatedAt, MAX_PLAYER_AGE_MS) && data.online) setPlayers("stormworks", data.players?.length ?? data.playerCount ?? 0);
    else setPlayers("stormworks", "—");
  } catch { setPlayers("stormworks", "—"); }
  try {
    const data = await getJson(FEEDS.ksp);
    if (isFresh(data.updatedAt, MAX_PLAYER_AGE_MS)) {
      setStatus("ksp", data.online ? "online" : "offline");
      setPlayers("ksp", data.players?.length ?? data.playerCount ?? 0);
    } else {
      setStatus("ksp", "unknown");
      setPlayers("ksp", "—");
    }
  } catch {
    setStatus("ksp", "unknown");
    setPlayers("ksp", "—");
  }
}
const menuButton = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
}
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
refreshStatus();
setInterval(refreshStatus, 30000);
