import { useState } from 'react';
import { Volume2, VolumeX, Music, Repeat } from 'lucide-react';
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
  const [openControl, setOpenControl] = useState<null | "volume" | "reverb" | "tone">(null);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleControl = (control: "volume" | "reverb" | "tone") => {
    setOpenControl(prev => (prev === control ? null : control));
  };

  return (
    <div className="w-full mx-auto bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
      <div className="flex flex-wrap justify-center gap-6">

        {/* Volume */}
        <div className="text-center">
          <button
            onClick={() => toggleControl("volume")}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Toggle Volume"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="text-xs mt-1">Volume</div>
          {openControl === "volume" && (
            <div className="mt-2 w-32 md:w-48">
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                disabled={isMuted}
                className={isMuted ? "opacity-50" : ""}
              />
            </div>
          )}
        </div>

        {/* Reverb */}
        {setReverbLevel && (
          <div className="text-center">
            <button
              onClick={() => toggleControl("reverb")}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label="Toggle Reverb"
            >
              <Repeat size={18} />
            </button>
            <div className="text-xs mt-1">Reverb</div>
            {openControl === "reverb" && (
              <div className="mt-2 w-32 md:w-48">
                <Slider
                  value={[reverbLevel]}
                  max={1}
                  step={0.01}
                  onValueChange={(newValue) => setReverbLevel(newValue[0])}
                  disabled={isMuted}
                  className={isMuted ? "opacity-50" : ""}
                />
              </div>
            )}
          </div>
        )}

        {/* Tone */}
        {setToneQuality && (
          <div className="text-center">
            <button
              onClick={() => toggleControl("tone")}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label="Toggle Tone"
            >
              <Music size={18} />
            </button>
            <div className="text-xs mt-1">Tone</div>
            {openControl === "tone" && (
              <div className="mt-2 w-32 md:w-48">
                <Slider
                  value={[toneQuality]}
                  max={1}
                  step={0.01}
                  onValueChange={(newValue) => setToneQuality(newValue[0])}
                  disabled={isMuted}
                  className={isMuted ? "opacity-50" : ""}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundControls;
