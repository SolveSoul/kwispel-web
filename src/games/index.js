import { mountMemoryGame } from './memory.js';
import { mountPuzzlesGame } from './puzzles.js';
import { mountColoringGame } from './coloring.js';

export { mountMemoryGame, mountPuzzlesGame, mountColoringGame };

export const gameRegistry = {
  memory: mountMemoryGame,
  puzzles: mountPuzzlesGame,
  coloring: mountColoringGame,
};
