
import Guitar from '@/components/instruments/guitar/guitar3/Guitar';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const GuitarPage = () => {
  return (
    <InstrumentPageWrapper
      title="Virtual Guitar"
      description="Play virtual guitar online with different guitar models and sounds. Great for learning and practicing guitar online."
      route="/guitar"
      instrumentType="Guitar"
      borderColor="border-amber-600"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Guitar</h1>
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Explore different guitar types and play them with your mouse or keyboard keys (Q, W, E, R, T, Y).</p>
          </div>
        </div>
      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Guitar" primaryColor="bg-red-400" />
        </div> */}

      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Guitar />
      </div>


    </InstrumentPageWrapper>
  );
};

export default GuitarPage;
