/**
 * Realistic Underwater Web Audio Synthesizer
 * Generates natural hydrophone sub-bass ocean resonance, gentle filtered water swells,
 * soothing rhythmic bubbling, and interactive pop sound effects.
 */

export class UnderwaterAudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private bubbleInterval: number | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private subOsc1: OscillatorNode | null = null;
  private subOsc2: OscillatorNode | null = null;

  public init(): void {
    if (this.ctx) return;

    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain (louder, cinematic volume)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient sub-mix (lush, soothing ocean soundscape)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.setupDeepOceanRumble();
      this.setupWaterCurrentFilter();
      this.startAmbientBubbles();
      this.startWhaleSongLoop();
      this.startSnappingShrimpLoop();
    } catch (e) {
      console.warn('Web Audio API not supported or error initializing:', e);
    }
  }

  private setupDeepOceanRumble(): void {
    if (!this.ctx || !this.ambientGain) return;

    // Sub-bass ocean drone 1 (48Hz, deep calming ocean resonance)
    this.subOsc1 = this.ctx.createOscillator();
    this.subOsc1.type = 'sine';
    this.subOsc1.frequency.setValueAtTime(48, this.ctx.currentTime);

    const subGain1 = this.ctx.createGain();
    subGain1.gain.setValueAtTime(0.38, this.ctx.currentTime);

    // Deep sub-filter to ensure velvety, soothing low-end warmth
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(105, this.ctx.currentTime);
    subFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);

    this.subOsc1.connect(subGain1);
    subGain1.connect(subFilter);
    subFilter.connect(this.ambientGain);
    this.subOsc1.start();

    // Secondary warm harmonic (72Hz, adds depth and richness)
    this.subOsc2 = this.ctx.createOscillator();
    this.subOsc2.type = 'sine';
    this.subOsc2.frequency.setValueAtTime(72, this.ctx.currentTime);

    const subGain2 = this.ctx.createGain();
    subGain2.gain.setValueAtTime(0.24, this.ctx.currentTime);

    const subFilter2 = this.ctx.createBiquadFilter();
    subFilter2.type = 'lowpass';
    subFilter2.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.subOsc2.connect(subGain2);
    subGain2.connect(subFilter2);
    subFilter2.connect(this.ambientGain);
    this.subOsc2.start();

    // Gentle LFO modulating the sub pitch slightly to simulate slow oceanic breathing
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.06, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(2.2, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.subOsc1.frequency);
    lfo.start();
  }

  private setupWaterCurrentFilter(): void {
    if (!this.ctx || !this.ambientGain) return;

    // Generate 5-second seamless pink noise buffer for realistic ocean current swell
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Bandpass filter to simulate peaceful water whooshing past
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(240, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.4, this.ctx.currentTime);

    // Lowpass cutoff to remove any harsh hiss, leaving only soft tranquil water
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(520, this.ctx.currentTime);

    // LFO to slowly sweep the water current like gentle oceanic tides (0.08Hz = 12.5s tidal cycle)
    const filterLFO = this.ctx.createOscillator();
    filterLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const filterLFOGain = this.ctx.createGain();
    filterLFOGain.gain.setValueAtTime(130, this.ctx.currentTime);
    filterLFO.connect(filterLFOGain);
    filterLFOGain.connect(bandpass.frequency);
    filterLFO.start();

    // Louder, peaceful water swell gain
    const currentGain = this.ctx.createGain();
    currentGain.gain.setValueAtTime(0.48, this.ctx.currentTime);

    // Tidal breath volume modulation (slow soothing swells)
    const volumeLFO = this.ctx.createOscillator();
    volumeLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const volumeLFOGain = this.ctx.createGain();
    volumeLFOGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    volumeLFO.connect(volumeLFOGain);
    volumeLFOGain.connect(currentGain.gain);
    volumeLFO.start();

    this.noiseNode.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(currentGain);
    currentGain.connect(this.ambientGain);
    this.noiseNode.start();
  }

  private startAmbientBubbles(): void {
    const scheduleNextBubble = () => {
      if (!this.isMuted) {
        this.playBubbleChirp(0.04 + Math.random() * 0.06);
      }
      const nextDelay = 1800 + Math.random() * 3200;
      this.bubbleInterval = window.setTimeout(scheduleNextBubble, nextDelay);
    };

    this.bubbleInterval = window.setTimeout(scheduleNextBubble, 1500);
  }

  public playBubbleChirp(volume: number = 0.08, baseFreq: number = 320): void {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqStart = baseFreq + (Math.random() * 200 - 100);
      const freqEnd = freqStart * (1.6 + Math.random() * 0.4);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext state safety
    }
  }

  public playClickBubble(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Play dual bubble pops with slight delay for realistic splash/plume
    this.playBubbleChirp(0.12, 380);
    setTimeout(() => {
      this.playBubbleChirp(0.09, 520);
    }, 60);
    setTimeout(() => {
      this.playBubbleChirp(0.07, 440);
    }, 130);
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      } else {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0.0001, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.95, now + 1.2);
        // Play welcome water chime
        this.playBubbleChirp(0.18, 340);
      }
    }

    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startWhaleSongLoop(): void {
    const playWhaleGlissando = () => {
      if (!this.ctx || !this.ambientGain || this.isMuted) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const startFreq = 120 + Math.random() * 80;
        const midFreq = startFreq + (Math.random() * 120 - 40);
        const endFreq = 90 + Math.random() * 50;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(midFreq, now + 1.8);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 4.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.Q.setValueAtTime(2.5, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + 4.6);
      } catch {
        // audio context safety
      }

      // Schedule next rare whale call (every 20 - 40 seconds)
      const nextDelay = 20000 + Math.random() * 20000;
      setTimeout(playWhaleGlissando, nextDelay);
    };

    setTimeout(playWhaleGlissando, 6000);
  }

  private startSnappingShrimpLoop(): void {
    const scheduleShrimpClick = () => {
      if (!this.isMuted && this.ctx && this.ambientGain) {
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'square';
          osc.frequency.setValueAtTime(3200 + Math.random() * 2400, now);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(4500, now);
          filter.Q.setValueAtTime(4, now);

          gain.gain.setValueAtTime(0.015 + Math.random() * 0.015, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ambientGain);

          osc.start(now);
          osc.stop(now + 0.01);
        } catch {
          // ignore
        }
      }

      const nextDelay = 350 + Math.random() * 850;
      setTimeout(scheduleShrimpClick, nextDelay);
    };

    setTimeout(scheduleShrimpClick, 2000);
  }

  public playFeedPlop(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ambientGain || this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // safe
    }
  }

  public setAtmosphereMode(mode: 'day' | 'sunset' | 'deep'): void {
    if (!this.ctx || !this.ambientGain) return;

    const now = this.ctx.currentTime;
    if (mode === 'deep') {
      // Deeper, heavier sub resonance in deep ocean
      if (this.subOsc1) {
        this.subOsc1.frequency.cancelScheduledValues(now);
        this.subOsc1.frequency.exponentialRampToValueAtTime(42, now + 1.5);
      }
    } else if (mode === 'sunset') {
      if (this.subOsc1) {
        this.subOsc1.frequency.cancelScheduledValues(now);
        this.subOsc1.frequency.exponentialRampToValueAtTime(48, now + 1.5);
      }
    } else {
      // Day mode
      if (this.subOsc1) {
        this.subOsc1.frequency.cancelScheduledValues(now);
        this.subOsc1.frequency.exponentialRampToValueAtTime(54, now + 1.5);
      }
    }
  }

  public destroy(): void {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
      this.bubbleInterval = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Safe close
      }
      this.ctx = null;
    }
  }
}

export const underwaterAudio = new UnderwaterAudioSystem();
