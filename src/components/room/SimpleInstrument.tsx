
import React, { useState, useCallback } from 'react';
import { lazy, Suspense } from "react";
import { useRoom } from './RoomContext';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';
import { PianoTilesGame, GuitarRhythmGame, DrumBeatGame, ViolinBowGame, FluteBreathGame } from '@/components/gamification/InstrumentGameModes';

// Instrument Pages - grouped by instrument type for better code splitting
const AllInstruments: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Piano: lazy(() => import("@/components/instruments/piano/PianoWithFallingNotes")),
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
  showGameMode?: boolean;
  gameMode?: 'tiles' | 'rhythm' | 'normal';
  difficulty?: 'easy' | 'medium' | 'hard';
  enableGameModeToggle?: boolean;
}

const SimpleInstrument: React.FC<SimpleInstrumentProps> = ({ 
  type, 
  showGameMode = false, 
  gameMode = 'normal',
  difficulty = 'medium',
  enableGameModeToggle = false
}) => {
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [localGameMode, setLocalGameMode] = useState<'tiles' | 'rhythm' | 'normal'>('normal');
  const { userInfo } = useRoom();

  const InstrumentComponent = getInstrumentComponent(type);

  const handlePlayNote = useCallback(async (note: string) => {
    if (!note || typeof note !== 'string') {
      console.error('SimpleInstrument: Invalid note received:', note);
      return;
    }
    
    console.log(`SimpleInstrument: Playing note ${note} on ${type}`);
    
    const [noteName, octaveStr] = note.includes(':') ? note.split(':') : [note, '4'];
    const octave = parseInt(octaveStr) || 4;
    const velocity = Math.random() * 0.3 + 0.5; // Random velocity between 0.5-0.8
    
    try {
      // Play local sound - system audio sharing will handle transmission to other users
      await playInstrumentNote(type, noteName, octave, 500, velocity);
      
      // Local state update for visual feedback
      setIsPlaying(prev => ({ ...prev, [note]: true }));
      
    } catch (error) {
      console.error('SimpleInstrument: Error playing note:', error);
    }
    
    // Reset local visual feedback after a delay
    setTimeout(() => {
      setIsPlaying(prev => ({ ...prev, [note]: false }));
    }, 500);
  }, [type]);

  const handleGameNoteHit = useCallback((note: string, accuracy: number) => {
    // Convert accuracy to velocity
    const velocity = Math.max(0.3, accuracy);
    const octave = 4;
    
    try {
      playInstrumentNote(type, note, octave, 300, velocity);
      setIsPlaying(prev => ({ ...prev, [note]: true }));
      
      setTimeout(() => {
        setIsPlaying(prev => ({ ...prev, [note]: false }));
      }, 300);
    } catch (error) {
      console.error('SimpleInstrument: Game note error:', error);
    }
  }, [type]);

  const renderGameMode = () => {
    const gameProps = {
      instrument: type,
      onNoteHit: handleGameNoteHit,
      isActive: true,
      difficulty
    };

    switch (type.toLowerCase()) {
      case 'piano':
        return <PianoTilesGame {...gameProps} />;
      case 'guitar':
        return <GuitarRhythmGame {...gameProps} />;
      case 'drums':
      case 'drum':
        return <DrumBeatGame {...gameProps} />;
      case 'violin':
        return <ViolinBowGame {...gameProps} />;
      case 'flute':
        return <FluteBreathGame {...gameProps} />;
      default:
        return <PianoTilesGame {...gameProps} />; // Fallback to piano tiles
    }
  };

  const currentGameMode = showGameMode ? gameMode : localGameMode;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4 flex items-center justify-between w-full">
        <span className="font-medium">Playing: {type.charAt(0).toUpperCase() + type.slice(1)}</span>
        
        {enableGameModeToggle && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Game Mode:</span>
            <div className="flex gap-1">
              {['normal', 'tiles', 'rhythm'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLocalGameMode(mode as any)}
                  className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                    localGameMode === mode 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {(showGameMode && gameMode === 'tiles') || (currentGameMode === 'tiles') ? (
        renderGameMode()
      ) : InstrumentComponent ? (
        <Suspense fallback={<div>Loading {type}...</div>}> 
          <InstrumentComponent 
            onPlayNote={handlePlayNote} 
            isPlaying={isPlaying}
          />
        </Suspense>
      ) : (
        <p className="text-red-500">Instrument "{type}" not found.</p>
      )}
    </div>
  );
};

export default SimpleInstrument;
