const WEATHER_STORAGE_KEY = 'catchabugs.timeWeather.v1';
const GAME_MINUTES_PER_REAL_SECOND = 8;

const WEATHER_TABLE = Object.freeze([
  { id: 'clear', icon: '☀️', name: '맑음', tone: '#ffd166', desc: '시야가 넓어져 레이더 신호가 또렷하다.', hint: '나비류와 잠자리가 활동하기 좋다.' },
  { id: 'cloudy', icon: '☁️', name: '흐림', tone: '#a8b3c4', desc: '빛이 부드러워 숲속 신호가 안정적이다.', hint: '개미와 수서 곤충을 찾기 좋다.' },
  { id: 'rain', icon: '🌧️', name: '비', tone: '#63bad8', desc: '물가와 수풀 근처 신호가 강해진다.', hint: '물방개와 물장군 신호에 주목하자.' },
  { id: 'wind', icon: '🍃', name: '바람', tone: '#82f7c1', desc: '작은 곤충의 움직임이 조금 빨라진다.', hint: '타이밍 채집에 집중하자.' },
  { id: 'night-glow', icon: '🌙', name: '밤빛', tone: '#a573ed', desc: '어두운 지역에서 발광 신호가 잘 보인다.', hint: '반딧불이 신호가 눈에 띌 수 있다.' },
]);

