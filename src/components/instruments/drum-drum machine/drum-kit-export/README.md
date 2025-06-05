
# Drum Kit Component Library

A complete, customizable drum kit component built with React, TypeScript, and Tailwind CSS.

## Features

- **Multiple Drum Kits**: Classic, Electronic, Hip-Hop, Jazz, Metal, and African percussion
- **Real-time Audio Effects**: Reverb, delay, distortion, and EQ
- **Pattern Sequencer**: Create and play drum patterns
- **Customizable Drum Pads**: Colors, names, and sizes
- **Responsive Grid Layouts**: 2x2, 3x3, and 4x4 configurations
- **Keyboard Support**: Play drums with keyboard keys
- **Volume and Speed Controls**: Adjust playback settings
- **Loading States**: Smooth loading experience

## Quick Start

```tsx
import { DrumKit } from './drum-kit-export';

function App() {
  return <DrumKit />;
}
```

## Components

- `DrumKit` - Main drum kit component
- `DrumPad` - Individual drum pad
- `Controls` - Volume, speed, and layout controls
- `EffectsPanel` - Audio effects controls
- `PatternSequencer` - Create drum patterns

## Dependencies Required

- React 18+
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons
- React Colorful (for customization)

## Audio Files

The component expects audio files to be available at the URLs specified in the drum kit data files. Update the `soundSrc` properties in the kit files to point to your audio assets.
