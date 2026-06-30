const ECONOMY_KEY = 'catchabugs.economy.v1';

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function defaultEconomy() {
  return {
    explorerCore: 0,
    equipment: {},
    activeInstallations: [],
    project: {},
    bugHole: {
      installStep: 0,
      dismantleStep: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

function loadEconomy() {
  const saved = safeParse(localStorage.getItem(ECONOMY_KEY));
  const base = defaultEconomy();
  return {
    ...base,
    ...(saved || {}),
    equipment: { ...base.equipment, ...(saved?.equipment || {}) },
    project: { ...base.project, ...(saved?.project || {}) },
    bugHole: { ...base.bugHole, ...(saved?.bugHole || {}) },
  };
}

function saveEconomy(state) {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(ECONOMY_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('catchabugs:economy-changed', { detail: { economy: state } }));
  return state;
}

function toast(message) {
  const node = document.querySelector('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function addLog(text, icon = '🔷') {
  window.CATCHABUGS_GAME?.addLog?.(text, icon);
}

function getStars() {
  return Number(window.CATCHABUGS_GAME?.getPoints?.() || 0);
}

function addStars(amount) {
  if (window.CATCHABUGS_GAME?.addPoints) return window.CATCHABUGS_GAME.addPoints(amount);
  return getStars();
}

function getExplorerCore() {
  return Number(loadEconomy().explorerCore || 0);
}

function setExplorerCore(value, reason = '탐사코어 변경') {
  const state = loadEconomy();
  state.explorerCore = Math.max(0, Math.floor(Number(value || 0)));
  saveEconomy(state);
  addLog(`${reason}: ${state.explorerCore}`, '🔷');
  return state.explorerCore;
}

function addExplorerCore(amount, reason = '탐사코어') {
  const state = loadEconomy();
  const before = Number(state.explorerCore || 0);
  state.explorerCore = Math.max(0, before + Math.floor(Number(amount || 0)));
  saveEconomy(state);
  addLog(`${reason} ${amount >= 0 ? '+' : ''}${amount}`, '🔷');
  return state.explorerCore;
}

function spendExplorerCore(cost, reason = '탐사코어 사용') {
  const state = loadEconomy();
  const amount = Math.max(0, Math.floor(Number(cost || 0)));
  if (Number(state.explorerCore || 0) < amount) return false;
  state.explorerCore = Number(state.explorerCore || 0) - amount;
  saveEconomy(state);
  addLog(`${reason} -${amount}`, '🔷');
  return true;
}

const BUG_HOLE_COST_TABLE = [100, 150, 220, 320, 450, 600, 800, 1000];
function cappedStepCost(step) {
  return BUG_HOLE_COST_TABLE[Math.min(Math.max(0, Number(step || 0)), BUG_HOLE_COST_TABLE.length - 1)];
}
function getBugHoleInstallCost() {
  return cappedStepCost(loadEconomy().bugHole?.installStep || 0);
}
function getBugHoleDismantleCost() {
  return cappedStepCost(loadEconomy().bugHole?.dismantleStep || 0);
}
function advanceBugHoleInstallStep() {
  const state = loadEconomy();
  state.bugHole.installStep = Math.min(7, Number(state.bugHole.installStep || 0) + 1);
  saveEconomy(state);
  return state.bugHole.installStep;
}
function advanceBugHoleDismantleStep() {
  const state = loadEconomy();
  state.bugHole.dismantleStep = Math.min(7, Number(state.bugHole.dismantleStep || 0) + 1);
  saveEconomy(state);
  return state.bugHole.dismantleStep;
}

function grantEquipment(id, amount = 1) {
  const state = loadEconomy();
  state.equipment[id] = Number(state.equipment[id] || 0) + Number(amount || 0);
  saveEconomy(state);
  return state.equipment[id];
}

window.CATCHABUGS_ECONOMY = {
  load: loadEconomy,
  save: saveEconomy,
  getStars,
  addStars,
  getExplorerCore,
  setExplorerCore,
  addExplorerCore,
  spendExplorerCore,
  getBugHoleInstallCost,
  getBugHoleDismantleCost,
  advanceBugHoleInstallStep,
  advanceBugHoleDismantleStep,
  grantEquipment,
  toast,
};

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(ECONOMY_KEY)) saveEconomy(defaultEconomy());
});
setTimeout(() => {
  if (!localStorage.getItem(ECONOMY_KEY)) saveEconomy(defaultEconomy());
}, 0);
