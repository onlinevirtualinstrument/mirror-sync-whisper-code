
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'; 

interface SoundSettingsProps {
  onClose: () => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ onClose }) => {
  const [volume, setVolume] = useState(80);
  const [equalizer, setEqualizer] = useState({
    bass: 50,
    mid: 50,
    treble: 50
  });
  
  // Load saved settings when component mounts
  useEffect(() => {
    const loadSettings = () => {
      const savedVolume = localStorage.getItem('violin-volume');
      const savedBass = localStorage.getItem('violin-eq-bass');
      const savedMid = localStorage.getItem('violin-eq-mid');
      const savedTreble = localStorage.getItem('violin-eq-treble');
      
      if (savedVolume !== null) setVolume(parseInt(savedVolume));
      
      const newEqualizer = { ...equalizer };
      if (savedBass !== null) newEqualizer.bass = parseInt(savedBass);
      if (savedMid !== null) newEqualizer.mid = parseInt(savedMid);
      if (savedTreble !== null) newEqualizer.treble = parseInt(savedTreble);
      setEqualizer(newEqualizer);
    };
    
    loadSettings();
  }, []);
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem('violin-volume', newVolume.toString());
    
    // Dispatch custom event to notify audio engine about volume change
    const event = new CustomEvent('violin-volume-changed', { 
      detail: { volume: newVolume / 100 } // Convert percentage to 0-1 range for Web Audio API
    });
    document.dispatchEvent(event);
    
    toast.success(`Volume set to ${newVolume}%`);
  };
  
  const handleEqChange = (param: keyof typeof equalizer, value: number[]) => {
    const newValue = value[0];
    setEqualizer(prev => ({
      ...prev,
      [param]: newValue
    }));
    
    localStorage.setItem(`violin-eq-${param}`, newValue.toString());
    
    // Dispatch custom event for EQ changes
    const event = new CustomEvent('violin-eq-changed', { 
      detail: { 
        param, 
        value: newValue / 50 // normalize around 1.0 for EQ adjustments
      } 
    });
    document.dispatchEvent(event);
    
    toast.success(`${param.charAt(0).toUpperCase() + param.slice(1)} adjusted to ${newValue}%`);
  };
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Sound Settings</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="volume">Master Volume</Label>
            <span>{volume}%</span>
          </div>
          <Slider
            id="volume"
            min={0}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Equalizer</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="bass">Bass</Label>
                <span>{equalizer.bass}%</span>
              </div>
              <Slider
                id="bass"
                min={0}
                max={100}
                step={1}
                value={[equalizer.bass]}
                onValueChange={(value) => handleEqChange('bass', value)}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="mid">Mids</Label>
                <span>{equalizer.mid}%</span>
              </div>
              <Slider
                id="mid"
                min={0}
                max={100}
                step={1}
                value={[equalizer.mid]}
                onValueChange={(value) => handleEqChange('mid', value)}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="treble">Treble</Label>
                <span>{equalizer.treble}%</span>
              </div>
              <Slider
                id="treble"
                min={0}
                max={100}
                step={1}
                value={[equalizer.treble]}
                onValueChange={(value) => handleEqChange('treble', value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
