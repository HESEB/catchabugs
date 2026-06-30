const CORE_SAVE_KEY = 'catchabugs.core.v2';
const LEGENDARY_KEY = 'catchabugs.legendary.v1';

const LEGENDARIES = Object.freeze([
  {
    id: 'golden-stag',
    name: '황금왕사슴벌레',
    emoji: '🪲',
    grade: 'LEGEND',
    pts: 450,
    region: '숲',
    story: '오래된 나무 수액 근처에서 금빛 갑각이 번쩍였다.',
    hint: '중앙 타이밍에 가까울수록 포획 확률이 올라간다.',
  },
  {
    id: 'moon-firefly',
    name: '달빛반딧불이',
    emoji: '✨',
    grade: 'LEGEND',
    pts: 420,
    region: '강가',
    story: '밤빛이 내려앉은 강가 위로 작은 별 하나가 떠올랐다.',
    hint: '너무 빠르게 누르면 빛이 흩어진다.',
  },
  {
    id: 'blue-emperor',
    name: '청제왕잠자리',
    emoji: '🦋',
    grade: 'LEGEND',
    pts: 430,
    region: '초원',
    story: '바람이 갈라지는 순간, 푸른 날개가 하늘을 베고 지나갔다.',
    hint: '게이지가 중앙을 스치는 순간을 노려라.',
  },
]);

function $(selector) {
  return document.querySelector(selector);
}

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function loadCore() {
  return safeParse(localStorage.getItem(CORE_SAVE_KEY)) || { points: 0, caught: {}, player: { x: 0, y: 0 } };
}

function saveCore(core) {
  core.savedAt = new Date().toISOString();
  localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(core));
  const points = $('#pt');
  if (points) points.textContent = Number(core.points || 0);
}

function loadLegendary() {
  return safeParse(localStorage.getItem(LEGENDARY_KEY)) || {
    seen: {},
    caught: {},
    lastSignalAt: 0,
    pity: 0,
  };
}

