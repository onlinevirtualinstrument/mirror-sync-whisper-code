import React from 'react';
import { ViolinSettings } from './types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface ViolinControlPanelProps {
  settings: ViolinSettings;
  onSettingChange: (setting: keyof ViolinSettings, value: number) => void;
}

const defaultSettings: ViolinSettings = {
  bowPressure: 50,
  bowSpeed: 50,
  vibrato: 30,
  reverb: 20,
  stringTension: 60,
};

const descriptions: Record<keyof ViolinSettings, string> = {
  bowPressure: 'Controls the pressure applied to the strings (affects bass frequencies)',
  bowSpeed: 'Controls how fast the bow moves across strings (affects mid frequencies)',
  vibrato: 'Controls the intensity of finger vibrato',
  reverb: 'Controls the room ambience and echo (affects master volume)',
  stringTension: 'Controls the tightness of the strings (affects treble frequencies)',
};

const ViolinControlPanel: React.FC<ViolinControlPanelProps> = ({ settings, onSettingChange }) => {
  const handleReset = () => {
    Object.entries(defaultSettings).forEach(([key, value]) => {
      onSettingChange(key as keyof ViolinSettings, value);
    });
  };

  return (
    <div>

      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={key} className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </Label>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {value}%
              </span>
            </div>
            {/* <p className="text-xs text-muted-foreground mb-1">
              {descriptions[key as keyof ViolinSettings]}
            </p> */}
            <Slider
              id={key}
              min={0}
              max={100}
              step={1}
              value={[value]}
              onValueChange={(val) => onSettingChange(key as keyof ViolinSettings, val[0])}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleReset}
        >
          <Undo2 className="h-4 w-4" />
          Reset All Controls
        </Button>
      </div>
    </div>
  );
};

export default ViolinControlPanel;
