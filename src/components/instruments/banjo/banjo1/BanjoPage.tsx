
import React, { useRef } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Banjo from '@/components/instruments/banjo/banjo1';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";

const BanjoPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  return (
    <InstrumentPageWrapper
      title="Virtual Banjo"
      description="Play banjo online with this interactive virtual string instrument. Learn banjo techniques and play folk or bluegrass music."
      instrumentType="Banjo"
      borderColor="border-amber-500"
      route="/banjo"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Banjo</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Strum the banjo strings by clicking on them or using keyboard keys (Q, W, E, R, T).</p>
          </div>
        </div>
        <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
          <p>For the best experience, expand to full screen.
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              Click here to expand
            </strong>
          </p>
        </div>
                
      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
              <RecordingControlsShared instrumentName="Banjo" primaryColor="bg-pink-500" />
              </div> */}

      <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Banjo />
      </div>


    </InstrumentPageWrapper>
  );
};

export default BanjoPage;
