import { useRef } from 'react';
import Tabla from '@/components/instruments/Tabla/tabla1/Tabla';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

const TablaPage = () => {

  return (
    <InstrumentPageWrapper
      title="Virtual Tabla"
      description="Play the traditional Indian Tabla online. Experience authentic Tabla sounds and learn the basics of this classical instrument."
      instrumentType="Tabla"
      borderColor="border-yellow-700"
      route="/tabla"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Tabla</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p> Play the tabla by clicking on the drum surfaces or using keyboard keys (A, S, D, F, G, H).</p>
          </div>
        </div>

      </div>

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-2">
                  <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
                  </div> */}
      <div className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Tabla />
      </div>
    </InstrumentPageWrapper>
  );
};

export default TablaPage;
