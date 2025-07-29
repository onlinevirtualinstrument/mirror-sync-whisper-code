import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import FallingNotes, { FallingNote } from '@/components/gamification/FallingNotes';
import GameScore, { GameStats } from '@/components/gamification/GameScore';
import { useGameification, GameMode, HitTiming } from '@/hooks/useGameification';
import UnifiedAudioEngine from '@/utils/audio/unifiedAudioEngine';
import { toast } from 'sonner';

interface PianoWithFallingNotesProps {
  onPlayNote?: (note: string, octave: number) => void;
  isPlaying?: { [key: string]: boolean };
  className?: string;
}

const PIANO_NOTES = [
  { note: 'C', frequency: 261.63, isBlack: false },
  { note: 'C#', frequency: 277.18, isBlack: true },
  { note: 'D', frequency: 293.66, isBlack: false },
  { note: 'D#', frequency: 311.13, isBlack: true },
  { note: 'E', frequency: 329.63, isBlack: false },
  { note: 'F', frequency: 349.23, isBlack: false },
  { note: 'F#', frequency: 369.99, isBlack: true },
  { note: 'G', frequency: 392.00, isBlack: false },
  { note: 'G#', frequency: 415.30, isBlack: true },
  { note: 'A', frequency: 440.00, isBlack: false },
  { note: 'A#', frequency: 466.16, isBlack: true },
  { note: 'B', frequency: 493.88, isBlack: false }
];

const KEYBOARD_MAPPING = ['a', 's', 'd', 'f', 'g', 'h', 'j'];