function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadState() { const saved = safeParse(localStorage.getItem(WEATHER_STORAGE_KEY)); if (saved && Number.isFinite(saved.minuteOfDay)) return saved; const now = new Date(); return { minuteOfDay: now.getHours() * 60 + now.getMinutes(), day: 1, weatherIndex: now.getDate() % WEATHER_TABLE.length, lastWeatherShift: Date.now() }; }
function saveState(state) { localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(state)); }
const state = loadState();
let lastTick = performance.now();
function pad(n) { return String(n).padStart(2, '0'); }
function timeParts() { const total = Math.floor(state.minuteOfDay) % 1440; const hour = Math.floor(total / 60); const minute = total % 60; const phase = hour >= 5 && hour < 11 ? '아침' : hour >= 11 && hour < 17 ? '낮' : hour >= 17 && hour < 21 ? '저녁' : '밤'; return { hour, minute, phase, label: `${pad(hour)}:${pad(minute)}` }; }
function currentWeather() { const t = timeParts(); if (t.phase === '밤' && WEATHER_TABLE[state.weatherIndex]?.id === 'clear') return WEATHER_TABLE.find((w) => w.id === 'night-glow') || WEATHER_TABLE[0]; return WEATHER_TABLE[state.weatherIndex] || WEATHER_TABLE[0]; }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function shiftWeather() { state.weatherIndex = (state.weatherIndex + 1 + Math.floor(Math.random() * (WEATHER_TABLE.length - 1))) % WEATHER_TABLE.length; state.lastWeatherShift = Date.now(); saveState(state); toast(`${currentWeather().icon} 날씨 변화: ${currentWeather().name}`); }
function ensurePanel() { if ($('#timeWeatherPanel')) return; const game = $('#game'); const panel = document.createElement('div'); panel.id = 'timeWeatherPanel'; panel.innerHTML = `<div id="twTime">00:00</div><div id="twWeather">☀️ 맑음</div><small id="twHint">신호 분석중</small>`; panel.style.cssText = 'position:absolute;left:50%;top:62px;z-index:8;transform:translateX(-50%);width:136px;max-width:34vw;padding:7px 9px;border-radius:16px;background:#07111ed4;color:white;border:1px solid #ffffff33;box-shadow:0 10px 24px #0006;text-align:center;font-weight:1000;pointer-events:none;font-size:12px;line-height:1.25'; if (game) game.appendChild(panel); const layer = document.createElement('div'); layer.id = 'weatherLayer'; layer.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;opacity:.34;mix-blend-mode:screen'; if (game) game.appendChild(layer); }
function weatherBackground(weather, phase) { if (weather.id === 'rain') return 'repeating-linear-gradient(115deg,#ffffff44 0 2px,transparent 2px 14px)'; if (weather.id === 'wind') return 'repeating-linear-gradient(12deg,transparent 0 24px,#ffffff24 24px 28px,transparent 28px 56px)'; if (phase === '밤') return 'radial-gradient(circle at 50% 18%,#ffffff44,transparent 12%),linear-gradient(#10163ecc,#00000066)'; if (phase === '저녁') return 'linear-gradient(180deg,#ff9d3d44,transparent 55%)'; if (weather.id === 'cloudy') return 'radial-gradient(circle at 30% 20%,#ffffff55,transparent 20%),radial-gradient(circle at 70% 34%,#ffffff40,transparent 24%)'; return 'radial-gradient(circle at 75% 18%,#fff7,transparent 13%)'; }
function applyAtmosphere() { const weather = currentWeather(); const time = timeParts(); const layer = $('#weatherLayer'); if (layer) { layer.style.background = weatherBackground(weather, time.phase); layer.style.opacity = time.phase === '밤' ? '.48' : weather.id === 'rain' ? '.42' : '.3'; } document.body.dataset.weather = weather.id; document.body.dataset.timePhase = time.phase; document.documentElement.style.setProperty('--weatherTone', weather.tone); }
function renderPanel() { ensurePanel(); const weather = currentWeather(); const time = timeParts(); const twTime = $('#twTime'); const twWeather = $('#twWeather'); const twHint = $('#twHint'); if (twTime) twTime.textContent = `${time.phase} ${time.label}`; if (twWeather) twWeather.textContent = `${weather.icon} ${weather.name}`; if (twHint) twHint.textContent = weather.hint; const panel = $('#timeWeatherPanel'); if (panel) panel.style.borderColor = `${weather.tone}aa`; applyAtmosphere(); }
function tick() { const now = performance.now(); const delta = Math.max(0, now - lastTick) / 1000; lastTick = now; state.minuteOfDay += delta * GAME_MINUTES_PER_REAL_SECOND; if (state.minuteOfDay >= 1440) { state.minuteOfDay %= 1440; state.day += 1; shiftWeather(); } if (Date.now() - state.lastWeatherShift > 1000 * 60 * 6) shiftWeather(); renderPanel(); requestAnimationFrame(tick); }
function openWeatherInfo() { const weather = currentWeather(); const time = timeParts(); const body = $('#modalBody'); const modal = $('#modal'); if (!body || !modal) return; body.innerHTML = `<div class="dexHeader"><h2>시간·날씨</h2><div>${time.phase} ${time.label}</div></div><div class="dexCard found"><div class="dexImage"><div class="dexUnknown" style="opacity:1;filter:none">${weather.icon}</div></div><div class="dexInfo"><div class="dexTop"><b>${weather.name}</b><span>DAY ${state.day}</span></div><div class="dexMeta">${weather.desc}</div><small>호박사 메모: ${weather.hint}</small></div></div>`; modal.style.display = 'block'; }
function setWeather(id) { const index = WEATHER_TABLE.findIndex((w) => w.id === id); if (index < 0) return false; state.weatherIndex = index; state.lastWeatherShift = Date.now(); saveState(state); renderPanel(); toast(`${currentWeather().icon} 날씨 변경: ${currentWeather().name}`); return true; }
function setPhase(phase) { const hourMap = { '아침': 7, '낮': 13, '저녁': 18, '밤': 22 }; if (!Object.hasOwn(hourMap, phase)) return false; state.minuteOfDay = hourMap[phase] * 60; saveState(state); renderPanel(); toast(`시간 변경: ${phase}`); return true; }
function init() { ensurePanel(); renderPanel(); setInterval(() => saveState(state), 5000); }
window.CATCHABUGS_TIME_WEATHER = { table: WEATHER_TABLE, getState: () => ({ ...state, weather: currentWeather(), time: timeParts() }), open: openWeatherInfo, setWeather, setPhase };
window.addEventListener('catchabugs:set-weather', (event) => setWeather(event.detail?.id));
window.addEventListener('catchabugs:set-phase', (event) => setPhase(event.detail?.phase));
document.addEventListener('DOMContentLoaded', init);
setTimeout(init, 0);
requestAnimationFrame(tick);
