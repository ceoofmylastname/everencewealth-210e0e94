// Web Audio API sound effects for the Antigravity Presentation System

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, volume: number, duration: number) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.value = volume;

    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Silently fail if audio is not supported
  }
}

export function playSlideTransition() {
  playTone(880, 0.08, 200);
}

export function playStatReveal() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.15);
    gainNode.gain.value = 0.05;
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // Silently fail
  }
}

export function playConfettiSound() {
  try {
    const ctx = getAudioContext();
    const freqs = [880, 1100, 1320];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 * (i + 1) + 0.1);
      osc.start(ctx.currentTime + 0.05 * i);
      osc.stop(ctx.currentTime + 0.05 * (i + 1) + 0.1);
    });
  } catch {
    // Silently fail
  }
}
