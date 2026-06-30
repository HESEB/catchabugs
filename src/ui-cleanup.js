function $(selector) { return document.querySelector(selector); }
function injectStyle() {
  if ($('#uiCleanupStyle')) return;
  const style = document.createElement('style');
  style.id = 'uiCleanupStyle';
  style.textContent = `
    #badgeTitleHud,#titleBadgeHud,#titleHud,.titleBadge,.badgeTitleFloating,[data-title-floating]{display:none!important}
    #compassPanel{transform:scale(.78);transform-origin:top left;opacity:.86}
    #compassPanel div:last-child{display:none!important}
    #compassPanel input{height:18px!important;margin:5px 0!important}
    #compassPanel button{font-size:0!important;height:30px!important;padding:0!important}
    #compassPanel button::after{content:'🧭 ON/OFF';font-size:13px;font-weight:1000}
  `;
  document.head.appendChild(style);
}
function removeFloatingTitles() {
  const profileTitle = $('#profileHud small')?.textContent || '';
  document.querySelectorAll('body *').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.closest('#profileHud') || node.closest('#modal') || node.closest('#radar') || node.closest('.bottom')) return;
    const text = (node.textContent || '').trim();
    if (!text) return;
    if ((text.includes('추적자') || text.includes('채집가') || text.includes('연구원')) && !profileTitle.includes(text)) {
      if (node.children.length <= 2 && node.offsetWidth < 260 && node.offsetHeight < 90) node.style.display = 'none';
    }
  });
}
function init() { injectStyle(); setInterval(removeFloatingTitles, 1200); }
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
setTimeout(init, 1200);
