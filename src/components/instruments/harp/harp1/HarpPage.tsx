
import React, { useRef } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Harp from '@/components/instruments/harp/harp1';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const HarpPage: React.FC = () => {

  return (
    <InstrumentPageWrapper
      title="Virtual Harp"
      description="Play harp online with this interactive virtual string instrument. Learn harp techniques and create beautiful melodies."
      instrumentType="Harp"
      borderColor="border-blue-400"
      route="/harp"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Harp</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Pluck the harp strings by clicking on them or using keyboard keys (A-K).</p>
          </div>
        </div>
      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
              <RecordingControlsShared instrumentName="Harp" primaryColor="bg-pink-500" />
              </div> */}

      <div className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Harp />
      </div>


    </InstrumentPageWrapper>
  );
};

export default HarpPage;
