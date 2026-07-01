function $(selector) { return document.querySelector(selector); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1300);
}
function closeModal() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  try { sessionStorage.setItem('catchabugs.modalNav.v1', '[]'); } catch {}
}
function ensureStyle() {
  if ($('#engine523FixStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine523FixStyle';
  style.textContent = `
    #radar{pointer-events:auto!important;z-index:25!important}
    #radarScreen{pointer-events:none!important}
    #radarCompassToggle{position:relative!important;z-index:60!important;pointer-events:auto!important;touch-action:manipulation!important;min-height:36px!important;background:#ffffff2f!important}
    #modalNavGuardBar button[data-modal-back]{pointer-events:auto!important;touch-action:manipulation!important}
  `;
  document.head.appendChild(style);
}
function forceRadarCompass() {
  const btn = $('#radarCompassToggle');
  if (!btn || btn.dataset.engine523Fix === 'on') return;
  btn.dataset.engine523Fix = 'on';
  btn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    const native = $('#compassBtn');
    if (native) {
      const panel = $('#compassPanel');
      if (panel) {
        panel.style.setProperty('display', 'block', 'important');
        panel.style.setProperty('right', '10px', 'important');
        panel.style.setProperty('left', 'auto', 'important');
        panel.style.setProperty('top', '132px', 'important');
        panel.style.setProperty('z-index', '70', 'important');
      }
      native.click();
      toast('레이더 나침반 실행');
      return;
    }
    window.dispatchEvent(new CustomEvent('catchabugs:force-compass'));
    toast('레이더 나침반 신호 실행');
  }, true);
}
function bindModalBackCapture() {
  if (document.documentElement.dataset.engine523BackCapture === 'on') return;
  document.documentElement.dataset.engine523BackCapture = 'on';
  document.addEventListener('click', (event) => {
    const back = event.target.closest?.('[data-modal-back]');
    const close = event.target.closest?.('[data-modal-close]');
    if (!back && !close) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    closeModal();
    toast(back ? '게임 화면으로 돌아왔습니다.' : '닫았습니다.');
  }, true);
}
function normalizeBackButton() {
  document.querySelectorAll('[data-modal-back]').forEach((button) => {
    button.textContent = '← 게임으로';
    button.onclick = closeModal;
  });
  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.onclick = closeModal;
  });
}
function tick() {
  ensureStyle();
  forceRadarCompass();
  bindModalBackCapture();
  normalizeBackButton();
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 200));
setTimeout(tick, 600);
