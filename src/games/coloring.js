/**
 * Placeholder module voor de digitale kleurervaring.
 */
export function mountColoringGame(root) {
  if (!root) {
    throw new Error('Kleur game root ontbreekt.');
  }

  root.setAttribute('data-game-placeholder', 'coloring');

  return {
    destroy() {
      root.removeAttribute('data-game-placeholder');
      root.innerHTML = '';
    },
  };
}
