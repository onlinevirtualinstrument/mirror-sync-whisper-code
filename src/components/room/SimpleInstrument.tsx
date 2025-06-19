
import React, { useState, useEffect } from 'react';
import { lazy, Suspense } from "react";
import { useRoom } from './RoomContext';

// Instrument Pages - grouped by instrument type for better code splitting
const AllInstruments: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Piano: lazy(() => import("@/components/instruments/piano/piano1/Piano")),

  Guitar: lazy(() => import("@/components/instruments/guitar/VirtualGuitarComponent")),
  Violin: lazy(() => import("@/components/instruments/violin/violin2/Violin")),  
  Veena: lazy(() => import("@/components/instruments/veena/Veena1/Veena")),

  Flute: lazy(() => import("@/components/instruments/flute/flute2/index")),
  Saxophone: lazy(() => import("@/components/instruments/saxophone/saxophone1/Saxophone")),
  Trumpet: lazy(() => import("@/components/instruments/trumpet/trumpet1/Trumpet")),

  Drums: lazy(() => import("@/components/instruments/drum/drums1/Drums")),
  Xylophone: lazy(() => import("@/components/instruments/xylophone/xylophone1/Xylophone")),
  Kalimba: lazy(() => import("@/components/instruments/Kalimba/kalimba2/Kalimba")),
  Marimba: lazy(() => import("@/components/instruments/Marimba/marimba2/Marimba")),

  DrumMachine: lazy(() => import("@/components/instruments/drum-machine/DrumMachine")),
  ChordProgression: lazy(() => import("@/components/instruments/chord-Progression/ChordProgressionPlayer")),
  Sitar: lazy(() => import("@/components/instruments/sitar/Sitar1/Sitar")),
};

// Helper function to get the instrument component
const getInstrumentComponent = (instrumentType: string) => {
  const key = Object.keys(AllInstruments).find(k => 
    k.toLowerCase() === instrumentType.toLowerCase() || 
    k.toLowerCase().startsWith(instrumentType.toLowerCase())
  );
  return key ? AllInstruments[key] : null;
};

interface SimpleInstrumentProps {
  type: string;
}

const SimpleInstrument: React.FC<SimpleInstrumentProps> = ({ type }) => {
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const { broadcastInstrumentNote, room, userInfo, remotePlaying } = useRoom();

  const InstrumentComponent = getInstrumentComponent(type);

  const handlePlayNote = (note: string) => {
    if (!note || typeof note !== 'string') {
      console.error('Invalid note received:', note);
      return;
    }
    
    // Local state update for visual feedback
    setIsPlaying(prev => ({ ...prev, [note]: true }));
    
    // Broadcast the note to other users in the room
    if (room && userInfo) {
      broadcastInstrumentNote({
        note,
        instrument: type,
        userId: userInfo.id,
        userName: userInfo.displayName || userInfo.name || 'Anonymous'
      });
    }
    
    // Reset local visual feedback after a delay
    setTimeout(() => {
      setIsPlaying(prev => ({ ...prev, [note]: false }));
    }, 500);
  };

  // Listen for remote notes being played by other users
  useEffect(() => {
    if (remotePlaying && remotePlaying.instrument === type && remotePlaying.note) {
      // Update local state to show visual feedback for remote notes
      setIsPlaying(prev => ({ ...prev, [remotePlaying.note]: true }));
      
      setTimeout(() => {
        setIsPlaying(prev => ({ ...prev, [remotePlaying.note]: false }));
      }, 500);
    }
  }, [remotePlaying, type]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4">
        <span className="font-medium">Playing: {type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>

      {InstrumentComponent ? (
        <Suspense fallback={<div>Loading {type}...</div>}> 
          <InstrumentComponent 
            onPlayNote={handlePlayNote} 
            isPlaying={isPlaying}
            remoteNotes={remotePlaying?.instrument === type ? remotePlaying : null}
          />
        </Suspense>
      ) : (
        <p className="text-red-500">Instrument "{type}" not found.</p>
      )}
    </div>
  );
};

export default SimpleInstrument;
