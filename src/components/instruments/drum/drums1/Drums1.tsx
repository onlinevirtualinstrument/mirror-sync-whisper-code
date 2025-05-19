import { useState, useEffect, useRef } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import { Disc3, Disc2, Music4, Drum, Drumstick } from 'lucide-react';

const commonDrumElements = [
  { id: 'kick', key: 'X', label: 'Kick', position: { top: '50%', left: '50%' }, sound: 'kick' },
  { id: 'snare', key: 'S', label: 'Snare', position: { top: '38%', left: '26%' }, sound: 'snare' },
  { id: 'hihat', key: 'H', label: 'Hi-Hat', position: { top: '20%', left: '75%' }, sound: 'hihat' },
  { id: 'tom1', key: 'G', label: 'Tom 1', position: { top: '25%', left: '42%' }, sound: 'tom1' },
  { id: 'tom2', key: 'J', label: 'Tom 2', position: { top: '35%', left: '80%' }, sound: 'tom2' },
  { id: 'crash', key: 'Y', label: 'Crash', position: { top: '15%', left: '40%' }, sound: 'crash' },
  { id: 'ride', key: 'U', label: 'Ride', position: { top: '18%', left: '78%' }, sound: 'ride' },
  { id: 'floor', key: 'D', label: 'Floor Tom', position: { bottom: '20%', left: '30%' }, sound: 'floor' },
  { id: 'pedal', key: 'C', label: 'Pedal', position: { bottom: '20%', left: '30%' }, sound: 'pedal' },
];

const drumKitThemes = {
  standard: {
    background: "bg-[url('https://images.unsplash.com/photo-1618424429013-64254806ea49?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-red-600/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-600/80'
          : drum.id === 'pedal'
            ? 'bg-gray-400/80'
            : 'bg-white/80'
    }))
  },
  rock: {
    background: "bg-[url('https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-red-800/90' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-amber-700/90'
          : drum.id === 'pedal'
            ? 'bg-gray-600/90'
            : 'bg-slate-200/90'
    }))
  },
  jazz: {
    background: "bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-amber-800/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-500/80'
          : drum.id === 'pedal'
            ? 'bg-gray-300/80'
            : 'bg-slate-100/80'
    }))
  },
  electronic: {
    background: "bg-gradient-to-b from-purple-900 to-black",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-blue-500/90' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-purple-500/90'
          : drum.id === 'pedal'
            ? 'bg-indigo-400/90'
            : 'bg-cyan-300/90'
    }))
  },
  indian: {
    background: "bg-[url('https://images.unsplash.com/photo-1515091943872-2c080995eecb?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-orange-600/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-500/80'
          : drum.id === 'pedal'
            ? 'bg-brown-500/80'
            : 'bg-amber-100/80'
    }))
  },
};

interface DrumsProps {
  drumType?: string;
}

