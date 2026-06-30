const CORE_SAVE_KEY = 'catchabugs.core.v2';
const MENU_SETTINGS_KEY = 'catchabugs.menuSettings.v2';
const RETURN_KEY = 'catchabugs.returnStones.v1';

const OLD_BUTTON_IDS = [
  'openDex', 'openDexTitle', 'openDexReward', 'openQuest', 'openAchievement', 'openBadgeTitle',
  'openSave', 'openWeather', 'openLab', 'openLegendary', 'diary', 'home'
];

const HUB_MENUS = Object.freeze([
  { id: 'note', icon: '📖', label: '연구노트' },
  { id: 'quest', icon: '📜', label: '퀘스트' },
  { id: 'return', icon: '🏕', label: '귀환' },
  { id: 'settings', icon: '⚙️', label: '설정' },
]);

const RETURN_POINTS = Object.freeze([
  { id: 'lab', icon: '🏠', name: '연구소', desc: '연구 업그레이드와 구매를 진행합니다. 실제 이동 지점은 아닙니다.', type: 'lab', defaultOpen: true },
  { id: 'start-village', icon: '🏘️', name: '초기마을', desc: '처음부터 등록된 기본 귀환 지점입니다.', x: 0, y: 0, defaultOpen: true },
  { id: 'forest-camp', icon: '🌲', name: '숲 캠프', desc: '숲 탐험 중 발견하면 등록됩니다.', x: -820, y: 360 },
  { id: 'river-camp', icon: '🌊', name: '강가 캠프', desc: '강가 탐험 중 발견하면 등록됩니다.', x: 760, y: 620 },
  { id: 'field-base', icon: '🌾', name: '초원 기지', desc: '초원 탐험 중 발견하면 등록됩니다.', x: 940, y: -420 },
  { id: 'city-square', icon: '🏙️', name: '도시 광장', desc: '도시 탐험 중 발견하면 등록됩니다.', x: -1040, y: -560 },
]);

const nav = { stack: [], returnGroup: null };

function $(selector) { return document.querySelector(selector); }

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function loadCore() {
  return safeParse(localStorage.getItem(CORE_SAVE_KEY)) || { points: 0, caught: {}, player: { x: 0, y: 0 }, lastEvent: '' };
}

function saveCore(core) {
  core.savedAt = new Date().toISOString();
  localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(core));
  const pt = $('#pt');
  if (pt) pt.textContent = Number(core.points || 0);
}

function loadSettings() {
  return safeParse(localStorage.getItem(MENU_SETTINGS_KEY)) || {
    sound: true,
    vibration: true,
    developerMode: false,
    returnAllOpen: false,
    infiniteMoney: false,
    noteAllOpen: false,
  };
}

function saveSettings(settings) {
  localStorage.setItem(MENU_SETTINGS_KEY, JSON.stringify(settings));
}

function loadReturnState() {
  const saved = safeParse(localStorage.getItem(RETURN_KEY)) || { discovered: {} };
  RETURN_POINTS.forEach((point) => {
    if (point.defaultOpen) saved.discovered[point.id] = true;
  });
  localStorage.setItem(RETURN_KEY, JSON.stringify(saved));
  return saved;
}

