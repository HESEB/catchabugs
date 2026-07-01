const MENU_STATE_FIX_KEY = 'catchabugs.menuState.v541';

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function writeState(current, parent = null) {
  const state = { current, parent, at: Date.now() };
  sessionStorage.setItem(MENU_STATE_FIX_KEY, JSON.stringify(state));
  const body = $('#modalBody');
  if (body) body.dataset.menuState = JSON.stringify(state);
}
function readState() {
  const body = $('#modalBody');
  return safeParse(body?.dataset?.menuState || null) || safeParse(sessionStorage.getItem(MENU_STATE_FIX_KEY));
}
function closeModal() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  sessionStorage.removeItem(MENU_STATE_FIX_KEY);
}
function openHub(id) {
  const btn = $(`#menuHub-${id}`);
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}
function titleText() {
  const body = $('#modalBody');
  if (!body) return '';
  return (body.querySelector('.menuHubHeader h2')?.textContent || body.querySelector('.modalGuardTitle')?.textContent || body.querySelector('h2')?.textContent || '').replace(/\s+/g, ' ').trim();
}
function bodyText() {
  return ($('#modalBody')?.textContent || '').replace(/\s+/g, ' ').trim();
}
function syncKnownStates() {
  const modal = $('#modal');
  if (!modal || modal.style.display === 'none') return;
  const title = titleText();
  const text = bodyText();

  const isQuestMain = title === '📜 퀘스트' || (title.includes('퀘스트') && text.includes('목표 / 업적') && text.includes('메인 퀘스트'));
  if (isQuestMain) {
    writeState('quest', null);
    return;
  }
  if (title.includes('업적') || title.includes('칭호')) {
    writeState('questChild', 'quest');
    return;
  }
  const isBag = title.includes('배낭') || title.includes('가방') || text.includes('아이템 사용') || text.includes('보유 아이템') || text.includes('장비 보관함');
  if (isBag) {
    writeState('bag', null);
    return;
  }
  const isItemUse = title.includes('아이템') || title.includes('장비') || text.includes('사용 완료') || text.includes('아이템 효과');
  if (isItemUse && !title.includes('설정')) {
    writeState('bagItem', 'bag');
  }
}
function patchBack() {
  const back = $('[data-modal-back]');
  if (!back || back.dataset.engine543Back === 'on') return;
  back.dataset.engine543Back = 'on';
  back.addEventListener('click', (event) => {
    const state = readState();
    if (state?.current === 'quest') {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      closeModal();
      return;
    }
    if (state?.current === 'questChild' || state?.parent === 'quest') {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      openHub('quest');
      return;
    }
    if (state?.current === 'bag') {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      closeModal();
      return;
    }
    if (state?.current === 'bagItem' || state?.parent === 'bag') {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      closeModal();
    }
  }, true);
}
function captureClicks() {
  if (document.documentElement.dataset.engine543Capture === 'on') return;
  document.documentElement.dataset.engine543Capture = 'on';
  document.addEventListener('click', (event) => {
    const hub = event.target.closest?.('#menuHub-quest');
    if (hub) writeState('quest', null);
    const target = event.target.closest?.('[data-target]');
    const id = target?.dataset.target;
    if (id === 'openQuest') writeState('questChild', 'quest');
    if (id === 'openAchievement' || id === 'openBadgeTitle') writeState('questChild', 'quest');
    if (id === 'openBackpack' || id === 'openBag' || id === 'openItems' || id === 'openActiveItems') writeState('bag', null);
    const bagish = event.target.closest?.('[data-item-use],[data-use-item],[data-active-item],.bagItem,.itemUseBtn');
    if (bagish) writeState('bagItem', 'bag');
  }, true);
}
function tick() {
  captureClicks();
  syncKnownStates();
  patchBack();
  setTimeout(tick, 250);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 500));
setTimeout(tick, 1200);
