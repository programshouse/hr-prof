import { toPng } from 'html-to-image';

function removeExcludedNodes(root) {
  root
    .querySelectorAll('[data-exclude-from-image="true"]')
    .forEach((el) => el.remove());
}

function resolveCaptureWidth(node, captureWidth) {
  if (captureWidth && captureWidth > 0) {
    return Math.ceil(captureWidth);
  }

  const rect = node.getBoundingClientRect();
  return Math.ceil(
    Math.max(node.scrollWidth, node.offsetWidth, rect.width, 1)
  );
}

export async function captureElementAsPng(node, options = {}) {
  if (!node) {
    throw new Error('captureElementAsPng: node is required');
  }

  const { captureWidth: captureWidthOption, filter, ...toPngOptions } =
    options;

  const captureWidth = resolveCaptureWidth(node, captureWidthOption);

  const clone = node.cloneNode(true);
  removeExcludedNodes(clone);

  const wrapper = document.createElement('div');
  const dir = node.closest('[dir]')?.getAttribute('dir');
  if (dir) {
    wrapper.setAttribute('dir', dir);
  }

  wrapper.style.cssText = [
    'position: fixed',
    'left: 0',
    'top: 0',
    'transform: translateX(-10000px)',
    'z-index: -1',
    'pointer-events: none',
    'overflow: visible',
    'background: #ffffff',
    `width: ${captureWidth+48}px`,
    `min-width: ${captureWidth}px`,
  ].join(';');

  clone.style.cssText = [
    'box-sizing: border-box',
    `width: ${captureWidth}px`,
    `min-width: ${captureWidth}px`,
    'max-width: none',
    'height: auto',
    'max-height: none',
    'overflow: visible',
    'padding: 24px',
    'background: #ffffff',
  ].join(';');

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    const width = Math.max(clone.scrollWidth, captureWidth);
    const height = clone.scrollHeight;

    return await toPng(clone, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width,
      height,
      ...toPngOptions,
      filter: (domNode) => {
        if (domNode?.dataset?.excludeFromImage === 'true') {
          return false;
        }
        return filter ? filter(domNode) : true;
      },
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}
