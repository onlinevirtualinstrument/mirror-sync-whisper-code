import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface FallingNote {
  id: string;
  note: string;
  lane: number;
  startTime: number;
  duration: number;
  color: string;
  frequency: number;
}

interface FallingNotesProps {
  notes: FallingNote[];
  onNoteHit: (noteId: string, timing: 'perfect' | 'good' | 'miss') => void;
  onKeyPress: (lane: number) => void;
  isPlaying: boolean;
  speed: number;
  laneCount: number;
  height?: number;
  className?: string;
}

const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  onNoteHit,
  onKeyPress,
  isPlaying,
  speed = 1,
  laneCount = 7,
  height = 400,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const [activeNotes, setActiveNotes] = useState<FallingNote[]>([]);
  const [hitZoneFlash, setHitZoneFlash] = useState<{ [lane: number]: boolean }>({});

  const hitZonePosition = height * 0.85; // Hit zone at 85% down
  const noteHeight = 40;
  const laneWidth = 100 / laneCount;

  const keyMapping = ['a', 's', 'd', 'f', 'g', 'h', 'j'];

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const key = e.key.toLowerCase();
      const laneIndex = keyMapping.indexOf(key);
      
      if (laneIndex !== -1 && laneIndex < laneCount) {
        handleLaneHit(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, laneCount]);

  const animate = useCallback(() => {
    if (!isPlaying) return;

    const currentTime = Date.now();
    const gameTime = (currentTime - startTimeRef.current) * speed;

    // Update active notes
    const newActiveNotes = notes.filter(note => {
      const noteStartTime = note.startTime;
      const noteEndTime = noteStartTime + note.duration + 2000; // Extra time to fall off screen
      return gameTime >= noteStartTime && gameTime <= noteEndTime;
    });

    setActiveNotes(newActiveNotes);

    // Check for missed notes
    newActiveNotes.forEach(note => {
      const notePosition = getNotePosition(note, gameTime);
      if (notePosition > height + noteHeight) {
        onNoteHit(note.id, 'miss');
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, notes, speed, height, onNoteHit]);

  const getNotePosition = (note: FallingNote, currentTime: number): number => {
    const noteAge = currentTime - note.startTime;
    const fallSpeed = height / 3000; // Fall over 3 seconds
    return (noteAge * fallSpeed * speed) - noteHeight;
  };

  const handleLaneHit = (lane: number): void => {
    onKeyPress(lane);
    
    // Flash hit zone
    setHitZoneFlash(prev => ({ ...prev, [lane]: true }));
    setTimeout(() => {
      setHitZoneFlash(prev => ({ ...prev, [lane]: false }));
    }, 150);

    // Check for note hits
    const currentTime = Date.now() - startTimeRef.current;
    const notesInLane = activeNotes.filter(note => note.lane === lane);
    
    notesInLane.forEach(note => {
      const notePosition = getNotePosition(note, currentTime * speed);
      const distanceFromHitZone = Math.abs(notePosition - hitZonePosition);
      
      if (distanceFromHitZone < noteHeight) {
        let timing: 'perfect' | 'good' | 'miss';
        if (distanceFromHitZone < noteHeight * 0.3) {
          timing = 'perfect';
        } else if (distanceFromHitZone < noteHeight * 0.7) {
          timing = 'good';
        } else {
          timing = 'miss';
        }
        
        onNoteHit(note.id, timing);
      }
    });
  };

  const getNoteColor = (note: FallingNote): string => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'
    ];
    return colors[note.lane % colors.length];
  };

  const currentTime = isPlaying ? (Date.now() - startTimeRef.current) * speed : 0;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800",
        "border border-white/20 rounded-lg",
        className
      )}
      style={{ height }}
    >
      {/* Lanes */}
      {Array.from({ length: laneCount }).map((_, index) => (
        <div
          key={index}
          className="absolute top-0 border-r border-white/10 last:border-r-0"
          style={{
            left: `${index * laneWidth}%`,
            width: `${laneWidth}%`,
            height: '100%'
          }}
        >
          {/* Lane number */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white/50 text-sm font-mono">
            {keyMapping[index]?.toUpperCase()}
          </div>
        </div>
      ))}

      {/* Hit Zone */}
      <div 
        className="absolute w-full bg-white/20 border-y border-white/40"
        style={{ 
          top: hitZonePosition - 10, 
          height: 20 
        }}
      />

      {/* Lane Hit Flashes */}
      {Object.entries(hitZoneFlash).map(([lane, isFlashing]) => (
        isFlashing && (
          <div
            key={lane}
            className="absolute bg-white/30 animate-pulse"
            style={{
              left: `${parseInt(lane) * laneWidth}%`,
              width: `${laneWidth}%`,
              top: hitZonePosition - 20,
              height: 40
            }}
          />
        )
      ))}

      {/* Falling Notes */}
      {activeNotes.map(note => {
        const notePosition = getNotePosition(note, currentTime);
        if (notePosition < -noteHeight || notePosition > height + noteHeight) return null;

        return (
          <div
            key={note.id}
            className={cn(
              "absolute rounded-lg border-2 border-white/30 shadow-lg",
              "flex items-center justify-center text-white font-bold text-sm",
              "transition-all duration-100",
              getNoteColor(note)
            )}
            style={{
              left: `${note.lane * laneWidth + 2}%`,
              width: `${laneWidth - 4}%`,
              top: notePosition,
              height: noteHeight,
              transform: `translateY(${notePosition < hitZonePosition ? 0 : 2}px)`,
              boxShadow: notePosition > hitZonePosition - 50 && notePosition < hitZonePosition + 50 
                ? '0 0 20px rgba(255,255,255,0.5)' 
                : undefined
            }}
          >
            {note.note}
          </div>
        );
      })}

      {/* Instructions */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-4">Press keys to hit notes!</div>
            <div className="text-lg">
              Use keys: {keyMapping.slice(0, laneCount).map(k => k.toUpperCase()).join(' - ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FallingNotes;