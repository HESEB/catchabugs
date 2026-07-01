function $(selector) { return document.querySelector(selector); }
let downTarget = null;
let downX = 0;
let downY = 0;
function injectFinalStyle() {
  if ($('#engine535FinalStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine535FinalStyle';
  style.textContent = `
    #bugs{z-index:55!important;pointer-events:auto!important}
    .bug{z-index:56!important;pointer-events:auto!important;width:86px!important;min-height:104px!important;box-sizing:border-box!important;cursor:pointer!important;touch-action:manipulation!important}
    .bug .sp,.bug .lab,.bug img{pointer-events:none!important}
    .player,.map,#regionLayer,.regionObj,#game:before,#game:after{pointer-events:none!important}
    #npcLayer{z-index:58!important;pointer-events:none!important}
    .fieldNpc{z-index:59!important;pointer-events:auto!important;min-width:70px!important;min-height:82px!important}
    #radar{right:10px!important;top:78px!important;z-index:70!important}
    #radarFallbackCompass{right:10px!important;top:auto!important;bottom:92px!important;z-index:74!important;width:150px!important;max-width:42vw!important}
    #compassPanel{display:none!important;pointer-events:none!important}
    .bottom{z-index:90!important;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))!important}
    #modalNavGuardBar{z-index:140!important}
    #modalNavGuardBar [data-modal-back]{background:#00000012!important;color:#07111e!important}
    #modalNavGuardBar [data-modal-close]{background:#07111e!important;color:white!important}
    @media(max-width:640px){#radar{top:72px!important;transform:scale(.94);transform-origin:top right}.hud{top:8px!important;right:150px!important}.profileHud{max-width:142px!important}.bottom{gap:6px!important}.menuHubBtn{max-width:82px!important}.menuHubBtn span{font-size:10px!important}}
  `;
  document.head.appendChild(style);
}
function patchBugDirectClick() {
  document.querySelectorAll('.bug').forEach((bug) => {
    if (bug.dataset.engine535Click === 'on') return;
    bug.dataset.engine535Click = 'on';
    bug.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      downTarget = bug;
      downX = event.clientX;
      downY = event.clientY;
    }, true);
    bug.addEventListener('pointerup', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const moved = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (downTarget === bug && moved < 20 && typeof bug.onclick === 'function') {
        bug.onclick.call(bug, new MouseEvent('click', { bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY }));
      }
      downTarget = null;
    }, true);
  });
}
function patchNpcDirectClick() {
  document.querySelectorAll('.fieldNpc').forEach((npc) => {
    if (npc.dataset.engine535Click === 'on') return;
    npc.dataset.engine535Click = 'on';
    npc.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      downTarget = npc;
      downX = event.clientX;
      downY = event.clientY;
    }, true);
    npc.addEventListener('pointerup', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const moved = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (downTarget === npc && moved < 20 && typeof npc.onclick === 'function') {
        npc.onclick.call(npc, new MouseEvent('click', { bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY }));
      }
      downTarget = null;
    }, true);
  });
}
function normalizeModalButtons() {
  const back = document.querySelector('[data-modal-back]');
  const close = document.querySelector('[data-modal-close]');
  if (back) back.textContent = '← 뒤로';
  if (close) close.textContent = '✕ 닫기';
}
function tick() {
  injectFinalStyle();
  patchBugDirectClick();
  patchNpcDirectClick();
  normalizeModalButtons();
  setTimeout(tick, 180);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 300));
setTimeout(tick, 900);
