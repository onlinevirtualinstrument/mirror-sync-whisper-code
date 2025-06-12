import { useRef } from 'react';

import Saxophone from '@/components/instruments/saxophone/saxophone1/Saxophone';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const SaxophonePage = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <InstrumentPageWrapper
      title="Virtual Saxophone"
      description="Play saxophone online with this interactive virtual instrument. Learn saxophone fingerings and practice jazz techniques."
      route="/saxophone"
      instrumentType="Saxophone"
      borderColor="border-yellow-600"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Saxophone</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Play the saxophone by clicking on the keys or using keyboard keys (A, S, D, F, G, H, J, K).</p>
          </div> 
        </div>
      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div> */}

      <div className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Saxophone />
      </div>


    </InstrumentPageWrapper>
  );
};

export default SaxophonePage;
