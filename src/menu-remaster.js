const MENU_GROUPS = Object.freeze([
  { id: 'research', icon: '📖', label: '연구', desc: '도감, 보상, 연구소, 상점, 장비를 한 곳에서 관리합니다.', items: [
    { icon: '📘', label: '곤충도감', target: 'openDex', desc: '발견한 곤충과 도감 진행률을 확인합니다.' },
    { icon: '🎁', label: '도감보상', target: 'openDexReward', desc: '도감 완성도 보상을 수령합니다.' },
    { icon: '🧪', label: '연구소', target: 'openLab', desc: 'NPC 대화와 연구 업그레이드를 진행합니다.' },
    { icon: '🛒', label: '상점', desc: '미끼와 장비 구매 공간입니다. 다음 업데이트에서 연결됩니다.' },
    { icon: '🎒', label: '장비', desc: '채집망, 레이더, 필드 장비 관리 공간입니다. 다음 업데이트에서 연결됩니다.' },
  ] },
  { id: 'mission', icon: '🎯', label: '임무', desc: '퀘스트, 일일미션, 업적, 배지/칭호를 확인합니다.', items: [
    { icon: '📜', label: '퀘스트 / 일일미션', target: 'openQuest', desc: '메인 퀘스트와 일일미션 진행도를 확인합니다.' },
    { icon: '🏆', label: '업적', target: 'openAchievement', desc: '누적 플레이 업적과 보상을 확인합니다.' },
    { icon: '🎖️', label: '배지 / 칭호', target: 'openBadgeTitle', desc: '해금한 칭호를 장착합니다.' },
  ] },
  { id: 'record', icon: '💾', label: '기록', desc: '탐험일지, 저장, 백업, 귀환 기능을 모았습니다.', items: [
    { icon: '📒', label: '탐험일지', target: 'diary', desc: '최근 탐험 기록을 확인합니다.' },
    { icon: '💾', label: '저장 / 백업', target: 'openSave', desc: '수동 저장, 백업 코드 복사, 복원을 진행합니다.' },
    { icon: '🏠', label: '귀환', target: 'home', desc: '저장 후 시작 화면으로 돌아갑니다.' },
  ] },
  { id: 'settings', icon: '⚙️', label: '설정', desc: '게임 설정과 개발자 모드를 관리합니다.', items: [] },
]);

const OLD_BUTTON_IDS = ['openDex', 'openDexTitle', 'openDexReward', 'openQuest', 'openAchievement', 'openBadgeTitle', 'openSave', 'openWeather', 'openLab', 'openLegendary', 'diary', 'home'];
const WEATHER_OPTIONS = [
  { id: 'clear', icon: '☀️', label: '맑음' },
  { id: 'cloudy', icon: '☁️', label: '흐림' },
  { id: 'rain', icon: '🌧️', label: '비' },
  { id: 'wind', icon: '🍃', label: '바람' },
  { id: 'night-glow', icon: '🌙', label: '밤빛' },
];
const PHASE_OPTIONS = ['아침', '낮', '저녁', '밤'];

const nav = { stack: [], returnGroup: null, compassOff: false, compassFixedHeading: 0 };

function $(selector) { return document.querySelector(selector); }

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
}

function baseClose() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  nav.stack = [];
  nav.returnGroup = null;
}

function openModal(html, options = {}) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  if (options.reset) nav.stack = [];
  if (options.push) nav.stack.push(options.push);
  body.innerHTML = html;
  modal.style.display = 'block';
  wireNavButtons();
}

function goBack() {
  if (nav.returnGroup) {
    const groupId = nav.returnGroup;
    nav.returnGroup = null;
    openGroup(groupId, { reset: true });
    return;
  }
  if (nav.stack.length > 1) {
    nav.stack.pop();
    const previous = nav.stack.pop();
    routePanel(previous, { fromBack: true });
    return;
  }
  baseClose();
}

function wireNavButtons() {
  const back = $('[data-menu-back]');
  const close = $('#closeModal');
  if (back) back.onclick = goBack;
  if (close) close.onclick = goBack;
}

