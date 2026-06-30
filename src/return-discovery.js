const RETURN_KEY = 'catchabugs.returnStones.v1';

const RETURN_POINTS = Object.freeze([
  { id: 'lab', icon: '🏠', name: '연구소', type: 'lab', defaultOpen: true, travelCost: 0 },
  { id: 'start-village', icon: '🏘️', name: '초기마을', x: 0, y: 0, defaultOpen: true, travelCost: 10 },
  { id: 'forest-camp', icon: '🌲', name: '숲 캠프', x: -820, y: 360, radius: 180, travelCost: 15 },
  { id: 'river-camp', icon: '🌊', name: '강가 캠프', x: 760, y: 620, radius: 180, travelCost: 20 },
  { id: 'field-base', icon: '🌾', name: '초원 기지', x: 940, y: -420, radius: 180, travelCost: 20 },
  { id: 'city-square', icon: '🏙️', name: '도시 광장', x: -1040, y: -560, radius: 180, travelCost: 25 },
]);

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function normalizeState(raw) {
  const state = raw || {};
  state.found = state.found || {};
  state.installed = state.installed || {};
  if (state.discovered) {
    Object.keys(state.discovered || {}).forEach((id) => {
      state.found[id] = state.found[id] || state.discovered[id];
    });
  }
  RETURN_POINTS.forEach((point) => {
    if (point.defaultOpen) {
      state.found[point.id] = state.found[point.id] || true;
      state.installed[point.id] = state.installed[point.id] || true;
    }
  });
  return state;
}
function loadState() {
  const state = normalizeState(safeParse(localStorage.getItem(RETURN_KEY)) || {});
  saveState(state);
  return state;
}
function saveState(state) { localStorage.setItem(RETURN_KEY, JSON.stringify(normalizeState(state))); }
function gameApi() { return window.CATCHABUGS_GAME || null; }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1500);
}
function distance(a, b) { return Math.hypot(Number(a.x || 0) - Number(b.x || 0), Number(a.y || 0) - Number(b.y || 0)); }
function discover(point, state) {
  if (state.found[point.id]) return false;
  state.found[point.id] = { at: new Date().toLocaleString('ko-KR'), x: point.x, y: point.y };
  saveState(state);
  toast(`${point.icon} ${point.name} 발견! BUG HOLE 설치 가능`);
  gameApi()?.addLog?.(`${point.name} 발견 · BUG HOLE 설치 가능`, point.icon);
  window.dispatchEvent(new CustomEvent('catchabugs:return-discovered', { detail: { point } }));
  return true;
}
function nearestLocked(player, state) {
  return RETURN_POINTS
    .filter((point) => !point.defaultOpen && !state.found[point.id])
    .map((point) => ({ point, dist: distance(player, point) }))
    .sort((a, b) => a.dist - b.dist)[0] || null;
}
function ensureHint() {
  if ($('#returnDiscoveryHint')) return $('#returnDiscoveryHint');
  const game = $('#game');
  if (!game) return null;
  const hint = document.createElement('div');
  hint.id = 'returnDiscoveryHint';
  hint.style.cssText = 'position:absolute;left:50%;bottom:92px;z-index:9;transform:translateX(-50%);max-width:78vw;padding:7px 11px;border-radius:999px;background:#07111ed9;color:white;border:1px solid #ffffff33;box-shadow:0 10px 22px #0005;font-size:11px;font-weight:1000;text-align:center;pointer-events:none;opacity:0;transition:opacity .2s';
  game.appendChild(hint);
  return hint;
}
function renderHint(player, state) {
  const hint = ensureHint();
  if (!hint) return;
  const nearest = nearestLocked(player, state);
  if (!nearest || nearest.dist > 520) { hint.style.opacity = '0'; return; }
  const steps = Math.max(1, Math.round(nearest.dist / 45));
  const close = nearest.dist <= (nearest.point.radius || 180);
  hint.textContent = close ? `${nearest.point.icon} BUG HOLE 설치 가능 지점 포착` : `📡 미발견 BUG HOLE 신호 · 약 ${steps}걸음`;
  hint.style.opacity = '1';
}
function tick() {
  const api = gameApi();
  const player = api?.getPlayer?.();
  if (!player) { requestAnimationFrame(tick); return; }
  const state = loadState();
  RETURN_POINTS.forEach((point) => {
    if (point.defaultOpen || state.found[point.id]) return;
    if (distance(player, point) <= (point.radius || 180)) discover(point, state);
  });
  renderHint(player, state);
  requestAnimationFrame(tick);
}
function revealAll() {
  const state = loadState();
  RETURN_POINTS.forEach((point) => {
    state.found[point.id] = state.found[point.id] || { at: new Date().toLocaleString('ko-KR'), x: point.x || 0, y: point.y || 0, dev: true };
    state.installed[point.id] = true;
  });
  saveState(state);
  toast('BUG HOLE 전체 설치 완료');
  gameApi()?.addLog?.('개발자모드: BUG HOLE 전체 설치', '🌀');
}
function discoverById(id) {
  const state = loadState();
  const point = RETURN_POINTS.find((item) => item.id === id);
  return point ? discover(point, state) : false;
}

window.CATCHABUGS_RETURN = {
  points: RETURN_POINTS,
  loadState,
  saveState,
  revealAll,
  discoverById,
};

document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tick));
setTimeout(() => requestAnimationFrame(tick), 300);