const PianoWithFallingNotes: React.FC<PianoWithFallingNotesProps> = ({
  onPlayNote,
  isPlaying = {},
  className
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('rhythm');
  const [showFallingNotes, setShowFallingNotes] = useState(true);
  const [noteSpeed, setNoteSpeed] = useState(1);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  
  const audioEngineRef = useRef<UnifiedAudioEngine | null>(null);
  const nextNoteId = useRef(0);

  const {
    gameStats,
    isGameActive,
    startGame,
    endGame,
    handleNoteHit,
    handleNotePlayed
  } = useGameification({
    gameMode,
    timeLimit: gameMode === 'challenge' ? 60 : undefined,
    targetScore: gameMode === 'challenge' ? 5000 : undefined,
    onGameEnd: (stats) => {
      toast.success('Game completed!', {
        description: `Final score: ${stats.score}`
      });
    },
    onLevelUp: (level) => {
      setNoteSpeed(Math.min(level * 0.2 + 1, 3)); // Increase speed with level
    }
  });

  useEffect(() => {
    audioEngineRef.current = UnifiedAudioEngine.getInstance();
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Generate falling notes for rhythm mode
  useEffect(() => {
    if (gameMode === 'rhythm' && isGameActive) {
      const generateNotes = () => {
        const newNotes: FallingNote[] = [];
        const currentTime = Date.now();
        
        // Generate notes for the next 10 seconds
        for (let i = 0; i < 20; i++) {
          const lane = Math.floor(Math.random() * 7);
          const noteIndex = lane;
          const note = PIANO_NOTES[noteIndex % PIANO_NOTES.length];
          
          newNotes.push({
            id: `note-${nextNoteId.current++}`,
            note: note.note,
            lane,
            startTime: currentTime + i * 1000 + Math.random() * 500,
            duration: 1000,
            color: `hsl(${lane * 50}, 70%, 60%)`,
            frequency: note.frequency
          });
        }
        
        setFallingNotes(prev => [...prev, ...newNotes]);
      };

      generateNotes();
      const interval = setInterval(generateNotes, 8000);
      return () => clearInterval(interval);
    }
  }, [gameMode, isGameActive]);

  const playPianoNote = useCallback(async (noteIndex: number, velocity: number = 0.7) => {
    if (!audioEngineRef.current) return;

    const note = PIANO_NOTES[noteIndex % PIANO_NOTES.length];
    const octave = Math.floor(noteIndex / PIANO_NOTES.length) + 4;
    
    await audioEngineRef.current.playNote(
      'piano',
      `${note.note}${octave}`,
      note.frequency,
      velocity,
      1000
    );

    // Update active keys for visual feedback
    const keyId = `${note.note}-${octave}`;
    setActiveKeys(prev => ({ ...prev, [keyId]: true }));
    setTimeout(() => {
      setActiveKeys(prev => ({ ...prev, [keyId]: false }));
    }, 200);

    onPlayNote?.(note.note, octave);
    handleNotePlayed('piano', `${note.note}${octave}`);
  }, [onPlayNote, handleNotePlayed]);

  const handleNoteHitCallback = useCallback((noteId: string, timing: HitTiming) => {
    handleNoteHit(timing);
    
    // Remove the hit note
    setFallingNotes(prev => prev.filter(note => note.id !== noteId));
    
    // Visual feedback
    if (timing === 'perfect') {
      toast.success('Perfect!', { duration: 1000 });
    } else if (timing === 'good') {
      toast.success('Good!', { duration: 1000 });
    }
  }, [handleNoteHit]);

  const handleKeyPress = useCallback((lane: number) => {
    playPianoNote(lane, 0.8);
  }, [playPianoNote]);

  const toggleGameMode = () => {
    if (isGameActive) {
      endGame();
    }
    
    const modes: GameMode[] = ['freeplay', 'rhythm', 'challenge'];
    const currentIndex = modes.indexOf(gameMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setGameMode(nextMode);
    setFallingNotes([]);
  };

  const renderPianoKeys = () => {
    return (
      <div className="flex justify-center items-end space-x-1 p-4">
        {PIANO_NOTES.slice(0, 7).map((note, index) => {
          const keyId = `${note.note}-4`;
          const isActive = activeKeys[keyId] || isPlaying[keyId];
          const keyboardKey = KEYBOARD_MAPPING[index];
          
          return (
            <button
              key={index}
              className={cn(
                "relative border-2 border-gray-300 rounded-b-lg transition-all duration-150",
                "flex flex-col items-center justify-end text-sm font-mono",
                note.isBlack 
                  ? "bg-gray-800 text-white border-gray-600 h-32 w-8 -mx-1 z-10" 
                  : "bg-white text-gray-800 h-48 w-12",
                isActive && (note.isBlack ? "bg-gray-600" : "bg-gray-200"),
                "hover:shadow-lg transform hover:scale-105"
              )}
              onMouseDown={() => playPianoNote(index)}
              onTouchStart={() => playPianoNote(index)}
            >
              <span className="mb-2 text-xs">{note.note}</span>
              <span className="mb-1 text-xs opacity-60">{keyboardKey}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Game Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10">
        <div className="flex items-center space-x-2">
          <Button
            onClick={isGameActive ? endGame : startGame}
            variant={isGameActive ? "destructive" : "default"}
            size="sm"
          >
            {isGameActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isGameActive ? 'Stop' : 'Start'}
          </Button>
          
          <Button onClick={toggleGameMode} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {gameMode.toUpperCase()}
          </Button>
          
          <Button 
            onClick={() => setShowFallingNotes(!showFallingNotes)} 
            variant="outline" 
            size="sm"
          >
            {showFallingNotes ? 'Hide' : 'Show'} Notes
          </Button>
        </div>

        {/* Game Stats */}
        <GameScore 
          stats={gameStats}
          gameMode={gameMode}
          showTimer={gameMode === 'challenge'}
          className="flex-1 max-w-md"
        />
      </div>

      {/* Falling Notes Display */}
      {showFallingNotes && gameMode === 'rhythm' && (
        <div className="relative">
          <FallingNotes
            notes={fallingNotes}
            onNoteHit={handleNoteHitCallback}
            onKeyPress={handleKeyPress}
            isPlaying={isGameActive}
            speed={noteSpeed}
            laneCount={7}
            height={300}
            className="mb-4"
          />
        </div>
      )}

      {/* Piano Keys */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600">
        {renderPianoKeys()}
        
        {/* Instructions */}
        <div className="text-center p-2 text-sm text-gray-600 dark:text-gray-400">
          Use keyboard keys: {KEYBOARD_MAPPING.map(k => k.toUpperCase()).join(' - ')} or click to play
        </div>
      </div>

      {/* Game Mode Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        {gameMode === 'freeplay' && <p>Free Play: Play any notes to earn points</p>}
        {gameMode === 'rhythm' && <p>Rhythm Mode: Hit the falling notes at the right time</p>}
        {gameMode === 'challenge' && <p>Challenge Mode: Reach {5000} points in 60 seconds</p>}
      </div>
    </div>
  );
};

export default PianoWithFallingNotes;