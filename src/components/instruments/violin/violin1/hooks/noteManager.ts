
import { ViolinType } from '../ViolinExperience';
import { createViolinOscillator, createEnvelope, getNoteFrequency } from './audioUtils';
import { applyTechnique, applyReverb } from './audioTechniques';
import { toast } from 'sonner';

export interface NotePlayOptions {
  duration?: number;
  technique?: string;
  dynamic?: number;
  sustainAfterRelease?: boolean; // Add option to keep note playing after key release
}

// Setup audio context and essential nodes
export const setupAudioContext = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create master gain
    const masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.7; // Starting at 70% volume
    masterGainNode.connect(audioContext.destination);
    
    // Create EQ bands
    const bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 220;
    bassFilter.gain.value = 0;
    
    const midFilter = audioContext.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 880;
    midFilter.Q.value = 0.5;
    midFilter.gain.value = 0;
    
    const trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 2200;
    trebleFilter.gain.value = 0;
    
    // Connect EQ bands
    masterGainNode.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(audioContext.destination);
    
    return {
      audioContext,
      masterGainNode,
      bassFilter,
      midFilter,
      trebleFilter
    };
  } catch (e) {
    console.error("Error setting up audio context:", e);
    toast.error("Could not initialize audio. Please try again or check your browser settings.");
    
    return {
      audioContext: null,
      masterGainNode: null,
      bassFilter: null,
      midFilter: null,
      trebleFilter: null
    };
  }
};

// Load saved audio settings from local storage
export const loadSavedAudioSettings = (
  masterGainNode?: GainNode,
  bassFilter?: BiquadFilterNode,
  midFilter?: BiquadFilterNode,
  trebleFilter?: BiquadFilterNode
) => {
  try {
    const savedSettings = localStorage.getItem('violin-audio-settings');
    
    if (savedSettings && masterGainNode && bassFilter && midFilter && trebleFilter) {
      const settings = JSON.parse(savedSettings);
      
      if (settings.volume) masterGainNode.gain.value = settings.volume;
      if (settings.bass) bassFilter.gain.value = settings.bass;
      if (settings.mid) midFilter.gain.value = settings.mid;
      if (settings.treble) trebleFilter.gain.value = settings.treble;
      
      console.log("Loaded audio settings:", settings);
    }
  } catch (e) {
    console.error("Error loading audio settings:", e);
  }
};

// Stop currently playing note with gradual release for realistic sound
export const stopCurrentNote = (
  audioContext: AudioContext,
  gainNode: GainNode | null,
  oscillator: OscillatorNode | null,
  stopReverbEffect: (() => void) | null,
  reverbNodes: AudioNode[],
  clearTimeout: () => void
) => {
  // Reset the timeout
  clearTimeout();
  
  // If there's no audio context, nothing to do
  if (!audioContext) return;
  
  // If there's a gain node, apply a natural release curve
  if (gainNode) {
    try {
      // Cancel any scheduled changes
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      
      // Set current value
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      
      // More gradual fade out (800ms) for realistic violin sound
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
    } catch (e) {
      console.error("Error stopping gain node:", e);
      // Fallback: set gain to 0 immediately
      gainNode.gain.value = 0;
    }
  }
  
  // If there's an oscillator, stop it after the gain fade
  if (oscillator) {
    try {
      setTimeout(() => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.error("Error stopping oscillator:", e);
        }
      }, 850); // Longer release to complete for natural violin sound
    } catch (e) {
      console.error("Error scheduling oscillator stop:", e);
    }
  }
  
  // Stop any reverb effect
  if (stopReverbEffect) {
    try {
      stopReverbEffect();
    } catch (e) {
      console.error("Error stopping reverb effect:", e);
    }
  }
  
  // Cleanup reverb nodes after fadeout
  if (reverbNodes.length > 0) {
    setTimeout(() => {
      reverbNodes.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          console.error("Error disconnecting reverb node:", e);
        }
      });
    }, 850); // Longer timeout to allow full reverb tail
  }
};

// Play a new note with all optimized settings
export const playNewNote = (
  audioContext: AudioContext,
  masterGainNode: GainNode,
  violinType: ViolinType,
  vibratoAmount: number,
  noteName: string,
  options: NotePlayOptions,
  reverbAmount: number,
  setOscillator: (osc: OscillatorNode) => void,
  setGainNode: (gain: GainNode) => void,
  setReverbNodes: (nodes: AudioNode[]) => void,
  setStopReverbEffect: (fn: () => void) => void,
  setNoteTimeout: (timeoutId: number) => void,
  stopNote: () => void
) => {
  try {
    // Get note frequency
    const frequency = getNoteFrequency(noteName);
    
    // Create oscillator with harmonics based on violin type
    const [oscillator, gainNode] = createViolinOscillator(audioContext, frequency, violinType);
    
    // Set the created nodes to state
    setOscillator(oscillator);
    setGainNode(gainNode);
    
    // Apply technique based on options
    const technique = options.technique || 'normal';
    const dynamic = options.dynamic || 85; // Increased for more presence
    
    // Process with playing technique
    const outputNode = applyTechnique(
      audioContext,
      oscillator,
      gainNode,
      technique,
      dynamic,
      frequency,
      violinType,
      vibratoAmount
    );
    
    // Apply reverb based on settings
    const { nodes, stopEffect } = applyReverb(
      audioContext,
      outputNode,
      violinType,
      reverbAmount
    );
    
    setReverbNodes(nodes);
    setStopReverbEffect(stopEffect);
    
    // Connect output to master gain and start oscillator
    outputNode.connect(masterGainNode);
    oscillator.start();
    
    // For real violin sound, use longer durations
    let noteDuration = options.duration || 0;
    
    // If no specific duration and we want to sustain after release (natural violin behavior)
    if (noteDuration === 0 && options.sustainAfterRelease !== false) {
      // Use a much longer default duration for held notes (9 seconds)
      noteDuration = 9000; // Extended to ensure notes don't cut off too quickly
    }
    
    // Create and apply envelope with natural attack and release
    const envelope = createEnvelope(
      audioContext,
      gainNode,
      violinType,
      noteDuration
    );
    
    // If a duration is specified or we're using the default sustain, schedule note end
    if (noteDuration > 0) {
      // Clear any previous timeout
      const timeoutId = window.setTimeout(() => {
        stopNote();
      }, noteDuration + 500); // Add extra time for the release
      
      setNoteTimeout(timeoutId);
    }
  } catch (e) {
    console.error("Error playing note:", e);
    toast.error("Error playing note. Please try again.");
  }
};
