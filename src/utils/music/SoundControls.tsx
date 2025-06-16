import { useState } from 'react';
import { Volume2, VolumeX, Music, Repeat } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

export interface SoundControlsProps {
  volume?: number;
  setVolume?: (volume: number) => void;
  isMuted?: boolean;
  setIsMuted?: (isMuted: boolean) => void;
  reverbLevel?: number;
  setReverbLevel?: (level: number) => void;
  toneQuality?: number;
  setToneQuality?: (quality: number) => void;
  stringTension?: number;
  setStringTension?: (tension: number) => void;
  pickPosition?: number;
  setPickPosition?: (position: number) => void;
  breathIntensity?: number;
  setBreathIntensity?: (tension: number) => void;
  toneColor?: number;
  setToneColor?: (position: number) => void;
  reverbAmount?: number;
  setReverbAmount?: (tension: number) => void;
  stickHardness?: number;
  setStickHardness?: (position: number) => void;
  stringBrightness?: number;
  setStringBrightness?: (brightness: number) => void;
  resonance?: number;
  setResonance?: (resonance: number) => void;
  sensitivity?: number;
  setSensitivity?: (sensitivity: number) => void;
}

type ControlKey = keyof SoundControlsProps;

const SoundControls = ({
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  reverbLevel = 0.3,
  setReverbLevel,
  toneQuality = 0.5,
  setToneQuality,
  stringTension = 0.5,
  setStringTension,
  pickPosition = 0.5,
  setPickPosition,
  breathIntensity = 0.5,
  setBreathIntensity,
  toneColor = 0.5,
  setToneColor,
  reverbAmount = 0.5,
  setReverbAmount,
  stickHardness = 0.5,
  setStickHardness,
  stringBrightness = 0.5,
  setStringBrightness,
  resonance = 0.5,
  setResonance,
  sensitivity = 0.5,
  setSensitivity
}: SoundControlsProps) => {
  const [openControl, setOpenControl] = useState<ControlKey | null>(null);

  const toggleMute = () => setIsMuted?.(!isMuted);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume?.(newVolume[0]);
    if (newVolume[0] > 0 && isMuted) setIsMuted?.(false);
  };

  const toggleControl = (control: ControlKey) => {
    setOpenControl(prev => (prev === control ? null : control));
  };

  const controlDefs: {
    key: ControlKey;
    label: string;
    icon: React.ReactNode;
    value: number;
    setValue?: (value: number) => void;
    disabled?: boolean;
  }[] = [
      { key: "volume", label: "Volume", icon: isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />, value: volume ?? 0.5, setValue: setVolume, disabled: isMuted },
      { key: "reverbLevel", label: "Reverb", icon: <Repeat size={18} />, value: reverbLevel, setValue: setReverbLevel, disabled: isMuted },
      { key: "toneQuality", label: "Tone", icon: <Music size={18} />, value: toneQuality, setValue: setToneQuality, disabled: isMuted },
      { key: "stringTension", label: "String Tension", icon: <span>🔧</span>, value: stringTension, setValue: setStringTension },
      { key: "pickPosition", label: "Pick Position", icon: <span>🎸</span>, value: pickPosition, setValue: setPickPosition },
      { key: "breathIntensity", label: "Breath Intensity", icon: <Music size={18} />, value: breathIntensity, setValue: setBreathIntensity },
      { key: "toneColor", label: "Tone Color", icon: <Music size={18} />, value: toneColor, setValue: setToneColor },
      { key: "reverbAmount", label: "Reverb Amount", icon: <Music size={18} />, value: reverbAmount, setValue: setReverbAmount },
      { key: "stickHardness", label: "Stick Hardness", icon: <Music size={18} />, value: stickHardness, setValue: setStickHardness },
      { key: "stringBrightness", label: "String Brightness", icon: <span>💡</span>, value: stringBrightness, setValue: setStringBrightness },
      { key: "resonance", label: "Resonance", icon: <span>🎶</span>, value: resonance, setValue: setResonance },
      { key: "sensitivity", label: "Sensitivity", icon: <span>🧠</span>, value: sensitivity, setValue: setSensitivity }
    ];

  const visibleControls = controlDefs.filter(c => typeof c.setValue === 'function');

  return (
    <div className="w-full mx-auto bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
      <div className="flex flex-row flex-nowrap justify-center gap-4 overflow-x-auto px-2 w-full">
        {visibleControls.map((control) => (
          <div key={control.key} className="w-40 text-center flex flex-col items-center justify-between transition-all duration-300">
            <button
              onClick={() => toggleControl(control.key)}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label={`Toggle ${control.label}`}
            >
              {control.icon}
            </button>
            <div className="text-xs mt-1">{control.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visibleControls.map((control) => (
          openControl === control.key && (
            <div key={control.key} className="flex items-center gap-4 w-full max-w-3xl mx-auto">
              <label className="w-32 text-sm text-right font-medium text-muted-foreground">
                {control.label}
              </label>
              <Slider
                value={[control.value]}
                max={1}
                step={0.01}
                onValueChange={(val) => control.setValue?.(val[0])}
                disabled={control.disabled}
                className={control.disabled ? "opacity-50 w-full" : "w-full"}
              />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round((control.value ?? 0) * 100)}%
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default SoundControls;
