// Procedural Web Audio API sound generator for Nioh combat effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public play(type: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const vol = this.masterVolume;

      switch (type) {
        case 'slash_light': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, now);
          filter.Q.setValueAtTime(3, now);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(550, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

          gain.gain.setValueAtTime(0.28 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.09);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        case 'slash_heavy': {
          const osc = this.ctx.createOscillator();
          const sub = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

          sub.type = 'triangle';
          sub.frequency.setValueAtTime(180, now);
          sub.frequency.exponentialRampToValueAtTime(40, now + 0.18);

          gain.gain.setValueAtTime(0.45 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.18);

          osc.connect(gain);
          sub.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          sub.start(now);
          osc.stop(now + 0.18);
          sub.stop(now + 0.18);
          break;
        }

        case 'hit': {
          const osc = this.ctx.createOscillator();
          const noise = this.ctx.createBufferSource();
          const gain = this.ctx.createGain();

          // Noise burst for blade cutting flesh
          const bufferSize = this.ctx.sampleRate * 0.08;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
          }
          noise.buffer = buffer;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.14);

          gain.gain.setValueAtTime(0.55 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.14);

          osc.connect(gain);
          noise.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          noise.start(now);
          osc.stop(now + 0.14);
          noise.stop(now + 0.14);
          break;
        }

        case 'guard_clang': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'square';
          osc1.frequency.setValueAtTime(1240, now);
          osc1.frequency.exponentialRampToValueAtTime(600, now + 0.15);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1860, now);
          osc2.frequency.exponentialRampToValueAtTime(900, now + 0.2);

          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.2);
          osc2.stop(now + 0.2);
          break;
        }

        case 'zanshin_regular': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5

          gain.gain.setValueAtTime(0.35 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'zanshin_perfect': {
          // Shimmering harmonic chord for perfect Ki Pulse
          const freqs = [659.25, 987.77, 1318.5, 1975.5]; // E5, B5, E6, B6
          freqs.forEach((f, i) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.02);
            osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.4);

            gain.gain.setValueAtTime(0.25 * vol, now + i * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.02);
            osc.stop(now + 0.45);
          });
          break;
        }

        case 'grapple': {
          // Brutal two-stage execution impact
          const osc = this.ctx.createOscillator();
          const sub = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

          sub.type = 'sine';
          sub.frequency.setValueAtTime(110, now);
          sub.frequency.exponentialRampToValueAtTime(25, now + 0.4);

          gain.gain.setValueAtTime(0.7 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

          osc.connect(gain);
          sub.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          sub.start(now);
          osc.stop(now + 0.4);
          sub.stop(now + 0.4);
          break;
        }

        case 'winded': {
          // Gasps of exhaustion / posture broken bell
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'stance_switch': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

          gain.gain.setValueAtTime(0.18 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.08);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'living_weapon': {
          // Ethereal flame surge
          const osc = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(440, now);
          osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.6);

          gain.gain.setValueAtTime(0.55 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc2.start(now);
          osc.stop(now + 0.7);
          osc2.stop(now + 0.7);
          break;
        }

        case 'death_bell': {
          // Deep temple bell toll
          const freqs = [110, 220, 277.18, 329.63, 440];
          freqs.forEach((f, i) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime((0.45 / (i + 1)) * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 2.5);
          });
          break;
        }

        case 'victory_taiko': {
          // Celebratory taiko sequence
          [0, 0.16, 0.32, 0.45, 0.65].forEach((del, i) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + del;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 - i * 10, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

            gain.gain.setValueAtTime(0.5 * vol, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
          });
          break;
        }

        case 'dodge': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
          gain.gain.setValueAtTime(0.2 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        default:
          break;
      }
    } catch {
      // AudioContext could be restricted before user gesture
    }
  }
}

export const sound = new SoundEngine();
