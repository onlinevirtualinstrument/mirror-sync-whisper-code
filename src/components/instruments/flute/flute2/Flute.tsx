
import { useState, useEffect } from 'react';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';

interface FluteProps {
  variant?: string;
}

const Flute = ({ variant = 'standard' }: FluteProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [fluteVariant, setFluteVariant] = useState<string>(variant);
  
  // Define available flute variants
  const fluteVariants = [
    { id: 'standard', name: 'Standard' },
    { id: 'bamboo', name: 'Bamboo' },
    { id: 'silver', name: 'Silver' },
    { id: 'classical', name: 'Classical' },
    { id: 'alto', name: 'Alto' },
    { id: 'bass', name: 'Bass' }
  ];
  
  // Define the notes for the flute (pentatonic scale for simplicity)
  const getNotesForVariant = (variant: string) => {
    const baseNotes = [
      { note: 'C', freq: 523.25, key: '1', color: 'bg-blue-400' },
      { note: 'D', freq: 587.33, key: '2', color: 'bg-blue-500' },
      { note: 'E', freq: 659.25, key: '3', color: 'bg-blue-600' },
      { note: 'G', freq: 783.99, key: '4', color: 'bg-blue-700' },
      { note: 'A', freq: 880.00, key: '5', color: 'bg-blue-800' },
      { note: 'C5', freq: 1046.50, key: '6', color: 'bg-blue-900' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'bamboo':
        colorScheme = ['bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900'];
        freqAdjust = 0.85; // Lower pitch for bamboo flute - more distinctive
        break;
      case 'silver':
        colorScheme = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800'];
        freqAdjust = 1.12; // Higher pitch for silver flute - brighter sound
        break;
      case 'classical':
        colorScheme = ['bg-amber-300', 'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700', 'bg-amber-800'];
        freqAdjust = 0.93; // Slightly lower for richer classical tone
        break;
      case 'alto':
        colorScheme = ['bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800'];
        freqAdjust = 0.75; // Lower pitch for alto flute
        break;
      case 'bass':
        colorScheme = ['bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800'];
        freqAdjust = 0.5; // Much lower pitch for bass flute
        break;
      default:
        colorScheme = ['bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900'];
    }
    
    return baseNotes.map((note, index) => ({
      ...note,
      color: colorScheme[index],
      freq: note.freq * freqAdjust
    }));
  };
  
  const notes = getNotesForVariant(fluteVariant);

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
    };

    if (!audioContext) {
      initAudio();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const noteObj = notes.find(n => n.key === key);
      if (noteObj) {
        playNote(noteObj.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioContext, notes]);

  const playNote = (frequency: number) => {
    if (!audioContext) return;

    // Create primary oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Create secondary oscillator for richer tone
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    // Create tertiary oscillator for harmonics
    const oscillator3 = audioContext.createOscillator();
    const gainNode3 = audioContext.createGain();
    
    // Optional tremolo for some variants
    const tremoloOsc = audioContext.createOscillator();
    const tremoloGain = audioContext.createGain();
    
    // Optional noise component for air sound
    const noiseNode = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();
    
    // Create noise buffer
    const bufferSize = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseNode.buffer = buffer;
    
    // Flute-like timbre settings based on variant
    let oscType: OscillatorType = 'sine';
    let osc2Type: OscillatorType = 'sine';
    let osc3Type: OscillatorType = 'sine';
    let attackTime = 0.1;
    let releaseTime = 1.5;
    let harmonicRatio = 1.01; // Slight detuning for second oscillator
    let harmonic3Ratio = 2.0;  // Second harmonic for third oscillator
    let tremoloFreq = 0;
    let tremoloDepth = 0;
    let reverbAmount = 0.1;
    let noiseAmount = 0.05;
    let mainGain = 0.7;
    let harmonic2Gain = 0.15;
    let harmonic3Gain = 0.0;
    
    switch(fluteVariant) {
      case 'bamboo':
        oscType = 'sine';
        osc2Type = 'triangle';
        osc3Type = 'sine';
        attackTime = 0.15;
        releaseTime = 1.8;
        harmonicRatio = 2.0; // Octave up for breathy overtone
        harmonic3Ratio = 3.0; // Higher overtone
        tremoloFreq = 6;
        tremoloDepth = 0.2;
        reverbAmount = 0.25;
        noiseAmount = 0.15; // More air noise
        mainGain = 0.6;
        harmonic2Gain = 0.2;
        harmonic3Gain = 0.05;
        break;
      case 'silver':
        oscType = 'sine';
        osc2Type = 'sine';
        osc3Type = 'triangle';
        attackTime = 0.05;
        releaseTime = 2.0;
        harmonicRatio = 1.5; // Fifth harmonic for bright silver tone
        harmonic3Ratio = 2.0; // Octave
        tremoloFreq = 7.5;
        tremoloDepth = 0.1;
        reverbAmount = 0.15;
        noiseAmount = 0.08;
        mainGain = 0.75;
        harmonic2Gain = 0.15;
        harmonic3Gain = 0.1;
        break;
      case 'classical':
        oscType = 'sine';
        osc2Type = 'triangle';
        osc3Type = 'sine';
        attackTime = 0.12;
        releaseTime = 2.2;
        harmonicRatio = 1.008; // Slight detuning for warm chorus effect
        harmonic3Ratio = 2.005; // Slight detuned octave
        tremoloFreq = 5;
        tremoloDepth = 0.15;
        reverbAmount = 0.3;
        noiseAmount = 0.1;
        mainGain = 0.65;
        harmonic2Gain = 0.18;
        harmonic3Gain = 0.08;
        break;
      case 'alto':
        oscType = 'sine';
        osc2Type = 'triangle';
        osc3Type = 'sine';
        attackTime = 0.18;
        releaseTime = 2.5;
        harmonicRatio = 2.02; // Slightly detuned octave
        harmonic3Ratio = 3.01; // Slightly detuned 12th
        tremoloFreq = 4.5;
        tremoloDepth = 0.18;
        reverbAmount = 0.35;
        noiseAmount = 0.12;
        mainGain = 0.7;
        harmonic2Gain = 0.22;
        harmonic3Gain = 0.12;
        break;
      case 'bass':
        oscType = 'sine';
        osc2Type = 'sine';
        osc3Type = 'triangle';
        attackTime = 0.25;
        releaseTime = 2.8;
        harmonicRatio = 2.0; // Octave
        harmonic3Ratio = 3.0; // 12th
        tremoloFreq = 3.5;
        tremoloDepth = 0.22;
        reverbAmount = 0.4;
        noiseAmount = 0.15;
        mainGain = 0.75;
        harmonic2Gain = 0.25;
        harmonic3Gain = 0.15;
        break;
      default:
        oscType = 'sine';
        osc2Type = 'sine';
    }
    
    // Setup primary oscillator
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;
    
    // Setup secondary oscillator for richer harmonics
    oscillator2.type = osc2Type;
    oscillator2.frequency.value = frequency * harmonicRatio;
    gainNode2.gain.value = harmonic2Gain;
    
    // Setup tertiary oscillator for additional harmonics
    oscillator3.type = osc3Type;
    oscillator3.frequency.value = frequency * harmonic3Ratio;
    gainNode3.gain.value = harmonic3Gain;
    
    // Setup noise for breath sound
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = frequency * 2;
    noiseFilter.Q.value = 1;
    noiseGain.gain.value = noiseAmount;
    
    // Envelope for primary tone
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(mainGain, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    // Envelope for secondary tone
    gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode2.gain.linearRampToValueAtTime(harmonic2Gain, audioContext.currentTime + (attackTime * 1.1));
    gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    // Envelope for tertiary tone
    gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode3.gain.linearRampToValueAtTime(harmonic3Gain, audioContext.currentTime + (attackTime * 1.2));
    gainNode3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    // Envelope for noise
    noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
    noiseGain.gain.linearRampToValueAtTime(noiseAmount, audioContext.currentTime + (attackTime * 0.8));
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime * 0.7);
    
    // Setup tremolo for expressive variations if needed
    if (tremoloFreq > 0) {
      tremoloOsc.type = 'sine';
      tremoloOsc.frequency.value = tremoloFreq;
      tremoloGain.gain.value = tremoloDepth;
      
      tremoloOsc.connect(tremoloGain);
      tremoloGain.connect(gainNode.gain);
      tremoloOsc.start();
      tremoloOsc.stop(audioContext.currentTime + releaseTime);
    }
    
    // Create a simple reverb effect
    if (reverbAmount > 0) {
      const convolver = audioContext.createConvolver();
      const reverbGain = audioContext.createGain();
      reverbGain.gain.value = reverbAmount;
      
      // Simple impulse response
      const impulseLength = audioContext.sampleRate * 2.5; // 2.5 second reverb
      const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate);
      
      for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
        }
      }
      
      convolver.buffer = impulse;
      
      // Connect primary oscillator
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Connect secondary oscillator
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      // Connect tertiary oscillator
      oscillator3.connect(gainNode3);
      gainNode3.connect(audioContext.destination);
      
      // Connect noise
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      // Add reverb path
      gainNode.connect(convolver);
      gainNode2.connect(convolver);
      gainNode3.connect(convolver);
      noiseGain.connect(convolver);
      convolver.connect(reverbGain);
      reverbGain.connect(audioContext.destination);
    } else {
      // Simple connection without reverb
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator3.connect(gainNode3);
      gainNode3.connect(audioContext.destination);
      
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
    }
    
    oscillator.start();
    oscillator2.start();
    oscillator3.start();
    noiseNode.start();
    
    oscillator.stop(audioContext.currentTime + releaseTime);
    oscillator2.stop(audioContext.currentTime + releaseTime);
    oscillator3.stop(audioContext.currentTime + releaseTime);
    noiseNode.stop(audioContext.currentTime + releaseTime);
    
    // Add visual feedback by finding the hole and adding 'active' class
    const noteElement = document.querySelector(`[data-freq="${frequency}"]`);
    if (noteElement) {
      noteElement.classList.add('active');
      setTimeout(() => {
        noteElement.classList.remove('active');
      }, 300);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <InstrumentVariantSelector
          currentVariant={fluteVariant}
          setVariant={setFluteVariant}
          variants={fluteVariants}
          label="Select Flute Type"
        />
      </div>
      
      <div className={`w-20 md:w-24 h-80 md:h-96 rounded-full relative shadow-lg ${
        fluteVariant === 'bamboo' ? 'bg-gradient-to-b from-green-600 to-green-800' :
        fluteVariant === 'silver' ? 'bg-gradient-to-b from-gray-300 to-gray-500' :
        fluteVariant === 'classical' ? 'bg-gradient-to-b from-amber-500 to-amber-700' :
        fluteVariant === 'alto' ? 'bg-gradient-to-b from-purple-500 to-purple-700' :
        fluteVariant === 'bass' ? 'bg-gradient-to-b from-indigo-600 to-indigo-800' :
        'bg-gradient-to-b from-amber-600 to-amber-800'
      }`}>
        {/* Flute holes */}
        <div className="absolute left-0 right-0 flex flex-col items-center gap-8 top-20">
          {notes.map((note, index) => (
            <div 
              key={note.note}
              data-freq={note.freq}
              className={`w-10 h-10 rounded-full ${note.color} hover:opacity-80 active:opacity-60 cursor-pointer transition-all shadow-inner relative`}
              onClick={() => playNote(note.freq)}
            >
              <div className="absolute -right-8 text-xs text-white">
                <div>{note.note}</div>
                <div className="opacity-70">Key {note.key}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Click on the flute holes to play or use number keys (1-6)</p>
      </div>
    </div>
  );
};

export default Flute;
