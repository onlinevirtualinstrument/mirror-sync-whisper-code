import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Clock, Shuffle, RotateCcw } from 'lucide-react';
import { drumKits, DrumPad as DrumPadType } from '../../data/drumKits';
import EffectsPanel from '../drums2/common-DrumMachine/EffectsPanel';
import DrumKitHeader from '../drums2/DrumKitHeader';

interface PatternSequencerProps {
  selectedKit: string; 
  onPlayPattern: (pad: DrumPadType) => void;
  onEffectChange: (effect: string, value: number) => void;
  onEffectToggle: (effect: string, enabled: boolean) => void;
}

const STEPS = 16;
const PRESETS = {
  rock: {
    name: 'Rock',
    pattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      'hihat-closed': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    }
  },
  funk: {
    name: 'Funk',
    pattern: {
      kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      'hihat-closed': [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1],
    }
  },
  latin: {
    name: 'Latin',
    pattern: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      snare: [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      'hihat-closed': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    }
  }
};

const PatternSequencer = ({ selectedKit, onPlayPattern, onEffectChange, onEffectToggle }: PatternSequencerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [pattern, setPattern] = useState<{[key: string]: number[]}>({});
  const [availablePads, setAvailablePads] = useState<DrumPadType[]>([]);
  const [swing, setSwing] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeRef = useRef<number>(0);
  const swingValueRef = useRef<number>(0);

  const [selectedKit2, setSelectedKit] = useState(selectedKit);
  
  // Keep swing value in sync
  useEffect(() => {
    swingValueRef.current = swing;
  }, [swing]);
  
  // Initialize pattern with zeroes for all pads in the kit
  useEffect(() => {
    const kit = drumKits[selectedKit2];
    setAvailablePads(kit.pads);
    
    const newPattern: {[key: string]: number[]} = {};
    kit.pads.forEach(pad => {
      if (!pattern[pad.id]) {
        newPattern[pad.id] = Array(STEPS).fill(0);
      } else {
        newPattern[pad.id] = [...pattern[pad.id]];
      }
    });
    setPattern(newPattern);
  }, [selectedKit2]);
  
  // Handle starting and stopping the pattern with consistent swing timing
  useEffect(() => {
    if (isPlaying) {
      const baseInterval = (60 / tempo) * 1000 / 4; // 16th notes in ms
      stepTimeRef.current = Date.now();
      
      const tick = () => {
        const now = Date.now();
        const elapsed = now - stepTimeRef.current;
        
        // Calculate next step interval with current swing value
        const currentSwing = swingValueRef.current;
        let nextInterval = baseInterval;
        
        // Apply swing to odd steps (off-beats)
        const nextStep = (currentStep + 1) % STEPS;
        if (nextStep % 2 === 1) {
          nextInterval += (currentSwing / 100) * baseInterval * 0.3;
        }
        
        if (elapsed >= nextInterval) {
          setCurrentStep(prev => {
            const step = (prev + 1) % STEPS;
            
            // Play sounds for this step
            availablePads.forEach(pad => {
              if (pattern[pad.id]?.[step]) {
                onPlayPattern(pad);
              }
            });
            
            return step;
          });
          
          stepTimeRef.current = now;
        }
      };
      
      intervalRef.current = setInterval(tick, 5); // High frequency for precision
      
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, currentStep, pattern, availablePads, onPlayPattern]);
  
  const toggleStep = (padId: string, step: number) => {
    setPattern(prev => ({
      ...prev,
      [padId]: prev[padId].map((val, i) => i === step ? (val ? 0 : 1) : val)
    }));
  };
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const stopPlayback = () => {
    setIsPlaying(false);
  };
  
  const clearPattern = () => {
    const newPattern = { ...pattern };
    Object.keys(newPattern).forEach(padId => {
      newPattern[padId] = Array(STEPS).fill(0);
    });
    setPattern(newPattern);
  };
  
  const randomizePattern = () => {
    const newPattern = { ...pattern };
    Object.keys(newPattern).forEach(padId => {
      const probability = padId.includes('kick') ? 0.3 : 
                         padId.includes('snare') ? 0.25 : 
                         padId.includes('hihat') ? 0.6 : 0.2;
      newPattern[padId] = Array(STEPS).fill(0).map(() => Math.random() < probability ? 1 : 0);
    });
    setPattern(newPattern);
  };
  
  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const preset = PRESETS[presetName];
    const newPattern = { ...pattern };
    
    Object.keys(newPattern).forEach(padId => {
      newPattern[padId] = Array(STEPS).fill(0);
    });
    
    Object.keys(preset.pattern).forEach(padId => {
      if (newPattern[padId]) {
        newPattern[padId] = [...preset.pattern[padId as keyof typeof preset.pattern]];
      }
    });
    
    setPattern(newPattern);
  };

  const currentKit = useMemo(() => drumKits[selectedKit], [selectedKit]);
  const handleKitChange = useCallback((kitId: string) => {
      console.log(`Kit changed to: ${kitId}`);
      setSelectedKit(kitId);
    }, []);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 ">
          <h3 className="font-medium">Pattern Sequencer</h3>
          <div className="text-xs mr-6 py-1 rounded bg-slate-100 dark:bg-slate-700">
            {tempo} BPM
          </div>
          {swing > 0 && (
            <div className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Swing: {swing}%
            </div>
          )}

          <div className='landscape-warning flex justify-between'>
            <DrumKitHeader
                  kitName={currentKit.name}
                  selectedKit={selectedKit2}
                  onKitChange={handleKitChange}
                />
          <EffectsPanel
            onEffectChange={onEffectChange}
            onEffectToggle={onEffectToggle}
          />
          </div>
        </div>
        
        <div className="ml-2 flex items-center space-x-2">
          
          <Button 
            size="icon" 
            variant={isPlaying ? "secondary" : "default"}
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {/* <Button 
            size="icon" 
            variant="outline"
            onClick={stopPlayback}
          >
            <Square className="h-4 w-4" />
          </Button> */}
          
          <Button 
            size="icon" 
            variant="outline"
            onClick={randomizePattern}
            title="Randomize"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="outline"
            onClick={clearPattern}
            title="Clear"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between landscape-warning2 mb-2">
                <DrumKitHeader
                  kitName={currentKit.name}
                  selectedKit={selectedKit2}
                  onKitChange={handleKitChange}
                />
                <EffectsPanel
                  onEffectChange={onEffectChange}
                  onEffectToggle={onEffectToggle}
                />
              </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Tempo: {tempo} BPM</span>
          </div>
          <Slider
            value={[tempo]}
            min={60}
            max={200}
            step={5}
            onValueChange={(value) => setTempo(value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Swing: {swing}%</span>
            <span className="text-xs text-slate-500">(Real-time)</span>
          </div>
          <Slider
            value={[swing]}
            min={0}
            max={50}
            step={5}
            onValueChange={(value) => setSwing(value[0])}
          />
        </div>
      </div>
      <style>{`
                        @media (max-width: 768px) {
                          .landscape-warning {
                            display: none;
                          }
                        }
                        @media (min-width: 768px) {
                          .landscape-warning2 {
                            display: none;
                          }
                        }
                      `}</style>
      
      <div className="overflow-x-auto">
        <table className="w-full my-4 min-w-[600px]">
          <thead>
            <tr>
              <th className="w-24 text-left text-sm font-medium sticky left-0 bg-white dark:bg-slate-800">Drum</th>
              {Array.from({ length: STEPS }).map((_, i) => (
                <th 
                  key={i} 
                  className={`w-8 text-center text-xs transition-colors ${
                    currentStep === i ? 'bg-primary/30 dark:bg-primary/40' : ''
                  } ${i % 4 === 0 ? 'border-l-2 border-slate-300' : ''}`}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availablePads.slice(0, 6).map((pad) => (
              <tr key={pad.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 px-1 text-sm sticky left-0 bg-white dark:bg-slate-800">
                  <div 
                    className="flex items-center h-6 gap-2"
                    style={{ color: pad.color }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: pad.color }}
                    ></div>
                    <span className="truncate text-xs">{pad.name}</span>
                  </div>
                </td>
                {pattern[pad.id]?.map((isActive, step) => (
                  <td 
                    key={step} 
                    className={`text-center transition-colors ${
                      currentStep === step ? 'bg-primary/30 dark:bg-primary/40' : ''
                    } ${step % 4 === 0 ? 'border-l-2 border-slate-300' : ''}`}
                  >
                    <button
                      className={`w-5 h-5 rounded-md m-1 transition-all ${
                        isActive 
                          ? 'opacity-100 shadow-md scale-110' 
                          : 'opacity-30 hover:opacity-60 hover:scale-105'
                      }`}
                      onClick={() => toggleStep(pad.id, step)}
                      style={{ 
                        backgroundColor: pad.color,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Quick Patterns</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <Button 
              key={key}
              variant="outline" 
              size="sm"
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternSequencer;
