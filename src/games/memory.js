import { t } from '../i18n.js';
import antImage from '../assets/games/memory/ant.png';
import bumblebeeImage from '../assets/games/memory/bumblebee.png';
import chilliSittingImage from '../assets/games/memory/chilli_sitting.png';
import eetbakjeImage from '../assets/games/memory/eetbakje.png';
import kwispelNeutralImage from '../assets/games/memory/kwispel_neutral.png';
import { getSharedAudioContext, playSequence } from './audio.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CARD_CATALOG = [
  { pairKey: 'kwispelNeutral', image: kwispelNeutralImage },
  { pairKey: 'chilliSitting', image: chilliSittingImage },
  { pairKey: 'bumblebee', image: bumblebeeImage },
  { pairKey: 'ant', image: antImage },
  { pairKey: 'eetbakje', image: eetbakjeImage },
];

const DIFFICULTY_OPTIONS = [
  { id: 'sprout', pairs: 3 },
  { id: 'paws', pairs: 4 },
  { id: 'tails', pairs: 6 },
];

const SOUND_MAP = {
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

function shuffle(source) {
  const array = [...source];

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function buildImagePairs(pairCount) {
  const available = CARD_CATALOG.slice(0, pairCount);
  const cards = [];

  available.forEach((item, index) => {
    const pairKey = `${item.pairKey}-${index}`;
    const cardBase = {
      pairKey,
      kind: 'image',
      labelKey: item.pairKey,
      image: item.image,
    };
    cards.push({ ...cardBase, id: `${pairKey}-a` });
    cards.push({ ...cardBase, id: `${pairKey}-b` });
  });

  return cards;
}

function buildLetterFallbackPairs(requiredPairs, offset = 0) {
  const lettersPool = shuffle(LETTERS).slice(0, requiredPairs);
  const cards = [];

  lettersPool.forEach((letter, index) => {
    const pairKey = `letter-${letter}-${index + offset}`;
    const cardBase = {
      pairKey,
      kind: 'letter',
      letter,
    };
    cards.push({ ...cardBase, id: `${pairKey}-a` });
    cards.push({ ...cardBase, id: `${pairKey}-b` });
  });

  return cards;
}

function createDeck(pairCount) {
  const imagePairs = buildImagePairs(pairCount);

  if (imagePairs.length / 2 === pairCount) {
    return shuffle(imagePairs);
  }

  const missingPairs = pairCount - imagePairs.length / 2;
  const fallbackPairs = buildLetterFallbackPairs(missingPairs, imagePairs.length / 2);

  return shuffle([...imagePairs, ...fallbackPairs]);
}

export function mountMemoryGame(root) {
  if (!root) {
    throw new Error('Memory game root ontbreekt.');
  }

  root.setAttribute('data-game', 'memory');

  const state = {
    stage: 'intro',
    selectedDifficultyId: null,
    difficultyId: null,
    deck: [],
    cardLookup: new Map(),
    flippedIds: [],
    matchedIds: new Set(),
    moves: 0,
    isBusy: false,
    isMuted: false,
    startTime: null,
    lastResult: null,
  };

  const activeTimeouts = new Set();

  function cleanupTimers() {
    activeTimeouts.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    activeTimeouts.clear();
  }

  function schedule(callback, delay) {
    const timerId = window.setTimeout(() => {
      activeTimeouts.delete(timerId);
      callback();
    }, delay);

    activeTimeouts.add(timerId);
  }

  function playSound(name) {
    if (state.isMuted) {
      return;
    }

    const sequence = SOUND_MAP[name];

    if (!sequence || typeof window === 'undefined') {
      return;
    }

    const ctx = getSharedAudioContext();

    if (!ctx) {
      return;
    }

    playSequence(sequence, { context: ctx, attack: 0.02, release: 0.1 });
  }

function beginGame(optionId) {
  const option = DIFFICULTY_OPTIONS.find((item) => item.id === optionId);

  if (!option) {
    return;
  }

  const hasEnoughArt = CARD_CATALOG.length >= option.pairs;

  if (!hasEnoughArt) {
    return;
  }

  cleanupTimers();
  const deck = createDeck(option.pairs);
  state.stage = 'playing';
  state.difficultyId = option.id;
  state.deck = deck;
  state.cardLookup = new Map(deck.map((card) => [card.id, card]));
  state.flippedIds = [];
  state.matchedIds = new Set();
  state.moves = 0;
  state.isBusy = false;
  state.startTime = performance.now();
  state.lastResult = null;

  render();
  playSound('start');
}

  function resetToIntro() {
    cleanupTimers();
    state.stage = 'intro';
    state.deck = [];
    state.cardLookup = new Map();
    state.flippedIds = [];
    state.matchedIds = new Set();
    state.moves = 0;
    state.isBusy = false;
    state.startTime = null;
    state.lastResult = null;
    render();
  }

  function handleCardSelection(cardId) {
    if (state.stage !== 'playing' || state.isBusy) {
      return;
    }

    if (state.flippedIds.includes(cardId) || state.matchedIds.has(cardId)) {
      return;
    }

    const card = state.cardLookup.get(cardId);

    if (!card) {
      return;
    }

    state.flippedIds.push(cardId);
    playSound('flip');
    render();

    if (state.flippedIds.length < 2) {
      return;
    }

    state.isBusy = true;
    state.moves += 1;

    const [firstId, secondId] = state.flippedIds;
    const firstCard = state.cardLookup.get(firstId);
    const secondCard = state.cardLookup.get(secondId);

    if (firstCard && secondCard && firstCard.pairKey === secondCard.pairKey) {
      playSound('match');

      schedule(() => {
        state.matchedIds.add(firstId);
        state.matchedIds.add(secondId);
        state.flippedIds = [];
        state.isBusy = false;
        render();

        if (state.matchedIds.size === state.deck.length) {
          const elapsed = state.startTime ? performance.now() - state.startTime : 0;
          state.lastResult = {
            moves: state.moves,
            seconds: Math.round(elapsed / 1000),
          };
          state.stage = 'finished';
          playSound('victory');
          render();
        }
      }, 260);

      return;
    }

    playSound('mismatch');

    schedule(() => {
      state.flippedIds = [];
      state.isBusy = false;
      render();
    }, 720);
  }

  function getGridClass(totalCards) {
    if (totalCards <= 6) {
      return 'grid-cols-3 sm:grid-cols-3';
    }

    if (totalCards <= 8) {
      return 'grid-cols-3 sm:grid-cols-4';
    }

    return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
  }

  function renderCards() {
    const total = state.deck.length;
    const gridClass = getGridClass(total);

    const cardsMarkup = state.deck
      .map((card) => {
        const isFlipped = state.flippedIds.includes(card.id);
        const isMatched = state.matchedIds.has(card.id);
        const reveal = isFlipped || isMatched;
        let ariaLabel = t('memoryGame.hiddenCard');

        if (card.kind === 'image') {
          ariaLabel = t(`memoryGame.cards.${card.labelKey}`);
        }

        if (card.kind === 'letter') {
          ariaLabel = t('memoryGame.letterLabel').replace('{letter}', card.letter);
        }

        const classes = [
          'memory-card inline-flex h-24 sm:h-28 md:h-32 items-center justify-center rounded-3xl border-4 text-3xl font-heading transition-all duration-150',
          reveal ? 'bg-white text-accent border-accent/40 shadow-soft' : 'bg-accent/10 text-accent border-accent/20 hover:border-accent/50',
          isMatched ? 'bg-accent text-white border-accent shadow-soft' : '',
          state.isBusy && !reveal ? 'opacity-80' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return `
          <button
            type="button"
            class="${classes}"
            data-card-id="${card.id}"
            aria-label="${ariaLabel}"
          >
            ${
              reveal
                ? card.kind === 'image'
                  ? `<img src="${card.image}" alt="${ariaLabel}" class="h-20 w-20 select-none object-contain" />`
                  : `<span class="select-none">${card.letter}</span>`
                : '<span class="select-none">?</span>'
            }
          </button>
        `;
      })
      .join('');

    return `<div class="grid gap-4 ${gridClass}">${cardsMarkup}</div>`;
  }

  function renderIntro() {
    const cards = DIFFICULTY_OPTIONS.map((option) => {
      const isSelected = state.selectedDifficultyId === option.id;
      const label = t(`memoryGame.difficulty.${option.id}.label`);
      const description = t(`memoryGame.difficulty.${option.id}.subLabel`);
      const hasEnoughArt = CARD_CATALOG.length >= option.pairs;
      const classes = [
        'flex flex-col gap-2 rounded-3xl border px-5 py-6 text-left transition-all',
        isSelected
          ? 'border-accent bg-accent/10 text-accent shadow-soft'
          : hasEnoughArt
            ? 'border-accent/15 bg-white text-text hover:border-accent/40'
            : 'border-dashed border-accent/20 bg-white text-text/60',
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${classes}"
          data-difficulty="${option.id}"
          aria-pressed="${isSelected}"
          ${hasEnoughArt ? '' : 'disabled aria-disabled="true"'}
        >
          <span class="text-lg font-semibold text-accent">${label}</span>
          <span class="text-sm text-text/80">${description}</span>
          ${hasEnoughArt ? '' : `<span class="text-xs font-medium text-text/60">${t('memoryGame.difficultyUnavailable')}</span>`}
        </button>
      `;
    }).join('');

    const introText = t('memoryGame.difficultyIntro');

    return `
      <div class="flex flex-col gap-5">
        <h2 class="text-2xl md:text-3xl">${t('memoryGame.difficultyHeading')}</h2>
        <p class="text-sm md:text-base text-text/80">${Array.isArray(introText) ? introText.join('') : introText}</p>
        <div class="grid gap-4 md:grid-cols-3">
          ${cards}
        </div>
        <div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition disabled:opacity-60 disabled:cursor-not-allowed"
            data-action="begin"
            data-cta="primary"
            ${state.selectedDifficultyId ? '' : 'disabled'}
          >
            ${t('memoryGame.startButton')}
          </button>
        </div>
      </div>
    `;
  }

  function renderHud() {
    if (state.stage !== 'playing' && state.stage !== 'finished') {
      return '';
    }

    const difficulty = DIFFICULTY_OPTIONS.find((item) => item.id === state.difficultyId);
    const levelLabel = difficulty ? t(`memoryGame.difficulty.${difficulty.id}.label`) : '';
    const pairsFound = Math.floor(state.matchedIds.size / 2);
    const totalPairs = Math.floor(state.deck.length / 2);

    return `
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-accent/15 bg-accent/5 px-5 py-4 text-sm md:text-base">
        <span class="font-semibold text-accent">${t('memoryGame.currentDifficulty').replace('{level}', levelLabel)}</span>
        <div class="flex flex-wrap items-center gap-4 text-text/80">
          <span>${t('memoryGame.hud.moves')}: <strong class="text-accent">${state.moves}</strong></span>
          <span>${t('memoryGame.hud.pairs')}: <strong class="text-accent">${pairsFound}</strong> / ${totalPairs}</span>
        </div>
      </div>
    `;
  }

  function renderFinished() {
    if (state.stage !== 'finished') {
      return '';
    }

    const moves = state.lastResult?.moves ?? state.moves;
    const message = t('memoryGame.finishedMessage').replace('{moves}', moves);

    return `
      <div class="flex flex-col gap-4 rounded-3xl border border-accent/20 bg-white/90 p-6 text-center shadow-soft">
        <h3 class="text-2xl md:text-3xl">${t('memoryGame.finishedTitle')}</h3>
        <p class="text-sm md:text-base text-text/80">${message}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button type="button" class="rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition" data-action="play-again" data-cta="primary">
            ${t('memoryGame.playAgain')}
          </button>
          <button type="button" class="rounded-full border border-accent/20 bg-white px-6 py-3 text-base font-semibold text-accent transition" data-action="choose-level" data-cta="secondary">
            ${t('memoryGame.chooseLevel')}
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    const muteLabel = state.isMuted ? t('memoryGame.mute.off') : t('memoryGame.mute.on');
    const muteIcon = state.isMuted
      ? '<i class="fa-solid fa-volume-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-volume-high" aria-hidden="true"></i>';

    const introMarkup = state.stage === 'intro' ? renderIntro() : '';
    const hudMarkup = renderHud();
    const cardsMarkup = state.stage === 'playing' || state.stage === 'finished' ? renderCards() : '';
    const finishedMarkup = renderFinished();

    root.innerHTML = `
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-accent/10 bg-accent/5 px-4 py-3">
          <p class="text-sm md:text-base text-text/80">${t('memoryGame.instructions')}</p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white px-4 py-2 text-sm font-medium text-accent transition"
            data-action="toggle-mute"
            aria-pressed="${state.isMuted}"
          >
            <span aria-hidden="true">${muteIcon}</span>
            ${muteLabel}
          </button>
        </div>
        ${introMarkup}
        ${hudMarkup}
        ${cardsMarkup}
        ${finishedMarkup}
      </div>
    `;
  }

  function handleClick(event) {
    const target = event.target.closest('[data-action], [data-difficulty], [data-card-id]');

    if (!target || !root.contains(target)) {
      return;
    }

    const { action, difficulty, cardId } = target.dataset;

    if (difficulty) {
      state.selectedDifficultyId = difficulty;
      render();
      return;
    }

    if (cardId) {
      handleCardSelection(cardId);
      return;
    }

    switch (action) {
      case 'toggle-mute':
        state.isMuted = !state.isMuted;
        render();
        break;
      case 'begin':
        if (state.selectedDifficultyId) {
          beginGame(state.selectedDifficultyId);
        }
        break;
      case 'play-again':
        if (state.difficultyId) {
          beginGame(state.difficultyId);
        }
        break;
      case 'choose-level':
        state.selectedDifficultyId = state.difficultyId;
        state.difficultyId = null;
        resetToIntro();
        break;
      default:
        break;
    }
  }

  render();
  root.addEventListener('click', handleClick);

  return {
    destroy() {
      cleanupTimers();
      root.removeEventListener('click', handleClick);
      root.innerHTML = '';
      root.removeAttribute('data-game');
    },
  };
}