const Drums = ({ drumType = 'standard' }: DrumsProps) => {
  const [activeElements, setActiveElements] = useState<string[]>([]);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reverbLevel, setReverbLevel] = useState<number>(0.3);
  const [toneQuality, setToneQuality] = useState<number>(0.5);
  const [drumKitType, setDrumKitType] = useState<string>(drumType);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(true);
  const [stickPosition, setStickPosition] = useState<{x: number, y: number} | null>(null);
  
  useEffect(() => {
    setDrumKitType(drumType);
  }, [drumType]);
  
  const audioContext = useRef<AudioContext | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drumStickRef = useRef<HTMLDivElement>(null);

  const currentTheme = drumKitThemes[drumKitType as keyof typeof drumKitThemes] || drumKitThemes.standard;
  const drumKit = currentTheme.elements;

  useEffect(() => {
    const initializeAudioContext = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        createReverb(audioContext.current);
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

  const createReverb = async (audioCtx: AudioContext) => {
    if (reverbNode.current) return reverbNode.current;
    
    const convolver = audioCtx.createConvolver();
    
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 2;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const n = i / length;
      const decay = Math.exp(-n * 6);
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }
    
    convolver.buffer = impulse;
    reverbNode.current = convolver;
    return convolver;
  };

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
    
    drumGain.gain.value = volume;
    
    let toneAdjustment = toneQuality;
    let volumeAdjustment = 1.0;
    
    switch (drumKitType) {
      case 'rock':
        toneAdjustment = Math.min(1.0, toneQuality * 1.3);
        volumeAdjustment = 1.2;
        break;
      case 'jazz':
        toneAdjustment = toneQuality * 0.8;
        volumeAdjustment = 0.9;
        break;
      case 'electronic':
        toneAdjustment = toneQuality * 1.5;
        volumeAdjustment = 1.1;
        break;
      case 'indian':
        toneAdjustment = toneQuality * 0.7;
        volumeAdjustment = 0.85;
        break;
      default:
        break;
    }
    
    drumGain.gain.value = volume * volumeAdjustment;
    
    switch (id) {
      case 'kick':
        generateKickSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      case 'snare':
        generateSnareSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      case 'hihat':
        generateHiHatSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      case 'tom1':
        generateTomSound(audioContext.current, drumGain, 180, toneAdjustment, drumKitType);
        break;
      case 'tom2':
        generateTomSound(audioContext.current, drumGain, 150, toneAdjustment, drumKitType);
        break;
      case 'crash':
        generateCrashSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      case 'ride':
        generateRideSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      case 'floor':
        generateTomSound(audioContext.current, drumGain, 100, toneAdjustment, drumKitType);
        break;
      case 'pedal':
        generatePedalSound(audioContext.current, drumGain, toneAdjustment, drumKitType);
        break;
      default:
        break;
    }
  };

  const generateKickSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const osc = audioCtx.createOscillator();
    let baseFreq = 150;
    let duration = 0.5;
    
    switch (drumKitType) {
      case 'rock':
        baseFreq = 80;
        duration = 0.6;
        break;
      case 'jazz':
        baseFreq = 100;
        duration = 0.35;
        break;
      case 'electronic':
        baseFreq = 60;
        duration = 0.7;
        break;
      case 'indian':
        baseFreq = 120;
        duration = 0.4;
        break;
      default:
        baseFreq = 150;
        duration = 0.5;
    }
    
    osc.frequency.setValueAtTime(baseFreq * (0.8 + toneQuality * 0.4), audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };
  
  const generateSnareSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    
    let filterFreq = 1000;
    let oscFreq = 180;
    let duration = 0.2;
    
    switch (drumKitType) {
      case 'rock':
        filterFreq = 800;
        oscFreq = 150;
        duration = 0.25;
        break;
      case 'jazz':
        filterFreq = 1200;
        oscFreq = 200;
        duration = 0.15;
        break;
      case 'electronic':
        filterFreq = 1500;
        oscFreq = 100;
        duration = 0.3;
        break;
      case 'indian':
        filterFreq = 1800;
        oscFreq = 220;
        duration = 0.18;
        break;
      default:
        filterFreq = 1000;
        oscFreq = 180;
        duration = 0.2;
    }
    
    noiseFilter.frequency.value = filterFreq + toneQuality * 2000;
    
    noise.connect(noiseFilter);
    noiseFilter.connect(gainNode);
    
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = oscFreq * (0.8 + toneQuality * 0.4);
    
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    
    noise.start();
    osc.start();
    noise.stop(audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  };
  
  const generateHiHatSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const hihatFilter = audioCtx.createBiquadFilter();
    hihatFilter.type = 'highpass';
    
    let filterFreq = 7000;
    let duration = 0.1;
    
    switch (drumKitType) {
      case 'rock':
        filterFreq = 6000;
        duration = 0.12;
        break;
      case 'jazz':
        filterFreq = 8000;
        duration = 0.08;
        break;
      case 'electronic':
        filterFreq = 9000;
        duration = 0.15;
        break;
      case 'indian':
        filterFreq = 7500;
        duration = 0.09;
        break;
      default:
        filterFreq = 7000;
        duration = 0.1;
    }
    
    hihatFilter.frequency.value = filterFreq + toneQuality * 3000;
    
    noise.connect(hihatFilter);
    
    const envelopeGain = audioCtx.createGain();
    envelopeGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    envelopeGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    hihatFilter.connect(envelopeGain);
    envelopeGain.connect(gainNode);
    
    noise.start();
    noise.stop(audioCtx.currentTime + duration);
  };
  
  const generateTomSound = (audioCtx: AudioContext, gainNode: GainNode, baseFreq: number, toneQuality: number, drumKitType: string) => {
    const osc = audioCtx.createOscillator();
    
    let freqMultiplier = 1.0;
    let duration = 0.4;
    let oscType: OscillatorType = 'sine';
    
    switch (drumKitType) {
      case 'rock':
        freqMultiplier = 0.9;
        duration = 0.5;
        oscType = 'triangle';
        break;
      case 'jazz':
        freqMultiplier = 1.1;
        duration = 0.3;
        oscType = 'sine';
        break;
      case 'electronic':
        freqMultiplier = 0.8;
        duration = 0.6;
        oscType = 'sawtooth';
        break;
      case 'indian':
        freqMultiplier = 1.2;
        duration = 0.35;
        oscType = 'sine';
        break;
      default:
        freqMultiplier = 1.0;
        duration = 0.4;
        oscType = 'sine';
    }
    
    osc.type = oscType;
    
    const adjustedFreq = baseFreq * freqMultiplier * (0.8 + toneQuality * 0.4);
    osc.frequency.setValueAtTime(adjustedFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(adjustedFreq * 0.5, audioCtx.currentTime + duration);
    
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0.9, audioCtx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(envelope);
    envelope.connect(gainNode);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };
  
  const generateCrashSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const crashFilter = audioCtx.createBiquadFilter();
    crashFilter.type = 'bandpass';
    
    let filterFreq = 3000;
    let filterQ = 1;
    let duration = 1.0;
    
    switch (drumKitType) {
      case 'rock':
        filterFreq = 2500;
        filterQ = 0.8;
        duration = 1.2;
        break;
      case 'jazz':
        filterFreq = 3500;
        filterQ = 1.2;
        duration = 0.9;
        break;
      case 'electronic':
        filterFreq = 4000;
        filterQ = 2;
        duration = 1.4;
        break;
      case 'indian':
        filterFreq = 3200;
        filterQ = 1.5;
        duration = 0.8;
        break;
      default:
        filterFreq = 3000;
        filterQ = 1;
        duration = 1.0;
    }
    
    crashFilter.frequency.value = filterFreq + toneQuality * 3000;
    crashFilter.Q.value = filterQ;
    
    noise.connect(crashFilter);
    
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0.5, audioCtx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    crashFilter.connect(envelope);
    envelope.connect(gainNode);
    
    noise.start();
    noise.stop(audioCtx.currentTime + duration);
  };
  
  const generateRideSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const rideFilter = audioCtx.createBiquadFilter();
    rideFilter.type = 'bandpass';
    
    let filterFreq = 5000;
    let filterQ = 2;
    let duration = 1.2;
    
    switch (drumKitType) {
      case 'rock':
        filterFreq = 4500;
        filterQ = 1.8;
        duration = 1.4;
        break;
      case 'jazz':
        filterFreq = 5500;
        filterQ = 2.2;
        duration = 1.6;
        break;
      case 'electronic':
        filterFreq = 6000;
        filterQ = 3;
        duration = 1.0;
        break;
      case 'indian':
        filterFreq = 5200;
        filterQ = 2.5;
        duration = 1.1;
        break;
      default:
        filterFreq = 5000;
        filterQ = 2;
        duration = 1.2;
    }
    
    rideFilter.frequency.value = filterFreq + toneQuality * 2000;
    rideFilter.Q.value = filterQ;
    
    noise.connect(rideFilter);
    
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0.3, audioCtx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    rideFilter.connect(envelope);
    envelope.connect(gainNode);
    
    noise.start();
    noise.stop(audioCtx.currentTime + duration);
  };
  
  const generatePedalSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
    const osc = audioCtx.createOscillator();
    
    let baseFreq = 80;
    let duration = 0.3;
    let oscType: OscillatorType = 'sine';
    
    switch (drumKitType) {
      case 'rock':
        baseFreq = 60;
        duration = 0.4;
        oscType = 'triangle';
        break;
      case 'jazz':
        baseFreq = 90;
        duration = 0.25;
        oscType = 'sine';
        break;
      case 'electronic':
        baseFreq = 50;
        duration = 0.5;
        oscType = 'sawtooth';
        break;
      case 'indian':
        baseFreq = 100;
        duration = 0.2;
        oscType = 'sine';
        break;
      default:
        baseFreq = 80;
        duration = 0.3;
        oscType = 'sine';
    }
    
    osc.type = oscType;
    osc.frequency.setValueAtTime(baseFreq * (0.8 + toneQuality * 0.4), audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + duration);
    
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0.8, audioCtx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(envelope);
    envelope.connect(gainNode);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  const getDrumKitIcon = () => {
    switch(drumKitType) {
      case 'rock':
        return <Drumstick className="mr-2" size={18} />;
      case 'electronic':
        return <Disc3 className="mr-2" size={18} />;
      case 'jazz':
        return <Disc2 className="mr-2" size={18} />;
      case 'indian':
        return <Music4 className="mr-2" size={18} />;
      default:
        return <Drum className="mr-2" size={18} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="mb-6 flex gap-4 flex-wrap justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-md border border-gray-200/20 p-3">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            {getDrumKitIcon()}
            Drum kit
          </h3>
          <div className="space-y-2">
            {['standard', 'rock', 'jazz', 'electronic', 'indian'].map((kit) => (
              <div 
                key={kit}
                className={`px-3 py-1.5 text-sm cursor-pointer rounded-sm transition-colors ${
                  drumKitType === kit 
                    ? 'bg-primary/20 text-primary-foreground' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => setDrumKitType(kit)}
              >
                {kit.charAt(0).toUpperCase() + kit.slice(1)}
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="h-10 px-4 py-2 rounded-md bg-secondary/50 text-sm font-medium hover:bg-secondary/70 transition-colors"
          onClick={() => setShowShortcuts(!showShortcuts)}
        >
          {showShortcuts ? 'Hide shortcuts' : 'Show shortcuts'}
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-gradient-to-b from-gray-900/50 to-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 mb-6 overflow-hidden"
      >
        <div className="relative w-full h-full">
          <div className={`absolute inset-0 ${currentTheme.background} bg-cover bg-center opacity-50 rounded-lg`}></div>
          
          <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full shadow-2xl overflow-hidden">
            <div className={`absolute inset-0 ${drumKitType === 'electronic' ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-red-900 to-red-700'} opacity-80`}></div>
            <div className={`absolute inset-2 rounded-full border-8 ${drumKitType === 'jazz' ? 'border-amber-600/40' : drumKitType === 'indian' ? 'border-orange-800/40' : drumKitType === 'electronic' ? 'border-indigo-800/40' : 'border-amber-800/40'}`}></div>
            <div 
              data-drum-id="kick" 
              className={`absolute inset-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
          
          {drumKit.filter(d => d.id !== 'kick').map((drum) => (
            <div 
              key={drum.id}
              className={`absolute ${
                typeof drum.position.top === 'string' ? `top-[${drum.position.top}]` : ''
              } ${
                typeof drum.position.left === 'string' ? `left-[${drum.position.left}]` : ''
              } ${
                typeof drum.position.bottom === 'string' ? `bottom-[${drum.position.bottom}]` : ''
              } ${
                drum.id === 'pedal' ? 'w-[10%]' : 
                drum.id.includes('hihat') || drum.id.includes('crash') || drum.id.includes('ride') ? 'w-[15%]' : 
                'w-[15%]'
              } aspect-square rounded-full shadow-xl overflow-hidden`}
            >
              <div className={`absolute inset-0 ${drum.color} opacity-90`}></div>
              
              {(drum.id === 'hihat' || drum.id === 'crash' || drum.id === 'ride') && (
                <div className="absolute inset-1 rounded-full border-2 border-yellow-900/40 flex items-center justify-center">
                  <div className={`w-[${drum.id === 'hihat' ? '60%' : '70%'}] h-[${drum.id === 'hihat' ? '60%' : '70%'}] rounded-full border-2 border-yellow-800/30`}></div>
                  {drum.id !== 'hihat' && <div className="w-[40%] h-[40%] rounded-full border-2 border-yellow-800/30"></div>}
                </div>
              )}
              
              <div 
                data-drum-id={drum.id} 
                className={`absolute inset-2 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  activeElements.includes(drum.id) ? 'scale-95 brightness-110' : 'hover:brightness-105'
                } ${
                  drum.id === 'pedal' ? 'rounded-lg inset-0' : 
                  drum.id === 'hihat' || drum.id === 'crash' || drum.id === 'ride' ? 'inset-0' : 
                  'bg-gradient-to-br from-orange-100 to-orange-200'
                } ${
                  drum.id === 'crash' ? 'transform rotate-12' : 
                  drum.id === 'ride' ? 'transform -rotate-6' : 
                  ''
                }`}
                onClick={() => playDrumSound(drum.id)}
              >
                {showShortcuts && (
                  <span className="flex items-center justify-center w-8 h-8 bg-green-600/80 rounded-full text-white font-bold text-sm z-10">
                    {drum.key}
                  </span>
                )}
              </div>
            </div>
          ))}
          
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
              <div className={`absolute top-[75%] right-[15%] w-2 h-20 ${
                drumKitType === 'rock' ? 'bg-gradient-to-b from-gray-800 to-gray-700' :
                drumKitType === 'electronic' ? 'bg-gradient-to-b from-purple-800 to-purple-700' :
                drumKitType === 'indian' ? 'bg-gradient-to-b from-orange-800 to-orange-700' :
                'bg-gradient-to-b from-amber-800 to-amber-700'
              } rounded-full transform rotate-45 origin-bottom`}>
                <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-amber-900"></div>
              </div>
              <div className={`absolute top-[75%] right-[25%] w-2 h-20 ${
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
      
      <div className="w-full max-w-sm mx-auto mb-8">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          reverbLevel={reverbLevel}
          setReverbLevel={setReverbLevel}
          toneQuality={toneQuality}
          setToneQuality={setToneQuality}
        />
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center text-sm mb-4">
        {drumKit.map((drum) => (
          <div 
            key={drum.id}
            className="p-2 bg-secondary/30 rounded border border-secondary/30 hover:bg-secondary/40 cursor-pointer transition-colors"
            onClick={() => playDrumSound(drum.id)}
          >
            <div className="font-medium">{drum.label}</div>
            <div className="text-xs text-muted-foreground">{drum.key}</div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Click on the drum elements or press the corresponding keys to play</p>
        <div className="mt-2 flex justify-center items-center gap-2">
          <Music4 size={16} />
          <span>Choose different drum kits for different sound styles</span>
        </div>
      </div>
    </div>
  );
};

export default Drums;
