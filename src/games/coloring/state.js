import { COLORING_DEFAULTS } from './config.js';

function resolveInitialColor(palette, requestedColorId) {
  const source = Array.isArray(palette) && palette.length > 0
    ? palette
    : COLORING_DEFAULTS.palette;

  const explicit = requestedColorId
    ? source.find((color) => color.id === requestedColorId)
    : null;

  if (explicit) {
    return explicit;
  }

  if (source.length > 0) {
    return source[0];
  }

  return {
    id: 'default-color',
    value: '#f6d6de',
    label: '',
  };
}

function resolveInitialTemplate(templates, requestedTemplateId) {
  if (!Array.isArray(templates) || templates.length === 0) {
    return null;
  }

  if (requestedTemplateId) {
    const match = templates.find((template) => template.id === requestedTemplateId);
    if (match) {
      return match.id;
    }
  }

  return templates[0].id;
}

function resolveInitialToolId(tools) {
  const source = Array.isArray(tools) && tools.length > 0
    ? tools
    : COLORING_DEFAULTS.tools;

  const brushTool = source.find((tool) => tool.id === 'brush');
  if (brushTool) {
    return brushTool.id;
  }

  return source[0]?.id ?? 'brush';
}

function resolveInitialBrushSizeId(brushSizes) {
  const source = Array.isArray(brushSizes) && brushSizes.length > 0
    ? brushSizes
    : COLORING_DEFAULTS.brushSizes;

  const medium = source.find((entry) => entry.id === 'medium');
  if (medium) {
    return medium.id;
  }

  return source[0]?.id ?? COLORING_DEFAULTS.brushSizes[0].id;
}

export function createColoringState({
  palette,
  templates,
  tools,
  brushSizes,
  initialTemplateId,
  initialColorId,
} = {}) {
  const startingColor = resolveInitialColor(palette, initialColorId);
  const activeTemplateId = resolveInitialTemplate(templates, initialTemplateId);
  const toolId = resolveInitialToolId(tools);
  const brushSizeId = resolveInitialBrushSizeId(brushSizes);

  return {
    toolId,
    brushSizeId,
    activeColorId: startingColor.id,
    activeColor: startingColor.value ?? '#f6d6de',
    activeTemplateId,
    pointerId: null,
    isDrawing: false,
    lastPoint: null,
    hasMutated: false,
    history: [],
    historyIndex: -1,
  };
}

export function resetHistory(state) {
  state.history = [];
  state.historyIndex = -1;
}
