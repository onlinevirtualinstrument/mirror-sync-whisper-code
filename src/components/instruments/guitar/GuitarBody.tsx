
import React from 'react';
import { cn } from '@/lib/utils';
import { GuitarType } from './GuitarSoundProfiles';

interface GuitarBodyProps {
  guitarType: GuitarType;
  colors: {
    body: string;
    neck: string;
    fretboard: string;
    soundhole?: string;
    pickups?: string;
  };
  numStrings: number;
  numFrets: number;
  activeStrings: number[];
  activeFrets: {string: number, fret: number}[];
  onStringPluck: (stringIndex: number, fret: number) => void;
  showNoteNames?: boolean;
  showFretNumbers?: boolean;
  noteNames?: string[][];
}

// Default notes to display when showNoteNames is true
const DEFAULT_NOTE_NAMES = [
  ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"],
  ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  ["G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"],
  ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D"],
  ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"],
  ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"],
];

const GuitarBody: React.FC<GuitarBodyProps> = ({
  guitarType,
  colors,
  numStrings,
  numFrets,
  activeStrings,
  activeFrets,
  onStringPluck,
  showNoteNames = false,
  showFretNumbers = false,
  noteNames = DEFAULT_NOTE_NAMES
}) => {
  const isAcoustic = guitarType === 'acoustic' || guitarType === 'classical';
  
  // Calculate string spacing
  const stringSpacing = 100 / (numStrings + 1);
  
  // Generate strings
  const strings = Array.from({ length: numStrings }).map((_, i) => {
    const stringIndex = numStrings - 1 - i;
    const isActive = activeStrings.includes(stringIndex);
    const stringThickness = guitarType === 'bass' 
      ? 2 + (numStrings - 1 - i) * 0.8
      : 1 + (numStrings - 1 - i) * 0.4;
    
    return (
      <div
        key={i}
        className={cn(
          "absolute left-0 right-0 bg-gray-300 z-20",
          isActive && "animate-string-vibration"
        )}
        style={{
          height: `${stringThickness}px`,
          top: `${(i + 1) * stringSpacing}%`,
          transform: `translateY(-${stringThickness / 2}px)`,
          background: `linear-gradient(to bottom, #D7D7D7, #EEEEEE, #D7D7D7)`
        }}
        onClick={(e) => {
          e.stopPropagation();
          onStringPluck(stringIndex, 0);
        }}
      />
    );
  });
  
  // Generate frets
  const frets = Array.from({ length: numFrets + 1 }).map((_, i) => {
    const fretWidth = i === 0 ? 4 : 2;
    const leftPosition = i === 0 ? 0 : 15 + (i - 1) * ((85 - 15) / numFrets);
    
    return (
      <div
        key={i}
        className="absolute top-0 bottom-0 bg-gray-400"
        style={{
          width: `${fretWidth}px`,
          left: `${leftPosition}%`,
          zIndex: 15,
          background: i === 0 
            ? 'linear-gradient(to right, #D7D7D7, #EEEEEE, #D7D7D7)'
            : 'linear-gradient(to right, #AAAAAA, #C0C0C0, #AAAAAA)'
        }}
      />
    );
  });
  
  // Generate fretboard position markers
  const markers = [3, 5, 7, 9, 12].map(fretNumber => {
    const leftPosition = 15 + (fretNumber - 1) * ((85 - 15) / numFrets) - ((85 - 15) / numFrets / 2);
    
    return (
      <div
        key={fretNumber}
        className="absolute top-1/2 transform -translate-y-1/2 rounded-full bg-gray-300/50"
        style={{
          width: fretNumber === 12 ? '20px' : '10px',
          height: fretNumber === 12 ? '20px' : '10px',
          left: `${leftPosition}%`,
          zIndex: 15,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}
      />
    );
  });
  
  // Generate fret numbers if enabled
  const fretNumbers = showFretNumbers ? Array.from({ length: numFrets }).map((_, i) => {
    const fretNumber = i + 1;
    const leftPosition = 15 + (i) * ((85 - 15) / numFrets) + ((85 - 15) / numFrets / 2);
    
    return (
      <div 
        key={i}
        className="absolute bottom-0 transform -translate-x-1/2 text-white text-[8px] sm:text-xs bg-black/70 px-1 rounded-t-sm z-30"
        style={{ left: `${leftPosition}%` }}
      >
        {fretNumber}
      </div>
    );
  }) : null;
  
  // Generate fret positions
  const fretPositions = Array.from({ length: numFrets }).map((_, i) => {
    const fretNumber = i + 1;
    const leftStart = 15 + (i) * ((85 - 15) / numFrets);
    const leftEnd = 15 + (i + 1) * ((85 - 15) / numFrets);
    const width = leftEnd - leftStart;
    
    return Array.from({ length: numStrings }).map((_, j) => {
      const stringIndex = numStrings - 1 - j;
      const topPosition = (j + 1) * stringSpacing;
      const isActive = activeFrets.some(af => af.string === stringIndex && af.fret === fretNumber);
      
      // Get note name if available and enabled
      let noteName = '';
      if (showNoteNames && noteNames && noteNames[stringIndex] && noteNames[stringIndex][fretNumber]) {
        noteName = noteNames[stringIndex][fretNumber];
      }
      
      return (
        <div
          key={`${i}-${j}`}
          className={cn(
            "absolute z-10 cursor-pointer hover:bg-white/10 transition-colors",
            isActive && "bg-white/20"
          )}
          style={{
            left: `${leftStart}%`,
            top: `${topPosition - stringSpacing/2}%`,
            width: `${width}%`,
            height: `${stringSpacing}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onStringPluck(stringIndex, fretNumber);
          }}
        >
          {showNoteNames && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white text-[6px] sm:text-[8px] md:text-xs px-1 py-0.5 rounded-sm z-30">
              {noteName || (noteNames[Math.min(stringIndex, noteNames.length-1)] && noteNames[Math.min(stringIndex, noteNames.length-1)][fretNumber])}
            </div>
          )}
          
          {isActive && activeFrets.some(af => af.string === stringIndex && af.fret === fretNumber && af.fret !== -1) && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white/80 rounded-full z-25 animate-pulse"></div>
          )}
        </div>
      );
    });
  }).flat();
  
  // Render guitar body
  return (
    <div className="relative aspect-[3.2/1] w-full overflow-hidden rounded-xl shadow-lg">
      {/* Guitar Body */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ 
          background: `linear-gradient(to right, ${colors.body}, ${colors.body}DD)`,
        }}
      >
        {/* Curved edge effect */}
        <div 
          className="absolute w-[102%] h-[102%] rounded-[30%] transform -rotate-6"
          style={{ 
            background: `linear-gradient(to right, ${colors.body}99, ${colors.body}22)`,
            top: '10%',
            left: '-10%'
          }}
        />
        
        {/* Sound hole for acoustic/classical */}
        {isAcoustic && (
          <div className="absolute rounded-full" style={{
            width: '25%',
            height: '50%',
            left: '50%',
            top: '25%',
            background: `radial-gradient(circle, ${colors.soundhole}, ${colors.soundhole}DD)`,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            transform: 'translateX(-50%)'
          }} />
        )}
        
        {/* Pickups for electric/bass */}
        {!isAcoustic && (
          <>
            <div className="absolute rounded-md" style={{
              width: '20%',
              height: '40%',
              left: '35%',
              top: '30%',
              background: colors.pickups,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
            <div className="absolute rounded-md" style={{
              width: '20%',
              height: '40%',
              left: '60%',
              top: '30%',
              background: colors.pickups,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          </>
        )}
      </div>
      
      {/* Guitar Neck and Fretboard */}
      <div 
        className="absolute left-0 top-0 bottom-0 overflow-hidden"
        style={{ 
          width: '85%',
          clipPath: 'polygon(0 0, 15% 0, 15% 100%, 0 100%)'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{ background: colors.neck }}
        />
      </div>
      
      <div 
        className="absolute top-5 bottom-5 overflow-hidden rounded-l-md"
        style={{ 
          left: '2%',
          width: '83%',
          background: colors.fretboard,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {markers}
        {frets}
        {strings}
        {fretPositions}
        {fretNumbers}
      </div>
      
      {/* Open string note names */}
      {showNoteNames && (
        <div className="absolute left-0 top-0 h-full z-30">
          {Array.from({ length: numStrings }).map((_, i) => {
            const stringIndex = numStrings - 1 - i;
            const topPosition = (i + 1) * stringSpacing;
            const openNote = noteNames[Math.min(stringIndex, noteNames.length-1)] ? 
                            noteNames[Math.min(stringIndex, noteNames.length-1)][0] : 
                            DEFAULT_NOTE_NAMES[Math.min(stringIndex, DEFAULT_NOTE_NAMES.length-1)][0];
            
            return (
              <div
                key={`open-${i}`}
                className="absolute bg-black/70 text-white text-[6px] sm:text-[8px] md:text-xs px-1 py-0.5 rounded-sm"
                style={{
                  left: '8px',
                  top: `${topPosition - 8}px`,
                }}
              >
                {openNote}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Touch-friendly overlay for mobile - makes strings easier to tap */}
      <div className="absolute inset-0 z-0 md:hidden">
        {Array.from({ length: numStrings }).map((_, i) => {
          const stringIndex = numStrings - 1 - i;
          const topPercentage = (i + 1) * stringSpacing;
          
          return (
            <div
              key={`mobile-touch-${i}`}
              className="absolute left-0 w-[15%] bg-transparent"
              style={{
                top: `${topPercentage - stringSpacing/2}%`,
                height: `${stringSpacing}%`,
              }}
              onClick={() => onStringPluck(stringIndex, 0)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GuitarBody;
