
import React, { useRef, useState, useEffect } from 'react';
import { TutorialButton } from '../../../../utils/instrument-common/TutorialButton';
import SoundControls from '../../../../utils/SoundControls';
import { useThereminAudio } from './ThereminAudio';

const Theremin = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<number>(0.5);
  
  // Use the theremin audio hook
  const { updateThereminSound, isPlaying } = useThereminAudio({
    volume,
    isMuted,
    sensitivity
  });
  
  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      setPosition({ x, y });
      updateThereminSound(x, y);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    updateThereminSound(position.x, 0);
  };

  // Tutorial content
  const thereminInstructions = [
    "Move your cursor horizontally to control the pitch of the theremin.",
    "Move your cursor vertically to control the volume of the theremin.",
    "This instrument is controlled entirely by mouse movement.",
    "Use the controls below to adjust the sound characteristics."
  ];

  const keyboardMappings = [
    { key: "Mouse X", description: "Control pitch" },
    { key: "Mouse Y", description: "Control volume" }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <div className="flex justify-end mb-2">
        <TutorialButton 
          instrumentName="Theremin"
          instructions={thereminInstructions}
          keyMappings={keyboardMappings}
        />
      </div>
      
      <div 
        ref={containerRef}
        className="w-full h-64 bg-gradient-to-r from-indigo-100 to-blue-200 rounded-lg cursor-none relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`absolute w-8 h-8 rounded-full bg-accent shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity ${isPlaying ? 'animate-pulse' : ''}`}
          style={{ 
            left: `${position.x * 100}%`, 
            top: `${(1 - position.y) * 100}%`,
            opacity: isPlaying ? 0.9 : 0.7
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-lg font-medium text-foreground/50">
            Move your cursor to play the theremin
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="mb-4">
          <p className="text-muted-foreground text-center">
            Pitch: {Math.round(position.x * 100)}% | Volume: {Math.round(position.y * 100)}%
          </p>
        </div>
        
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sensitivity</span>
            <span className="text-xs text-muted-foreground">{Math.round(sensitivity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Theremin;
