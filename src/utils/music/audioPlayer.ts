class AudioPlayer {
  private static instance: AudioPlayer;
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private volume = 1.0; // Default volume (0.0 to 1.0)
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private recordedAudio: Blob | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private activeOscillators: Map<string, { oscillator: OscillatorNode, gainNode: GainNode, startTime?: number }> = new Map();
  private recordingInProgress = false;
  private recordedNotes: Array<{ note: string, frequency: number, startTime: number, duration: number }> = [];
  private recordingStartTime = 0;
  private offlineAudioContext: OfflineAudioContext | null = null;

  private constructor() {
    // Create AudioContext on user interaction to comply with browser policies
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      // Use newer AudioContext API with fallback
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = this.volume;
      }
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  public play(soundUrl: string): void {
    // Stop any currently playing sound
    this.stop();
    
    // Try using Web Audio API for better performance
    if (this.audioContext && this.gainNode) {
      fetch(soundUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          const source = this.audioContext!.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(this.gainNode!);
          source.start(0);
          this.isPlaying = true;
          
          // Handle when audio finishes
          source.onended = () => {
            this.isPlaying = false;
          };
        })
        .catch(error => {
          console.error('Error with Web Audio API:', error);
          this.fallbackPlay(soundUrl);
        });
    } else {
      this.fallbackPlay(soundUrl);
    }
  }

  private fallbackPlay(soundUrl: string): void {
    // Fallback to standard HTML5 Audio
    this.audio = new Audio(soundUrl);
    this.audio.volume = this.volume;
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
    });
    
    this.audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
    
    this.isPlaying = true;
  }

  public playNote(frequency: number, waveform: OscillatorType = 'sine', noteId?: string): string | undefined {
    if (this.audioContext && this.gainNode) {
      // Create unique ID for this note if not provided
      const id = noteId || `note-${frequency}-${Date.now()}`;
      
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = waveform;
      oscillator.frequency.value = frequency;
      
      // Apply envelope for piano-like sound
      const envelope = this.audioContext.createGain();
      envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
      envelope.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
      
      oscillator.connect(envelope);
      envelope.connect(this.gainNode);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 2);
      
      // Store the oscillator and gain node for future reference
      const noteData = { oscillator, gainNode: envelope };
      this.activeOscillators.set(id, noteData);
      
      this.isPlaying = true;
      
      // Record the note if we're recording
      if (this.recordingInProgress) {
        const noteStartTime = Date.now() - this.recordingStartTime;
        
        // Store the start time for this note ID
        const storedNote = this.activeOscillators.get(id);
        if (storedNote) {
          storedNote.startTime = noteStartTime;
        }
      }
      
      // Clean up after the note finishes
      setTimeout(() => {
        if (this.recordingInProgress && this.activeOscillators.has(id)) {
          const noteInfo = this.activeOscillators.get(id);
          if (noteInfo && noteInfo.startTime !== undefined) {
            const duration = Date.now() - this.recordingStartTime - noteInfo.startTime;
            
            // Add the completed note to our recorded notes
            this.recordedNotes.push({
              note: id,
              frequency: frequency,
              startTime: noteInfo.startTime,
              duration: duration
            });
            
            console.log(`Recorded note: freq=${frequency}, start=${noteInfo.startTime}ms, duration=${duration}ms`);
          }
        }
        
        this.activeOscillators.delete(id);
        if (this.activeOscillators.size === 0) {
          this.isPlaying = false;
        }
      }, 2000);
      
      return id;
    } else {
      // Fallback to standard sample playback
      this.play('/sounds/piano.mp3');
      return undefined;
    }
  }
  
  private getSemitonesFromC4(note: string, octave: number): number {
    const noteValues: Record<string, number> = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    return (octave - 4) * 12 + noteValues[note];
  }

  public stop(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
    
    // Stop all active oscillators
    this.activeOscillators.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.activeOscillators.clear();
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(value: number): void {
    // Convert the value (0-100) to a range of 0.0 to 1.0
    this.volume = Math.max(0, Math.min(1, value / 100));
    
    // Apply the volume to the current audio if playing
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    
    // Apply to Web Audio API if available
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public getVolume(): number {
    // Return volume as percentage (0-100)
    return this.volume * 100;
  }
  
  public startPianoRecording(): void {
    this.recordingInProgress = true;
    this.recordingStartTime = Date.now();
    this.recordedNotes = [];
    console.log("Piano recording started");
  }
  
  public stopPianoRecording(): Array<{ note: string, frequency: number, startTime: number, duration: number }> {
    this.recordingInProgress = false;
    console.log(`Piano recording stopped. Recorded ${this.recordedNotes.length} notes.`);
    return [...this.recordedNotes]; // Return a copy of the recorded notes
  }
  
  public getRecordedNotes(): Array<{ note: string, frequency: number, startTime: number, duration: number }> {
    return [...this.recordedNotes]; // Return a copy to prevent external modification
  }
  
  public playRecordedNotes(callback?: () => void): void {
    if (this.recordedNotes.length === 0) {
      console.log("No recorded notes to play");
      if (callback) callback();
      return;
    }
    
    console.log(`Playing ${this.recordedNotes.length} recorded notes`);
    
    // Find the end time of the last note
    const lastNote = this.recordedNotes.reduce(
      (latest, note) => (note.startTime + note.duration > latest.startTime + latest.duration) ? note : latest,
      this.recordedNotes[0]
    );
    const recordingDuration = lastNote.startTime + lastNote.duration;
    
    // Play each note at its recorded time
    this.recordedNotes.forEach(note => {
      setTimeout(() => {
        this.playNote(note.frequency, 'sine', note.note);
      }, note.startTime);
    });
    
    // Call the callback after all notes have played
    if (callback) {
      setTimeout(callback, recordingDuration + 100);
    }
  }
  
  public startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices) {
        reject("Media devices not supported");
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.recordedChunks = [];
          
          this.mediaRecorder.addEventListener('dataavailable', (e) => {
            if (e.data.size > 0) {
              this.recordedChunks.push(e.data);
            }
          });
          
          this.mediaRecorder.addEventListener('stop', () => {
            this.recordedAudio = new Blob(this.recordedChunks, { type: 'audio/webm' });
          });
          
          this.mediaRecorder.start();
          resolve();
        })
        .catch(error => {
          console.error("Error starting recording:", error);
          reject(error);
        });
    });
  }
  
  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        // Add event listener to handle when recording stops
        this.mediaRecorder.addEventListener('stop', () => {
          this.recordedAudio = new Blob(this.recordedChunks, { type: 'audio/webm' });
          resolve(this.recordedAudio);
        }, { once: true });
        
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }
  
  public getRecordedAudioUrl(): string | null {
    if (this.recordedAudio) {
      return URL.createObjectURL(this.recordedAudio);
    }
    return null;
  }
  
  public shareRecordedAudio(): Promise<void> {
    if (!this.recordedAudio) {
      return Promise.reject("No recorded audio to share");
    }
    
    if (navigator.share) {
      const file = new File([this.recordedAudio], 'recording.webm', { type: 'audio/webm' });
      
      return navigator.share({
        title: 'My Audio Recording',
        text: 'Check out this audio I recorded on HarmonyHub!',
        files: [file]
      })
      .catch(error => {
        console.error("Error sharing audio:", error);
        return Promise.reject(error);
      });
    } else {
      return Promise.reject("Web Share API not supported");
    }
  }
  
  public downloadRecordedAudio(filename = 'harmonyhub-recording.webm'): void {
    if (!this.recordedAudio) {
      console.error("No recorded audio to download");
      return;
    }
    
    const url = URL.createObjectURL(this.recordedAudio);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  public generateInstrumentalFromAudio(audioFile: File, instrument: string): Promise<{ instrumental: Blob, notes: string[] }> {
    // In a real implementation, this would send the audio to a backend service
    // that would process it to create an instrumental version with the selected instrument
    
    return new Promise((resolve) => {
      console.log(`Generating instrumental for ${instrument} using file ${audioFile.name}`);
      
      // Simulate processing delay
      setTimeout(() => {
        // Generate different notes based on the instrument type
        const notes: string[] = [];
        let noteBase = '';
        
        // Generate different notes based on instrument type
        switch(instrument) {
          case 'grand-piano':
            noteBase = 'C';
            notes.push('C4', 'E4', 'G4', 'C5', 'G4', 'E4');
            break;
          case 'acoustic-guitar':
            noteBase = 'A';
            notes.push('A3', 'E4', 'A4', 'C#4', 'E4', 'A4');
            break;
          default:
            noteBase = 'D';
            notes.push('D4', 'F#4', 'A4', 'D5', 'A4', 'F#4');
        }
        
        // Add some random notes to make each generation unique
        const possibleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const possibleOctaves = [3, 4, 5];
        
        for (let i = 0; i < 4; i++) {
          const randomNote = possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
          const randomOctave = possibleOctaves[Math.floor(Math.random() * possibleOctaves.length)];
          notes.push(`${randomNote}${randomOctave}`);
        }
        
        // Create a dummy instrumental file with unique content based on the instrument
        // In a real implementation, this would be actual audio data
        const dummyData = new Uint8Array(1000);
        for (let i = 0; i < dummyData.length; i++) {
          dummyData[i] = (instrument.charCodeAt(0) + i) % 256;
        }
        
        const dummyInstrumental = new Blob([dummyData], { type: 'audio/mp3' });
        
        // Return a result with the instrument-specific content
        resolve({
          instrumental: dummyInstrumental,
          notes: notes
        });
      }, 2000);
    });
  }
  
  public playRecording(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    this.play(url);
  }
  
  public downloadRecording(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  
  public convertToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read blob"));
      };
    });
  }
  
  public downloadRecordedNotesAsMP3(filename = 'piano-recording.mp3'): Promise<void> {
    if (this.recordedNotes.length === 0) {
      console.error("No recorded notes to download");
      return Promise.reject("No recorded notes to download");
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Create an offline audio context for rendering
        const lastNote = this.recordedNotes.reduce(
          (latest, note) => (note.startTime + note.duration > latest.startTime + latest.duration) ? note : latest,
          this.recordedNotes[0]
        );
        
        // Calculate the total duration in seconds (add a second for padding)
        const totalDurationMs = lastNote.startTime + lastNote.duration + 1000;
        const totalDurationSec = totalDurationMs / 1000;
        
        // Create an offline audio context with the right duration and sample rate
        this.offlineAudioContext = new OfflineAudioContext(
          2, // stereo
          44100 * totalDurationSec, // sample rate * seconds
          44100 // sample rate
        );
        
        // Create a master gain node for the offline context
        const masterGain = this.offlineAudioContext.createGain();
        masterGain.gain.value = this.volume;
        masterGain.connect(this.offlineAudioContext.destination);
        
        // Render each note in the offline context
        this.recordedNotes.forEach(note => {
          const { frequency, startTime, duration } = note;
          
          // Create oscillator
          const oscillator = this.offlineAudioContext!.createOscillator();
          oscillator.type = 'sine'; // Using sine wave for clean sound
          oscillator.frequency.value = frequency;
          
          // Create envelope for the note
          const envelope = this.offlineAudioContext!.createGain();
          envelope.gain.setValueAtTime(0, startTime / 1000);
          envelope.gain.linearRampToValueAtTime(this.volume, (startTime / 1000) + 0.01);
          envelope.gain.exponentialRampToValueAtTime(0.001, (startTime / 1000) + (duration / 1000));
          
          oscillator.connect(envelope);
          envelope.connect(masterGain);
          
          // Schedule the note
          oscillator.start(startTime / 1000);
          oscillator.stop((startTime + duration + 100) / 1000); // Add a small buffer
        });
        
        // Render the audio
        this.offlineAudioContext.startRendering().then(renderedBuffer => {
          // Convert the rendered buffer to WAV format
          const wavBlob = this.bufferToWave(renderedBuffer, renderedBuffer.length);
          
          // Create an audio element to play the rendered audio
          const audio = new Audio(URL.createObjectURL(wavBlob));
          
          // For MP3 encoding, we'll use a simple workaround since browser APIs don't directly support MP3 encoding
          // We'll use the WAV file with .mp3 extension since most systems will handle this correctly
          // In a production app, you would use a server-side solution or a library like lamejs for proper MP3 encoding
          
          // Create a download link for the audio
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = URL.createObjectURL(wavBlob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            resolve();
          }, 100);
        }).catch(err => {
          console.error("Error rendering audio:", err);
          reject(err);
        });
      } catch (err) {
        console.error("Error creating audio file:", err);
        reject(err);
      }
    });
  }
  
  private bufferToWave(buffer: AudioBuffer, len: number): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const data = new Uint8Array(length);
    
    // Write WAV header
    this.writeString(data, 0, 'RIFF');
    this.writeUint32(data, 4, length - 8);
    this.writeString(data, 8, 'WAVE');
    this.writeString(data, 12, 'fmt ');
    this.writeUint32(data, 16, 16); // PCM format
    this.writeUint16(data, 20, 1); // PCM format type
    this.writeUint16(data, 22, numOfChan);
    this.writeUint32(data, 24, buffer.sampleRate);
    this.writeUint32(data, 28, buffer.sampleRate * 2 * numOfChan); // byte rate
    this.writeUint16(data, 32, numOfChan * 2); // block align
    this.writeUint16(data, 34, 16); // bits per sample
    this.writeString(data, 36, 'data');
    this.writeUint32(data, 40, length - 44);
    
    // Write the PCM samples
    let offset = 44;
    for (let i = 0; i < buffer.getChannelData(0).length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        this.writeInt16(data, offset, value);
        offset += 2;
      }
    }
    
    return new Blob([data], { type: 'audio/wav' });
  }
  
  private writeString(data: Uint8Array, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      data[offset + i] = str.charCodeAt(i);
    }
  }
  
  private writeUint32(data: Uint8Array, offset: number, value: number): void {
    data[offset] = value & 0xFF;
    data[offset + 1] = (value >> 8) & 0xFF;
    data[offset + 2] = (value >> 16) & 0xFF;
    data[offset + 3] = (value >> 24) & 0xFF;
  }
  
  private writeUint16(data: Uint8Array, offset: number, value: number): void {
    data[offset] = value & 0xFF;
    data[offset + 1] = (value >> 8) & 0xFF;
  }
  
  private writeInt16(data: Uint8Array, offset: number, value: number): void {
    this.writeUint16(data, offset, value < 0 ? value + 0x10000 : value);
  }
  
  public playNotesSequence(notes: Array<{note: string, octave: number, time: number, duration: number}>) {
    if (!notes || notes.length === 0) return Promise.resolve();
    
    console.log(`Starting to play sequence of ${notes.length} notes`);
    
    // Sort notes by time
    const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
    
    // Find the total duration of the sequence
    const lastNote = sortedNotes[sortedNotes.length - 1];
    const totalDuration = lastNote.time + lastNote.duration + 100; // Add a small buffer
    
    console.log(`Total playback duration: ${totalDuration}ms`);
    
    // Create a map to track active notes for visualization
    const activeNotes = new Map<string, number>();
    
    // Play each note at the specified time
    sortedNotes.forEach(({ note, octave, time, duration }) => {
      setTimeout(() => {
        // Calculate the frequency for this note
        const baseFrequency = this.getNoteFrequency(note, octave);
        
        // Generate a unique ID for this note instance
        const noteId = `${note}${octave}-${Date.now()}`;
        
        // Play the note with the specified duration
        this.playTone(baseFrequency, duration);
        
        // Track the active note for visualization
        activeNotes.set(noteId, Date.now());
        
        // Clean up after the note duration
        setTimeout(() => {
          activeNotes.delete(noteId);
        }, duration);
        
        // Also visually highlight the key on the piano by dispatching a custom event
        const pianoKeyEvent = new CustomEvent('piano:playKey', { 
          detail: { note, octave, duration } 
        });
        window.dispatchEvent(pianoKeyEvent);
        
        console.log(`Playing note ${note}${octave} at ${time}ms for ${duration}ms`);
      }, time);
    });
    
    // Return a promise that resolves when all notes have been played
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(`Finished playing note sequence after ${totalDuration}ms`);
        resolve();
      }, totalDuration);
    });
  }
  
  public getNoteFrequency(note: string, octave: number): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseFreq = 440; // A4 frequency
    const A4OctavePosition = 4;
    
    // Find semitone distance from A4
    const noteIndex = notes.indexOf(note);
    if (noteIndex === -1) return 0; // Invalid note
    
    const A_index = notes.indexOf('A');
    let semitonesFromA4 = (octave - A4OctavePosition) * 12 + (noteIndex - A_index);
    
    // Calculate frequency using equal temperament formula
    return baseFreq * Math.pow(2, semitonesFromA4 / 12);
  }
  

  public playTone(frequency: number, duration: number, waveform: OscillatorType = 'sine', velocity: number = 0.7) {
    if (!this.audioContext || !this.gainNode) {
      this.initAudioContext();
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
     
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = this.volume;
    
    // Apply envelope for more natural sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.05);
    
    oscillator.start();
    
    // Set release envelope
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      setTimeout(() => oscillator.stop(), 500);
    }, Math.max(0, duration - 500));
  }
}

export default AudioPlayer.getInstance();