function $(selector) { return document.querySelector(selector); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1300);
}
function isMobileDevice() {
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (matchMedia('(pointer: coarse)').matches && innerWidth <= 900);
}
function hasOrientationApi() {
  return typeof window.DeviceOrientationEvent !== 'undefined';
}
function injectStyle() {
  if ($('#engine536CompassStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine536CompassStyle';
  style.textContent = `
    body[data-compass-mode="mobile"] #radarFallbackCompass{display:none!important;pointer-events:none!important}
    body[data-compass-mode="mobile"] #compassPanel{display:none!important;pointer-events:none!important}
    body[data-compass-mode="mobile"] #radarCompassToggle{background:#2df0a044!important;color:#fff!important}
    body[data-compass-mode="desktop"] #radarFallbackCompass{display:block}
  `;
  document.head.appendChild(style);
}
function setMode() {
  injectStyle();
  document.body.dataset.compassMode = isMobileDevice() && hasOrientationApi() ? 'mobile' : 'desktop';
}
function nativeCompassOn() {
  const btn = $('#compassBtn');
  if (!btn) return false;
  const on = btn.textContent.includes('끄기');
  if (!on) btn.click();
  return true;
}
function nativeCompassOff() {
  const btn = $('#compassBtn');
  if (!btn) return false;
  const on = btn.textContent.includes('끄기');
  if (on) btn.click();
  return true;
}
function interceptRadarToggle() {
  if (document.documentElement.dataset.engine536Compass === 'on') return;
  document.documentElement.dataset.engine536Compass = 'on';
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('#radarCompassToggle');
    if (!toggle) return;
    if (!(isMobileDevice() && hasOrientationApi())) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    const panel = $('#radarFallbackCompass');
    if (panel) panel.remove();
    const ok = nativeCompassOn();
    toggle.textContent = ok ? '📱 SENSOR' : '🧭 OFF';
    toast(ok ? '모바일 센서 나침반 ON' : '센서 사용 불가 · 수동 모드 필요');
  }, true);
}
function updateLabel() {
  const toggle = $('#radarCompassToggle');
  if (!toggle) return;
  if (isMobileDevice() && hasOrientationApi()) {
    const btn = $('#compassBtn');
    const on = btn?.textContent?.includes('끄기');
    toggle.textContent = on ? '📱 SENSOR' : '📱 센서 켜기';
    const panel = $('#radarFallbackCompass');
    if (panel) panel.remove();
  }
}
function tick() {
  setMode();
  interceptRadarToggle();
  updateLabel();
  setTimeout(tick, 500);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 500));
setTimeout(tick, 1200);
