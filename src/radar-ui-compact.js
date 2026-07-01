function $(selector) { return document.querySelector(selector); }
function weatherApi() { return window.CATCHABUGS_TIME_WEATHER; }
let compactCompassOpen = false;
let compactHeading = 0;

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1300);
}
function compassText() {
  const raw = $('#headingText')?.textContent?.trim() || `🧭 N ${compactHeading}° · DEV`;
  return raw.replace('🧭 ', '');
}
function setGameHeading(value) {
  compactHeading = ((Number(value || 0) % 360) + 360) % 360;
  const slider = $('#headingSlider');
  if (slider) {
    slider.value = String(Math.round(compactHeading));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const text = $('#headingText');
  if (text) text.textContent = `🧭 DEV ${Math.round(compactHeading)}°`;
  updateFallbackCompass();
}
function hideNativeCompass() {
  const panel = $('#compassPanel');
  if (panel) panel.style.setProperty('display', 'none', 'important');
}
function ensureFallbackCompass() {
  hideNativeCompass();
  let panel = $('#radarFallbackCompass');
  if (!compactCompassOpen) {
    if (panel) panel.remove();
    return;
  }
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'radarFallbackCompass';
    panel.innerHTML = `<b>🧭 레이더 나침반</b><div class="radarFallbackDial"><span id="radarFallbackNeedle">▲</span></div><input id="radarFallbackSlider" type="range" min="0" max="359" value="0"><div class="radarDirBtns"><button data-dir="0">N</button><button data-dir="90">E</button><button data-dir="180">S</button><button data-dir="270">W</button></div><small>조작 시 맵 회전에 반영</small>`;
    $('#game')?.appendChild(panel);
    $('#radarFallbackSlider')?.addEventListener('input', (event) => setGameHeading(event.target.value));
    panel.querySelectorAll('[data-dir]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setGameHeading(button.dataset.dir);
      });
    });
  }
  updateFallbackCompass();
}
function updateFallbackCompass() {
  const needle = $('#radarFallbackNeedle');
  const slider = $('#radarFallbackSlider');
  if (needle) needle.style.transform = `rotate(${compactHeading}deg)`;
  if (slider) slider.value = String(Math.round(compactHeading));
}
function toggleCompass(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  compactCompassOpen = !compactCompassOpen;
  hideNativeCompass();
  ensureFallbackCompass();
  toast(compactCompassOpen ? '레이더 나침반 ON' : '레이더 나침반 OFF');
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
    compass.addEventListener('click', toggleCompass, true);
    radar.appendChild(compass);
  }
}
function renderCompactRadar() {
  ensureCompactRadar();
  hideNativeCompass();
  const info = $('#radarCompactInfo');
  const compass = $('#radarCompassToggle');
  const tw = weatherApi()?.getState?.();
  const time = tw?.time;
  const weather = tw?.weather;
  const phase = time ? `${time.phase} ${time.label}` : ($('#twTime')?.textContent || '시간 분석중');
  const weatherLabel = weather ? `${weather.icon} ${weather.name}` : ($('#twWeather')?.textContent || '날씨 분석중');
  const heading = compassText();
  if (info) info.innerHTML = `<span>${phase}</span><span>${weatherLabel}</span><span>🧭 ${heading}</span>`;
  if (compass) compass.textContent = compactCompassOpen ? '🧭 ON' : '🧭 OFF';
  ensureFallbackCompass();
}
function injectStyle() {
  if ($('#radarCompactStyle')) return;
  const style = document.createElement('style');
  style.id = 'radarCompactStyle';
  style.textContent = `
    #timeWeatherPanel{display:none!important}
    #compassPanel{display:none!important;pointer-events:none!important}
    #radar{padding-top:10px!important}
    #radarCompactInfo{display:grid;grid-template-columns:1fr;gap:2px;margin:4px 0 6px;color:#ffffffd9;font-size:10px;font-weight:1000;line-height:1.15;text-align:left}
    #radarCompactInfo span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #radarCompassToggle{width:100%;margin-top:5px;border:0;border-radius:999px;background:#ffffff18;color:white;padding:5px 7px;font-size:10px;font-weight:1000}
    #radarFallbackCompass{position:absolute;right:10px;top:132px;z-index:40;width:156px;padding:10px;border-radius:18px;background:#07111ee8;color:white;border:1px solid #ffffff38;box-shadow:0 14px 30px #0008;font-size:11px;font-weight:1000;box-sizing:border-box}
    #radarFallbackCompass b{display:block;margin-bottom:8px;font-size:13px}
    .radarFallbackDial{width:72px;height:72px;margin:6px auto;border-radius:50%;border:2px solid #fff7;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#ffffff18,#0000)}
    #radarFallbackNeedle{display:block;font-size:30px;transition:transform .18s ease}
    #radarFallbackCompass input{width:100%;margin:8px 0}
    .radarDirBtns{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:6px 0}
    .radarDirBtns button{border:0;border-radius:9px;background:#ffffff24;color:white;padding:5px 0;font-size:10px;font-weight:1000}
    #radarFallbackCompass small{display:block;opacity:.75;line-height:1.35;text-align:center}
  `;
  document.head.appendChild(style);
}
function init() {
  injectStyle();
  setInterval(renderCompactRadar, 700);
}
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));
setTimeout(init, 1200);
