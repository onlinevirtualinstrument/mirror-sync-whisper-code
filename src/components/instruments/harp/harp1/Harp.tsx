
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';

interface HarpProps {
  variant?: string;
}

const Harp = ({ variant = 'standard' }: HarpProps) => {
  const [activeString, setActiveString] = useState<string | null>(null);
  const [harpVariant, setHarpVariant] = useState<string>(variant);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Define available harp variants
  const harpVariants = [
    { id: 'standard', name: 'Standard' },
    { id: 'celtic', name: 'Celtic' },
    { id: 'concert', name: 'Concert' },
    { id: 'electric', name: 'Electric' }
  ];
  
  // Define the strings for the harp based on variant
  const getStringsForVariant = (variant: string) => {
    // Base strings
    const baseStrings = [
      { note: 'C', freq: 261.63, key: 'A', color: 'bg-amber-200' },
      { note: 'D', freq: 293.66, key: 'B', color: 'bg-amber-200' },
      { note: 'E', freq: 329.63, key: 'C', color: 'bg-amber-200' },
      { note: 'F', freq: 349.23, key: 'D', color: 'bg-amber-200' },
      { note: 'G', freq: 392.00, key: 'E', color: 'bg-amber-200' },
      { note: 'A', freq: 440.00, key: 'F', color: 'bg-amber-200' },
      { note: 'B', freq: 493.88, key: 'G', color: 'bg-amber-200' },
      { note: 'C2', freq: 523.25, key: 'H', color: 'bg-amber-200' },
      { note: 'D2', freq: 587.33, key: 'I', color: 'bg-amber-200' },
      { note: 'E2', freq: 659.25, key: 'J', color: 'bg-amber-200' },
      { note: 'F2', freq: 698.46, key: 'K', color: 'bg-amber-200' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'celtic':
        colorScheme = Array(11).fill('bg-green-200');
        freqAdjust = 0.95; // Slightly lower pitch
        break;
      case 'concert':
        colorScheme = Array(11).fill('bg-gold-200');
        freqAdjust = 1.0; // Standard concert pitch
        break;
      case 'electric':
        colorScheme = Array(11).fill('bg-blue-200');
        freqAdjust = 1.0; // Same pitch but different timbre
        break;
      default:
        colorScheme = Array(11).fill('bg-amber-200');
    }
    
    return baseStrings.map((string, index) => ({
      ...string,
      color: colorScheme[index],
      freq: string.freq * freqAdjust
    }));
  };
  
  const strings = getStringsForVariant(harpVariant);

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Initialize on first click
    document.addEventListener('click', initAudio, { once: true });

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const stringObj = strings.find(s => s.key === key);
      
      if (stringObj && !activeString) {
        playString(stringObj.note, stringObj.freq);
      }
    };

    const handleKeyUp = () => {
      setActiveString(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeString, strings]);

  const playString = (note: string, frequency: number) => {
    if (!audioContext.current || isMuted) return;
    
    setActiveString(note);
    
    // Create oscillator
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    // Harp-like timbre with adjustments based on variant
    let oscType: OscillatorType = 'triangle';
    let attackTime = 0.01;
    let releaseTime = 3.0;
    let reverbAmount = 0.3;
    
    switch(harpVariant) {
      case 'celtic':
        oscType = 'triangle';
        attackTime = 0.02;
        releaseTime = 3.5;
        reverbAmount = 0.4;
        break;
      case 'concert':
        oscType = 'triangle';
        attackTime = 0.01;
        releaseTime = 4.0;
        reverbAmount = 0.5;
        break;
      case 'electric':
        oscType = 'sine';
        attackTime = 0.005;
        releaseTime = 2.5;
        reverbAmount = 0.2;
        break;
      default:
        oscType = 'triangle';
    }
    
    oscillator.type = oscType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    
    // Envelope for harp-like pluck
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.current.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + releaseTime);
    
    // Add reverb for harp feel
    const reverbGain = audioContext.current.createGain();
    reverbGain.gain.value = reverbAmount;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Reverb chain (simplified)
    gainNode.connect(reverbGain);
    reverbGain.connect(audioContext.current.destination);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      setActiveString(null);
    }, releaseTime * 1000);
  };

  const handleStringClick = (note: string, freq: number) => {
    playString(note, freq);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  // Get style classes based on variant
  const getStyleClasses = () => {
    switch(harpVariant) {
      case 'celtic':
        return {
          card: 'from-green-50/30 to-green-100/40 border-green-200/50',
          frameLeft: 'from-green-700 to-green-900',
          frameBottom: 'from-green-700 to-green-800',
          button: 'bg-green-100 hover:bg-green-200'
        };
      case 'concert':
        return {
          card: 'from-yellow-50/30 to-yellow-100/40 border-yellow-200/50',
          frameLeft: 'from-yellow-700 to-yellow-900',
          frameBottom: 'from-yellow-700 to-yellow-800',
          button: 'bg-yellow-100 hover:bg-yellow-200'
        };
      case 'electric':
        return {
          card: 'from-blue-50/30 to-blue-100/40 border-blue-200/50',
          frameLeft: 'from-blue-800 to-blue-950',
          frameBottom: 'from-blue-800 to-blue-900',
          button: 'bg-blue-100 hover:bg-blue-200'
        };
      default:
        return {
          card: 'from-blue-50/30 to-blue-100/40 border-blue-200/50',
          frameLeft: 'from-amber-700 to-amber-900',
          frameBottom: 'from-amber-700 to-amber-800',
          button: 'bg-blue-100 hover:bg-blue-200'
        };
    }
  };
  
  const styles = getStyleClasses();

  return (
    <div className={`glass-card p-8 rounded-xl backdrop-blur-sm bg-gradient-to-br ${styles.card} border shadow-xl`}>
      <div className="mb-4">
        <InstrumentVariantSelector
          currentVariant={harpVariant}
          setVariant={setHarpVariant}
          variants={harpVariants}
          label="Select Harp Type"
        />
      </div>
      
      <div className="relative w-full h-80 flex justify-center">
        <div className="relative w-56 h-full">
          <div className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b ${styles.frameLeft} rounded-t-lg shadow-md`}></div>
          <div className={`absolute left-0 bottom-0 w-40 h-12 bg-gradient-to-r ${styles.frameBottom} rounded-r-lg shadow-md`}></div>
          
          {strings.map((string, i) => (
            <div 
              key={i}
              className={`absolute cursor-pointer transition-all ${
                activeString === string.note 
                  ? 'animate-[pulse_0.5s_ease-in-out] bg-accent shadow-accent/50'
                  : `${string.color} hover:bg-accent/70`
              } shadow-sm`}
              style={{ 
                left: `${20 + i * 12}px`,
                height: `${190 + i * 5}px`,
                width: activeString === string.note ? '2px' : '1px',
                bottom: '48px',
                transform: `rotate(${5 + i}deg)`,
                transformOrigin: 'bottom center'
              }}
              onClick={() => handleStringClick(string.note, string.freq)}
            >
              <span className="absolute -bottom-10 -left-2 text-xs font-medium">{string.note}</span>
              <span className="absolute -top-10 -left-2 text-xs text-muted-foreground">{string.key}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex flex-col space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={toggleMute} 
            className={`p-2 rounded-full transition-colors ${styles.button}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="w-48">
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              disabled={isMuted}
              className={isMuted ? "opacity-50" : ""}
            />
          </div>
        </div>
        
        <div className="text-center text-muted-foreground text-sm">
          Click on the strings to play or use keyboard keys A-K
        </div>
      </div>
    </div>
  );
};

export default Harp;
