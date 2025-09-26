import { t } from '../i18n.js';
import { playTone } from './audio.js';
import { COLORING_DEFAULTS, createColoringConfig } from './coloring/config.js';
import {
  drawPlaceholderGuide,
  drawRoundedRectPath,
  floodFill,
  hexToRgba,
} from './coloring/canvas.js';

function ensurePaletteScrollStyle(styleId) {
  if (typeof document === 'undefined') {
    return;
  }

  const targetId = styleId ?? COLORING_DEFAULTS.paletteScrollStyleId;

  if (document.getElementById(targetId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = targetId;
  style.textContent = `
    [data-palette-rail] [data-color-palette]::-webkit-scrollbar { display: none; }
  `;
  document.head.append(style);
}

function buildTemplateCardsMarkup(state, templates) {
  if (!Array.isArray(templates) || templates.length === 0) {
    return `<p class="rounded-2xl border border-dashed border-accent/20 bg-white/70 p-4 text-sm text-text/70">${t('coloringGame.templates.empty')}</p>`;
  }

  return templates
    .map((template) => {
      const isActive = state.activeTemplateId === template.id;
      const tagsMarkup = Array.isArray(template.tags)
        ? template.tags
            .map((tagKey) => `<span class="inline-flex items-center rounded-full bg-accent/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-accent/80">${t(tagKey)}</span>`)
            .join('')
        : '';
      const previewUrl = template.previewUrl ?? template.assetUrl ?? '';
      const selectionClasses = [
        'relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-3xl border text-left transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
        isActive ? 'border-accent bg-white shadow-soft' : 'border-accent/10 bg-white/70 hover:border-accent/30 hover:bg-white',
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${selectionClasses}"
          data-template-id="${template.id}"
          aria-pressed="${isActive}"
          aria-label="${t(template.titleKey)}"
        >
          <span class="relative block overflow-hidden rounded-[1.75rem] border border-white/60 bg-white">
            <img
              src="${previewUrl}"
              alt="${t(template.previewAltKey)}"
              class="block aspect-[4/3] w-full bg-muted/60 object-contain"
              loading="lazy"
              decoding="async"
            />
            ${
              isActive
                ? `<span class="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-soft"><i aria-hidden="true" class="fa-solid fa-palette"></i>${t('coloringGame.templates.selectedLabel')}</span>`
                : ''
            }
          </span>
          <span class="flex flex-1 flex-col gap-2 px-4 pb-4">
            <strong class="text-base text-accent">${t(template.titleKey)}</strong>
            <span class="text-sm text-text/70">${t(template.descriptionKey)}</span>
            ${
              tagsMarkup
                ? `<span class="mt-1 flex flex-wrap gap-1 text-xs text-text/60" data-template-tags>${tagsMarkup}</span>`
                : ''
            }
          </span>
        </button>
      `;
    })
    .join('');
}

function createMarkup(state, palette, templates, uiConfig) {
  const activeColor = palette.find((color) => color.id === state.activeColorId);
  const activeColorLabel = activeColor ? activeColor.label : '';
  const templateCards = buildTemplateCardsMarkup(state, templates);
  const clearProgressRadius = uiConfig?.clearProgressRadius ?? COLORING_DEFAULTS.clear.progressRadius;
  const clearProgressCircumference = uiConfig?.clearProgressCircumference ??
    2 * Math.PI * clearProgressRadius;

  return `
    <div class="flex flex-col gap-6" data-coloring-shell>
      <section class="flex flex-col gap-2 rounded-3xl border border-accent/15 bg-white/90 p-5 shadow-soft">
        <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">${t('coloringGame.pageEyebrow')}</span>
        <h2 class="text-2xl text-accent md:text-3xl">${t('coloringGame.pageTitle')}</h2>
        <p class="text-sm text-text/70 md:text-base">${t('coloringGame.pageIntro')}</p>
        <p class="text-sm text-text/70 md:text-base">${t('coloringGame.instructions')}</p>
      </section>
      <section class="flex flex-col gap-4 rounded-3xl border border-accent/10 bg-white/90 p-5 shadow-soft" data-template-picker>
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-accent md:text-xl">${t('coloringGame.templates.heading')}</h3>
          <p class="text-sm text-text/70 md:text-base">${t('coloringGame.templates.description')}</p>
        </div>
        <div class="grid gap-3 md:grid-cols-2" data-template-options>
          ${templateCards}
        </div>
      </section>
      <section class="flex flex-col gap-4 rounded-[2.5rem] border border-accent/10 bg-muted/60 p-4 shadow-soft">
        <div class="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/50 bg-white" data-canvas-wrapper>
          <div class="pointer-events-none absolute inset-0 z-30 hidden items-center justify-center bg-white/85 text-sm font-semibold text-accent" data-template-loading>
            <span class="flex items-center gap-2"><i aria-hidden="true" class="fa-solid fa-sparkles"></i>${t('coloringGame.templates.loading')}</span>
          </div>
          <canvas data-coloring-canvas class="block h-auto max-w-full mx-auto" role="img" aria-label="${t('coloringGame.canvasLabel')}"></canvas>
          <div class="pointer-events-auto absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 rounded-3xl border border-accent/10 bg-white/95 px-3 py-2 shadow-soft backdrop-blur" data-toolbar-actions>
            <button type="button" class="relative flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-white text-lg text-accent transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-40" data-action="undo" title="${t('coloringGame.actions.undo')}">
              <i aria-hidden="true" class="fa-solid fa-rotate-left"></i>
              <span class="sr-only">${t('coloringGame.actions.undo')}</span>
            </button>
            <button type="button" class="relative flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-white text-lg text-accent transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-40" data-action="redo" title="${t('coloringGame.actions.redo')}">
              <i aria-hidden="true" class="fa-solid fa-rotate-right"></i>
              <span class="sr-only">${t('coloringGame.actions.redo')}</span>
            </button>
            <button type="button" class="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-accent text-lg text-white shadow-soft transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-50" data-action="clear" title="${t('coloringGame.actions.clearHoldHint')}">
              <svg class="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 48 48" role="presentation" aria-hidden="true">
                <circle cx="24" cy="24" r="${clearProgressRadius}" fill="transparent" stroke="rgba(144,60,56,0.18)" stroke-width="3"></circle>
                <circle
                  cx="24"
                  cy="24"
                  r="${clearProgressRadius}"
                  fill="transparent"
                  stroke="#903c38"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray="${clearProgressCircumference.toFixed(2)}"
                  stroke-dashoffset="${clearProgressCircumference.toFixed(2)}"
                  data-progress-ring
                ></circle>
              </svg>
              <i aria-hidden="true" class="fa-solid fa-broom"></i>
              <span class="sr-only">${t('coloringGame.actions.clearHoldHint')}</span>
            </button>
            <button type="button" class="relative flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-white text-lg text-accent transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-40" data-action="download" title="${t('coloringGame.actions.download')}">
              <i aria-hidden="true" class="fa-solid fa-floppy-disk"></i>
              <span class="sr-only">${t('coloringGame.actions.download')}</span>
            </button>
            <div class="ml-2 flex-1 min-w-0 text-xs text-text/60" aria-live="polite" data-status-region></div>
            <div
              data-clear-hint
              class="pointer-events-none absolute left-1/2 top-full mt-2 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-semibold text-white shadow-soft"
              style="opacity: 0; transform: translate(-50%, -0.5rem); transition: opacity 0.24s ease, transform 0.24s ease;"
            >
              ${t('coloringGame.actions.clearHoldHint')}
            </div>
          </div>
          <button type="button" class="pointer-events-auto absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-white text-lg text-accent shadow-soft transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60" data-action="fullscreen" aria-pressed="false" title="${t('coloringGame.actions.fullscreen')}">
            <i aria-hidden="true" class="fa-solid fa-expand"></i>
            <span class="sr-only">${t('coloringGame.actions.fullscreen')}</span>
          </button>
          <div class="pointer-events-auto absolute bottom-4 left-4 z-20 flex w-[4.5rem] flex-col items-center gap-3 rounded-3xl border border-accent/10 bg-white/95 p-2 shadow-soft backdrop-blur" data-palette-rail>
            <div class="flex flex-col items-center gap-2" data-active-color-info>
              <span class="h-9 w-9 rounded-full border border-white/70 shadow-soft" data-active-color style="background-color: ${state.activeColor};"></span>
              <span class="visually-hidden" data-active-color-label>${t('coloringGame.activeColorLabel').replace('{label}', activeColorLabel)}</span>
            </div>
            <div class="flex max-h-[14rem] flex-col items-center gap-2 overflow-y-auto pb-1 [scrollbar-width:none]" data-color-palette style="-ms-overflow-style: none;"></div>
          </div>
          <div class="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-3xl border border-accent/10 bg-white/95 px-3 py-2 shadow-soft backdrop-blur" data-brush-sizes></div>
          <div class="pointer-events-auto absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 rounded-3xl border border-accent/10 bg-white/95 p-3 shadow-soft backdrop-blur" data-toolbar-tools></div>
        </div>
        <div class="flex flex-col gap-1 rounded-2xl border border-dashed border-accent/20 bg-white/70 p-4 text-sm text-text/70">
          <strong class="text-accent">${t('coloringGame.palette.heading')}</strong>
          <p>${t('coloringGame.palette.hint')}</p>
        </div>
      </section>
    </div>
  `;
}

function getBrushSize(brushSizes, sizeId) {
  const source = Array.isArray(brushSizes) && brushSizes.length > 0
    ? brushSizes
    : COLORING_DEFAULTS.brushSizes;

  const match = source.find((item) => item.id === sizeId && Number.isFinite(item.size));

  if (match) {
    return match.size;
  }

  const fallbackIndex = source.length > 1 ? 1 : 0;
  const fallback = source[fallbackIndex];

  if (fallback && Number.isFinite(fallback.size)) {
    return fallback.size;
  }

  return 24;
}

function addListener(target, type, handler, options, store) {
  target.addEventListener(type, handler, options);
  store.push(() => target.removeEventListener(type, handler, options));
}

export function mountColoringGame(root, options = {}) {
  if (!root) {
    throw new Error('Kleur game root ontbreekt.');
  }

  const canvasOverrides = typeof options.canvas === 'object' && options.canvas
    ? { ...options.canvas }
    : {};

  if (options.width !== undefined) {
    canvasOverrides.width = options.width;
  }
  if (options.height !== undefined) {
    canvasOverrides.height = options.height;
  }
  if (options.maxDevicePixelRatio !== undefined) {
    canvasOverrides.maxDevicePixelRatio = options.maxDevicePixelRatio;
  }
  if (options.bucketTolerance !== undefined) {
    canvasOverrides.bucketTolerance = options.bucketTolerance;
  }

  const historyOverrides = typeof options.history === 'object' && options.history
    ? { ...options.history }
    : {};

  if (options.maxHistory !== undefined) {
    historyOverrides.limit = options.maxHistory;
  }

  const configOverrides = {
    palette: options.palette,
    templates: options.templates,
    tools: options.tools,
    brushSizes: options.brushSizes,
    audio: options.audio,
    clear: options.clear,
    fullscreen: options.fullscreen,
    paletteScrollStyleId: options.paletteScrollStyleId,
  };

  if (Object.keys(canvasOverrides).length > 0) {
    configOverrides.canvas = canvasOverrides;
  }

  if (Object.keys(historyOverrides).length > 0) {
    configOverrides.history = historyOverrides;
  }

  const config = createColoringConfig(configOverrides);

  const palette = config.palette;
  const templates = config.templates;
  const toolOptions = config.tools;
  const brushSizes = config.brushSizes;
  const uiSoundMap = config.audio.ui ?? COLORING_DEFAULTS.audio.ui;
  const clearConfig = config.clear;
  const historyLimit = Math.max(
    1,
    Number.isFinite(config.history?.limit)
      ? config.history.limit
      : COLORING_DEFAULTS.history.limit,
  );
  const bucketTolerance = Math.max(
    0,
    Number.isFinite(config.canvas?.bucketTolerance)
      ? config.canvas.bucketTolerance
      : COLORING_DEFAULTS.canvas.bucketTolerance,
  );

  const baseWidth = Number.isFinite(config.canvas?.width)
    ? config.canvas.width
    : COLORING_DEFAULTS.canvas.width;
  const baseHeight = Number.isFinite(config.canvas?.height)
    ? config.canvas.height
    : COLORING_DEFAULTS.canvas.height;
  const baseAspectRatio = baseWidth > 0
    ? baseHeight / baseWidth
    : COLORING_DEFAULTS.canvas.height / COLORING_DEFAULTS.canvas.width;
  const baseAspectString = `${baseWidth} / ${baseHeight}`;
  let currentAspectRatio = baseAspectRatio;
  const maxDevicePixelRatio = Number.isFinite(config.canvas?.maxDevicePixelRatio)
    ? config.canvas.maxDevicePixelRatio
    : COLORING_DEFAULTS.canvas.maxDevicePixelRatio;

  const clearProgressRadius = Math.max(
    0,
    Number.isFinite(clearConfig?.progressRadius)
      ? clearConfig.progressRadius
      : COLORING_DEFAULTS.clear.progressRadius,
  );
  const clearProgressCircumference = 2 * Math.PI * clearProgressRadius;
  const clearHoldDurationMs = Math.max(
    10,
    Number.isFinite(clearConfig?.holdDurationMs)
      ? clearConfig.holdDurationMs
      : COLORING_DEFAULTS.clear.holdDurationMs,
  );
  const clearProgressResetDelayMs = Math.max(
    0,
    Number.isFinite(clearConfig?.progressResetDelayMs)
      ? clearConfig.progressResetDelayMs
      : COLORING_DEFAULTS.clear.progressResetDelayMs,
  );
  const fullscreenBackdrop = config.fullscreen?.backdrop ?? COLORING_DEFAULTS.fullscreen.backdrop;

  const initialColorEntry = palette[0] ?? COLORING_DEFAULTS.palette[0] ?? {
    id: 'default-color',
    value: '#f6d6de',
    label: '',
  };

  const initialTemplateId = (() => {
    if (!Array.isArray(templates) || templates.length === 0) {
      return null;
    }

    const candidate = options.initialTemplateId;
    if (candidate && templates.some((template) => template.id === candidate)) {
      return candidate;
    }

    return templates[0].id;
  })();

  const defaultToolId = toolOptions.find((tool) => tool.id === 'brush')?.id
    ?? toolOptions[0]?.id
    ?? 'brush';

  const defaultBrushSizeId = brushSizes.find((size) => size.id === 'medium')?.id
    ?? brushSizes[0]?.id
    ?? COLORING_DEFAULTS.brushSizes[0].id;

  const state = {
    toolId: defaultToolId,
    brushSizeId: defaultBrushSizeId,
    activeColorId: initialColorEntry.id,
    activeColor: initialColorEntry.value ?? '#f6d6de',
    activeTemplateId: initialTemplateId,
    pointerId: null,
    isDrawing: false,
    lastPoint: null,
    hasMutated: false,
    history: [],
    historyIndex: -1,
  };

  const playUiSound = (kind) => {
    const note = uiSoundMap[kind] ?? uiSoundMap.action;
    if (note) {
      playTone(note);
    }
  };

  ensurePaletteScrollStyle(config.paletteScrollStyleId);

  root.setAttribute('data-game', 'coloring');
  root.innerHTML = createMarkup(state, palette, templates, {
    clearProgressRadius,
    clearProgressCircumference,
  });

  const disposers = [];
  let statusTimeoutId = null;
  let clearHintTimeoutId = null;

  const templateOptions = root.querySelector('[data-template-options]');
  const templateLoadingOverlay = root.querySelector('[data-template-loading]');
  const canvasWrapper = root.querySelector('[data-canvas-wrapper]');
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
  const clearHint = actionsContainer?.querySelector('[data-clear-hint]');
  const clearProgressRing = clearButton?.querySelector('[data-progress-ring]');

  if (!templateOptions || !canvasWrapper || !canvas || !toolContainer || !paletteContainer || !brushContainer || !actionsContainer) {
    throw new Error('Kon de vereiste kleurplaat elementen niet bouwen.');
  }

  let resizeObserver = null;
  let resizeFrame = null;

  const supportsAspectRatio = typeof document !== 'undefined' &&
    !!document.documentElement?.style &&
    'aspectRatio' in document.documentElement.style;

  let width = baseWidth;
  let height = baseHeight;

  canvas.width = width;
  canvas.height = height;
  canvas.style.touchAction = 'none';
  canvas.style.display = 'block';

  if (supportsAspectRatio) {
    canvasWrapper.style.aspectRatio = baseAspectString;
    canvas.style.aspectRatio = baseAspectString;
  }

  const displayCtx = canvas.getContext('2d');
  const paintCanvas = document.createElement('canvas');
  paintCanvas.width = width;
  paintCanvas.height = height;
  const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });

  const outlineCanvas = document.createElement('canvas');
  outlineCanvas.width = width;
  outlineCanvas.height = height;
  const outlineCtx = outlineCanvas.getContext('2d');

  const canvasSection = canvasWrapper.parentElement;
  const originalWrapperBg = canvasWrapper.style.backgroundColor;
  const originalSectionBg = canvasSection?.style.backgroundColor ?? '';
  const originalSectionBorder = canvasSection?.style.borderColor ?? '';
  const originalRootBg = root.style.backgroundColor;
  const originalBodyBg = typeof document !== 'undefined' && document.body ? document.body.style.backgroundColor : '';

  let outlineSnapshot = null;
  let canvasCornerRadius = 0;

  syncCanvasDimensions({ force: true });

  function getEffectivePixelRatio() {
    if (typeof window === 'undefined') {
      return 1;
    }

    const ratio = window.devicePixelRatio || 1;
    return Math.max(1, Math.min(ratio, maxDevicePixelRatio));
  }

  function resolveBorderRadiusPx(referenceWidth, referenceHeight) {
    if (typeof window === 'undefined' || !canvasWrapper) {
      return 0;
    }

    const styles = window.getComputedStyle(canvasWrapper);
    const raw = styles.borderTopLeftRadius || styles.borderRadius;

    if (!raw) {
      return 0;
    }

    const token = raw.split(' ')[0];

    if (token.endsWith('%')) {
      const percent = parseFloat(token);
      if (Number.isNaN(percent)) {
        return 0;
      }
      const basis = Math.min(referenceWidth, referenceHeight);
      return (percent / 100) * basis;
    }

    const value = parseFloat(token);
    return Number.isFinite(value) ? value : 0;
  }

  function drawRoundedRectPath(context, x, y, rectWidth, rectHeight, radius) {
    const clampedRadius = Math.max(0, Math.min(radius, Math.min(rectWidth, rectHeight) / 2));

    if (clampedRadius === 0) {
      context.rect(x, y, rectWidth, rectHeight);
      return;
    }

    const r = clampedRadius;
    context.moveTo(x + r, y);
    context.lineTo(x + rectWidth - r, y);
    context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
    context.lineTo(x + rectWidth, y + rectHeight - r);
    context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
    context.lineTo(x + r, y + rectHeight);
    context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
  }

  function syncCanvasDimensions(options = {}) {
    const { force = false } = options;

    if (!canvasWrapper) {
      return false;
    }

    const wrapperRect = canvasWrapper.getBoundingClientRect();
    let cssWidth = wrapperRect.width || canvasWrapper.clientWidth || baseWidth;

    if (cssWidth === 0) {
      cssWidth = baseWidth;
    }

    const targetAspect = currentAspectRatio > 0 ? currentAspectRatio : baseAspectRatio;

    let availableHeight = wrapperRect.height || canvasWrapper.clientHeight || 0;

    if ((!availableHeight || availableHeight === 0) && canvasWrapper.parentElement) {
      const parentRect = canvasWrapper.parentElement.getBoundingClientRect();
      availableHeight = parentRect.height;
    }

    if (typeof window !== 'undefined') {
      const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
      if (viewportHeight) {
        if (!availableHeight || availableHeight === 0) {
          availableHeight = viewportHeight;
        } else {
          availableHeight = Math.min(availableHeight, viewportHeight);
        }
      }
    }

    if (!availableHeight || availableHeight <= 0) {
      availableHeight = cssWidth * targetAspect;
    }

    const maxWidthFromHeight = availableHeight / targetAspect;
    if (Number.isFinite(maxWidthFromHeight) && maxWidthFromHeight > 0 && maxWidthFromHeight < cssWidth) {
      cssWidth = maxWidthFromHeight;
    }

    const cssHeight = Math.max(cssWidth * targetAspect, 1);

    const pixelRatio = getEffectivePixelRatio();
    const nextWidth = Math.max(Math.round(cssWidth * pixelRatio), 1);
    const nextHeight = Math.max(Math.round(cssHeight * pixelRatio), 1);

    if (!force && nextWidth === width && nextHeight === height) {
      return false;
    }

    width = nextWidth;
    height = nextHeight;

    canvas.width = width;
    canvas.height = height;
    paintCanvas.width = width;
    paintCanvas.height = height;
    outlineCanvas.width = width;
    outlineCanvas.height = height;

    const widthStyle = `${Math.round(cssWidth)}px`;
    const heightStyle = `${Math.round(cssHeight)}px`;

    if (canvas.style.width !== widthStyle) {
      canvas.style.width = widthStyle;
    }

    if (canvas.style.height !== heightStyle) {
      canvas.style.height = heightStyle;
    }

    if (!supportsAspectRatio) {
      if (canvasWrapper.style.height !== heightStyle) {
        canvasWrapper.style.height = heightStyle;
      }
    } else if (canvasWrapper.style.height) {
      canvasWrapper.style.removeProperty('height');
    }

    if (canvasWrapper.style.maxWidth !== widthStyle) {
      canvasWrapper.style.maxWidth = widthStyle;
    }

    if (canvasWrapper.style.maxHeight !== heightStyle) {
      canvasWrapper.style.maxHeight = heightStyle;
    }

    if (canvasWrapper.style.width) {
      canvasWrapper.style.removeProperty('width');
    }

    const borderRadiusPx = resolveBorderRadiusPx(cssWidth, cssHeight);
    canvasCornerRadius = Math.min(borderRadiusPx * pixelRatio, Math.min(width, height) / 2);

    return true;
  }
  drawPlaceholderGuide(outlineCtx, width, height);
  outlineSnapshot = outlineCtx.getImageData(0, 0, width, height);

  function composite() {
    const strokeWidth = Math.max(width, height) * 0.004;
    const halfStroke = strokeWidth / 2;
    const hasCornerRadius = canvasCornerRadius > 0.5;

    displayCtx.save();

    if (hasCornerRadius) {
      displayCtx.beginPath();
      drawRoundedRectPath(displayCtx, 0, 0, width, height, canvasCornerRadius);
      displayCtx.clip();
    }

    displayCtx.clearRect(0, 0, width, height);
    displayCtx.fillStyle = '#ffffff';
    displayCtx.fillRect(0, 0, width, height);
    displayCtx.drawImage(paintCanvas, 0, 0);
    displayCtx.drawImage(outlineCanvas, 0, 0);
    displayCtx.restore();

    displayCtx.save();
    displayCtx.lineWidth = strokeWidth;
    displayCtx.strokeStyle = 'rgba(47, 42, 40, 0.18)';
    displayCtx.beginPath();

    if (hasCornerRadius) {
      drawRoundedRectPath(
        displayCtx,
        halfStroke,
        halfStroke,
        width - strokeWidth,
        height - strokeWidth,
        Math.max(canvasCornerRadius - halfStroke, 0),
      );
    } else {
      drawRoundedRectPath(displayCtx, halfStroke, halfStroke, width - strokeWidth, height - strokeWidth, 0);
    }

    displayCtx.stroke();
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
    toolContainer.innerHTML = toolOptions.map((tool) => {
      const isActive = state.toolId === tool.id;
      const classes = [
        'flex h-12 w-12 items-center justify-center rounded-full border text-lg transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
        isActive
          ? 'border-accent bg-accent text-white shadow-soft'
          : 'border-accent/20 bg-white text-accent hover:border-accent/40',
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${classes}"
          data-tool="${tool.id}"
          aria-pressed="${isActive}"
          aria-label="${t(tool.labelKey)}"
          title="${t(tool.labelKey)}"
        >
          <i aria-hidden="true" class="${tool.icon}"></i>
          <span class="sr-only">${t(tool.labelKey)}</span>
        </button>
      `;
    }).join('');
  }

  function renderPalette() {
    paletteContainer.innerHTML = palette
      .map((color) => {
        const isActive = color.id === state.activeColorId;
        const classes = [
          'flex h-9 w-9 items-center justify-center rounded-full border shadow-soft transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
          isActive ? 'border-2 border-accent scale-105' : 'border-white/70 hover:border-accent/40',
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
    brushContainer.innerHTML = brushSizes.map((entry) => {
      const isActive = state.brushSizeId === entry.id;
      const classes = [
        'flex h-11 w-11 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60',
        isActive
          ? 'border-accent bg-accent/10 text-accent shadow-soft'
          : 'border-accent/20 bg-white text-accent hover:border-accent/40',
      ]
        .filter(Boolean)
        .join(' ');
      const brushIconBasis = Number.isFinite(entry.size) ? entry.size : 24;
      const iconSizeRem = Math.min(2.0, Math.max(0.8, brushIconBasis / 18)).toFixed(2);

      return `
        <button
          type="button"
          class="${classes}"
          data-brush-size="${entry.id}"
          aria-label="${t(entry.labelKey)}"
          aria-pressed="${isActive}"
        >
          <span class="sr-only">${t(entry.labelKey)}</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
            <i aria-hidden="true" class="fa-solid fa-circle" style="font-size: ${iconSizeRem}rem;"></i>
          </span>
        </button>
      `;
    }).join('');
  }

  function renderTemplates() {
    if (!templateOptions) {
      return;
    }

    templateOptions.innerHTML = buildTemplateCardsMarkup(state, templates);
  }

  function setTemplateLoading(isLoading) {
    if (!templateLoadingOverlay) {
      return;
    }

    if (isLoading) {
      templateLoadingOverlay.classList.remove('hidden');
      templateLoadingOverlay.classList.add('flex');
      canvas?.setAttribute('aria-busy', 'true');
    } else {
      templateLoadingOverlay.classList.add('hidden');
      templateLoadingOverlay.classList.remove('flex');
      canvas?.removeAttribute('aria-busy');
    }
  }

  let activeTemplateRequestId = 0;

  function resetPaintingHistory() {
    state.history = [];
    state.historyIndex = -1;
    captureSnapshot();
  }

  function loadActiveTemplate(options = {}) {
    const { announce = true, showLoading = true, onReady, playSound = true } = options;

    if (!state.activeTemplateId) {
      currentAspectRatio = baseAspectRatio;
      if (supportsAspectRatio) {
        canvasWrapper.style.aspectRatio = baseAspectString;
        canvas.style.aspectRatio = baseAspectString;
        canvasWrapper.style.removeProperty('height');
      }
      syncCanvasDimensions({ force: true });
      outlineCtx.clearRect(0, 0, width, height);
      drawPlaceholderGuide(outlineCtx, width, height);
      outlineSnapshot = outlineCtx.getImageData(0, 0, width, height);
      paintCtx.clearRect(0, 0, width, height);
      composite();
      resetPaintingHistory();
      setTemplateLoading(false);
      if (typeof onReady === 'function') {
        onReady({ width, height, template: null });
      }
      return;
    }

    const template = templates.find((item) => item.id === state.activeTemplateId);

    if (!template || !template.assetUrl) {
      return;
    }

    const requestId = ++activeTemplateRequestId;

    setTemplateLoading(showLoading);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';

    image.onload = () => {
      if (requestId !== activeTemplateRequestId) {
        return;
      }

      const naturalWidth = image.naturalWidth || image.width;
      const naturalHeight = image.naturalHeight || image.height;

      if (naturalWidth > 0 && naturalHeight > 0) {
        const aspect = naturalHeight / naturalWidth;
        if (Number.isFinite(aspect) && aspect > 0) {
          currentAspectRatio = aspect;
          if (supportsAspectRatio) {
            const aspectString = `${naturalWidth} / ${naturalHeight}`;
            canvasWrapper.style.aspectRatio = aspectString;
            canvas.style.aspectRatio = aspectString;
            canvasWrapper.style.removeProperty('height');
          }
        }
      } else {
        currentAspectRatio = baseAspectRatio;
        if (supportsAspectRatio) {
          canvasWrapper.style.aspectRatio = baseAspectString;
          canvas.style.aspectRatio = baseAspectString;
          canvasWrapper.style.removeProperty('height');
        }
      }

      syncCanvasDimensions({ force: true });

      outlineCtx.clearRect(0, 0, width, height);

      if (naturalWidth > 0 && naturalHeight > 0) {
        const scale = Math.min(width / naturalWidth, height / naturalHeight);
        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;
        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2;
        outlineCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        outlineCtx.drawImage(image, 0, 0, width, height);
      }

      outlineSnapshot = outlineCtx.getImageData(0, 0, width, height);
      paintCtx.clearRect(0, 0, width, height);
      composite();
      resetPaintingHistory();
      setTemplateLoading(false);

      if (announce) {
        displayStatus(t('coloringGame.status.templateReady').replace('{label}', t(template.titleKey)));
      }

      if (playSound) {
        playUiSound('action');
      }

      if (typeof onReady === 'function') {
        onReady({ width, height, template });
      }
    };

    image.onerror = () => {
      if (requestId !== activeTemplateRequestId) {
        return;
      }

      currentAspectRatio = baseAspectRatio;
      if (supportsAspectRatio) {
        canvasWrapper.style.aspectRatio = baseAspectString;
        canvas.style.aspectRatio = baseAspectString;
        canvasWrapper.style.removeProperty('height');
      }
      syncCanvasDimensions({ force: true });

      outlineCtx.clearRect(0, 0, width, height);
      drawPlaceholderGuide(outlineCtx, width, height);
      outlineSnapshot = outlineCtx.getImageData(0, 0, width, height);
      paintCtx.clearRect(0, 0, width, height);
      composite();
      resetPaintingHistory();
      setTemplateLoading(false);

      if (announce) {
        displayStatus(t('coloringGame.status.templateError'));
      }

      if (typeof onReady === 'function') {
        onReady({ width, height, template: null, error: true });
      }
    };

    image.src = template.assetUrl;
  }

  function setActiveTemplate(templateId, options = {}) {
    if (!templateId || state.activeTemplateId === templateId) {
      return;
    }

    const exists = templates.some((template) => template.id === templateId);

    if (!exists) {
      return;
    }

    state.activeTemplateId = templateId;
    renderTemplates();
    loadActiveTemplate(options);
  }

  function resizeCanvasForDisplay(options = {}) {
    const { force = false, showLoading = false } = options;

    const hadPainting = state.historyIndex > 0;
    let paintSnapshot = null;

    if (hadPainting) {
      paintSnapshot = document.createElement('canvas');
      paintSnapshot.width = width;
      paintSnapshot.height = height;
      const snapshotCtx = paintSnapshot.getContext('2d');
      snapshotCtx.drawImage(paintCanvas, 0, 0);
    }

    const changed = syncCanvasDimensions({ force });

    if (!changed) {
      paintSnapshot = null;
      return false;
    }

    loadActiveTemplate({
      announce: false,
      showLoading,
      playSound: false,
      onReady: () => {
        if (paintSnapshot) {
          paintCtx.save();
          paintCtx.drawImage(
            paintSnapshot,
            0,
            0,
            paintSnapshot.width,
            paintSnapshot.height,
            0,
            0,
            width,
            height,
          );
          paintCtx.restore();
          composite();
          captureSnapshot();
          paintSnapshot = null;
        }
      },
    });

    return true;
  }

  function handleTemplateClick(event) {
    const target = event.target.closest('[data-template-id]');

    if (!target) {
      return;
    }

    const templateId = target.getAttribute('data-template-id');

    if (!templateId) {
      return;
    }

    setActiveTemplate(templateId);
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

    if (state.history.length > historyLimit) {
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
    const radius = getBrushSize(brushSizes, state.brushSizeId) / 2;

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
    paintCtx.lineWidth = getBrushSize(brushSizes, state.brushSizeId);

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
    const changed = floodFill(
      image,
      outlineSnapshot,
      Math.floor(point.x),
      Math.floor(point.y),
      fillColor,
      bucketTolerance,
    );

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
    playUiSound('tool');
  }

  function updateBrushSize(sizeId) {
    state.brushSizeId = sizeId;
    renderBrushSizes();
    playUiSound('brush');
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
    playUiSound('color');
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

  const clearHoldState = {
    isActive: false,
    completed: false,
    start: 0,
    rafId: null,
    resetTimeoutId: null,
  };

  function hideClearHint() {
    if (clearHint) {
      clearHint.style.opacity = '0';
      clearHint.style.transform = 'translate(-50%, -0.5rem)';
    }

    if (clearHintTimeoutId !== null) {
      window.clearTimeout(clearHintTimeoutId);
      clearHintTimeoutId = null;
    }
  }

  function showClearHint() {
    if (!clearHint) {
      return;
    }

    hideClearHint();

    clearHint.style.opacity = '1';
    clearHint.style.transform = 'translate(-50%, 0)';

    clearHintTimeoutId = window.setTimeout(() => {
      hideClearHint();
    }, 1600);

    playUiSound('hint');
  }

  function setClearProgress(progress) {
    if (!clearProgressRing) {
      return;
    }

    const clamped = Math.min(1, Math.max(0, progress));
    const offset = clearProgressCircumference * (1 - clamped);
    clearProgressRing.style.strokeDashoffset = offset.toString();
  }

  function resetClearProgress() {
    clearHoldState.resetTimeoutId = null;
    setClearProgress(0);
  }

  function stopClearHold(options = {}) {
    const { triggered = false } = options;

    hideClearHint();

    if (clearHoldState.rafId !== null) {
      window.cancelAnimationFrame(clearHoldState.rafId);
      clearHoldState.rafId = null;
    }

    if (clearHoldState.resetTimeoutId !== null) {
      window.clearTimeout(clearHoldState.resetTimeoutId);
      clearHoldState.resetTimeoutId = null;
    }

    clearHoldState.isActive = false;
    clearHoldState.start = 0;

    if (!triggered) {
      clearHoldState.completed = false;
    }

    if (triggered) {
      clearHoldState.resetTimeoutId = window.setTimeout(resetClearProgress, clearProgressResetDelayMs);
    } else {
      resetClearProgress();
    }
  }

  function completeClearHold() {
    if (clearHoldState.completed) {
      return;
    }

    clearHoldState.completed = true;
    setClearProgress(1);
    clearPainting();
    playUiSound('clear');
    stopClearHold({ triggered: true });
  }

  function updateClearHoldProgress(now) {
    if (!clearHoldState.isActive) {
      return;
    }

    if (clearHoldState.start === 0) {
      clearHoldState.start = now;
    }

    const elapsed = now - clearHoldState.start;
    const progress = Math.min(1, elapsed / clearHoldDurationMs);
    setClearProgress(progress);

    if (progress >= 1) {
      completeClearHold();
      return;
    }

    clearHoldState.rafId = window.requestAnimationFrame(updateClearHoldProgress);
  }

  function startClearHold() {
    if (!clearButton || clearButton.disabled) {
      return;
    }

    if (clearHoldState.isActive) {
      return;
    }

    if (clearHoldState.resetTimeoutId !== null) {
      window.clearTimeout(clearHoldState.resetTimeoutId);
      clearHoldState.resetTimeoutId = null;
    }

    hideClearHint();

    clearHoldState.isActive = true;
    clearHoldState.completed = false;
    clearHoldState.start = 0;
    setClearProgress(0);
    clearHoldState.rafId = window.requestAnimationFrame(updateClearHoldProgress);
  }

  function isClearActivationKey(event) {
    const { key, code } = event;
    return key === 'Enter' || key === ' ' || key === 'Spacebar' || code === 'Space';
  }

  function handleClearPointerDown(event) {
    if (event.button !== 0) {
      return;
    }

    startClearHold();
  }

  function handleClearPointerUp(event) {
    if (event.button !== 0) {
      return;
    }

    if (!clearHoldState.completed) {
      stopClearHold();
    }
  }

  function handleClearPointerCancel() {
    if (!clearHoldState.completed) {
      stopClearHold();
    }
  }

  function handleClearKeyDown(event) {
    if (!isClearActivationKey(event)) {
      return;
    }

    event.preventDefault();

    if (!clearHoldState.isActive) {
      startClearHold();
    }
  }

  function handleClearKeyUp(event) {
    if (!isClearActivationKey(event)) {
      return;
    }

    event.preventDefault();

    if (!clearHoldState.completed) {
      stopClearHold();
    }
  }

  const fullscreenButtons = Array.from(root.querySelectorAll('[data-action="fullscreen"]'));

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function isFullscreenActive() {
    return getFullscreenElement() === canvasWrapper;
  }

  function exitFullscreen() {
    if (typeof document.exitFullscreen === 'function') {
      return document.exitFullscreen();
    }
    if (typeof document.webkitExitFullscreen === 'function') {
      document.webkitExitFullscreen();
      return Promise.resolve();
    }
    if (typeof document.mozCancelFullScreen === 'function') {
      document.mozCancelFullScreen();
      return Promise.resolve();
    }
    if (typeof document.msExitFullscreen === 'function') {
      document.msExitFullscreen();
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  function requestFullscreen(target) {
    const request =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.mozRequestFullScreen ||
      target.msRequestFullscreen;

    if (typeof request === 'function') {
      try {
        const result = request.call(target);
        return result instanceof Promise ? result : Promise.resolve(result);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(new Error('Fullscreen API not supported'));
  }

  function applyFullscreenStyles(isActive) {
    if (isActive) {
      canvasWrapper.style.backgroundColor = fullscreenBackdrop;
      if (canvasSection) {
        canvasSection.style.backgroundColor = fullscreenBackdrop;
        canvasSection.style.borderColor = 'rgba(47, 42, 40, 0.08)';
      }
      root.style.backgroundColor = fullscreenBackdrop;
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.backgroundColor = fullscreenBackdrop;
      }
    } else {
      if (originalWrapperBg) {
        canvasWrapper.style.backgroundColor = originalWrapperBg;
      } else {
        canvasWrapper.style.removeProperty('background-color');
      }

      if (canvasSection) {
        if (originalSectionBg) {
          canvasSection.style.backgroundColor = originalSectionBg;
        } else {
          canvasSection.style.removeProperty('background-color');
        }

        if (originalSectionBorder) {
          canvasSection.style.borderColor = originalSectionBorder;
        } else {
          canvasSection.style.removeProperty('border-color');
        }
      }

      if (originalRootBg) {
        root.style.backgroundColor = originalRootBg;
      } else {
        root.style.removeProperty('background-color');
      }

      if (typeof document !== 'undefined' && document.body) {
        if (originalBodyBg) {
          document.body.style.backgroundColor = originalBodyBg;
        } else {
          document.body.style.removeProperty('background-color');
        }
      }
    }
  }

  function updateFullscreenButtons() {
    const isActive = isFullscreenActive();
    const label = isActive ? t('coloringGame.actions.exitFullscreen') : t('coloringGame.actions.fullscreen');

    fullscreenButtons.forEach((button) => {
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);

      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-expand', !isActive);
        icon.classList.toggle('fa-compress', isActive);
      }
    });

    if (canvasWrapper) {
      canvasWrapper.classList.toggle('is-fullscreen', isActive);
    }

    applyFullscreenStyles(isActive);
  }

  function toggleFullscreen() {
    if (!canvasWrapper) {
      return;
    }

    if (isFullscreenActive()) {
      exitFullscreen().catch(() => {});
    } else {
      requestFullscreen(canvasWrapper).catch(() => {});
    }
  }

  function handleFullscreenChange() {
    updateFullscreenButtons();
    resizeCanvasForDisplay({ force: true });
  }

  renderTools();
  renderPalette();
  renderBrushSizes();
  renderTemplates();
  updateActiveColorLabel();

  composite();
  if (state.activeTemplateId) {
    resizeCanvasForDisplay({ force: true, showLoading: true });
  } else {
    captureSnapshot();
  }

  applyFullscreenStyles(isFullscreenActive());

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        resizeCanvasForDisplay();
      });
    });

    resizeObserver.observe(canvasWrapper);
  } else if (typeof window !== 'undefined') {
    addListener(window, 'resize', () => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        resizeCanvasForDisplay();
      });
    }, false, disposers);
  }

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
          playUiSound('action');
        }
        break;
      case 'redo':
        if (state.historyIndex < state.history.length - 1) {
          restoreSnapshot(state.historyIndex + 1);
          playUiSound('action');
        }
        break;
      case 'clear':
        event.preventDefault();
        if (!clearHoldState.completed) {
          showClearHint();
        }
        break;
      case 'download':
        downloadImage();
        playUiSound('action');
        break;
      case 'fullscreen':
        toggleFullscreen();
        playUiSound('action');
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

  addListener(templateOptions, 'click', handleTemplateClick, false, disposers);
  addListener(toolContainer, 'click', handleToolClick, false, disposers);
  addListener(paletteContainer, 'click', handlePaletteClick, false, disposers);
  addListener(brushContainer, 'click', handleBrushSizeClick, false, disposers);
  addListener(root, 'click', handleActionClick, false, disposers);
  addListener(canvas, 'pointerdown', handlePointerDown, false, disposers);
  addListener(canvas, 'pointermove', handlePointerMove, false, disposers);
  addListener(canvas, 'pointerup', handlePointerUp, false, disposers);
  addListener(canvas, 'pointercancel', handlePointerCancel, false, disposers);
  addListener(canvas, 'pointerleave', finishStroke, false, disposers);
  addListener(canvas, 'contextmenu', (event) => event.preventDefault(), false, disposers);
  addListener(window, 'keydown', handleKeydown, false, disposers);
  addListener(document, 'fullscreenchange', handleFullscreenChange, false, disposers);
  addListener(document, 'webkitfullscreenchange', handleFullscreenChange, false, disposers);
  addListener(document, 'mozfullscreenchange', handleFullscreenChange, false, disposers);
  addListener(document, 'MSFullscreenChange', handleFullscreenChange, false, disposers);

  if (clearButton) {
    addListener(clearButton, 'pointerdown', handleClearPointerDown, false, disposers);
    addListener(clearButton, 'pointerup', handleClearPointerUp, false, disposers);
    addListener(clearButton, 'pointerleave', handleClearPointerCancel, false, disposers);
    addListener(clearButton, 'pointercancel', handleClearPointerCancel, false, disposers);
    addListener(clearButton, 'keydown', handleClearKeyDown, false, disposers);
    addListener(clearButton, 'keyup', handleClearKeyUp, false, disposers);
    addListener(clearButton, 'blur', () => {
      if (!clearHoldState.completed) {
        stopClearHold();
      }
    }, false, disposers);
  }

  updateFullscreenButtons();

  return {
    destroy() {
      disposers.forEach((dispose) => dispose());
      disposers.length = 0;
      if (statusTimeoutId) {
        window.clearTimeout(statusTimeoutId);
      }
      if (canvasWrapper && isFullscreenActive()) {
        exitFullscreen().catch(() => {});
      }

      if (clearHoldState.rafId !== null) {
        window.cancelAnimationFrame(clearHoldState.rafId);
      }

      if (clearHoldState.resetTimeoutId !== null) {
        window.clearTimeout(clearHoldState.resetTimeoutId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }

      applyFullscreenStyles(false);

      hideClearHint();

      root.removeAttribute('data-game');
      root.innerHTML = '';
    },
  };
}
