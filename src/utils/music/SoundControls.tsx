
import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, FastForward, Rewind, Repeat } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

export interface SoundControlsProps {
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  reverbLevel?: number;
  setReverbLevel?: (level: number) => void;
  toneQuality?: number;
  setToneQuality?: (quality: number) => void;
}

const SoundControls = ({
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  reverbLevel = 0.3,
  setReverbLevel,
  toneQuality = 0.5,
  setToneQuality
}: SoundControlsProps) => {
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute} 
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-sm font-medium">Volume</span>
          </div>
          <div className="w-32 md:w-48">
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(newValue) => handleVolumeChange(newValue)}
              disabled={isMuted}
              className={isMuted ? "opacity-50" : ""}
            />
          </div>
        </div>

        {setReverbLevel && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Repeat size={18} />
              </div>
              <span className="text-sm font-medium">Reverb</span>
            </div>
            <div className="w-32 md:w-48">
              <Slider
                value={[reverbLevel]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setReverbLevel(newValue[0])}
                disabled={isMuted}
                className={isMuted ? "opacity-50" : ""}
              />
            </div>
          </div>
        )}

        {setToneQuality && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-2 rounded-full bg-primary/10">
                <Music size={16} />
              </div>
              <span className="text-sm font-medium">Tone</span>
            </div>
            <div className="w-32 md:w-48">
              <Slider
                value={[toneQuality]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setToneQuality(newValue[0])}
                disabled={isMuted}
                className={isMuted ? "opacity-50" : ""}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundControls;
