const BUGHOLE_BACK_STATE_KEY = 'catchabugs.menuState.v541';

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function readState() {
  const body = $('#modalBody');
  return safeParse(body?.dataset?.menuState || null) || safeParse(sessionStorage.getItem(BUGHOLE_BACK_STATE_KEY));
}
function writeState(current, parent = null) {
  const state = { current, parent, at: Date.now() };
  sessionStorage.setItem(BUGHOLE_BACK_STATE_KEY, JSON.stringify(state));
  const body = $('#modalBody');
  if (body) body.dataset.menuState = JSON.stringify(state);
}
function closeModal() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  sessionStorage.removeItem(BUGHOLE_BACK_STATE_KEY);
}
function openBugHole() {
  writeState('return', null);
  if (window.CATCHABUGS_BUG_HOLE?.open) {
    window.CATCHABUGS_BUG_HOLE.open();
    return true;
  }
  const btn = $('#menuHub-return') || $('#home');
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}
function patchBackButton() {
  const back = $('[data-modal-back]');
  const close = $('[data-modal-close]');
  if (close && close.dataset.bugholeCloseFix !== 'on') {
    close.dataset.bugholeCloseFix = 'on';
    close.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      closeModal();
    }, true);
  }
  if (!back || back.dataset.bugholeBackFix === 'on') return;
  back.dataset.bugholeBackFix = 'on';
  back.addEventListener('click', (event) => {
    const state = readState();
    const bodyText = ($('#modalBody')?.textContent || '').replace(/\s+/g, ' ');
    const isBugHoleChild = state?.parent === 'return' || state?.current === 'bugHoleProgress' || state?.current === 'openLab' || bodyText.includes('설치 진행 중') || bodyText.includes('해체 진행 중') || bodyText.includes('연구소');
    if (!isBugHoleChild) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    openBugHole();
  }, true);
}
function captureBugHoleClicks() {
  if (document.documentElement.dataset.bugholeBackCapture === 'on') return;
  document.documentElement.dataset.bugholeBackCapture = 'on';
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('#menuHub-return,#home')) writeState('return', null);
    if (event.target.closest?.('[data-bughole-install],[data-bughole-dismantle]')) writeState('bugHoleProgress', 'return');
    if (event.target.closest?.('[data-bughole-lab]')) writeState('openLab', 'return');
  }, true);
}
function inferBugHoleState() {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal || modal.style.display === 'none') return;
  const text = (body.textContent || '').replace(/\s+/g, ' ');
  if (text.includes('BUG HOLE') && text.includes('탐사코어 기반 공간 연결')) writeState('return', null);
  if (text.includes('설치 진행 중') || text.includes('해체 진행 중')) writeState('bugHoleProgress', 'return');
}
function tick() {
  captureBugHoleClicks();
  inferBugHoleState();
  patchBackButton();
  setTimeout(tick, 250);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 500));
setTimeout(tick, 1200);
