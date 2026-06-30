const RETURN_KEY = 'catchabugs.returnStones.v1';
const MAX_BUG_HOLES = 8;
const COST_TABLE = [100, 150, 220, 320, 450, 600, 800, 1000];

const POINTS = [
  { id: 'lab', icon: '🏠', name: '연구소', type: 'lab', defaultOpen: true, desc: '연구와 제작의 중심지입니다.', travelCost: 0 },
  { id: 'start-village', icon: '🏘️', name: '초기마을', x: 0, y: 0, defaultOpen: true, desc: '처음부터 연결된 기본 BUG HOLE입니다.', travelCost: 10 },
  { id: 'forest-camp', icon: '🌲', name: '숲 캠프', x: -820, y: 360, desc: '숲 탐험 중 발견 가능한 거점입니다.', travelCost: 15 },
  { id: 'river-camp', icon: '🌊', name: '강가 캠프', x: 760, y: 620, desc: '강가 탐험 중 발견 가능한 거점입니다.', travelCost: 20 },
  { id: 'field-base', icon: '🌾', name: '초원 기지', x: 940, y: -420, desc: '초원 탐험 중 발견 가능한 거점입니다.', travelCost: 20 },
  { id: 'city-square', icon: '🏙️', name: '도시 광장', x: -1040, y: -560, desc: '도시 탐험 중 발견 가능한 거점입니다.', travelCost: 25 },
];

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function economy() { return window.CATCHABUGS_ECONOMY || null; }
function gameApi() { return window.CATCHABUGS_GAME || null; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1400); }
function normalizeState(raw) {
  const state = raw || {};
  state.found = state.found || {};
  state.installed = state.installed || {};
  state.installStep = Number(state.installStep || 0);
  state.dismantleStep = Number(state.dismantleStep || 0);
  if (state.discovered) {
    Object.keys(state.discovered || {}).forEach((id) => {
      state.found[id] = state.found[id] || state.discovered[id];
    });
  }
  POINTS.forEach((point) => {
    if (point.defaultOpen) {
      state.found[point.id] = state.found[point.id] || true;
      state.installed[point.id] = true;
    }
  });
  return state;
}
function loadState() { const state = normalizeState(safeParse(localStorage.getItem(RETURN_KEY)) || {}); saveState(state); return state; }
function saveState(state) { localStorage.setItem(RETURN_KEY, JSON.stringify(normalizeState(state))); }
function core() { return economy()?.getExplorerCore?.() || 0; }
function spendCore(amount, reason) { return economy()?.spendExplorerCore?.(amount, reason) || false; }
function installCost() { return COST_TABLE[Math.min(Math.max(0, Number(loadState().installStep || 0)), COST_TABLE.length - 1)]; }
function dismantleCost() { return COST_TABLE[Math.min(Math.max(0, Number(loadState().dismantleStep || 0)), COST_TABLE.length - 1)]; }
function installedCount(state = loadState()) { return POINTS.filter((point) => state.installed[point.id] && point.id !== 'lab').length; }
function dynamicInstalledCount(state = loadState()) { return POINTS.filter((point) => state.installed[point.id] && !point.defaultOpen && point.id !== 'lab').length; }
function isFound(point, state) { return !!state.found[point.id]; }
function isInstalled(point, state) { return !!state.installed[point.id]; }
function openModal(html) { const body = $('#modalBody'); const modal = $('#modal'); if (!body || !modal) return; body.innerHTML = html; modal.style.display = 'block'; }
function closeModal() { const modal = $('#modal'); if (modal) modal.style.display = 'none'; }
function pointById(id) { return POINTS.find((point) => point.id === id); }
function progressHTML(point, action, cost) {
  return `<div class="bugHoleSheet"><h2>${point.icon} ${point.name}</h2><div class="bugHoleIntro">${action} 진행 중... 탐사코어 ${cost} 사용</div><div class="bugHoleProgress"><i></i></div><p class="bugHoleHint">BUG HOLE 공간 연결 신호를 안정화하는 중입니다.</p></div>${styleHTML()}`;
}
function styleHTML() {
  return `<style>
    .bugHoleSheet h2{margin:0 0 8px}.bugHoleHeader{display:flex;justify-content:space-between;align-items:flex-end;gap:8px;margin:4px 0 10px}.bugHoleHeader h2{margin:0}.bugHoleHeader small{font-weight:1000;color:#0f6f56;text-align:right}.bugHoleIntro{padding:12px;margin:8px 0 12px;border-radius:18px;background:#0000000a;color:#0009;font-size:12px;font-weight:900;line-height:1.45}.bugHoleCurrency{padding:10px 12px;border-radius:18px;background:linear-gradient(135deg,#07111e,#263b58);color:white;font-size:12px;font-weight:1000;display:flex;justify-content:space-between;gap:8px;align-items:center}.bugHoleStats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}.bugHoleStat{border-radius:16px;background:#0000000a;padding:10px;font-size:12px;font-weight:900}.bugHoleStat b{display:block;font-size:17px}.bugHoleList{display:grid;gap:9px}.bugHoleCard{display:flex;gap:10px;align-items:center;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;padding:11px;box-shadow:0 8px 18px #0001}.bugHoleCard.installed{border-color:#82f7c1aa;box-shadow:0 8px 22px #82f7c122}.bugHoleCard.locked{opacity:.48;filter:grayscale(.7)}.bugHoleIcon{width:52px;height:52px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001}.bugHoleInfo{flex:1}.bugHoleTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.bugHoleTop b{font-size:14px}.bugHoleTop span{border-radius:999px;padding:5px 7px;background:#07111e12;font-size:10px;font-weight:1000;color:#07111e}.bugHoleInfo p{margin:5px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.35}.bugHoleActions{display:flex;gap:6px;flex-wrap:wrap}.bugHoleActions button{border:0;border-radius:12px;background:#07111e;color:white;padding:8px 9px;font-weight:1000;font-size:12px}.bugHoleActions button.secondary{background:#00000013;color:#07111e}.bugHoleActions button:disabled{opacity:.35}.bugHoleProgress{height:18px;background:#00000012;border-radius:999px;overflow:hidden;margin:18px 0}.bugHoleProgress i{display:block;height:100%;width:0;background:linear-gradient(120deg,#82f7c1,#6bb2ff,#a573ed);animation:bugHoleFill 1.7s ease forwards}.bugHoleHint{font-size:12px;font-weight:900;color:#0009}@keyframes bugHoleFill{to{width:100%}}
  </style>`;
}
function cardHTML(point, state) {
  const found = isFound(point, state);
  const installed = isInstalled(point, state);
  const status = !found ? '미발견' : installed ? '연결됨' : '설치 가능';
  const cls = installed ? 'installed' : !found ? 'locked' : '';
  const canDismantle = installed && !point.defaultOpen && point.id !== 'lab';
  const actions = point.type === 'lab'
    ? `<button data-bughole-lab>연구소</button>`
    : installed
      ? `<button data-bughole-travel="${point.id}">이동 🔷${point.travelCost || 0}</button>${canDismantle ? `<button class="secondary" data-bughole-dismantle="${point.id}">해체 🔷${dismantleCost()}</button>` : ''}`
      : found
        ? `<button data-bughole-install="${point.id}">설치 🔷${installCost()}</button>`
        : `<button disabled>탐험 중 발견 필요</button>`;
  return `<article class="bugHoleCard ${cls}"><div class="bugHoleIcon">${point.icon}</div><div class="bugHoleInfo"><div class="bugHoleTop"><b>${found ? point.name : '?????'}</b><span>${status}</span></div><p>${found ? point.desc : '아직 BUG HOLE 신호를 찾지 못했습니다. 해당 지역을 탐험해보세요.'}</p><div class="bugHoleActions">${actions}</div></div></article>`;
}
function renderBugHole() {
  const state = loadState();
  const cards = POINTS.map((point) => cardHTML(point, state)).join('');
  openModal(`<div class="bugHoleSheet"><div class="bugHoleHeader"><h2>🌀 BUG HOLE</h2><small>탐사코어 기반 공간 연결</small></div><div class="bugHoleCurrency"><span>🔷 탐사코어</span><b>${core()}</b></div><div class="bugHoleStats"><div class="bugHoleStat"><b>${installedCount(state)}/${MAX_BUG_HOLES}</b><span>연결 슬롯</span></div><div class="bugHoleStat"><b>🔷 ${installCost()}</b><span>다음 설치비</span></div><div class="bugHoleStat"><b>🔷 ${dismantleCost()}</b><span>다음 해체비</span></div><div class="bugHoleStat"><b>${dynamicInstalledCount(state)}</b><span>설치형 거점</span></div></div><div class="bugHoleIntro">발견한 지점에 BUG HOLE을 설치하면 탐사코어를 사용해 즉시 이동할 수 있습니다. 연구소와 초기마을은 기본 연결 상태입니다.</div><div class="bugHoleList">${cards}</div></div>${styleHTML()}`);
  wireBugHole();
}
function wireBugHole() {
  document.querySelectorAll('[data-bughole-install]').forEach((button) => button.onclick = () => installPoint(button.dataset.bugholeInstall));
  document.querySelectorAll('[data-bughole-dismantle]').forEach((button) => button.onclick = () => dismantlePoint(button.dataset.bugholeDismantle));
  document.querySelectorAll('[data-bughole-travel]').forEach((button) => button.onclick = () => travelPoint(button.dataset.bugholeTravel));
  document.querySelectorAll('[data-bughole-lab]').forEach((button) => button.onclick = () => { closeModal(); setTimeout(() => document.getElementById('openLab')?.click(), 20); });
}
function installPoint(id) {
  const point = pointById(id);
  const state = loadState();
  if (!point || !isFound(point, state)) { toast('아직 발견하지 못한 BUG HOLE입니다.'); return; }
  if (isInstalled(point, state)) { toast('이미 연결된 BUG HOLE입니다.'); return; }
  if (installedCount(state) >= MAX_BUG_HOLES) { toast('BUG HOLE 슬롯이 부족합니다.'); return; }
  const cost = installCost();
  if (!spendCore(cost, `${point.name} BUG HOLE 설치`)) { toast('탐사코어가 부족합니다.'); return; }
  openModal(progressHTML(point, '설치', cost));
  setTimeout(() => {
    const next = loadState();
    next.installed[point.id] = { at: new Date().toLocaleString('ko-KR'), x: point.x, y: point.y };
    next.installStep = Math.min(COST_TABLE.length - 1, Number(next.installStep || 0) + 1);
    saveState(next);
    gameApi()?.addLog?.(`${point.name} BUG HOLE 설치 완료`, point.icon);
    toast(`${point.name} BUG HOLE 연결 완료`);
    renderBugHole();
    window.CATCHABUGS_PROFILE?.updateHud?.();
  }, 1750);
}
function dismantlePoint(id) {
  const point = pointById(id);
  const state = loadState();
  if (!point || point.defaultOpen || point.id === 'lab') { toast('기본 BUG HOLE은 해체할 수 없습니다.'); return; }
  if (!isInstalled(point, state)) { toast('설치된 BUG HOLE이 아닙니다.'); return; }
  const cost = dismantleCost();
  if (!spendCore(cost, `${point.name} BUG HOLE 해체`)) { toast('탐사코어가 부족합니다.'); return; }
  openModal(progressHTML(point, '해체', cost));
  setTimeout(() => {
    const next = loadState();
    delete next.installed[point.id];
    next.dismantleStep = Math.min(COST_TABLE.length - 1, Number(next.dismantleStep || 0) + 1);
    saveState(next);
    gameApi()?.addLog?.(`${point.name} BUG HOLE 해체 완료`, '🧰');
    toast(`${point.name} BUG HOLE 해체 완료`);
    renderBugHole();
    window.CATCHABUGS_PROFILE?.updateHud?.();
  }, 1750);
}
function travelPoint(id) {
  const point = pointById(id);
  const state = loadState();
  if (!point || !isInstalled(point, state)) { toast('설치되지 않은 BUG HOLE입니다.'); return; }
  const cost = Number(point.travelCost || 0);
  if (cost > 0 && !spendCore(cost, `${point.name} BUG HOLE 이동`)) { toast('탐사코어가 부족합니다.'); return; }
  if (point.type === 'lab') { closeModal(); setTimeout(() => document.getElementById('openLab')?.click(), 20); return; }
  gameApi()?.setPlayer?.(point.x || 0, point.y || 0, `${point.name} BUG HOLE 이동`, point.icon);
  toast(`${point.icon} ${point.name}으로 이동`);
  closeModal();
  window.CATCHABUGS_PROFILE?.updateHud?.();
}
function revealAllInstalled() {
  const state = loadState();
  POINTS.forEach((point) => {
    state.found[point.id] = state.found[point.id] || { at: new Date().toLocaleString('ko-KR'), dev: true, x: point.x || 0, y: point.y || 0 };
    state.installed[point.id] = state.installed[point.id] || { at: new Date().toLocaleString('ko-KR'), dev: true, x: point.x || 0, y: point.y || 0 };
  });
  saveState(state);
  toast('BUG HOLE 전체 설치 완료');
  renderBugHole();
}
function patchOldReturnMenu() {
  const body = $('#modalBody');
  if (!body) return;
  const text = body.textContent || '';
  if (body.dataset.bugHolePatched === 'on') return;
  if (text.includes('귀환') || text.includes('귀환석') || text.includes('거점')) {
    if (text.includes('BUG HOLE')) return;
    body.dataset.bugHolePatched = 'on';
    renderBugHole();
  }
}
function patchHubButton() {
  const btn = $('#menuHub-return');
  if (btn && btn.dataset.bugHoleButton !== 'on') {
    btn.dataset.bugHoleButton = 'on';
    btn.innerHTML = '<b>🌀</b><span>BUG HOLE</span>';
    btn.onclick = (event) => { event.preventDefault(); event.stopImmediatePropagation(); renderBugHole(); };
  }
  const legacy = $('#home');
  if (legacy && legacy.dataset.bugHoleButton !== 'on') {
    legacy.dataset.bugHoleButton = 'on';
    legacy.textContent = 'BUG HOLE';
    legacy.onclick = renderBugHole;
  }
}
function init() {
  patchHubButton();
  setInterval(patchHubButton, 1000);
  const body = $('#modalBody');
  if (body && body.dataset.bugHoleObserver !== 'on') {
    body.dataset.bugHoleObserver = 'on';
    new MutationObserver(() => setTimeout(patchOldReturnMenu, 0)).observe(body, { childList: true, subtree: true });
  }
}
window.CATCHABUGS_BUG_HOLE = { open: renderBugHole, loadState, saveState, installPoint, dismantlePoint, travelPoint, revealAllInstalled, points: POINTS };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 700));
setTimeout(init, 1200);
