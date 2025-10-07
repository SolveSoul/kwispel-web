export function getBrushSize(brushSizes, sizeId) {
  if (!Array.isArray(brushSizes) || brushSizes.length === 0) {
    return 24;
  }

  const match = brushSizes.find((entry) => entry.id === sizeId);

  if (match && Number.isFinite(match.size)) {
    return match.size;
  }

  const fallbackIndex = brushSizes.length > 1 ? 1 : 0;
  const fallback = brushSizes[fallbackIndex];

  if (fallback && Number.isFinite(fallback.size)) {
    return fallback.size;
  }

  return 24;
}

export function addListener(target, type, handler, options, store) {
  target.addEventListener(type, handler, options);
  store.push(() => target.removeEventListener(type, handler, options));
}
