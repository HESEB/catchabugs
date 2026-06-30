// Compass toggle shim
// Loaded before main-radar.js. It lets the original compass code register normally,
// but gates deviceorientation updates when the user turns the compass off.

window.CATCHABUGS_COMPASS_ENABLED = false;

const originalAddEventListener = window.addEventListener.bind(window);
const wrappedListeners = new WeakMap();

window.addEventListener = function patchedAddEventListener(type, listener, options) {
  if (type === 'deviceorientation' && typeof listener === 'function') {
    if (!wrappedListeners.has(listener)) {
      wrappedListeners.set(listener, function gatedDeviceOrientation(event) {
        if (window.CATCHABUGS_COMPASS_ENABLED) listener.call(this, event);
      });
    }
    return originalAddEventListener(type, wrappedListeners.get(listener), options);
  }
  return originalAddEventListener(type, listener, options);
};

function toast(message) {
  const node = document.querySelector('#toast');
  if (!node) return;
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function setButtonLabel(button) {
  if (!button) return;
  button.textContent = window.CATCHABUGS_COMPASS_ENABLED ? '모바일 나침반 끄기' : '모바일 나침반 켜기';
}

function switchToDevCompass() {
  const slider = document.querySelector('#headingSlider');
  if (slider) slider.dispatchEvent(new Event('input', { bubbles: true }));
}

function wireCompassButton() {
  const button = document.querySelector('#compassBtn');
  if (!button || button.dataset.compassTogglePatched === 'on') return;
  button.dataset.compassTogglePatched = 'on';
  setButtonLabel(button);

  button.addEventListener('click', (event) => {
    if (!window.CATCHABUGS_COMPASS_ENABLED) {
      window.CATCHABUGS_COMPASS_ENABLED = true;
      setTimeout(() => setButtonLabel(button), 80);
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.CATCHABUGS_COMPASS_ENABLED = false;
    switchToDevCompass();
    setButtonLabel(button);
    toast('모바일 나침반 OFF · 개발자 슬라이더 사용');
  }, true);
}

function initCompassToggle() {
  wireCompassButton();
  const game = document.querySelector('#game');
  if (!game || game.dataset.compassToggleObserver === 'on') return;
  game.dataset.compassToggleObserver = 'on';
  new MutationObserver(wireCompassButton).observe(game, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(initCompassToggle, 80));
setTimeout(initCompassToggle, 400);
setTimeout(initCompassToggle, 1200);