function headerHTML(title, meta = '', intro = '') {
  const backVisible = nav.stack.length > 1 || !!nav.returnGroup;
  return `<div class="menuHubSheet"><div class="menuNavRow">${backVisible ? '<button data-menu-back type="button">← 뒤로</button>' : '<span></span>'}<button data-menu-close type="button" onclick="document.getElementById('modal').style.display='none'">게임으로</button></div><div class="menuHubHeader"><h2>${title}</h2><small>${meta}</small></div>${intro ? `<div class="menuHubIntro">${intro}</div>` : ''}`;
}

function closeHTML() { return '</div>'; }

function triggerTarget(id) {
  const target = document.getElementById(id);
  if (!target) { toast('아직 준비 중인 메뉴입니다.'); return; }
  const current = nav.stack[nav.stack.length - 1];
  nav.returnGroup = current?.type === 'group' ? current.id : null;
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  setTimeout(() => {
    target.click();
    wireNavButtons();
  }, 20);
}

function injectStyle() {
  if ($('#menuRemasterStyle')) return;
  const style = document.createElement('style');
  style.id = 'menuRemasterStyle';
  style.textContent = `
    .bottom.menuHub{justify-content:space-around;gap:6px;padding:8px 8px 10px;background:linear-gradient(0deg,#07111ee8,#07111e99 78%,transparent);backdrop-filter:blur(10px)}
    .menuHubBtn{flex:1;max-width:92px;border:0;border-radius:18px;padding:9px 6px;background:#ffffff24;border:1px solid #ffffff35;color:white;font-weight:1000;box-shadow:0 8px 20px #0005;display:flex;flex-direction:column;align-items:center;gap:2px}.menuHubBtn b{font-size:20px;line-height:1}.menuHubBtn span{font-size:11px;line-height:1.15}
    .menuNavRow{display:flex;justify-content:space-between;align-items:center;margin:0 0 8px}.menuNavRow button{border:0;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:1000;background:#07111e;color:white}.menuNavRow button:last-child{background:#00000012;color:#07111e}
    .menuHubSheet h2{margin:0;font-size:22px}.menuHubHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:6px 2px 12px}.menuHubHeader small{font-weight:1000;color:#0f6f56;text-align:right}.menuHubIntro{padding:12px;margin:8px 0 12px;border-radius:18px;background:#0000000a;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.menuHubGrid{display:grid;grid-template-columns:1fr;gap:9px}.menuHubItem{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:20px;padding:12px;background:linear-gradient(135deg,#fff,#f6fbff);box-shadow:0 8px 18px #0001;border:1px solid #0000000d}.menuHubItem .ico{width:52px;height:52px;flex:0 0 52px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.menuHubItem b{display:block;font-size:15px}.menuHubItem span{display:block;margin-top:4px;color:#0008;font-size:12px;font-weight:800;line-height:1.35}.menuHubItem.placeholder{opacity:.58;filter:grayscale(.35)}
    .devPanel{margin-top:12px;padding:12px;border-radius:20px;background:#07111e;color:white}.devPanel h3{margin:0 0 8px}.devActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.devActions button{border:0;border-radius:13px;padding:10px;font-weight:1000;background:#ffffff22;color:white;border:1px solid #ffffff33}.devNote{margin-top:9px;font-size:11px;color:#ffffffb8;font-weight:800;line-height:1.45}.toggleOn{outline:2px solid #82f7c1;background:#82f7c133!important}.toggleOff{outline:2px solid #ff9d9d;background:#ff9d9d33!important}
  `;
  document.head.appendChild(style);
}

function hideLegacyButtons() {
  const bottom = $('.bottom');
  if (!bottom) return;
  OLD_BUTTON_IDS.forEach((id) => { const button = document.getElementById(id); if (button) { button.dataset.menuLegacy = 'true'; button.style.display = 'none'; } });
  Array.from(bottom.querySelectorAll('.mini')).forEach((button) => { if (!button.classList.contains('menuHubBtn')) button.style.display = 'none'; });
}

