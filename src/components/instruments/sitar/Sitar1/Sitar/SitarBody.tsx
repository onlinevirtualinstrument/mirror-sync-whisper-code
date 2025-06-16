
import React from 'react';
import { sitarVariants } from './SitarVariants';
import { SitarString } from './SitarString';

interface SitarBodyProps {
  sitarVariant: string;
  activeString: number | null;
  onPlayString: (stringNumber: number, frequency: number) => void;
}

export const SitarBody: React.FC<SitarBodyProps> = ({
  sitarVariant,
  activeString,
  onPlayString
}) => {
  const currentVariant = sitarVariants[sitarVariant] || sitarVariants.standard;
  
  return (
    <div className="glass-card p-8 rounded-xl bg-gradient-to-b from-amber-50/30 to-amber-100/30 backdrop-blur-sm border border-amber-200/30">
      <div className="relative">
        {/* Sitar body */}
        <div 
          className={`${currentVariant.bodyClass} p-8 rounded-full shadow-xl relative overflow-hidden transform transition-all duration-300 aspect-[3/4] max-w-md mx-auto`}
        >
          {/* Background pattern/texture */}
          <div className={`absolute inset-0 opacity-30 ${currentVariant.patternClass}`}></div>
          
          {/* Sitar decorative elements */}
          <div className="relative z-10 flex flex-col h-full justify-center">
            {/* Sound hole */}
            <div className={`${currentVariant.soundHoleClass} mx-auto mb-8`}></div>
            
            {/* Strings container */}
            <div className="flex flex-col space-y-6 md:space-y-8 relative z-10">
              {currentVariant.strings.map((string) => (
                <SitarString
                  key={string.number}
                  string={string}
                  isActive={activeString === string.number}
                  onClick={() => onPlayString(string.number, string.frequency)}
                  stringColor={currentVariant.stringColor}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sitar neck */}
        <div className="w-16 h-48 bg-gradient-to-b from-amber-800 to-amber-900 absolute left-1/2 transform -translate-x-1/2 -bottom-32 rounded-b-lg">
          {/* Pegs */}
          <div className="absolute top-12 -left-8 w-8 h-24">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-amber-700 border border-amber-600 rounded-full mb-4 shadow-md"></div>
            ))}
          </div>
          <div className="absolute top-12 -right-8 w-8 h-24">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-amber-700 border border-amber-600 rounded-full mb-4 shadow-md"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
