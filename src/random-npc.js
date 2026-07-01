const NPC_SAVE_KEY = 'catchabugs.randomNpc.v1';
const MAX_NPCS = 4;
const DESPAWN_RANGE = 980;

const NPC_TYPES = [
  {
    id: 'wanderer', icon: '🧢', name: '떠돌이 채집가', role: '힌트', visible: true,
    lines: ['숲에서는 수액 근처를 천천히 살펴봐.', '미확인 신호는 가끔 곤충이 아닐 때도 있어.', '레이더에 잡히는 방향보다 거리를 먼저 봐.'],
    reward: { points: 5, log: '떠돌이 채집가에게서 힌트를 들었다.' }
  },
  {
    id: 'merchant', icon: '🧑‍💼', name: '떠돌이 상인', role: '상점 소식', visible: true,
    lines: ['오늘은 희귀 알람기가 잘 팔리더라.', '배낭에 있는 설치물을 잊지 말고 사용해.', '웜칩은 아껴두면 좋은 장비를 살 수 있어.'],
    reward: { points: 3, log: '떠돌이 상인을 만났다.' }
  },
  {
    id: 'child', icon: '👦', name: '곤충 좋아하는 아이', role: '작은 부탁', visible: true,
    lines: ['나비를 찾고 있어! 초원 쪽에 많대.', '반짝이는 곤충을 보면 꼭 알려줘!', '작은 신호도 놓치지 마.'],
    reward: { points: 4, log: '아이에게 곤충 이야기를 들었다.' }
  },
  {
    id: 'researcher', icon: '👨‍🔬', name: '현장 연구원', role: '분석', visible: false,
    lines: ['이 신호는 곤충이 아니라 조사원 신호였어.', '희귀 신호와 사람의 장비 신호는 가끔 비슷하게 보여.', '방금 신호는 기록 가치가 있어.'],
    reward: { points: 8, log: '미확인 신호에서 현장 연구원을 발견했다.' }
  },
  {
    id: 'tourist', icon: '📸', name: '곤충 사진가', role: '사진', visible: false,
    lines: ['사진 찍으러 왔는데 길을 잃었어.', '흰 나비가 강가 쪽으로 날아갔어.', '이 주변 풍경은 사진으로 남길 만해.'],
    reward: { points: 6, log: '미확인 신호에서 곤충 사진가를 만났다.' }
  },
  {
    id: 'collector', icon: '🧺', name: '표본 수집가', role: '교환', visible: false,
    lines: ['나는 곤충 신호처럼 보이는 장비를 들고 다녀.', '수집가는 늘 조용히 움직이지.', '희귀한 표본을 찾으면 다시 만나자.'],
    reward: { points: 7, log: '미확인 신호에서 표본 수집가를 만났다.' }
  }
];

function $(selector) { return document.querySelector(selector); }
function gameApi() { return window.CATCHABUGS_GAME || null; }
function nowText() { return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1400);
}
function randomItem(list) { return list[Math.floor(Math.random() * list.length)]; }
function player() { return gameApi()?.getPlayer?.() || { x: 0, y: 0, regionId: 'forest' }; }
function distance(a, b) { return Math.hypot(Number(a.x || 0) - Number(b.x || 0), Number(a.y || 0) - Number(b.y || 0)); }
function loadState() {
  try { return JSON.parse(localStorage.getItem(NPC_SAVE_KEY)) || { met: {}, count: 0 }; }
  catch { return { met: {}, count: 0 }; }
}
function saveState(state) { localStorage.setItem(NPC_SAVE_KEY, JSON.stringify(state)); }

const state = {
  seq: 0,
  npcs: [],
  nextSpawnAt: 0,
  lastPlayerX: 0,
  lastPlayerY: 0,
};

