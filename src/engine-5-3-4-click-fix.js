function $(selector) { return document.querySelector(selector); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1200);
}
function injectHitStyle() {
  if ($('#engine534ClickFixStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine534ClickFixStyle';
  style.textContent = `
    #map,.map,#regionLayer,.regionObj,.player,#game:before,#game:after{pointer-events:none!important}
    #bugs{position:absolute!important;inset:0!important;z-index:18!important;pointer-events:none!important}
    .bug{position:absolute!important;z-index:19!important;pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;min-width:74px!important;min-height:92px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important}
    .bug .sp,.bug .lab,.bug img{pointer-events:none!important}
    .bug .sp{margin:auto!important}
    #npcLayer{z-index:20!important;pointer-events:none!important}
    .fieldNpc{z-index:21!important;pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;min-width:64px!important;min-height:74px!important}
    .fieldNpc .npcIcon,.fieldNpc .npcLabel{pointer-events:none!important}
    .bottom{z-index:80!important;pointer-events:auto!important;transform:none!important;align-items:center!important;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))!important}
    .bottom .mini,.mini{position:relative!important;z-index:81!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;min-height:46px!important;min-width:52px!important;box-sizing:border-box!important;transform:none!important}
    .bottom .mini:before{content:'';position:absolute;inset:-8px -6px;z-index:-1;border-radius:18px;pointer-events:auto}
    #modal{z-index:120!important;pointer-events:auto!important}
    #modal .box{position:relative!important;z-index:121!important;pointer-events:auto!important;transform:none!important;touch-action:auto!important}
    #modal button,#modal [role="button"],#modalNavGuardBar button{position:relative!important;z-index:130!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;min-height:38px!important;box-sizing:border-box!important;transform:none!important}
    #modalNavGuardBar{z-index:135!important;pointer-events:auto!important;transform:none!important}
    #radar{z-index:70!important;pointer-events:auto!important}
    #radarScreen{pointer-events:none!important}
    #radarCompassToggle{pointer-events:auto!important;z-index:72!important}
  `;
  document.head.appendChild(style);
}
function normalizeBugHitboxes() {
  document.querySelectorAll('.bug').forEach((bug) => {
    bug.style.pointerEvents = 'auto';
    bug.style.zIndex = '19';
    bug.setAttribute('role', 'button');
    bug.setAttribute('tabindex', '0');
    if (bug.dataset.engine534Key === 'on') return;
    bug.dataset.engine534Key = 'on';
    bug.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        bug.click();
      }
    });
  });
}
function normalizeMenuButtons() {
  document.querySelectorAll('.mini,.bottom button,#modal button,#modalNavGuardBar button,.menuHubBtn,.menuHubItem').forEach((button) => {
    button.style.pointerEvents = 'auto';
    button.style.touchAction = 'manipulation';
    button.style.transform = 'none';
  });
}
function protectClickableTargets() {
  if (document.documentElement.dataset.engine534ClickProtect === 'on') return;
  document.documentElement.dataset.engine534ClickProtect = 'on';
  document.addEventListener('pointerdown', (event) => {
    const clickable = event.target.closest?.('.bug,.fieldNpc,.mini,.bottom button,#modal button,#radarCompassToggle,.menuHubBtn,.menuHubItem');
    if (!clickable) return;
    clickable.dataset.engine534Down = '1';
  }, true);
  document.addEventListener('click', (event) => {
    const clickable = event.target.closest?.('.bug,.fieldNpc,.mini,.bottom button,#modal button,#radarCompassToggle,.menuHubBtn,.menuHubItem');
    if (!clickable) return;
    clickable.dataset.engine534Down = '';
  }, true);
}
function tick() {
  injectHitStyle();
  normalizeBugHitboxes();
  normalizeMenuButtons();
  protectClickableTargets();
  setTimeout(tick, 250);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 300));
setTimeout(tick, 900);
