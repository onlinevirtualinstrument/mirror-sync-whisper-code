
import React from 'react';
import Trumpet from '@/components/instruments/trumpet/trumpet1/Trumpet';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControls from '@/components/instruments/RecordingControls';

const TrumpetPage = () => {
  return (
    <InstrumentPageWrapper 
      title="Virtual Trumpet"
      description="Play trumpet online with this interactive virtual brass instrument. Learn trumpet fingerings and practice techniques."
      route="/trumpet"
      instrumentType="Trumpet"
      borderColor="border-yellow-500"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Trumpet</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Play the trumpet by clicking on the valves or using keyboard keys (A, S, D).</p>
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
      
      {/* Add recording controls */}
      <div className="mb-6 animate-fade-in">
        <RecordingControls instrumentType="Trumpet" />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Trumpet />
      </div>
      

      
    </InstrumentPageWrapper>
  );
};

export default TrumpetPage;
