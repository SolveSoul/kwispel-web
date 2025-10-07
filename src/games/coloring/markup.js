import { t } from '../../i18n.js';
import { COLORING_DEFAULTS } from './config.js';

export function ensurePaletteScrollStyle(styleId) {
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

export function buildTemplateCardsMarkup(state, templates) {
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

export function createMarkup(state, palette, templates, toolOptions, brushSizes, uiConfig) {
  const activeColor = palette.find((color) => color.id === state.activeColorId);
  const activeColorLabel = activeColor ? activeColor.label : '';
  const templateCards = buildTemplateCardsMarkup(state, templates);
  const clearProgressRadius = uiConfig?.clearProgressRadius ?? COLORING_DEFAULTS.clear.progressRadius;
  const clearProgressCircumference = uiConfig?.clearProgressCircumference ??
    2 * Math.PI * clearProgressRadius;
  const tools = Array.isArray(toolOptions) && toolOptions.length > 0
    ? toolOptions
    : COLORING_DEFAULTS.tools;
  const brushes = Array.isArray(brushSizes) && brushSizes.length > 0
    ? brushSizes
    : COLORING_DEFAULTS.brushSizes;

  return `
    <div class="flex flex-col gap-6" data-coloring-shell>
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
          <div class="pointer-events-auto absolute bottom-4 left-4 z-20 flex w-[5rem] flex-col items-center gap-3 rounded-3xl border border-accent/10 bg-white/95 p-2 shadow-soft backdrop-blur" data-palette-rail>
            <div class="flex flex-col items-center gap-2" data-active-color-info>
              <span class="h-9 w-9 rounded-full border border-white/70 shadow-soft" data-active-color style="background-color: ${state.activeColor};"></span>
              <span class="visually-hidden" data-active-color-label>${t('coloringGame.activeColorLabel').replace('{label}', activeColorLabel)}</span>
            </div>
            <div class="flex flex-col items-center gap-1" data-palette-scroll-controls>
              <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-white text-accent shadow-soft transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-40" data-palette-scroll="up" title="${t('coloringGame.palette.scrollUp')}" aria-label="${t('coloringGame.palette.scrollUp')}"><i aria-hidden="true" class="fa-solid fa-chevron-up"></i></button>
              <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-white text-accent shadow-soft transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-40" data-palette-scroll="down" title="${t('coloringGame.palette.scrollDown')}" aria-label="${t('coloringGame.palette.scrollDown')}"><i aria-hidden="true" class="fa-solid fa-chevron-down"></i></button>
            </div>
            <div
              class="flex max-h-[18rem] w-full flex-col items-center gap-2 overflow-y-auto pt-2 pb-1 [scrollbar-width:none]"
              data-color-palette
              style="-ms-overflow-style: none;"
            >
              ${palette
                .map((color) => {
                  const active = state.activeColorId === color.id;
                  return `
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 text-sm text-white shadow-soft transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60"
                      data-color-id="${color.id}"
                      aria-pressed="${active}"
                      aria-label="${t('coloringGame.aria.paletteColor').replace('{label}', color.label)}"
                      style="background-color: ${color.value};"
                    >
                      <span class="sr-only">${color.label}</span>
                      <span class="inline-flex h-3 w-3 items-center justify-center rounded-full bg-white/90 text-[0.5rem] text-accent ${active ? '' : 'hidden'}">
                        <i aria-hidden="true" class="fa-solid fa-check"></i>
                      </span>
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>
          <div class="pointer-events-auto absolute bottom-4 right-4 z-20 flex flex-col gap-3 rounded-3xl border border-accent/10 bg-white/95 p-2 shadow-soft backdrop-blur" data-toolbar-tools>
            ${tools
              .map((tool) => {
                const active = state.toolId === tool.id;
                const icon = tool.icon ?? 'fa-paintbrush';
                return `
                  <button
                    type="button"
                    class="flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-white text-lg text-accent shadow-soft transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 ${active ? 'ring-2 ring-accent/50' : ''}"
                    data-tool="${tool.id}"
                    aria-pressed="${active}"
                    aria-label="${t(tool.labelKey)}"
                    title="${t(tool.labelKey)}"
                  >
                    <i aria-hidden="true" class="fa-solid ${icon}"></i>
                    <span class="sr-only">${t(tool.labelKey)}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
          <div class="pointer-events-auto absolute left-1/2 top-full z-20 mt-4 flex -translate-x-1/2 flex-col gap-3 rounded-3xl border border-accent/10 bg-white/95 p-3 shadow-soft backdrop-blur" data-brush-sizes>
            ${brushes
              .map((entry) => {
                const active = state.brushSizeId === entry.id;
                const size = entry.size ?? 24;
                return `
                  <button
                    type="button"
                    class="flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-white px-4 py-2 text-sm text-accent shadow-soft transition hover:border-accent/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 ${active ? 'ring-2 ring-accent/50' : ''}"
                    data-brush-size="${entry.id}"
                    aria-pressed="${active}"
                    aria-label="${t(entry.labelKey)}"
                  >
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent/10" style="font-size: ${Math.max(size / 4, 12)}px;">
                      <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent" style="width: ${size / 3}px; height: ${size / 3}px;"></span>
                    </span>
                    <span class="sr-only">${t(entry.labelKey)}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderToolButtons(state, tools) {
  if (!Array.isArray(tools)) {
    return '';
  }

  return tools
    .map((tool) => {
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
    })
    .join('');
}

export function renderPaletteSwatches(state, palette) {
  if (!Array.isArray(palette)) {
    return '';
  }

  return palette
    .map((color) => {
      const isActive = color.id === state.activeColorId;
      const classes = [
        'flex h-9 w-9 items-center justify-center rounded-full border shadow-soft transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/60 aspect-square shrink-0 p-0',
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

export function renderBrushSizeButtons(state, brushSizes) {
  if (!Array.isArray(brushSizes)) {
    return '';
  }

  return brushSizes
    .map((entry) => {
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
      const iconSizeRem = Math.min(1.4, Math.max(0.6, brushIconBasis / 24)).toFixed(2);

      return `
        <button
          type="button"
          class="${classes}"
          data-brush-size="${entry.id}"
          aria-label="${t(entry.labelKey)}"
          aria-pressed="${isActive}"
          title="${t(entry.labelKey)}"
        >
          <span class="sr-only">${t(entry.labelKey)}</span>
          <span class="flex h-6 w-6 items-center justify-center text-accent">
            <i aria-hidden="true" class="fa-solid fa-circle" style="font-size: ${iconSizeRem}rem;"></i>
          </span>
        </button>
      `;
    })
    .join('');
}
