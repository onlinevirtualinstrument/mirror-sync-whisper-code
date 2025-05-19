
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume, Music, Settings } from 'lucide-react';

interface PianoControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

const PianoControls: React.FC<PianoControlsProps> = ({
  volume,
  onVolumeChange,
  theme,
  onThemeChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Volume size={18} />
        <Slider 
          className="w-24" 
          min={0} 
          max={100} 
          step={1}
          value={[volume]} 
          onValueChange={(values) => onVolumeChange(values[0])} 
        />
        <span className="text-xs w-8">{volume}%</span>
      </div>
    </div>
  );
};

export default PianoControls;
