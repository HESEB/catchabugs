function $(selector) { return document.querySelector(selector); }
function loadModule(id, src) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.type = 'module';
  script.src = src;
  document.head.appendChild(script);
}
function injectStableStyle() {
  if ($('#engine540StableStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine540StableStyle';
  style.textContent = `#map,.map,#regionLayer,.regionObj,.player{pointer-events:none!important}#bugs{position:absolute!important;inset:0!important;z-index:30!important;pointer-events:none!important}.bug{z-index:31!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}.bug .sp,.bug .lab,.bug img{pointer-events:none!important}#npcLayer{z-index:32!important;pointer-events:none!important}.fieldNpc{z-index:33!important;pointer-events:auto!important;touch-action:manipulation!important}#radar{z-index:70!important;pointer-events:auto!important}#radarScreen{pointer-events:none!important}.bottom{z-index:90!important;pointer-events:auto!important}.bottom button,.menuHubBtn,.mini,#modal button,.menuHubItem{pointer-events:auto!important;touch-action:manipulation!important}#modal{z-index:120!important}#modalNavGuardBar{z-index:140!important}`;
  document.head.appendChild(style);
}
function normalizeInteractiveNodes() {
  document.querySelectorAll('.bug').forEach((bug) => {
    bug.style.pointerEvents = 'auto';
    bug.setAttribute('role', 'button');
  });
  document.querySelectorAll('.fieldNpc').forEach((npc) => {
    npc.style.pointerEvents = 'auto';
    npc.setAttribute('role', 'button');
  });
}
function normalizeModalLabels() {
  const back = $('[data-modal-back]');
  const close = $('[data-modal-close]');
  if (back) back.textContent = '← 뒤로';
  if (close) close.textContent = '✕ 닫기';
}
function tick() {
  loadModule('engine550MenuNavigationScript', 'src/engine-5-5-0-menu-navigation.js');
  injectStableStyle();
  normalizeInteractiveNodes();
  normalizeModalLabels();
  setTimeout(tick, 500);
}
document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 300));
setTimeout(tick, 900);
