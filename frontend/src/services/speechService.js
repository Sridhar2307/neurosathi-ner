/**
 * Speech & Audio Synthesizer Service
 * Implements Web Speech API (TTS & STT) and Web Audio API tone synthesis.
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    this.recognitionInstance = null;
    this.isListening = false;
    this.audioCtx = null;
    this.cachedVoices = [];

    if (this.synth) {
      this.cachedVoices = this.synth.getVoices() || [];
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => {
          this.cachedVoices = this.synth.getVoices() || [];
        };
      }
    }
  }

  // Find best available voice for language with graceful Indic/regional fallback
  findBestVoice(voices, langCode = 'en-IN') {
    if (!voices || voices.length === 0) return null;

    const base = (langCode || 'en').split('-')[0].toLowerCase();

    // Priority fallbacks:
    // - Manipuri (mni): Bengali script / Indic -> bn-IN, hi-IN, en-IN
    // - Mizo (lus): Romanized script -> en-IN, en-GB, en-US
    // - Assamese (as): Bengali/Assamese script -> bn-IN, hi-IN, en-IN
    const priorityMap = {
      mni: ['mni-IN', 'mni', 'bn-IN', 'hi-IN', 'en-IN'],
      lus: ['lus-IN', 'lus', 'en-IN', 'en-GB', 'en-US'],
      as: ['as-IN', 'as', 'bn-IN', 'hi-IN', 'en-IN'],
      bn: ['bn-IN', 'bn-BD', 'bn', 'hi-IN', 'en-IN'],
      hi: ['hi-IN', 'hi', 'en-IN'],
      en: ['en-IN', 'en-GB', 'en-US', 'en']
    };

    const searchTargets = priorityMap[base] || [langCode, 'en-IN', 'en'];

    for (const target of searchTargets) {
      const targetLower = target.toLowerCase();
      const match = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase();
        return vLang === targetLower || vLang.startsWith(targetLower);
      });
      if (match) return match;
    }

    return voices[0] || null;
  }

  // --- Text to Speech (TTS) ---
  speak(text, options = {}) {
    if (!this.synth || !text) return;

    try {
      // Cancel any ongoing speech to avoid queue pileup
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.85; // Slightly slower, calm cadence for elderly users
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Select natural voice with regional fallback
      const availableVoices = (this.cachedVoices && this.cachedVoices.length > 0)
        ? this.cachedVoices
        : (this.synth.getVoices() || []);
      if ((!this.cachedVoices || this.cachedVoices.length === 0) && availableVoices.length > 0) {
        this.cachedVoices = availableVoices;
      }

      const langMap = {
        hi: 'hi-IN',
        bn: 'bn-IN',
        as: 'as-IN',
        mni: 'bn-IN',
        lus: 'en-IN',
        en: 'en-IN'
      };
      const baseCode = (options.lang || 'en').split('-')[0].toLowerCase();
      const targetLang = langMap[baseCode] || options.lang || 'en-IN';

      const matchedVoice = this.findBestVoice(availableVoices, options.lang || targetLang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        // Setting utterance.lang to the matched voice's supported language prevents 'language-unavailable' crash
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = targetLang;
      }

      if (options.onEnd) {
        utterance.onend = options.onEnd;
      }
      if (options.onError) {
        utterance.onerror = (e) => {
          // If language-unavailable occurred, retry once with standard default voice
          if (e.error === 'language-unavailable' && utterance.lang !== 'en-IN') {
            try {
              const fallback = new SpeechSynthesisUtterance(text);
              fallback.lang = 'en-IN';
              fallback.rate = 0.85;
              this.synth.speak(fallback);
            } catch (err) {}
          }
          options.onError(e);
        };
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // --- Speech to Text (STT) ---
  isSTTAvailable() {
    return Boolean(this.SpeechRecognition);
  }

  startListening({ onResult, onError, onEnd, lang = 'en-IN' }) {
    if (!this.SpeechRecognition) {
      if (onError) onError(new Error("Speech recognition is not supported in this browser. Please use quick buttons below."));
      return;
    }

    try {
      if (this.recognitionInstance) {
        try { this.recognitionInstance.abort(); } catch (e) {}
      }

      let sttLang = lang || 'en-IN';
      if (sttLang === 'as') sttLang = 'bn-IN';
      else if (sttLang === 'mni') sttLang = 'bn-IN';
      else if (sttLang === 'lus') sttLang = 'en-IN';
      else if (sttLang === 'bn') sttLang = 'bn-IN';
      else if (sttLang === 'hi') sttLang = 'hi-IN';
      else if (sttLang === 'en') sttLang = 'en-IN';

      this.recognitionInstance = new this.SpeechRecognition();
      this.recognitionInstance.lang = sttLang;
      this.recognitionInstance.interimResults = false;
      this.recognitionInstance.maxAlternatives = 1;

      this.recognitionInstance.onstart = () => {
        this.isListening = true;
      };

      this.recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      };

      this.recognitionInstance.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognitionInstance.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognitionInstance.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  // --- Web Audio Synthesizer (for chimes, gentle game tones) ---
  playTone(frequency = 440, type = 'sine', duration = 0.3) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Tone Error:", e);
    }
  }

  playSuccessChime() {
    this.playTone(523.25, 'triangle', 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15), 120); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.3), 240); // G5
  }

  playCardFlipSound() {
    this.playTone(380, 'sine', 0.08);
  }

  playErrorSound() {
    this.playTone(220, 'sawtooth', 0.2);
  }

  /**
   * High-Alert Alarm Sound for Elderly Reminders
   * Emits an urgent, high-visibility dual-frequency alarm chime (880Hz & 1046.5Hz)
   * designed specifically for elderly audibility across ambient noise.
   */
  playHighAlertSound(repeats = 3) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      for (let i = 0; i < repeats; i++) {
        const startOffset = i * 0.42;

        // Tone 1: 880 Hz (A5)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, this.audioCtx.currentTime + startOffset);
        gain1.gain.setValueAtTime(0.75, this.audioCtx.currentTime + startOffset);
        gain1.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + startOffset + 0.18);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(this.audioCtx.currentTime + startOffset);
        osc1.stop(this.audioCtx.currentTime + startOffset + 0.18);

        // Tone 2: 1046.5 Hz (C6 high alert chime)
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.5, this.audioCtx.currentTime + startOffset + 0.18);
        gain2.gain.setValueAtTime(0.8, this.audioCtx.currentTime + startOffset + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + startOffset + 0.38);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(this.audioCtx.currentTime + startOffset + 0.18);
        osc2.stop(this.audioCtx.currentTime + startOffset + 0.38);
      }
    } catch (e) {
      console.warn("High Alert Sound Error:", e);
    }
  }
}

export const speechService = new SpeechService();
