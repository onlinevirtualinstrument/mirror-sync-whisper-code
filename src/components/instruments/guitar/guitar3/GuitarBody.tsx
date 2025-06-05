
import React from 'react';
import { Music, Volume2 } from 'lucide-react';
import { GuitarString } from './GuitarString';
import { GuitarVariant, guitarVariants } from './GuitarVariants';

interface GuitarBodyProps {
  guitarVariant: string;
  activeStrings: string[];
  playString: (stringName: string, frequency: number) => void;
}

const GuitarBody: React.FC<GuitarBodyProps> = ({ 
  guitarVariant, 
  activeStrings, 
  playString 
}) => {
  const currentVariant = guitarVariants[guitarVariant] || guitarVariants.standard;
  const guitarStrings = currentVariant.strings;

  return (
    <div className="relative">
      {/* Guitar neck */}
      <div className="w-24 md:w-28 h-[550px] bg-gradient-to-b from-amber-800 to-amber-900 absolute left-1/2 transform -translate-x-1/2 -top-12 rounded-t-lg z-0">
        {/* Fretboard */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 md:w-24 h-[500px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-t-md z-10">
          {/* Frets */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-full h-1 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300" 
              style={{ top: `${40 + i * 38}px` }}
            />
          ))}
          
          {/* Fret markers */}
          {[3, 5, 7, 9].map((fret) => (
            <div 
              key={fret} 
              className="absolute w-4 h-4 rounded-full bg-amber-100 left-1/2 transform -translate-x-1/2" 
              style={{ top: `${21 + fret * 38}px` }}
            />
          ))}
          <div className="absolute w-4 h-4 rounded-full bg-amber-100 left-1/3 transform -translate-x-1/2" style={{ top: `${21 + 12 * 38}px` }} />
          <div className="absolute w-4 h-4 rounded-full bg-amber-100 left-2/3 transform -translate-x-1/2" style={{ top: `${21 + 12 * 38}px` }} />
        </div>
      </div>
    
      {/* Guitar body */}
      <div 
        className={`${currentVariant.bodyClass} mt-8 p-12 rounded-3xl shadow-xl relative overflow-hidden transform transition-all duration-300 z-20`}
        style={{ 
          clipPath: guitarVariant === 'electric' || guitarVariant === 'bass' 
            ? 'polygon(0% 30%, 15% 0%, 85% 0%, 100% 30%, 90% 100%, 10% 100%)' 
            : 'polygon(15% 0%, 85% 0%, 90% 50%, 85% 100%, 15% 100%, 10% 50%)',
          minHeight: '400px'
        }}
      >
        {/* Background pattern/texture */}
        <div className={`absolute inset-0 opacity-30 ${currentVariant.backgroundPattern}`}></div>
        
        {/* Guitar decorative elements */}
        <div className="relative z-10">
          {/* Sound hole for acoustic guitars */}
          {guitarVariant !== 'electric' && guitarVariant !== 'bass' && (
            <div className={`${currentVariant.soundHoleClass} z-10 absolute`}>
              {guitarVariant === 'resonator' && (
                <div className="absolute inset-2 border-4 border-gray-400/50 rounded-full"></div>
              )}
            </div>
          )}
          
          {/* Pickups for electric guitars */}
          {(guitarVariant === 'electric' || guitarVariant === 'bass') && (
            <div className="flex justify-around absolute left-1/2 right-0 top-1/2 transform -translate-y-1/2">
              <div className={`${currentVariant.pickupClass} z-10 shadow-md relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/20"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gray-600 to-gray-700"></div>
              </div>
              {guitarVariant === 'electric' && (
                <div className={`${currentVariant.pickupClass} z-10 shadow-md relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/20"></div>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gray-600 to-gray-700"></div>
                </div>
              )}
            </div>
          )}
          
          {/* Control knobs for electric guitars */}
          {(guitarVariant === 'electric' || guitarVariant === 'bass') && (
            <div className="absolute bottom-8 right-8 flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 shadow-inner flex items-center justify-center text-gray-400">
                <Volume2 size={16} />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 shadow-inner flex items-center justify-center text-gray-400">
                <Music size={16} />
              </div>
            </div>
          )}

          {/* Guitar strings container */}
          <div className="flex flex-col space-y-8 md:space-y-12 relative z-10">
            {guitarStrings.map((string, index) => (
              <GuitarString
                key={string.name + index}
                string={string}
                isActive={activeStrings.includes(string.name)}
                onClick={() => playString(string.name, string.frequency)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuitarBody;