function routePanel(panel, options = {}) {
  if (!panel) return;
  if (panel.type === 'group') openGroup(panel.id, options.fromBack ? {} : { push: panel });
  if (panel.type === 'settings') openSettingsPanel(options.fromBack ? {} : { push: panel });
  if (panel.type === 'developer') openDeveloperPanel(options.fromBack ? {} : { push: panel });
}

function openGroup(groupId, options = {}) {
  const group = MENU_GROUPS.find((item) => item.id === groupId);
  if (!group) return;
  if (group.id === 'settings') { openSettingsPanel({ reset: options.reset, push: { type: 'settings' } }); return; }
  const items = group.items.map((item) => {
    const attrs = item.target ? `data-target="${item.target}"` : `data-placeholder="${item.label}"`;
    const cls = item.target ? 'menuHubItem' : 'menuHubItem placeholder';
    return `<button class="${cls}" ${attrs}><div class="ico">${item.icon}</div><div><b>${item.label}</b><span>${item.desc}</span></div></button>`;
  }).join('');
  openModal(`${headerHTML(`${group.icon} ${group.label}`, `${group.items.length}개 메뉴`, group.desc)}<div class="menuHubGrid">${items}</div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'group', id: group.id } });
  document.querySelectorAll('[data-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.target); });
  document.querySelectorAll('[data-placeholder]').forEach((button) => { button.onclick = () => toast(`${button.dataset.placeholder}은 다음 업데이트에서 연결됩니다.`); });
}

function openSettingsPanel(options = {}) {
  openModal(`${headerHTML('⚙️ 설정', '게임 / 개발', '화면 표시, 테스트 기능, 개발자 도구를 이곳으로 모았습니다.')}<div class="menuHubGrid">
    <button class="menuHubItem placeholder" data-placeholder="게임 설정"><div class="ico">🎮</div><div><b>게임 설정</b><span>진동, 사운드, 그래픽 옵션은 다음 업데이트에서 연결됩니다.</span></div></button>
    <button class="menuHubItem" id="openDeveloperPanel"><div class="ico">🧪</div><div><b>개발자 모드</b><span>날씨 변경, 시간 변경, 전설 테스트, 나침반 ON/OFF를 확인합니다.</span></div></button>
  </div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'settings' } });
  const dev = $('#openDeveloperPanel');
  if (dev) dev.onclick = () => openDeveloperPanel({ push: { type: 'developer' } });
  document.querySelectorAll('[data-placeholder]').forEach((button) => { button.onclick = () => toast(`${button.dataset.placeholder}은 다음 업데이트에서 연결됩니다.`); });
}

function changeWeather(id) {
  const api = window.CATCHABUGS_TIME_WEATHER;
  if (!api?.setWeather) { toast('날씨 시스템 준비 중'); return; }
  api.setWeather(id);
  openDeveloperPanel({ replace: true });
}

function changePhase(phase) {
  const api = window.CATCHABUGS_TIME_WEATHER;
  if (!api?.setPhase) { toast('시간 시스템 준비 중'); return; }
  api.setPhase(phase);
  openDeveloperPanel({ replace: true });
}

