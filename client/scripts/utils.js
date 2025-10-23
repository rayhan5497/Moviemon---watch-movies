let backdrop = null;
let activeElement = null;

const toggleScroll = () => {
  const body = document.body;
  if (body.style.overflow !== 'hidden') {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
};

function showBackdrop(element, fn) {
  // Toggle off if same element clicked again
  if (activeElement === element) {
    hideBackdrop();
    return;
  }

  toggleScroll();

  backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.style.position = 'fixed';
  backdrop.style.top = 0;
  backdrop.style.left = 0;
  backdrop.style.width = '100vw';
  backdrop.style.height = '100vh';
  backdrop.style.background = 'rgba(0, 0, 0, 0.5)';
  backdrop.style.zIndex = 99998;
  backdrop.style.opacity = 0;
  backdrop.style.pointerEvents = 'none';
  backdrop.style.transition = 'opacity 0.2s ease';
  backdrop.addEventListener('click', (e) => hideBackdrop(fn(e)));

  // Compute stacking context of target
  const computed = window.getComputedStyle(element);
  const parent = element.parentNode;

  // Ensure element is above backdrop
  if (computed.position === 'static') {
    element.style.position = 'relative';
  }
  element.style.zIndex = 99999;

  if (parent) {
    // Append backdrop right before element’s stacking context
    parent.insertBefore(backdrop, element);
  }

  // Show backdrop
  requestAnimationFrame(() => {
    backdrop.style.opacity = 1;
    backdrop.style.pointerEvents = 'auto';
  });

  activeElement = element;
}

function hideBackdrop(e) {
  if (!activeElement) return;

  console.log('Hiding backdrop', e);

  if (e === false) return;

  toggleScroll();

  backdrop.style.opacity = 0;
  backdrop.style.pointerEvents = 'none';

  requestAnimationFrame(() => {
    if (backdrop.parentNode) {
      console.log('backdrop parent', backdrop.parentNode);
      backdrop.parentNode.removeChild(backdrop);
    }
  });
  activeElement.style.zIndex = '';
  if (window.getComputedStyle(activeElement).position === 'relative') {
    activeElement.style.position = '';
  }

  activeElement = null;
}

export { showBackdrop, hideBackdrop };
