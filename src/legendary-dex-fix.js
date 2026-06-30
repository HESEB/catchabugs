const LEGENDARY_KEY = 'catchabugs.legendary.v2';
const LEGENDARIES = [
  { id: 'golden-stag', name: '황금왕사슴벌레', emoji: '🪲', grade: 'LEGEND', region: '숲', hint: '오래된 나무 수액 근처에서 목격된다.' },
  { id: 'moon-firefly', name: '달빛반딧불이', emoji: '✨', grade: 'LEGEND', region: '강가', hint: '밤 시간대 강가에서 발광 신호가 강해진다.' },
  { id: 'blue-emperor', name: '청제왕잠자리', emoji: '🦋', grade: 'LEGEND', region: '초원', hint: '바람 부는 초원에서 빠른 신호로 감지된다.' },
  { id: 'diamond-morpho', name: '다이아모르포나비', emoji: '💎', grade: 'MYTH', region: '초원/숲', hint: '맑은 날 숲과 초원의 경계에서 목격된다.' },
];
function $(selector) { return document.querySelector(selector); }
function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function loadLegendary() { return safeParse(localStorage.getItem(LEGENDARY_KEY)) || { noted: {}, caught: {} }; }
function saveLegendary(state) { localStorage.setItem(LEGENDARY_KEY, JSON.stringify(state)); }
function toast(message) { const node = $('#toast'); if (!node) return; node.textContent = message; node.style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.style.display = 'none', 1300); }
function style() { return `<style id="legendFixStyle">.legendFix{margin-top:16px}.legendFixHead{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 10px}.legendFixHead h2{margin:0}.legendFixHead div{font-size:12px;font-weight:1000;color:#7b4dff}.legendFixTabs{display:flex;gap:6px;margin:8px 0 12px}.legendFixTabs span{border-radius:999px;padding:7px 10px;background:#07111e;color:white;font-size:11px;font-weight:1000}.legendFixCard{display:flex;gap:12px;align-items:center;border-radius:20px;background:linear-gradient(135deg,#fff,#f7f1ff);border:1px solid #0000000d;box-shadow:0 8px 18px #0001;padding:12px;margin:9px 0}.legendFixIcon{width:56px;height:56px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 0 0 1px #0001}.legendFixInfo{flex:1}.legendFixTop{display:flex;justify-content:space-between;gap:8px}.legendFixTop b{font-size:15px}.legendFixTop span{font-size:10px;font-weight:1000;border-radius:999px;padding:5px 7px;background:#7b4dff18;color:#5c2fe0}.legendFixInfo p{margin:6px 0;color:#0009;font-size:12px;font-weight:800}.legendFixInfo button{border:0;border-radius:12px;background:#07111e;color:white;padding:8px 10px;font-weight:1000}.legendResultActions{display:flex;gap:8px;margin-top:12px}.legendResultActions button{flex:1;border:0;border-radius:13px;background:#07111e;color:white;padding:11px;font-weight:1000}</style>`; }
function renderSection() {
  const state = loadLegendary();
  const noted = LEGENDARIES.filter((item) => state.noted[item.id]).length;
  const cards = LEGENDARIES.map((item) => {
    const isNoted = !!state.noted[item.id];
    const isCaught = !!state.caught[item.id];
    return `<article class="legendFixCard"><div class="legendFixIcon">${isNoted ? item.emoji : '❔'}</div><div class="legendFixInfo"><div class="legendFixTop"><b>${isNoted ? item.name : '?????'}</b><span>${isCaught ? '채집기록' : isNoted ? '목격기록' : item.grade}</span></div><p>${isNoted ? `${item.region} · ${item.hint}` : '아직 전설 신호가 도감에 기록되지 않았습니다.'}</p><button data-legend-fix-note="${item.id}" ${isNoted ? 'disabled' : ''}>${isNoted ? '기록됨' : '도감에 기록'}</button></div></article>`;
  }).join('');
  return `${style()}<section id="legendDexSection" class="legendFix"><div class="legendFixHead"><h2>전설 곤충</h2><div>${noted}/${LEGENDARIES.length}</div></div><div class="legendFixTabs"><span>일반 도감 아래 통합</span><span>전설</span></div>${cards}</section>`;
}
function wire() {
  document.querySelectorAll('[data-legend-fix-note]').forEach((button) => {
    button.onclick = () => {
      const item = LEGENDARIES.find((legend) => legend.id === button.dataset.legendFixNote);
      if (!item) return;
      const state = loadLegendary();
      state.noted[item.id] = { at: new Date().toLocaleString('ko-KR'), source: '도감' };
      saveLegendary(state);
      window.CATCHABUGS_GAME?.addLog?.(`${item.name} 전설 도감 기록`, item.emoji);
      toast(`${item.name} 도감 기록`);
      const section = $('#legendDexSection');
      if (section) section.outerHTML = renderSection();
      wire();
    };
  });
}
function attachToDex() {
  const body = $('#modalBody');
  if (!body || $('#legendDexSection')) return;
  const header = body.querySelector('.dexHeader h2');
  if (!header || !header.textContent.includes('곤충')) return;
  body.insertAdjacentHTML('beforeend', renderSection());
  wire();
}
function fixLegendResult() {
  const body = $('#modalBody');
  if (!body || !body.textContent.includes('전설')) return;
  if (!body.querySelector('.legendHeader') && !body.querySelector('.legendFixHead')) return;
  if (body.querySelector('.legendResultActions')) return;
  body.insertAdjacentHTML('beforeend', `<div class="legendResultActions"><button data-legend-close>게임으로</button><button data-legend-dex>도감 보기</button></div>`);
  const modal = $('#modal');
  body.querySelector('[data-legend-close]').onclick = () => { if (modal) modal.style.display = 'none'; };
  body.querySelector('[data-legend-dex]').onclick = () => {
    const openDex = $('#openDex');
    if (openDex) openDex.click(); else attachToDex();
  };
}
function init() {
  attachToDex();
  fixLegendResult();
  const body = $('#modalBody');
  if (!body || body.dataset.legendDexFixObserver === 'on') return;
  body.dataset.legendDexFixObserver = 'on';
  new MutationObserver(() => { setTimeout(attachToDex, 0); setTimeout(fixLegendResult, 0); }).observe(body, { childList: true, subtree: true });
}
window.CATCHABUGS_LEGENDARY_DEX_FIX = { attachToDex, renderSection };
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
setTimeout(init, 800);
