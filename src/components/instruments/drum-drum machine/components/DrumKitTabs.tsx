
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { drumKits } from '../data/drumKits';
import DrumKitHeader from './DrumKitHeader';
import DrumPadGrid from './DrumPadGrid';
import Controls from './Controls';
import EffectsPanel from './EffectsPanel';
import { useAudioEffects, AudioEffects } from '../hooks/useAudioEffects';
import { DrumPad } from '../data/drumKits';

interface DrumKitTabsProps {
  selectedKit: string;
  onKitChange: (kitId: string) => void;
  gridLayout: '2x2' | '3x3' | '4x4';
  isAnimating: boolean;
  effects: AudioEffects;
  onPlayPad: (pad: DrumPad) => void;
  onGridChange: (layout: '2x2' | '3x3' | '4x4') => void;
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
  const kit = drumKits[selectedKit];
  
  if (!kit) {
    return <div>Kit not found</div>;
  }

  return (
    <Tabs defaultValue="pads" className="w-full">
      <DrumKitHeader 
        kitName={kit.name}
        selectedKit={selectedKit}
        onKitChange={onKitChange}
      />
      
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pads">Drum Pads</TabsTrigger>
        <TabsTrigger value="effects">Effects</TabsTrigger>
        <TabsTrigger value="controls">Controls</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pads" className="space-y-4">
        <DrumPadGrid 
          pads={kit.pads}
          gridLayout={gridLayout}
          effects={effects}
          onPlay={onPlayPad}
        />
      </TabsContent>
      
      <TabsContent value="effects" className="space-y-4">
        <EffectsPanel 
          effects={effects}
          onEffectChange={onEffectChange}
          onEffectToggle={onEffectToggle}
        />
      </TabsContent>
      
      <TabsContent value="controls" className="space-y-4">
        <Controls 
          gridLayout={gridLayout}
          onGridChange={onGridChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DrumKitTabs;
