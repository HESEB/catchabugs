const DEBUG_KEY = 'catchabugs.debug.panel.v539';
const LOG_LIMIT = 14;
const logs = [];
let lastStatus = '';

function $(selector) { return document.querySelector(selector); }
function enabled() { return localStorage.getItem(DEBUG_KEY) === 'on'; }
function setEnabled(value) { localStorage.setItem(DEBUG_KEY, value ? 'on' : 'off'); renderPanel(); updateDevButton(); }
function now() { return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function shortText(node) { return (node?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70); }
function log(message, detail = '') {
  if (!enabled()) return;
  logs.unshift(`[${now()}] ${message}${detail ? ` · ${detail}` : ''}`);
  logs.splice(LOG_LIMIT);
  renderPanel();
}
function describe(target) {
  if (!target) return 'target 없음';
  const el = target.closest?.('button,[id],[data-target],[data-panel],[data-modal-back],[data-modal-close],.bug,.fieldNpc') || target;
  const id = el.id ? `#${el.id}` : '';
  const cls = typeof el.className === 'string' && el.className ? `.${el.className.split(/\s+/).slice(0, 2).join('.')}` : '';
  const data = el.dataset ? Object.keys(el.dataset).map((key) => `${key}=${el.dataset[key]}`).join(',') : '';
  return `${el.tagName || '?'}${id}${cls}${data ? ` [${data}]` : ''} "${shortText(el)}"`;
}
function injectStyle() {
  if ($('#engine539DebugStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine539DebugStyle';
  style.textContent = `
    #engine539DebugPanel{position:fixed;left:8px;top:8px;z-index:99999;width:min(340px,calc(100vw - 16px));max-height:42vh;overflow:auto;padding:8px;border-radius:14px;background:#07111eee;color:#eaffff;border:1px solid #9af7ff66;box-shadow:0 12px 32px #0009;font-size:10px;font-weight:900;line-height:1.35;box-sizing:border-box;white-space:pre-wrap;pointer-events:auto}
    #engine539DebugPanel b{color:#9af7ff;font-size:11px}.engine539Head{display:flex;justify-content:space-between;gap:6px;align-items:center;margin-bottom:5px}.engine539Head button{border:0;border-radius:999px;background:#ffffff24;color:white;font-size:10px;font-weight:1000;padding:4px 7px}.engine539Log div{border-top:1px solid #ffffff18;padding:3px 0}.engine539Status{color:#ffffffb8;font-size:9px;line-height:1.35;margin-bottom:4px}
    #devDebugToggle.toggleOn{outline:2px solid #82f7c1;background:#82f7c133!important}
  `;
  document.head.appendChild(style);
}
function statusText() {
  const modal = $('#modal');
  const modalOpen = !!modal && modal.style.display !== 'none';
  const list = [
    `modal:${modalOpen}`,
    `title:${shortText($('#modalNavGuardBar .modalGuardTitle') || $('#modalBody h2')) || '-'}`,
    `radar:${!!$('#radar')}`,
    `bugs:${document.querySelectorAll('.bug').length}`,
    `npc:${window.CATCHABUGS_RANDOM_NPC?.list?.().length ?? document.querySelectorAll('.fieldNpc').length}`,
    `compass:${document.body.dataset.compassMode || '-'}`,
    `back:${!!$('[data-modal-back]')}`,
  ];
  return list.join(' / ');
}
function renderPanel() {
  injectStyle();
  let panel = $('#engine539DebugPanel');
  if (!enabled()) {
    if (panel) panel.remove();
    return;
  }
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'engine539DebugPanel';
    document.body.appendChild(panel);
  }
  const status = statusText();
  panel.innerHTML = `<div class="engine539Head"><b>DEBUG 5.3.9</b><button id="engine539Close">OFF</button></div><div class="engine539Status">${status}</div><div class="engine539Log">${logs.map((item) => `<div>${item}</div>`).join('')}</div>`;
  $('#engine539Close')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setEnabled(false);
  });
  if (status !== lastStatus) {
    lastStatus = status;
  }
}
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = 'none'; }, 1200);
}
function isDeveloperModal() {
  const body = $('#modalBody');
  if (!body) return false;
  const title = body.querySelector('.menuHubHeader h2')?.textContent || body.querySelector('.modalGuardTitle')?.textContent || body.querySelector('h2')?.textContent || '';
  return title.includes('개발자모드');
}
function ensureDevDebugButton() {
  const body = $('#modalBody');
  if (!body || !isDeveloperModal()) return;
  if ($('#devDebugPanelTools')) {
    updateDevButton();
    return;
  }
  const sheet = body.querySelector('.menuHubSheet') || body.firstElementChild || body;
  const panel = document.createElement('div');
  panel.id = 'devDebugPanelTools';
  panel.className = 'devPanel';
  panel.innerHTML = `<h3>디버그</h3><div class="devActions"><button id="devDebugToggle">디버그 패널 OFF</button><button id="devDebugClear">로그 지우기</button></div>`;
  sheet.appendChild(panel);
  $('#devDebugToggle')?.addEventListener('click', () => {
    const next = !enabled();
    setEnabled(next);
    toast(next ? '디버그 패널 ON' : '디버그 패널 OFF');
    log('debug toggled', next ? 'ON' : 'OFF');
  });
  $('#devDebugClear')?.addEventListener('click', () => {
    logs.length = 0;
    renderPanel();
    toast('디버그 로그 삭제');
  });
  updateDevButton();
}
function updateDevButton() {
  const btn = $('#devDebugToggle');
  if (!btn) return;
  const on = enabled();
  btn.textContent = `디버그 패널 ${on ? 'ON' : 'OFF'}`;
  btn.classList.toggle('toggleOn', on);
}
function bindTrace() {
  if (document.documentElement.dataset.engine539Trace === 'on') return;
  document.documentElement.dataset.engine539Trace = 'on';
  document.addEventListener('pointerdown', (event) => {
    const t = event.target;
    if (t.closest?.('.bug')) log('pointer bug', describe(t));
    else if (t.closest?.('.fieldNpc')) log('pointer npc', describe(t));
    else if (t.closest?.('[data-modal-back]')) log('pointer back', describe(t));
    else if (t.closest?.('[data-modal-close]')) log('pointer close', describe(t));
    else if (t.closest?.('#radar,#radarCompassToggle')) log('pointer radar', describe(t));
    else if (t.closest?.('.menuHubBtn,.menuHubItem,.mini')) log('pointer menu', describe(t));
  }, true);
  document.addEventListener('click', (event) => {
    const t = event.target;
    if (t.closest?.('.bug')) log('click bug', describe(t));
    else if (t.closest?.('.fieldNpc')) log('click npc', describe(t));
    else if (t.closest?.('[data-modal-back]')) log('click back', shortText($('#modalBody')));
    else if (t.closest?.('[data-modal-close]')) log('click close', shortText($('#modalBody')));
    else if (t.closest?.('#radar,#radarCompassToggle')) log('click radar', describe(t));
    else if (t.closest?.('.menuHubBtn,.menuHubItem,.mini')) log('click menu', describe(t));
  }, true);
}
function tick() {
  bindTrace();
  ensureDevDebugButton();
  renderPanel();
  setTimeout(tick, 500);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 500));
setTimeout(tick, 1200);
