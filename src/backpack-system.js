const BACKPACK_KEY = 'catchabugs.backpack.v1';

const DEFAULT_ITEMS = {
  consumable: [
    { id: 'bug-cookie', icon: '🍪', name: '곤충 쿠키', desc: '일반 곤충이 조금 더 자주 보인다.', count: 0 },
  ],
  installation: [
    { id: 'bug-lure', icon: '🪤', name: '벌레 유인기', desc: '일정 시간 주변 곤충 생성량을 높인다.', count: 0 },
    { id: 'rare-alarm', icon: '🔔', name: '희귀 알람기', desc: '희귀 등급 이상 신호를 알려준다.', count: 0 },
    { id: 'radar-boost', icon: '📡', name: '레이더 증폭기', desc: '일정 시간 레이더 탐지 범위를 넓힌다.', count: 0 },
    { id: 'sap-trap', icon: '🪵', name: '수액통', desc: '숲에서 사슴벌레·장수풍뎅이 계열을 유인한다.', count: 0 },
    { id: 'flower-lure', icon: '🌼', name: '꽃 유인기', desc: '초원에서 나비·벌 계열을 유인한다.', count: 0 },
    { id: 'water-trap', icon: '💧', name: '수생 트랩', desc: '강가에서 수서 곤충을 유인한다.', count: 0 },
    { id: 'bug-light', icon: '💡', name: '곤충등', desc: '밤에 야행성 곤충 신호를 강화한다.', count: 0 },
  ],
  gear: [
    { id: 'outfit-default', type: 'outfit', icon: '🥾', name: '기본 탐험복', desc: '가장 기본적인 탐험복.', owned: true },
    { id: 'outfit-rain', type: 'outfit', icon: '🌧️', name: '레인코트', desc: '비 오는 날 채집 성공률 +2%.', owned: false },
    { id: 'outfit-forest', type: 'outfit', icon: '🌲', name: '숲 탐험복', desc: '숲 지역 이동속도 +3%.', owned: false },
    { id: 'bag-default', type: 'bag', icon: '🎒', name: '기본 배낭', desc: '기본 배낭.', owned: true },
    { id: 'bag-research', type: 'bag', icon: '🧰', name: '연구 배낭', desc: '설치물 보관에 특화된 배낭.', owned: false },
    { id: 'net-default', type: 'net', icon: '🕸️', name: '기본 채집망', desc: '기본 채집망.', owned: true },
    { id: 'net-rare', type: 'net', icon: '✨', name: '희귀 채집망', desc: '희귀 곤충 채집 보정.', owned: false },
  ],
  material: [
    { id: 'shell-fragment', icon: '🧩', name: '갑각 조각', desc: '연구 재료.', count: 0 },
  ],
  special: [
    { id: 'legend-key', icon: '🗝️', name: '전설 신호 키', desc: '전설 연구에 사용하는 특수 아이템.', count: 0 },
  ],
};

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_ITEMS)); }
function loadBackpack() {
  const saved = safeParse(localStorage.getItem(BACKPACK_KEY));
  const base = cloneDefault();
  if (!saved) return base;
  Object.keys(base).forEach((section) => {
    base[section] = base[section].map((item) => ({ ...item, ...(saved[section]?.find((old) => old.id === item.id) || {}) }));
  });
  return base;
}
function saveBackpack(data) { localStorage.setItem(BACKPACK_KEY, JSON.stringify(data)); return data; }
function economy() { return window.CATCHABUGS_ECONOMY || null; }
function profile() { return window.CATCHABUGS_PROFILE || null; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function openModal(html) { const body = $('#modalBody'); const modal = $('#modal'); if (!body || !modal) return; body.innerHTML = html; modal.style.display = 'block'; }

function syncEconomyItems(data) {
  const eco = economy()?.load?.();
  if (!eco?.equipment) return data;
  data.installation.forEach((item) => { item.count = Number(item.count || 0) + Number(eco.equipment[item.id] || 0); });
  return data;
}
function currencyLine() {
  const worm = economy()?.getStars?.() ?? window.CATCHABUGS_GAME?.getPoints?.() ?? 0;
  const core = economy()?.getExplorerCore?.() ?? 0;
  return `<div class="bagCurrency">🪱 웜칩 ${worm} · 🔷 탐사코어 ${core}</div>`;
}
function itemCard(item, action = '') {
  return `<article class="bagCard"><div class="bagIcon">${item.icon}</div><div class="bagInfo"><b>${item.name}</b><p>${item.desc}</p><small>${'count' in item ? `보유 ${item.count}` : item.owned ? '보유중' : '미보유'}</small></div>${action}</article>`;
}
function renderSection(tab) {
  const data = syncEconomyItems(loadBackpack());
  if (tab === 'gear') {
    return data.gear.map((item) => itemCard(item, item.owned ? `<button data-equip="${item.id}">착용</button>` : `<button data-buy-gear="${item.id}">획득예정</button>`)).join('');
  }
  return data[tab].map((item) => itemCard(item, item.count > 0 ? `<button data-use-item="${item.id}" data-tab="${tab}">사용</button>` : `<button disabled>없음</button>`)).join('');
}
function backpackHTML(tab = 'installation') {
  const tabs = [
    ['consumable', '소비'], ['installation', '설치'], ['gear', '장비'], ['material', '재료'], ['special', '특수']
  ].map(([id, label]) => `<button class="${tab === id ? 'on' : ''}" data-bag-tab="${id}">${label}</button>`).join('');
  return `<div class="bagSheet"><h2>🎒 배낭</h2>${currencyLine()}<div class="bagTabs">${tabs}</div><div class="bagList">${renderSection(tab)}</div></div>
    <style>
      .bagSheet h2{margin:0 0 8px}.bagCurrency{padding:10px;border-radius:16px;background:#0000000a;font-size:12px;font-weight:1000;color:#0f6f56}.bagTabs{display:flex;gap:6px;margin:10px 0;overflow:auto}.bagTabs button{border:0;border-radius:999px;padding:8px 12px;font-weight:1000;background:#0000000d;color:#07111e;white-space:nowrap}.bagTabs button.on{background:#07111e;color:white}.bagList{display:grid;gap:9px}.bagCard{display:flex;align-items:center;gap:10px;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;padding:11px;box-shadow:0 8px 18px #0001}.bagIcon{width:50px;height:50px;flex:0 0 50px;border-radius:17px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001}.bagInfo{flex:1}.bagInfo b{font-size:14px}.bagInfo p{margin:4px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.35}.bagInfo small{font-size:11px;font-weight:1000;color:#0f6f56}.bagCard button{border:0;border-radius:12px;background:#07111e;color:white;padding:9px 10px;font-weight:1000}.bagCard button:disabled{opacity:.35}
    </style>`;
}
function openBackpack(tab = 'installation') {
  openModal(backpackHTML(tab));
  wireBackpack();
}
function wireBackpack() {
  document.querySelectorAll('[data-bag-tab]').forEach((button) => button.onclick = () => openBackpack(button.dataset.bagTab));
  document.querySelectorAll('[data-use-item]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.useItem;
      toast('설치물 사용 기능은 다음 Engine에서 실제 효과와 연결됩니다.');
      window.CATCHABUGS_GAME?.addLog?.(`${id} 사용 준비`, '🎒');
    };
  });
  document.querySelectorAll('[data-equip]').forEach((button) => {
    button.onclick = () => {
      const data = loadBackpack();
      const item = data.gear.find((gear) => gear.id === button.dataset.equip);
      if (!item || !item.owned) return;
      profile()?.equipCustomization?.(item.type, item.name);
      toast(`${item.name} 착용`);
      openBackpack('gear');
    };
  });
}
function addItem(id, count = 1) {
  const data = loadBackpack();
  Object.keys(data).forEach((section) => {
    const item = data[section].find((entry) => entry.id === id);
    if (item && 'count' in item) item.count = Number(item.count || 0) + Number(count || 0);
    if (item && 'owned' in item) item.owned = true;
  });
  saveBackpack(data);
}
function addHubButton() {
  const bottom = $('.bottom');
  if (!bottom || $('#menuHub-bag')) return;
  const button = document.createElement('button');
  button.id = 'menuHub-bag';
  button.className = 'mini menuHubBtn';
  button.innerHTML = '<b>🎒</b><span>배낭</span>';
  button.onclick = () => openBackpack();
  const returnBtn = $('#menuHub-return');
  if (returnBtn) bottom.insertBefore(button, returnBtn); else bottom.appendChild(button);
}
function init() { addHubButton(); setInterval(addHubButton, 1200); }
window.CATCHABUGS_BACKPACK = { open: openBackpack, load: loadBackpack, save: saveBackpack, addItem };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
setTimeout(init, 1000);
