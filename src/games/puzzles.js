/**
 * Placeholder module for de Kwispel puzzelervaring.
 */
export function mountPuzzlesGame(root) {
  if (!root) {
    throw new Error('Puzzel game root ontbreekt.');
  }

  root.setAttribute('data-game-placeholder', 'puzzles');

  return {
    destroy() {
      root.removeAttribute('data-game-placeholder');
      root.innerHTML = '';
    },
  };
}
