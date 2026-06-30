const BUG_HOLE_KEY = 'catchabugs.bughole.v1';
const BADGE_TITLE_KEY = 'catchabugs.badgeTitle.v1';
const RETURN_KEY = 'catchabugs.returnStones.v1';

let compassPanelOpen = false;
let compassHeading = 0;

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
    .engine522Compass{position:absolute;right:10px;top:132px;z-index:30;width:156px;padding:10px;border-radius:18px;background:#07111ee8;color:white;border:1px solid #ffffff38;box-shadow:0 14px 30px #0008;font-size:11px;font-weight:1000}.engine522Compass h3{margin:0 0 8px;font-size:13px}.engine522Compass .dial{width:72px;height:72px;margin:6px auto;border-radius:50%;border:2px solid #fff7;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#ffffff18,#0000)}.engine522Compass .needle{font-size:30px;transform:rotate(var(--deg,0deg));transition:transform .18s ease}.engine522Compass input{width:100%;margin:8px 0}.engine522Compass button{width:100%;border:0;border-radius:12px;padding:8px;font-weight:1000;background:#9af7ff;color:#07111e}.engine522Compass small{display:block;opacity:.75;margin-top:6px;line-height:1.35}
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

function renderCompassPanel() {
  let panel = $('#engine522Compass');
  if (!compassPanelOpen) {
    if (panel) panel.remove();
    return;
  }
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'engine522Compass';
    panel.className = 'engine522Compass';
    panel.innerHTML = `<h3>🧭 레이더 나침반</h3><div class="dial"><div id="engine522Needle" class="needle">▲</div></div><input id="engine522CompassSlider" type="range" min="0" max="359" value="0"><button id="engine522CompassClose">닫기</button><small>임시 안정화 나침반입니다. 슬라이더로 방향을 확인합니다.</small>`;
    $('#game')?.appendChild(panel);
    $('#engine522CompassSlider')?.addEventListener('input', (event) => {
      compassHeading = Number(event.target.value || 0);
      updateCompassVisual();
      toast(`나침반 ${compassHeading}°`);
    });
    $('#engine522CompassClose')?.addEventListener('click', () => {
      compassPanelOpen = false;
      renderCompassPanel();
    });
  }
  updateCompassVisual();
}
function updateCompassVisual() {
  const needle = $('#engine522Needle');
  const slider = $('#engine522CompassSlider');
  if (needle) needle.style.setProperty('--deg', `${compassHeading}deg`);
  if (slider) slider.value = String(compassHeading);
  const hint = $('#radarHint');
  if (hint && compassPanelOpen) hint.textContent = `🧭 나침반 ${compassHeading}° · BUG HOLE/곤충 신호 확인중`;
}
function toggleCompassPanel() {
  const nativeBtn = $('#compassBtn');
  if (nativeBtn) {
    nativeBtn.click();
    toast('나침반 버튼 실행');
    return;
  }
  compassPanelOpen = !compassPanelOpen;
  renderCompassPanel();
  toast(compassPanelOpen ? '레이더 나침반 ON' : '레이더 나침반 OFF');
}
function patchRadarCompassClick() {
  const radar = $('#radar');
  if (!radar || radar.dataset.engine522Compass === 'on') return;
  radar.dataset.engine522Compass = 'on';
  radar.addEventListener('click', (event) => {
    if (event.target.closest('.radar-blip') || event.target.closest('#bugHoleMarker')) return;
    event.preventDefault();
    event.stopPropagation();
    toggleCompassPanel();
  });
}

function installedBugHolePoints() {
  const system = window.CATCHABUGS_BUG_HOLE;
  const state = system?.loadState?.() || loadReturnState();
  const points = system?.points || [];
  const result = [];
  points.forEach((point) => {
    if (point.x === undefined || point.y === undefined) return;
    if (state.installed?.[point.id] || state.discovered?.[point.id] || state.found?.[point.id]) result.push(point);
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
    <div class="engine522Actions"><button id="setBugHoleNow">현재 위치를 BUG HOLE로 지정</button><button id="goBugHole" ${hole ? '' : 'disabled'}>BUG HOLE로 이동</button><button class="secondary" id="closeBugHoleMenu">닫기</button></div>`);
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

function closeModalOnly() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
}
function patchModalBack() {
  const modal = $('#modal');
  const close = $('#closeModal');
  if (!modal) return;
  if (close) close.onclick = closeModalOnly;
  document.querySelectorAll('[data-menu-back]').forEach((button) => {
    if (button.dataset.engine522Back === 'on') return;
    button.dataset.engine522Back = 'on';
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      closeModalOnly();
      toast('게임 화면으로 돌아왔습니다.');
    };
    button.textContent = '← 게임으로';
  });
  document.querySelectorAll('[data-menu-close]').forEach((button) => {
    if (button.dataset.engine522Close === 'on') return;
    button.dataset.engine522Close = 'on';
    button.onclick = (event) => {
      event.preventDefault();
      closeModalOnly();
    };
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
  renderCompassPanel();
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 400));
setTimeout(tick, 1000);
