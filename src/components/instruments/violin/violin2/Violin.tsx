
import { useState, useEffect } from 'react';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';

interface ViolinProps {
  variant?: string;
}

const Violin = ({ variant = 'standard' }: ViolinProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [violinVariant, setViolinVariant] = useState<string>(variant);
  
  // Define available violin variants
  const violinVariants = [
    { id: 'standard', name: 'Standard' },
    { id: 'stradivarius', name: 'Stradivarius' },
    { id: 'electric', name: 'Electric' },
    { id: 'baroque', name: 'Baroque' }
  ];
  
  // Define the violin strings based on the variant
  const getStringsForVariant = (variant: string) => {
    // Base strings: G3, D4, A4, E5
    const baseStrings = [
      { note: 'G3', freq: 196.00, key: 'Z', color: 'bg-amber-700' },
      { note: 'D4', freq: 293.66, key: 'X', color: 'bg-amber-600' },
      { note: 'A4', freq: 440.00, key: 'C', color: 'bg-amber-500' },
      { note: 'E5', freq: 659.25, key: 'V', color: 'bg-amber-400' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'stradivarius':
        colorScheme = ['bg-amber-800', 'bg-amber-700', 'bg-amber-600', 'bg-amber-500'];
        freqAdjust = 1.02; // Slight adjustment for richer tone
        break;
      case 'electric':
        colorScheme = ['bg-blue-700', 'bg-blue-600', 'bg-blue-500', 'bg-blue-400'];
        freqAdjust = 1.0; // Same pitch, different timbre
        break;
      case 'baroque':
        colorScheme = ['bg-amber-900', 'bg-amber-800', 'bg-amber-700', 'bg-amber-600'];
        freqAdjust = 0.98; // Slightly lower for baroque tuning
        break;
      default:
        colorScheme = ['bg-amber-700', 'bg-amber-600', 'bg-amber-500', 'bg-amber-400'];
    }
    
    return baseStrings.map((string, index) => ({
      ...string,
      color: colorScheme[index],
      freq: string.freq * freqAdjust
    }));
  };
  
  const strings = getStringsForVariant(violinVariant);

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      const AudioContext = window.AudioContext;
      setAudioContext(new AudioContext());
    };

    if (!audioContext) {
      initAudio();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const stringObj = strings.find(s => s.key.toUpperCase() === key);
      if (stringObj) {
        playString(stringObj.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioContext, strings]);

  const playString = (frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Violin-like timbre, adjusted by variant
    let oscType: OscillatorType = 'sawtooth';
    let attackTime = 0.1;
    let releaseTime = 2.0;
    
    switch(violinVariant) {
      case 'stradivarius':
        oscType = 'sawtooth';
        attackTime = 0.08;
        releaseTime = 2.5;
        break;
      case 'electric':
        oscType = 'square'; 
        attackTime = 0.05;
        releaseTime = 1.8;
        break;
      case 'baroque':
        oscType = 'triangle';
        attackTime = 0.12;
        releaseTime = 2.2;
        break;
      default:
        oscType = 'sawtooth';
    }
    
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;
    
    // Simple violin envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + releaseTime);
    
    // Add visual feedback
    const stringElement = document.querySelector(`[data-freq="${frequency}"]`);
    if (stringElement) {
      stringElement.classList.add('active');
      setTimeout(() => {
        stringElement.classList.remove('active');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <InstrumentVariantSelector
          currentVariant={violinVariant}
          setVariant={setViolinVariant}
          variants={violinVariants}
          label="Select Violin Type"
        />
      </div>
      
      <div className={`violin-body w-80 md:w-96 h-64 relative shadow-lg mb-8 ${
        violinVariant === 'stradivarius' ? 'bg-gradient-to-r from-amber-900 to-amber-800' :
        violinVariant === 'electric' ? 'bg-gradient-to-r from-blue-800 to-blue-700' :
        violinVariant === 'baroque' ? 'bg-gradient-to-r from-amber-700 to-amber-600' :
        'bg-gradient-to-r from-amber-800 to-amber-700'
      } ${
        violinVariant === 'electric' ? 'rounded-lg' : 'rounded-t-full rounded-b-full'
      }`}>
        <div className={`w-6 h-32 ${
          violinVariant === 'stradivarius' ? 'bg-amber-950' :
          violinVariant === 'electric' ? 'bg-gray-800' :
          violinVariant === 'baroque' ? 'bg-amber-800' :
          'bg-amber-900'
        } absolute -top-32 left-1/2 transform -translate-x-1/2`}></div>
        
        <div className="absolute left-8 right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6">
          {strings.map((string, index) => (
            <div 
              key={string.note}
              className="relative"
            >
              <div
                data-freq={string.freq}
                className={`violin-string h-0.5 w-full ${string.color} hover:h-1 hover:opacity-80 active:opacity-60 cursor-pointer transition-all`}
                onClick={() => playString(string.freq)}
              ></div>
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-white">
                <div>{string.note}</div>
                <div className="opacity-70">{string.key}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Click on the strings to play or use keyboard keys (Z, X, C, V)</p>
      </div>
    </div>
  );
};

export default Violin;
