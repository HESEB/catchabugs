const MENU_STATE_KEY = 'catchabugs.menuState.v541';

function $(selector) { return document.querySelector(selector); }
function readState() {
  try { return JSON.parse(sessionStorage.getItem(MENU_STATE_KEY) || 'null'); } catch { return null; }
}
function writeState(state) {
  const next = { current: state.current || 'unknown', parent: state.parent || null, at: Date.now() };
  sessionStorage.setItem(MENU_STATE_KEY, JSON.stringify(next));
  const body = $('#modalBody');
  if (body) body.dataset.menuState = JSON.stringify(next);
  return next;
}
function clearState() {
  sessionStorage.removeItem(MENU_STATE_KEY);
  const body = $('#modalBody');
  if (body) delete body.dataset.menuState;
}
function titleText() {
  const body = $('#modalBody');
  if (!body) return '';
  return (body.querySelector('.menuHubHeader h2')?.textContent || body.querySelector('.modalGuardTitle')?.textContent || body.querySelector('.bugHoleHeader h2')?.textContent || body.querySelector('.bugHoleSheet h2')?.textContent || body.querySelector('h2')?.textContent || '').trim();
}
function inferCurrentFromTitle() {
  const title = titleText();
  const bodyText = ($('#modalBody')?.textContent || '').replace(/\s+/g, ' ');
  if (title.includes('연구노트')) return { current: 'note', parent: null };
  if (title.includes('탐험기록')) return { current: 'noteExplore', parent: 'note' };
  if (title.includes('도감')) return { current: 'legacyDex', parent: 'note' };
  if (title.includes('퀘스트') || title.includes('업적') || title.includes('칭호')) return { current: 'questChild', parent: 'quest' };
  if (title.includes('BUG HOLE')) return { current: 'return', parent: null };
  if (title.includes('귀환')) return { current: 'return', parent: null };
  if (title.includes('연구소')) return { current: 'openLab', parent: 'return' };
  if (title.includes('배낭')) return { current: 'backpack', parent: 'settings' };
  if (bodyText.includes('설치 진행 중') || bodyText.includes('해체 진행 중')) return { current: 'bugHoleProgress', parent: 'return' };
  if (title.includes('설정')) return { current: 'settings', parent: null };
  if (title.includes('개발자모드')) return { current: 'developer', parent: 'settings' };
  if (title.includes('사운드') || title.includes('게임정보') || title.includes('장비') || title.includes('아이템')) return { current: 'settingsChild', parent: 'settings' };
  return null;
}
function syncStateToModal() {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal || modal.style.display === 'none') return;
  const inferred = inferCurrentFromTitle();
  if (inferred) writeState(inferred);
  const existing = readState();
  if (existing) body.dataset.menuState = JSON.stringify(existing);
}
function bindMenuStateCapture() {
  if (document.documentElement.dataset.engine541MenuState === 'on') return;
  document.documentElement.dataset.engine541MenuState = 'on';
  document.addEventListener('click', (event) => {
    const hub = event.target.closest?.('.menuHubBtn');
    if (hub?.id === 'menuHub-note') writeState({ current: 'note', parent: null });
    if (hub?.id === 'menuHub-quest') writeState({ current: 'quest', parent: null });
    if (hub?.id === 'menuHub-return') writeState({ current: 'return', parent: null });
    if (hub?.id === 'menuHub-settings') writeState({ current: 'settings', parent: null });

    const legacy = event.target.closest?.('#home');
    if (legacy) writeState({ current: 'return', parent: null });

    const bugHoleButton = event.target.closest?.('[data-bughole-install],[data-bughole-dismantle]');
    if (bugHoleButton) writeState({ current: 'bugHoleProgress', parent: 'return' });
    const bugHoleLab = event.target.closest?.('[data-bughole-lab]');
    if (bugHoleLab) writeState({ current: 'openLab', parent: 'return' });
    const bugHoleTravel = event.target.closest?.('[data-bughole-travel]');
    if (bugHoleTravel) writeState({ current: 'bugHoleTravel', parent: null });

    const panel = event.target.closest?.('[data-panel]');
    if (panel?.dataset.panel === 'noteExplore') writeState({ current: 'noteExplore', parent: 'note' });
    if (panel?.dataset.panel === 'developer') writeState({ current: 'developer', parent: 'settings' });

    const target = event.target.closest?.('[data-target]');
    const id = target?.dataset.target;
    const current = readState();
    if (id === 'openDex') writeState({ current: 'legacyDex', parent: current?.current === 'note' ? 'note' : null });
    if (id === 'openQuest' || id === 'openAchievement' || id === 'openBadgeTitle') writeState({ current: id, parent: current?.current === 'quest' ? 'quest' : null });
    if (id === 'openSave') writeState({ current: 'openSave', parent: current?.current === 'settings' ? 'settings' : null });
    if (id === 'openLab') writeState({ current: 'openLab', parent: current?.current === 'return' ? 'return' : null });
    if (id === 'openBackpack' || id === 'openBag' || id === 'openItems' || id === 'openActiveItems') writeState({ current: id, parent: 'settings' });

    const close = event.target.closest?.('[data-modal-close],#closeModal');
    if (close) setTimeout(clearState, 50);
  }, true);
}
function tick() {
  bindMenuStateCapture();
  syncStateToModal();
  setTimeout(tick, 300);
}
window.CATCHABUGS_MENU_STATE = { read: readState, write: writeState, clear: clearState };
document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 300));
setTimeout(tick, 900);
