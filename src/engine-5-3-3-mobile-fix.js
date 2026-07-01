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
    if (back.dataset.engine533Back !== 'on') {
      back.dataset.engine533Back = 'on';
      back.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        const body = $('#modalBody');
        const text = body?.textContent || '';
        if (text.includes('탐험기록') || text.includes('도감기록')) { document.getElementById('menuHub-note')?.click(); return; }
        if (text.includes('개발자모드') || text.includes('사운드') || text.includes('게임정보')) { document.getElementById('menuHub-settings')?.click(); return; }
        if (text.includes('퀘스트') || text.includes('업적') || text.includes('칭호')) { document.getElementById('menuHub-quest')?.click(); return; }
        closeModal();
      }, true);
    }
  }
  if (close) {
    close.textContent = '✕ 닫기';
    close.dataset.engine533Label = 'on';
    if (close.dataset.engine533Close !== 'on') {
      close.dataset.engine533Close = 'on';
      close.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        closeModal();
      }, true);
    }
  }
}
function addNpcDevButtons() {
  const body = $('#modalBody');
  if (!body || !body.textContent.includes('개발자모드')) return;
  if ($('#npcDevTools')) return;
  const panel = document.createElement('div');
  panel.id = 'npcDevTools';
  panel.className = 'devPanel';
  panel.innerHTML = `<h3>NPC 테스트</h3><div class="devActions"><button id="devSpawnNpc">근처 NPC 생성</button><button id="devSpawnHiddenNpc">근처 미확인 신호 생성</button><button id="devSpawnMerchant">상인 생성</button><button id="devSpawnCollector">수집가 생성</button></div>`;
  const sheet = body.querySelector('.menuHubSheet') || body.firstElementChild || body;
  sheet.appendChild(panel);
  $('#devSpawnNpc')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnVisible?.(); toast('근처 NPC 생성'); });
  $('#devSpawnHiddenNpc')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnHidden?.(); toast('근처 미확인 신호 생성'); });
  $('#devSpawnMerchant')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnMerchant?.(); toast('떠돌이 상인 생성'); });
  $('#devSpawnCollector')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnCollector?.(); toast('표본 수집가 생성'); });
}
function tick() {
  throttleNpcRaf();
  ensureMobileStyle();
  forceDebugOff();
  const compass = $('#compassPanel');
  if (compass) compass.style.setProperty('display', 'none', 'important');
  normalizeModalNav();
  addNpcDevButtons();
  setTimeout(tick, 300);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 400));
setTimeout(tick, 1000);
