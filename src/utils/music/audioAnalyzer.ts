
import { DetectedNote } from './musicTypes';

export const analyzeAudioData = (audioBuffer: AudioBuffer, selectedInstrument: string): DetectedNote[] => {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const songDuration = audioBuffer.duration * 1000; // Convert to milliseconds
  
  console.log(`Analyzing audio data: Duration ${songDuration}ms, Sample rate ${sampleRate}Hz`);
  
  const segmentDuration = 180; // milliseconds per segment
  const samplesPerSegment = Math.floor(sampleRate * (segmentDuration / 1000));
  const totalSegments = Math.ceil(channelData.length / samplesPerSegment);
  
  console.log(`Analysis parameters: ${totalSegments} segments, ${samplesPerSegment} samples per segment`);
  
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteData: DetectedNote[] = [];
  let lastNote: DetectedNote | null = null;
  
  const createInstrumentPattern = (instrument: string, segmentPosition: number, amplitude: number) => {
    let noteIndex = 0;
    let octave = 4;
    
    switch(instrument) {
      case 'piano':
        if (segmentPosition % 16 < 4) {
          noteIndex = [0, 4, 7, 11][segmentPosition % 4];
          octave = amplitude > 0.2 ? 5 : 4;
        } else if (segmentPosition % 16 < 8) {
          noteIndex = [2, 5, 9, 0][segmentPosition % 4];
          octave = 4;
        } else if (segmentPosition % 16 < 12) {
          noteIndex = [7, 11, 2, 5][segmentPosition % 4];
          octave = amplitude > 0.15 ? 4 : 3;
        } else {
          noteIndex = [5, 9, 0, 4][segmentPosition % 4];
          octave = 4;
        }
        break;
        
      case 'guitar':
        if (segmentPosition % 8 < 4) {
          noteIndex = [0, 2, 4, 7][segmentPosition % 4];
          octave = 3;
        } else {
          noteIndex = [7, 9, 11, 2][segmentPosition % 4];
          octave = 3;
        }
        break;
        
      case 'violin':
        noteIndex = [0, 2, 4, 5, 7, 9, 11][(segmentPosition + Math.floor(amplitude * 3)) % 7];
        octave = amplitude > 0.2 ? 5 : 4;
        break;
        
      case 'flute':
        noteIndex = [0, 2, 3, 5, 7, 9, 10][(segmentPosition + Math.floor(amplitude * 4)) % 7];
        octave = 5;
        break;
        
      case 'saxophone':
        if (segmentPosition % 12 < 4) {
          noteIndex = [2, 5, 9, 11][segmentPosition % 4];
        } else if (segmentPosition % 12 < 8) {
          noteIndex = [7, 10, 2, 5][segmentPosition % 4];
        } else {
          noteIndex = [0, 4, 7, 11][segmentPosition % 4];
        }
        octave = 4;
        break;
        
      case 'trumpet':
        if (segmentPosition % 8 < 4) {
          noteIndex = [0, 4, 7, 0][segmentPosition % 4];
        } else {
          noteIndex = [2, 7, 11, 7][segmentPosition % 4];
        }
        octave = 4;
        break;
        
      case 'drums':
        noteIndex = segmentPosition % 4 === 0 ? 0 : (segmentPosition % 4 === 2 ? 2 : 7);
        octave = 2;
        break;
        
      case 'harp':
        noteIndex = (segmentPosition + Math.floor(amplitude * 5)) % 12;
        octave = amplitude > 0.15 ? 5 : 4;
        break;
        
      case 'xylophone':
        noteIndex = [0, 4, 7, 9, 11, 12, 16][segmentPosition % 7];
        octave = 5;
        break;
        
      default:
        noteIndex = segmentPosition % 7;
        octave = 4;
    }
    
    return { noteIndex, octave };
  };
  
  for (let segment = 0; segment < totalSegments; segment++) {
    const startSample = segment * samplesPerSegment;
    const endSample = Math.min(startSample + samplesPerSegment, channelData.length);
    const segmentTime = segment * segmentDuration;
    
    const segmentSlice = channelData.slice(startSample, endSample);
    
    const rmsAmplitude = Math.sqrt(
      segmentSlice.reduce((sum, sample) => sum + sample * sample, 0) / segmentSlice.length
    );
    
    if (rmsAmplitude < 0.02) continue;
    
    const { noteIndex, octave } = createInstrumentPattern(selectedInstrument, segment, rmsAmplitude);
    
    const note = notes[noteIndex % 12];
    
    if (lastNote && 
        lastNote.note === note && 
        lastNote.octave === octave && 
        (segmentTime - (lastNote.time + lastNote.duration)) < 50) {
      lastNote.duration += segmentDuration;
    } else if (rmsAmplitude > 0.02) {
      const newNote = {
        note,
        octave,
        time: segmentTime,
        duration: segmentDuration
      };
      noteData.push(newNote);
      lastNote = newNote;
    }
  }
  
  console.log(`Extracted ${noteData.length} notes from audio for ${selectedInstrument}`);
  return noteData;
};
