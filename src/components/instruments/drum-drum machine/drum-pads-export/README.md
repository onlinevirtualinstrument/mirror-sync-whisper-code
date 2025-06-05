
# Drum Pads Export

This folder contains all the components, hooks, and utilities needed for the drum pads functionality.

## Components
- `DrumPad` - Individual drum pad component
- `DrumPadGrid` - Grid layout for drum pads
- `DrumKitHeader` - Header with kit selection
- `Controls` - Layout grid controls
- `EffectsPanel` - EQ controls

## Hooks
- `useAudioEngine` - Main audio engine hook
- `useAudioEffects` - Audio effects management
- `useAudioContext` - Audio context management
- `useDrumSoundMapping` - Drum sound mapping

## Usage
```tsx
import { DrumPadGrid, useAudioEngine } from './drum-pads-export';

const MyDrumPads = () => {
  const audioEngine = useAudioEngine();
  
  return (
    <DrumPadGrid 
      pads={pads}
      gridLayout="3x3"
      effects={audioEngine.effects}
      onPlay={audioEngine.playWithEffects}
    />
  );
};
```
