const BUG_HOLE_KEY = 'catchabugs.bughole.v1';
const BADGE_TITLE_KEY = 'catchabugs.badgeTitle.v1';
const RETURN_KEY = 'catchabugs.returnStones.v1';

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1400);
}
function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
  setTimeout(() => window.CATCHABUGS_MODAL_NAV?.ensure?.(), 0);
}
function loadHole() { return safeParse(localStorage.getItem(BUG_HOLE_KEY)) || null; }
function saveHole(hole) { localStorage.setItem(BUG_HOLE_KEY, JSON.stringify(hole)); }
function loadReturnState() { return safeParse(localStorage.getItem(RETURN_KEY)) || { found: {}, installed: {}, discovered: {} }; }

function injectStableStyles() {
  if ($('#engine522StableStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine522StableStyle';
  style.textContent = `
    .bug{padding:18px;margin:-18px;touch-action:manipulation}.bug .sp{pointer-events:none}.bug .lab{pointer-events:none}
    .engine522BugHoleTriangle{position:absolute;left:50%;top:50%;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:15px solid #fff;filter:drop-shadow(0 0 10px #fff) drop-shadow(0 4px 7px #0009);z-index:20;transform:translate(-50%,-50%);pointer-events:none}
    .engine522Card{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.engine522Card b{font-size:15px}.engine522Card p{margin:7px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.engine522Actions{display:grid;gap:8px;margin-top:10px}.engine522Actions button{border:0;border-radius:14px;background:#07111e;color:white;padding:11px 12px;font-weight:1000}.engine522Actions button.secondary{background:#eaf1f3;color:#07111e}.engine522Actions button:disabled{opacity:.35}
  `;
  document.head.appendChild(style);
}

function syncEquippedTitleToHud() {
  const state = safeParse(localStorage.getItem(BADGE_TITLE_KEY));
  if (!state?.equippedTitle) return;
  const small = $('#profileHud small');
  if (!small) return;
  const level = (small.textContent.match(/Lv\.\d+/)?.[0]) || 'Lv.1';
  small.textContent = `${level} · 【${state.equippedTitle}】`;
}

function patchRadarCompassClick() {
  const radar = $('#radar');
  if (!radar || radar.dataset.engine522Compass === 'on') return;
  radar.dataset.engine522Compass = 'on';
  radar.addEventListener('click', (event) => {
    if (event.target.closest('.radar-blip') || event.target.closest('#bugHoleMarker')) return;
    const btn = $('#compassBtn');
    if (btn) {
      btn.click();
      return;
    }
    toast('나침반은 좌측 패널에서 사용할 수 있어요.');
  });
}

function installedBugHolePoints() {
  const system = window.CATCHABUGS_BUG_HOLE;
  const state = system?.loadState?.() || loadReturnState();
  const points = system?.points || [];
  const result = [];
  points.forEach((point) => {
    if (point.x === undefined || point.y === undefined) return;
    if (state.installed?.[point.id] || state.discovered?.[point.id] || state.found?.[point.id]) {
      result.push(point);
    }
  });
  const custom = loadHole();
  if (custom) result.push({ id: 'custom-bug-hole', name: custom.name || 'BUG HOLE', x: custom.x, y: custom.y });
  return result;
}

function updateBugHoleMarker() {
  const screen = $('#radarScreen');
  const api = window.CATCHABUGS_GAME;
  if (!screen || !api?.getPlayer) return;
  let marker = $('#bugHoleMarker');
  const player = api.getPlayer();
  const points = installedBugHolePoints();
  const nearest = points
    .map((point) => ({ point, d: Math.hypot(Number(point.x || 0) - Number(player.x || 0), Number(point.y || 0) - Number(player.y || 0)) }))
    .sort((a, b) => a.d - b.d)[0];
  if (!nearest) {
    if (marker) marker.remove();
    return;
  }
  if (!marker) {
    marker = document.createElement('div');
    marker.id = 'bugHoleMarker';
    marker.className = 'engine522BugHoleTriangle';
    screen.appendChild(marker);
  }
  const point = nearest.point;
  const dx = Number(point.x || 0) - Number(player.x || 0);
  const dy = Number(point.y || 0) - Number(player.y || 0);
  const range = 620;
  const x = Math.max(8, Math.min(92, 50 + (dx / range) * 48));
  const y = Math.max(8, Math.min(92, 50 + (dy / range) * 48));
  marker.style.left = `${x}%`;
  marker.style.top = `${y}%`;
  marker.title = point.name || 'BUG HOLE';
}

function openBugHoleMenu() {
  if (window.CATCHABUGS_BUG_HOLE?.open) {
    window.CATCHABUGS_BUG_HOLE.open();
    setTimeout(updateBugHoleMarker, 100);
    return;
  }
  const api = window.CATCHABUGS_GAME;
  const player = api?.getPlayer?.() || { x: 0, y: 0, regionId: 'forest' };
  const hole = loadHole();
  openModal(`<h2>BUG HOLE</h2>
    <div class="engine522Card"><b>${hole ? '지정된 BUG HOLE' : 'BUG HOLE 미지정'}</b><p>${hole ? `${hole.name || 'BUG HOLE'} · X ${Math.round(hole.x)} / Y ${Math.round(hole.y)}` : '현재 위치를 BUG HOLE로 지정하면 레이더에 흰색 삼각형으로 표시됩니다.'}</p></div>
    <div class="engine522Actions">
      <button id="setBugHoleNow">현재 위치를 BUG HOLE로 지정</button>
      <button id="goBugHole" ${hole ? '' : 'disabled'}>BUG HOLE로 이동</button>
      <button class="secondary" id="closeBugHoleMenu">닫기</button>
    </div>`);
  $('#setBugHoleNow')?.addEventListener('click', () => {
    const current = api?.getPlayer?.() || player;
    saveHole({ x: Number(current.x || 0), y: Number(current.y || 0), regionId: current.regionId || 'forest', name: 'BUG HOLE', at: new Date().toLocaleString('ko-KR') });
    api?.addLog?.('BUG HOLE 지정 완료', '🌀');
    toast('BUG HOLE 지정 완료 · 레이더에 흰색 삼각형 표시');
    updateBugHoleMarker();
    openBugHoleMenu();
  });
  $('#goBugHole')?.addEventListener('click', () => {
    const target = loadHole();
    if (!target) return;
    api?.setPlayer?.(target.x, target.y, 'BUG HOLE 귀환', '🌀');
    toast('BUG HOLE로 이동했습니다.');
    $('#modal').style.display = 'none';
    updateBugHoleMarker();
  });
  $('#closeBugHoleMenu')?.addEventListener('click', () => { $('#modal').style.display = 'none'; });
}

function patchBugHoleButton() {
  ['#menuHub-return', '#home'].forEach((selector) => {
    const button = $(selector);
    if (!button) return;
    button.dataset.engine522BugHole = 'on';
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      openBugHoleMenu();
    };
    if (selector === '#menuHub-return') button.innerHTML = '<b>🌀</b><span>BUG HOLE</span>';
  });
}

function patchModalBack() {
  const modal = $('#modal');
  const close = $('#closeModal');
  if (!modal || modal.dataset.engine522Back === 'on') return;
  modal.dataset.engine522Back = 'on';
  if (close) close.onclick = () => { modal.style.display = 'none'; };
  window.addEventListener('popstate', () => {
    if (modal.style.display !== 'none') modal.style.display = 'none';
  });
}

function patchLegendManualButtons() {
  document.querySelectorAll('[data-legend-fix-note]').forEach((button) => {
    button.disabled = true;
    button.textContent = '채집 시 자동 기록';
  });
}

function tick() {
  injectStableStyles();
  syncEquippedTitleToHud();
  patchRadarCompassClick();
  patchBugHoleButton();
  patchModalBack();
  patchLegendManualButtons();
  updateBugHoleMarker();
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 400));
setTimeout(tick, 1000);
