
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ChordDisplayProps {
  chordName: string;
  positions: Array<{string: number, fret: number}>;
  className?: string;
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({ 
  chordName, 
  positions, 
  className 
}) => {
  // Calculate display properties
  const numStrings = 6;
  const numFrets = 5; // Display 5 frets for chord diagrams
  
  // Find the lowest non-zero fret to determine positioning
  const nonZeroFrets = positions.filter(p => p.fret > 0).map(p => p.fret);
  const lowestFret = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : 0;
  const startFret = lowestFret > 3 ? lowestFret : 0;
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-3">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-1">{chordName}</h3>
          
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 w-28">
            {/* Chord diagram */}
            <div className="relative">
              {/* Nut (if starting at fret 0) */}
              {startFret === 0 && (
                <div 
                  className="absolute top-0 left-0 right-0 h-2 bg-gray-700 dark:bg-gray-300"
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
              
              {/* Fret position indicator */}
              {startFret > 0 && (
                <div className="absolute -left-6 top-6 text-xs text-gray-500">
                  {startFret}
                </div>
              )}
              
              {/* Strings */}
              {Array.from({ length: numStrings }).map((_, i) => (
                <div 
                  key={`string-${i}`}
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                  style={{ left: `${i * 20}%` }}
                />
              ))}
              
              {/* Frets */}
              {Array.from({ length: numFrets }).map((_, i) => (
                <div 
                  key={`fret-${i}`}
                  className="absolute left-0 right-0 h-0.5 bg-gray-500"
                  style={{ top: `${(i + 1) * 20}%` }}
                />
              ))}
              
              {/* Finger positions */}
              {positions.map((pos, i) => {
                if (pos.fret === -1) {
                  // X mark for strings that shouldn't be played
                  return (
                    <div 
                      key={`pos-${i}`}
                      className="absolute -top-8 text-sm font-bold text-red-500"
                      style={{ left: `${pos.string * 20}%`, transform: 'translateX(-50%)' }}
                    >
                      X
                    </div>
                  );
                } else if (pos.fret === 0) {
                  // Open string (o)
                  return (
                    <div 
                      key={`pos-${i}`}
                      className="absolute -top-8 text-sm font-bold"
                      style={{ left: `${pos.string * 20}%`, transform: 'translateX(-50%)' }}
                    >
                      O
                    </div>
                  );
                } else {
                  // Finger position dot
                  const fretPosition = pos.fret - startFret;
                  return (
                    <div 
                      key={`pos-${i}`}
                      className="absolute w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white"
                      style={{ 
                        left: `${pos.string * 20}%`, 
                        top: `${(fretPosition - 0.5) * 20}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                    </div>
                  );
                }
              })}
              
              {/* Empty area to give the diagram height */}
              <div className="w-full" style={{ paddingBottom: '100%' }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChordDisplay;
