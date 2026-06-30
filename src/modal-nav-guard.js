const MODAL_HISTORY_KEY = 'catchabugs.modalNav.v1';

function $(selector) { return document.querySelector(selector); }
function modal() { return $('#modal'); }
function body() { return $('#modalBody'); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadHistory() { return safeParse(sessionStorage.getItem(MODAL_HISTORY_KEY)) || []; }
function saveHistory(stack) { sessionStorage.setItem(MODAL_HISTORY_KEY, JSON.stringify(stack.slice(-12))); }
function closeModal() { const m = modal(); if (m) m.style.display = 'none'; saveHistory([]); }
function captureContent() {
  const b = body();
  if (!b) return '';
  const clone = b.cloneNode(true);
  clone.querySelectorAll('#modalNavGuardBar,#modalNavGuardStyle').forEach((node) => node.remove());
  clone.querySelectorAll('.menuNavRow').forEach((node) => node.remove());
  return clone.innerHTML;
}
function restorePrevious() {
  // 이전 HTML을 그대로 복원하면 각 메뉴의 onclick이 사라져 먹통이 되므로,
  // 안전하게 최상위 메뉴 허브로 돌아가도록 처리한다.
  const b = body();
  if (!b) { closeModal(); return; }
  const text = b.textContent || '';
  const modalApi = window.CATCHABUGS_MODAL_NAV;
  if (text.includes('호박사') || text.includes('나상인') || text.includes('연구소')) {
    window.CATCHABUGS_LAB?.open?.();
    return;
  }
  if (text.includes('배낭')) { window.CATCHABUGS_BACKPACK?.open?.(); return; }
  if (text.includes('BUG HOLE')) { window.CATCHABUGS_BUG_HOLE?.open?.(); return; }
  closeModal();
}
function pushCurrent(dedupe = true) {
  const html = captureContent();
  if (!html) return;
  const stack = loadHistory();
  if (dedupe && stack[stack.length - 1] === html) return;
  stack.push(html);
  saveHistory(stack);
}
function injectStyle() {
  if ($('#modalNavGuardStyle')) return;
  const style = document.createElement('style');
  style.id = 'modalNavGuardStyle';
  style.textContent = `
    #modalNavGuardBar{position:sticky;top:0;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-2px -2px 10px;padding:4px 0 9px;background:linear-gradient(180deg,#fff 82%,#ffffff00);backdrop-filter:blur(6px)}
    #modalNavGuardBar button{border:0;border-radius:999px;min-width:74px;height:34px;padding:0 12px;font-size:12px;font-weight:1000;background:#07111e;color:white;box-shadow:0 6px 14px #0001}
    #modalNavGuardBar button[data-modal-back]{background:#00000012;color:#07111e}
    #modalNavGuardBar button:disabled{opacity:.25}
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
function normalizeExistingButtons() {
  const b = body();
  if (!b) return;
  b.querySelectorAll('.menuNavRow').forEach((row) => { row.style.display = 'none'; });
  b.querySelectorAll('[data-menu-close]').forEach((button) => { button.textContent = '✕ 닫기'; button.onclick = closeModal; });
  b.querySelectorAll('[data-menu-back]').forEach((button) => { button.textContent = '← 뒤로'; });
  b.querySelectorAll('button').forEach((button) => {
    const text = (button.textContent || '').trim();
    if (text === '게임으로') { button.textContent = '✕ 닫기'; button.onclick = closeModal; }
  });
}
function ensureNavBar() {
  const b = body();
  const m = modal();
  if (!b || !m || m.style.display === 'none') return;
  injectStyle();
  normalizeExistingButtons();
  const existing = b.querySelectorAll('#modalNavGuardBar');
  existing.forEach((node, index) => { if (index > 0) node.remove(); });
  let bar = $('#modalNavGuardBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'modalNavGuardBar';
    bar.innerHTML = `<button type="button" data-modal-back>← 뒤로</button><div class="modalGuardTitle"></div><button type="button" data-modal-close>✕ 닫기</button>`;
    b.insertBefore(bar, b.firstChild);
  }
  const back = bar.querySelector('[data-modal-back]');
  const close = bar.querySelector('[data-modal-close]');
  const title = bar.querySelector('.modalGuardTitle');
  if (title) title.textContent = inferTitle();
  if (back) back.onclick = restorePrevious;
  if (close) close.onclick = closeModal;
}
function patchModalOpen() {
  const m = modal();
  const b = body();
  if (!m || !b || b.dataset.modalNavGuardObserver === 'on') return;
  b.dataset.modalNavGuardObserver = 'on';
  const observer = new MutationObserver(() => {
    if (m.style.display !== 'none' && b.innerHTML.trim()) {
      const current = captureContent();
      const stack = loadHistory();
      if (current && stack[stack.length - 1] !== current) pushCurrent(true);
      setTimeout(ensureNavBar, 0);
    }
  });
  observer.observe(b, { childList: true, subtree: true });
  const modalObserver = new MutationObserver(() => setTimeout(ensureNavBar, 0));
  modalObserver.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
}
function patchCloseButton() { const close = $('#closeModal'); if (close) close.onclick = closeModal; }
function init() { injectStyle(); patchCloseButton(); patchModalOpen(); setInterval(() => { patchCloseButton(); ensureNavBar(); }, 900); }
window.CATCHABUGS_MODAL_NAV = { close: closeModal, back: restorePrevious, ensure: ensureNavBar, reset(){ saveHistory([]); } };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
setTimeout(init, 500);
