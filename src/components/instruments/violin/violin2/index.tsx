
import { useState, useEffect, useRef } from 'react';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import { useViolinAudio } from './ViolinAudio';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface ViolinProps {
  variant?: string;
}

const Violin = ({ variant = 'standard' }: ViolinProps) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { violinVariant, setViolinVariant, strings, playString } = useViolinAudio(variant);

  // Define available violin variants
  const violinVariants = [
    { id: 'standard', name: 'Standard' },
    { id: 'stradivarius', name: 'Stradivarius' },
    { id: 'electric', name: 'Electric' },
    { id: 'baroque', name: 'Baroque' }
  ];

  useEffect(() => {
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const stringObj = strings.find(s => s.key.toUpperCase() === key);
      if (stringObj) {
        playString(stringObj.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [strings, playString]);

  return (
    <div className=" w-full mx-auto">
      <div className="flex justify-between mb-6">
        <InstrumentVariantSelector
          currentVariant={violinVariant}
          setVariant={setViolinVariant}
          variants={violinVariants}
          label="Select Violin Type"
        />
        <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
          <p>
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              ⛶Zoom
            </strong>
          </p>
        </div>
        <style>{`
                            @media (min-width: 768px) {
                              .landscape-warning {
                                display: none;
                              }
                            }
                          `}</style>
      </div>

      <FullscreenWrapper ref={containerRef} instrumentName="violin">
        <div className={`violin-body w-80 md:w-96 h-64 relative shadow-lg mb-8 ${violinVariant === 'stradivarius' ? 'bg-gradient-to-r from-amber-900 to-amber-800' :
            violinVariant === 'electric' ? 'bg-gradient-to-r from-blue-800 to-blue-700' :
              violinVariant === 'baroque' ? 'bg-gradient-to-r from-amber-700 to-amber-600' :
                'bg-gradient-to-r from-amber-800 to-amber-700'
          } ${violinVariant === 'electric' ? 'rounded-lg' : 'rounded-t-full rounded-b-full'
          }`}>
          <div className={`w-6 h-32 ${violinVariant === 'stradivarius' ? 'bg-amber-950' :
              violinVariant === 'electric' ? 'bg-gray-800' :
                violinVariant === 'baroque' ? 'bg-amber-800' :
                  'bg-amber-900'
            } absolute -top-32 left-1/2 transform -translate-x-1/2`}></div>

          <div className="absolute left-8 right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6">
            {strings.map((string, index) => (
              <div
                key={string.note}
                className="relative"
              >
                <div
                  data-freq={string.freq}
                  className={`violin-string h-0.5 w-full ${string.color} hover:h-1 hover:opacity-80 active:opacity-60 cursor-pointer transition-all`}
                  onClick={() => playString(string.freq)}
                ></div>
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-white">
                  <div>{string.note}</div>
                  <div className="opacity-70">{string.key}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullscreenWrapper>

      {/* <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Click on the strings to play or use keyboard keys (Z, X, C, V)</p>
      </div> */}
    </div>
  );
};

export default Violin;
