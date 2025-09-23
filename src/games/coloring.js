import { t } from '../i18n.js';

const DEFAULT_CANVAS_WIDTH = 960;
const DEFAULT_CANVAS_HEIGHT = 680;
const MAX_HISTORY = 25;
const BUCKET_TOLERANCE = 22;

const SOFT_PANTONE_PALETTE = [
  { id: 'cotton-candy', label: 'Pantone 705 C', value: '#f6d6de' },
  { id: 'apricot-cream', label: 'Pantone 4745 C', value: '#f4c7b5' },
  { id: 'peach-fuzz', label: 'Pantone 7411 C', value: '#f6d9b8' },
  { id: 'sunny-haze', label: 'Pantone 600 C', value: '#f3edba' },
  { id: 'sage-mist', label: 'Pantone 5807 C', value: '#dbe6c2' },
  { id: 'mint-puff', label: 'Pantone 559 C', value: '#cfe5d4' },
  { id: 'sea-glass', label: 'Pantone 628 C', value: '#cbe5ee' },
  { id: 'sky-vellum', label: 'Pantone 2706 C', value: '#d6d8f6' },
  { id: 'lilac-fog', label: 'Pantone 7443 C', value: '#e4d0f2' },
  { id: 'rosewater', label: 'Pantone 706 C', value: '#efd0d7' },
  { id: 'warm-sand', label: 'Pantone 480 C', value: '#eadbd1' },
  { id: 'soft-clay', label: 'Pantone 474 C', value: '#d8c4b8' },
];

const TOOL_OPTIONS = [
  { id: 'brush', labelKey: 'coloringGame.tools.brush' },
  { id: 'bucket', labelKey: 'coloringGame.tools.bucket' },
  { id: 'eraser', labelKey: 'coloringGame.tools.eraser' },
];

const BRUSH_SIZES = [
  { id: 'fine', size: 12, labelKey: 'coloringGame.brushSizes.fine' },
  { id: 'medium', size: 26, labelKey: 'coloringGame.brushSizes.medium' },
  { id: 'bold', size: 40, labelKey: 'coloringGame.brushSizes.bold' },
];

function hexToRgba(hex) {
  let normalized = hex.replace(/^#/, '');

  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return [r, g, b, 255];
}

function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function isWithinTolerance(data, index, target, tolerance) {
  return (
    Math.abs(data[index] - target[0]) <= tolerance &&
    Math.abs(data[index + 1] - target[1]) <= tolerance &&
    Math.abs(data[index + 2] - target[2]) <= tolerance &&
    Math.abs(data[index + 3] - target[3]) <= tolerance
  );
}

function floodFill(paintImage, outlineImage, startX, startY, fillColor, tolerance) {
  const { data, width, height } = paintImage;

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const startIndex = (startY * width + startX) * 4;
  const targetColor = [data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]];

  if (colorsMatch(targetColor, fillColor)) {
    return false;
  }

  const visited = new Uint8Array(width * height);
  const stack = [startX, startY];
  let changed = false;

  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();

    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }

    const offset = y * width + x;

    if (visited[offset] === 1) {
      continue;
    }

    visited[offset] = 1;

    const dataIndex = offset * 4;

    if (!isWithinTolerance(data, dataIndex, targetColor, tolerance)) {
      continue;
    }

    if (outlineImage && outlineImage.data[dataIndex + 3] > 70) {
      continue;
    }

    data[dataIndex] = fillColor[0];
    data[dataIndex + 1] = fillColor[1];
    data[dataIndex + 2] = fillColor[2];
    data[dataIndex + 3] = fillColor[3];
    changed = true;

    stack.push(x + 1, y);
    stack.push(x - 1, y);
    stack.push(x, y + 1);
    stack.push(x, y - 1);
  }

  return changed;
}

