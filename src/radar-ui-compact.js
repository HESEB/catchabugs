// Radar compact behavior is now handled by src/radar-compass-system.js.
function markRadarCompactRetired(){
  document.documentElement.dataset.radarCompactRetired='on';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(markRadarCompactRetired,100));
setTimeout(markRadarCompactRetired,500);
