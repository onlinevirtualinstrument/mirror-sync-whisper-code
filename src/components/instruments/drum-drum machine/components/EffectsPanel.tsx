
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import EffectSlider from './effects/EffectSlider';
import EffectToggle from './effects/EffectToggle';
import { Volume2, Zap } from 'lucide-react';
import { AudioEffects } from '../hooks/useAudioEffects';

interface EffectsPanelProps {
  effects: AudioEffects;
  onEffectChange: (effect: string, value: number) => void;
  onEffectToggle: (effect: string, enabled: boolean) => void;
}

const EffectsPanel = ({ effects, onEffectChange, onEffectToggle }: EffectsPanelProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Audio Effects</h3>
      
      <Tabs defaultValue="eq" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eq">EQ</TabsTrigger>
          <TabsTrigger value="fx">Effects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eq" className="space-y-4 mt-4">
          <EffectSlider
            label="Low"
            value={effects.eq.low}
            min={-12}
            max={12}
            step={0.5}
            unit="dB"
            onChange={(value) => onEffectChange('eq-low', value)}
          />
          <EffectSlider
            label="Mid"
            value={effects.eq.mid}
            min={-12}
            max={12}
            step={0.5}
            unit="dB"
            onChange={(value) => onEffectChange('eq-mid', value)}
          />
          <EffectSlider
            label="High"
            value={effects.eq.high}
            min={-12}
            max={12}
            step={0.5}
            unit="dB"
            onChange={(value) => onEffectChange('eq-high', value)}
          />
        </TabsContent>
        
        <TabsContent value="fx" className="space-y-4 mt-4">
          <EffectToggle
            label="Reverb"
            Icon={Volume2}
            pressed={false}
            onPressedChange={() => onEffectToggle('reverb', true)}
          />
          <EffectToggle
            label="Distortion"
            Icon={Zap}
            pressed={false}
            onPressedChange={() => onEffectToggle('distortion', true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EffectsPanel;
