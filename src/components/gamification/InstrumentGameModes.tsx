import React, { useState, useRef, useEffect } from 'react';
import { Music, Guitar, Volume2, Wind, Zap, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ParticleSystem from '@/components/effects/ParticleSystem';
import { cn } from '@/lib/utils';

interface GameModeProps {
  instrument?: string;
  onNoteHit: (timing?: 'perfect' | 'good' | 'miss', note?: string) => void;
  isActive: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Piano Tiles Game
const PianoTilesGame: React.FC<GameModeProps> = ({ onNoteHit, isActive, difficulty }) => {
  const [fallingTiles, setFallingTiles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const newTile = {
        id: Date.now(),
        lane: Math.floor(Math.random() * 4),
        position: 0,
        note: ['C', 'D', 'E', 'F'][Math.floor(Math.random() * 4)]
      };
      setFallingTiles(prev => [...prev, newTile]);
    }, difficulty === 'easy' ? 1500 : difficulty === 'medium' ? 1000 : 600);
    
    return () => clearInterval(interval);
  }, [isActive, difficulty]);

  const handleTileHit = (tile: any) => {
    const accuracy = Math.random() * 0.4 + 0.6; // 60-100%
    onNoteHit(accuracy > 0.8 ? 'perfect' : accuracy > 0.5 ? 'good' : 'miss', tile.note);
    setScore(prev => prev + Math.floor(accuracy * 100));
    setCombo(prev => prev + 1);
    setFallingTiles(prev => prev.filter(t => t.id !== tile.id));
  };

  return (
    <div className="relative h-96 bg-gradient-to-b from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
      <ParticleSystem
        width={400}
        height={400}
        enabled={isActive}
        maxParticles={combo > 5 ? 20 : 10}
      />
      
      {/* Lanes */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3].map(lane => (
          <div
            key={lane}
            className="flex-1 border-r border-white/20 relative cursor-pointer"
            onClick={() => {
              const tileInLane = fallingTiles.find(t => t.lane === lane && t.position > 80);
              if (tileInLane) handleTileHit(tileInLane);
            }}
          >
            {/* Hit Zone */}
            <div className="absolute bottom-0 w-full h-16 bg-primary/30 border-2 border-primary rounded-t-lg" />
            
            {/* Falling Tiles */}
            {fallingTiles
              .filter(tile => tile.lane === lane)
              .map(tile => (
                <div
                  key={tile.id}
                  className="absolute w-full h-12 bg-primary rounded shadow-lg flex items-center justify-center text-white font-bold animate-pulse"
                  style={{ 
                    top: `${tile.position}%`,
                    animation: 'linear infinite 3s'
                  }}
                >
                  {tile.note}
                </div>
              ))}
          </div>
        ))}
      </div>
      
      {/* Score Display */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge variant="default" className="bg-black/50 text-white">
          Score: {score}
        </Badge>
        {combo > 0 && (
          <Badge variant="secondary" className="bg-yellow-500/80 text-white">
            Combo: {combo}x
          </Badge>
        )}
      </div>
    </div>
  );
};

