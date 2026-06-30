const QUEST_STORAGE_KEY = 'catchabugs.quest.v1';

const MAIN_QUESTS = Object.freeze([
  { id: 'first-steps', title: '호박사의 첫 연구', desc: '곤충을 5마리 채집하자.', type: 'catchTotal', target: 5, reward: 120 },
  { id: 'dex-start', title: '도감 기록 시작', desc: '서로 다른 곤충 3종을 도감에 기록하자.', type: 'uniqueSpecies', target: 3, reward: 180 },
  { id: 'rare-signal', title: '희귀 신호 추적', desc: '보라 등급 이상 곤충을 1마리 채집하자.', type: 'rareCatch', target: 1, reward: 220 },
]);

const DAILY_POOL = Object.freeze([
  { id: 'daily-catch-3', title: '오늘의 표본 수집', desc: '곤충 3마리 채집', type: 'dailyCatch', target: 3, reward: 80 },
  { id: 'daily-perfect-1', title: '정밀 채집', desc: 'PERFECT 판정 1회', type: 'perfectCatch', target: 1, reward: 120 },
  { id: 'daily-field-bug', title: '초원 조사', desc: '초원 서식 곤충 1마리 채집', type: 'habitatCatch', habitat: 'field', target: 1, reward: 90 },
  { id: 'daily-river-bug', title: '강가 조사', desc: '강가 서식 곤충 1마리 채집', type: 'habitatCatch', habitat: 'river', target: 1, reward: 90 },
  { id: 'daily-butterfly', title: '나비 관찰', desc: '나비류 1마리 채집', type: 'bugFamily', keyword: '나비', target: 1, reward: 100 },
  { id: 'daily-rare', title: '강한 신호', desc: '파랑 등급 이상 1마리 채집', type: 'gradePts', minPts: 32, target: 1, reward: 120 },
]);

function todayKey() {
  return new Date().toLocaleDateString('ko-KR');
}

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function pickDailyMissions(day) {
  let seed = Array.from(day).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const pool = [...DAILY_POOL];
  const picked = [];
  while (picked.length < 3 && pool.length) {
    seed = (seed * 9301 + 49297) % 233280;
    const index = seed % pool.length;
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function createInitialState(day = todayKey()) {
  return {
    day,
    stats: {
      catchTotal: 0,
      rareCatch: 0,
      perfectCatch: 0,
      dailyCatch: 0,
      uniqueSpecies: [],
      habitatCatch: {},
      bugFamily: {},
      gradePts: {},
    },
    claimed: {},
    daily: pickDailyMissions(day),
  };
}

export function loadQuestState() {
  const day = todayKey();
  const saved = safeParse(localStorage.getItem(QUEST_STORAGE_KEY));
  if (!saved || saved.day !== day) return createInitialState(day);
  saved.stats ||= createInitialState(day).stats;
  saved.claimed ||= {};
  saved.daily ||= pickDailyMissions(day);
  return saved;
}

export function saveQuestState(state) {
  localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state));
}

export function getQuestState() {
  const state = loadQuestState();
  saveQuestState(state);
  return state;
}

function addCounter(obj, key, amount = 1) {
  obj[key] = Number(obj[key] || 0) + amount;
}

export function recordQuestCatch(event = {}) {
  const state = getQuestState();
  const bug = event.bug || {};
  const grade = event.grade || {};
  const judge = event.judge || '';

  state.stats.catchTotal += 1;
  state.stats.dailyCatch += 1;

  if (judge === 'PERFECT') state.stats.perfectCatch += 1;
  if ((grade.pts || 0) >= 56) state.stats.rareCatch += 1;
  if ((grade.pts || 0) >= 32) addCounter(state.stats.gradePts, '32', 1);

  if (bug.name && !state.stats.uniqueSpecies.includes(bug.name)) {
    state.stats.uniqueSpecies.push(bug.name);
  }

  (bug.habitat || []).forEach((id) => addCounter(state.stats.habitatCatch, id, 1));
  if ((bug.name || '').includes('나비')) addCounter(state.stats.bugFamily, '나비', 1);

  saveQuestState(state);
  return state;
}

