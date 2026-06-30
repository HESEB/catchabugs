const BADGE_STORAGE_KEY = 'catchabugs.badgeTitle.v1';
const ACHIEVEMENT_STORAGE_KEY = 'catchabugs.achievement.v1';

const BADGES = Object.freeze([
  {
    id: 'rookie-researcher',
    icon: '🔰',
    badge: '초보 연구 배지',
    title: '새내기 연구원',
    desc: '곤충을 처음 채집하면 획득한다.',
    check: (stats) => (stats.catchTotal || 0) >= 1,
  },
  {
    id: 'field-collector',
    icon: '🧺',
    badge: '채집가 배지',
    title: '초보 채집가',
    desc: '곤충을 10마리 이상 채집하면 획득한다.',
    check: (stats) => (stats.catchTotal || 0) >= 10,
  },
  {
    id: 'precision-hand',
    icon: '🎯',
    badge: '정밀 채집 배지',
    title: '정밀한 손놀림',
    desc: 'PERFECT 판정 3회 이상 달성하면 획득한다.',
    check: (stats) => (stats.perfectCatch || 0) >= 3,
  },
  {
    id: 'rare-tracker',
    icon: '💎',
    badge: '희귀 신호 배지',
    title: '희귀 신호 추적자',
    desc: '보라 등급 이상 곤충을 3마리 이상 채집하면 획득한다.',
    check: (stats) => (stats.rareCatch || 0) >= 3,
  },
  {
    id: 'dex-scholar',
    icon: '📘',
    badge: '도감학자 배지',
    title: '도감 수집가',
    desc: '서로 다른 곤충 5종을 기록하면 획득한다.',
    check: (stats) => (stats.uniqueSpecies || []).length >= 5,
  },
  {
    id: 'butterfly-watcher',
    icon: '🦋',
    badge: '나비 관찰 배지',
    title: '나비 관찰자',
    desc: '나비류를 3마리 이상 채집하면 획득한다.',
    check: (stats) => Number(stats.familyCatch?.['나비'] || 0) >= 3,
  },
  {
    id: 'river-observer',
    icon: '🌊',
    badge: '강가 조사 배지',
    title: '강가 조사원',
    desc: '강가 서식 곤충을 3마리 이상 채집하면 획득한다.',
    check: (stats) => Number(stats.habitatCatch?.river || 0) >= 3,
  },
  {
    id: 'gold-specimen',
    icon: '🏆',
    badge: '황금 표본 배지',
    title: '황금 표본 발견자',
    desc: '골드 등급 이상 곤충을 채집하면 획득한다.',
    check: (stats) => Number(stats.gradePts?.['110'] || 0) >= 1,
  },
]);

function $(selector) {
  return document.querySelector(selector);
}

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function loadAchievementStats() {
  const saved = safeParse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY));
  return saved?.stats || {};
}

function loadBadgeState() {
  return safeParse(localStorage.getItem(BADGE_STORAGE_KEY)) || {
    equippedTitle: null,
    equippedBadge: null,
  };
}

function saveBadgeState(state) {
  localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(state));
}

function unlockedBadges() {
  const stats = loadAchievementStats();
  return BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.check(stats),
  }));
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function updateEquippedDisplay() {
  const state = loadBadgeState();
  const badge = BADGES.find((item) => item.id === state.equippedBadge);
  const old = $('#titleBadgeCard');
  if (old) old.remove();

  const game = $('#game');
  if (!game || !badge) return;

  const card = document.createElement('div');
  card.id = 'titleBadgeCard';
  card.innerHTML = `${badge.icon} ${state.equippedTitle || badge.title}`;
  card.style.cssText = 'position:absolute;left:50%;top:54px;z-index:11;transform:translateX(-50%);max-width:220px;padding:7px 11px;border-radius:999px;background:#07111ed9;color:white;border:1px solid #ffffff38;box-shadow:0 10px 24px #0006;font-size:11px;font-weight:1000;text-align:center;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
  game.appendChild(card);
}

function renderBadgeHTML() {
  const state = loadBadgeState();
  const list = unlockedBadges();
  const unlockedCount = list.filter((badge) => badge.unlocked).length;
  const cards = list.map((badge) => {
    const equipped = state.equippedBadge === badge.id;
    return `<article class="badgeCard ${badge.unlocked ? 'unlocked' : 'locked'} ${equipped ? 'equipped' : ''}">
      <div class="badgeIcon">${badge.icon}</div>
      <div class="badgeBody">
        <div class="badgeTop"><b>${badge.unlocked ? badge.badge : '??? 배지'}</b><span>${equipped ? '장착중' : badge.unlocked ? '해금' : '잠김'}</span></div>
        <p>${badge.desc}</p>
        <div class="badgeTitle">칭호: ${badge.unlocked ? badge.title : '???'}</div>
        <button data-badge-id="${badge.id}" ${badge.unlocked ? '' : 'disabled'}>${equipped ? '장착중' : '칭호 장착'}</button>
      </div>
    </article>`;
  }).join('');

  return `<div class="badgeHeader"><h2>배지 / 칭호</h2><div>${unlockedCount}/${BADGES.length}</div></div>
    <style>
      .badgeHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.badgeHeader h2{margin:0}.badgeHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.badgeCard{display:flex;gap:12px;align-items:center;padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.badgeCard.locked{opacity:.55;filter:grayscale(.6)}.badgeCard.equipped{border-color:#ffd166;box-shadow:0 8px 24px #ffd16633}.badgeIcon{width:56px;height:56px;flex:0 0 56px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.badgeBody{flex:1;min-width:0}.badgeTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.badgeTop b{font-size:15px}.badgeTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#ffd1662b;color:#8a5a00}.badgeBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800}.badgeTitle{margin:6px 0 8px;font-size:12px;font-weight:1000;color:#0a6b52}.badgeBody button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.badgeBody button:disabled{opacity:.35}
    </style>${cards}`;
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function openBadgeTitle() {
  openModal(renderBadgeHTML());
  document.querySelectorAll('[data-badge-id]').forEach((button) => {
    button.onclick = () => {
      const badge = unlockedBadges().find((item) => item.id === button.dataset.badgeId);
      if (!badge || !badge.unlocked) return;
      saveBadgeState({ equippedBadge: badge.id, equippedTitle: badge.title });
      updateEquippedDisplay();
      toast(`${badge.icon} ${badge.title} 칭호 장착`);
      openBadgeTitle();
    };
  });
}

function ensureBadgeButton() {
  const bottom = $('.bottom');
  if (!bottom || $('#openBadgeTitle')) return;
  const button = document.createElement('button');
  button.id = 'openBadgeTitle';
  button.className = 'mini';
  button.textContent = '칭호';
  const home = $('#home');
  bottom.insertBefore(button, home || null);
  button.onclick = openBadgeTitle;
}

function initBadgeTitleSystem() {
  ensureBadgeButton();
  updateEquippedDisplay();
}

document.addEventListener('DOMContentLoaded', initBadgeTitleSystem);
setTimeout(initBadgeTitleSystem, 0);
window.addEventListener('storage', updateEquippedDisplay);