function saveReturnState(state) {
  localStorage.setItem(RETURN_KEY, JSON.stringify(state));
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
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

function closeModal() {
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  nav.stack = [];
}

function goBack() {
  if (nav.stack.length > 1) {
    nav.stack.pop();
    const previous = nav.stack.pop();
    route(previous, { fromBack: true });
    return;
  }
  closeModal();
}

function wireNavButtons() {
  const close = $('#closeModal');
  const back = $('[data-menu-back]');
  const exit = $('[data-menu-close]');
  if (close) close.onclick = goBack;
  if (back) back.onclick = goBack;
  if (exit) exit.onclick = closeModal;
}

function headerHTML(title, meta = '', intro = '') {
  const backVisible = nav.stack.length > 1;
  return `<div class="menuHubSheet"><div class="menuNavRow">${backVisible ? '<button data-menu-back type="button">← 뒤로</button>' : '<span></span>'}<button data-menu-close type="button">게임으로</button></div><div class="menuHubHeader"><h2>${title}</h2><small>${meta}</small></div>${intro ? `<div class="menuHubIntro">${intro}</div>` : ''}`;
}

function closeHTML() { return '</div>'; }

function injectStyle() {
  if ($('#menuRemasterStyle')) return;
  const style = document.createElement('style');
  style.id = 'menuRemasterStyle';
  style.textContent = `
    .bottom.menuHub{justify-content:space-around;gap:6px;padding:8px 8px 10px;background:linear-gradient(0deg,#07111ee8,#07111e99 78%,transparent);backdrop-filter:blur(10px)}
    .menuHubBtn{flex:1;max-width:92px;border:0;border-radius:18px;padding:9px 6px;background:#ffffff24;border:1px solid #ffffff35;color:white;font-weight:1000;box-shadow:0 8px 20px #0005;display:flex;flex-direction:column;align-items:center;gap:2px}.menuHubBtn b{font-size:20px;line-height:1}.menuHubBtn span{font-size:11px;line-height:1.15}
    .menuNavRow{display:flex;justify-content:space-between;align-items:center;margin:0 0 8px}.menuNavRow button{border:0;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:1000;background:#07111e;color:white}.menuNavRow button:last-child{background:#00000012;color:#07111e}
    .menuHubSheet h2{margin:0;font-size:22px}.menuHubHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:6px 2px 12px}.menuHubHeader small{font-weight:1000;color:#0f6f56;text-align:right}.menuHubIntro{padding:12px;margin:8px 0 12px;border-radius:18px;background:#0000000a;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.menuHubGrid{display:grid;grid-template-columns:1fr;gap:9px}.menuHubItem{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:20px;padding:12px;background:linear-gradient(135deg,#fff,#f6fbff);box-shadow:0 8px 18px #0001;border:1px solid #0000000d}.menuHubItem .ico{width:52px;height:52px;flex:0 0 52px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.menuHubItem b{display:block;font-size:15px}.menuHubItem span{display:block;margin-top:4px;color:#0008;font-size:12px;font-weight:800;line-height:1.35}.menuHubItem.locked{opacity:.48;filter:grayscale(.55)}
    .menuSectionTitle{margin:14px 2px 8px;font-size:13px;font-weight:1000;color:#17231f}.compactList{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f4fff9);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.compactList b{font-size:15px}.compactList p{margin:7px 0 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.devPanel{margin-top:12px;padding:12px;border-radius:20px;background:#07111e;color:white}.devPanel h3{margin:0 0 8px}.devActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.devActions button{border:0;border-radius:13px;padding:10px;font-weight:1000;background:#ffffff22;color:white;border:1px solid #ffffff33}.toggleOn{outline:2px solid #82f7c1;background:#82f7c133!important}.toggleOff{outline:2px solid #ff9d9d;background:#ff9d9d33!important}
  `;
  document.head.appendChild(style);
}

function hideLegacyButtons() {
  const bottom = $('.bottom');
  if (!bottom) return;
  OLD_BUTTON_IDS.forEach((id) => {
    const button = document.getElementById(id);
    if (button) {
      button.dataset.menuLegacy = 'true';
      button.style.display = 'none';
    }
  });
  Array.from(bottom.querySelectorAll('.mini')).forEach((button) => {
    if (!button.classList.contains('menuHubBtn')) button.style.display = 'none';
  });
}

function triggerTarget(id) {
  const target = document.getElementById(id);
  if (!target) { toast('아직 준비 중인 메뉴입니다.'); return; }
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  setTimeout(() => target.click(), 20);
}

function card(icon, title, desc, attrs = '') {
  return `<button class="menuHubItem" ${attrs}><div class="ico">${icon}</div><div><b>${title}</b><span>${desc}</span></div></button>`;
}

function route(panel, options = {}) {
  if (!panel) return;
  const push = options.fromBack ? {} : { push: panel };
  if (panel.type === 'hub') openHub(panel.id, push);
  if (panel.type === 'noteDex') openNoteDex(push);
  if (panel.type === 'noteExplore') openNoteExplore(push);
  if (panel.type === 'settings') openSettings(push);
  if (panel.type === 'developer') openDeveloper(push);
}

function openHub(id, options = {}) {
  if (id === 'note') return openNoteHub(options);
  if (id === 'quest') return openQuestHub(options);
  if (id === 'return') return openReturnHub(options);
  if (id === 'settings') return openSettings(options);
}

function openNoteHub(options = {}) {
  openModal(`${headerHTML('📖 연구노트', '기록 2분류', '도감기록과 탐험기록만 남겨 피로도를 줄였습니다.')}
    <div class="menuHubGrid">
      ${card('📘', '도감기록', '곤충도감, 도감보상, 전설기록을 합쳐 확인합니다.', 'data-panel="noteDex"')}
      ${card('📒', '탐험기록', '탐험일지, 호박사의 메모, NPC 기록, 발견한 팁, 지역정보, 세계관을 합쳐 확인합니다.', 'data-panel="noteExplore"')}
    </div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'hub', id: 'note' } });
  $('[data-panel="noteDex"]').onclick = () => route({ type: 'noteDex' });
  $('[data-panel="noteExplore"]').onclick = () => route({ type: 'noteExplore' });
}

function openNoteDex(options = {}) {
  openModal(`${headerHTML('📘 도감기록', '도감 / 전설', '도감과 전설 기록은 같은 성격의 수집 기록으로 묶었습니다.')}
    <div class="menuHubGrid">
      ${card('🐞', '곤충도감', '일반 곤충 기록과 최고 등급, 판정을 확인합니다.', 'data-target="openDex"')}
      ${card('🎁', '도감보상', '도감 완성도 보상을 수령합니다.', 'data-target="openDexReward"')}
      ${card('⚡', '전설기록', '전설 곤충 목격/포획 기록을 확인합니다.', 'data-target="openLegendary"')}
    </div>${closeHTML()}`, { push: options.push || { type: 'noteDex' } });
  document.querySelectorAll('[data-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.target); });
}

function openNoteExplore(options = {}) {
  const core = loadCore();
  openModal(`${headerHTML('📒 탐험기록', '기록 모음', '팁과 세계관은 메뉴가 아니라 탐험 중 축적되는 기록으로 관리합니다.')}
    <div class="compactList"><b>오늘의 탐험일지</b><p>${core.lastEvent || '아직 기록된 탐험일지가 없습니다.'}</p></div>
    <div class="compactList"><b>호박사의 메모</b><p>레이더 신호는 곤충, NPC, 전설, 거점 발견으로 확장될 예정입니다. 가까이 갈수록 정체가 드러나는 방향으로 리마스터합니다.</p></div>
    <div class="compactList"><b>NPC 기록</b><p>NPC는 메뉴 속 대화 버튼이 아니라 필드에서 곤충인 줄 알고 접근했을 때 만나는 이벤트 캐릭터로 전환합니다.</p></div>
    <div class="compactList"><b>발견한 팁</b><p>비 오는 날에는 강가 신호, 밤에는 발광 신호를 우선 확인하세요. 채집 실패 시 곤충 도주 규칙이 다음 밸런스 리마스터에 반영됩니다.</p></div>
    <div class="compactList"><b>지역정보</b><p>숲, 초원, 강가, 도시는 각기 다른 곤충과 거점, NPC를 숨기고 있습니다. 거점은 레이더에 표시되지 않고 직접 발견해야 열립니다.</p></div>
    <div class="compactList"><b>세계관</b><p>CatchABugs는 레이더로 생태 신호를 추적하고, 도감과 연구노트에 기록을 쌓아가는 탐험 게임입니다.</p></div>${closeHTML()}`, { push: options.push || { type: 'noteExplore' } });
}

function openQuestHub(options = {}) {
  openModal(`${headerHTML('📜 퀘스트', '목표 / 업적', '퀘스트는 탭을 나누지 않고 한 화면에서 스크롤로 확인하도록 정리했습니다.')}
    <div class="menuHubGrid">
      ${card('📜', '퀘스트', '메인 퀘스트, 서브 퀘스트, NPC 의뢰, 일일미션을 한 화면에서 확인합니다.', 'data-target="openQuest"')}
      ${card('🏆', '업적', '누적 플레이 업적과 보상을 확인합니다.', 'data-target="openAchievement"')}
      ${card('🎖️', '칭호', '해금한 칭호와 배지를 확인합니다.', 'data-target="openBadgeTitle"')}
    </div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'hub', id: 'quest' } });
  document.querySelectorAll('[data-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.target); });
}

