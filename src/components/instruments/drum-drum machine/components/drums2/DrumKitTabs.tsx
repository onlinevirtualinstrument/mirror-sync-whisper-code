
import { useMemo, useState, useRef } from 'react';
import { drumKits } from '../../data/drumKits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, LayoutPanelTop } from 'lucide-react';
import PatternSequencer from '../DrumMachine2/PatternSequencer';
import DrumPadGrid from './DrumPadGrid';
import DrumKitHeader from './DrumKitHeader';
import { Card, CardContent } from '@/components/ui/card';
import { AudioEffects } from '../../hooks/useAudioEffects';
import { DrumKitKeyboardHandler } from './DrumKitKeyboardHandler';
import Controls from './Controls';
import EffectsPanel from './common-DrumMachine/EffectsPanel';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface DrumKitTabsProps {
  selectedKit: string;
  onKitChange: (kitId: string) => void;
  gridLayout: '2x2' | '3x3';
  isAnimating: boolean;
  effects: AudioEffects;
  onPlayPad: (pad: any) => void;
  onGridChange: (grid: '2x2' | '3x3') => void;
  onEffectChange: (effect: string, value: number) => void;
  onEffectToggle: (effect: string, enabled: boolean) => void;
}

const DrumKitTabs = ({
  selectedKit,
  onKitChange,
  gridLayout,
  isAnimating,
  effects,
  onPlayPad,
  onGridChange,
  onEffectChange,
  onEffectToggle
}: DrumKitTabsProps) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentKit = useMemo(() => drumKits[selectedKit], [selectedKit]);

  const visiblePads = useMemo(() => {
    switch (gridLayout) {
      case '2x2': return currentKit.pads.slice(0, 4);
      case '3x3': return currentKit.pads.slice(0, 9);
      default: return currentKit.pads.slice(0, 9);
    }
  }, [currentKit.pads, gridLayout]);

  return (
    <>
      <DrumKitKeyboardHandler
        pads={visiblePads}
        onKeyPress={onPlayPad}
        enabled={true}
      />

      <Tabs defaultValue="pads">
        <TabsList className="mb-4">
          <TabsTrigger value="pads" className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            Drum Pads
          </TabsTrigger>
          <TabsTrigger value="sequencer" className="flex items-center gap-1">
            <LayoutPanelTop className="h-4 w-4" />
            Pattern Sequencer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pads">
          <Card className="mb-8 overflow-hidden bg-opacity-90 backdrop-blur-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">

            <div className="px-6 mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Row 1: DrumKitHeader & EffectsPanel (always together on mobile) */}
              <div className="flex justify-between ">
                <DrumKitHeader
                  kitName={currentKit.name}
                  selectedKit={selectedKit}
                  onKitChange={onKitChange}
                />
                <EffectsPanel
                  onEffectChange={onEffectChange}
                  onEffectToggle={onEffectToggle}
                />
              </div>

              {/* Row 2 (mobile) / Column 3 (desktop): Controls */}
              <div className="flex justify-between gap-8">
                <Controls onGridChange={onGridChange} />
               <p className='mr-2'>
                  <strong onClick={() => toggleFullscreen(containerRef.current)} className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                    ⛶ Zoom
                  </strong>
                </p>
              </div>
               <style>{`
                        @media (min-width: 768px) {
                          .landscape-warning {
                            display: none;
                          }
                        }
                      `}</style>
            </div>


            <CardContent className={`transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : ''}`}>
             <FullscreenWrapper ref={containerRef} instrumentName="drums">
              <div >
              <DrumPadGrid
                pads={visiblePads}
                gridLayout={gridLayout}
                effects={effects}
                onPlay={onPlayPad} 
              />
              </div>
              </FullscreenWrapper>

              {/* <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Click the pads or press the corresponding keys to play
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequencer">
          <PatternSequencer
            selectedKit={selectedKit}
            onPlayPattern={onPlayPad}
            onEffectChange={onEffectChange}
            onEffectToggle={onEffectToggle}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default DrumKitTabs;
