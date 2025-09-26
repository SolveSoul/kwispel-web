import kwispelTongueTemplate from '../../assets/games/coloring/kwispel_tongue_template.svg';

const DEFAULT_CANVAS = {
  width: 960,
  height: 680,
  maxDevicePixelRatio: 2.5,
  bucketTolerance: 22,
};

const DEFAULT_HISTORY = {
  limit: 25,
};

const DEFAULT_CLEAR = {
  holdDurationMs: 1600,
  progressRadius: 21,
  progressResetDelayMs: 320,
};

const DEFAULT_FULLSCREEN = {
  backdrop: '#fdf8f4',
};

const DEFAULT_PALETTE_SCROLL_STYLE_ID = 'kwispel-palette-scroll-style';

const DEFAULT_UI_SOUND_MAP = {
  color: { frequency: 820, duration: 0.12, volume: 0.07, type: 'triangle' },
  tool: { frequency: 560, duration: 0.14, volume: 0.07, type: 'sine' },
  brush: { frequency: 420, duration: 0.1, volume: 0.06, type: 'sine' },
  action: { frequency: 300, duration: 0.12, volume: 0.06, type: 'square' },
  clear: { frequency: 220, duration: 0.28, volume: 0.08, type: 'sine' },
  hint: { frequency: 180, duration: 0.16, volume: 0.05, type: 'triangle' },
};

const DEFAULT_PALETTE = [
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

const DEFAULT_TOOL_OPTIONS = [
  { id: 'brush', labelKey: 'coloringGame.tools.brush', icon: 'fa-solid fa-paintbrush' },
  { id: 'bucket', labelKey: 'coloringGame.tools.bucket', icon: 'fa-solid fa-fill-drip' },
  { id: 'eraser', labelKey: 'coloringGame.tools.eraser', icon: 'fa-solid fa-eraser' },
];

const DEFAULT_BRUSH_SIZES = [
  { id: 'fine', size: 12, labelKey: 'coloringGame.brushSizes.fine' },
  { id: 'medium', size: 26, labelKey: 'coloringGame.brushSizes.medium' },
  { id: 'bold', size: 40, labelKey: 'coloringGame.brushSizes.bold' },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'kwispel-tongue',
    titleKey: 'coloringGame.templates.items.kwispelTongue.title',
    descriptionKey: 'coloringGame.templates.items.kwispelTongue.description',
    tags: [
      'coloringGame.templates.items.kwispelTongue.tags.ages',
      'coloringGame.templates.items.kwispelTongue.tags.details',
    ],
    assetUrl: kwispelTongueTemplate,
    previewAltKey: 'coloringGame.templates.items.kwispelTongue.previewAlt',
  },
];

function mergeDefined(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined) {
      target[key] = value;
    }
  });

  return target;
}

export function createColoringConfig(overrides = {}) {
  const palette = Array.isArray(overrides.palette) && overrides.palette.length > 0
    ? overrides.palette
    : DEFAULT_PALETTE;

  const tools = Array.isArray(overrides.tools) && overrides.tools.length > 0
    ? overrides.tools
    : DEFAULT_TOOL_OPTIONS;

  const brushSizes = Array.isArray(overrides.brushSizes) && overrides.brushSizes.length > 0
    ? overrides.brushSizes
    : DEFAULT_BRUSH_SIZES;

  const templates = Array.isArray(overrides.templates) && overrides.templates.length > 0
    ? overrides.templates
    : DEFAULT_TEMPLATES;

  const canvas = mergeDefined({ ...DEFAULT_CANVAS }, overrides.canvas);
  const clear = mergeDefined({ ...DEFAULT_CLEAR }, overrides.clear);
  const history = mergeDefined({ ...DEFAULT_HISTORY }, overrides.history);
  const fullscreen = mergeDefined({ ...DEFAULT_FULLSCREEN }, overrides.fullscreen);

  const audioOverrides = overrides.audio && typeof overrides.audio === 'object' ? overrides.audio : {};
  const audioUiOverrides = audioOverrides.ui && typeof audioOverrides.ui === 'object' ? audioOverrides.ui : null;
  const audio = { ...audioOverrides };
  audio.ui = audioUiOverrides ? mergeDefined({ ...DEFAULT_UI_SOUND_MAP }, audioUiOverrides) : { ...DEFAULT_UI_SOUND_MAP };

  const paletteScrollStyleId = overrides.paletteScrollStyleId ?? DEFAULT_PALETTE_SCROLL_STYLE_ID;

  return {
    canvas,
    clear,
    history,
    fullscreen,
    paletteScrollStyleId,
    palette,
    tools,
    brushSizes,
    templates,
    audio,
  };
}

export const COLORING_DEFAULTS = {
  canvas: DEFAULT_CANVAS,
  history: DEFAULT_HISTORY,
  clear: DEFAULT_CLEAR,
  fullscreen: DEFAULT_FULLSCREEN,
  paletteScrollStyleId: DEFAULT_PALETTE_SCROLL_STYLE_ID,
  palette: DEFAULT_PALETTE,
  tools: DEFAULT_TOOL_OPTIONS,
  brushSizes: DEFAULT_BRUSH_SIZES,
  templates: DEFAULT_TEMPLATES,
  audio: {
    ui: DEFAULT_UI_SOUND_MAP,
  },
};
