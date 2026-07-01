function $(selector) { return document.querySelector(selector); }

function injectStableStyle() {
  if ($('#engine540StableStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine540StableStyle';
  style.textContent = `
    /* Engine 5.4.0: 단일 안정화 레이어. 직접 클릭을 대신 실행하지 않고, 좌표/레이어만 정리한다. */
    #map,.map,#regionLayer,.regionObj,.player,#game:before,#game:after{pointer-events:none!important}
    #bugs{position:absolute!important;inset:0!important;z-index:30!important;pointer-events:none!important}
    .bug{position:absolute!important;z-index:31!important;pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;box-sizing:border-box!important}
    .bug .sp,.bug .lab,.bug img{pointer-events:none!important}
    #npcLayer{z-index:32!important;pointer-events:none!important}
    .fieldNpc{z-index:33!important;pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important}
    .fieldNpc .npcIcon,.fieldNpc .npcLabel{pointer-events:none!important}
    #radar{z-index:70!important;pointer-events:auto!important;right:10px!important;top:76px!important}
    #radarScreen{pointer-events:none!important}
    #radarCompassToggle{pointer-events:auto!important;touch-action:manipulation!important;z-index:72!important}
    #compassPanel{display:none!important;pointer-events:none!important}
    #radarFallbackCompass{right:10px!important;top:auto!important;bottom:92px!important;z-index:74!important;max-width:42vw!important}
    .hud{z-index:60!important;pointer-events:none!important}
    .hud button,.profileHud{pointer-events:auto!important;touch-action:manipulation!important}
    .bottom{z-index:90!important;pointer-events:auto!important;transform:none!important;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))!important}
    .bottom button,.menuHubBtn,.mini{pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;transform:none!important;box-sizing:border-box!important}
    #modal{z-index:120!important;pointer-events:auto!important}
    #modal .box{position:relative!important;z-index:121!important;pointer-events:auto!important;transform:none!important}
    #modalNavGuardBar{z-index:140!important;pointer-events:auto!important;transform:none!important}
    #modalNavGuardBar button,#modal button,.menuHubItem{pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;box-sizing:border-box!important}
    #modalNavGuardBar [data-modal-back]{background:#00000012!important;color:#07111e!important}
    #modalNavGuardBar [data-modal-close]{background:#07111e!important;color:white!important}
    @media(max-width:640px){
      #radar{top:72px!important;transform:scale(.92);transform-origin:top right!important}
      #radarFallbackCompass{bottom:90px!important;width:148px!important}
      .hud{top:8px!important;right:146px!important}
      .profileHud{max-width:142px!important}
      .bottom{gap:6px!important}
      .menuHubBtn{max-width:82px!important}
      .menuHubBtn span{font-size:10px!important}
      .bug .sp{width:64px!important;height:64px!important}
      .fieldNpc .npcIcon{width:38px!important;height:38px!important;font-size:24px!important}
      .fieldNpc .npcLabel{font-size:9px!important;padding:3px 6px!important}
    }
  `;
  document.head.appendChild(style);
}
function normalizeInteractiveNodes() {
  document.querySelectorAll('.bug').forEach((bug) => {
    bug.style.pointerEvents = 'auto';
    bug.style.zIndex = '31';
    bug.setAttribute('role', 'button');
    bug.setAttribute('tabindex', '0');
    if (bug.dataset.engine540Key !== 'on') {
      bug.dataset.engine540Key = 'on';
      bug.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          bug.click();
        }
      });
    }
  });
  document.querySelectorAll('.fieldNpc').forEach((npc) => {
    npc.style.pointerEvents = 'auto';
    npc.style.zIndex = '33';
    npc.setAttribute('role', 'button');
    npc.setAttribute('tabindex', '0');
  });
}
function normalizeModalLabels() {
  const back = $('[data-modal-back]');
  const close = $('[data-modal-close]');
  if (back) back.textContent = '← 뒤로';
  if (close) close.textContent = '✕ 닫기';
}
function tick() {
  injectStableStyle();
  normalizeInteractiveNodes();
  normalizeModalLabels();
  setTimeout(tick, 400);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 300));
setTimeout(tick, 900);
