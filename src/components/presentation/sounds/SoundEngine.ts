class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = "sine",
    vol = 0.06,
    attack = 0.003,
    release = 0.12
  ) {
    if (!this.enabled || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = type;
      o.frequency.value = freq;
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur + release);
      o.start(t);
      o.stop(t + dur + release + 0.05);
    } catch {
      // Silently fail
    }
  }

  /** White noise burst for slam/wipe animations */
  swoosh() {
    if (!this.enabled || !this.ctx) return;
    try {
      const dur = 0.09;
      const size = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buf;

      const filt = this.ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.setValueAtTime(900, this.ctx.currentTime);
      filt.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + dur);
      filt.Q.value = 0.6;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.13, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      src.connect(filt);
      filt.connect(gain);
      gain.connect(this.ctx.destination);
      src.start();
    } catch {
      // Silently fail
    }
  }

  /** Chime for card rises, positive reveals */
  chime(pitch = 880) {
    this.tone(pitch, 0.35, "sine", 0.07, 0.002, 0.3);
    setTimeout(() => this.tone(pitch * 1.5, 0.2, "sine", 0.025, 0.001, 0.18), 15);
  }

  /** Dark/dramatic reveals */
  whomp() {
    this.tone(55, 0.22, "sine", 0.16, 0.001, 0.18);
    this.tone(38, 0.32, "sine", 0.09, 0.001, 0.22);
  }

  /** Table rows, counter ticks */
  tick() {
    this.tone(1400, 0.012, "square", 0.04, 0.001, 0.01);
  }

  /** Rising tone during counter animation */
  rise(progress: number) {
    if (Math.random() < 0.05) {
      this.tone(220 + progress * 660, 0.04, "sine", 0.025, 0.001, 0.03);
    }
  }

  /** Zero hero, answer reveals */
  explode() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.chime(f), i * 42);
    });
  }

  /** Full slide change */
  slideTransition() {
    this.swoosh();
    setTimeout(() => this.chime(660), 420);
  }

  /** Celebration sound */
  confettiSound() {
    [523, 659, 784, 523, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.18, "sine", 0.05, 0.002, 0.14), i * 55);
    });
  }
}

export const sound = new SoundEngine();
