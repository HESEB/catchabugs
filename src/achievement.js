const ACHIEVEMENT_STORAGE_KEY = 'catchabugs.achievement.v1';

const ACHIEVEMENTS = Object.freeze([
  { id: 'first-catch', icon: '🐜', title: '첫 채집', desc: '곤충을 처음으로 채집한다.', type: 'catchTotal', target: 1, reward: 80 },
  { id: 'catch-10', icon: '🧺', title: '초보 연구원', desc: '곤충을 10마리 채집한다.', type: 'catchTotal', target: 10, reward: 180 },
  { id: 'perfect-3', icon: '🎯', title: '정밀한 손놀림', desc: 'PERFECT 판정을 3회 달성한다.', type: 'perfectCatch', target: 3, reward: 220 },
  { id: 'rare-3', icon: '💎', title: '희귀 신호 추적자', desc: '보라 등급 이상 곤충을 3마리 채집한다.', type: 'rareCatch', target: 3, reward: 260 },
  { id: 'species-5', icon: '📘', title: '도감 수집가', desc: '서로 다른 곤충 5종을 기록한다.', type: 'uniqueSpecies', target: 5, reward: 300 },
  { id: 'butterfly-3', icon: '🦋', title: '나비 관찰자', desc: '나비류를 3마리 채집한다.', type: 'familyCatch', key: '나비', target: 3, reward: 200 },
  { id: 'river-3', icon: '🌊', title: '강가 조사원', desc: '강가 서식 곤충을 3마리 채집한다.', type: 'habitatCatch', key: 'river', target: 3, reward: 220 },
  { id: 'gold-1', icon: '🏆', title: '황금 표본', desc: '골드 등급 이상 곤충을 1마리 채집한다.', type: 'gradePts', key: '110', target: 1, reward: 350 },
]);

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function initialState() {
  return {
    stats: {
      catchTotal: 0,
      perfectCatch: 0,
      rareCatch: 0,
      uniqueSpecies: [],
      familyCatch: {},
      habitatCatch: {},
      gradePts: {},
    },
    claimed: {},
    unlockedAt: {},
  };
}

export function loadAchievementState() {
  const state = safeParse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)) || initialState();
  state.stats ||= initialState().stats;
  state.stats.uniqueSpecies ||= [];
  state.stats.familyCatch ||= {};
  state.stats.habitatCatch ||= {};
  state.stats.gradePts ||= {};
  state.claimed ||= {};
  state.unlockedAt ||= {};
  return state;
}

export function saveAchievementState(state) {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(state));
}

function addCounter(obj, key, amount = 1) {
  obj[key] = Number(obj[key] || 0) + amount;
}

function progressOf(achievement, state) {
  const stats = state.stats;
  if (achievement.type === 'catchTotal') return stats.catchTotal;
  if (achievement.type === 'perfectCatch') return stats.perfectCatch;
  if (achievement.type === 'rareCatch') return stats.rareCatch;
  if (achievement.type === 'uniqueSpecies') return stats.uniqueSpecies.length;
  if (achievement.type === 'familyCatch') return Number(stats.familyCatch[achievement.key] || 0);
  if (achievement.type === 'habitatCatch') return Number(stats.habitatCatch[achievement.key] || 0);
  if (achievement.type === 'gradePts') return Number(stats.gradePts[achievement.key] || 0);
  return 0;
}

function updateUnlocked(state) {
  const now = new Date().toLocaleString('ko-KR');
  ACHIEVEMENTS.forEach((achievement) => {
    if (!state.unlockedAt[achievement.id] && progressOf(achievement, state) >= achievement.target) {
      state.unlockedAt[achievement.id] = now;
    }
  });
}

export function recordAchievementCatch(event = {}) {
  const state = loadAchievementState();
  const bug = event.bug || {};
  const grade = event.grade || {};
  const judge = event.judge || '';

  state.stats.catchTotal += 1;
  if (judge === 'PERFECT') state.stats.perfectCatch += 1;
  if ((grade.pts || 0) >= 56) state.stats.rareCatch += 1;
  if ((grade.pts || 0) >= 110) addCounter(state.stats.gradePts, '110', 1);

  if (bug.name && !state.stats.uniqueSpecies.includes(bug.name)) {
    state.stats.uniqueSpecies.push(bug.name);
  }

  if ((bug.name || '').includes('나비')) addCounter(state.stats.familyCatch, '나비', 1);
  (bug.habitat || []).forEach((id) => addCounter(state.stats.habitatCatch, id, 1));

  updateUnlocked(state);
  saveAchievementState(state);
  return state;
}

function achievementCard(achievement, state) {
  const value = Math.min(progressOf(achievement, state), achievement.target);
  const pct = Math.round((value / achievement.target) * 100);
  const done = value >= achievement.target;
  const claimed = !!state.claimed[achievement.id];
  return `<article class="achCard ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}">
    <div class="achIcon">${achievement.icon}</div>
    <div class="achBody">
      <div class="achTop"><b>${achievement.title}</b><span>${claimed ? '수령완료' : done ? '달성' : '진행중'}</span></div>
      <p>${achievement.desc}</p>
      <div class="achBar"><i style="width:${pct}%"></i></div>
      <div class="achBottom"><em>${value}/${achievement.target}</em><button data-achievement-id="${achievement.id}" ${done && !claimed ? '' : 'disabled'}>+${achievement.reward}</button></div>
    </div>
  </article>`;
}

export function renderAchievementHTML() {
  const state = loadAchievementState();
  updateUnlocked(state);
  saveAchievementState(state);
  const doneCount = ACHIEVEMENTS.filter((a) => progressOf(a, state) >= a.target).length;
  const cards = ACHIEVEMENTS.map((a) => achievementCard(a, state)).join('');
  return `<div class="achHeader"><h2>업적</h2><div>${doneCount}/${ACHIEVEMENTS.length}</div></div>
    <style>
      .achHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.achHeader h2{margin:0}.achHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.achCard{display:flex;gap:12px;align-items:center;padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f4f8ff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.achCard.done{border-color:#ffd166aa;box-shadow:0 8px 22px #ffd16622}.achCard.claimed{opacity:.62;filter:grayscale(.25)}.achIcon{width:54px;height:54px;flex:0 0 54px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.achBody{flex:1;min-width:0}.achTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.achTop b{font-size:15px}.achTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#ffd1662b;color:#8a5a00}.achCard p{margin:6px 0;color:#0009;font-size:12px;font-weight:800}.achBar{height:10px;background:#0001;border-radius:999px;overflow:hidden}.achBar i{display:block;height:100%;background:linear-gradient(120deg,#ffd166,#82f7c1,#6bb2ff);border-radius:999px}.achBottom{display:flex;align-items:center;justify-content:space-between;margin-top:8px}.achBottom em{font-style:normal;font-weight:1000}.achBottom button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.achBottom button:disabled{opacity:.35}
    </style>${cards}`;
}

export function claimAchievementReward(id, points = 0) {
  const state = loadAchievementState();
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement || state.claimed[id]) return { ok: false, points };
  if (progressOf(achievement, state) < achievement.target) return { ok: false, points };
  state.claimed[id] = true;
  updateUnlocked(state);
  saveAchievementState(state);
  return { ok: true, points: points + achievement.reward, reward: achievement.reward, title: achievement.title };
}
