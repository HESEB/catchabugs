// Engine 2.0 menu guard
// Keeps the bottom bar fixed to the 4 hub buttons even when legacy modules create extra mini buttons later.

const HUB_IDS = ['menuHub-note', 'menuHub-quest', 'menuHub-return', 'menuHub-settings'];

function injectMenuLockStyle() {
  if (document.getElementById('menuLockStyle')) return;
  const style = document.createElement('style');
  style.id = 'menuLockStyle';
  style.textContent = `
    .bottom.menuHub > .mini:not(.menuHubBtn){display:none!important;}
    .bottom.menuHub > [data-menu-legacy="true"]{display:none!important;}
    .bottom.menuHub .menuHubBtn{display:flex!important;}
  `;
  document.head.appendChild(style);
}

function lockMenu() {
  const bottom = document.querySelector('.bottom');
  if (!bottom) return;
  bottom.classList.add('menuHub');
  Array.from(bottom.children).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const isHub = HUB_IDS.includes(node.id) || node.classList.contains('menuHubBtn');
    if (!isHub) {
      node.dataset.menuLegacy = 'true';
      node.style.display = 'none';
    } else {
      node.style.display = '';
    }
  });
}

function bootMenuLock() {
  injectMenuLockStyle();
  lockMenu();
  const bottom = document.querySelector('.bottom');
  if (!bottom || bottom.dataset.menuLockObserver === 'on') return;
  bottom.dataset.menuLockObserver = 'on';
  const observer = new MutationObserver(lockMenu);
  observer.observe(bottom, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
  setInterval(lockMenu, 1200);
}

document.addEventListener('DOMContentLoaded', () => setTimeout(bootMenuLock, 120));
setTimeout(bootMenuLock, 400);
setTimeout(bootMenuLock, 1200);
