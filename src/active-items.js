const ACTIVE_ITEMS_KEY = 'catchabugs.activeItems.v1';

const ITEM_EFFECTS = Object.freeze({
  'bug-lure': { icon: '🪤', name: '벌레 유인기', durationMin: 30, desc: '곤충 생성량 +50%', stats: { spawnBoost: 0.5 } },
  'rare-alarm': { icon: '🔔', name: '희귀 알람기', durationMin: 30, desc: '희귀 이상 신호 알림', stats: { rareAlarm: 1, rareBoost: 0.5 } },
  'radar-boost': { icon: '📡', name: '레이더 증폭기', durationMin: 30, desc: '레이더 거리 +20m', stats: { radarBonus: 20 } },
  'sap-trap': { icon: '🪵', name: '수액통', durationMin: 45, desc: '숲 곤충 유인 +30%', stats: { forestBoost: 0.3, spawnBoost: 0.2 } },
  'flower-lure': { icon: '🌼', name: '꽃 유인기', durationMin: 45, desc: '초원 곤충 유인 +30%', stats: { fieldBoost: 0.3, spawnBoost: 0.2 } },
  'water-trap': { icon: '💧', name: '수생 트랩', durationMin: 45, desc: '강가 곤충 유인 +30%', stats: { riverBoost: 0.3, spawnBoost: 0.2 } },
  'bug-light': { icon: '💡', name: '곤충등', durationMin: 45, desc: '야행성 신호 강화', stats: { nightBoost: 0.3, rareBoost: 0.3 } },
  'bug-cookie': { icon: '🍪', name: '곤충 쿠키', durationMin: 15, desc: '일반 곤충 출현 +20%', stats: { spawnBoost: 0.2 } },
});

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function now() { return Date.now(); }
function loadRaw() { return safeParse(localStorage.getItem(ACTIVE_ITEMS_KEY)) || { active: [] }; }
function saveRaw(state) { localStorage.setItem(ACTIVE_ITEMS_KEY, JSON.stringify(state)); window.dispatchEvent(new CustomEvent('catchabugs:active-items-changed', { detail: { state } })); return state; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function addLog(text, icon = '🎒') { window.CATCHABUGS_GAME?.addLog?.(text, icon); }

function cleanState(state = loadRaw()) {
  const t = now();
  state.active = (state.active || []).filter((item) => Number(item.endsAt || 0) > t);
  saveRaw(state);
  return state;
}
function getDefinition(id) { return ITEM_EFFECTS[id] || null; }
function getActiveItems() { return cleanState(loadRaw()).active || []; }
function isActive(id) { return getActiveItems().some((item) => item.id === id); }
function activate(id, options = {}) {
  const def = getDefinition(id);
  if (!def) return { ok: false, reason: 'unknown' };
  const state = cleanState(loadRaw());
  const durationMs = Number(options.durationMs || def.durationMin * 60 * 1000);
  const existing = state.active.find((item) => item.id === id);
  if (existing) existing.endsAt = Math.max(existing.endsAt, now()) + durationMs;
  else state.active.push({ id, name: def.name, icon: def.icon, desc: def.desc, startedAt: now(), endsAt: now() + durationMs });
  saveRaw(state);
  toast(`${def.icon} ${def.name} 활성화`);
  addLog(`${def.name} 사용: ${def.desc}`, def.icon);
  return { ok: true, item: def, active: state.active };
}
function remainingMs(itemOrId) {
  const item = typeof itemOrId === 'string' ? getActiveItems().find((entry) => entry.id === itemOrId) : itemOrId;
  return Math.max(0, Number(item?.endsAt || 0) - now());
}
function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function getBonuses() {
  const active = getActiveItems();
  const stats = { spawnBoost: 0, rareBoost: 0, radarBonus: 0, rareAlarm: 0, forestBoost: 0, fieldBoost: 0, riverBoost: 0, nightBoost: 0 };
  active.forEach((item) => {
    const def = getDefinition(item.id);
    Object.entries(def?.stats || {}).forEach(([key, value]) => { stats[key] = Number(stats[key] || 0) + Number(value || 0); });
  });
  return stats;
}
function activeHTML() {
  const active = getActiveItems();
  if (!active.length) return '<div class="activeItems empty">활성 설치물 없음</div>';
  return `<div class="activeItems">${active.map((item) => `<div class="activePill"><b>${item.icon} ${item.name}</b><span>${formatRemaining(remainingMs(item))}</span></div>`).join('')}</div>`;
}
function injectHud() {
  let node = $('#activeItemsHud');
  if (!node) {
    node = document.createElement('div');
    node.id = 'activeItemsHud';
    document.body.appendChild(node);
  }
  node.innerHTML = activeHTML();
}
function injectStyle() {
  if ($('#activeItemsStyle')) return;
  const style = document.createElement('style');
  style.id = 'activeItemsStyle';
  style.textContent = `#activeItemsHud{position:fixed;left:10px;top:82px;z-index:18;pointer-events:none;max-width:210px}.activeItems{display:flex;flex-direction:column;gap:5px}.activeItems.empty{display:none}.activePill{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 9px;border-radius:999px;background:#07111edc;color:white;box-shadow:0 8px 18px #0004;font-size:11px;font-weight:1000}.activePill span{color:#82f7c1}`;
  document.head.appendChild(style);
}
function pulseRareAlarm() {
  const bonus = getBonuses();
  if (!bonus.rareAlarm) return;
  const last = Number(pulseRareAlarm.last || 0);
  const t = now();
  if (t - last < 45000) return;
  pulseRareAlarm.last = t;
  toast('🔔 희귀 알람기: 희귀 이상 신호를 탐색 중');
}
function init() {
  injectStyle();
  injectHud();
  setInterval(() => { cleanState(); injectHud(); pulseRareAlarm(); }, 1000);
}
window.CATCHABUGS_ACTIVE_ITEMS = { definitions: ITEM_EFFECTS, activate, getActiveItems, getBonuses, isActive, remainingMs, formatRemaining, activeHTML };
document.addEventListener('DOMContentLoaded', init);
setTimeout(init, 300);
