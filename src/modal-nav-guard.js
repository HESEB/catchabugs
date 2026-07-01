const MODAL_HISTORY_KEY = 'catchabugs.modalNav.v1';

function $(selector) { return document.querySelector(selector); }
function modal() { return $('#modal'); }
function body() { return $('#modalBody'); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadHistory() { return safeParse(sessionStorage.getItem(MODAL_HISTORY_KEY)) || []; }
function saveHistory(stack) { sessionStorage.setItem(MODAL_HISTORY_KEY, JSON.stringify(stack.slice(-16))); }
function closeModal() { const m = modal(); if (m) m.style.display = 'none'; saveHistory([]); }
function stripGuard(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  tmp.querySelectorAll('#modalNavGuardBar,#modalNavGuardStyle,.menuNavRow').forEach((node) => node.remove());
  return tmp.innerHTML;
}
function captureContent() {
  const b = body();
  if (!b) return '';
  return stripGuard(b.innerHTML);
}
function restorePrevious() {
  const b = body();
  const m = modal();
  if (!b || !m) { closeModal(); return; }
  const current = captureContent();
  let stack = loadHistory().map(stripGuard).filter(Boolean);
  while (stack.length && stack[stack.length - 1] === current) stack.pop();
  const previous = stack.pop();
  saveHistory(stack);
  if (!previous) { closeModal(); return; }
  b.innerHTML = previous;
  m.style.display = 'block';
  setTimeout(() => { ensureNavBar(); wireDelegatedButtons(); }, 0);
}
function pushCurrent(dedupe = true) {
  const html = captureContent();
  if (!html) return;
  const stack = loadHistory().map(stripGuard).filter(Boolean);
  if (dedupe && stack[stack.length - 1] === html) return;
  stack.push(html);
  saveHistory(stack);
}
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
function normalizeExistingButtons() {
  const b = body();
  if (!b) return;
  b.querySelectorAll('.menuNavRow').forEach((row) => { row.style.display = 'none'; });
  b.querySelectorAll('[data-menu-close]').forEach((button) => { button.textContent = '✕ 닫기'; button.onclick = closeModal; });
  b.querySelectorAll('[data-menu-back]').forEach((button) => { button.textContent = '← 뒤로'; button.onclick = restorePrevious; });
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
function wireDelegatedButtons() {
  const b = body();
  if (!b || b.dataset.modalNavDelegated === 'on') return;
  b.dataset.modalNavDelegated = 'on';
  b.addEventListener('click', (event) => {
    const targetButton = event.target.closest?.('[data-target]');
    const panelButton = event.target.closest?.('[data-panel]');
    if (targetButton) {
      const id = targetButton.dataset.target;
      const target = document.getElementById(id);
      if (target) { closeModal(); setTimeout(() => target.click(), 20); }
    }
    if (panelButton) {
      const panel = panelButton.dataset.panel;
      if (panel === 'noteExplore') document.querySelector('#menuHub-note')?.click();
      if (panel === 'developer') document.querySelector('#menuHub-settings')?.click();
    }
  });
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
      if (current && stripGuard(stack[stack.length - 1] || '') !== current) pushCurrent(true);
      setTimeout(() => { ensureNavBar(); wireDelegatedButtons(); }, 0);
    }
  });
  observer.observe(b, { childList: true, subtree: true });
  const modalObserver = new MutationObserver(() => setTimeout(() => { ensureNavBar(); wireDelegatedButtons(); }, 0));
  modalObserver.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
}
function patchCloseButton() { const close = $('#closeModal'); if (close) close.onclick = closeModal; }
function init() { injectStyle(); patchCloseButton(); patchModalOpen(); wireDelegatedButtons(); setInterval(() => { patchCloseButton(); ensureNavBar(); wireDelegatedButtons(); }, 900); }
window.CATCHABUGS_MODAL_NAV = { close: closeModal, back: restorePrevious, ensure: ensureNavBar, reset(){ saveHistory([]); } };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
setTimeout(init, 500);
