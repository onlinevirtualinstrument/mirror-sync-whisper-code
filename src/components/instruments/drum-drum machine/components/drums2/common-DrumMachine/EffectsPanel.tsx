
import { useState } from 'react';
import { 
  SlidersHorizontal,
  BarChart3 
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import EffectSlider from './effects/EffectSlider'; 

interface EffectsPanelProps {
  onEffectChange: (effect: string, value: number) => void;
  onEffectToggle: (effect: string, enabled: boolean) => void;
}

const EffectsPanel = ({ onEffectChange }: EffectsPanelProps) => {
  const [effects, setEffects] = useState({
    eq: { low: 0, mid: 0, high: 0 }
  });
  
  const handleEffectChange = (effect: string, value: number) => {
    setEffects(prev => {
      if (effect === 'eq-low' || effect === 'eq-mid' || effect === 'eq-high') {
        const [_, band] = effect.split('-');
        return {
          ...prev,
          eq: {
            ...prev.eq,
            [band]: value
          }
        };
      }
      
      return prev;
    });
    
    onEffectChange(effect, value);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="flex items-center">
          <SlidersHorizontal className="h-4 w-4" />
          EQ Controls
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4" />
          <h4 className="text-sm font-medium">3-Band Equalizer</h4>
        </div>
        <div className="space-y-4">
          <EffectSlider 
            label="Bass (60-200Hz)"
            value={effects.eq.low}
            min={-12}
            max={12}
            step={1}
            unit="dB"
            onChange={(val) => handleEffectChange('eq-low', val)}
          />
          <EffectSlider 
            label="Mid (200Hz-5kHz)"
            value={effects.eq.mid}
            min={-12}
            max={12}
            step={1}
            unit="dB"
            onChange={(val) => handleEffectChange('eq-mid', val)}
          />
          <EffectSlider 
            label="Treble (5kHz+)"
            value={effects.eq.high}
            min={-12}
            max={12}
            step={1}
            unit="dB"
            onChange={(val) => handleEffectChange('eq-high', val)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EffectsPanel;
