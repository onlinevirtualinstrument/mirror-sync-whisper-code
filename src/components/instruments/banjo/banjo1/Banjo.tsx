import { useState, useEffect, useRef } from 'react';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import { Slider } from "@/components/ui/slider";

interface BanjoProps {
  variant?: string;
}

const Banjo = ({ variant = 'standard' }: BanjoProps) => {
  const [activeString, setActiveString] = useState<string | null>(null);
  const [banjoVariant, setBanjoVariant] = useState<string>(variant);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Customization options
  const [pickAttack, setPickAttack] = useState<number>(0.5);
  const [stringResonance, setStringResonance] = useState<number>(0.5);
  
  // Define available banjo variants
  const banjoVariants = [
    { id: 'standard', name: 'Standard' },
    { id: 'openback', name: 'Open Back' },
    { id: 'resonator', name: 'Resonator' },
    { id: 'bluegrass', name: 'Bluegrass' }
  ];
  
  // Define the strings for the banjo based on variant
  const getStringsForVariant = (variant: string) => {
    // Base strings
    const baseStrings = [
      { note: 'G', freq: 392.00, key: 'Q', color: 'bg-gray-400' },
      { note: 'D', freq: 293.66, key: 'W', color: 'bg-gray-400' },
      { note: 'A', freq: 220.00, key: 'E', color: 'bg-gray-400' },
      { note: 'E', freq: 329.63, key: 'R', color: 'bg-gray-400' },
      { note: 'B', freq: 493.88, key: 'T', color: 'bg-gray-400' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'openback':
        colorScheme = Array(5).fill('bg-gray-300');
        freqAdjust = 0.85; // Much lower pitch for warmer open back sound
        break;
      case 'resonator':
        colorScheme = Array(5).fill('bg-amber-300');
        freqAdjust = 1.05; // Slightly higher with resonator amplification
        break;
      case 'bluegrass':
        colorScheme = Array(5).fill('bg-gray-400');
        freqAdjust = 1.15; // Higher, brighter pitch for distinctive bluegrass sound
        break;
      default:
        colorScheme = Array(5).fill('bg-gray-400');
    }
    
    return baseStrings.map((string, index) => ({
      ...string,
      color: colorScheme[index],
      freq: string.freq * freqAdjust
    }));
  };
  
  const strings = getStringsForVariant(banjoVariant);

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
    if (!audioContext.current) return;
    
    setActiveString(note);
    
    // Create oscillator for the main tone
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    // Create second oscillator for more complex timbre
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode2 = audioContext.current.createGain();
    
    // Create noise for the characteristic attack sound
    const noiseNode = audioContext.current.createBufferSource();
    const noiseGain = audioContext.current.createGain();
    
    // Banjo-like timbre settings based on variant
    let oscType: OscillatorType = 'triangle';
    let osc2Type: OscillatorType = 'triangle';
    let attackTime = 0.01;
    let decayTime = 0.2;
    let releaseTime = 1.5;
    let distortionAmount = 20;
    let harmonicRatio = 2.0; // Second oscillator harmonic
    let osc2Volume = 0.15;
    let noiseLevel = 0.2;
    let noiseDecay = 0.1;
    
    switch(banjoVariant) {
      case 'openback':
        oscType = 'triangle';
        osc2Type = 'sine';
        decayTime = 0.30;
        releaseTime = 2.0;
        distortionAmount = 15;
        harmonicRatio = 1.5; // Perfect fifth for richer sound
        osc2Volume = 0.15;
        noiseLevel = 0.15;
        break;
      case 'resonator':
        oscType = 'triangle';
        osc2Type = 'triangle';
        decayTime = 0.15;
        releaseTime = 1.6;
        distortionAmount = 25;
        harmonicRatio = 3.0; // Higher harmonics for bright tone
        osc2Volume = 0.12;
        noiseLevel = 0.25;
        break;
      case 'bluegrass':
        oscType = 'sawtooth';
        osc2Type = 'square';
        decayTime = 0.08;
        releaseTime = 1.2;
        distortionAmount = 40; // More distorted for aggressive bluegrass sound
        harmonicRatio = 2.01; // Slight detuning for characteristic buzz
        osc2Volume = 0.2;
        noiseLevel = 0.35; // More attack noise for percussive sound
        noiseDecay = 0.05; // Faster decay for sharp attack
        break;
      default:
        oscType = 'triangle';
    }
    
    // Setup main oscillator
    oscillator.type = oscType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    
    // Setup second oscillator for harmonic complexity
    oscillator2.type = osc2Type;
    oscillator2.frequency.setValueAtTime(frequency * harmonicRatio, audioContext.current.currentTime);
    gainNode2.gain.value = osc2Volume;
    
    // Generate noise buffer for attack
    const noiseBuffer = audioContext.current.createBuffer(1, audioContext.current.sampleRate * 0.1, audioContext.current.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    noiseNode.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(noiseLevel, audioContext.current.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + noiseDecay);
    
    // Create rapid decay for characteristic banjo sound
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.9, audioContext.current.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.current.currentTime + decayTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + releaseTime);
    
    // Envelope for secondary oscillator
    gainNode2.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode2.gain.linearRampToValueAtTime(osc2Volume, audioContext.current.currentTime + attackTime);
    gainNode2.gain.exponentialRampToValueAtTime(osc2Volume * 0.3, audioContext.current.currentTime + decayTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + releaseTime * 0.9);
    
    // Add a bit of distortion for banjo character
    const distortion = audioContext.current.createWaveShaper();
    function makeDistortionCurve(amount = 10) {
      const k = typeof amount === 'number' ? amount : 10;
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      
      return curve;
    }
    
    distortion.curve = makeDistortionCurve(distortionAmount);
    distortion.oversample = '4x';
    
    // Add a simple EQ for characteristic tone
    const biquadFilter = audioContext.current.createBiquadFilter();
    biquadFilter.type = 'peaking';
    
    // EQ settings by variant
    switch(banjoVariant) {
      case 'openback':
        biquadFilter.frequency.value = 500; // Mid-low emphasis
        biquadFilter.gain.value = 6;
        biquadFilter.Q.value = 1.5;
        break;
      case 'resonator':
        biquadFilter.frequency.value = 1200; // Mid emphasis
        biquadFilter.gain.value = 8;
        biquadFilter.Q.value = 2;
        break;
      case 'bluegrass':
        biquadFilter.frequency.value = 2500; // High-mid emphasis 
        biquadFilter.gain.value = 10;
        biquadFilter.Q.value = 3;
        break;
      default:
        biquadFilter.frequency.value = 1000;
        biquadFilter.gain.value = 5;
        biquadFilter.Q.value = 1;
    }
    
    // Connect main oscillator chain
    oscillator.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Connect secondary oscillator chain
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.current.destination);
    
    // Connect noise for attack sound
    noiseNode.connect(noiseGain);
    noiseGain.connect(audioContext.current.destination);
    
    // Start all sound sources
    oscillator.start();
    oscillator2.start();
    noiseNode.start();
    
    // Stop oscillators
    oscillator.stop(audioContext.current.currentTime + releaseTime);
    oscillator2.stop(audioContext.current.currentTime + releaseTime);
    
    // Reset active string after release time
    setTimeout(() => {
      setActiveString(null);
    }, releaseTime * 1000);
  };

  const handleStringClick = (note: string, freq: number) => {
    playString(note, freq);
  };

  // Tutorial content
  const banjoInstructions = [
    "Click on the strings to play different notes on the banjo",
    "You can also use keyboard keys Q, W, E, R, T to play different strings",
    "Try different banjo types from the dropdown menu for different sounds",
    "Adjust the customization options below for your preferred tone"
  ];

  const keyboardMappings = strings.map(string => ({
    key: string.key,
    description: `Play ${string.note} string`
  }));

  return (
    <div className="glass-card p-8 rounded-xl">
      <div className="mb-4 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={banjoVariant}
          setVariant={setBanjoVariant}
          variants={banjoVariants}
          label="Select Banjo Type"
        />
        
        <TutorialButton 
          instrumentName="Banjo"
          instructions={banjoInstructions}
          keyMappings={keyboardMappings}
        />
      </div>
      
      <div className="flex flex-col items-center">
        <div className={`w-80 h-80 rounded-full ${
          banjoVariant === 'openback' ? 'bg-amber-50 border-4 border-amber-100' :
          banjoVariant === 'resonator' ? 'bg-amber-200 border-4 border-amber-300' :
          banjoVariant === 'bluegrass' ? 'bg-amber-300 border-4 border-amber-400' :
          'bg-amber-100 border-4 border-amber-200'
        } relative mb-4`}>
          <div className={`absolute w-20 h-64 ${
            banjoVariant === 'openback' ? 'bg-amber-700' :
            banjoVariant === 'resonator' ? 'bg-amber-800' :
            banjoVariant === 'bluegrass' ? 'bg-amber-950' :
            'bg-amber-800'
          } top-8 left-1/2 transform -translate-x-1/2`}>
            {strings.map((string, i) => (
              <div 
                key={i} 
                className={`absolute w-full h-0.5 cursor-pointer transition-all ${activeString === string.note ? 'bg-accent animate-guitar-strum' : `${string.color} hover:bg-accent`}`}
                style={{ top: `${20 + i * 40}px` }}
                onClick={() => handleStringClick(string.note, string.freq)}
              >
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-amber-900">
                  {string.note}
                </div>
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-amber-900">
                  {string.key}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full max-w-md mt-4 space-y-4">
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pick Attack</span>
                  <span className="text-xs text-muted-foreground">{Math.round(pickAttack * 100)}%</span>
                </div>
                <Slider
                  value={[pickAttack]}
                  max={1}
                  step={0.01}
                  onValueChange={(newValue) => setPickAttack(newValue[0])}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">String Resonance</span>
                  <span className="text-xs text-muted-foreground">{Math.round(stringResonance * 100)}%</span>
                </div>
                <Slider
                  value={[stringResonance]}
                  max={1}
                  step={0.01}
                  onValueChange={(newValue) => setStringResonance(newValue[0])}
                />
              </div>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground text-sm">
            Click on the strings to play or use keys Q, W, E, R, T
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banjo;
