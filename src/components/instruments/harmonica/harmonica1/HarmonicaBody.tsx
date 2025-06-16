
import React from 'react';
import { harmonicaVariants, getHarmonicaHoles } from './HarmonicaVariants';

interface HarmonicaBodyProps {
  harmonicaVariant: string;
  activeHole: number | null;
  onHoleClick: (hole: number, holeProps: any) => void;
}

export const HarmonicaBody: React.FC<HarmonicaBodyProps> = ({
  harmonicaVariant,
  activeHole,
  onHoleClick
}) => {
  // Get holes for current variant
  const holes = getHarmonicaHoles(harmonicaVariant);
  
  // Determine body color based on variant
  const getBodyStyles = () => {
    const variant = harmonicaVariants[harmonicaVariant] || harmonicaVariants.standard;
    return variant.bodyColor;
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={`bg-gradient-to-r ${getBodyStyles()} h-28 rounded-lg flex items-center justify-center p-4`}>
        <div className="bg-gray-800 h-20 w-full rounded flex items-center justify-center">
          <div className="flex space-x-2">
            {holes.map((hole: any) => (
              <div 
                key={hole.number}
                className={`w-8 h-16 rounded-sm flex items-center justify-center cursor-pointer transition-all ${
                  activeHole === hole.number 
                    ? 'bg-gray-500' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => onHoleClick(hole.number, hole)}
              >
                <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                <div className="absolute -bottom-6 text-xs text-blue-200">{hole.number}</div>
                <div className="absolute -top-6 text-xs text-blue-200">{hole.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
