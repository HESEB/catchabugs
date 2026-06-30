const MENU_GROUPS = Object.freeze([
  {
    id: 'research',
    icon: '📖',
    label: '연구',
    desc: '도감, 보상, 연구소, 상점, 장비를 한 곳에서 관리합니다.',
    items: [
      { icon: '📘', label: '곤충도감', target: 'openDex', desc: '발견한 곤충과 도감 진행률을 확인합니다.' },
      { icon: '🎁', label: '도감보상', target: 'openDexReward', desc: '도감 완성도 보상을 수령합니다.' },
      { icon: '🧪', label: '연구소', target: 'openLab', desc: 'NPC 대화와 연구 업그레이드를 진행합니다.' },
      { icon: '🛒', label: '상점', desc: '미끼와 장비 구매 공간입니다. 다음 업데이트에서 연결됩니다.' },
      { icon: '🎒', label: '장비', desc: '채집망, 레이더, 필드 장비 관리 공간입니다. 다음 업데이트에서 연결됩니다.' },
    ],
  },
  {
    id: 'mission',
    icon: '🎯',
    label: '임무',
    desc: '퀘스트, 일일미션, 업적, 배지/칭호를 확인합니다.',
    items: [
      { icon: '📜', label: '퀘스트 / 일일미션', target: 'openQuest', desc: '메인 퀘스트와 일일미션 진행도를 확인합니다.' },
      { icon: '🏆', label: '업적', target: 'openAchievement', desc: '누적 플레이 업적과 보상을 확인합니다.' },
      { icon: '🎖️', label: '배지 / 칭호', target: 'openBadgeTitle', desc: '해금한 칭호를 장착합니다.' },
    ],
  },
  {
    id: 'record',
    icon: '💾',
    label: '기록',
    desc: '탐험일지, 저장, 백업, 귀환 기능을 모았습니다.',
    items: [
      { icon: '📒', label: '탐험일지', target: 'diary', desc: '최근 탐험 기록을 확인합니다.' },
      { icon: '💾', label: '저장 / 백업', target: 'openSave', desc: '수동 저장, 백업 코드 복사, 복원을 진행합니다.' },
      { icon: '🏠', label: '귀환', target: 'home', desc: '저장 후 시작 화면으로 돌아갑니다.' },
    ],
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: '설정',
    desc: '게임 설정과 개발자 모드를 관리합니다.',
    items: [
      { icon: '🎮', label: '게임 설정', action: 'settings', desc: '진동, HUD, 메뉴 표시 설정입니다.' },
      { icon: '🧪', label: '개발자 모드', action: 'developer', desc: '날씨, 전설, 테스트 기능을 모았습니다.' },
    ],
  },
]);

const OLD_BUTTON_IDS = [
  'openDex', 'openDexTitle', 'openDexReward', 'openQuest', 'openAchievement',
  'openBadgeTitle', 'openSave', 'openWeather', 'openLab', 'openLegendary', 'diary', 'home',
];

function $(selector) {
  return document.querySelector(selector);
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
}

function triggerTarget(id) {
  const target = document.getElementById(id);
  if (!target) {
    toast('아직 준비 중인 메뉴입니다.');
    return;
  }
  const modal = $('#modal');
  if (modal) modal.style.display = 'none';
  setTimeout(() => target.click(), 20);
}

