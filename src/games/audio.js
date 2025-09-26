const MIN_GAIN = 0.0001;
const DEFAULT_ATTACK = 0.02;
const DEFAULT_RELEASE = 0.06;

let sharedAudioContext = null;

export function getSharedAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContextCtor();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

export function playTone(note, options = {}) {
  if (!note) {
    return false;
  }

  const context = options.context ?? getSharedAudioContext();

  if (!context) {
    return false;
  }

  const frequency = Number.isFinite(note.frequency) ? note.frequency : 440;
  const duration = Math.max(note.duration ?? 0.18, 0.01);
  const delay = Math.max(note.delay ?? 0, 0);
  const targetVolume = Math.max(note.volume ?? 0.08, MIN_GAIN);
  const type = note.type ?? 'sine';
  const attack = Math.max(note.attack ?? options.attack ?? DEFAULT_ATTACK, 0);
  const release = Math.max(note.release ?? options.release ?? DEFAULT_RELEASE, 0);

  const startAt = (options.startAt ?? context.currentTime) + delay;
  const stopAt = startAt + duration;
  const attackEnd = Math.min(startAt + attack, stopAt - MIN_GAIN);
  const releaseStart = Math.max(stopAt - release, startAt);

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(MIN_GAIN, startAt);

  if (attackEnd > startAt) {
    gain.gain.exponentialRampToValueAtTime(targetVolume, attackEnd);
  } else {
    gain.gain.setValueAtTime(targetVolume, startAt);
  }

  if (releaseStart > attackEnd) {
    gain.gain.setValueAtTime(targetVolume, releaseStart);
  }

  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, stopAt);

  oscillator.connect(gain);
  gain.connect(options.destination ?? context.destination);

  oscillator.start(startAt);
  oscillator.stop(stopAt);

  return true;
}

export function playSequence(notes, options = {}) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return false;
  }

  const context = options.context ?? getSharedAudioContext();

  if (!context) {
    return false;
  }

  let played = false;

  notes.forEach((note) => {
    const succeeded = playTone(note, { context, attack: options.attack, release: options.release });
    played = played || succeeded;
  });

  return played;
}

export function setSharedAudioContext(context) {
  sharedAudioContext = context;
}
