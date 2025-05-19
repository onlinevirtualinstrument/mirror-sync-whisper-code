
import React from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Sitar from '@/components/instruments/sitar/Sitar1';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const SitarPage: React.FC = () => {
  return (
    <InstrumentPageWrapper
      title="Virtual Sitar"
      description="Play the traditional Indian sitar online. Experience authentic sitar sounds and learn the basics of this classical instrument."
      instrumentType="Sitar"
      borderColor="border-yellow-700"
      route="/sitar"
    >
      <div className="text-center mb-12">
      <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
                <p>  Play the sitar strings by clicking on them or using keyboard keys (1-7).</p>
              </div>
              <div className="landscape-warning text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, please rotate your device to <strong>landscape mode</strong></p>
              </div>
              <style>{`
                @media (min-width: 768px) {
          .landscape-warning {
            display: none;
          }
        }
      `}</style>
            </div>
       
      </div>

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div> */}
      
      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Sitar />
      </div>
    </InstrumentPageWrapper>
  );
};

export default SitarPage;
