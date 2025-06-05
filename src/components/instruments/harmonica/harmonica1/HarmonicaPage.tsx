
import { useRef } from 'react';
import Harmonica from '@/components/instruments/harmonica/harmonica1/Harmonica';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";

const HarmonicaPage = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <InstrumentPageWrapper
      title="Virtual Harmonica"
      description="Play harmonica online with this interactive virtual instrument. Select from different harmonica types and explore various sounds."
      route="/harmonica"
      instrumentType="Harmonica"
      borderColor="border-blue-600"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Harmonica</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>  Play the harmonica by clicking on the holes or using number keys (1-8).</p>
          </div>
          <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
            <p>For the best experience, expand to full screen.
              <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                Click here to expand
              </strong>
            </p>
          </div>
        </div>

      </div>

      {/* Add recording controls */}
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Harmonica" primaryColor="bg-purple-500" />
        </div> */}

      <div ref={containerRef} className="w-full flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Harmonica />
      </div>
    </InstrumentPageWrapper>
  );
};

export default HarmonicaPage;