function injectStyle() {
  if ($('#randomNpcStyle')) return;
  const style = document.createElement('style');
  style.id = 'randomNpcStyle';
  style.textContent = `
    #npcLayer{position:absolute;inset:0;z-index:12;pointer-events:none;overflow:hidden}
    .fieldNpc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:auto;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:3px;filter:drop-shadow(0 8px 12px #0007)}
    .fieldNpc .npcIcon{width:44px;height:44px;border-radius:17px;background:#fffffff0;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 2px #fff,0 0 0 2px #07111e22}
    .fieldNpc .npcLabel{padding:4px 8px;border-radius:999px;background:#07111ee8;color:white;font-size:10px;font-weight:1000;white-space:nowrap;max-width:118px;overflow:hidden;text-overflow:ellipsis}
    .fieldNpc.hiddenSignal .npcIcon{background:#f7fbfff0;color:#07111e;font-size:30px;animation:npcPulse 1.25s ease-in-out infinite}
    .fieldNpc.hiddenSignal .npcLabel{background:#ffffffeb;color:#07111e}
    .fieldNpc.near .npcIcon{box-shadow:inset 0 0 0 2px #fff,0 0 18px #9af7ff,0 0 0 3px #9af7ff88}
    .npcRadarBlip{position:absolute;width:10px;height:10px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 0 10px #fff,0 0 16px #9af7ff;z-index:18;pointer-events:none}
    .npcRadarBlip.hidden{background:#f7fbff;border:2px solid #a573ed;box-sizing:border-box}
    .npcSheet{padding:4px 0}.npcTop{display:flex;gap:12px;align-items:center;margin:4px 0 12px}.npcFace{width:64px;height:64px;border-radius:22px;background:linear-gradient(135deg,#fff,#eef8ff);display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.npcName b{font-size:22px}.npcName small{display:block;margin-top:4px;font-size:12px;font-weight:1000;color:#0f6f56}.npcTalk{padding:13px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;font-size:13px;font-weight:900;color:#000b;line-height:1.5}.npcActions{display:grid;gap:8px;margin-top:12px}.npcActions button{border:0;border-radius:14px;background:#07111e;color:white;padding:12px;font-weight:1000}.npcActions button.secondary{background:#00000010;color:#07111e}
    @keyframes npcPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 #fff0}50%{transform:scale(1.08);box-shadow:0 0 18px #fff}}
  `;
  document.head.appendChild(style);
}
function ensureLayer() {
  let layer = $('#npcLayer');
  if (layer) return layer;
  const game = $('#game');
  if (!game) return null;
  layer = document.createElement('div');
  layer.id = 'npcLayer';
  game.appendChild(layer);
  return layer;
}

