import antImage from '../../assets/games/memory/ant.png';
import bumblebeeImage from '../../assets/games/memory/bumblebee.png';
import chilliSittingImage from '../../assets/games/memory/chilli_sitting.png';
import eetbakjeImage from '../../assets/games/memory/eetbakje.png';
import kwispelNeutralImage from '../../assets/games/memory/kwispel_neutral.png';
import monarchButterflyImage from '../../assets/games/memory/monarch_butterfly.png';
import pigeonNeutralImage from '../../assets/games/memory/pigeon_neutral.png';

const DEFAULT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const DEFAULT_CARDS = [
  { pairKey: 'kwispelNeutral', labelKey: 'kwispelNeutral', image: kwispelNeutralImage },
  { pairKey: 'chilliSitting', labelKey: 'chilliSitting', image: chilliSittingImage },
  { pairKey: 'bumblebee', labelKey: 'bumblebee', image: bumblebeeImage },
  { pairKey: 'ant', labelKey: 'ant', image: antImage },
  { pairKey: 'eetbakje', labelKey: 'eetbakje', image: eetbakjeImage },
  { pairKey: 'monarchButterfly', labelKey: 'monarchButterfly', image: monarchButterflyImage },
  { pairKey: 'pigeonNeutral', labelKey: 'pigeonNeutral', image: pigeonNeutralImage },
];

const DEFAULT_DIFFICULTIES = [
  { id: 'sprout', pairs: 3 },
  { id: 'paws', pairs: 4 },
  { id: 'tails', pairs: 6 },
];

const DEFAULT_AUDIO = {
  start: [
    { frequency: 440, duration: 0.12, volume: 0.22 },
    { frequency: 554.37, duration: 0.12, volume: 0.2, delay: 0.14 },
  ],
  flip: [{ frequency: 520, duration: 0.1, volume: 0.18 }],
  match: [
    { frequency: 620, duration: 0.16, volume: 0.22 },
    { frequency: 780, duration: 0.18, volume: 0.22, delay: 0.18 },
  ],
  mismatch: [
    { frequency: 320, duration: 0.22, volume: 0.18, type: 'sawtooth' },
    { frequency: 250, duration: 0.22, volume: 0.16, type: 'sawtooth', delay: 0.24 },
  ],
  victory: [
    { frequency: 523.25, duration: 0.18, volume: 0.22 },
    { frequency: 659.25, duration: 0.18, volume: 0.2, delay: 0.2 },
    { frequency: 783.99, duration: 0.22, volume: 0.18, delay: 0.42 },
  ],
};

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

export function createMemoryConfig(overrides = {}) {
  const lettersOverride = Array.isArray(overrides.letters) && overrides.letters.length > 0
    ? overrides.letters
    : DEFAULT_LETTERS;

  const cards = Array.isArray(overrides.cards) && overrides.cards.length > 0
    ? overrides.cards
    : DEFAULT_CARDS;

  const difficulties = Array.isArray(overrides.difficulties) && overrides.difficulties.length > 0
    ? overrides.difficulties
    : DEFAULT_DIFFICULTIES;

  const audioOverrides = overrides.audio && typeof overrides.audio === 'object' ? overrides.audio : null;
  const audio = audioOverrides ? mergeDefined({ ...DEFAULT_AUDIO }, audioOverrides) : { ...DEFAULT_AUDIO };

  return {
    letters: [...lettersOverride],
    cards,
    difficulties,
    audio,
  };
}

export const MEMORY_DEFAULTS = {
  letters: DEFAULT_LETTERS,
  cards: DEFAULT_CARDS,
  difficulties: DEFAULT_DIFFICULTIES,
  audio: DEFAULT_AUDIO,
};
