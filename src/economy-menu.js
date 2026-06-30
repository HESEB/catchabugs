function $(selector) { return document.querySelector(selector); }
function economy() { return window.CATCHABUGS_ECONOMY || null; }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}
function isDeveloperMenu() {
  const body = $('#modalBody');
  return !!body && body.textContent.includes('개발자모드');
}
function economySummaryHTML() {
  const eco = economy();
  const wormChip = eco?.getStars?.() ?? window.CATCHABUGS_GAME?.getPoints?.() ?? 0;
  const core = eco?.getExplorerCore?.() ?? 0;
  const install = eco?.getBugHoleInstallCost?.() ?? 100;
  const dismantle = eco?.getBugHoleDismantleCost?.() ?? 100;
  return `<div id="economyDevPanel" class="devPanel">
    <h3>경제 / 탐사코어</h3>
    <div style="font-size:12px;font-weight:900;margin:0 0 8px;color:#ffffffcc">🪱 웜칩 ${wormChip} · 🔷 탐사코어 ${core}<br>BUG HOLE 설치비 ${install} · 해체비 ${dismantle}</div>
    <div class="devActions">
      <button data-core-add="100">탐사코어 +100</button>
      <button data-core-max="true">탐사코어 MAX</button>
      <button data-equipment-grant="bug-lure">벌레 유인기 +1</button>
      <button data-equipment-grant="rare-alarm">희귀 알람기 +1</button>
      <button data-bughole-open="true">BUG HOLE 열기</button>
      <button data-bughole-all="true">BUG HOLE 전체설치</button>
    </div>
  </div>`;
}
function wirePanel() {
  const panel = $('#economyDevPanel');
  if (!panel) return;
  panel.querySelectorAll('[data-core-add]').forEach((button) => {
    button.onclick = () => {
      const amount = Number(button.dataset.coreAdd || 0);
      const result = economy()?.addExplorerCore?.(amount, '개발자모드 탐사코어');
      toast(`탐사코어 +${amount} → ${result}`);
      panel.outerHTML = economySummaryHTML();
      wirePanel();
    };
  });
  panel.querySelectorAll('[data-core-max]').forEach((button) => {
    button.onclick = () => {
      const result = economy()?.setExplorerCore?.(999999, '개발자모드 탐사코어 MAX');
      toast(`탐사코어 MAX → ${result}`);
      panel.outerHTML = economySummaryHTML();
      wirePanel();
    };
  });
  panel.querySelectorAll('[data-equipment-grant]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.equipmentGrant;
      const count = economy()?.grantEquipment?.(id, 1);
      toast(`${button.textContent} 보유 ${count}`);
      window.CATCHABUGS_BACKPACK?.addItem?.(id, 1);
    };
  });
  panel.querySelectorAll('[data-bughole-open]').forEach((button) => {
    button.onclick = () => window.CATCHABUGS_BUG_HOLE?.open?.();
  });
  panel.querySelectorAll('[data-bughole-all]').forEach((button) => {
    button.onclick = () => window.CATCHABUGS_BUG_HOLE?.revealAllInstalled?.();
  });
}
function injectEconomyControls() {
  if (!isDeveloperMenu()) return;
  const sheet = $('#modalBody .menuHubSheet');
  if (!sheet || $('#economyDevPanel')) return;
  sheet.insertAdjacentHTML('beforeend', economySummaryHTML());
  wirePanel();
}
function init() {
  injectEconomyControls();
  const body = $('#modalBody');
  if (!body || body.dataset.economyMenuObserver === 'on') return;
  body.dataset.economyMenuObserver = 'on';
  new MutationObserver(() => setTimeout(injectEconomyControls, 0)).observe(body, { childList: true, subtree: true });
}
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 120));
setTimeout(init, 500);
