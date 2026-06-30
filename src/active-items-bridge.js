function $(selector) { return document.querySelector(selector); }
function active() { return window.CATCHABUGS_ACTIVE_ITEMS || null; }
function profile() { return window.CATCHABUGS_PROFILE || null; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function bonuses() { return active()?.getBonuses?.() || {}; }

function attachProfileBonus() {
  const body = $('#modalBody');
  if (!body || !body.querySelector('.profileSheet') || $('#activeBonusProfile')) return;
  const b = bonuses();
  const radar = Number(b.radarBonus || 0);
  const spawn = Math.round(Number(b.spawnBoost || 0) * 100);
  const rare = Number(b.rareBoost || 0).toFixed(1);
  const region = Math.round((Number(b.forestBoost || 0) + Number(b.fieldBoost || 0) + Number(b.riverBoost || 0) + Number(b.nightBoost || 0)) * 100);
  const activeItems = active()?.getActiveItems?.() || [];
  const html = `<div id="activeBonusProfile" class="statDetail"><b>설치물 보정</b><p>${activeItems.length ? activeItems.map((item) => `${item.icon} ${item.name} ${active()?.formatRemaining?.(active()?.remainingMs?.(item))}`).join('<br>') : '활성 설치물 없음'}<br><br>생성량 +${spawn}% · 희귀 +${rare}% · 레이더 +${radar}m · 지역/시간 특화 +${region}%</p></div>`;
  body.querySelector('.profileSheet')?.insertAdjacentHTML('beforeend', html);
}
function attachRadarBonus() {
  const hint = $('#radarHint');
  if (!hint) return;
  const b = bonuses();
  const radar = Number(b.radarBonus || 0);
  const spawn = Math.round(Number(b.spawnBoost || 0) * 100);
  if (!radar && !spawn) return;
  if (hint.dataset.activeBridge === hint.textContent) return;
  const base = hint.textContent.replace(/ · 설치물.+$/, '');
  hint.textContent = `${base} · 설치물 생성+${spawn}% 레이더+${radar}m`;
  hint.dataset.activeBridge = hint.textContent;
}
function passiveSpawnAssist() {
  const b = bonuses();
  const boost = Number(b.spawnBoost || 0) + Number(b.forestBoost || 0) + Number(b.fieldBoost || 0) + Number(b.riverBoost || 0) + Number(b.nightBoost || 0);
  if (boost <= 0) return;
  const api = window.CATCHABUGS_GAME;
  if (!api?.addLog) return;
  const t = Date.now();
  if (t - Number(passiveSpawnAssist.last || 0) < 90000) return;
  passiveSpawnAssist.last = t;
  api.addLog(`설치물 효과 적용 중: 곤충 신호 +${Math.round(boost * 100)}%`, '🎒');
}
function rareAlarmNotice() {
  const b = bonuses();
  if (!b.rareAlarm) return;
  const t = Date.now();
  if (t - Number(rareAlarmNotice.last || 0) < 120000) return;
  rareAlarmNotice.last = t;
  toast('🔔 희귀 알람기: 도감에 없는 신호를 우선 확인하세요.');
}
function init() {
  setInterval(() => {
    attachProfileBonus();
    attachRadarBonus();
    passiveSpawnAssist();
    rareAlarmNotice();
    profile()?.updateHud?.();
  }, 1500);
  const body = $('#modalBody');
  if (body && body.dataset.activeBridgeObserver !== 'on') {
    body.dataset.activeBridgeObserver = 'on';
    new MutationObserver(() => setTimeout(attachProfileBonus, 0)).observe(body, { childList: true, subtree: true });
  }
}
window.CATCHABUGS_ACTIVE_ITEMS_BRIDGE = { bonuses, attachProfileBonus };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
setTimeout(init, 1200);