function drawPlaceholderGuide(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const stroke = 'rgba(47, 42, 40, 0.92)';
  const lineWidth = Math.max(width, height) * 0.008 + 4;

  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = stroke;

  // Body outline
  ctx.beginPath();
  ctx.moveTo(width * 0.24, height * 0.66);
  ctx.quadraticCurveTo(width * 0.24, height * 0.45, width * 0.38, height * 0.42);
  ctx.quadraticCurveTo(width * 0.5, height * 0.28, width * 0.62, height * 0.42);
  ctx.quadraticCurveTo(width * 0.76, height * 0.45, width * 0.76, height * 0.65);
  ctx.quadraticCurveTo(width * 0.77, height * 0.83, width * 0.5, height * 0.86);
  ctx.quadraticCurveTo(width * 0.23, height * 0.82, width * 0.24, height * 0.66);
  ctx.closePath();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.43, width * 0.18, height * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left ear
  ctx.beginPath();
  ctx.ellipse(width * 0.4, height * 0.29, width * 0.1, height * 0.16, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.28, width * 0.1, height * 0.17, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Eye shapes
  const eyeRadius = width * 0.028;
  ctx.beginPath();
  ctx.ellipse(width * 0.45, height * 0.41, eyeRadius, eyeRadius * 1.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.55, height * 0.41, eyeRadius, eyeRadius * 1.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Muzzle
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.5, width * 0.12, height * 0.08, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.49);
  ctx.lineTo(width * 0.5, height * 0.56);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.56);
  ctx.quadraticCurveTo(width * 0.58, height * 0.61, width * 0.63, height * 0.56);
  ctx.moveTo(width * 0.5, height * 0.56);
  ctx.quadraticCurveTo(width * 0.42, height * 0.61, width * 0.37, height * 0.56);
  ctx.stroke();

  // Cheek patches
  ctx.beginPath();
  ctx.ellipse(width * 0.4, height * 0.48, width * 0.07, height * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.48, width * 0.07, height * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Collar and tag
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.61, width * 0.22, height * 0.07, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.65);
  ctx.lineTo(width * 0.5, height * 0.72);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.74, width * 0.05, height * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Belly patch
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.7, width * 0.16, height * 0.12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(width * 0.7, height * 0.58);
  ctx.quadraticCurveTo(width * 0.84, height * 0.52, width * 0.82, height * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width * 0.8, height * 0.42);
  ctx.quadraticCurveTo(width * 0.86, height * 0.37, width * 0.76, height * 0.34);
  ctx.stroke();

  // Paws guidance
  ctx.beginPath();
  ctx.moveTo(width * 0.36, height * 0.82);
  ctx.lineTo(width * 0.36, height * 0.88);
  ctx.moveTo(width * 0.42, height * 0.82);
  ctx.lineTo(width * 0.42, height * 0.88);
  ctx.moveTo(width * 0.58, height * 0.82);
  ctx.lineTo(width * 0.58, height * 0.88);
  ctx.moveTo(width * 0.64, height * 0.82);
  ctx.lineTo(width * 0.64, height * 0.88);
  ctx.stroke();

  // Ground details
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.9);
  ctx.quadraticCurveTo(width * 0.5, height * 0.94, width * 0.8, height * 0.9);
  ctx.stroke();

  ctx.restore();
}

