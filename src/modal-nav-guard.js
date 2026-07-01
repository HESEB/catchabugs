function $(selector) { return document.querySelector(selector); }
function modal() { return $('#modal'); }
function body() { return $('#modalBody'); }
function closeModal() { window.CATCHABUGS_MENU_NAV?.close?.(); const m = modal(); if (m && !window.CATCHABUGS_MENU_NAV) m.style.display = 'none'; }
function goBack() { if (window.CATCHABUGS_MENU_NAV?.back?.()) return; closeModal(); }
function injectStyle() {
  if ($('#modalNavGuardStyle')) return;
  const style = document.createElement('style');
  style.id = 'modalNavGuardStyle';
  style.textContent = `
    #modalNavGuardBar{position:sticky;top:0;z-index:140;display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-2px -2px 10px;padding:4px 0 9px;background:linear-gradient(180deg,#fff 82%,#ffffff00);backdrop-filter:blur(6px);pointer-events:auto}
    #modalNavGuardBar button{border:0;border-radius:999px;min-width:74px;height:34px;padding:0 12px;font-size:12px;font-weight:1000;background:#07111e;color:white;box-shadow:0 6px 14px #0001;pointer-events:auto;touch-action:manipulation}
    #modalNavGuardBar button[data-modal-back]{background:#00000012;color:#07111e}
    #modalNavGuardBar .modalGuardTitle{flex:1;text-align:center;font-size:12px;font-weight:1000;color:#0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #modal .box{position:relative}
    #closeModal{display:none!important}
    #modalBody>.menuHubSheet>.menuNavRow{display:none!important}
    #modalBody .menuNavRow{display:none!important}
  `;
  document.head.appendChild(style);
}
function inferTitle() {
  const b = body();
  if (!b) return '메뉴';
  const candidates = ['.menuHubHeader h2', '.bugHoleHeader h2', '.profileName b', '.bagSheet h2', '.labHeader h2', '.dexHeader h2', 'h2'];
  for (const selector of candidates) {
    const node = b.querySelector(selector);
    const text = node?.textContent?.trim();
    if (text) return text.replace(/\s+/g, ' ').slice(0, 18);
  }
  return '메뉴';
}
function hideOldNavRows() {
  const b = body();
  if (!b) return;
  b.querySelectorAll('.menuNavRow').forEach((row) => { row.style.display = 'none'; });
}
function ensureNavBar() {
  const b = body();
  const m = modal();
  if (!b || !m || m.style.display === 'none') return;
  injectStyle();
  hideOldNavRows();
  b.querySelectorAll('#questLocalBackBar').forEach((node) => node.remove());
  const existing = b.querySelectorAll('#modalNavGuardBar');
  existing.forEach((node, index) => { if (index > 0) node.remove(); });
  let bar = $('#modalNavGuardBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'modalNavGuardBar';
    bar.innerHTML = `<button type="button" data-modal-back>← 뒤로</button><div class="modalGuardTitle"></div><button type="button" data-modal-close>✕ 닫기</button>`;
    b.insertBefore(bar, b.firstChild);
  }
  const title = bar.querySelector('.modalGuardTitle');
  if (title) title.textContent = inferTitle();
  const back = bar.querySelector('[data-modal-back]');
  const close = bar.querySelector('[data-modal-close]');
  if (back) back.onclick = goBack;
  if (close) close.onclick = closeModal;
}
function patchModalOpen() {
  const m = modal();
  const b = body();
  if (!m || !b || b.dataset.modalNavGuardObserver === 'on') return;
  b.dataset.modalNavGuardObserver = 'on';
  const observer = new MutationObserver(() => {
    if (m.style.display !== 'none' && b.innerHTML.trim()) setTimeout(ensureNavBar, 0);
  });
  observer.observe(b, { childList: true, subtree: true });
  const modalObserver = new MutationObserver(() => setTimeout(ensureNavBar, 0));
  modalObserver.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
}
function init() {
  injectStyle();
  patchModalOpen();
  setInterval(ensureNavBar, 900);
}
window.CATCHABUGS_MODAL_NAV = { close: closeModal, back: goBack, ensure: ensureNavBar, reset(){} };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
setTimeout(init, 500);
