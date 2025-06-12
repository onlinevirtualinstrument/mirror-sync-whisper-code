import { useRef } from 'react';
import Theremin from '@/components/instruments/Theremin/theremin1/Theremin';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const ThereminPage = () => {

  return (
    <InstrumentPageWrapper
      title="Virtual Theremin"
      description="Play the traditional Indian Theremin online. Experience authentic Theremin sounds and learn the basics of this classical instrument."
      instrumentType="Theremin"
      borderColor="border-yellow-700"
      route="/theremin"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Theremin</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p> Move your cursor to control the pitch and volume of this unique electronic instrument.</p>
          </div>
        </div>

      </div>

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div>
           */} 
      <div className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Theremin />
      </div>
    </InstrumentPageWrapper>
  );
};

export default ThereminPage;
