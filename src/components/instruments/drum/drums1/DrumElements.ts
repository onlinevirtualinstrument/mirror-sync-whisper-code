
// Definition of drum elements and their properties

export interface DrumElement {
  id: string;
  key: string;
  label: string;
  position: {
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
  };
  sound: string;
}

export const commonDrumElements: DrumElement[] = [
  { id: 'kick', key: 'X', label: 'Kick', position: { top: '50%', left: '50%' }, sound: 'kick' },
  { id: 'snare', key: 'S', label: 'Snare', position: { top: '38%', left: '26%' }, sound: 'snare' },
  { id: 'hihat', key: 'H', label: 'Hi-Hat', position: { top: '20%', left: '75%' }, sound: 'hihat' },
  { id: 'tom1', key: 'G', label: 'Tom 1', position: { top: '25%', left: '42%' }, sound: 'tom1' },
  { id: 'tom2', key: 'J', label: 'Tom 2', position: { top: '35%', left: '80%' }, sound: 'tom2' },
  { id: 'crash', key: 'Y', label: 'Crash', position: { top: '15%', left: '40%' }, sound: 'crash' },
  { id: 'ride', key: 'U', label: 'Ride', position: { top: '18%', left: '78%' }, sound: 'ride' },
  { id: 'floor', key: 'D', label: 'Floor Tom', position: { bottom: '20%', left: '30%' }, sound: 'floor' },
  { id: 'pedal', key: 'C', label: 'Pedal', position: { bottom: '20%', left: '30%' }, sound: 'pedal' },
];
