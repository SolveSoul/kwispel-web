export function createUiHandlers({
  state,
  updateTool,
  updateActiveColor,
  updateBrushSize,
  restoreSnapshot,
  playUiSound,
  showClearHint,
  downloadImage,
  toggleFullscreen,
  clearHoldState,
}) {
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
        if (!clearHoldState?.completed) {
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

  return {
    handleToolClick,
    handlePaletteClick,
    handleBrushSizeClick,
    handleActionClick,
  };
}