function createMarkup(state, palette) {
  const activeColor = palette.find((color) => color.id === state.activeColorId);
  const activeColorLabel = activeColor ? activeColor.label : '';

  return `
    <div class="flex flex-col gap-6" data-coloring-shell>
      <section class="flex flex-col gap-4 rounded-3xl border border-accent/15 bg-white/90 p-5 shadow-soft">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col gap-1">
            <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">${t('coloringGame.pageEyebrow')}</span>
            <h2 class="text-2xl text-accent md:text-3xl">${t('coloringGame.pageTitle')}</h2>
            <p class="text-sm text-text/70 md:text-base">${t('coloringGame.instructions')}</p>
          </div>
          <div class="flex flex-col gap-2" data-toolbar-tools></div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-3" data-active-color-info>
            <span class="h-6 w-6 rounded-full border border-white/70 shadow-soft" data-active-color style="background-color: ${state.activeColor};"></span>
            <span class="text-xs text-text/70" data-active-color-label>${t('coloringGame.activeColorLabel').replace('{label}', activeColorLabel)}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-accent/70">${t('coloringGame.palette.heading')}</span>
            <div class="flex flex-wrap gap-2" data-color-palette></div>
            <p class="text-xs text-text/60">${t('coloringGame.palette.hint')}</p>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-accent/70">${t('coloringGame.brushSize.heading')}</span>
            <div class="flex flex-wrap gap-2" data-brush-sizes></div>
          </div>
        </div>
      </section>
      <section class="flex flex-col gap-4 rounded-[2.5rem] border border-accent/10 bg-muted/60 p-4 shadow-soft">
        <div class="relative w-full overflow-hidden rounded-[2rem] border border-white/50 bg-white" data-canvas-wrapper>
          <canvas data-coloring-canvas class="block h-auto w-full" role="img" aria-label="${t('coloringGame.canvasLabel')}"></canvas>
        </div>
        <div class="flex flex-col gap-1 rounded-2xl border border-dashed border-accent/20 bg-white/70 p-4 text-sm text-text/70">
          <strong class="text-accent">${t('coloringGame.placeholder.title')}</strong>
          <p>${t('coloringGame.placeholder.description')}</p>
        </div>
      </section>
      <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-accent/15 bg-white/90 p-4 shadow-soft" data-toolbar-actions>
        <button type="button" class="rounded-full border border-accent/20 bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/40" data-action="undo">${t('coloringGame.actions.undo')}</button>
        <button type="button" class="rounded-full border border-accent/20 bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/40" data-action="redo">${t('coloringGame.actions.redo')}</button>
        <button type="button" class="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft transition" data-action="clear">${t('coloringGame.actions.clear')}</button>
        <button type="button" class="rounded-full border border-accent/20 bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/40" data-action="download">${t('coloringGame.actions.download')}</button>
        <div class="ml-auto text-xs text-text/60" aria-live="polite" data-status-region></div>
      </div>
    </div>
  `;
}

function getBrushSize(sizeId) {
  const match = BRUSH_SIZES.find((item) => item.id === sizeId);
  return match ? match.size : BRUSH_SIZES[1].size;
}

function addListener(target, type, handler, options, store) {
  target.addEventListener(type, handler, options);
  store.push(() => target.removeEventListener(type, handler, options));
}

