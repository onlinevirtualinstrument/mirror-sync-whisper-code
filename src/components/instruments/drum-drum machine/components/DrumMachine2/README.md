
# Pattern Sequencer Export

This folder contains all the components, hooks, and utilities needed for the pattern sequencer functionality.

## Components
- `PatternSequencer` - Main pattern sequencer component
- `EffectsPanel` - EQ controls for audio effects

## Hooks
- `useAudioEngine` - Main audio engine hook
- `useAudioEffects` - Audio effects management

## Usage
```tsx
import { PatternSequencer, useAudioEngine } from './pattern-sequencer-export';

const MySequencer = () => {
  const audioEngine = useAudioEngine();
  
  return (
    <PatternSequencer
      selectedKit="classic"
      onPlayPattern={audioEngine.playWithEffects}
    />
  );
};
```