function injectStyle() {
  if ($('#menuRemasterStyle')) return;
  const style = document.createElement('style');
  style.id = 'menuRemasterStyle';
  style.textContent = `
    .bottom.menuHub{justify-content:space-around;gap:6px;padding:8px 8px 10px;background:linear-gradient(0deg,#07111ee8,#07111e99 78%,transparent);backdrop-filter:blur(10px)}
    .menuHubBtn{flex:1;max-width:92px;border:0;border-radius:18px;padding:9px 6px;background:#ffffff24;border:1px solid #ffffff35;color:white;font-weight:1000;box-shadow:0 8px 20px #0005;display:flex;flex-direction:column;align-items:center;gap:2px}
    .menuHubBtn b{font-size:20px;line-height:1}.menuHubBtn span{font-size:11px;line-height:1.15}
    .menuHubSheet h2{margin:0;font-size:22px}.menuHubHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:6px 2px 12px}.menuHubHeader small{font-weight:1000;color:#0f6f56;text-align:right}.menuHubIntro{padding:12px;margin:8px 0 12px;border-radius:18px;background:#0000000a;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.menuHubGrid{display:grid;grid-template-columns:1fr;gap:9px}.menuHubItem{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:20px;padding:12px;background:linear-gradient(135deg,#fff,#f6fbff);box-shadow:0 8px 18px #0001;border:1px solid #0000000d}.menuHubItem .ico{width:52px;height:52px;flex:0 0 52px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.menuHubItem b{display:block;font-size:15px}.menuHubItem span{display:block;margin-top:4px;color:#0008;font-size:12px;font-weight:800;line-height:1.35}.menuHubItem.placeholder{opacity:.58;filter:grayscale(.35)}.devPanel{margin-top:12px;padding:12px;border-radius:20px;background:#07111e;color:white}.devPanel h3{margin:0 0 8px}.devActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.devActions button{border:0;border-radius:13px;padding:10px;font-weight:1000;background:#ffffff22;color:white;border:1px solid #ffffff33}.devNote{margin-top:9px;font-size:11px;color:#ffffffb8;font-weight:800;line-height:1.45}
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

function openDeveloperPanel() {
  openModal(`<div class="menuHubSheet"><div class="menuHubHeader"><h2>⚙️ 개발자 모드</h2><small>테스트 도구</small></div>
    <div class="menuHubIntro">테스트용 기능을 한 곳에 모았습니다. 실제 플레이 메뉴에서는 숨겨두는 항목입니다.</div>
    <div class="devPanel"><h3>테스트 메뉴</h3><div class="devActions">
      <button data-dev-target="openWeather">날씨 확인</button>
      <button data-dev-target="openLegendary">전설 테스트</button>
      <button data-dev-action="hud">HUD 새로고침</button>
      <button data-dev-action="gps">GPS/나침반 안내</button>
    </div><div class="devNote">나침반 슬라이더, 좌표, AI/스폰 디버그는 다음 개발자 모드 업데이트에서 확장됩니다.</div></div></div>`);
  document.querySelectorAll('[data-dev-target]').forEach((button) => {
    button.onclick = () => triggerTarget(button.dataset.devTarget);
  });
  document.querySelectorAll('[data-dev-action]').forEach((button) => {
    button.onclick = () => toast(button.dataset.devAction === 'hud' ? 'HUD 상태를 다시 확인했습니다.' : 'PC에서는 키보드/드래그 이동만, 회전은 나침반 설정에서 조정합니다.');
  });
}

function openSettingsPanel() {
  openModal(`<div class="menuHubSheet"><div class="menuHubHeader"><h2>⚙️ 설정</h2><small>게임 / 개발</small></div>
    <div class="menuHubIntro">화면 표시, 테스트 기능, 개발자 도구를 이곳으로 모았습니다.</div>
    <div class="menuHubGrid">
      <button class="menuHubItem placeholder" data-placeholder="게임 설정"><div class="ico">🎮</div><div><b>게임 설정</b><span>진동, 사운드, 그래픽 옵션은 다음 업데이트에서 연결됩니다.</span></div></button>
      <button class="menuHubItem" id="openDeveloperPanel"><div class="ico">🧪</div><div><b>개발자 모드</b><span>날씨, 전설, GPS/나침반, 테스트 메뉴를 확인합니다.</span></div></button>
    </div></div>`);
  const dev = $('#openDeveloperPanel');
  if (dev) dev.onclick = openDeveloperPanel;
  document.querySelectorAll('[data-placeholder]').forEach((button) => {
    button.onclick = () => toast(`${button.dataset.placeholder}은 다음 업데이트에서 연결됩니다.`);
  });
}

function openGroup(groupId) {
  const group = MENU_GROUPS.find((item) => item.id === groupId);
  if (!group) return;
  if (group.id === 'settings') {
    openSettingsPanel();
    return;
  }
  const items = group.items.map((item) => {
    const attrs = item.target ? `data-target="${item.target}"` : item.action ? `data-action="${item.action}"` : `data-placeholder="${item.label}"`;
    const cls = item.target || item.action ? 'menuHubItem' : 'menuHubItem placeholder';
    return `<button class="${cls}" ${attrs}><div class="ico">${item.icon}</div><div><b>${item.label}</b><span>${item.desc}</span></div></button>`;
  }).join('');
  openModal(`<div class="menuHubSheet"><div class="menuHubHeader"><h2>${group.icon} ${group.label}</h2><small>${group.items.length}개 메뉴</small></div><div class="menuHubIntro">${group.desc}</div><div class="menuHubGrid">${items}</div></div>`);
  document.querySelectorAll('[data-target]').forEach((button) => {
    button.onclick = () => triggerTarget(button.dataset.target);
  });
  document.querySelectorAll('[data-placeholder]').forEach((button) => {
    button.onclick = () => toast(`${button.dataset.placeholder}은 다음 업데이트에서 연결됩니다.`);
  });
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
    button.onclick = () => openGroup(group.id);
  });
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
