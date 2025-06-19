
import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { ThemeType } from './PianoTheme';
import audioPlayer from '@/utils/music/audioPlayer';

interface PianoKeyProps {
  note: string;
  octave: number;
  isBlack?: boolean;
  onPlay: (note: string, octave: number) => void;
  isPlaying?: boolean;
  keyboardShortcut?: string;
  className?: string;
  showCord?: boolean;
  theme?: ThemeType;
}

const PianoKey: React.FC<PianoKeyProps> = memo(({
  note,
  octave,
  isBlack = false,
  onPlay,
  isPlaying = false,
  keyboardShortcut,
  className = '',
  showCord = false,
  theme = 'light',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseDown = useCallback(() => {
    // Call the onPlay prop to handle the note playing
    onPlay(note, octave);
    
    // Convert the note and octave to a frequency
    const frequency = getNoteFrequency(note, octave);
    audioPlayer.playNote(frequency);
    
    console.log(`Playing note: ${note}${octave}`);
  }, [note, octave, onPlay]);

  // Helper function to convert a note name and octave to its frequency
  const getNoteFrequency = (note: string, octave: number): number => {
    const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
    if (noteIndex === -1) return 440; // Default to A4 if note not found
    
    // Calculate frequency based on the standard formula
    // A4 (noteIndex 9, octave 4) is 440Hz
    const semitoneOffset = (octave - 4) * 12 + (noteIndex - 9);
    return 440 * Math.pow(2, semitoneOffset / 12);
  };

  // Generate animation class based on theme
  const getAnimationClass = () => {
    if (!isPlaying) return '';
    
    switch (theme) {
      case 'neon':
        return isBlack 
          ? 'animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.7)]'
          : 'animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.7)]';
      case 'dark':
        return 'animate-scale-in';
      default:
        return 'animate-scale-in';
    }
  };

  // Generate cord styles
  const getCordStyles = () => {
    if (!showCord && !isBlack) return null;
    
    const cordColor = isBlack ? '#222' : '#444';
    const cordWidth = 2;
    const cordTop = isBlack ? '50%' : '65%';
    
    return {
      position: 'absolute' as const,
      top: cordTop,
      left: '50%',
      width: `${cordWidth}px`,
      height: isBlack ? '20%' : '25%',
      backgroundColor: cordColor,
      transform: 'translateX(-50%)',
      zIndex: 5,
    };
  };

  return (
    <div
      className={cn(
        'relative select-none transition-all duration-100 active:scale-[0.98]',
        isBlack ? 'z-10' : 'z-0',
      )}
    >
      <button
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative flex items-end justify-center pb-2 transition-all',
          isBlack
            ? 'h-32 w-10 -mx-5 rounded-b-md'
            : 'h-48 w-14 border border-gray-200 rounded-b-md',
          className,
          isPlaying ? getAnimationClass() : '',
        )}
        aria-label={`${note}${octave} piano key`}
      >
        {/* Render cord if needed */}
        {(showCord || !isBlack) && (
          <div style={getCordStyles()} />
        )}
        
        <div className="flex flex-col items-center">
          {keyboardShortcut && (
            <span
              className={cn(
                'text-xs font-medium absolute top-2',
                isBlack ? 'text-gray-400' : 'text-gray-500'
              )}
            >
              {keyboardShortcut}
            </span>
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isBlack ? 'text-white' : 'text-gray-700'
            )}
          >
            {note}
            {octave}
          </span>
        </div>
      </button>
    </div>
  );
});

PianoKey.displayName = 'PianoKey';

export default PianoKey;
