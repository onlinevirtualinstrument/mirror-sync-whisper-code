
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface EffectSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  unit?: string;
  onChange: (value: number) => void;
}

const EffectSlider = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  disabled = false, 
  unit = '%',
  onChange 
}: EffectSliderProps) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs">
          {value > 0 && unit === 'dB' ? '+' : ''}
          {value}{unit}
        </span>
      </div>
      <Slider
        disabled={disabled}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(val) => onChange(val[0])}
      />
    </div>
  );
};

export default EffectSlider;
