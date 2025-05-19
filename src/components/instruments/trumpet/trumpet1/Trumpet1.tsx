
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import AudioContextManager from '../../../../utils/music/AudioContextManager';

const Trumpet: React.FC = () => {
  const [activeValves, setActiveValves] = useState<number[]>([]);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const valveSoundsRef = useRef<Map<string, () => void>>(new Map());
  
  // Create a memoized valve click handler to prevent re-renders
  const handleValveClick = useCallback((valveNum: number) => {
    setActiveValves(prevValves => {
      if (prevValves.includes(valveNum)) {
        // Release valve
        const key = `valve-${valveNum}`;
        if (valveSoundsRef.current.has(key)) {
          valveSoundsRef.current.get(key)?.();
          valveSoundsRef.current.delete(key);
        }
        return prevValves.filter(v => v !== valveNum);
      } else {
        // Press valve - play sound
        playValveSound(valveNum);
        return [...prevValves, valveNum];
      }
    });
  }, []);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      try {
        // Just access the AudioContextManager to initialize it
        AudioContextManager.getInstance().getAudioContext();
      } catch (e) {
        console.error("Error initializing AudioContext:", e);
      }
    };

    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Set up keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        'a': 1,
        's': 2,
        'd': 3
      };
      
      const valveNum = keyMap[e.key.toLowerCase()];
      if (valveNum && !activeValves.includes(valveNum)) {
        handleValveClick(valveNum);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        'a': 1,
        's': 2,
        'd': 3
      };
      
      const valveNum = keyMap[e.key.toLowerCase()];
      if (valveNum && activeValves.includes(valveNum)) {
        handleValveClick(valveNum);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Clean up any active sounds
      valveSoundsRef.current.forEach(stopFn => stopFn());
    };
  }, [activeValves, handleValveClick]);

  // Optimized valve sound function
  const playValveSound = useCallback((valveNum: number) => {
    try {
      const audioManager = AudioContextManager.getInstance();
      const audioContext = audioManager.getAudioContext();
      
      // Base frequencies for different valves
      const frequencies: Record<number, number> = {
        1: 349.23, // F4
        2: 392.00, // G4
        3: 440.00  // A4
      };
      
      const frequency = frequencies[valveNum] || 349.23;
      
      // Create oscillators for trumpet sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      
      oscillator1.type = 'square';
      oscillator2.type = 'sine';
      
      oscillator1.frequency.value = frequency;
      oscillator2.frequency.value = frequency * 1.5;
      
      const mainGain = audioContext.createGain();
      const secondGain = audioContext.createGain();
      
      mainGain.gain.value = 0.5;
      secondGain.gain.value = 0.2;
      
      // Create tone filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 2;
      
      // Connect nodes
      oscillator1.connect(mainGain);
      oscillator2.connect(secondGain);
      
      mainGain.connect(filter);
      secondGain.connect(filter);
      
      // Apply reverb
      audioManager.getReverbNode().then(reverbNode => {
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();
        
        dryGain.gain.value = 0.7;
        wetGain.gain.value = 0.3;
        
        filter.connect(dryGain);
        filter.connect(reverbNode);
        reverbNode.connect(wetGain);
        
        dryGain.connect(audioContext.destination);
        wetGain.connect(audioContext.destination);
        
        // Apply envelope
        const now = audioContext.currentTime;
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        secondGain.gain.setValueAtTime(0, now);
        secondGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        
        // Start oscillators
        oscillator1.start();
        oscillator2.start();
        
        // Store oscillator for cleanup
        const key = `valve-${valveNum}`;
        oscillatorsRef.current.set(key, oscillator1);
        
        // Create stop function
        const stopSound = () => {
          const now = audioContext.currentTime;
          mainGain.gain.linearRampToValueAtTime(0, now + 0.1);
          secondGain.gain.linearRampToValueAtTime(0, now + 0.1);
          
          setTimeout(() => {
            try {
              oscillator1.stop();
              oscillator2.stop();
              oscillatorsRef.current.delete(key);
            } catch (e) {
              console.error("Error stopping oscillators:", e);
            }
          }, 100);
        };
        
        // Store stop function
        valveSoundsRef.current.set(key, stopSound);
      });
    } catch (e) {
      console.error("Error playing valve sound:", e);
    }
  }, []);

  // Periodic cleanup of inactive oscillators
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      AudioContextManager.getInstance().cleanupInactiveOscillators(oscillatorsRef.current);
    }, 10000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Tutorial content for the simple trumpet
  const trumpetInstructions = [
    "Click on the valves to play different trumpet notes",
    "You can also use keyboard keys A, S, and D to control the valves",
    "Different valve combinations produce different pitches",
    "The trumpet will make sounds when you interact with it"
  ];

  const keyboardMappings = [
    { key: "A", description: "First valve" },
    { key: "S", description: "Second valve" },
    { key: "D", description: "Third valve" }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <div className="flex justify-end mb-2">
        <TutorialButton 
          instrumentName="Trumpet"
          instructions={trumpetInstructions}
          keyMappings={keyboardMappings}
        />
      </div>

      <div className="relative w-full max-w-md mx-auto flex items-center justify-center">
        <div className="relative">
          {/* Main trumpet body */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-16 w-80 rounded-full flex items-center">
            {/* Mouthpiece */}
            <div className="absolute -left-4 w-8 h-8 bg-amber-600 rounded-full"></div>
            
            {/* Bell */}
            <div className="absolute -right-16 w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"></div>
            
            {/* Valves */}
            <div className="absolute left-1/3 top-16 flex space-x-6">
              {[1, 2, 3].map((valveNum) => (
                <button 
                  key={valveNum}
                  className={`w-10 h-16 rounded-b-lg cursor-pointer transition-all ${
                    activeValves.includes(valveNum) 
                      ? 'bg-amber-800 translate-y-2' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                  onClick={() => handleValveClick(valveNum)}
                >
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {valveNum === 1 ? 'A' : valveNum === 2 ? 'S' : 'D'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-24 text-center text-muted-foreground text-sm">
        Click on the valves to play or use keyboard keys A, S, D
      </div>
    </div>
  );
};

export default Trumpet;
