const RETURN_KEY = 'catchabugs.returnStones.v1';
const DEFAULT_DISCOVERY_REWARD = 100;
const TRAVEL_COST = 1;

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadState() {
  const state = safeParse(localStorage.getItem(RETURN_KEY)) || { discovered: {}, stones: 0 };
  if (!Number.isFinite(Number(state.stones))) state.stones = 0;
  return state;
}
function saveState(state) { localStorage.setItem(RETURN_KEY, JSON.stringify(state)); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
}
function addStones(amount, reason = '획득') {
  const state = loadState();
  state.stones = Math.max(0, Number(state.stones || 0) + Number(amount || 0));
  saveState(state);
  window.CATCHABUGS_GAME?.addLog?.(`귀환석 ${amount > 0 ? '+' : ''}${amount} · ${reason}`, '💎');
  updateReturnStoneBadge();
  return state.stones;
}
function spendStones(amount, reason = '귀환') {
  const state = loadState();
  if (Number(state.stones || 0) < amount) return false;
  state.stones = Math.max(0, Number(state.stones || 0) - amount);
  saveState(state);
  window.CATCHABUGS_GAME?.addLog?.(`귀환석 -${amount} · ${reason}`, '💎');
  updateReturnStoneBadge();
  return true;
}
function getStones() { return Number(loadState().stones || 0); }
function updateReturnStoneBadge() {
  const body = $('#modalBody');
  if (!body || !body.textContent.includes('귀환')) return;
  const sheet = body.querySelector('.menuHubSheet');
  if (!sheet) return;
  let badge = body.querySelector('#returnStoneBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'returnStoneBadge';
    badge.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border-radius:18px;background:linear-gradient(135deg,#07111e,#263b58);color:white;font-weight:1000;display:flex;justify-content:space-between;align-items:center;box-shadow:0 8px 18px #0002';
    const intro = sheet.querySelector('.menuHubIntro');
    if (intro) intro.insertAdjacentElement('afterend', badge);
    else sheet.insertBefore(badge, sheet.children[1] || null);
  }
  badge.innerHTML = `<span>💎 귀환석</span><b>${getStones()}개</b><small style="opacity:.75">이동 시 ${TRAVEL_COST}개 소모</small>`;
}
function patchReturnButtons() {
  const body = $('#modalBody');
  if (!body || !body.textContent.includes('귀환석')) return;
  updateReturnStoneBadge();
  body.querySelectorAll('[data-return-id]').forEach((button) => {
    if (button.dataset.returnStonePatched === 'on') return;
    const id = button.dataset.returnId;
    const title = button.querySelector('b')?.textContent || '거점';
    const original = button.onclick;
    button.dataset.returnStonePatched = 'on';
    const desc = button.querySelector('span');
    if (desc && !desc.textContent.includes('귀환석')) desc.textContent = `${desc.textContent} · 이동 시 귀환석 ${TRAVEL_COST}개 소모`;
    button.addEventListener('click', (event) => {
      if (id === 'lab') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!spendStones(TRAVEL_COST, `${title} 이동`)) {
        toast('귀환석이 부족합니다. 거점을 발견하거나 개발자모드에서 지급하세요.');
        return;
      }
      if (typeof original === 'function') original.call(button, event);
      else toast(`${title}으로 귀환`);
    }, true);
  });
}
function initObserver() {
  const body = $('#modalBody');
  if (!body || body.dataset.returnStoneObserver === 'on') return;
  body.dataset.returnStoneObserver = 'on';
  new MutationObserver(() => setTimeout(patchReturnButtons, 0)).observe(body, { childList: true, subtree: true });
}
window.addEventListener('catchabugs:return-discovered', (event) => {
  const point = event.detail?.point;
  addStones(DEFAULT_DISCOVERY_REWARD, `${point?.name || '거점'} 등록 보상`);
  toast(`${point?.icon || '🏕️'} ${point?.name || '거점'} 등록! 귀환석 +${DEFAULT_DISCOVERY_REWARD}`);
});
window.CATCHABUGS_RETURN_STONES = { get: getStones, add: addStones, spend: spendStones, cost: TRAVEL_COST, reward: DEFAULT_DISCOVERY_REWARD };
document.addEventListener('DOMContentLoaded', () => { initObserver(); setTimeout(patchReturnButtons, 200); });
setTimeout(() => { initObserver(); patchReturnButtons(); }, 600);
