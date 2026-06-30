const CORE_SAVE_KEY = 'catchabugs.core.v2';
const LAB_STORAGE_KEY = 'catchabugs.lab.v1';

const NPCS = Object.freeze([
  {
    id: 'prof-pumpkin',
    icon: '👨‍🔬',
    name: '호박사',
    role: '곤충 연구소장',
    lines: [
      '레이더 신호가 안정되고 있어. 이제 진짜 연구소답게 굴러가겠군.',
      '같은 곤충이라도 시간과 날씨에 따라 움직임이 달라질 수 있어.',
      '도감은 단순 수집이 아니야. 네 탐험 기록 그 자체지.',
      '연구별을 모으면 탐험 장비를 조금씩 개선할 수 있어.',
    ],
  },
  {
    id: 'assistant-maru',
    icon: '🧑‍💻',
    name: '마루',
    role: '레이더 엔지니어',
    lines: [
      '레이더는 가까운 신호부터 정렬해 보여줘. 방향보다 거리 변화를 먼저 봐.',
      '나침반이 켜지면 화면 회전 기준이 바뀌니까, 드래그는 이동만 생각하면 돼.',
      '신호가 갑자기 움직이면 겁 많은 곤충일 가능성이 있어.',
    ],
  },
  {
    id: 'ranger-bomi',
    icon: '🧭',
    name: '보미',
    role: '필드 레인저',
    lines: [
      '숲, 초원, 강가, 도시마다 자주 보이는 곤충이 달라.',
      '비가 오면 물가 근처를 살펴봐. 평소보다 좋은 단서가 나올 수 있어.',
      '밤에는 반짝이는 신호를 놓치지 마.',
    ],
  },
]);

