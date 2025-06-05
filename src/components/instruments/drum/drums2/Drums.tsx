
import React, { useState, useEffect } from 'react';
import { useRoom } from '@/components/room/RoomContext';
import StandardInstrumentLayout from '@/components/instruments/common/StandardInstrumentLayout';
import { Button } from '@/components/ui/button';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

interface DrumPad {
  id: string;
  name: string;
  key: string;
  color: string;
  note: string;
}

const drumPads: DrumPad[] = [
  { id: 'kick', name: 'Kick', key: 'Q', color: 'bg-red-500', note: 'C2' },
  { id: 'snare', name: 'Snare', key: 'W', color: 'bg-blue-500', note: 'D2' },
  { id: 'hihat', name: 'Hi-Hat', key: 'E', color: 'bg-green-500', note: 'F#2' },
  { id: 'openhat', name: 'Open Hat', key: 'R', color: 'bg-yellow-500', note: 'A2' },
  { id: 'tom1', name: 'Tom 1', key: 'A', color: 'bg-purple-500', note: 'G2' },
  { id: 'tom2', name: 'Tom 2', key: 'S', color: 'bg-pink-500', note: 'E2' },
  { id: 'crash', name: 'Crash', key: 'D', color: 'bg-orange-500', note: 'B2' },
  { id: 'ride', name: 'Ride', key: 'F', color: 'bg-teal-500', note: 'C#3' },
];

const Drums2: React.FC = () => {
  const [volume, setVolume] = useState(0.7);
  const [reverb, setReverb] = useState(0.3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const { broadcastInstrumentNote } = useRoom();

  const handlePadPress = async (pad: DrumPad) => {
    if (activePads.has(pad.id)) return;
    
    setActivePads(prev => new Set(prev).add(pad.id));
    
    // Play local sound
    await playInstrumentNote('drum', pad.note, 2, 300, volume);
    
    // Broadcast to room
    broadcastInstrumentNote({
      note: pad.note,
      instrument: 'drum',
      userId: 'current-user',
      userName: 'User'
    });
    
    setTimeout(() => {
      setActivePads(prev => {
        const newSet = new Set(prev);
        newSet.delete(pad.id);
        return newSet;
      });
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pad = drumPads.find(p => p.key.toLowerCase() === e.key.toLowerCase());
      if (pad && !activePads.has(pad.id)) {
        handlePadPress(pad);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePads]);

  return (
    <StandardInstrumentLayout
      title="Drum Kit - Design 2"
      volume={volume}
      reverb={reverb}
      isFullscreen={isFullscreen}
      onVolumeChange={setVolume}
      onReverbChange={setReverb}
      onFullscreenToggle={setIsFullscreen}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {drumPads.map((pad) => (
          <Button
            key={pad.id}
            onClick={() => handlePadPress(pad)}
            className={`
              ${pad.color} hover:opacity-80 text-white font-bold py-8 px-4 rounded-lg
              transition-all duration-150 transform
              ${activePads.has(pad.id) ? 'scale-95 shadow-lg' : 'hover:scale-105'}
            `}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{pad.name}</div>
              <div className="text-sm opacity-75">{pad.key}</div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Press the corresponding keys or click the pads to play
      </div>
    </StandardInstrumentLayout>
  );
};

export default Drums2;
