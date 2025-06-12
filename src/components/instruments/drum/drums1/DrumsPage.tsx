
import React, { lazy, Suspense, useRef } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

// Lazy load the Drums component to improve initial page load
const Drums = lazy(() => import('@/components/instruments/drum/drums1/Drums'));

const DrumsPage: React.FC = () => {

  return (
    <InstrumentPageWrapper
      title="Virtual Drums"
      description="Play drums online with this interactive virtual percussion instrument. Learn drum beats and create your own rhythms."
      instrumentType="Drums"
      borderColor="border-red-500"
      route="/drums"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Drums</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p> Play the drums by clicking on the drum elements or using keyboard keys.</p>
          </div>
                </div>

      </div>

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
              <RecordingControlsShared instrumentName="Drums" primaryColor="bg-green-500" />
              </div> */}
        <Suspense fallback={<div className="text-center p-8">Loading drums...</div>}>
          <Drums />
        </Suspense>


    </InstrumentPageWrapper>
  );
};

export default DrumsPage;
