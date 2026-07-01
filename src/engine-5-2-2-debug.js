const DEBUG_KEY = 'catchabugs.debug522.enabled';
let enabled = localStorage.getItem(DEBUG_KEY) !== 'off';
const logs = [];

function $(selector) { return document.querySelector(selector); }
function now() { return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function shortText(node) { return (node?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80); }
function log(message, data = '') {
  const line = `[${now()}] ${message}${data ? ` · ${data}` : ''}`;
  logs.unshift(line);
  logs.splice(12);
  console.log('[CATCHABUGS 5.2.2 DEBUG]', line);
  render();
}
function injectStyle() {
  if ($('#engine522DebugStyle')) return;
  const style = document.createElement('style');
  style.id = 'engine522DebugStyle';
  style.textContent = `
    #engine522Debug{position:fixed;left:8px;top:8px;z-index:99999;width:min(320px,calc(100vw - 16px));max-height:42vh;overflow:auto;padding:8px;border-radius:14px;background:#090e18e8;color:#eaffff;border:1px solid #9af7ff66;box-shadow:0 10px 28px #0009;font-size:10px;font-weight:900;line-height:1.35;box-sizing:border-box;white-space:pre-wrap;pointer-events:auto}
    #engine522Debug.off{opacity:.45;max-height:32px;overflow:hidden}
    #engine522DebugHead{display:flex;justify-content:space-between;gap:6px;align-items:center;margin-bottom:5px}
    #engine522DebugHead b{font-size:11px;color:#9af7ff}
    #engine522DebugHead button{border:0;border-radius:999px;background:#ffffff22;color:white;font-size:10px;font-weight:1000;padding:4px 7px}
    #engine522DebugLog div{border-top:1px solid #ffffff18;padding:3px 0}
  `;
  document.head.appendChild(style);
}
function render() {
  injectStyle();
  let panel = $('#engine522Debug');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'engine522Debug';
    document.body.appendChild(panel);
  }
  panel.classList.toggle('off', !enabled);
  const modal = $('#modal');
  const modalOpen = modal && modal.style.display !== 'none';
  const summary = [
    `radar:${!!$('#radar')}`,
    `radarBtn:${!!$('#radarCompassToggle')}`,
    `compassBtn:${!!$('#compassBtn')}`,
    `modal:${modalOpen}`,
    `back:${!!$('[data-menu-back]')}`,
  ].join(' / ');
  panel.innerHTML = `<div id="engine522DebugHead"><b>DEBUG 5.2.2</b><span>${summary}</span><button id="engine522DebugToggle">${enabled ? '접기' : '열기'}</button></div><div id="engine522DebugLog">${enabled ? logs.map((item) => `<div>${item}</div>`).join('') : ''}</div>`;
  $('#engine522DebugToggle')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    enabled = !enabled;
    localStorage.setItem(DEBUG_KEY, enabled ? 'on' : 'off');
    render();
  });
}
function describeTarget(target) {
  if (!target) return 'target 없음';
  const el = target.closest?.('button,[id],[data-menu-back],[data-menu-close],[data-panel],[data-target]') || target;
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className && typeof el.className === 'string' ? `.${el.className.split(/\s+/).filter(Boolean).slice(0,2).join('.')}` : '';
  const data = el.dataset ? Object.keys(el.dataset).map((key) => `${key}=${el.dataset[key]}`).join(',') : '';
  return `${el.tagName || '?'}${id}${cls}${data ? ` [${data}]` : ''} "${shortText(el)}"`;
}
function bindCaptureTrace() {
  document.addEventListener('pointerdown', (event) => {
    const t = event.target;
    if (t.closest?.('#radar')) log('pointerdown radar', describeTarget(t));
    if (t.closest?.('[data-menu-back]')) log('pointerdown menu-back', describeTarget(t));
    if (t.closest?.('[data-menu-close]')) log('pointerdown menu-close', describeTarget(t));
  }, true);
  document.addEventListener('click', (event) => {
    const t = event.target;
    if (t.closest?.('#radarCompassToggle')) log('click radarCompassToggle', `compassBtn=${!!$('#compassBtn')}`);
    else if (t.closest?.('#radar')) log('click radar area', describeTarget(t));
    if (t.closest?.('#compassBtn')) log('click native compassBtn', describeTarget(t));
    if (t.closest?.('[data-menu-back]')) log('click menu-back', `modalText="${shortText($('#modalBody'))}"`);
    if (t.closest?.('[data-menu-close]')) log('click menu-close', `modalText="${shortText($('#modalBody'))}"`);
    if (t.closest?.('.menuHubBtn')) log('click hub button', describeTarget(t));
    if (t.closest?.('.menuHubItem')) log('click hub item', describeTarget(t));
  }, true);
}
function heartbeat() {
  render();
  setTimeout(heartbeat, 1000);
}
function init() {
  injectStyle();
  bindCaptureTrace();
  log('debug build loaded', location.pathname);
  heartbeat();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
setTimeout(() => { if (!$('#engine522Debug')) init(); }, 1200);