const UPGRADES = Object.freeze([
  {
    id: 'radar-sensitivity',
    icon: '📡',
    name: '레이더 감도',
    desc: '생태 신호를 더 또렷하게 읽는 연구.',
    baseCost: 120,
    max: 5,
    effect: (level) => `신호 해석 Lv.${level}`,
  },
  {
    id: 'net-balance',
    icon: '🕸️',
    name: '채집망 밸런스',
    desc: '채집 타이밍을 안정화하는 연구.',
    baseCost: 150,
    max: 5,
    effect: (level) => `채집 안정 Lv.${level}`,
  },
  {
    id: 'field-note',
    icon: '📒',
    name: '필드 노트',
    desc: '도감과 탐험 기록을 정리하는 연구.',
    baseCost: 100,
    max: 4,
    effect: (level) => `기록 보정 Lv.${level}`,
  },
  {
    id: 'weather-reading',
    icon: '🌦️',
    name: '날씨 판독',
    desc: '시간·날씨 변화에 따른 곤충 습성을 분석한다.',
    baseCost: 180,
    max: 3,
    effect: (level) => `환경 분석 Lv.${level}`,
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
  const pointsNode = $('#pt');
  if (pointsNode) pointsNode.textContent = Number(core.points || 0);
}

function loadLab() {
  const saved = safeParse(localStorage.getItem(LAB_STORAGE_KEY));
  return saved || { talked: {}, upgrades: {}, lastNpc: 'prof-pumpkin' };
}

function saveLab(state) {
  localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(state));
}

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function openModal(html) {
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = html;
  modal.style.display = 'block';
}

function randomLine(npc) {
  const index = Math.floor(Math.random() * npc.lines.length);
  return npc.lines[index];
}

function upgradeCost(upgrade, level) {
  return Math.round(upgrade.baseCost * (1 + level * 0.65));
}

function labLevelTotal(lab) {
  return Object.values(lab.upgrades || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function npcCard(npc, lab) {
  const talked = Number(lab.talked?.[npc.id] || 0);
  return `<article class="labNpcCard">
    <div class="labNpcIcon">${npc.icon}</div>
    <div class="labNpcBody">
      <div class="labTop"><b>${npc.name}</b><span>${npc.role}</span></div>
      <p>${randomLine(npc)}</p>
      <small>대화 ${talked}회</small>
      <button data-npc-id="${npc.id}">대화하기</button>
    </div>
  </article>`;
}

function upgradeCard(upgrade, lab, core) {
  const level = Number(lab.upgrades?.[upgrade.id] || 0);
  const maxed = level >= upgrade.max;
  const cost = upgradeCost(upgrade, level);
  const affordable = Number(core.points || 0) >= cost;
  const pct = Math.round((level / upgrade.max) * 100);
  return `<article class="labUpgradeCard ${maxed ? 'maxed' : ''}">
    <div class="labUpgradeIcon">${upgrade.icon}</div>
    <div class="labUpgradeBody">
      <div class="labTop"><b>${upgrade.name}</b><span>${maxed ? 'MAX' : `Lv.${level}/${upgrade.max}`}</span></div>
      <p>${upgrade.desc}</p>
      <div class="labBar"><i style="width:${pct}%"></i></div>
      <small>${upgrade.effect(level)}</small>
      <button data-upgrade-id="${upgrade.id}" ${!maxed && affordable ? '' : 'disabled'}>${maxed ? '완료' : `${cost} 연구별`}</button>
    </div>
  </article>`;
}

function labHTML() {
  const core = loadCore();
  const lab = loadLab();
  const npcHtml = NPCS.map((npc) => npcCard(npc, lab)).join('');
  const upgradeHtml = UPGRADES.map((upgrade) => upgradeCard(upgrade, lab, core)).join('');
  const total = labLevelTotal(lab);
  return `<div class="labHeader"><h2>연구소</h2><div>연구별 ${Number(core.points || 0)}</div></div>
    <style>
      .labHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.labHeader h2{margin:0}.labHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.labSummary{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f4fff9);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.labSummary b{font-size:15px}.labSummary p{margin:7px 0 0;color:#0009;font-size:12px;font-weight:800}.labSection{margin:14px 0 8px;font-size:13px;font-weight:1000;color:#17231f}.labNpcCard,.labUpgradeCard{display:flex;gap:12px;align-items:center;padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.labNpcIcon,.labUpgradeIcon{width:54px;height:54px;flex:0 0 54px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.labNpcBody,.labUpgradeBody{flex:1;min-width:0}.labTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.labTop b{font-size:15px}.labTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#0bbf831d;color:#087653}.labNpcBody p,.labUpgradeBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.labNpcBody small,.labUpgradeBody small{display:block;color:#0008;font-size:11px;font-weight:900;margin:4px 0 8px}.labNpcBody button,.labUpgradeBody button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.labNpcBody button:disabled,.labUpgradeBody button:disabled{opacity:.35}.labBar{height:10px;background:#0001;border-radius:999px;overflow:hidden;margin:7px 0}.labBar i{display:block;height:100%;background:linear-gradient(120deg,#82f7c1,#6bb2ff,#a573ed);border-radius:999px}.labUpgradeCard.maxed{border-color:#82f7c1aa;box-shadow:0 8px 22px #82f7c122}
    </style>
    <div class="labSummary"><b>호박사의 곤충 연구소</b><p>연구 레벨 총합 ${total}. NPC와 대화하고 연구별로 탐험 장비를 개선할 수 있습니다.</p></div>
    <div class="labSection">NPC</div>${npcHtml}
    <div class="labSection">연구 업그레이드</div>${upgradeHtml}`;
}

function openLab() {
  openModal(labHTML());
  document.querySelectorAll('[data-npc-id]').forEach((button) => {
    button.onclick = () => {
      const lab = loadLab();
      const npc = NPCS.find((item) => item.id === button.dataset.npcId);
      if (!npc) return;
      lab.talked[npc.id] = Number(lab.talked[npc.id] || 0) + 1;
      lab.lastNpc = npc.id;
      saveLab(lab);
      toast(`${npc.icon} ${npc.name}: ${randomLine(npc)}`);
      openLab();
    };
  });
  document.querySelectorAll('[data-upgrade-id]').forEach((button) => {
    button.onclick = () => {
      const core = loadCore();
      const lab = loadLab();
      const upgrade = UPGRADES.find((item) => item.id === button.dataset.upgradeId);
      if (!upgrade) return;
      const level = Number(lab.upgrades[upgrade.id] || 0);
      const cost = upgradeCost(upgrade, level);
      if (level >= upgrade.max || Number(core.points || 0) < cost) return;
      core.points = Number(core.points || 0) - cost;
      lab.upgrades[upgrade.id] = level + 1;
      saveCore(core);
      saveLab(lab);
      toast(`${upgrade.icon} ${upgrade.name} Lv.${level + 1}`);
      openLab();
    };
  });
}

function ensureLabButton() {
  const bottom = $('.bottom');
  if (!bottom || $('#openLab')) return;
  const button = document.createElement('button');
  button.id = 'openLab';
  button.className = 'mini';
  button.textContent = '연구소';
  bottom.insertBefore(button, $('#openSave') || null);
  button.onclick = openLab;
}

function initLab() {
  ensureLabButton();
}

document.addEventListener('DOMContentLoaded', initLab);
setTimeout(initLab, 0);
