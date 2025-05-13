
import { useState, useEffect, useRef } from 'react';
import { Disc3, Disc2, Music4, Drum, Drumstick } from 'lucide-react';
import { drumKitThemes } from './DrumKitThemes';
import { DrumElement } from './DrumElements';
import { 
  generateKickSound,
  generateSnareSound, 
  generateHiHatSound, 
  generateTomSound, 
  generateCrashSound, 
  generateRideSound, 
  generatePedalSound,
  createReverb
} from './DrumSoundUtils';

interface DrumKitProps {
  drumKitType: string;
  volume: number;
  isMuted: boolean;
  reverbLevel: number;
  toneQuality: number;
  showShortcuts: boolean;
}

const DrumKit = ({ 
  drumKitType,
  volume,
  isMuted,
  reverbLevel,
  toneQuality,
  showShortcuts
}: DrumKitProps) => {
  const [activeElements, setActiveElements] = useState<string[]>([]);
  const [stickPosition, setStickPosition] = useState<{x: number, y: number} | null>(null);
  
  const audioContext = useRef<AudioContext | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTheme = drumKitThemes[drumKitType as keyof typeof drumKitThemes] || drumKitThemes.standard;
  const drumKit = currentTheme.elements;

  useEffect(() => {
    const initializeAudioContext = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        createReverb(audioContext.current).then(node => {
          reverbNode.current = node;
        });
      }
    };
    
    initializeAudioContext();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const drumElement = drumKit.find(d => d.key.toLowerCase() === event.key.toLowerCase());
      if (drumElement && !activeElements.includes(drumElement.id)) {
        playDrumSound(drumElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeElements, drumKit]);

  const playDrumSound = (id: string) => {
    if (!audioContext.current || isMuted) return;
    
    setActiveElements(prev => [...prev, id]);
    setTimeout(() => {
      setActiveElements(prev => prev.filter(item => item !== id));
    }, 300);

    if (containerRef.current) {
      const drumElement = document.querySelector(`[data-drum-id="${id}"]`);
      if (drumElement) {
        const rect = drumElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const xPos = rect.left - containerRect.left + rect.width / 2;
        const yPos = rect.top - containerRect.top + rect.height / 2;
        setStickPosition({x: xPos, y: yPos});
        
        setTimeout(() => {
          setStickPosition(null);
        }, 300);
        
        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full animate-ping bg-white/30 pointer-events-none';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.left = `${xPos - 25}px`;
        ripple.style.top = `${yPos - 25}px`;
        
        containerRef.current.appendChild(ripple);
        
        setTimeout(() => {
          containerRef.current?.removeChild(ripple);
        }, 700);
      }
    }
    
    const drum = drumKit.find(d => d.id === id);
    if (!drum) return;
    
    const drumGain = audioContext.current.createGain();
    
    if (reverbLevel > 0 && reverbNode.current) {
      const dryGain = audioContext.current.createGain();
      const wetGain = audioContext.current.createGain();
      
      dryGain.gain.value = 1 - reverbLevel;
      wetGain.gain.value = reverbLevel;
      
      drumGain.connect(dryGain);
      drumGain.connect(reverbNode.current);
      reverbNode.current.connect(wetGain);
      
      dryGain.connect(audioContext.current.destination);
      wetGain.connect(audioContext.current.destination);
    } else {
      drumGain.connect(audioContext.current.destination);
    }
    
    let volumeAdjustment = 1.0;
    
    switch (drumKitType) {
      case 'rock':
        volumeAdjustment = 1.2;
        break;
      case 'jazz':
        volumeAdjustment = 0.9;
        break;
      case 'electronic':
        volumeAdjustment = 1.1;
        break;
      case 'indian':
        volumeAdjustment = 0.85;
        break;
      default:
        break;
    }
    
    drumGain.gain.value = volume * volumeAdjustment;
    
    switch (id) {
      case 'kick':
        generateKickSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      case 'snare':
        generateSnareSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      case 'hihat':
        generateHiHatSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      case 'tom1':
        generateTomSound(audioContext.current, drumGain, 180, toneQuality, drumKitType);
        break;
      case 'tom2':
        generateTomSound(audioContext.current, drumGain, 150, toneQuality, drumKitType);
        break;
      case 'crash':
        generateCrashSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      case 'ride':
        generateRideSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      case 'floor':
        generateTomSound(audioContext.current, drumGain, 100, toneQuality, drumKitType);
        break;
      case 'pedal':
        generatePedalSound(audioContext.current, drumGain, toneQuality, drumKitType);
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] bg-gradient-to-b from-gray-900/50 to-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 mb-6 overflow-hidden"
    >
      <div className="relative w-full h-full">
        <div className={`absolute inset-0 ${currentTheme.background} bg-cover bg-center opacity-50 rounded-lg`}></div>
        
        {/* Kick Drum - Center Bass Drum */}
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square">
          <div className={`absolute inset-0 rounded-full ${drumKitType === 'electronic' ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-red-900 to-red-700'} opacity-80 shadow-2xl`}></div>
          <div className={`absolute inset-0 rounded-full border-8 ${drumKitType === 'jazz' ? 'border-amber-600/40' : drumKitType === 'indian' ? 'border-orange-800/40' : drumKitType === 'electronic' ? 'border-indigo-800/40' : 'border-amber-800/40'}`}></div>
          <div 
            data-drum-id="kick" 
            className={`absolute inset-[15%] rounded-full flex items-center justify-center transition-all cursor-pointer ${
              drumKitType === 'rock' ? 'bg-slate-200/90' : 
              drumKitType === 'electronic' ? 'bg-cyan-300/90' : 
              drumKitType === 'indian' ? 'bg-amber-100/80' : 
              'bg-white/90'
            } ${
              activeElements.includes('kick') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('kick')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-10 h-10 bg-green-600/80 rounded-full text-white font-bold">
                X
              </span>
            )}
          </div>
        </div>
        
        {/* Hi-Hat */}
        <div className="absolute top-[12%] right-[20%] w-[15%] aspect-square">
          <div className="absolute inset-0 bg-yellow-600/80 opacity-90 rounded-full shadow-xl"></div>
          <div className="absolute inset-1 rounded-full border-2 border-yellow-900/40 flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full border-2 border-yellow-800/30"></div>
          </div>
          <div 
            data-drum-id="hihat" 
            className={`absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              activeElements.includes('hihat') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('hihat')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                H
              </span>
            )}
          </div>
        </div>
        
        {/* Crash Cymbal */}
        <div className="absolute top-[8%] left-[25%] w-[18%] aspect-square">
          <div className="absolute inset-0 bg-yellow-600/80 opacity-90 rounded-full shadow-xl transform rotate-12"></div>
          <div className="absolute inset-1 rounded-full border-2 border-yellow-900/40 flex items-center justify-center transform rotate-12">
            <div className="w-[70%] h-[70%] rounded-full border-2 border-yellow-800/30"></div>
            <div className="w-[40%] h-[40%] rounded-full border-2 border-yellow-800/30"></div>
          </div>
          <div 
            data-drum-id="crash" 
            className={`absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-all transform rotate-12 ${
              activeElements.includes('crash') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('crash')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                Y
              </span>
            )}
          </div>
        </div>
        
        {/* Ride Cymbal */}
        <div className="absolute top-[10%] right-[10%] w-[16%] aspect-square">
          <div className="absolute inset-0 bg-yellow-600/80 opacity-90 rounded-full shadow-xl transform -rotate-6"></div>
          <div className="absolute inset-1 rounded-full border-2 border-yellow-900/40 flex items-center justify-center transform -rotate-6">
            <div className="w-[70%] h-[70%] rounded-full border-2 border-yellow-800/30"></div>
            <div className="w-[40%] h-[40%] rounded-full border-2 border-yellow-800/30"></div>
          </div>
          <div 
            data-drum-id="ride" 
            className={`absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-all transform -rotate-6 ${
              activeElements.includes('ride') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('ride')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                U
              </span>
            )}
          </div>
        </div>
        
        {/* Snare Drum */}
        <div className="absolute top-[35%] left-[20%] w-[14%] aspect-square">
          <div className="absolute inset-0 bg-red-600/80 opacity-90 rounded-full shadow-xl"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-800/30"></div>
          <div 
            data-drum-id="snare" 
            className={`absolute inset-[10%] rounded-full flex items-center justify-center cursor-pointer transition-all bg-gradient-to-br from-orange-100 to-orange-200 ${
              activeElements.includes('snare') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('snare')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                S
              </span>
            )}
          </div>
        </div>
        
        {/* Tom 1 */}
        <div className="absolute top-[22%] left-[40%] w-[14%] aspect-square">
          <div className="absolute inset-0 bg-red-600/80 opacity-90 rounded-full shadow-xl"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-800/30"></div>
          <div 
            data-drum-id="tom1" 
            className={`absolute inset-[10%] rounded-full flex items-center justify-center cursor-pointer transition-all bg-gradient-to-br from-orange-100 to-orange-200 ${
              activeElements.includes('tom1') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('tom1')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                G
              </span>
            )}
          </div>
        </div>
        
        {/* Tom 2 */}
        <div className="absolute top-[35%] right-[20%] w-[14%] aspect-square">
          <div className="absolute inset-0 bg-red-600/80 opacity-90 rounded-full shadow-xl"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-800/30"></div>
          <div 
            data-drum-id="tom2" 
            className={`absolute inset-[10%] rounded-full flex items-center justify-center cursor-pointer transition-all bg-gradient-to-br from-orange-100 to-orange-200 ${
              activeElements.includes('tom2') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('tom2')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                J
              </span>
            )}
          </div>
        </div>
        
        {/* Floor Tom */}
        <div className="absolute bottom-[25%] left-[25%] w-[16%] aspect-square">
          <div className="absolute inset-0 bg-red-600/80 opacity-90 rounded-full shadow-xl"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-800/30"></div>
          <div 
            data-drum-id="floor" 
            className={`absolute inset-[10%] rounded-full flex items-center justify-center cursor-pointer transition-all bg-gradient-to-br from-orange-100 to-orange-200 ${
              activeElements.includes('floor') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('floor')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                D
              </span>
            )}
          </div>
        </div>
        
        {/* Pedal */}
        <div className="absolute bottom-[12%] left-[50%] transform -translate-x-1/2 w-[10%] aspect-[2/1]">
          <div className="absolute inset-0 bg-gray-400/80 opacity-90 rounded-lg shadow-xl"></div>
          <div 
            data-drum-id="pedal" 
            className={`absolute inset-0 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              activeElements.includes('pedal') ? 'scale-95 brightness-110' : 'hover:brightness-105'
            }`}
            onClick={() => playDrumSound('pedal')}
          >
            {showShortcuts && (
              <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                C
              </span>
            )}
          </div>
        </div>
        
        {/* Drum Sticks */}
        {stickPosition ? (
          <div 
            className={`absolute w-2 h-20 ${
              drumKitType === 'rock' ? 'bg-gradient-to-b from-gray-800 to-gray-700' :
              drumKitType === 'electronic' ? 'bg-gradient-to-b from-purple-800 to-purple-700' :
              drumKitType === 'indian' ? 'bg-gradient-to-b from-orange-800 to-orange-700' :
              'bg-gradient-to-b from-amber-800 to-amber-700'
            } rounded-full origin-bottom animate-[drum-stick_0.3s_ease-out] z-20`}
            style={{ 
              left: `${stickPosition.x}px`, 
              top: `${stickPosition.y - 50}px`,
              transform: 'rotate(-15deg) translateY(-20px)'
            }}
          >
            <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
          </div>
        ) : (
          <>
            <div className={`absolute bottom-[15%] right-[15%] w-2 h-20 ${
              drumKitType === 'rock' ? 'bg-gradient-to-b from-gray-800 to-gray-700' :
              drumKitType === 'electronic' ? 'bg-gradient-to-b from-purple-800 to-purple-700' :
              drumKitType === 'indian' ? 'bg-gradient-to-b from-orange-800 to-orange-700' :
              'bg-gradient-to-b from-amber-800 to-amber-700'
            } rounded-full transform rotate-45 origin-bottom`}>
              <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
            </div>
            <div className={`absolute bottom-[15%] right-[25%] w-2 h-20 ${
              drumKitType === 'rock' ? 'bg-gradient-to-b from-gray-800 to-gray-700' :
              drumKitType === 'electronic' ? 'bg-gradient-to-b from-purple-800 to-purple-700' :
              drumKitType === 'indian' ? 'bg-gradient-to-b from-orange-800 to-orange-700' :
              'bg-gradient-to-b from-amber-800 to-amber-700'
            } rounded-full transform rotate-30 origin-bottom`}>
              <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DrumKit;
