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
  'catchabugs.menuSettings.v2',
  'catchabugs.randomNpc.v1',
  'catchabugs.debug.panel.v539',
  'catchabugs.debug.panel.v560',
  'catchabugs.modalNav.v1',
  'catchabugs.menuNav.v550',
  'catchabugs.menuNav.v560',
  'catchabugs.menuState.v541',
  'catchabugs.dex.v1',
  'catchabugs.dex.v2',
  'catchabugs.diary.v1',
  'catchabugs.album.v1',
  'catchabugs.exploreLog.v1',
  'catchabugs.researchNote.v1'
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
function clearPrefixedStorage(storage) {
  try {
    Object.keys(storage).forEach((key) => {
      if (key.startsWith('catchabugs.')) storage.removeItem(key);
    });
  } catch {}
}
function hardClearStorage() {
  RESET_KEYS.forEach((key) => localStorage.removeItem(key));
  RESET_KEYS.forEach((key) => sessionStorage.removeItem(key));
  clearPrefixedStorage(localStorage);
  clearPrefixedStorage(sessionStorage);
}
function cleanupRuntimeUi() {
  try { window.CATCHABUGS_RANDOM_NPC?.clear?.(); } catch {}
  try { window.CATCHABUGS_RADAR_COMPASS?.off?.(); } catch {}
  document.querySelectorAll('.fieldNpc,.npcRadarBlip,#npcLayer,#radarFallbackCompass,#devSystemDebugPanel,#engine539DebugPanel,#modalNavGuardBar,#questLocalBackBar').forEach((node) => node.remove());
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  const body = $('#modalBody');
  if (body) body.innerHTML = '';
}
function resetAllData() {
  const first = window.confirm('정말 모든 저장 데이터를 초기화할까요? 백업이 없다면 복구할 수 없습니다.');
  if (!first) return;
  const second = window.confirm('마지막 확인입니다. 게임을 처음 상태로 되돌립니다. 진행할까요?');
  if (!second) return;
  sessionStorage.setItem('catchabugs.reset.pending', '1');
  hardClearStorage();
  sessionStorage.setItem('catchabugs.reset.pending', '1');
  cleanupRuntimeUi();
  toast('데이터 초기화 완료. 새로고침합니다.');
  setTimeout(() => location.replace(location.pathname + '?reset=' + Date.now()), 800);
}
function clearOnResetBoot() {
  const queryReset = location.search.includes('reset=');
  const pending = sessionStorage.getItem('catchabugs.reset.pending') === '1';
  if (!queryReset && !pending) return;
  hardClearStorage();
  sessionStorage.removeItem('catchabugs.reset.pending');
  cleanupRuntimeUi();
}
function wireReset() {
  const button = $('#resetAllData');
  if (!button || button.dataset.resetWired === 'on') return;
  button.dataset.resetWired = 'on';
  button.onclick = resetAllData;
}
function init() {
  clearOnResetBoot();
  wireReset();
  const body = $('#modalBody');
  if (body && body.dataset.resetObserver !== 'on') {
    body.dataset.resetObserver = 'on';
    new MutationObserver(() => setTimeout(wireReset, 0)).observe(body, { childList: true, subtree: true });
  }
}
window.CATCHABUGS_RESET = { resetAllData, hardClearStorage };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
setTimeout(init, 500);
