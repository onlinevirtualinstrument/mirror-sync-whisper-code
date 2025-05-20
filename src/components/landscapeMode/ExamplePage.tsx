// ExamplePage.tsx
import React, { useState } from 'react';
import { lockToLandscape } from './lockToLandscape';
import LandscapeInstrumentModal from './LandscapeInstrumentModal';
//import { MyInstrument } from '@/components/instruments/MyInstrument';

export default function ExamplePage() {
  const [open, setOpen] = useState(false);

  const handleOpen = async () => {
    await lockToLandscape();
    setOpen(true);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleOpen}
        className="bg-gradient-to-r from-purple-500 to-violet-700 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all"
      >
        Join in Landscape
      </button>

      {/* <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
        <MyInstrument />
      </LandscapeInstrumentModal> */}
    </div>
  );
}
