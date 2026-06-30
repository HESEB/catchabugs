function $(selector) { return document.querySelector(selector); }
function weatherApi() { return window.CATCHABUGS_TIME_WEATHER; }
function gameApi() { return window.CATCHABUGS_GAME; }
function compassText() {
  const raw = $('#headingText')?.textContent?.trim() || '🧭 N 0° · DEV';
  return raw.replace('🧭 ', '');
}
function toggleCompass() {
  const btn = $('#compassBtn');
  if (btn) btn.click();
}
function ensureCompactRadar() {
  const radar = $('#radar');
  if (!radar) return;
  let info = $('#radarCompactInfo');
  if (!info) {
    info = document.createElement('div');
    info.id = 'radarCompactInfo';
    const head = radar.querySelector('.radar-head');
    if (head) head.insertAdjacentElement('afterend', info);
    else radar.insertBefore(info, radar.firstChild);
  }
  let compass = $('#radarCompassToggle');
  if (!compass) {
    compass = document.createElement('button');
    compass.id = 'radarCompassToggle';
    compass.type = 'button';
    compass.onclick = toggleCompass;
    radar.appendChild(compass);
  }
}
function renderCompactRadar() {
  ensureCompactRadar();
  const info = $('#radarCompactInfo');
  const compass = $('#radarCompassToggle');
  const tw = weatherApi()?.getState?.();
  const time = tw?.time;
  const weather = tw?.weather;
  const phase = time ? `${time.phase} ${time.label}` : ($('#twTime')?.textContent || '시간 분석중');
  const weatherLabel = weather ? `${weather.icon} ${weather.name}` : ($('#twWeather')?.textContent || '날씨 분석중');
  const heading = compassText();
  if (info) info.innerHTML = `<span>${phase}</span><span>${weatherLabel}</span><span>🧭 ${heading}</span>`;
  if (compass) compass.textContent = $('#compassBtn')?.textContent?.includes('끄기') ? '🧭 ON' : '🧭 OFF';
}
function injectStyle() {
  if ($('#radarCompactStyle')) return;
  const style = document.createElement('style');
  style.id = 'radarCompactStyle';
  style.textContent = `
    #timeWeatherPanel{display:none!important}
    #compassPanel{display:none!important}
    #radar{padding-top:10px!important}
    #radarCompactInfo{display:grid;grid-template-columns:1fr;gap:2px;margin:4px 0 6px;color:#ffffffd9;font-size:10px;font-weight:1000;line-height:1.15;text-align:left}
    #radarCompactInfo span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #radarCompassToggle{width:100%;margin-top:5px;border:0;border-radius:999px;background:#ffffff18;color:white;padding:5px 7px;font-size:10px;font-weight:1000}
  `;
  document.head.appendChild(style);
}
function init() {
  injectStyle();
  setInterval(renderCompactRadar, 700);
}
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));
setTimeout(init, 1200);