export function mountColoringGame(root, options = {}) {
  if (!root) {
    throw new Error('Kleur game root ontbreekt.');
  }

  const palette = Array.isArray(options.palette) && options.palette.length > 0 ? options.palette : SOFT_PANTONE_PALETTE;
  const initialColorId = palette[0]?.id ?? 'cotton-candy';

  const state = {
    toolId: 'brush',
    brushSizeId: 'medium',
    activeColorId: initialColorId,
    activeColor: palette.find((color) => color.id === initialColorId)?.value ?? '#f6d6de',
    pointerId: null,
    isDrawing: false,
    lastPoint: null,
    hasMutated: false,
    history: [],
    historyIndex: -1,
  };

  root.setAttribute('data-game', 'coloring');
  root.innerHTML = createMarkup(state, palette);

  const disposers = [];
  let statusTimeoutId = null;

  const canvas = root.querySelector('[data-coloring-canvas]');
  const toolContainer = root.querySelector('[data-toolbar-tools]');
  const paletteContainer = root.querySelector('[data-color-palette]');
  const brushContainer = root.querySelector('[data-brush-sizes]');
  const activeColorPreview = root.querySelector('[data-active-color]');
  const activeColorLabel = root.querySelector('[data-active-color-label]');
  const actionsContainer = root.querySelector('[data-toolbar-actions]');
  const statusRegion = root.querySelector('[data-status-region]');
  const undoButton = actionsContainer?.querySelector('[data-action="undo"]');
  const redoButton = actionsContainer?.querySelector('[data-action="redo"]');
  const clearButton = actionsContainer?.querySelector('[data-action="clear"]');
  const downloadButton = actionsContainer?.querySelector('[data-action="download"]');

  if (!canvas || !toolContainer || !paletteContainer || !brushContainer || !actionsContainer) {
    throw new Error('Kon de vereiste kleurplaat elementen niet bouwen.');
  }

  const width = options.width ?? DEFAULT_CANVAS_WIDTH;
  const height = options.height ?? DEFAULT_CANVAS_HEIGHT;

  canvas.width = width;
  canvas.height = height;
  canvas.style.touchAction = 'none';

  const displayCtx = canvas.getContext('2d');
  const paintCanvas = document.createElement('canvas');
  paintCanvas.width = width;
  paintCanvas.height = height;
  const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });

  const outlineCanvas = document.createElement('canvas');
  outlineCanvas.width = width;
  outlineCanvas.height = height;
  const outlineCtx = outlineCanvas.getContext('2d');

  let outlineSnapshot = null;

  drawPlaceholderGuide(outlineCtx, width, height);
  outlineSnapshot = outlineCtx.getImageData(0, 0, width, height);

  function composite() {
    displayCtx.save();
    displayCtx.clearRect(0, 0, width, height);
    displayCtx.fillStyle = '#fdf8f4';
    displayCtx.fillRect(0, 0, width, height);
    displayCtx.drawImage(paintCanvas, 0, 0);
    displayCtx.drawImage(outlineCanvas, 0, 0);
    displayCtx.restore();
  }

  function updateActiveColorLabel() {
    const activeColor = palette.find((color) => color.id === state.activeColorId);

    if (activeColor && activeColorLabel) {
      activeColorLabel.textContent = t('coloringGame.activeColorLabel').replace('{label}', activeColor.label);
      activeColorLabel.setAttribute('aria-live', 'off');
      activeColorLabel.setAttribute('data-color-id', activeColor.id);
    }

    if (activeColorPreview) {
      activeColorPreview.style.backgroundColor = state.activeColor;
    }
  }

  function renderTools() {
    toolContainer.innerHTML = TOOL_OPTIONS.map((tool) => {
      const isActive = state.toolId === tool.id;
      const classes = [
        'rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
        isActive ? 'border-accent bg-accent text-white shadow-soft' : 'border-accent/20 bg-white text-accent hover:border-accent/40',
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${classes}"
          data-tool="${tool.id}"
          aria-pressed="${isActive}"
        >
          ${t(tool.labelKey)}
        </button>
      `;
    }).join('');
  }

  function renderPalette() {
    paletteContainer.innerHTML = palette
      .map((color) => {
        const isActive = color.id === state.activeColorId;
        const classes = [
          'h-10 w-10 rounded-2xl border shadow-soft transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
          isActive ? 'border-accent scale-105' : 'border-white/70 hover:border-accent/40',
        ]
          .filter(Boolean)
          .join(' ');

        return `
          <button
            type="button"
            class="${classes}"
            style="background-color: ${color.value};"
            data-color-id="${color.id}"
            aria-label="${t('coloringGame.aria.paletteColor').replace('{label}', color.label)}"
            aria-pressed="${isActive}"
            title="${color.label}"
          ></button>
        `;
      })
      .join('');
  }

  function renderBrushSizes() {
    brushContainer.innerHTML = BRUSH_SIZES.map((entry) => {
      const isActive = state.brushSizeId === entry.id;
      const classes = [
        'rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
        isActive ? 'border-accent bg-accent/10 text-accent shadow-soft' : 'border-accent/20 bg-white text-accent hover:border-accent/40',
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${classes}"
          data-brush-size="${entry.id}"
          aria-pressed="${isActive}"
        >
          ${t(entry.labelKey)}
        </button>
      `;
    }).join('');
  }

  function updateHistoryControls() {
    if (undoButton) {
      undoButton.disabled = state.historyIndex <= 0;
    }

    if (redoButton) {
      redoButton.disabled = state.historyIndex === -1 || state.historyIndex >= state.history.length - 1;
    }

    if (clearButton) {
      clearButton.disabled = state.historyIndex <= 0;
    }

    if (downloadButton) {
      downloadButton.disabled = state.historyIndex <= 0;
    }
  }

  function captureSnapshot() {
    if (state.historyIndex < state.history.length - 1) {
      state.history.splice(state.historyIndex + 1);
    }

    const snapshot = paintCtx.getImageData(0, 0, width, height);
    state.history.push(snapshot);

    if (state.history.length > MAX_HISTORY) {
      state.history.shift();
    }

    state.historyIndex = state.history.length - 1;
    updateHistoryControls();
  }

  function restoreSnapshot(index) {
    if (index < 0 || index >= state.history.length) {
      return;
    }

    state.historyIndex = index;
    paintCtx.putImageData(state.history[state.historyIndex], 0, 0);
    composite();
    updateHistoryControls();
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX ?? 0) - rect.left) * (width / rect.width);
    const y = ((event.clientY ?? 0) - rect.top) * (height / rect.height);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      return null;
    }

    return { x, y };
  }

  function drawPoint(point) {
    const radius = getBrushSize(state.brushSizeId) / 2;

    paintCtx.save();
    paintCtx.lineJoin = 'round';
    paintCtx.lineCap = 'round';

    if (state.toolId === 'eraser') {
      paintCtx.globalCompositeOperation = 'destination-out';
      paintCtx.beginPath();
      paintCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      paintCtx.fill();
    } else {
      paintCtx.globalCompositeOperation = 'source-over';
      paintCtx.fillStyle = state.activeColor;
      paintCtx.beginPath();
      paintCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      paintCtx.fill();
    }

    paintCtx.restore();
    state.hasMutated = true;
  }

  function drawStroke(from, to) {
    paintCtx.save();
    paintCtx.lineJoin = 'round';
    paintCtx.lineCap = 'round';
    paintCtx.lineWidth = getBrushSize(state.brushSizeId);

    if (state.toolId === 'eraser') {
      paintCtx.globalCompositeOperation = 'destination-out';
      paintCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      paintCtx.globalCompositeOperation = 'source-over';
      paintCtx.strokeStyle = state.activeColor;
    }

    paintCtx.beginPath();
    paintCtx.moveTo(from.x, from.y);
    paintCtx.lineTo(to.x, to.y);
    paintCtx.stroke();
    paintCtx.restore();
    state.hasMutated = true;
  }

  function applyBucket(point) {
    const fillColor = hexToRgba(state.activeColor);
    const image = paintCtx.getImageData(0, 0, width, height);
    const changed = floodFill(image, outlineSnapshot, Math.floor(point.x), Math.floor(point.y), fillColor, BUCKET_TOLERANCE);

    if (changed) {
      paintCtx.putImageData(image, 0, 0);
      state.hasMutated = true;
      composite();
    }

    return changed;
  }

  function updateTool(toolId) {
    state.toolId = toolId;
    renderTools();
  }

  function updateBrushSize(sizeId) {
    state.brushSizeId = sizeId;
    renderBrushSizes();
  }

  function updateActiveColor(colorId) {
    const nextColor = palette.find((color) => color.id === colorId);

    if (!nextColor) {
      return;
    }

    state.activeColorId = nextColor.id;
    state.activeColor = nextColor.value;
    renderPalette();
    updateActiveColorLabel();
  }

  function clearPainting(showStatus = true) {
    paintCtx.clearRect(0, 0, width, height);
    composite();
    captureSnapshot();

    if (showStatus) {
      displayStatus(t('coloringGame.status.cleared'));
    }
  }

  function displayStatus(message) {
    if (!statusRegion) {
      return;
    }

    statusRegion.textContent = message;

    if (statusTimeoutId) {
      window.clearTimeout(statusTimeoutId);
    }

    statusTimeoutId = window.setTimeout(() => {
      statusRegion.textContent = '';
    }, 2600);
  }

  function downloadImage() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, width, height);
    exportCtx.drawImage(paintCanvas, 0, 0);
    exportCtx.drawImage(outlineCanvas, 0, 0);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.href = dataUrl;
    link.download = `kwispel-kleurplaat-${timestamp}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    displayStatus(t('coloringGame.status.saved'));
  }

  renderTools();
  renderPalette();
  renderBrushSizes();
  updateActiveColorLabel();

  composite();
  captureSnapshot();

  function handleToolClick(event) {
    const button = event.target.closest('[data-tool]');

    if (!button) {
      return;
    }

    const toolId = button.getAttribute('data-tool');

    if (!toolId || toolId === state.toolId) {
      return;
    }

    updateTool(toolId);
  }

  function handlePaletteClick(event) {
    const button = event.target.closest('[data-color-id]');

    if (!button) {
      return;
    }

    const colorId = button.getAttribute('data-color-id');

    if (!colorId || colorId === state.activeColorId) {
      return;
    }

    updateActiveColor(colorId);
  }

  function handleBrushSizeClick(event) {
    const button = event.target.closest('[data-brush-size]');

    if (!button) {
      return;
    }

    const sizeId = button.getAttribute('data-brush-size');

    if (!sizeId || sizeId === state.brushSizeId) {
      return;
    }

    updateBrushSize(sizeId);
  }

  function handleActionClick(event) {
    const button = event.target.closest('[data-action]');

    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');

    switch (action) {
      case 'undo':
        if (state.historyIndex > 0) {
          restoreSnapshot(state.historyIndex - 1);
        }
        break;
      case 'redo':
        if (state.historyIndex < state.history.length - 1) {
          restoreSnapshot(state.historyIndex + 1);
        }
        break;
      case 'clear':
        clearPainting();
        break;
      case 'download':
        downloadImage();
        break;
      default:
        break;
    }
  }

  function handlePointerDown(event) {
    if (event.button !== 0) {
      return;
    }

    const point = getCanvasPoint(event);

    if (!point) {
      return;
    }

    state.hasMutated = false;

    if (state.toolId === 'bucket') {
      const changed = applyBucket(point);
      if (changed) {
        captureSnapshot();
      }
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    state.pointerId = event.pointerId;
    state.isDrawing = true;
    state.lastPoint = point;

    drawPoint(point);
    composite();
  }

  function handlePointerMove(event) {
    if (!state.isDrawing || event.pointerId !== state.pointerId) {
      return;
    }

    const point = getCanvasPoint(event);

    if (!point) {
      return;
    }

    if (!state.lastPoint) {
      state.lastPoint = point;
      return;
    }

    drawStroke(state.lastPoint, point);
    state.lastPoint = point;
    composite();
  }

  function finishStroke() {
    if (state.isDrawing) {
      state.isDrawing = false;
      state.pointerId = null;
      state.lastPoint = null;

      if (state.hasMutated) {
        captureSnapshot();
      }
    }
  }

  function handlePointerUp(event) {
    if (event.pointerId !== state.pointerId && state.toolId !== 'bucket') {
      return;
    }

    finishStroke();
  }

  function handlePointerCancel(event) {
    if (event.pointerId !== state.pointerId) {
      return;
    }

    finishStroke();
  }

  function handleKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (state.historyIndex > 0) {
        restoreSnapshot(state.historyIndex - 1);
      }
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (state.historyIndex < state.history.length - 1) {
        restoreSnapshot(state.historyIndex + 1);
      }
    }
  }

  addListener(toolContainer, 'click', handleToolClick, false, disposers);
  addListener(paletteContainer, 'click', handlePaletteClick, false, disposers);
  addListener(brushContainer, 'click', handleBrushSizeClick, false, disposers);
  addListener(actionsContainer, 'click', handleActionClick, false, disposers);
  addListener(canvas, 'pointerdown', handlePointerDown, false, disposers);
  addListener(canvas, 'pointermove', handlePointerMove, false, disposers);
  addListener(canvas, 'pointerup', handlePointerUp, false, disposers);
  addListener(canvas, 'pointercancel', handlePointerCancel, false, disposers);
  addListener(canvas, 'pointerleave', finishStroke, false, disposers);
  addListener(canvas, 'contextmenu', (event) => event.preventDefault(), false, disposers);
  addListener(window, 'keydown', handleKeydown, false, disposers);

  return {
    destroy() {
      disposers.forEach((dispose) => dispose());
      disposers.length = 0;
      if (statusTimeoutId) {
        window.clearTimeout(statusTimeoutId);
      }
      root.removeAttribute('data-game');
      root.innerHTML = '';
    },
  };
}