function isPointOpen(point, state, settings) {
  return settings.returnAllOpen || !!state.discovered[point.id];
}

function openReturnHub(options = {}) {
  const state = loadReturnState();
  const settings = loadSettings();
  const items = RETURN_POINTS.map((point) => {
    const open = isPointOpen(point, state, settings);
    const attrs = open ? `data-return-id="${point.id}"` : '';
    return `<button class="menuHubItem ${open ? '' : 'locked'}" ${attrs}><div class="ico">${open ? point.icon : '？'}</div><div><b>${open ? point.name : '미발견 거점'}</b><span>${open ? point.desc : '탐험 중 직접 발견하면 귀환석에 등록됩니다.'}</span></div></button>`;
  }).join('');
  openModal(`${headerHTML('🏕 귀환', '귀환석 / 거점', '연구소는 연구·구매 메뉴이며, 마을과 발견한 거점은 귀환석 이동 지점입니다.')}
    <div class="menuHubGrid">${items}</div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'hub', id: 'return' } });
  document.querySelectorAll('[data-return-id]').forEach((button) => { button.onclick = () => useReturnPoint(button.dataset.returnId); });
}

function useReturnPoint(id) {
  const point = RETURN_POINTS.find((item) => item.id === id);
  if (!point) return;
  if (point.type === 'lab') { triggerTarget('openLab'); return; }
  const core = loadCore();
  core.player ||= { x: 0, y: 0 };
  core.player.x = Number(point.x || 0);
  core.player.y = Number(point.y || 0);
  core.lastEvent = `${point.name}으로 귀환석을 사용했다.`;
  saveCore(core);
  toast(`${point.icon} ${point.name}으로 귀환`);
  closeModal();
}

function openSettings(options = {}) {
  openModal(`${headerHTML('⚙️ 설정', '저장 / 환경 / 개발', '저장, 사운드, 진동, 개발자모드, 게임정보를 이곳으로 모았습니다.')}
    <div class="menuHubGrid">
      ${card('💾', '저장 / 불러오기', '수동 저장, 백업 코드 복사, 복원을 진행합니다.', 'data-target="openSave"')}
      ${card('🔊', '사운드 / 진동', '사운드와 진동 사용 여부를 설정합니다.', 'data-sound-vibe="true"')}
      ${card('🧪', '개발자모드', '거점 전체오픈, 연구별 무한, 연구노트 전체오픈을 설정합니다.', 'data-panel="developer"')}
      ${card('ℹ️', '게임정보', '현재 Engine 2.0 메뉴 구조와 게임 정보를 확인합니다.', 'data-game-info="true"')}
    </div>${closeHTML()}`, { reset: options.reset, push: options.push || { type: 'settings' } });
  document.querySelectorAll('[data-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.target); });
  $('[data-panel="developer"]').onclick = () => route({ type: 'developer' });
  $('[data-sound-vibe]').onclick = openSoundVibe;
  $('[data-game-info]').onclick = openGameInfo;
}

function openSoundVibe() {
  const settings = loadSettings();
  openModal(`${headerHTML('🔊 사운드 / 진동', '환경설정', '효과음과 진동 설정입니다. 실제 사운드 연결은 다음 단계에서 확장됩니다.')}
    <div class="devPanel"><h3>사용 설정</h3><div class="devActions"><button data-toggle="sound" class="${settings.sound ? 'toggleOn' : 'toggleOff'}">사운드 ${settings.sound ? 'ON' : 'OFF'}</button><button data-toggle="vibration" class="${settings.vibration ? 'toggleOn' : 'toggleOff'}">진동 ${settings.vibration ? 'ON' : 'OFF'}</button></div></div>${closeHTML()}`, { push: { type: 'sound' } });
  document.querySelectorAll('[data-toggle]').forEach((button) => {
    button.onclick = () => {
      const next = loadSettings();
      next[button.dataset.toggle] = !next[button.dataset.toggle];
      saveSettings(next);
      openSoundVibe();
    };
  });
}

function openDeveloper(options = {}) {
  const settings = loadSettings();
  openModal(`${headerHTML('🧪 개발자모드', '테스트', '일반 플레이에서는 숨겨진 테스트용 기능입니다.')}
    <div class="devPanel"><h3>해금/자원</h3><div class="devActions">
      <button data-dev="returnAllOpen" class="${settings.returnAllOpen ? 'toggleOn' : ''}">귀환 전체오픈</button>
      <button data-dev="noteAllOpen" class="${settings.noteAllOpen ? 'toggleOn' : ''}">연구노트 전체오픈</button>
      <button data-dev="infiniteMoney" class="${settings.infiniteMoney ? 'toggleOn' : ''}">연구별 무한</button>
      <button data-dev-action="giveMoney">연구별 +9999</button>
    </div></div>
    <div class="devPanel"><h3>테스트 바로가기</h3><div class="devActions"><button data-target="openLegendary">전설 테스트</button><button data-target="openWeather">날씨 정보</button></div></div>${closeHTML()}`, { push: options.push || { type: 'developer' } });
  document.querySelectorAll('[data-dev]').forEach((button) => {
    button.onclick = () => {
      const next = loadSettings();
      next[button.dataset.dev] = !next[button.dataset.dev];
      saveSettings(next);
      toast(`${button.textContent} ${next[button.dataset.dev] ? 'ON' : 'OFF'}`);
      openDeveloper({ push: { type: 'developer' } });
    };
  });
  document.querySelectorAll('[data-target]').forEach((button) => { button.onclick = () => triggerTarget(button.dataset.target); });
  const give = $('[data-dev-action="giveMoney"]');
  if (give) give.onclick = () => { const core = loadCore(); core.points = Number(core.points || 0) + 9999; saveCore(core); toast('연구별 +9999'); openDeveloper({ push: { type: 'developer' } }); };
}

function openGameInfo() {
  openModal(`${headerHTML('ℹ️ 게임정보', 'Engine 2.0', '메뉴 피로도를 줄이고 같은 성격의 기능을 묶는 리마스터입니다.')}
    <div class="compactList"><b>하단 메뉴</b><p>연구노트 / 퀘스트 / 귀환 / 설정 4개로 고정합니다.</p></div>
    <div class="compactList"><b>연구노트</b><p>도감기록과 탐험기록만 유지합니다.</p></div>
    <div class="compactList"><b>퀘스트</b><p>퀘스트와 업적은 탭 없이 한 흐름으로 접근합니다.</p></div>
    <div class="compactList"><b>귀환</b><p>연구소, 초기마을, 발견한 거점만 표시합니다. 개발자모드에서는 전체 오픈할 수 있습니다.</p></div>${closeHTML()}`, { push: { type: 'info' } });
}

function buildHub() {
  const bottom = $('.bottom');
  if (!bottom) return;
  injectStyle();
  bottom.classList.add('menuHub');
  hideLegacyButtons();
  HUB_MENUS.forEach((menu) => {
    let button = document.getElementById(`menuHub-${menu.id}`);
    if (!button) {
      button = document.createElement('button');
      button.id = `menuHub-${menu.id}`;
      button.className = 'mini menuHubBtn';
      button.innerHTML = `<b>${menu.icon}</b><span>${menu.label}</span>`;
      bottom.appendChild(button);
    }
    button.style.display = '';
    button.onclick = () => openHub(menu.id, { reset: true });
  });
  wireNavButtons();
}

function initMenuRemaster() {
  buildHub();
  const bottom = $('.bottom');
  if (!bottom || bottom.dataset.menuObserver === 'on') return;
  bottom.dataset.menuObserver = 'on';
  const observer = new MutationObserver(() => buildHub());
  observer.observe(bottom, { childList: true, subtree: false });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(initMenuRemaster, 80));
setTimeout(initMenuRemaster, 300);
setTimeout(initMenuRemaster, 900);
