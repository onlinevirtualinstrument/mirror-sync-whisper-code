
// Real-time audio streaming utilities for music room collaboration
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;
let delayNode: DelayNode | null = null;
let compressorNode: DynamicsCompressorNode | null = null;
let activeNotes: Map<string, { oscillator: OscillatorNode; gainNode: GainNode; userId: string }> = new Map();

export const initializeRealtimeAudio = async (): Promise<AudioContext> => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create audio processing chain
    gainNode = audioContext.createGain();
    compressorNode = audioContext.createDynamicsCompressor();
    reverbNode = audioContext.createConvolver();
    delayNode = audioContext.createDelay(1);
    
    // Configure compressor for better mixing
    compressorNode.threshold.setValueAtTime(-20, audioContext.currentTime);
    compressorNode.knee.setValueAtTime(30, audioContext.currentTime);
    compressorNode.ratio.setValueAtTime(4, audioContext.currentTime);
    compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);
    
    // Create reverb impulse response
    const impulseResponse = createImpulseResponse(audioContext, 2, 2, false);
    reverbNode.buffer = impulseResponse;
    
    // Configure delay for synchronization
    delayNode.delayTime.setValueAtTime(0.02, audioContext.currentTime);
    
    // Chain audio nodes: gain -> compressor -> delay -> reverb -> destination
    gainNode.connect(compressorNode);
    compressorNode.connect(delayNode);
    delayNode.connect(reverbNode);
    reverbNode.connect(audioContext.destination);
    
    // Set initial volume
    gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
  }
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  return audioContext;
};

const createImpulseResponse = (context: AudioContext, duration: number, decay: number, reverse: boolean): AudioBuffer => {
  const length = context.sampleRate * duration;
  const impulse = context.createBuffer(2, length, context.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
  }
  
  return impulse;
};

export const playRealtimeNote = async (
  noteId: string,
  frequency: number,
  instrument: string,
  userId: string,
  volume: number = 0.3,
  duration: number = 500
): Promise<void> => {
  try {
    const context = await initializeRealtimeAudio();
    if (!context || !gainNode) return;

    // Stop existing note with same ID to prevent overlap
    stopRealtimeNote(noteId);

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    const panNode = context.createStereoPanner();
    const filterNode = context.createBiquadFilter();
    
    // Set waveform and frequency based on instrument
    oscillator.type = getWaveformForInstrument(instrument);
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
    // Configure filter based on instrument
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(getFilterFrequency(instrument), context.currentTime);
    filterNode.Q.setValueAtTime(1, context.currentTime);
    
    // Spatial positioning based on userId for better separation
    const userHash = hashUserId(userId);
    panNode.pan.setValueAtTime(userHash, context.currentTime);
    
    // Dynamic volume based on number of active notes to prevent clipping
    const activeCount = activeNotes.size;
    const dynamicVolume = volume * Math.max(0.3, 1 / Math.sqrt(activeCount + 1));
    
    // Volume envelope for smooth attack/release
    noteGain.gain.setValueAtTime(0, context.currentTime);
    noteGain.gain.linearRampToValueAtTime(dynamicVolume, context.currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);
    
    // Connect nodes: oscillator -> filter -> noteGain -> pan -> main gain chain
    oscillator.connect(filterNode);
    filterNode.connect(noteGain);
    noteGain.connect(panNode);
    panNode.connect(gainNode);
    
    // Store active note
    activeNotes.set(noteId, { oscillator, gainNode: noteGain, userId });
    
    // Start and schedule stop
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
    
    // Cleanup after note ends
    setTimeout(() => {
      activeNotes.delete(noteId);
    }, duration);
    
  } catch (error) {
    console.error('Error playing realtime note:', error);
  }
};

export const stopRealtimeNote = (noteId: string): void => {
  const activeNote = activeNotes.get(noteId);
  if (activeNote) {
    try {
      activeNote.oscillator.stop();
      activeNote.gainNode.disconnect();
      activeNotes.delete(noteId);
    } catch (error) {
      // Note already stopped
    }
  }
};

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
    'veena': 'triangle',
    'drum': 'square',
    'drummachine': 'square'
  };
  
  return waveforms[instrument.toLowerCase()] || 'sine';
};

const getFilterFrequency = (instrument: string): number => {
  const frequencies: Record<string, number> = {
    'piano': 8000,
    'guitar': 6000,
    'violin': 10000,
    'flute': 12000,
    'saxophone': 5000,
    'trumpet': 7000,
    'drums': 4000,
    'xylophone': 15000,
    'kalimba': 8000,
    'marimba': 6000,
    'sitar': 5000,
    'veena': 6000,
    'drum': 4000,
    'drummachine': 4000
  };
  
  return frequencies[instrument.toLowerCase()] || 8000;
};

const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.max(-0.8, Math.min(0.8, hash / 1000000000));
};

export const setMasterVolume = (volume: number): void => {
  if (gainNode) {
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext?.currentTime || 0);
  }
};

export const stopAllRealtimeNotes = (): void => {
  activeNotes.forEach((note, noteId) => {
    stopRealtimeNote(noteId);
  });
  activeNotes.clear();
};

export const getActiveNotesCount = (): number => {
  return activeNotes.size;
};
