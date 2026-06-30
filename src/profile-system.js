import { BUGS } from './data/bugs.js';

const PROFILE_KEY = 'catchabugs.profile.v1';
const CORE_SAVE_KEY = 'catchabugs.core.v2';
const RETURN_KEY = 'catchabugs.returnStones.v1';
const LEGENDARY_KEY = 'catchabugs.legendary.v2';
const LAB_KEY = 'catchabugs.lab.v2';

const AVATARS = ['👦', '👧', '🧑', '👩', '🧑‍🔬', '👨‍🔬', '🕵️', '🧢'];
const TITLES = [
  { id: 'rookie', name: '초보 채집가', stat: '기본 칭호' },
  { id: 'researcher', name: '곤충 연구원', stat: '도감 진행 +1%' },
  { id: 'forest', name: '숲의 연구원', stat: '숲 지역 채집 +2%' },
  { id: 'rare', name: '희귀 수집가', stat: '희귀 발견 +1%' },
  { id: 'legend', name: '전설 추적자', stat: '전설 발견 +0.2%' },
];

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadCore() { return safeParse(localStorage.getItem(CORE_SAVE_KEY)) || { points: 0, caught: {}, log: [], player: { x: 0, y: 0 } }; }
function loadLegendary() { return safeParse(localStorage.getItem(LEGENDARY_KEY)) || { noted: {}, caught: {} }; }
function loadLab() { return safeParse(localStorage.getItem(LAB_KEY)) || { upgrades: {} }; }
function loadReturn() { return safeParse(localStorage.getItem(RETURN_KEY)) || { discovered: {} }; }
function economy() { return window.CATCHABUGS_ECONOMY || null; }
function gameApi() { return window.CATCHABUGS_GAME || null; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }

function defaultProfile() {
  return {
    name: '김희찬',
    level: 1,
    exp: 0,
    avatar: '👦',
    titleId: 'rookie',
    equipped: {
      outfit: '기본 탐험복',
      bag: '기본 배낭',
      net: '기본 채집망',
      badge: '없음',
    },
    owned: {
      avatars: ['👦', '🧑‍🔬', '🧢'],
      outfits: ['기본 탐험복'],
      bags: ['기본 배낭'],
      nets: ['기본 채집망'],
      badges: [],
      titles: ['rookie'],
    },
  };
}
function loadProfile() {
  const saved = safeParse(localStorage.getItem(PROFILE_KEY));
  const base = defaultProfile();
  return {
    ...base,
    ...(saved || {}),
    equipped: { ...base.equipped, ...(saved?.equipped || {}) },
    owned: {
      avatars: Array.from(new Set([...(base.owned.avatars || []), ...((saved?.owned?.avatars) || [])])),
      outfits: Array.from(new Set([...(base.owned.outfits || []), ...((saved?.owned?.outfits) || [])])),
      bags: Array.from(new Set([...(base.owned.bags || []), ...((saved?.owned?.bags) || [])])),
      nets: Array.from(new Set([...(base.owned.nets || []), ...((saved?.owned?.nets) || [])])),
      badges: Array.from(new Set([...(base.owned.badges || []), ...((saved?.owned?.badges) || [])])),
      titles: Array.from(new Set([...(base.owned.titles || []), ...((saved?.owned?.titles) || [])])),
    },
  };
}
function saveProfile(profile) { saveJSON(PROFILE_KEY, profile); window.dispatchEvent(new CustomEvent('catchabugs:profile-changed', { detail: { profile } })); return profile; }
function titleById(id) { return TITLES.find((title) => title.id === id) || TITLES[0]; }
function caughtCount() { const caught = loadCore().caught || {}; return Object.values(caught).reduce((sum, rec) => sum + (typeof rec === 'number' ? rec : Number(rec?.count || 0)), 0); }
function uniqueCaught() { return Object.values(loadCore().caught || {}).filter((rec) => (typeof rec === 'number' ? rec : Number(rec?.count || 0)) > 0).length; }
function legendaryCount() { return Object.keys(loadLegendary().caught || {}).length; }
function returnCount() { return Object.keys(loadReturn().discovered || {}).length; }
function labLevel(id) { return Number(loadLab().upgrades?.[id] || 0); }
function levelFromProgress() {
  const base = caughtCount();
  const dex = uniqueCaught() * 8;
  const legends = legendaryCount() * 50;
  return Math.max(1, Math.floor((base + dex + legends) / 30) + 1);
}
function profileStats() {
  const level = levelFromProgress();
  const dexFound = uniqueCaught();
  const dexTotal = BUGS.length;
  const title = titleById(loadProfile().titleId);
  const radarLevel = labLevel('radar-sensitivity');
  const netLevel = labLevel('net-balance');
  const fieldLevel = labLevel('field-note');
  const bugHoleLevel = labLevel('bug-hole-research');
  const catchRate = Math.min(95, 60 + Math.floor(level / 3) + netLevel * 2);
  const rareRate = Number((2 + Math.floor(level / 5) * 0.2 + fieldLevel * 0.4).toFixed(1));
  const legendRate = Number((0.1 + legendaryCount() * 0.05 + bugHoleLevel * 0.03).toFixed(2));
  const radarRange = 30 + radarLevel * 5 + Math.floor(level / 4) * 2;
  const moveSpeed = 100 + Math.floor(level / 6) * 2;
  const player = gameApi()?.getPlayer?.() || loadCore().player || { x: 0, y: 0 };
  const distance = Math.round((Math.abs(player.x || 0) + Math.abs(player.y || 0)) / 100) / 10;
  return { level, title, dexFound, dexTotal, catchRate, rareRate, legendRate, radarRange, moveSpeed, bugHole: returnCount(), bugHoleMax: 8, caught: caughtCount(), distance };
}

