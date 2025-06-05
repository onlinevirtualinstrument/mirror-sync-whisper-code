
import React, { useState } from 'react';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Paintbrush, RefreshCw } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

interface DrumCustomizerProps {
  id: string;
  name: string;
  color: string;
  onUpdateDrum: (id: string, updates: Partial<{
    name: string;
    color: string;
    glowColor: string;
    size: number;
  }>) => void;
}

const DrumCustomizer = ({ id, name, color, onUpdateDrum }: DrumCustomizerProps) => {
  const [drumName, setDrumName] = useState(name);
  const [drumColor, setDrumColor] = useState(color);
  const [drumSize, setDrumSize] = useState(100); // percentage
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  const handleSave = () => {
    onUpdateDrum(id, {
      name: drumName,
      color: drumColor,
      size: drumSize / 100, // Convert to multiplier
    });
  };
  
  const handleRevert = () => {
    setDrumName(name);
    setDrumColor(color);
    setDrumSize(100);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 px-2 py-1 h-auto text-xs"
        >
          <Paintbrush className="h-3 w-3" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Drum: {name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="drum-name">Name</Label>
            <Input 
              id="drum-name" 
              value={drumName}
              onChange={(e) => setDrumName(e.target.value)}
              placeholder="Enter drum name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Color</Label>
            <div 
              className="h-10 w-full rounded-md border cursor-pointer"
              style={{ backgroundColor: drumColor }}
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            />
            
            {isColorPickerOpen && (
              <div className="mt-2">
                <HexColorPicker
                  color={drumColor}
                  onChange={setDrumColor}
                />
                <div className="mt-2">
                  <HexColorInput 
                    className="w-full rounded-md border px-3 py-2" 
                    color={drumColor} 
                    onChange={setDrumColor}
                    prefixed
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="drum-size">Size</Label>
              <span className="text-sm text-slate-500">{drumSize}%</span>
            </div>
            <Slider
              id="drum-size"
              value={[drumSize]}
              min={50}
              max={150}
              step={5}
              onValueChange={(value) => setDrumSize(value[0])}
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline"
              onClick={handleRevert}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrumCustomizer;
