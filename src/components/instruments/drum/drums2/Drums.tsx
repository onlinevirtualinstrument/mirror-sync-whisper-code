
import React, { useState, useEffect } from 'react';
import { useRoom } from '@/components/room/RoomContext';
import StandardInstrumentLayout from '@/components/instruments/common/StandardInstrumentLayout';
import { Button } from '@/components/ui/button';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';
import { playRealtimeNote } from '@/utils/audio/realtimeAudio';

interface DrumPad {
  id: string;
  name: string;
  key: string;
  color: string;
  note: string;
  frequency: number;
}

const drumPads: DrumPad[] = [
  { id: 'kick', name: 'Kick', key: 'Q', color: 'bg-red-500', note: 'C2', frequency: 65.41 },
  { id: 'snare', name: 'Snare', key: 'W', color: 'bg-blue-500', note: 'D2', frequency: 73.42 },
  { id: 'hihat', name: 'Hi-Hat', key: 'E', color: 'bg-green-500', note: 'F#2', frequency: 92.50 },
  { id: 'openhat', name: 'Open Hat', key: 'R', color: 'bg-yellow-500', note: 'A2', frequency: 110.00 },
  { id: 'tom1', name: 'Tom 1', key: 'A', color: 'bg-purple-500', note: 'G2', frequency: 98.00 },
  { id: 'tom2', name: 'Tom 2', key: 'S', color: 'bg-pink-500', note: 'E2', frequency: 82.41 },
  { id: 'crash', name: 'Crash', key: 'D', color: 'bg-orange-500', note: 'B2', frequency: 123.47 },
  { id: 'ride', name: 'Ride', key: 'F', color: 'bg-teal-500', note: 'C#3', frequency: 138.59 },
];

const Drums2: React.FC = () => {
  const [volume, setVolume] = useState(0.7);
  const [reverb, setReverb] = useState(0.3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const { broadcastInstrumentNote, userInfo } = useRoom();

  const handlePadPress = async (pad: DrumPad) => {
    if (activePads.has(pad.id)) return;
    
    setActivePads(prev => new Set(prev).add(pad.id));
    
    // Play local sound with enhanced real-time audio
    const noteId = `${userInfo?.id || 'local'}-${pad.id}-${Date.now()}`;
    await playRealtimeNote(noteId, pad.frequency, 'drum', userInfo?.id || 'local', volume, 300);
    
    // Also use the legacy instrument utils for backup
    await playInstrumentNote('drum', pad.note, 2, 300, volume);
    
    // Broadcast to room without frequency property (not part of InstrumentNote type)
    broadcastInstrumentNote({
      note: pad.note,
      instrument: 'drum',
      userId: userInfo?.id || 'current-user',
      userName: userInfo?.name || 'User',
      volume: volume,
      effects: { reverb }
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
              transition-all duration-150 transform shadow-lg hover:shadow-xl
              ${activePads.has(pad.id) 
                ? 'scale-95 shadow-2xl ring-4 ring-white/50' 
                : 'hover:scale-105 hover:shadow-2xl'
              }
            `}
            style={{
              boxShadow: activePads.has(pad.id) 
                ? `0 0 30px 8px ${pad.color.replace('bg-', '').replace('-500', '')}` 
                : undefined
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{pad.name}</div>
              <div className="text-sm opacity-75">{pad.key}</div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Press the corresponding keys or click the pads to play • Enhanced real-time audio mixing
      </div>
    </StandardInstrumentLayout>
  );
};

export default Drums2;
