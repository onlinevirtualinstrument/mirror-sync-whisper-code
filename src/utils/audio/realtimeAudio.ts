
// Real-time audio streaming utilities for music room collaboration
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;
let delayNode: DelayNode | null = null;
let activeNotes: Map<string, { oscillator: OscillatorNode; gainNode: GainNode; userId: string }> = new Map();

export const initializeRealtimeAudio = async (): Promise<AudioContext> => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNode = audioContext.createGain();
    
    // Create reverb for spatial audio effect
    reverbNode = audioContext.createConvolver();
    const impulseResponse = createImpulseResponse(audioContext, 2, 2, false);
    reverbNode.buffer = impulseResponse;
    
    // Create delay for timing synchronization
    delayNode = audioContext.createDelay(1);
    delayNode.delayTime.setValueAtTime(0.02, audioContext.currentTime); // 20ms delay for sync
    
    // Chain audio nodes
    gainNode.connect(delayNode);
    delayNode.connect(reverbNode);
    reverbNode.connect(audioContext.destination);
    
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
    
    // Set waveform based on instrument
    oscillator.type = getWaveformForInstrument(instrument);
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
    // Spatial positioning based on userId (simple hash-based panning)
    const userHash = hashUserId(userId);
    panNode.pan.setValueAtTime(userHash, context.currentTime);
    
    // Volume envelope for smooth attack/release
    noteGain.gain.setValueAtTime(0, context.currentTime);
    noteGain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);
    
    // Connect nodes
    oscillator.connect(noteGain);
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

const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.max(-1, Math.min(1, hash / 1000000000)); // Normalize to -1 to 1 range
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
