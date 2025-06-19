
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SOUND_TYPES } from './PianoNotes';

interface PianoSettingsProps {
  volume: number;
  setVolume: (value: number) => void;
  soundType: string;
  setSoundType: (value: string) => void;
  metronomeEnabled: boolean;
  setMetronomeEnabled: (value: boolean) => void;
  metronomeSpeed: number;
  setMetronomeSpeed: (value: number) => void;
  showKeyboardShortcuts: boolean;
  setShowKeyboardShortcuts: (value: boolean) => void;
  showBlackCord: boolean;
  setShowBlackCord: (value: boolean) => void;
}

const PianoSettings: React.FC<PianoSettingsProps> = ({
  volume,
  setVolume,
  soundType,
  setSoundType,
  metronomeEnabled,
  setMetronomeEnabled,
  metronomeSpeed,
  setMetronomeSpeed,
  showKeyboardShortcuts,
  setShowKeyboardShortcuts,
  showBlackCord,
  setShowBlackCord
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3">Visual Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm">Show Keyboard Shortcuts</label>
            <Switch 
              checked={showKeyboardShortcuts} 
              onCheckedChange={setShowKeyboardShortcuts} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-1">
              Show Black Cord
            </label>
            <Switch 
              checked={showBlackCord} 
              onCheckedChange={setShowBlackCord} 
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3">Sound Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm">Sound Type</label>
            <Select value={soundType} onValueChange={setSoundType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Piano Type" />
              </SelectTrigger>
              <SelectContent>
                {SOUND_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">Volume</label>
            <div className="flex items-center gap-2">
              <Slider 
                className="w-32" 
                value={[volume]} 
                onValueChange={values => setVolume(values[0])} 
                min={0} 
                max={100} 
                step={1}
              />
              <span className="text-xs w-8">{volume}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">Metronome</label>
            <Switch 
              checked={metronomeEnabled} 
              onCheckedChange={setMetronomeEnabled} 
            />
          </div>
          
          {metronomeEnabled && (
            <div className="flex items-center justify-between">
              <label className="text-sm">Tempo (BPM)</label>
              <div className="flex items-center gap-2">
                <Slider 
                  className="w-32" 
                  value={[metronomeSpeed]} 
                  onValueChange={values => setMetronomeSpeed(values[0])} 
                  min={40} 
                  max={240} 
                  step={1}
                />
                <span className="text-xs w-10">{metronomeSpeed}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PianoSettings;
