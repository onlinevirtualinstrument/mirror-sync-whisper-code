
import React, { useRef } from 'react';
import { useState } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Veena from './Veena';
import { getVeenaBorderColor } from '@/components/instruments/veena/Veena1/Veena/VeenaVariants';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";


const VeenaPage: React.FC = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [variant, setVariant] = useState('standard');
  const borderColor = getVeenaBorderColor(variant);

  return (
    <InstrumentPageWrapper
      title="Virtual Veena"
      description="Play veena online with this interactive virtual string instrument. Learn veena notes and practice techniques."
      instrumentType="Veena"
      borderColor={borderColor}
      route="/veena"
    >
      <div className="text-center mb-1">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Veena</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Play the veena strings by clicking on them or using keyboard keys (Q, W, E, R, T, Y, U).</p>
          </div>
          <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
            <p>For the best experience, expand to full screen.
              <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                Click here to expand
              </strong>
            </p>
          </div>
          {/* <div className="landscape-warning text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-md mb-2">
            <p>For the best experience, please rotate your device to <strong>landscape mode</strong></p>
          </div>
          <style>{`
            @media (min-width: 768px) {
              .landscape-warning {
                display: none;
              }
            }
          `}</style> */}
        </div>
      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div>
           */}

      <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Veena variant={variant} />
      </div>
    </InstrumentPageWrapper>
  );
};

export default VeenaPage;
