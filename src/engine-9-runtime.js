const VERSION='9.0-unified-core';
const ACTIVE_FILES=['src/main-radar.js','src/badge-title.js','src/time-weather.js','src/economy.js','src/profile-system.js','src/npc-lab.js','src/legendary-event.js','src/return-discovery.js','src/return-stones.js','src/menu-remaster.js','src/economy-menu.js','src/bug-hole-system.js','src/bug-hole-markers.js','src/active-items.js','src/active-items-bridge.js','src/backpack-system.js','src/save-reset-guard.js','src/random-npc.js','src/npc-api-bridge.js','src/gps-system.js','src/radar-compass-system.js','src/engine-9-runtime.js'];
const RESERVED_FILES=['src/region-remaster.js','src/visual-polish-7.js','src/stable-map-region.js','src/dex-reward.js','src/legendary-dex-fix.js','src/dex-category-guard.js','src/dex-grade-ledger.js','src/modal-nav-guard.js','src/ui-cleanup.js','src/engine-5-4-0-stability.js'];
const OWNERS={core:'src/main-radar.js',map:'src/main-radar.js',gps:'src/gps-system.js',compass:'src/radar-compass-system.js',menu:'src/menu-remaster.js',bugHole:'src/bug-hole-system.js',backpack:'src/backpack-system.js',npc:'src/random-npc.js',save:'src/save-reset-guard.js'};
function normalize(src){return String(src||'').split('?')[0].replace(/^\.\//,'')}
function scripts(){return [...document.querySelectorAll('script[src]')].map(s=>normalize(s.getAttribute('src')))}
function status(){const loaded=scripts();return{version:VERSION,loaded,activeFiles:ACTIVE_FILES,reservedFiles:RESERVED_FILES,owners:OWNERS}}
window.CATCHABUGS_ENGINE={version:VERSION,status,activeFiles:ACTIVE_FILES,reservedFiles:RESERVED_FILES,owners:OWNERS};
window.CATCHABUGS_ENGINE_9=window.CATCHABUGS_ENGINE;
document.body.dataset.engineVersion=VERSION;
console.info('[CATCHA BUGS]',VERSION,'runtime manifest ready');
