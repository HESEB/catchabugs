const LAB_STORAGE_KEY = 'catchabugs.lab.v2';

const UPGRADES = Object.freeze([
  { id: 'radar-sensitivity', icon: '📡', name: '레이더 감도', desc: '생태 신호를 더 또렷하게 읽는 연구.', baseCost: 40, max: 5, stat: '레이더 거리', unit: 'm', value: (level) => 30 + level * 5, effect: (level) => `레이더 거리 ${30 + level * 5}m` },
  { id: 'net-balance', icon: '🕸️', name: '채집망 밸런스', desc: '채집 타이밍을 안정화하는 연구.', baseCost: 50, max: 5, stat: '채집 성공률', unit: '%', value: (level) => 60 + level * 2, effect: (level) => `채집 성공률 +${level * 2}%` },
  { id: 'field-note', icon: '📒', name: '필드 노트', desc: '도감과 탐험 기록을 정리하는 연구.', baseCost: 35, max: 4, stat: '희귀 발견률', unit: '%', value: (level) => Number((2 + level * 0.4).toFixed(1)), effect: (level) => `희귀 발견 +${Number(level * 0.4).toFixed(1)}%` },
  { id: 'weather-reading', icon: '🌦️', name: '날씨 판독', desc: '시간·날씨 변화에 따른 곤충 습성을 분석한다.', baseCost: 60, max: 3, stat: '환경 보정', unit: '%', value: (level) => level * 5, effect: (level) => `환경 보정 +${level * 5}%` },
  { id: 'bug-hole-research', icon: '🌀', name: 'BUG HOLE 연구', desc: '귀환 이동과 거점 연결 효율을 개선한다.', baseCost: 80, max: 5, stat: 'BUG HOLE 효율', unit: '%', value: (level) => level * 5, effect: (level) => `이동/설치 효율 +${level * 5}%` },
]);

const SHOP_ITEMS = Object.freeze([
  { id: 'bug-lure', icon: '🪤', name: '벌레 유인기', desc: '30분 동안 곤충 생성량 증가.', price: 300, type: 'item' },
  { id: 'rare-alarm', icon: '🔔', name: '희귀 알람기', desc: '희귀 이상 신호를 알려주는 장비.', price: 500, type: 'item' },
  { id: 'radar-boost', icon: '📡', name: '레이더 증폭기', desc: '30분 동안 레이더 범위 증가.', price: 450, type: 'item' },
  { id: 'sap-trap', icon: '🪵', name: '수액통', desc: '숲 곤충 유인 설치물.', price: 350, type: 'item' },
  { id: 'flower-lure', icon: '🌼', name: '꽃 유인기', desc: '초원 곤충 유인 설치물.', price: 350, type: 'item' },
  { id: 'water-trap', icon: '💧', name: '수생 트랩', desc: '강가 곤충 유인 설치물.', price: 350, type: 'item' },
  { id: 'bug-light', icon: '💡', name: '곤충등', desc: '밤 시간 곤충 신호 강화.', price: 400, type: 'item' },
  { id: 'outfit-rain', icon: '🌧️', name: '레인코트', desc: '비 오는 날 채집 보정 의상.', price: 1200, type: 'gear' },
  { id: 'outfit-forest', icon: '🌲', name: '숲 탐험복', desc: '숲 지역 탐험 보정 의상.', price: 1400, type: 'gear' },
  { id: 'bag-research', icon: '🧰', name: '연구 배낭', desc: '설치물 보관에 특화된 배낭.', price: 1600, type: 'gear' },
  { id: 'net-rare', icon: '✨', name: '희귀 채집망', desc: '희귀 곤충 채집 보정 장비.', price: 1800, type: 'gear' },
]);

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function liveGame() { return window.CATCHABUGS_GAME || null; }
function economy() { return window.CATCHABUGS_ECONOMY || null; }
function getExplorerCore() { return economy()?.getExplorerCore?.() ?? 0; }
function spendExplorerCore(cost, reason) { return economy()?.spendExplorerCore?.(cost, reason) || false; }
function getWormChip() { return economy()?.getStars?.() ?? liveGame()?.getPoints?.() ?? 0; }
function spendWormChip(cost, reason) { if (getWormChip() < cost) return false; economy()?.addStars?.(-cost, reason); return true; }
function loadLab() { return safeParse(localStorage.getItem(LAB_STORAGE_KEY)) || { upgrades: {} }; }
function saveLab(state) { localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(state)); }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function openModal(html) { const body = $('#modalBody'); const modal = $('#modal'); if (!body || !modal) return; body.innerHTML = html; modal.style.display = 'block'; setTimeout(() => window.CATCHABUGS_MODAL_NAV?.ensure?.(), 0); }
function upgradeCost(upgrade, level) { return Math.round(upgrade.baseCost * (1 + level * 0.65)); }
function labLevelTotal(lab) { return Object.values(lab.upgrades || {}).reduce((sum, value) => sum + Number(value || 0), 0); }
function compareText(upgrade, level) { const current = upgrade.value(level); const next = upgrade.value(Math.min(upgrade.max, level + 1)); return `${upgrade.stat} ${current}${upgrade.unit} → ${next}${upgrade.unit}`; }

