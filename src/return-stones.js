function economy() { return window.CATCHABUGS_ECONOMY || null; }
function toast(message) {
  const node = document.querySelector('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}
function getCore() { return economy()?.getExplorerCore?.() || 0; }
function addCore(amount, reason = 'BUG HOLE') { return economy()?.addExplorerCore?.(amount, reason) || 0; }
function spendCore(amount, reason = 'BUG HOLE') { return economy()?.spendExplorerCore?.(amount, reason) || false; }

window.CATCHABUGS_RETURN_STONES = {
  deprecated: true,
  name: '탐사코어',
  get: getCore,
  add: addCore,
  spend: spendCore,
  cost: 0,
  reward: 0,
  notice() { toast('귀환석은 탐사코어 기반 BUG HOLE로 변경되었습니다.'); },
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const body = document.querySelector('#modalBody');
    if (body && body.textContent.includes('귀환석')) toast('귀환석은 탐사코어 기반 BUG HOLE로 변경되었습니다.');
  }, 500);
});
