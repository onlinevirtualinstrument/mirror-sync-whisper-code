
import React, { useEffect } from 'react';
import { ViolinSettings } from './types';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

interface ViolinControlPanelProps {
  settings: ViolinSettings;
  onSettingChange: (setting: keyof ViolinSettings, value: number) => void;
}

const ViolinControlPanel: React.FC<ViolinControlPanelProps> = ({ settings, onSettingChange }) => {
  const controls = [
    {
      id: 'bowPressure',
      label: 'Bow Pressure',
      description: 'Controls the pressure applied to the strings (affects bass frequencies)',
      min: 0,
      max: 100,
      step: 1,
      value: settings.bowPressure
    },
    {
      id: 'bowSpeed',
      label: 'Bow Speed',
      description: 'Controls how fast the bow moves across strings (affects mid frequencies)',
      min: 0,
      max: 100,
      step: 1,
      value: settings.bowSpeed
    },
    {
      id: 'vibrato',
      label: 'Vibrato',
      description: 'Controls the intensity of finger vibrato',
      min: 0,
      max: 100,
      step: 1,
      value: settings.vibrato
    },
    {
      id: 'reverb',
      label: 'Reverb',
      description: 'Controls the room ambience and echo (affects master volume)',
      min: 0,
      max: 100,
      step: 1,
      value: settings.reverb
    },
    {
      id: 'stringTension',
      label: 'String Tension',
      description: 'Controls the tightness of the strings (affects treble frequencies)',
      min: 0,
      max: 100,
      step: 1,
      value: settings.stringTension
    }
  ];

  const handleSliderChange = (id: string, value: number) => {
    onSettingChange(id as keyof ViolinSettings, value);
  };

  const handleReset = () => {
    // Reset all settings to default values
    onSettingChange('bowPressure', 50);
    onSettingChange('bowSpeed', 50);
    onSettingChange('vibrato', 30);
    onSettingChange('reverb', 20);
    onSettingChange('stringTension', 60);
  };

  return (
    <div className="transition-all">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Violin Controls</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Adjust these parameters to customize your violin's sound
        </p>
      </div>

      <div className="space-y-6">
        {controls.map((control) => (
          <div key={control.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={control.id} className="text-sm font-medium">
                {control.label}
              </Label>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {control.value}%
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {control.description}
            </p>
            
            <Slider
              id={control.id}
              min={control.min}
              max={control.max}
              step={control.step}
              value={[control.value]}
              onValueChange={(value) => handleSliderChange(control.id, value[0])}
              className="w-full"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
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
