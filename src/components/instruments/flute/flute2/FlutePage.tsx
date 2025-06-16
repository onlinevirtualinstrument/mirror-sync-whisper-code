
import { useState } from 'react';

import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Flute from '@/components/instruments/flute/flute2';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { lockToLandscape } from "../../../landscapeMode/lockToLandscape";
import LandscapeInstrumentModal from '../../../landscapeMode/LandscapeInstrumentModal';


const FlutePage = () => {

  const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    //await lockToLandscape();
    setOpen(true);
  };


  return (
    <InstrumentPageWrapper
      title="Virtual Flute"
      description="Play flute online with this interactive virtual instrument. Learn flute notes and create beautiful melodies."
      route="/flute"
      instrumentType="Flute"
      borderColor="border-emerald-600"
    >
      <div className="text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Flute</h1>
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p> Play the flute by clicking on the holes or using number keys (1-6).</p>
          </div>
          <div className="text-center landscape-warning text-xs text-muted-foreground bg-purple-100 p-2 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-6">
            <p>For the best experience, expand to full screen.
              <strong onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent ">
                Click here to expand
              </strong>
            </p>
            <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
              <Flute />
            </LandscapeInstrumentModal>
          </div>
        </div>



      </div>
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Flute" primaryColor="bg-blue-500" />
        </div> */}

      <div className=" bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Flute />
      </div>
    </InstrumentPageWrapper>
  );
};

export default FlutePage;
