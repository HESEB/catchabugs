const LEGENDARY_KEY = 'catchabugs.legendary.v2';

const LEGENDARIES = Object.freeze([
  {
    id: 'golden-stag',
    name: '황금왕사슴벌레',
    emoji: '🪲',
    grade: 'LEGEND',
    region: '숲',
    story: '오래된 나무 수액 근처에서 금빛 갑각이 번쩍였다는 기록이 있다.',
    hint: '숲 지역의 오래된 나무와 수액 흔적 근처에서 목격 기록이 많다.',
  },
  {
    id: 'moon-firefly',
    name: '달빛반딧불이',
    emoji: '✨',
    grade: 'LEGEND',
    region: '강가',
    story: '밤빛이 내려앉은 강가 위로 작은 별 하나가 떠올랐다는 관찰 기록.',
    hint: '밤 시간대 강가에서 발광 신호가 강해질 때 기록 가능성이 높다.',
  },
  {
    id: 'blue-emperor',
    name: '청제왕잠자리',
    emoji: '🦋',
    grade: 'LEGEND',
    region: '초원',
    story: '바람이 갈라지는 순간, 푸른 날개가 하늘을 베고 지나갔다는 전설.',
    hint: '바람이 부는 초원에서 빠른 직선 신호로 기록된다.',
  },
  {
    id: 'diamond-morpho',
    name: '다이아모르포나비',
    emoji: '💎',
    grade: 'MYTH',
    region: '초원/숲',
    story: '햇빛을 받으면 날개 표면이 보석처럼 빛나는 환상의 나비.',
    hint: '맑은 날 숲과 초원의 경계에서 목격담이 남아 있다.',
  },
]);

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadLegendary() { return safeParse(localStorage.getItem(LEGENDARY_KEY)) || { noted: {} }; }
function saveLegendary(state) { localStorage.setItem(LEGENDARY_KEY, JSON.stringify(state)); }

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function progressPercent() {
  const state = loadLegendary();
  const noted = LEGENDARIES.filter((item) => state.noted[item.id]).length;
  return { noted, total: LEGENDARIES.length, percent: Math.round((noted / LEGENDARIES.length) * 100) };
}

function markLegendary(id) {
  const item = LEGENDARIES.find((legend) => legend.id === id);
  if (!item) return false;
  const state = loadLegendary();
  state.noted[id] = { at: new Date().toLocaleString('ko-KR') };
  saveLegendary(state);
  toast(`${item.emoji} ${item.name} 전설 기록 추가`);
  return true;
}

function renderLegendaryList() {
  const state = loadLegendary();
  const p = progressPercent();
  const cards = LEGENDARIES.map((item) => {
    const noted = !!state.noted[item.id];
    return `<article class="legendCard ${noted ? 'owned' : 'seen'}">
      <div class="legendIcon">${item.emoji}</div>
      <div class="legendBody">
        <div class="legendTop"><b>${item.name}</b><span>${noted ? '기록완료' : item.grade}</span></div>
        <p>${item.story}</p>
        <small>서식 기록: ${item.region} · ${item.hint}</small>
        <div class="legendActions"><button data-legend-note="${item.id}" ${noted ? 'disabled' : ''}>${noted ? '도감 기록됨' : '도감에 기록'}</button></div>
      </div>
    </article>`;
  }).join('');
  return `<div class="legendHeader"><h2>전설 곤충 도감</h2><div>${p.noted}/${p.total} · ${p.percent}%</div></div>
    <style>
      .legendHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.legendHeader h2{margin:0}.legendHeader div{font-size:12px;font-weight:1000;color:#7b4dff}.legendIntro,.legendCard{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f7f1ff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.legendIntro b{font-size:15px}.legendIntro p{margin:7px 0 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.legendCard{display:flex;gap:12px;align-items:center}.legendCard.owned{border-color:#ffd166aa;box-shadow:0 8px 24px #ffd16633}.legendIcon{width:56px;height:56px;flex:0 0 56px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.legendBody{flex:1;min-width:0}.legendTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.legendTop b{font-size:15px}.legendTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#7b4dff18;color:#5c2fe0}.legendBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.legendBody small{display:block;color:#0008;font-size:11px;font-weight:900}.legendActions{display:flex;gap:8px;margin-top:10px}.legendActions button{flex:1;border:0;border-radius:13px;padding:10px;font-weight:1000;background:#07111e;color:white}.legendActions button:disabled{opacity:.42;filter:grayscale(.4)}
    </style>
    <div class="legendIntro"><b>전설 곤충 기록</b><p>전설 곤충은 일반 채집 대상이 아니라 도감에 별도 기록되는 환상종입니다. 탐험 기록과 세계관 수집 요소로 관리합니다.</p></div>
    ${cards}`;
}

function openLegendaryList() {
  openModal(renderLegendaryList());
  document.querySelectorAll('[data-legend-note]').forEach((button) => {
    button.onclick = () => {
      if (markLegendary(button.dataset.legendNote)) openLegendaryList();
    };
  });
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
}

document.addEventListener('DOMContentLoaded', initLegendary);
setTimeout(initLegendary, 0);
