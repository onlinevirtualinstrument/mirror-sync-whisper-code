
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, Square } from 'lucide-react';
import { drumKits, DrumPad } from '../data/drumKits';

interface PatternSequencerProps {
  selectedKit?: string;
  onPlayPattern?: (pattern: boolean[][]) => void;
}

const PatternSequencer = ({ selectedKit = 'classic', onPlayPattern }: PatternSequencerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [pattern, setPattern] = useState<boolean[][]>([]);
  
  const kit = drumKits[selectedKit];
  const steps = 16;

  useEffect(() => {
    if (kit) {
      setPattern(kit.pads.map(() => new Array(steps).fill(false)));
    }
  }, [kit, steps]);

  const toggleStep = (padIndex: number, stepIndex: number) => {
    const newPattern = [...pattern];
    newPattern[padIndex][stepIndex] = !newPattern[padIndex][stepIndex];
    setPattern(newPattern);
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (onPlayPattern) {
      onPlayPattern(pattern);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  if (!kit) {
    return <div>Kit not found</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center gap-4">
        <Button onClick={handlePlay} variant={isPlaying ? "secondary" : "default"}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button onClick={handleStop} variant="outline">
          <Square className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm">BPM:</span>
          <Slider
            value={[bpm]}
            onValueChange={([value]) => setBpm(value)}
            min={60}
            max={180}
            className="w-24"
          />
          <span className="text-sm w-8">{bpm}</span>
        </div>
      </div>

      <div className="grid gap-2">
        {kit.pads.map((pad, padIndex) => (
          <div key={pad.id} className="flex items-center gap-2">
            <div className="w-16 text-xs font-medium truncate">{pad.name}</div>
            <div className="flex gap-1">
              {Array.from({ length: steps }, (_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(padIndex, stepIndex)}
                  className={`w-6 h-6 rounded border transition-colors ${
                    pattern[padIndex]?.[stepIndex]
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  } ${currentStep === stepIndex ? 'ring-2 ring-primary' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternSequencer;
