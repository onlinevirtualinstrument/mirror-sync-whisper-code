
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PianoAdvancedProps {
  currentOctave: number;
  setCurrentOctave: (value: number) => void;
}

const PianoAdvanced: React.FC<PianoAdvancedProps> = ({
  currentOctave,
  setCurrentOctave
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3">Advanced Settings</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Starting Octave</label>
              <Select 
                value={currentOctave.toString()} 
                onValueChange={(val) => setCurrentOctave(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select octave" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(octave => (
                    <SelectItem key={octave} value={octave.toString()}>
                      Octave {octave}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recording Quality</label>
              <Select defaultValue="high">
                <SelectTrigger>
                  <SelectValue placeholder="Recording Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (16kHz)</SelectItem>
                  <SelectItem value="medium">Medium (32kHz)</SelectItem>
                  <SelectItem value="high">High (44.1kHz)</SelectItem>
                  <SelectItem value="studio">Studio (48kHz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">MIDI Settings</label>
            <div className="p-3 border rounded-md bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Enable MIDI Input</span>
                <Switch />
              </div>
              <p className="text-xs text-gray-500">
                Connect an external MIDI keyboard to play. Compatible with most USB MIDI devices.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Performance</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">High Quality Sound Engine</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Background Animations</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Advanced Effects (Reverb, Delay)</span>
                <Switch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoAdvanced;
