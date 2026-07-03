// Compass mode behavior is now handled by src/radar-compass-system.js.
function markCompassModeRetired(){
  document.documentElement.dataset.compassModeRetired='on';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(markCompassModeRetired,100));
setTimeout(markCompassModeRetired,500);
