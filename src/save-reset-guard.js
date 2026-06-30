const RESET_KEYS = [
  'catchabugs.core.v2',
  'catchabugs.quest.v1',
  'catchabugs.achievement.v1',
  'catchabugs.badgeTitle.v1',
  'catchabugs.profile.v1',
  'catchabugs.economy.v1',
  'catchabugs.backpack.v1',
  'catchabugs.activeItems.v1',
  'catchabugs.returnStones.v1',
  'catchabugs.lab.v2',
  'catchabugs.legendary.v2',
  'catchabugs.menuSettings.v2'
];
function $(selector) { return document.querySelector(selector); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1500);
}
function resetAllData() {
  const first = window.confirm('정말 모든 저장 데이터를 초기화할까요? 백업이 없다면 복구할 수 없습니다.');
  if (!first) return;
  const second = window.confirm('마지막 확인입니다. 게임을 처음 상태로 되돌립니다. 진행할까요?');
  if (!second) return;
  RESET_KEYS.forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem('catchabugs.modalNav.v1');
  toast('데이터 초기화 완료. 새로고침합니다.');
  setTimeout(() => location.reload(), 700);
}
function wireReset() {
  const button = $('#resetAllData');
  if (!button || button.dataset.resetWired === 'on') return;
  button.dataset.resetWired = 'on';
  button.onclick = resetAllData;
}
function init() {
  wireReset();
  const body = $('#modalBody');
  if (body && body.dataset.resetObserver !== 'on') {
    body.dataset.resetObserver = 'on';
    new MutationObserver(() => setTimeout(wireReset, 0)).observe(body, { childList: true, subtree: true });
  }
}
window.CATCHABUGS_RESET = { resetAllData };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
setTimeout(init, 900);