function progressOf(quest, state) {
  const stats = state.stats;
  if (quest.type === 'catchTotal') return stats.catchTotal;
  if (quest.type === 'dailyCatch') return stats.dailyCatch;
  if (quest.type === 'perfectCatch') return stats.perfectCatch;
  if (quest.type === 'rareCatch') return stats.rareCatch;
  if (quest.type === 'uniqueSpecies') return stats.uniqueSpecies.length;
  if (quest.type === 'habitatCatch') return Number(stats.habitatCatch[quest.habitat] || 0);
  if (quest.type === 'bugFamily') return Number(stats.bugFamily[quest.keyword] || 0);
  if (quest.type === 'gradePts') return Number(stats.gradePts[String(quest.minPts)] || 0);
  return 0;
}

function questCard(quest, state) {
  const value = Math.min(progressOf(quest, state), quest.target);
  const pct = Math.round((value / quest.target) * 100);
  const done = value >= quest.target;
  const claimed = !!state.claimed[quest.id];
  return `<article class="questCard ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}">
    <div class="questTop"><b>${quest.title}</b><span>${claimed ? '수령완료' : done ? '완료' : '진행중'}</span></div>
    <p>${quest.desc}</p>
    <div class="questBar"><i style="width:${pct}%"></i></div>
    <div class="questBottom"><em>${value}/${quest.target}</em><button data-quest-id="${quest.id}" ${done && !claimed ? '' : 'disabled'}>+${quest.reward} 연구별</button></div>
  </article>`;
}

export function renderQuestHTML() {
  const state = getQuestState();
  const daily = state.daily.map((q) => questCard(q, state)).join('');
  const main = MAIN_QUESTS.map((q) => questCard(q, state)).join('');
  return `<div class="questHeader"><h2>퀘스트</h2><div>${state.day}</div></div>
    <style>
      .questHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.questHeader h2{margin:0}.questHeader div{font-size:12px;font-weight:1000;color:#0f6f56}
      .questSection{margin:14px 0 8px;font-size:13px;font-weight:1000;color:#17231f}.questCard{padding:12px;margin:9px 0;border-radius:18px;background:linear-gradient(135deg,#fff,#f2fff8);box-shadow:0 8px 18px #0001;border:1px solid #0000000d}.questCard.done{border-color:#43d96b88}.questCard.claimed{opacity:.64;filter:grayscale(.25)}
      .questTop{display:flex;justify-content:space-between;gap:8px}.questTop b{font-size:15px}.questTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#0bbf831d;color:#087653}.questCard p{margin:7px 0;color:#0009;font-size:12px;font-weight:800}.questBar{height:10px;background:#0001;border-radius:999px;overflow:hidden}.questBar i{display:block;height:100%;background:linear-gradient(120deg,#82f7c1,#6bb2ff,#a573ed);border-radius:999px}.questBottom{display:flex;align-items:center;justify-content:space-between;margin-top:8px}.questBottom em{font-style:normal;font-weight:1000}.questBottom button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.questBottom button:disabled{opacity:.35}
    </style>
    <div class="questSection">일일미션</div>${daily}
    <div class="questSection">메인 퀘스트</div>${main}`;
}

export function claimQuestReward(id, points = 0) {
  const state = getQuestState();
  const quest = [...MAIN_QUESTS, ...state.daily].find((q) => q.id === id);
  if (!quest || state.claimed[id]) return { ok: false, points };
  if (progressOf(quest, state) < quest.target) return { ok: false, points };
  state.claimed[id] = true;
  saveQuestState(state);
  return { ok: true, points: points + quest.reward, reward: quest.reward, title: quest.title };
}