function createNpc(kind = null, reason = 'natural') {
  const p = player();
  const pool = kind ? NPC_TYPES.filter((npc) => npc.visible === (kind === 'visible')) : NPC_TYPES;
  const type = randomItem(pool.length ? pool : NPC_TYPES);
  const angle = Math.random() * Math.PI * 2;
  const dist = 190 + Math.random() * 420;
  return {
    id: `npc-${Date.now()}-${state.seq++}`,
    typeId: type.id,
    icon: type.icon,
    name: type.name,
    role: type.role,
    visible: !!type.visible,
    revealed: !!type.visible,
    wx: p.x + Math.cos(angle) * dist,
    wy: p.y + Math.sin(angle) * dist,
    drift: Math.random() * Math.PI * 2,
    spawnedAt: Date.now(),
    reason,
  };
}
function findType(npc) { return NPC_TYPES.find((type) => type.id === npc.typeId) || NPC_TYPES[0]; }
function maybeSpawn(force = false) {
  const p = player();
  const moved = distance({ x: state.lastPlayerX, y: state.lastPlayerY }, p);
  state.lastPlayerX = p.x;
  state.lastPlayerY = p.y;
  if (!force && Date.now() < state.nextSpawnAt && moved < 140) return;
  state.nextSpawnAt = Date.now() + 5000 + Math.random() * 7000;
  state.npcs = state.npcs.filter((npc) => distance({ x: npc.wx, y: npc.wy }, p) < DESPAWN_RANGE && Date.now() - npc.spawnedAt < 1000 * 90);
  if (state.npcs.length >= MAX_NPCS) return;
  const roll = Math.random();
  if (!force && roll > 0.38) return;
  const hiddenCount = state.npcs.filter((npc) => !npc.revealed).length;
  const visibleCount = state.npcs.filter((npc) => npc.revealed).length;
  const kind = hiddenCount < 2 && Math.random() < 0.45 ? 'hidden' : 'visible';
  if (kind === 'visible' && visibleCount >= 3) return;
  state.npcs.push(createNpc(kind, force ? 'debug' : 'natural'));
}
function moveNpcs() {
  state.npcs.forEach((npc) => {
    npc.drift += 0.025 + Math.random() * 0.015;
    npc.wx += Math.cos(npc.drift) * 0.9;
    npc.wy += Math.sin(npc.drift) * 0.9;
  });
}
function screenPoint(npc) {
  const p = player();
  return { x: npc.wx - p.x, y: npc.wy - p.y, d: distance({ x: npc.wx, y: npc.wy }, p) };
}
function openNpc(npc) {
  const type = findType(npc);
  const hiddenWas = !npc.revealed;
  npc.revealed = true;
  npc.visible = true;
  const line = randomItem(type.lines);
  const save = loadState();
  save.met[type.id] = (save.met[type.id] || 0) + 1;
  save.count = Number(save.count || 0) + 1;
  saveState(save);
  const reward = type.reward || { points: 3, log: `${type.name}을 만났다.` };
  if (gameApi()?.addPoints) gameApi().addPoints(Number(reward.points || 0));
  if (gameApi()?.addLog) gameApi().addLog(reward.log || `${type.name}을 만났다.`, type.icon);
  toast(hiddenWas ? `미확인 신호는 ${type.name}이었다!` : `${type.name}을 만났다.`);
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = `<div class="npcSheet"><div class="npcTop"><div class="npcFace">${type.icon}</div><div class="npcName"><b>${type.name}</b><small>${hiddenWas ? '미확인 신호에서 발견' : type.role} · ${nowText()}</small></div></div><div class="npcTalk">“${line}”</div><div class="npcTalk">${hiddenWas ? '처음에는 곤충 신호처럼 보였지만, 가까이 조사해보니 NPC였습니다.' : '필드에서 만난 NPC입니다.'}<br>보상: 🪱 웜칩 +${Number(reward.points || 0)}</div><div class="npcActions"><button id="npcCloseBtn">게임으로</button><button class="secondary" id="npcHintBtn">한마디 더 듣기</button></div></div>`;
  modal.style.display = 'block';
  $('#npcCloseBtn')?.addEventListener('click', () => { modal.style.display = 'none'; });
  $('#npcHintBtn')?.addEventListener('click', () => {
    const talk = document.querySelector('.npcTalk');
    if (talk) talk.textContent = `“${randomItem(type.lines)}”`;
  });
}
function renderNpcs() {
  injectStyle();
  const layer = ensureLayer();
  if (!layer || $('#game')?.style.display === 'none') return;
  layer.innerHTML = '';
  state.npcs.forEach((npc) => {
    const pos = screenPoint(npc);
    if (pos.d > 760) return;
    const clueRange = npc.revealed ? 720 : 260;
    if (pos.d > clueRange) return;
    const node = document.createElement('button');
    node.type = 'button';
    const near = pos.d < (npc.revealed ? 120 : 105);
    node.className = `fieldNpc ${npc.revealed ? 'visibleNpc' : 'hiddenSignal'} ${near ? 'near' : ''}`;
    node.style.transform = `translate(calc(50% + ${pos.x}px),calc(50% + ${pos.y}px)) translate(-50%,-50%) scale(${Math.max(.65, 1.16 - pos.d / 720)})`;
    node.innerHTML = npc.revealed ? `<div class="npcIcon">${npc.icon}</div><div class="npcLabel">${near ? '대화 가능' : npc.name}</div>` : `<div class="npcIcon">?</div><div class="npcLabel">조사 필요 · 생태 신호</div>`;
    node.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!near) {
        toast(npc.revealed ? 'NPC에게 더 가까이 가야 해.' : '미확인 신호에 더 가까이 가야 해.');
        return;
      }
      openNpc(npc);
    };
    layer.appendChild(node);
  });
}
function renderNpcRadar() {
  const screen = $('#radarScreen');
  if (!screen) return;
  screen.querySelectorAll('.npcRadarBlip').forEach((node) => node.remove());
  const range = 620;
  const radius = 48;
  state.npcs.forEach((npc) => {
    const pos = screenPoint(npc);
    if (pos.d > range) return;
    const blip = document.createElement('div');
    blip.className = `npcRadarBlip ${npc.revealed ? 'visible' : 'hidden'}`;
    blip.style.left = `${50 + (pos.x / range) * radius}%`;
    blip.style.top = `${50 + (pos.y / range) * radius}%`;
    blip.title = npc.revealed ? npc.name : '미확인 생태 신호';
    screen.appendChild(blip);
  });
}
function tick() {
  maybeSpawn(false);
  moveNpcs();
  renderNpcs();
  renderNpcRadar();
  requestAnimationFrame(tick);
}
function init() {
  injectStyle();
  maybeSpawn(true);
  setTimeout(() => maybeSpawn(true), 1200);
  tick();
}

window.CATCHABUGS_RANDOM_NPC = {
  spawnVisible(){ state.npcs.push(createNpc('visible', 'manual')); return state.npcs.length; },
  spawnHidden(){ state.npcs.push(createNpc('hidden', 'manual')); return state.npcs.length; },
  list(){ return state.npcs.slice(); },
  clear(){ state.npcs = []; },
};

document.addEventListener('DOMContentLoaded', () => setTimeout(init, 900));
setTimeout(init, 1600);
