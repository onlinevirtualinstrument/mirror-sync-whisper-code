
import { useMemo, useState } from 'react';
import { drumKits } from '@/data/drumKits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Music, LayoutPanelTop } from 'lucide-react';
import PatternSequencer from './PatternSequencer';
import DrumPadGrid from './DrumPadGrid';
import DrumKitHeader from './DrumKitHeader';
import { Card, CardContent } from './ui/card';
import { AudioEffects } from '@/hooks/useAudioEffects';
import { DrumKitKeyboardHandler } from './drum-kit/DrumKitKeyboardHandler';
import Controls from './Controls';
import EffectsPanel from './EffectsPanel';

interface DrumKitTabsProps {
  selectedKit: string;
  onKitChange: (kitId: string) => void;
  gridLayout: '2x2' | '3x3' | '4x4';
  isAnimating: boolean;
  effects: AudioEffects;
  onPlayPad: (pad: any) => void;
  onGridChange: (grid: '2x2' | '3x3' | '4x4') => void;
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
  const currentKit = useMemo(() => drumKits[selectedKit], [selectedKit]);
  
  const visiblePads = useMemo(() => {
    switch (gridLayout) {
      case '2x2': return currentKit.pads.slice(0, 4);
      case '3x3': return currentKit.pads.slice(0, 9);
      case '4x4': return currentKit.pads;
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
            <DrumKitHeader 
              kitName={currentKit.name} 
              selectedKit={selectedKit}
              onKitChange={onKitChange}
            />
            
            {/* Controls and EQ for Drum Pads */}
            <div className="px-6 pb-4 flex flex-wrap gap-2 items-center">
              <Controls onGridChange={onGridChange} />
              <EffectsPanel
                onEffectChange={onEffectChange}
                onEffectToggle={onEffectToggle}
              />
            </div>
            
            <CardContent className={`px-6 pb-6 transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : ''}`}>
              <DrumPadGrid 
                pads={visiblePads}
                gridLayout={gridLayout}
                effects={effects}
                onPlay={onPlayPad}
              />
              
              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Click the pads or press the corresponding keys to play
              </div>
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
