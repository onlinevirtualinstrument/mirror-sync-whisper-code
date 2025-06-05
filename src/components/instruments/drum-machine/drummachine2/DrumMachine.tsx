
import React, { useState, useEffect } from 'react';
import { useRoom } from '@/components/room/RoomContext';
import StandardInstrumentLayout from '@/components/instruments/common/StandardInstrumentLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square } from 'lucide-react';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

interface DrumPattern {
  id: string;
  name: string;
  steps: boolean[];
  sound: string;
  color: string;
}

const drumSounds: DrumPattern[] = [
  { id: 'kick', name: 'Kick', steps: new Array(16).fill(false), sound: 'C2', color: 'bg-red-500' },
  { id: 'snare', name: 'Snare', steps: new Array(16).fill(false), sound: 'D2', color: 'bg-blue-500' },
  { id: 'hihat', name: 'Hi-Hat', steps: new Array(16).fill(false), sound: 'F#2', color: 'bg-green-500' },
  { id: 'openhat', name: 'Open Hat', steps: new Array(16).fill(false), sound: 'A2', color: 'bg-yellow-500' },
];

const DrumMachine2: React.FC = () => {
  const [volume, setVolume] = useState(0.7);
  const [reverb, setReverb] = useState(0.3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patterns, setPatterns] = useState<DrumPattern[]>(drumSounds);
  const { broadcastInstrumentNote } = useRoom();

  const stepDuration = (60 / bpm / 4) * 1000; // milliseconds per step

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Play active patterns for current step
        patterns.forEach(pattern => {
          if (pattern.steps[nextStep]) {
            playInstrumentNote('drummachine', pattern.sound, 2, 200, volume);
            broadcastInstrumentNote({
              note: pattern.sound,
              instrument: 'drummachine',
              userId: 'current-user',
              userName: 'User'
            });
          }
        });
        
        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isPlaying, bpm, patterns, volume, broadcastInstrumentNote]);

  const toggleStep = (patternId: string, stepIndex: number) => {
    setPatterns(prev => prev.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, steps: pattern.steps.map((step, idx) => 
            idx === stepIndex ? !step : step
          )}
        : pattern
    ));
  };

  const playPattern = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPattern = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const clearPattern = () => {
    setPatterns(prev => prev.map(pattern => ({
      ...pattern,
      steps: new Array(16).fill(false)
    })));
  };

  return (
    <StandardInstrumentLayout
      title="Drum Machine - Design 2"
      volume={volume}
      reverb={reverb}
      isFullscreen={isFullscreen}
      onVolumeChange={setVolume}
      onReverbChange={setReverb}
      onFullscreenToggle={setIsFullscreen}
    >
      <div className="space-y-6 p-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-4 justify-center">
          <Button onClick={playPattern} variant={isPlaying ? "secondary" : "default"}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={stopPattern} variant="outline">
            <Square className="h-4 w-4" />
          </Button>
          <Button onClick={clearPattern} variant="outline">
            Clear
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
            <span className="text-sm w-12">{bpm}</span>
          </div>
        </div>

        {/* Pattern Grid */}
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="flex items-center gap-2">
              <div className={`w-20 text-xs font-medium text-center py-2 rounded ${pattern.color} text-white`}>
                {pattern.name}
              </div>
              <div className="flex gap-1">
                {pattern.steps.map((active, stepIndex) => (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(pattern.id, stepIndex)}
                    className={`
                      w-8 h-8 rounded border-2 transition-all duration-150
                      ${active 
                        ? `${pattern.color} border-white` 
                        : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                      }
                      ${currentStep === stepIndex ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center">
          <div className="flex gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-2 rounded ${
                  currentStep === i ? 'bg-yellow-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </StandardInstrumentLayout>
  );
};

export default DrumMachine2;