function styleHTML() {
  return `<style>
    .labHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.labHeader h2{margin:0}.labHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.labSummary{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f4fff9);border:1px solid #0000000d;box-shadow:0 8px 18px #0001}.labSummary b{font-size:15px}.labSummary p{margin:7px 0 0;color:#0009;font-size:12px;font-weight:800}.labSection{margin:14px 0 8px;font-size:13px;font-weight:1000;color:#17231f}.labNpcGrid{display:grid;gap:10px}.labNpcCard,.labUpgradeCard,.shopCard{display:flex;gap:12px;align-items:center;padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001;text-align:left;width:100%}.labNpcCard{border:0}.labNpcIcon,.labUpgradeIcon,.shopIcon{width:54px;height:54px;flex:0 0 54px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:inset 0 0 0 1px #0001,0 8px 18px #0001}.labNpcBody,.labUpgradeBody,.shopBody{flex:1;min-width:0}.labNpcBody b,.shopBody b{font-size:15px}.labNpcBody p,.shopBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.labNpcBody small,.shopBody small{font-size:11px;font-weight:1000;color:#0f6f56}.labTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.labTop b{font-size:15px}.labTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#0bbf831d;color:#087653}.labUpgradeBody p{margin:6px 0;color:#0009;font-size:12px;font-weight:800;line-height:1.45}.labUpgradeBody small{display:block;color:#0008;font-size:11px;font-weight:900;margin:4px 0 7px}.labCompare{border-radius:12px;background:#07111e0d;color:#07111e;padding:8px 10px;font-size:12px;font-weight:1000;margin:6px 0 8px}.labUpgradeBody button,.shopCard button{border:0;border-radius:12px;padding:8px 10px;font-weight:1000;background:#07111e;color:white}.labUpgradeBody button:disabled,.shopCard button:disabled{opacity:.35}.labBar{height:10px;background:#0001;border-radius:999px;overflow:hidden;margin:7px 0}.labBar i{display:block;height:100%;background:linear-gradient(120deg,#82f7c1,#6bb2ff,#a573ed);border-radius:999px}.labUpgradeCard.maxed{border-color:#82f7c1aa;box-shadow:0 8px 22px #82f7c122}.shopList{display:grid;gap:9px}.shopCard{margin:0}.shopPrice{font-size:12px;font-weight:1000;color:#0f6f56;margin-top:5px}.shopCard.owned{opacity:.65}
  </style>`;
}
function labHomeHTML() {
  return `<div class="labHeader"><h2>연구소</h2><div>🪱 ${getWormChip()} · 🔷 ${getExplorerCore()}</div></div>${styleHTML()}
    <div class="labSummary"><b>연구소 안내</b><p>호박사는 연구 업그레이드를 담당하고, 나상인은 웜칩 상점을 운영합니다. 구매한 아이템과 장비는 배낭에 보관됩니다.</p></div>
    <div class="labNpcGrid">
      <button class="labNpcCard" data-lab-npc="professor"><div class="labNpcIcon">👨‍🔬</div><div class="labNpcBody"><b>호박사</b><p>채집률, 레이더, BUG HOLE 효율을 연구합니다.</p><small>탐사코어 사용</small></div></button>
      <button class="labNpcCard" data-lab-npc="merchant"><div class="labNpcIcon">🧑‍💼</div><div class="labNpcBody"><b>나상인</b><p>설치물, 소비 아이템, 의상과 장비를 판매합니다.</p><small>웜칩 사용</small></div></button>
    </div>`;
}
function upgradeCard(upgrade, lab) {
  const level = Number(lab.upgrades?.[upgrade.id] || 0);
  const maxed = level >= upgrade.max;
  const cost = upgradeCost(upgrade, level);
  const affordable = getExplorerCore() >= cost;
  const pct = Math.round((level / upgrade.max) * 100);
  return `<article class="labUpgradeCard ${maxed ? 'maxed' : ''}"><div class="labUpgradeIcon">${upgrade.icon}</div><div class="labUpgradeBody"><div class="labTop"><b>${upgrade.name}</b><span>${maxed ? 'MAX' : `Lv.${level}/${upgrade.max}`}</span></div><p>${upgrade.desc}</p><div class="labBar"><i style="width:${pct}%"></i></div><small>${upgrade.effect(level)}</small><div class="labCompare">${maxed ? `${upgrade.stat} ${upgrade.value(level)}${upgrade.unit}` : compareText(upgrade, level)}</div><button data-upgrade-id="${upgrade.id}" ${!maxed && affordable ? '' : 'disabled'}>${maxed ? '완료' : `🔷 ${cost}`}</button></div></article>`;
}
function professorHTML() {
  const lab = loadLab();
  const upgradeHtml = UPGRADES.map((upgrade) => upgradeCard(upgrade, lab)).join('');
  return `<div class="labHeader"><h2>👨‍🔬 호박사 연구</h2><div>🔷 ${getExplorerCore()}</div></div>${styleHTML()}<div class="labSummary"><b>연구 업그레이드</b><p>연구 레벨 총합 ${labLevelTotal(lab)}. 각 연구는 업그레이드 전/후 수치를 비교해서 표시합니다.</p></div><div class="labSection">연구 프로젝트</div>${upgradeHtml}`;
}
function isOwnedShopItem(item) {
  const bag = window.CATCHABUGS_BACKPACK?.load?.();
  if (!bag) return false;
  if (item.type === 'gear') return !!bag.gear?.find((gear) => gear.id === item.id && gear.owned);
  return false;
}
function merchantHTML() {
  const cards = SHOP_ITEMS.map((item) => {
    const owned = isOwnedShopItem(item);
    return `<article class="shopCard ${owned ? 'owned' : ''}"><div class="shopIcon">${item.icon}</div><div class="shopBody"><b>${item.name}</b><p>${item.desc}</p><div class="shopPrice">🪱 ${item.price}</div></div><button data-shop-buy="${item.id}" ${owned ? 'disabled' : ''}>${owned ? '보유중' : '구매'}</button></article>`;
  }).join('');
  return `<div class="labHeader"><h2>🧑‍💼 나상인 상점</h2><div>🪱 ${getWormChip()}</div></div>${styleHTML()}<div class="labSummary"><b>나상인</b><p>상점에서 구매한 설치물과 장비는 바로 배낭으로 들어갑니다. 사용과 착용은 배낭에서 진행합니다.</p></div><div class="shopList">${cards}</div>`;
}
function openLab() { openModal(labHomeHTML()); wireLabHome(); }
function openProfessor() { openModal(professorHTML()); wireProfessor(); }
function openMerchant() { openModal(merchantHTML()); wireMerchant(); }
function wireLabHome() {
  document.querySelectorAll('[data-lab-npc]').forEach((button) => {
    button.onclick = () => button.dataset.labNpc === 'professor' ? openProfessor() : openMerchant();
  });
}
function wireProfessor() {
  document.querySelectorAll('[data-upgrade-id]').forEach((button) => {
    button.onclick = () => {
      const lab = loadLab();
      const upgrade = UPGRADES.find((item) => item.id === button.dataset.upgradeId);
      if (!upgrade) return;
      const level = Number(lab.upgrades[upgrade.id] || 0);
      const cost = upgradeCost(upgrade, level);
      if (level >= upgrade.max) return;
      if (!spendExplorerCore(cost, `${upgrade.name} 연구`)) { toast('탐사코어가 부족합니다.'); return; }
      lab.upgrades[upgrade.id] = level + 1;
      saveLab(lab);
      liveGame()?.addLog?.(`${upgrade.name} Lv.${level + 1} 연구 완료: ${compareText(upgrade, level)}`, upgrade.icon);
      toast(`${upgrade.icon} ${upgrade.name} Lv.${level + 1}`);
      window.CATCHABUGS_PROFILE?.updateHud?.();
      openProfessor();
    };
  });
}
function wireMerchant() {
  document.querySelectorAll('[data-shop-buy]').forEach((button) => {
    button.onclick = () => {
      const item = SHOP_ITEMS.find((entry) => entry.id === button.dataset.shopBuy);
      if (!item) return;
      if (!spendWormChip(item.price, `${item.name} 구매`)) { toast('웜칩이 부족합니다.'); return; }
      window.CATCHABUGS_BACKPACK?.addItem?.(item.id, 1);
      liveGame()?.addLog?.(`${item.name} 구매`, item.icon);
      toast(`${item.icon} ${item.name} 구매 완료`);
      openMerchant();
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
window.CATCHABUGS_LAB = { open: openLab, openProfessor, openMerchant };
function initLab() { ensureLabButton(); }
document.addEventListener('DOMContentLoaded', initLab);
setTimeout(initLab, 0);
