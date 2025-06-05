
// Enhanced instrument audio utilities with real-time sync support
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  return audioContext;
};

// Play instrument note with proper audio synthesis
export const playInstrumentNote = async (
  instrument: string, 
  note: string, 
  octave: number = 4, 
  duration: number = 500,
  volume: number = 0.7,
  effects?: any
): Promise<void> => {
  try {
    const ctx = initAudioContext();
    if (!ctx || !gainNode) return;

    // Resume audio context if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const frequency = getFrequency(note, octave);
    if (!frequency) return;

    // Create oscillator for the note
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    
    // Apply instrument-specific waveform
    oscillator.type = getWaveformForInstrument(instrument);
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Connect audio nodes
    oscillator.connect(envelope);
    envelope.connect(gainNode);

    // Apply volume
    envelope.gain.setValueAtTime(0, ctx.currentTime);
    envelope.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    // Start and stop the oscillator
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);

    // Cleanup
    setTimeout(() => {
      try {
        oscillator.disconnect();
        envelope.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }, duration);

  } catch (error) {
    console.error('Error playing instrument note:', error);
  }
};

// Get frequency for musical note
const getFrequency = (note: string, octave: number): number | null => {
  const noteFrequencies: Record<string, number> = {
    'C': 261.63,
    'C#': 277.18, 'Db': 277.18,
    'D': 293.66,
    'D#': 311.13, 'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99, 'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30, 'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
  };

  const baseFreq = noteFrequencies[note.toUpperCase()];
  if (!baseFreq) return null;

  // Adjust for octave (4 is the base octave)
  return baseFreq * Math.pow(2, octave - 4);
};

// Get appropriate waveform for each instrument
const getWaveformForInstrument = (instrument: string): OscillatorType => {
  const waveforms: Record<string, OscillatorType> = {
    'piano': 'sine',
    'guitar': 'sawtooth',
    'violin': 'triangle',
    'flute': 'sine',
    'saxophone': 'square',
    'trumpet': 'sawtooth',
    'drums': 'square',
    'xylophone': 'sine',
    'kalimba': 'sine',
    'marimba': 'triangle',
    'sitar': 'sawtooth',
    'veena': 'triangle'
  };

  return waveforms[instrument.toLowerCase()] || 'sine';
};
