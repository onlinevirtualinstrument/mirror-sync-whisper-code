
import { useState, useEffect, useRef } from 'react';
import { Disc3, Disc2, Music4, Drum, Drumstick } from 'lucide-react';
import { drumKitThemes } from './DrumKitThemes';
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [stickPosition, setStickPosition] = useState<{ x: number, y: number } | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTheme = drumKitThemes[drumKitType as keyof typeof drumKitThemes] || drumKitThemes.standard;
  const drumKit = currentTheme.elements;

  const isMobile = useIsMobile(); // detects mobile screen size

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
        setStickPosition({ x: xPos, y: yPos });

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

  const pads = [
    { id: 'kick', label: 'X', top: '40%', left: '50%', size: '30%', sizeMobile: '25%', color: 'from-red-900 to-yellow-400' },
    { id: 'hihat', label: 'H', top: '12%', left: '70%', size: '15%', sizeMobile: '18%',color: 'from-yellow-300 to-yellow-500' },
    { id: 'crash', label: 'Y', top: '8%', left: '25%', size: '18%', sizeMobile: '21%',color: 'from-yellow-400 to-orange-400', rotate: 'rotate-12' },
    { id: 'ride', label: 'U', top: '10%', left: '90%', size: '16%', sizeMobile: '19%',color: 'from-blue-400 to-indigo-500', rotate: '-rotate-6' },
    { id: 'snare', label: 'S', top: '35%', left: '20%', size: '14%', sizeMobile: '17%',color: 'from-orange-200 to-orange-300' },
    { id: 'tom1', label: 'G', top: '22%', left: '40%', size: '14%', sizeMobile: '17%',color: 'from-violet-300 to-violet-400' },
    { id: 'tom2', label: 'J', top: '35%', left: '80%', size: '14%', sizeMobile: '17%', color: 'from-teal-300 to-teal-500' },
    { id: 'floor', label: 'D', top: '60%', left: '25%', size: '16%', sizeMobile: '20%', color: 'from-lime-300 to-green-400' },
    { id: 'pedal', label: 'C', top: '85%', left: '50%', size: '15%', sizeMobile: '30%', color: 'from-gray-400 to-gray-500', isRect: true },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] bg-gradient-to-b from-gray-900/50 to-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 mb-6 overflow-hidden"
    >
      <div className="relative w-full h-full">
        <div className={`absolute inset-0 ${currentTheme.background} bg-cover bg-center opacity-50 rounded-lg`} />

        {pads.map((pad) => (
          <div
            key={pad.id}
            className={`absolute ${pad.rotate || ''}`}
            style={{
              top: pad.top,
              left: pad.left,
              width: isMobile ? pad.sizeMobile || pad.size : pad.size, // use sizeMobile if defined
              aspectRatio: pad.isRect ? '2/1' : '1/1',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`absolute inset-0 rounded-${pad.isRect ? 'lg' : 'full'} bg-gradient-to-br ${pad.color} shadow-xl opacity-80`} />
            <div className={`absolute inset-0 rounded-${pad.isRect ? 'lg' : 'full'} border-4 border-white/30`} />
            <div
              data-drum-id={pad.id}
              onClick={() => playDrumSound(pad.id)}
              className={`absolute inset-[15%] flex items-center justify-center cursor-pointer transition-transform duration-150 ease-in-out bg-white/90 hover:scale-105 hover:ring-2 hover:ring-white rounded-${pad.isRect ? 'lg' : 'full'} ${activeElements.includes(pad.id) ? 'scale-95 ring-4 ring-white/60' : ''
                }`}
            >
              {showShortcuts && (
                <span className="w-8 h-8 bg-green-600/80 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                  {pad.label}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Drum Sticks */}
        {stickPosition ? (
          <div
            className="absolute w-2 h-20 bg-gradient-to-b from-yellow-700 to-yellow-600 rounded-full origin-bottom animate-[drum-stick_0.3s_ease-out] z-20"
            style={{
              left: `${stickPosition.x}px`,
              top: `${stickPosition.y - 50}px`,
              transform: 'rotate(-15deg) translateY(-20px)',
            }}
          >
            <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
          </div>
        ) : (
          <> 
            <div className="absolute bottom-[15%] right-[15%] w-2 h-20 bg-gradient-to-b from-yellow-700 to-yellow-600 rounded-full rotate-45 origin-bottom">
              <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
            </div>
            <div className="absolute bottom-[15%] right-[25%] w-2 h-20 bg-gradient-to-b from-yellow-700 to-yellow-600 rounded-full rotate-30 origin-bottom">
              <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DrumKit;
