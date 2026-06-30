const LEGENDARY_KEY = 'catchabugs.legendary.v2';
function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadLegendary() { return safeParse(localStorage.getItem(LEGENDARY_KEY)) || { noted: {}, caught: {} }; }
function injectStyle() {
  if ($('#dexCategoryGuardStyle')) return;
  const style = document.createElement('style');
  style.id = 'dexCategoryGuardStyle';
  style.textContent = `
    .dexCategoryTabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:10px 0 12px}
    .dexCategoryTabs button{border:0;border-radius:15px;padding:9px 7px;background:#0000000b;color:#07111e;font-weight:1000;font-size:12px}
    .dexCategoryTabs button.on{background:#07111e;color:white}
    .dexCategoryPanel{padding:12px;border-radius:18px;background:linear-gradient(135deg,#fff,#f7fbff);border:1px solid #0000000d;margin:8px 0 12px;font-size:12px;font-weight:900;color:#0009;line-height:1.45}
    .dexCategoryPanel b{display:block;font-size:15px;color:#07111e;margin-bottom:5px}
  `;
  document.head.appendChild(style);
}
function isDexOpen() {
  const body = $('#modalBody');
  return !!body && !!body.querySelector('.dexHeader') && body.textContent.includes('곤충');
}
function renderTabs() {
  const legend = loadLegendary();
  const noted = Object.keys(legend.noted || {}).length;
  const caught = Object.keys(legend.caught || {}).length;
  return `<div id="dexCategoryGuard" class="dexCategoryTabs">
    <button class="on" data-dex-filter="all">일반<br><small>기본 도감</small></button>
    <button data-dex-filter="rare">희귀<br><small>보라 이상</small></button>
    <button data-dex-filter="legend">전설<br><small>${noted}/${Math.max(4, noted)} 기록 · ${caught} 채집</small></button>
  </div><div id="dexCategoryInfo" class="dexCategoryPanel"><b>도감 분류</b>일반 도감은 모든 곤충을 표시합니다. 희귀는 보라/실버/골드/다이아 등급 기록 중심, 전설은 전설 곤충 기록 섹션에서 확인합니다.</div>`;
}
function applyFilter(type) {
  const cards = Array.from(document.querySelectorAll('.dexCard'));
  const info = $('#dexCategoryInfo');
  document.querySelectorAll('[data-dex-filter]').forEach((button) => button.classList.toggle('on', button.dataset.dexFilter === type));
  if (type === 'all') {
    cards.forEach((card) => card.style.display = '');
    if (info) info.innerHTML = '<b>일반 도감</b>모든 곤충의 발견 여부와 최고 등급 기록을 확인합니다.';
  }
  if (type === 'rare') {
    cards.forEach((card) => {
      const text = card.textContent || '';
      const rare = text.includes('보라') || text.includes('실버') || text.includes('골드') || text.includes('다이아') || text.includes('최고 미확인');
      card.style.display = rare ? '' : 'none';
    });
    if (info) info.innerHTML = '<b>희귀 도감</b>보라/실버/골드/다이아 등급 기록을 중심으로 확인합니다. 아직 희귀 기록이 적으면 일부 미확인 카드만 보일 수 있습니다.';
  }
  if (type === 'legend') {
    cards.forEach((card) => card.style.display = 'none');
    const legendSection = $('#legendDexSection');
    if (legendSection) legendSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (info) info.innerHTML = '<b>전설 도감</b>아래 전설 곤충 섹션에서 목격/채집 기록을 확인합니다.';
  }
}
function injectDexCategories() {
  if (!isDexOpen() || $('#dexCategoryGuard')) return;
  injectStyle();
  const header = $('#modalBody .dexHeader');
  if (!header) return;
  header.insertAdjacentHTML('afterend', renderTabs());
  document.querySelectorAll('[data-dex-filter]').forEach((button) => button.onclick = () => applyFilter(button.dataset.dexFilter));
}
function init() {
  injectDexCategories();
  const body = $('#modalBody');
  if (body && body.dataset.dexCategoryObserver !== 'on') {
    body.dataset.dexCategoryObserver = 'on';
    new MutationObserver(() => setTimeout(injectDexCategories, 0)).observe(body, { childList: true, subtree: true });
  }
}
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
setTimeout(init, 1200);
