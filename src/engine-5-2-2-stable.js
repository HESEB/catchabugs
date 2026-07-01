// Engine 5.2.2 legacy shim retired by Engine 5.5.1.
// This file intentionally no longer registers requestAnimationFrame loops,
// global back-button capture handlers, radar click handlers, or BUG HOLE button overrides.
// The active responsibilities moved to:
// - modal-nav-guard.js: modal navigation bar presentation only
// - engine-5-5-0-menu-navigation.js: unified back/close routing
// - bug-hole-system.js / bug-hole-markers.js: BUG HOLE behavior
// - radar-ui-compact.js / engine-5-3-6-compass-mode.js: radar compass behavior
function retireEngine522LegacyShim() {
  document.documentElement.dataset.engine522Retired = 'on';
  document.querySelectorAll('#engine522Compass').forEach((node) => node.remove());
}

document.addEventListener('DOMContentLoaded', () => setTimeout(retireEngine522LegacyShim, 100));
setTimeout(retireEngine522LegacyShim, 500);
