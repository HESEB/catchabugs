function $(selector) { return document.querySelector(selector); }
function gameApi() { return window.CATCHABUGS_GAME || null; }
function bugHole() { return window.CATCHABUGS_BUG_HOLE || null; }
function ensureLayer() {
  let layer = $('#bugHoleMarkerLayer');
  if (layer) return layer;
  const game = $('#game');
  if (!game) return null;
  layer = document.createElement('div');
  layer.id = 'bugHoleMarkerLayer';
  game.appendChild(layer);
  return layer;
}
function injectStyle() {
  if ($('#bugHoleMarkerStyle')) return;
  const style = document.createElement('style');
  style.id = 'bugHoleMarkerStyle';
  style.textContent = `
    #bugHoleMarkerLayer{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:hidden}
    .bugHoleMarker{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#07111edc;color:white;border:1px solid #82f7c177;box-shadow:0 0 16px #18d7ff55,0 8px 18px #0004;font-size:10px;font-weight:1000;white-space:nowrap}
    .bugHoleMarker b{font-size:13px;color:#82f7c1}.bugHoleMarker.near{background:#0b7655e8;box-shadow:0 0 22px #82f7c188,0 8px 18px #0004}.bugHoleMarker.edge{opacity:.75}
  `;
  document.head.appendChild(style);
}
function screenDelta(player, point) {
  return { dx: Number(point.x || 0) - Number(player.x || 0), dy: Number(point.y || 0) - Number(player.y || 0) };
}
function renderMarkers() {
  injectStyle();
  const layer = ensureLayer();
  const api = gameApi();
  const system = bugHole();
  if (!layer || !api || !system) return;
  const player = api.getPlayer?.();
  const state = system.loadState?.();
  if (!player || !state) return;
  const points = system.points || [];
  layer.innerHTML = '';
  points.filter((point) => point.x !== undefined && state.installed?.[point.id]).forEach((point) => {
    const { dx, dy } = screenDelta(player, point);
    const dist = Math.hypot(dx, dy);
    if (dist > 1100) return;
    const x = Math.max(-170, Math.min(170, dx));
    const y = Math.max(-270, Math.min(270, dy));
    const marker = document.createElement('div');
    marker.className = `bugHoleMarker ${dist < 160 ? 'near' : ''} ${dist > 420 ? 'edge' : ''}`;
    marker.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    marker.innerHTML = `<b>🌀</b><span>${point.name}</span><small>${Math.max(1, Math.round(dist / 45))}걸음</small>`;
    layer.appendChild(marker);
  });
}
function init() { injectStyle(); setInterval(renderMarkers, 700); }
document.addEventListener('DOMContentLoaded', () => setTimeout(init, 700));
setTimeout(init, 1200);
