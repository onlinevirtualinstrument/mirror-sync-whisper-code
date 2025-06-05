
// Main exports for the drum kit project
export { default as DrumKit } from '../components/DrumKit';
export { default as DrumPad } from '../components/DrumPad';
export { default as DrumPadGrid } from '../components/DrumPadGrid';
export { default as Controls } from '../components/Controls';
export { default as EffectsPanel } from '../components/EffectsPanel';
export { default as PatternSequencer } from '../components/PatternSequencer';
export { default as DrumCustomizer } from '../components/DrumCustomizer';

// Hooks
export { useAudioEngine } from '../hooks/useAudioEngine';
export { useCustomizations } from '../hooks/useDrumCustomizations';

// Data
export { drumKits } from '../data/drumKits';
export type { DrumKit as DrumKitType, DrumPad as DrumPadType } from '../data/drumKits';

// Utils
export * from '../utils/drumCustomizations';
