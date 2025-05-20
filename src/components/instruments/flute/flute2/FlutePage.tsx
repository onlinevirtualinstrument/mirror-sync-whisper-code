
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Flute from '@/components/instruments/flute/flute2';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const FlutePage = () => {
  return ( 
    <InstrumentPageWrapper
      title="Virtual Flute"
      description="Play flute online with this interactive virtual instrument. Learn flute notes and create beautiful melodies."
      route="/flute"
      instrumentType="Flute"
      borderColor="border-emerald-600"
    >
      <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Flute</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
                <p> Play the flute by clicking on the holes or using number keys (1-6).</p>
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
        <RecordingControlsShared instrumentName="Flute" primaryColor="bg-blue-500" />
        </div> */}
      
      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Flute />
      </div>
    </InstrumentPageWrapper>
  );
};

export default FlutePage;