// Guitar Rhythm Game
const GuitarRhythmGame: React.FC<GameModeProps> = ({ onNoteHit, isActive, difficulty }) => {
  const [chordPattern, setChordPattern] = useState(['Em', 'G', 'D', 'C']);
  const [currentChord, setCurrentChord] = useState(0);
  const [strumPower, setStrumPower] = useState(0);
  
  const handleStrum = () => {
    const accuracy = strumPower / 100;
    onNoteHit(accuracy > 0.8 ? 'perfect' : accuracy > 0.5 ? 'good' : 'miss', chordPattern[currentChord]);
    setCurrentChord(prev => (prev + 1) % chordPattern.length);
    setStrumPower(0);
  };

  return (
    <div className="relative h-96 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
      <ParticleSystem
        width={400}
        height={400}
        enabled={strumPower > 80}
        maxParticles={15}
      />
      
      {/* Guitar Strings */}
      <div className="space-y-4 mb-8">
        {[0, 1, 2, 3, 4, 5].map(string => (
          <div
            key={string}
            className="h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full relative cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStrumPower(prev => Math.min(100, prev + 20))}
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
      
      {/* Chord Display */}
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-primary">
          {chordPattern[currentChord]}
        </div>
        <Progress value={strumPower} className="h-3" />
        <Button
          onClick={handleStrum}
          disabled={strumPower < 50}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Guitar className="h-4 w-4 mr-2" />
          Strum! ({strumPower}%)
        </Button>
      </div>
    </div>
  );
};

// Drum Beat Matching
const DrumBeatGame: React.FC<GameModeProps> = ({ onNoteHit, isActive, difficulty }) => {
  const [beatPattern, setBeatPattern] = useState([true, false, true, false]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [visualFeedback, setVisualFeedback] = useState<{[key: string]: boolean}>({});
  
  const drumPads = [
    { name: 'Kick', key: 'K', color: 'bg-red-500' },
    { name: 'Snare', key: 'S', color: 'bg-blue-500' },
    { name: 'Hi-Hat', key: 'H', color: 'bg-yellow-500' },
    { name: 'Crash', key: 'C', color: 'bg-green-500' }
  ];

  const hitDrum = (drumName: string) => {
    setVisualFeedback(prev => ({ ...prev, [drumName]: true }));
    setTimeout(() => {
      setVisualFeedback(prev => ({ ...prev, [drumName]: false }));
    }, 200);
    
    const accuracy = 0.8 + Math.random() * 0.2;
    onNoteHit(accuracy > 0.8 ? 'perfect' : accuracy > 0.5 ? 'good' : 'miss', drumName);
  };

  return (
    <div className="relative h-96 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg p-6">
      <ParticleSystem
        width={400}
        height={400}
        enabled={Object.values(visualFeedback).some(Boolean)}
        maxParticles={25}
      />
      
      {/* Drum Pads */}
      <div className="grid grid-cols-2 gap-4 h-full">
        {drumPads.map((drum) => (
          <button
            key={drum.name}
            onClick={() => hitDrum(drum.name)}
            className={cn(
              "rounded-full flex flex-col items-center justify-center text-white font-bold text-lg transition-all duration-200 hover:scale-105",
              drum.color,
              visualFeedback[drum.name] ? "scale-110 shadow-2xl" : "hover:shadow-lg"
            )}
          >
            <div className="h-8 w-8 mb-2 rounded-full bg-white/20 flex items-center justify-center">🥁</div>
            <span>{drum.name}</span>
            <span className="text-sm opacity-75">{drum.key}</span>
          </button>
        ))}
      </div>
      
      {/* Beat Pattern Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {beatPattern.map((beat, index) => (
            <div
              key={index}
              className={cn(
                "w-4 h-4 rounded-full",
                beat ? "bg-green-400" : "bg-gray-500",
                index === currentBeat ? "ring-2 ring-white" : ""
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Violin Bow Tracking
const ViolinBowGame: React.FC<GameModeProps> = ({ onNoteHit, isActive }) => {
  const [bowPosition, setBowPosition] = useState(50);
  const [pitchAccuracy, setPitchAccuracy] = useState(0);
  const [bowDirection, setBowDirection] = useState<'up' | 'down'>('down');
  
  return (
    <div className="relative h-96 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
      <ParticleSystem
        width={400}
        height={400}
        enabled={pitchAccuracy > 80}
        maxParticles={12}
      />
      
      {/* Violin Strings */}
      <div className="space-y-6">
        {['G', 'D', 'A', 'E'].map((string, index) => (
          <div key={string} className="relative">
            <div className="text-lg font-bold mb-2">{string} String</div>
            <div className="h-4 bg-gradient-to-r from-amber-200 to-amber-400 rounded-full relative">
              <div
                className="absolute h-6 w-2 bg-primary rounded-full -top-1 transition-all duration-300"
                style={{ left: `${bowPosition}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Bow Control */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <span>Bow Position</span>
          <Badge variant={pitchAccuracy > 80 ? "default" : "secondary"}>
            Accuracy: {pitchAccuracy}%
          </Badge>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={bowPosition}
          onChange={(e) => {
            setBowPosition(Number(e.target.value));
            setPitchAccuracy(Math.random() * 40 + 60);
            onNoteHit('A', pitchAccuracy / 100);
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};

// Flute Breath Control
const FluteBreathGame: React.FC<GameModeProps> = ({ onNoteHit, isActive }) => {
  const [breathPower, setBreathPower] = useState(0);
  const [airFlow, setAirFlow] = useState(0);
  const [note, setNote] = useState('C');
  
  const breathIn = () => {
    setBreathPower(prev => Math.min(100, prev + 5));
    setAirFlow(breathPower);
    if (breathPower > 30) {
      onNoteHit(note, breathPower / 100);
    }
  };

  return (
    <div className="relative h-96 bg-gradient-to-t from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-6">
      <ParticleSystem
        width={400}
        height={400}
        enabled={breathPower > 50}
        maxParticles={8}
      />
      
      {/* Air Flow Visualization */}
      <div className="text-center space-y-6">
        <div className="text-2xl font-bold">🎵 {note} 🎵</div>
        
        {/* Breath Meter */}
        <div className="space-y-2">
          <div className="text-sm">Breath Power</div>
          <Progress value={breathPower} className="h-4" />
        </div>
        
        {/* Air Flow Animation */}
        <div className="h-32 flex items-center justify-center">
          <div className="relative">
            <Wind className={cn(
              "h-16 w-16 transition-all duration-300",
              breathPower > 30 ? "text-blue-500 animate-spin" : "text-gray-400"
            )} />
            {Array.from({ length: Math.floor(breathPower / 20) }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                style={{
                  left: `${50 + (i * 20)}%`,
                  top: `${50 + (i * 10)}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <Button
          onMouseDown={breathIn}
          onMouseUp={() => setBreathPower(0)}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
        >
          Hold to Blow 💨
        </Button>
      </div>
    </div>
  );
};

export { PianoTilesGame, GuitarRhythmGame, DrumBeatGame, ViolinBowGame, FluteBreathGame };