function applyCompassDevMode(off) {
  nav.compassOff = off;
  const slider = $('#headingSlider');
  if (slider) {
    nav.compassFixedHeading = Number(slider.value || 0);
    slider.value = String(nav.compassFixedHeading);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const btn = $('#compassBtn');
  if (btn) btn.textContent = off ? '모바일 나침반 켜기' : '모바일 나침반 사용 중';
  toast(off ? '나침반 OFF: DEV 방향 고정' : '나침반 ON: 모바일 센서 사용');
}

function enableCompass() {
  nav.compassOff = false;
  const btn = $('#compassBtn');
  if (btn) btn.click();
  else toast('나침반 패널이 아직 열리지 않았습니다.');
}

function disableCompass() { applyCompassDevMode(true); }

function openDeveloperPanel(options = {}) {
  const current = window.CATCHABUGS_TIME_WEATHER?.getState?.();
  const weather = current?.weather?.id || 'clear';
  const phase = current?.time?.phase || '낮';
  const weatherButtons = WEATHER_OPTIONS.map((item) => `<button class="${weather === item.id ? 'toggleOn' : ''}" data-weather="${item.id}">${item.icon} ${item.label}</button>`).join('');
  const phaseButtons = PHASE_OPTIONS.map((item) => `<button class="${phase === item ? 'toggleOn' : ''}" data-phase="${item}">${item}</button>`).join('');
  openModal(`${headerHTML('🧪 개발자 모드', '테스트 도구', '테스트용 기능을 한 곳에 모았습니다. 실제 플레이 메뉴에서는 숨겨두는 항목입니다.')}
    <div class="devPanel"><h3>날씨 변경</h3><div class="devActions">${weatherButtons}</div></div>
    <div class="devPanel"><h3>시간 변경</h3><div class="devActions">${phaseButtons}</div></div>
    <div class="devPanel"><h3>나침반</h3><div class="devActions"><button data-compass="on" class="${!nav.compassOff ? 'toggleOn' : ''}">🧭 ON</button><button data-compass="off" class="${nav.compassOff ? 'toggleOff' : ''}">🧭 OFF</button></div><div class="devNote">OFF 상태에서는 모바일 센서 대신 DEV 슬라이더 방향으로 고정합니다.</div></div>
    <div class="devPanel"><h3>전설 / HUD</h3><div class="devActions"><button data-dev-target="openLegendary">전설 테스트</button><button data-dev-action="hud">HUD 새로고침</button></div><div class="devNote">전설 발생 빈도, 캐릭터 설정, 좌표/스폰 디버그는 다음 개발자 모드에서 확장됩니다.</div></div>${closeHTML()}`, { push: options.push || { type: 'developer' } });
  document.querySelectorAll('[data-weather]').forEach((button) => { button.onclick = () => changeWeather(button.dataset.weather); });
  document.querySelectorAll('[data-phase]').forEach((button) => { button.onclick = () => changePhase(button.dataset.phase); });
  document.querySelectorAll('[data-compass]').forEach((button) => { button.onclick = () => button.dataset.compass === 'on' ? enableCompass() : disableCompass(); });
  document.querySelectorAll('[data-dev-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.devTarget); });
  document.querySelectorAll('[data-dev-action]').forEach((button) => { button.onclick = () => toast('HUD 상태를 다시 확인했습니다.'); });
}

function buildHub() {
  const bottom = $('.bottom');
  if (!bottom) return;
  injectStyle();
  bottom.classList.add('menuHub');
  hideLegacyButtons();
  MENU_GROUPS.forEach((group) => {
    let button = document.getElementById(`menuHub-${group.id}`);
    if (!button) {
      button = document.createElement('button');
      button.id = `menuHub-${group.id}`;
      button.className = 'mini menuHubBtn';
      button.innerHTML = `<b>${group.icon}</b><span>${group.label}</span>`;
      bottom.appendChild(button);
    }
    button.style.display = '';
    button.onclick = () => openGroup(group.id, { reset: true });
  });
  wireNavButtons();
}

function bindCompassOffGuard() {
  if (window.__catchabugsCompassGuard) return;
  window.__catchabugsCompassGuard = true;
  window.addEventListener('deviceorientation', () => {
    if (!nav.compassOff) return;
    const slider = $('#headingSlider');
    if (!slider) return;
    slider.value = String(nav.compassFixedHeading || 0);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);
}

function initMenuRemaster() {
  buildHub();
  bindCompassOffGuard();
  const bottom = $('.bottom');
  if (!bottom || bottom.dataset.menuObserver === 'on') return;
  bottom.dataset.menuObserver = 'on';
  const observer = new MutationObserver(() => buildHub());
  observer.observe(bottom, { childList: true, subtree: false });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(initMenuRemaster, 80));
setTimeout(initMenuRemaster, 300);
setTimeout(initMenuRemaster, 900);
