
import React from 'react';
import type { VeenaStringData } from './VeenaAudio';
import { getVeenaBodyGradient, getVeenaResonatorColor } from './VeenaVariants';

interface VeenaBodyProps {
  strings: VeenaStringData[];
  variant: string;
  onStringClick: (freq: number) => void;
}

export const VeenaBody: React.FC<VeenaBodyProps> = ({ 
  strings,
  variant,
  onStringClick
}) => {
  const bodyGradient = getVeenaBodyGradient(variant);
  const resonatorColor = getVeenaResonatorColor(variant);

  return (
    <div className={`veena-body w-full max-w-3xl h-80 relative shadow-lg mb-8 ${bodyGradient} rounded-l-full`}>
      <div className="absolute left-4 right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
        {strings.map((string) => (
          <div 
            key={string.note}
            className="relative"
          >
            <div
              data-freq={string.freq}
              className={`veena-string h-0.5 w-full ${string.color} hover:h-1 hover:opacity-80 active:opacity-60 cursor-pointer transition-all`}
              onClick={() => onStringClick(string.freq)}
            ></div>
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-xs text-white">
              <div>{string.note}</div>
              <div className="opacity-70">{string.key}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`w-24 h-24 ${resonatorColor} rounded-full absolute -left-12 top-1/2 transform -translate-y-1/2`}></div>
    </div>
  );
};
