
// Export audio utilities with enhanced sound profiles
export { getNoteFrequency, getWaveformType, makeDistortionCurve, createViolinOscillator, createEnvelope } from './audioUtils';
export { applyTechnique, applyReverb } from './audioTechniques';
export { addStringResonance, createBowedString } from './advancedTechniques';
export { 
  setupAudioContext, 
  loadSavedAudioSettings,
  stopCurrentNote,
  playNewNote
} from './noteManager';
export {
  playNoteSequence,
  clearPlayedNotes
} from './playbackHelper';
export {
  getViolinSoundProfile,
  applyProfileToAudioParams,
  getFrequencyResponse
} from './soundProfiles';

// Add event listener utilities for settings
export const setupAudioEventListeners = (audioContext?: AudioContext, masterGain?: GainNode) => {
  // Volume change handler
  const handleVolumeChange = (event: Event) => {
    if (masterGain && event instanceof CustomEvent) {
      const { volume } = event.detail;
      // Convert percentage to gain value (0 to 1)
      const gainValue = volume / 100;
      masterGain.gain.setValueAtTime(gainValue, (audioContext?.currentTime || 0));
    }
  };

  // EQ change handler
  const handleEqChange = (event: Event) => {
    if (event instanceof CustomEvent) {
      const { param, value } = event.detail;
      // Apply EQ settings based on parameter
      console.log(`EQ ${param} set to ${value}`);
    }
  };

  // Add event listeners
  document.addEventListener('violin-volume-changed', handleVolumeChange);
  document.addEventListener('violin-eq-changed', handleEqChange);

  // Return a cleanup function
  return () => {
    document.removeEventListener('violin-volume-changed', handleVolumeChange);
    document.removeEventListener('violin-eq-changed', handleEqChange);
  };
};
