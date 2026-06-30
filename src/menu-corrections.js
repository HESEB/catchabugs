// Engine 2.0 menu corrections
// - Remove NPC menu wording from research/lab records
// - Add actual weather/time controls to developer mode
// - Keep corrections separate from menu-remaster to avoid breaking title input again

function $(selector) { return document.querySelector(selector); }

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1400);
}

function cleanupNpcWording() {
  const body = $('#modalBody');
  if (!body) return;

  body.querySelectorAll('.compactList').forEach((card) => {
    const text = card.textContent || '';
    if (text.includes('NPC 기록')) card.remove();
  });

  body.querySelectorAll('*').forEach((node) => {
    if (!node.childNodes || node.childNodes.length !== 1 || node.firstChild.nodeType !== Node.TEXT_NODE) return;
    node.textContent = node.textContent
      .replaceAll('NPC 기록, ', '')
      .replaceAll('NPC 기록', '탐험 기록')
      .replaceAll('NPC 의뢰/', '')
      .replaceAll('NPC 의뢰', '탐험 의뢰')
      .replaceAll('NPC는 메뉴 속 대화 버튼이 아니라 필드에서 곤충인 줄 알고 접근했을 때 만나는 이벤트 캐릭터로 전환합니다.', '')
      .replaceAll('곤충, NPC, 전설, 거점 발견', '곤충, 전설, 거점 발견');
  });
}

function weatherButton(id, label) {
  return `<button type="button" data-dev-weather="${id}">${label}</button>`;
}

function phaseButton(id, label) {
  return `<button type="button" data-dev-phase="${id}">${label}</button>`;
}

function injectDeveloperWeatherControls() {
  const body = $('#modalBody');
  if (!body || !body.textContent.includes('개발자모드')) return;
  if ($('#developerWeatherControls')) return;

  const panel = document.createElement('div');
  panel.id = 'developerWeatherControls';
  panel.className = 'devPanel';
  panel.innerHTML = `<h3>날씨/시간 변경</h3>
    <div class="devActions">
      ${weatherButton('clear', '☀️ 맑음')}
      ${weatherButton('cloudy', '☁️ 흐림')}
      ${weatherButton('rain', '🌧️ 비')}
      ${weatherButton('wind', '🍃 바람')}
      ${weatherButton('night-glow', '🌙 밤빛')}
      ${phaseButton('아침', '아침')}
      ${phaseButton('낮', '낮')}
      ${phaseButton('저녁', '저녁')}
      ${phaseButton('밤', '밤')}
    </div>`;
  body.querySelector('.menuHubSheet')?.appendChild(panel);

  panel.querySelectorAll('[data-dev-weather]').forEach((button) => {
    button.onclick = () => {
      const api = window.CATCHABUGS_TIME_WEATHER;
      if (!api || typeof api.setWeather !== 'function') { toast('날씨 시스템이 아직 준비되지 않았어.'); return; }
      api.setWeather(button.dataset.devWeather);
    };
  });

  panel.querySelectorAll('[data-dev-phase]').forEach((button) => {
    button.onclick = () => {
      const api = window.CATCHABUGS_TIME_WEATHER;
      if (!api || typeof api.setPhase !== 'function') { toast('시간 시스템이 아직 준비되지 않았어.'); return; }
      api.setPhase(button.dataset.devPhase);
    };
  });
}

function applyCorrections() {
  cleanupNpcWording();
  injectDeveloperWeatherControls();
}

function initCorrections() {
  applyCorrections();
  const body = $('#modalBody');
  if (!body || body.dataset.menuCorrectionsObserver === 'on') return;
  body.dataset.menuCorrectionsObserver = 'on';
  new MutationObserver(applyCorrections).observe(body, { childList: true, subtree: true, characterData: true });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(initCorrections, 120));
setTimeout(initCorrections, 500);
setTimeout(initCorrections, 1200);
