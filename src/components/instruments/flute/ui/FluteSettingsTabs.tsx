import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wind, Music, Waves, Sliders } from 'lucide-react';
import { FluteSettings } from '../utils/fluteData';

interface FluteSettingsTabsProps {
  activeTab: 'breath' | 'tuning' | 'reverb' | 'vibrato';
  setActiveTab: (tab: 'breath' | 'tuning' | 'reverb' | 'vibrato') => void;
  settings: FluteSettings;
  intonationMode: string;
  handleBreathChange: (value: number[]) => void;
  handleTuningChange: (value: number[]) => void;
  handleReverbChange: (value: number[]) => void;
  handleVibratoIntensityChange: (value: number[]) => void;
  handleVibratoSpeedChange: (value: number[]) => void;
  handleIntonationModeChange: (value: string) => void;
  handleOverblowingChange: (checked: boolean) => void;
  handleMicInputChange: (checked: boolean) => void;
  handleTransposeChange: (checked: boolean) => void;
  handleDelayChange: (checked: boolean) => void;
  handleAutoVibratoChange: (checked: boolean) => void;
  handleDynamicRangeChange: (value: number[]) => void;
  resetToDefaults: () => void;
}

const FluteSettingsTabs: React.FC<FluteSettingsTabsProps> = ({
  activeTab,
  setActiveTab,
  settings,
  intonationMode,
  handleBreathChange,
  handleTuningChange,
  handleReverbChange,
  handleVibratoIntensityChange,
  handleVibratoSpeedChange,
  handleIntonationModeChange,
  handleOverblowingChange,
  handleMicInputChange,
  handleTransposeChange,
  handleDelayChange,
  handleAutoVibratoChange,
  handleDynamicRangeChange,
  resetToDefaults
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white/5 backdrop-blur-lg rounded-2xl shadow-subtle border border-white/20 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-display font-medium">Flute Settings</h3>
          <button 
            onClick={resetToDefaults}
            className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="flex justify-between items-center p-1 bg-secondary/50 rounded-lg">
          <button 
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-md transition-colors ${activeTab === 'breath' ? 'bg-white text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('breath')}
          >
            <Wind className="h-4 w-4" />
            <span className="text-xs">Breath</span>
          </button>
          
          <button 
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-md transition-colors ${activeTab === 'tuning' ? 'bg-white text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('tuning')}
          >
            <Music className="h-4 w-4" />
            <span className="text-xs">Tuning</span>
          </button>
          
          <button 
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-md transition-colors ${activeTab === 'reverb' ? 'bg-white text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('reverb')}
          >
            <Waves className="h-4 w-4" />
            <span className="text-xs">Reverb</span>
          </button>
          
          <button 
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-md transition-colors ${activeTab === 'vibrato' ? 'bg-white text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('vibrato')}
          >
            <Sliders className="h-4 w-4" />
            <span className="text-xs">Vibrato</span>
          </button>
        </div>
        
        <div className="p-3">
          {activeTab === 'breath' && (
            <div className="animate-fade-in">
              <div className="mb-2">
                <label className="text-sm text-muted-foreground">Breath Sensitivity</label>
                <div className="flex justify-between text-xs">
                  <span>Soft</span>
                  <span>Strong</span>
                </div>
              </div>
              <Slider
                id="breath-sensitivity"
                min={1}
                max={10}
                step={0.1}
                value={[settings.breathSensitivity]}
                onValueChange={handleBreathChange}
                className="my-4"
              />
              
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm">Use Microphone Input</span>
                    <span className="text-xs text-muted-foreground">Control with your voice or breath</span>
                  </div>
                  <Switch
                    id="mic-input"
                    checked={settings.useMicrophone}
                    onCheckedChange={handleMicInputChange}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm">Allow Overblowing</span>
                    <span className="text-xs text-muted-foreground">Enable advanced flute techniques</span>
                  </div>
                  <Switch
                    id="allow-overblowing"
                    checked={settings.allowOverblowing}
                    onCheckedChange={handleOverblowingChange}
                  />
                </div>
                
                <div className="mt-2">
                  <label className="text-sm text-muted-foreground">Dynamic Range</label>
                  <div className="flex justify-between text-xs">
                    <span>Narrow</span>
                    <span>Wide</span>
                  </div>
                  <Slider
                    id="dynamic-range"
                    min={1}
                    max={10}
                    step={0.1}
                    value={[settings.dynamicRange || 7]}
                    onValueChange={handleDynamicRangeChange}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tuning' && (
            <div className="animate-fade-in">
              <div className="mb-2">
                <label className="text-sm text-muted-foreground">Fine Tuning</label>
                <div className="flex justify-between text-xs">
                  <span>-50 cents</span>
                  <span>+50 cents</span>
                </div>
              </div>
              <Slider
                id="tuning"
                min={-50}
                max={50}
                step={1}
                value={[settings.tuning]}
                onValueChange={handleTuningChange}
                className="my-4"
              />
              
              <div className="mt-4">
                <label className="block text-sm mb-2">Intonation Mode</label>
                <RadioGroup 
                  value={intonationMode} 
                  onValueChange={handleIntonationModeChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equal" id="equal" />
                    <Label htmlFor="equal" className="text-sm">Equal Temperament</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="just" id="just" />
                    <Label htmlFor="just" className="text-sm">Just Intonation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pythagorean" id="pythagorean" />
                    <Label htmlFor="pythagorean" className="text-sm">Pythagorean</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">Transpose Mode</span>
                  <span className="text-xs text-muted-foreground">Shift pitch to different keys</span>
                </div>
                <Switch
                  id="transpose"
                  checked={settings.transpose}
                  onCheckedChange={handleTransposeChange}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'reverb' && (
            <div className="animate-fade-in">
              <div className="mb-2">
                <label className="text-sm text-muted-foreground">Reverb Amount</label>
                <div className="flex justify-between text-xs">
                  <span>Dry</span>
                  <span>Wet</span>
                </div>
              </div>
              <Slider
                id="reverb"
                min={0}
                max={10}
                step={0.1}
                value={[settings.reverb]}
                onValueChange={handleReverbChange}
                className="my-4"
              />
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">Delay Effect</span>
                  <span className="text-xs text-muted-foreground">Add echo to your sound</span>
                </div>
                <Switch
                  id="delay"
                  checked={settings.delay}
                  onCheckedChange={handleDelayChange}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'vibrato' && (
            <div className="animate-fade-in">
              <div className="mb-2">
                <label className="text-sm text-muted-foreground">Vibrato Intensity</label>
                <div className="flex justify-between text-xs">
                  <span>Subtle</span>
                  <span>Strong</span>
                </div>
              </div>
              <Slider
                id="vibrato-intensity"
                min={0}
                max={10}
                step={0.1}
                value={[settings.vibrato.intensity]}
                onValueChange={handleVibratoIntensityChange}
                className="my-4"
              />
              
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">Vibrato Speed</label>
                <div className="flex justify-between text-xs">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
              <Slider
                id="vibrato-speed"
                min={0}
                max={10}
                step={0.1}
                value={[settings.vibrato.speed]}
                onValueChange={handleVibratoSpeedChange}
                className="my-4"
              />
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">Auto Vibrato</span>
                  <span className="text-xs text-muted-foreground">Apply vibrato automatically</span>
                </div>
                <Switch
                  id="auto-vibrato"
                  checked={settings.autoVibrato}
                  onCheckedChange={handleAutoVibratoChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FluteSettingsTabs;
