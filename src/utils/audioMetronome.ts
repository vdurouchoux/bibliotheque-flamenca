/**
 * Web Audio API Flamenco Metronome Engine
 * Synthesizes authentic flamenco sounds:
 * - Cajon + Palmas (Full rhythm section combo)
 * - Cajon (Deep bass box + sharp snare corner slap)
 * - Palmas (Palma Sorda cupped + Palma Seca sharp slap)
 * - Golpe (wood tap on guitar soundboard)
 * - Woodblock (classical click)
 */

export type SoundType = 'cajon_palmas' | 'cajon' | 'palmas' | 'golpe' | 'woodblock';

class FlamencoAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private tempo: number = 120; // BPM
  private beats: number = 12; // 12 or 4
  private accents: number[] = [12, 3, 6, 8, 10];
  private currentBeat: number = 1;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private soundType: SoundType = 'cajon_palmas';
  private volume: number = 0.85;
  private onBeatCallback: ((beat: number, isAccent: boolean) => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundType(type: SoundType) {
    this.soundType = type;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setPattern(beats: number, accents: number[], tempo: number) {
    this.beats = beats > 0 ? beats : 12;
    this.accents = accents;
    this.tempo = Math.max(40, Math.min(300, tempo));
  }

  public setTempo(bpm: number) {
    this.tempo = Math.max(40, Math.min(300, bpm));
  }

  public setOnBeat(cb: ((beat: number, isAccent: boolean) => void) | null) {
    this.onBeatCallback = cb;
  }

  public start(startBeat: number = 1) {
    if (this.isRunning) return;
    this.initContext();
    this.isRunning = true;
    this.currentBeat = startBeat;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }
    this.scheduleLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private scheduleLoop = () => {
    if (!this.isRunning || !this.ctx) return;

    // Lookahead: schedule sounds up to 0.1s in advance
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleBeat(this.currentBeat, this.nextNoteTime);
      this.advanceBeat();
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 25);
  };

  private advanceBeat() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat % this.beats) + 1;
  }

  private scheduleBeat(beat: number, time: number) {
    const isAccent = this.accents.includes(beat);

    // Trigger visual callback at the scheduled audio time
    if (this.onBeatCallback && this.ctx) {
      const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.isRunning) {
          this.onBeatCallback?.(beat, isAccent);
        }
      }, delay);
    }

    // Synthesize audio
    this.playFlamencoSound(time, isAccent);
  }

  private playFlamencoSound(time: number, isAccent: boolean) {
    if (!this.ctx) return;

    switch (this.soundType) {
      case 'cajon_palmas':
        // Full flamenco ensemble: Cajon box and handclaps together
        if (isAccent) {
          this.playCajonSlap(time, true);
          this.playPalmaSeca(time + 0.002);
        } else {
          this.playCajonBass(time, false);
          this.playPalmaSorda(time + 0.002);
        }
        break;

      case 'cajon':
        // Cajon alone: deep bass on normal beats, sharp slap on accents
        if (isAccent) {
          this.playCajonSlap(time, true);
        } else {
          this.playCajonBass(time, false);
        }
        break;

      case 'palmas':
        // Palmas alone: Palma sorda on normal beats, Palma seca on accents
        if (isAccent) {
          this.playPalmaSeca(time);
        } else {
          this.playPalmaSorda(time);
        }
        break;

      case 'golpe':
        this.playGolpeSound(time, isAccent);
        break;

      case 'woodblock':
      default:
        this.playWoodblock(time, isAccent);
        break;
    }
  }

  // Cajon Bass (centre de la tapa - grave profond et chaud)
  private playCajonBass(time: number, isAccent: boolean) {
    if (!this.ctx) return;

    // Body tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 105 : 92, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, time);

    const amp = this.volume * (isAccent ? 1.0 : 0.85);
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.14);

    // Initial woody thump tap
    const tapOsc = this.ctx.createOscillator();
    const tapGain = this.ctx.createGain();
    tapOsc.type = 'triangle';
    tapOsc.frequency.setValueAtTime(260, time);
    tapOsc.frequency.exponentialRampToValueAtTime(80, time + 0.03);

    tapGain.gain.setValueAtTime(this.volume * 0.4, time);
    tapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    tapOsc.connect(tapGain);
    tapGain.connect(this.ctx.destination);

    tapOsc.start(time);
    tapOsc.stop(time + 0.035);
  }

  // Cajon Slap (angle haut de la tapa - claque aiguë et timbre de cordes)
  private playCajonSlap(time: number, isAccent: boolean) {
    if (!this.ctx) return;

    // Sharp corner wood pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, time);
    osc.frequency.exponentialRampToValueAtTime(190, time + 0.04);

    const amp = this.volume * (isAccent ? 1.0 : 0.7);
    oscGain.gain.setValueAtTime(amp, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);

    // Cajon snare strings buzz (timbre métallique)
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // High bandpass for guitar snare rattle
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.Q.setValueAtTime(2.0, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * (isAccent ? 0.75 : 0.45), time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.052);
  }

  // Palma Sorda (hands cupped, low warm thump)
  private playPalmaSorda(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);

    const amp = this.volume * 0.7;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  // Palma Seca (hands open/flat, sharp flamenco slap)
  private playPalmaSeca(time: number) {
    if (!this.ctx) return;

    // Pop oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, time);
    osc.frequency.exponentialRampToValueAtTime(160, time + 0.06);

    const amp = this.volume * 0.95;
    oscGain.gain.setValueAtTime(amp, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    // Slap noise burst
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(2, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.6, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.06);
    noise.start(time);
    noise.stop(time + 0.045);
  }

  // Golpe tap on the guitar top (wood sound)
  private playGolpeSound(time: number, isAccent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const startFreq = isAccent ? 420 : 310;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);

    const amp = (isAccent ? 1.0 : 0.6) * this.volume;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.055);
  }

  // Clean click/woodblock
  private playWoodblock(time: number, isAccent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);

    const amp = (isAccent ? 0.9 : 0.5) * this.volume;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.035);
  }
}

export const flamencoMetronome = new FlamencoAudioEngine();
