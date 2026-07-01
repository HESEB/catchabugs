function $(selector) { return document.querySelector(selector); }
function ensureStyle() {
  if ($('#engine523FixStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine523FixStyle';
  style.textContent = `
    #radar{pointer-events:auto!important;z-index:25!important}
    #radarScreen{pointer-events:none!important}
    #radarCompassToggle{position:relative!important;z-index:60!important;pointer-events:auto!important;touch-action:manipulation!important;min-height:36px!important;background:#ffffff2f!important}
    #modalNavGuardBar button{pointer-events:auto!important;touch-action:manipulation!important}
  `;
  document.head.appendChild(style);
}
function normalizeBackButton() {
  document.querySelectorAll('[data-modal-back]').forEach((button) => {
    if (!button.dataset.engine533Label) button.textContent = '← 뒤로';
  });
  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    if (!button.dataset.engine533Label) button.textContent = '✕ 닫기';
  });
}
function tick() {
  ensureStyle();
  normalizeBackButton();
  setTimeout(tick, 500);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 200));
setTimeout(tick, 600);
