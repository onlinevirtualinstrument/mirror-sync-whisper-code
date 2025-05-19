
/**
 * Handles ADSR envelope generation for guitar sounds
 */
import { GuitarVariant } from '../GuitarVariants';

export interface EnvelopeConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export const applyEnvelope = (
  audioContext: AudioContext,
  gainNode: GainNode,
  volume: number,
  variant: GuitarVariant
): number => {
  const soundProfile = variant.soundProfile;
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume, 
    audioContext.currentTime + soundProfile.attack
  );
  gainNode.gain.exponentialRampToValueAtTime(
    volume * soundProfile.sustain, 
    audioContext.currentTime + soundProfile.attack + soundProfile.decay
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001, 
    audioContext.currentTime + soundProfile.attack + soundProfile.decay + soundProfile.release
  );
  
  // Return total duration for scheduling stop
  return soundProfile.attack + soundProfile.decay + soundProfile.release;
};

export const applyReleaseEnvelope = (
  audioContext: AudioContext,
  gainNode: GainNode,
  volume: number
): void => {
  gainNode.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
};