function saveLegendary(state) {
  localStorage.setItem(LEGENDARY_KEY, JSON.stringify(state));
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1500);
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function pickLegendary() {
  const state = loadLegendary();
  const unowned = LEGENDARIES.filter((item) => !state.caught[item.id]);
  const pool = unowned.length ? unowned : LEGENDARIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function progressPercent() {
  const state = loadLegendary();
  const caught = LEGENDARIES.filter((item) => state.caught[item.id]).length;
  return { caught, total: LEGENDARIES.length, percent: Math.round((caught / LEGENDARIES.length) * 100) };
}

function renderLegendaryList() {
  const state = loadLegendary();
  const p = progressPercent();
  const cards = LEGENDARIES.map((item) => {
    const owned = !!state.caught[item.id];
    const seen = !!state.seen[item.id];
    return `<article class="legendCard ${owned ? 'owned' : seen ? 'seen' : 'locked'}">
      <div class="legendIcon">${owned || seen ? item.emoji : '？'}</div>
      <div class="legendBody">
        <div class="legendTop"><b>${owned || seen ? item.name : '미확인 전설 신호'}</b><span>${owned ? '포획완료' : seen ? '목격' : '미발견'}</span></div>
        <p>${owned || seen ? item.story : '강한 생태 신호가 아직 기록되지 않았다.'}</p>
        <small>${owned ? `보상 ${item.pts} 연구별 획득` : item.hint}</small>
      </div>
    </article>`;
  }).join('');
  return `<div class="legendHeader"><h2>전설 곤충</h2><div>${p.caught}/${p.total} · ${p.percent}%</div></div>
    <style>
      .legendHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.legendHeader h2{margin:0}.legendHeader div{font-size:12px;font-weight:1000;color:#7b4dff}.legendIntro,.legendCard{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f7f1ff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.legendIntro b{font-size:15px}.legendIntro p{margin:7px 0 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.legendCard{display:flex;gap:12px;align-items:center}.legendCard.owned{border-color:#ffd166aa;box-shadow:0 8px 24px #ffd16633}.legendCard.locked{opacity:.58;filter:grayscale(.55)}.legendIcon{width:56px;height:56px;flex:0 0 56px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.legendBody{flex:1;min-width:0}.legendTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.legendTop b{font-size:15px}.legendTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#7b4dff18;color:#5c2fe0}.legendBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.legendBody small{display:block;color:#0008;font-size:11px;font-weight:900}.legendActions{display:flex;gap:8px;margin-top:10px}.legendActions button{flex:1;border:0;border-radius:13px;padding:11px;font-weight:1000;background:#07111e;color:white}.legendGauge{height:28px;border-radius:999px;overflow:hidden;background:linear-gradient(90deg,#d64d76 0 27%,#ffd166 27% 43%,#68e2a2 43% 57%,#ffd166 57% 73%,#d64d76 73%);position:relative;margin:10px 0}.legendCursor{position:absolute;top:-4px;width:7px;height:38px;border-radius:5px;background:#111;box-shadow:0 0 0 2px white}.legendResult{text-align:center;font-weight:1000;margin:8px 0;color:#3d286b}
    </style>
    <div class="legendIntro"><b>전설 신호</b><p>탐험 중 매우 낮은 확률로 나타나는 특수 이벤트입니다. 신호가 열렸을 때 타이밍 포획에 성공하면 도감에 전설 곤충이 기록됩니다.</p><div class="legendActions"><button id="legendSignalBtn">전설 신호 조사</button></div></div>
    ${cards}`;
}

function openLegendaryList() {
  openModal(renderLegendaryList());
  const btn = $('#legendSignalBtn');
  if (btn) btn.onclick = () => openLegendaryEncounter(pickLegendary());
}

function cursorPos(startAt) {
  return (.5 + .5 * Math.sin((performance.now() - startAt) * .001 * Math.PI * 2.4)) * 100;
}

function judge(p) {
  const d = Math.abs(p - 50);
  if (d < 6) return { name: 'MYTHIC', rate: .92, bonus: 1.4 };
  if (d < 14) return { name: 'LEGEND', rate: .72, bonus: 1.15 };
  if (d < 25) return { name: 'RARE', rate: .45, bonus: 1 };
  return { name: 'LOST', rate: .18, bonus: .65 };
}

function openLegendaryEncounter(legend) {
  const state = loadLegendary();
  state.seen[legend.id] = true;
  state.lastSignalAt = Date.now();
  saveLegendary(state);
  const startAt = performance.now();
  openModal(`<div class="legendHeader"><h2>${legend.emoji} ${legend.name}</h2><div>${legend.region}</div></div>
    <style>
      .legendHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.legendHeader h2{margin:0}.legendHeader div{font-size:12px;font-weight:1000;color:#7b4dff}.legendStage{padding:14px;border-radius:24px;background:linear-gradient(135deg,#231942,#5e548e,#9f86c0);color:white;text-align:center;box-shadow:0 16px 40px #0003}.legendBig{font-size:72px;filter:drop-shadow(0 12px 20px #0006);animation:legendPulse 1s ease-in-out infinite alternate}.legendStory{font-size:13px;font-weight:900;line-height:1.45;margin:8px 0 12px}.legendGauge{height:30px;border-radius:999px;overflow:hidden;background:linear-gradient(90deg,#d64d76 0 27%,#ffd166 27% 43%,#68e2a2 43% 57%,#ffd166 57% 73%,#d64d76 73%);position:relative;margin:10px 0}.legendCursor{position:absolute;top:-4px;width:7px;height:40px;border-radius:5px;background:#111;box-shadow:0 0 0 2px white}.legendResult{text-align:center;font-weight:1000;margin:8px 0;color:white}.legendActions{display:flex;gap:8px;margin-top:10px}.legendActions button{flex:1;border:0;border-radius:13px;padding:12px;font-weight:1000;background:white;color:#231942}@keyframes legendPulse{from{transform:scale(.96)}to{transform:scale(1.06)}}
    </style>
    <div class="legendStage"><div class="legendBig">${legend.emoji}</div><div class="legendStory">${legend.story}<br>${legend.hint}</div><div class="legendGauge"><div id="legendCursor" class="legendCursor"></div></div><div id="legendResult" class="legendResult">타이밍을 맞춰라!</div><div class="legendActions"><button id="legendCatchBtn">전설 포획</button><button id="legendBackBtn">뒤로</button></div></div>`);

  let active = true;
  function animate() {
    if (!active) return;
    const p = cursorPos(startAt);
    const cur = $('#legendCursor');
    const result = $('#legendResult');
    if (cur) cur.style.left = `calc(${p}% - 3px)`;
    if (result) result.textContent = judge(p).name;
    requestAnimationFrame(animate);
  }
  animate();

  const back = $('#legendBackBtn');
  if (back) back.onclick = () => { active = false; openLegendaryList(); };
  const catchBtn = $('#legendCatchBtn');
  if (catchBtn) catchBtn.onclick = () => {
    if (!active) return;
    active = false;
    resolveLegendaryCatch(legend, judge(cursorPos(startAt)));
  };
}

function resolveLegendaryCatch(legend, result) {
  const state = loadLegendary();
  const core = loadCore();
  const pityBonus = Math.min(.18, Number(state.pity || 0) * .03);
  const success = Math.random() < result.rate + pityBonus;
  if (success) {
    const gain = Math.round(legend.pts * result.bonus);
    state.caught[legend.id] = { at: new Date().toLocaleString('ko-KR'), judge: result.name };
    state.pity = 0;
    core.points = Number(core.points || 0) + gain;
    core.caught ||= {};
    core.caught[legend.name] = {
      count: 1,
      bestGrade: legend.grade,
      bestJudge: result.name,
      bestScore: gain,
      firstSeen: new Date().toLocaleDateString('ko-KR'),
    };
    saveLegendary(state);
    saveCore(core);
    toast(`${result.name}! ${legend.name} 포획 +${gain}`);
    openModal(`<div class="legendHeader"><h2>전설 포획 성공</h2><div>+${gain}</div></div><div class="dexCard found"><div class="dexImage"><div class="dexUnknown" style="opacity:1;filter:none">${legend.emoji}</div></div><div class="dexInfo"><div class="dexTop"><b>${legend.name}</b><span>${result.name}</span></div><div class="dexMeta">${legend.story}</div><small>도감에 전설 곤충이 기록되었습니다.</small></div></div>`);
  } else {
    state.pity = Number(state.pity || 0) + 1;
    saveLegendary(state);
    toast(`${legend.name}이 도망쳤다. 다음 신호 확률 상승`);
    openModal(`<div class="legendHeader"><h2>전설 포획 실패</h2><div>${result.name}</div></div><div class="dexCard locked"><div class="dexImage"><div class="dexUnknown" style="opacity:1;filter:none">💨</div></div><div class="dexInfo"><div class="dexTop"><b>${legend.name}</b><span>도주</span></div><div class="dexMeta">강한 신호는 사라졌지만 흔적은 남았습니다.</div><small>다음 전설 포획 확률이 조금 올라갑니다.</small></div></div>`);
  }
}

function maybeSignal() {
  const state = loadLegendary();
  if (Date.now() - Number(state.lastSignalAt || 0) < 1000 * 60 * 4) return;
  const chance = .08 + Math.min(.1, Number(state.pity || 0) * .02);
  if (Math.random() < chance) {
    state.lastSignalAt = Date.now();
    saveLegendary(state);
    toast('⚡ 전설 곤충 신호가 감지됐다!');
  }
}

function ensureLegendaryButton() {
  const bottom = document.querySelector('.bottom');
  if (!bottom || $('#openLegendary')) return;
  const button = document.createElement('button');
  button.id = 'openLegendary';
  button.className = 'mini';
  button.textContent = '전설';
  bottom.insertBefore(button, $('#openAchievement') || null);
  button.onclick = openLegendaryList;
}

function initLegendary() {
  ensureLegendaryButton();
  setInterval(maybeSignal, 30000);
}

document.addEventListener('DOMContentLoaded', initLegendary);
setTimeout(initLegendary, 0);
