
import { useState, useRef } from 'react';
import Xylophone from '@/components/instruments/xylophone/xylophone1/Xylophone';
import InstrumentSelector, { InstrumentTypeOption } from '@/pages/instruments/InstrumentSelector';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";

const xylophoneTypes: InstrumentTypeOption[] = [
  { id: "standard", name: "Standard Xylophone" },
  { id: "marimba", name: "Marimba" },
  { id: "glockenspiel", name: "Glockenspiel" },
  { id: "vibraphone", name: "Vibraphone" },
  { id: "wooden", name: "Wooden Xylophone" }
];

const XylophonePage = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedXylophoneType, setSelectedXylophoneType] = useState<string>("standard");
  
  // Determine border color based on xylophone type
  const getBorderColor = () => {
    switch (selectedXylophoneType) {
      case "marimba":
        return "border-amber-700";
      case "glockenspiel":
        return "border-blue-500";
      case "vibraphone":
        return "border-purple-500";
      case "wooden":
        return "border-brown-600";
      default:
        return "border-indigo-500";
    }
  };

  return (
    <InstrumentPageWrapper
      title="Virtual Xylophone"
      description="Play xylophone online with this colorful virtual instrument. Try different variations including marimba, glockenspiel, and vibraphone."
      route="/xylophone"
      instrumentType="Xylophone"
      borderColor={getBorderColor()}
    >
      <div className="text-center mb-12">
      <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
                <p>  Play the colorful xylophone by clicking on the wooden bars or using keyboard keys.</p>
              </div>
              <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
                        <p>For the best experience, expand to full screen.
                          <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                            Click here to expand
                          </strong>
                        </p>
                      </div>
              {/* <div className="landscape-warning text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, please rotate your device to <strong>landscape mode</strong></p>
              </div>
              <style>{`
                @media (min-width: 768px) {
          .landscape-warning {
            display: none;
          }
        }
      `}</style> */}
            </div>
      </div>
      

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div> */}

      <div className="mb-6 flex justify-center animate-fade-in" style={{ animationDelay: '150ms' }}>
        <InstrumentSelector 
          options={xylophoneTypes} 
          value={selectedXylophoneType} 
          onChange={setSelectedXylophoneType} 
        />
      </div>
      
      <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Xylophone xylophoneType={selectedXylophoneType} />
      </div>
    </InstrumentPageWrapper>
  );
}; 

export default XylophonePage;
