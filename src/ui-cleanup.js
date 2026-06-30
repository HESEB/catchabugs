function $(selector) { return document.querySelector(selector); }
function injectStyle() {
  if ($('#uiCleanupStyle')) return;
  const style = document.createElement('style');
  style.id = 'uiCleanupStyle';
  style.textContent = `
    #badgeTitleHud,#titleBadgeHud,#titleHud,.titleBadge,.badgeTitleFloating,[data-title-floating]{display:none!important}
    .hud,#profileHud{display:flex!important;visibility:visible!important;opacity:1!important}
    #profileHud{pointer-events:auto!important}
    #compassPanel{transform:scale(.72);transform-origin:top left;opacity:.78;max-width:148px!important}
    #compassPanel div:last-child{display:none!important}
    #compassPanel input{height:16px!important;margin:4px 0!important}
    #compassPanel button{font-size:0!important;height:28px!important;padding:0!important}
    #compassPanel button::after{content:'🧭 ON/OFF';font-size:12px;font-weight:1000}
  `;
  document.head.appendChild(style);
}
function restoreProfileHud() {
  const hud = $('.hud');
  const profile = $('#profileHud');
  if (hud) {
    hud.style.display = 'flex';
    hud.style.visibility = 'visible';
    hud.style.opacity = '1';
  }
  if (profile) {
    profile.style.display = 'flex';
    profile.style.visibility = 'visible';
    profile.style.opacity = '1';
  }
  window.CATCHABUGS_PROFILE?.updateHud?.();
}
function removeFloatingTitles() {
  // 칭호는 프로필 HUD 안에서만 표시한다. 기존 칭호 전용 노드만 숨기고 일반 부모 요소는 건드리지 않는다.
  document.querySelectorAll('#badgeTitleHud,#titleBadgeHud,#titleHud,.titleBadge,.badgeTitleFloating,[data-title-floating]').forEach((node) => {
    if (node instanceof HTMLElement) node.style.display = 'none';
  });
}
function init() {
  injectStyle();
  setInterval(() => { removeFloatingTitles(); restoreProfileHud(); }, 1200);
}
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
setTimeout(init, 1200);
