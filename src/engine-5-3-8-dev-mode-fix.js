function $(selector) { return document.querySelector(selector); }
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1300);
}
function isDeveloperModal() {
  const body = $('#modalBody');
  if (!body) return false;
  const title = body.querySelector('.menuHubHeader h2')?.textContent || body.querySelector('.modalGuardTitle')?.textContent || body.querySelector('h2')?.textContent || '';
  return title.includes('개발자모드');
}
function removeWrongNpcTools() {
  document.querySelectorAll('#npcDevTools').forEach((tools) => {
    if (!isDeveloperModal()) tools.remove();
  });
}
function ensureNpcToolsInDeveloper() {
  const body = $('#modalBody');
  if (!body || !isDeveloperModal()) return;
  if ($('#npcDevTools')) return;
  const sheet = body.querySelector('.menuHubSheet') || body.firstElementChild || body;
  const panel = document.createElement('div');
  panel.id = 'npcDevTools';
  panel.className = 'devPanel';
  panel.innerHTML = `<h3>NPC 테스트</h3><div class="devActions"><button id="devSpawnNpc">근처 NPC 생성</button><button id="devSpawnHiddenNpc">근처 미확인 신호 생성</button><button id="devSpawnMerchant">상인 생성</button><button id="devSpawnCollector">수집가 생성</button></div>`;
  sheet.appendChild(panel);
  $('#devSpawnNpc')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnVisible?.(); toast('근처 NPC 생성'); });
  $('#devSpawnHiddenNpc')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnHidden?.(); toast('근처 미확인 신호 생성'); });
  $('#devSpawnMerchant')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnMerchant?.(); toast('떠돌이 상인 생성'); });
  $('#devSpawnCollector')?.addEventListener('click', () => { window.CATCHABUGS_RANDOM_NPC?.spawnCollector?.(); toast('표본 수집가 생성'); });
}
function patchDeveloperPanelClick() {
  if (document.documentElement.dataset.engine538DevClick === 'on') return;
  document.documentElement.dataset.engine538DevClick = 'on';
  document.addEventListener('click', (event) => {
    const devButton = event.target.closest?.('[data-panel="developer"]');
    if (!devButton) return;
    setTimeout(() => {
      removeWrongNpcTools();
      ensureNpcToolsInDeveloper();
    }, 80);
  }, true);
}
function tick() {
  removeWrongNpcTools();
  ensureNpcToolsInDeveloper();
  patchDeveloperPanelClick();
  setTimeout(tick, 300);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 500));
setTimeout(tick, 1200);
