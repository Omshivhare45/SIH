// Web Audio API Synthesizer for Authentic Indian Railway Sound Effects & Voice Announcer

class RailAudioSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play classic Indian Railway 3-tone attention chime (Ding-Dong-Ding)
  public playIRChime(): Promise<void> {
    if (!this.soundEnabled || typeof window === 'undefined') return Promise.resolve();
    this.initCtx();
    if (!this.ctx) return Promise.resolve();

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Frequencies for iconic chime: High C5 -> G4 -> E5
    const notes = [
      { freq: 523.25, time: now + 0.0, dur: 0.45 },
      { freq: 392.00, time: now + 0.45, dur: 0.45 },
      { freq: 659.25, time: now + 0.90, dur: 0.70 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.time);

      gain.gain.setValueAtTime(0.001, note.time);
      gain.gain.exponentialRampToValueAtTime(0.25, note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(note.time);
      osc.stop(note.time + note.dur + 0.1);
    });

    return new Promise((res) => setTimeout(res, 1650));
  }

  // Play train horn sound (WAP-7 dual pneumatic tone)
  public playTrainHorn() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const freqs = [311.13, 370.00, 466.16]; // Eb4 chord for locomotive horn

    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    });
  }

  // Speak live station announcement like real Indian Railways PR
  public async speakAnnouncement(trainNumber: string, trainName: string, stationName: string, platform: number | string) {
    if (typeof window === 'undefined') return;

    await this.playIRChime();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Attention please! Train number ${trainNumber.split('').join(' ')}, ${trainName}, is arriving shortly on platform number ${platform}. Wish you a safe journey.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
}

export const railAudio = new RailAudioSystem();
