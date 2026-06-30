import { BUGS } from './data/bugs.js';

const CORE_SAVE_KEY = 'catchabugs.core.v2';
const DEX_REWARD_KEY = 'catchabugs.dexReward.v1';

const DEX_REWARDS = Object.freeze([
  { id: 'dex-30', title: '도감 30% 달성', desc: '곤충 도감 30% 이상 기록', percent: 30, reward: 200 },
  { id: 'dex-50', title: '도감 50% 달성', desc: '곤충 도감 절반 이상 기록', percent: 50, reward: 400 },
  { id: 'dex-100', title: '도감 완성', desc: '현재 등록된 모든 곤충 기록', percent: 100, reward: 900 },
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
  localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(core));
}

function loadDexRewardState() {
  return safeParse(localStorage.getItem(DEX_REWARD_KEY)) || { claimed: {} };
}

function saveDexRewardState(state) {
  localStorage.setItem(DEX_REWARD_KEY, JSON.stringify(state));
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function dexProgress() {
  const core = loadCore();
  const caught = core.caught || {};
  const found = BUGS.filter((bug) => {
    const rec = caught[bug.name];
    if (typeof rec === 'number') return rec > 0;
    return Number(rec?.count || 0) > 0;
  }).length;
  const total = BUGS.length || 1;
  const percent = Math.floor((found / total) * 100);
  return { core, found, total, percent };
}

function rewardCard(reward, progress, state) {
  const done = progress.percent >= reward.percent;
  const claimed = !!state.claimed[reward.id];
  const pct = Math.min(100, Math.round((progress.percent / reward.percent) * 100));
  return `<article class="dexRewardCard ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}">
    <div class="dexRewardTop"><b>${reward.title}</b><span>${claimed ? '수령완료' : done ? '수령가능' : '진행중'}</span></div>
    <p>${reward.desc}</p>
    <div class="dexRewardBar"><i style="width:${pct}%"></i></div>
    <div class="dexRewardBottom"><em>${progress.percent}% / ${reward.percent}%</em><button data-dex-reward-id="${reward.id}" ${done && !claimed ? '' : 'disabled'}>+${reward.reward} 연구별</button></div>
  </article>`;
}

function renderDexRewardHTML() {
  const progress = dexProgress();
  const state = loadDexRewardState();
  const cards = DEX_REWARDS.map((reward) => rewardCard(reward, progress, state)).join('');
  return `<div class="dexRewardHeader"><h2>도감 보상</h2><div>${progress.found}/${progress.total} · ${progress.percent}%</div></div>
    <style>
      .dexRewardHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.dexRewardHeader h2{margin:0}.dexRewardHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.dexRewardCard{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f4fff9);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.dexRewardCard.done{border-color:#82f7c1aa;box-shadow:0 8px 22px #82f7c122}.dexRewardCard.claimed{opacity:.64;filter:grayscale(.25)}.dexRewardTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.dexRewardTop b{font-size:15px}.dexRewardTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#0bbf831d;color:#087653}.dexRewardCard p{margin:7px 0;color:#0009;font-size:12px;font-weight:800}.dexRewardBar{height:10px;background:#0001;border-radius:999px;overflow:hidden}.dexRewardBar i{display:block;height:100%;background:linear-gradient(120deg,#82f7c1,#6bb2ff,#a573ed);border-radius:999px}.dexRewardBottom{display:flex;align-items:center;justify-content:space-between;margin-top:8px}.dexRewardBottom em{font-style:normal;font-weight:1000}.dexRewardBottom button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.dexRewardBottom button:disabled{opacity:.35}
    </style>${cards}`;
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function claimDexReward(id) {
  const progress = dexProgress();
  const state = loadDexRewardState();
  const reward = DEX_REWARDS.find((item) => item.id === id);
  if (!reward || state.claimed[id] || progress.percent < reward.percent) return false;

  progress.core.points = Number(progress.core.points || 0) + reward.reward;
  progress.core.savedAt = new Date().toISOString();
  state.claimed[id] = true;

  saveCore(progress.core);
  saveDexRewardState(state);

  const pointsNode = $('#pt');
  if (pointsNode) pointsNode.textContent = progress.core.points;
  toast(`도감 보상 +${reward.reward} 연구별`);
  return true;
}

function openDexReward() {
  openModal(renderDexRewardHTML());
  document.querySelectorAll('[data-dex-reward-id]').forEach((button) => {
    button.onclick = () => {
      if (claimDexReward(button.dataset.dexRewardId)) openDexReward();
    };
  });
}

function ensureDexRewardButton() {
  const bottom = $('.bottom');
  if (!bottom || $('#openDexReward')) return;
  const button = document.createElement('button');
  button.id = 'openDexReward';
  button.className = 'mini';
  button.textContent = '보상';
  const quest = $('#openQuest');
  bottom.insertBefore(button, quest || null);
  button.onclick = openDexReward;
}

function initDexReward() {
  ensureDexRewardButton();
}

document.addEventListener('DOMContentLoaded', initDexReward);
setTimeout(initDexReward, 0);
