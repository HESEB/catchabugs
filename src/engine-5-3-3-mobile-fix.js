function $(selector) { return document.querySelector(selector); }
let npcRafPatched = false;
let lastNpcFrame = 0;
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1300);
}
function closeModal() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
}
function throttleNpcRaf() {
  if (npcRafPatched) return;
  npcRafPatched = true;
  const nativeRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function(callback) {
    const source = String(callback || '');
    const isNpcLoop = source.includes('renderNpcRadar') && source.includes('maybeSpawn');
    if (!isNpcLoop) return nativeRaf(callback);
    return nativeRaf((time) => {
      if (time - lastNpcFrame >= 220) {
        lastNpcFrame = time;
        callback(time);
      } else {
        setTimeout(() => nativeRaf(callback), Math.max(80, 220 - (time - lastNpcFrame)));
      }
    });
  };
}
function ensureMobileStyle() {
  if ($('#engine533MobileStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine533MobileStyle';
  style.textContent = `
    #engine522Debug{display:none!important;pointer-events:none!important}
    #compassPanel{display:none!important;pointer-events:none!important}
    #radarFallbackCompass{max-width:44vw}
    @media (max-width: 640px){
      .fieldNpc .npcIcon{width:38px!important;height:38px!important;font-size:24px!important}.fieldNpc .npcLabel{font-size:9px!important;padding:3px 6px!important}
      .npcRadarBlip{width:8px!important;height:8px!important}.bug{will-change:transform}.fieldNpc{will-change:transform}
    }
  `;
  document.head.appendChild(style);
}
function forceDebugOff() {
  try { localStorage.setItem('catchabugs.debug522.enabled', 'off'); } catch {}
  const panel = $('#engine522Debug');
  if (panel) panel.remove();
}
function normalizeModalNav() {
  const bar = $('#modalNavGuardBar');
  if (!bar) return;
  const back = bar.querySelector('[data-modal-back]');
  const close = bar.querySelector('[data-modal-close]');
  if (back) {
    back.textContent = '← 뒤로';
    back.dataset.engine533Label = 'on';
  }
  if (close) {
    close.textContent = '✕ 닫기';
    close.dataset.engine533Label = 'on';
  }
}
function removeFloatingNpcDevTools() {
  const body = $('#modalBody');
  const tools = $('#npcDevTools');
  if (!body || !tools) return;
  const title = body.querySelector('.menuHubHeader h2')?.textContent || body.querySelector('.modalGuardTitle')?.textContent || '';
  if (!title.includes('개발자모드')) tools.remove();
}
function tick() {
  throttleNpcRaf();
  ensureMobileStyle();
  forceDebugOff();
  const compass = $('#compassPanel');
  if (compass) compass.style.setProperty('display', 'none', 'important');
  normalizeModalNav();
  removeFloatingNpcDevTools();
  setTimeout(tick, 300);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 400));
setTimeout(tick, 1000);