function ensureHud() {
  const hud = $('.hud');
  if (!hud || $('#profileHud')) return;
  hud.innerHTML = `<button id="profileHud" type="button" class="profileHud"><span class="avatar">👦</span><span><b>김희찬</b><small>Lv.1 · 【초보 채집가】</small></span></button>`;
  $('#profileHud').onclick = openProfile;
}
function updateHud() {
  ensureHud();
  const profile = loadProfile();
  const stats = profileStats();
  profile.level = stats.level;
  saveProfile(profile);
  const hud = $('#profileHud');
  if (!hud) return;
  hud.querySelector('.avatar').textContent = profile.avatar;
  hud.querySelector('b').textContent = profile.name;
  hud.querySelector('small').textContent = `Lv.${stats.level} · 【${stats.title.name}】`;
}
function injectStyle() {
  if ($('#profileSystemStyle')) return;
  const style = document.createElement('style');
  style.id = 'profileSystemStyle';
  style.textContent = `
    .hud{justify-content:flex-start!important;right:auto!important;pointer-events:none}.profileHud{display:flex;align-items:center;gap:9px;border:0;border-radius:20px;padding:8px 11px;background:#ffffffe8;color:#07111e;box-shadow:0 10px 24px #0004;font-weight:1000;pointer-events:auto;text-align:left}.profileHud .avatar{width:42px;height:42px;border-radius:16px;background:linear-gradient(135deg,#82f7c1,#6bb2ff);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:inset 0 0 0 1px #fff8}.profileHud b{display:block;font-size:13px;line-height:1.1}.profileHud small{display:block;margin-top:3px;font-size:10px;color:#0009;font-weight:1000;white-space:nowrap}.profileSheet h2{margin:0}.profileTop{display:flex;gap:12px;align-items:center;margin:8px 0 12px}.profileBigAvatar{width:76px;height:76px;border-radius:26px;background:linear-gradient(135deg,#82f7c1,#6bb2ff,#a573ed);display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 12px 24px #0002}.profileName b{font-size:22px}.profileName small{display:block;margin-top:5px;font-size:12px;font-weight:1000;color:#0f6f56}.statGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.statBox{border-radius:18px;background:#0000000a;padding:10px}.statBox b{display:block;font-size:17px}.statBox span{font-size:11px;font-weight:900;color:#0008}.statDetail{padding:12px;margin:9px 0;border-radius:20px;background:linear-gradient(135deg,#fff,#f6fbff);border:1px solid #0000000d}.statDetail b{font-size:15px}.statDetail p{margin:6px 0 0;font-size:12px;font-weight:900;color:#0009;line-height:1.45}.customGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.avatarPick{border:0;border-radius:16px;padding:10px;background:#0000000a;font-size:26px}.avatarPick.on{outline:3px solid #82f7c1;background:#82f7c133}.equipLine{display:flex;justify-content:space-between;gap:8px;align-items:center;border-radius:16px;background:#0000000a;padding:10px;margin:7px 0;font-size:12px;font-weight:900}.equipLine button{border:0;border-radius:12px;background:#07111e;color:white;padding:8px 10px;font-weight:1000}
  `;
  document.head.appendChild(style);
}
function openProfile() {
  const profile = loadProfile();
  const stats = profileStats();
  const wormChip = economy()?.getStars?.() ?? gameApi()?.getPoints?.() ?? 0;
  const core = economy()?.getExplorerCore?.() ?? 0;
  const avatars = AVATARS.map((avatar) => `<button class="avatarPick ${profile.avatar === avatar ? 'on' : ''}" data-avatar="${avatar}">${avatar}</button>`).join('');
  const titleOptions = TITLES.map((title) => `<div class="equipLine"><span>【${title.name}】<br><small>${title.stat}</small></span><button data-title-id="${title.id}">${profile.titleId === title.id ? '착용중' : '칭호 변경'}</button></div>`).join('');
  const body = $('#modalBody');
  const modal = $('#modal');
  if (!body || !modal) return;
  body.innerHTML = `<div class="profileSheet"><div class="profileTop"><div class="profileBigAvatar">${profile.avatar}</div><div class="profileName"><b>${profile.name}</b><small>Lv.${stats.level} · 【${stats.title.name}】</small><small>🪱 웜칩 ${wormChip} · 🔷 탐사코어 ${core}</small></div></div>
    <div class="statGrid"><div class="statBox"><b>${stats.catchRate}%</b><span>채집 성공률</span></div><div class="statBox"><b>${stats.rareRate}%</b><span>희귀 발견률</span></div><div class="statBox"><b>${stats.legendRate}%</b><span>전설 발견률</span></div><div class="statBox"><b>${stats.radarRange}m</b><span>레이더 거리</span></div><div class="statBox"><b>${stats.dexFound}/${stats.dexTotal}</b><span>도감 진행도</span></div><div class="statBox"><b>${stats.bugHole}/${stats.bugHoleMax}</b><span>BUG HOLE</span></div><div class="statBox"><b>${stats.caught}</b><span>총 채집수</span></div><div class="statBox"><b>${stats.moveSpeed}%</b><span>이동속도</span></div></div>
    <div class="statDetail"><b>채집 성공률 상세</b><p>기본 60% + 레벨 ${Math.floor(stats.level / 3)}% + 연구 ${labLevel('net-balance') * 2}% = ${stats.catchRate}%</p></div>
    <div class="statDetail"><b>레이더 거리 상세</b><p>기본 30m + 레이더 연구 ${labLevel('radar-sensitivity') * 5}m + 레벨 보정 ${Math.floor(stats.level / 4) * 2}m = ${stats.radarRange}m</p></div>
    <div class="statDetail"><b>프로필 이미지</b><div class="customGrid">${avatars}</div></div>
    <div class="statDetail"><b>칭호</b>${titleOptions}</div>
    <div class="statDetail"><b>착용 장비</b><p>의상: ${profile.equipped.outfit}<br>가방: ${profile.equipped.bag}<br>채집망: ${profile.equipped.net}<br>배지: ${profile.equipped.badge}</p></div></div>`;
  modal.style.display = 'block';
  body.querySelectorAll('[data-avatar]').forEach((button) => {
    button.onclick = () => { const next = loadProfile(); next.avatar = button.dataset.avatar; saveProfile(next); toast('프로필 이미지 변경'); updateHud(); openProfile(); };
  });
  body.querySelectorAll('[data-title-id]').forEach((button) => {
    button.onclick = () => { const next = loadProfile(); next.titleId = button.dataset.titleId; saveProfile(next); toast('칭호 변경'); updateHud(); openProfile(); };
  });
}

function grantCustomization(type, value) {
  const profile = loadProfile();
  const map = { avatar: 'avatars', outfit: 'outfits', bag: 'bags', net: 'nets', badge: 'badges', title: 'titles' };
  const key = map[type];
  if (!key) return false;
  profile.owned[key] = Array.from(new Set([...(profile.owned[key] || []), value]));
  saveProfile(profile);
  updateHud();
  return true;
}
function equipCustomization(type, value) {
  const profile = loadProfile();
  if (type === 'avatar') profile.avatar = value;
  if (type === 'outfit') profile.equipped.outfit = value;
  if (type === 'bag') profile.equipped.bag = value;
  if (type === 'net') profile.equipped.net = value;
  if (type === 'badge') profile.equipped.badge = value;
  if (type === 'title') profile.titleId = value;
  saveProfile(profile);
  updateHud();
  return true;
}

window.CATCHABUGS_PROFILE = { load: loadProfile, save: saveProfile, stats: profileStats, open: openProfile, grantCustomization, equipCustomization, updateHud };
function init() { injectStyle(); ensureHud(); updateHud(); setInterval(updateHud, 3500); }
document.addEventListener('DOMContentLoaded', init);
setTimeout(init, 100);
