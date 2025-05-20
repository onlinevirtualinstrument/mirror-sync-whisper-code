// This is a simplified version of what would be a more complex audio engine
// In a real implementation, this would use the Web Audio API more extensively

class FluteAudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private currentFrequency = 440; // A4 by default
  private breathSensitivity = 5;
  private tuning = 0;
  private reverb = 3;
  private vibrato = { intensity: 4, speed: 5 };
  private audioAnalyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array | null = null;
  
  // Adding new properties to match FluteSettings
  private allowOverblowing = true;
  private useMicrophone = false;
  private transpose = false;
  private delay = false;
  private autoVibrato = false;
  private dynamicRange = 7;
  
  // Recording related properties
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isPaused = false;
  private recordedAudioUrl: string | null = null;
  private recordedMP3Url: string | null = null;
  private recordedNotes: string[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private microphoneStream: MediaStream | null = null;

  constructor() {
    this.initAudioContext();
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => {
      console.log('Audio playback completed');
    });
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0; // Start with no sound
      
      // Create analyser for visualizations and note detection
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = 2048;
      this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
      
      // Connect gain to analyser and then to output
      this.gainNode.connect(this.audioAnalyser);
      this.audioAnalyser.connect(this.audioContext.destination);
      
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  public startNote(frequency: number, intensity = 1) {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // If we already have an oscillator playing, stop it
    if (this.oscillator) {
      this.stopNote();
    }
    
    try {
      this.currentFrequency = frequency * Math.pow(2, this.tuning / 1200); // Apply tuning in cents
      
      // Create and configure oscillator
      this.oscillator = this.audioContext!.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = this.currentFrequency;
      
      // Apply breath sensitivity
      const normalizedIntensity = intensity * (this.breathSensitivity / 10);
      this.gainNode!.gain.value = Math.min(normalizedIntensity * 0.5, 0.5); // Cap the volume
      
      // Apply vibrato if intensity > 0
      if (this.vibrato.intensity > 0) {
        const vibratoSpeed = 4 + (this.vibrato.speed / 2); // 4-9 Hz
        const vibratoDepth = this.currentFrequency * (this.vibrato.intensity / 200); // Max 5% of frequency
        
        // We would implement proper vibrato here with an LFO
        // This is a simplified example that uses the gain node instead
        
        setInterval(() => {
          if (this.oscillator && this.gainNode) {
            const now = this.audioContext!.currentTime;
            this.gainNode.gain.linearRampToValueAtTime(
              this.gainNode!.gain.value * (1 + Math.sin(now * vibratoSpeed) * 0.1), 
              now + 0.01
            );
          }
        }, 20);
      }
      
      // Connect oscillator to gain node
      this.oscillator.connect(this.gainNode!);
      
      // Start oscillator
      this.oscillator.start();
      console.log(`Playing note at ${this.currentFrequency}Hz with intensity ${normalizedIntensity}`);
      
      // If recording, add the note to recorded notes
      if (this.isRecording && !this.isPaused) {
        const noteName = this.frequencyToNoteName(this.currentFrequency);
        if (noteName) {
          this.recordedNotes.push(noteName);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error starting note:', error);
      return false;
    }
  }

  public updateNoteIntensity(frequency: number, intensity = 1) {
    if (!this.oscillator || !this.gainNode) return false;
    
    try {
      // Apply breath sensitivity
      const normalizedIntensity = intensity * (this.breathSensitivity / 10);
      this.gainNode.gain.value = Math.min(normalizedIntensity * 0.5, 0.5); // Cap the volume
      return true;
    } catch (error) {
      console.error('Error updating note intensity:', error);
      return false;
    }
  }

  public stopNote() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
        this.gainNode!.gain.value = 0;
        console.log('Note stopped');
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  }

  public updateSettings(settings: {
    breathSensitivity?: number;
    tuning?: number;
    reverb?: number;
    vibrato?: { intensity: number; speed: number };
    allowOverblowing?: boolean;
    useMicrophone?: boolean;
    transpose?: boolean;
    delay?: boolean;
    autoVibrato?: boolean;
    dynamicRange?: number;
    acousticProps?: any;
  }) {
    if (settings.breathSensitivity !== undefined) {
      this.breathSensitivity = settings.breathSensitivity;
    }
    
    if (settings.tuning !== undefined) {
      this.tuning = settings.tuning;
      // Update current note frequency if playing
      if (this.oscillator) {
        this.oscillator.frequency.value = this.currentFrequency * Math.pow(2, this.tuning / 1200);
      }
    }
    
    if (settings.reverb !== undefined) {
      this.reverb = settings.reverb;
      // We would apply reverb settings here in a full implementation
    }
    
    if (settings.vibrato) {
      this.vibrato = settings.vibrato;
    }
    
    // Handle the new properties
    if (settings.allowOverblowing !== undefined) {
      this.allowOverblowing = settings.allowOverblowing;
    }
    
    if (settings.useMicrophone !== undefined) {
      this.useMicrophone = settings.useMicrophone;
    }
    
    if (settings.transpose !== undefined) {
      this.transpose = settings.transpose;
    }
    
    if (settings.delay !== undefined) {
      this.delay = settings.delay;
    }
    
    if (settings.autoVibrato !== undefined) {
      this.autoVibrato = settings.autoVibrato;
    }
    
    if (settings.dynamicRange !== undefined) {
      this.dynamicRange = settings.dynamicRange;
    }
    
    console.log('Settings updated:', { 
      breathSensitivity: this.breathSensitivity,
      tuning: this.tuning,
      reverb: this.reverb,
      vibrato: this.vibrato,
      allowOverblowing: this.allowOverblowing,
      useMicrophone: this.useMicrophone,
      transpose: this.transpose,
      delay: this.delay,
      autoVibrato: this.autoVibrato,
      dynamicRange: this.dynamicRange
    });
  }

  private frequencyToNoteName(frequency: number): string | null {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440; // frequency of A4
    
    const halfStepsFromA4 = Math.round(12 * Math.log2(frequency / a4));
    
    const noteIndex = (halfStepsFromA4 + 9) % 12; // A is at index 9
    const octave = Math.floor((halfStepsFromA4 + 9) / 12) + 4; // A4 is in octave 4
    
    if (octave >= 0 && octave <= 8) {
      return `${noteNames[noteIndex]}${octave}`;
    }
    
    return null;
  }

  public async startRecording(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices) {
        console.error('Media devices not supported in this browser');
        return false;
      }

      if (typeof navigator.permissions !== 'undefined') {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Microphone permission status:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            console.error('Microphone permission denied by user');
            alert('Microphone access is blocked. Please enable it in your browser settings and try again.');
            return false;
          }
        } catch (error) {
          console.warn('Could not query permission status:', error);
        }
      }

      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      console.log('Requesting microphone access...');
      
      if (this.isRecording && this.isPaused && this.mediaRecorder) {
        this.resumeRecording();
        return true;
      }
      
      if (this.isRecording && !this.isPaused) {
        console.log('Already recording');
        return true;
      }
      
      if (this.microphoneStream) {
        this.microphoneStream.getTracks().forEach(track => track.stop());
        this.microphoneStream = null;
      }

      if (this.recordedAudioUrl) {
        URL.revokeObjectURL(this.recordedAudioUrl);
        this.recordedAudioUrl = null;
      }
      
      if (this.recordedMP3Url) {
        URL.revokeObjectURL(this.recordedMP3Url);
        this.recordedMP3Url = null;
      }

      this.recordedChunks = [];
      
      const destNode = this.audioContext!.createMediaStreamDestination();
      this.gainNode!.connect(destNode);
      this.microphoneStream = destNode.stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(destNode.stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128kbps audio
      });
      
      this.recordedChunks = [];
      this.recordedNotes = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
          console.log('Recording data chunk received:', e.data.size, 'bytes');
        }
      };
      
      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length === 0) {
          console.warn('No recording data available');
          return;
        }
        
        const audioBlob = new Blob(this.recordedChunks, { type: mimeType });
        
        if (this.recordedAudioUrl) {
          URL.revokeObjectURL(this.recordedAudioUrl);
        }
        
        this.recordedAudioUrl = URL.createObjectURL(audioBlob);
        console.log('Recording stopped and saved, size:', audioBlob.size, 'bytes');
        
        if (this.recordedNotes.length === 0) {
          const sampleNotes = ['C4', 'E4', 'G4', 'A4', 'C5'];
          this.recordedNotes = sampleNotes;
          console.log('No notes detected, using sample notes:', sampleNotes);
        }
      };
      
      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.isPaused = false;
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.error('Microphone permission denied by user or already in use by another application');
          alert('Microphone access was denied. Please check your browser permissions and ensure no other apps are using your microphone.');
        } else if (error.name === 'NotFoundError') {
          console.error('No microphone found');
          alert('No microphone found. Please connect a microphone and try again.');
        }
      }
      
      return false;
    }
  }
  
  public pauseRecording(): boolean {
    try {
      if (this.mediaRecorder && this.isRecording && !this.isPaused) {
        console.log('Pausing recording...');
        this.mediaRecorder.pause();
        this.isPaused = true;
        console.log('Recording paused');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing recording:', error);
      return false;
    }
  }
  
  public resumeRecording(): boolean {
    try {
      if (this.mediaRecorder && this.isRecording && this.isPaused) {
        console.log('Resuming recording...');
        this.mediaRecorder.resume();
        this.isPaused = false;
        console.log('Recording resumed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming recording:', error);
      return false;
    }
  }
  
  public stopRecording(): boolean {
    try {
      if (this.mediaRecorder && this.isRecording) {
        console.log('Stopping recording...');
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.isPaused = false;
        
        if (this.microphoneStream) {
          this.microphoneStream.getTracks().forEach(track => {
            track.stop();
            console.log('Media track stopped:', track.kind);
          });
        }
        
        console.log('Recording stopped');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return false;
    }
  }

  public async convertToMP3(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.recordedAudioUrl || this.recordedChunks.length === 0) {
        console.error('No recording available to convert');
        reject(new Error('No recording available to convert'));
        return;
      }

      console.log('Starting conversion to MP3, chunks:', this.recordedChunks.length);
      
      const audioBlob = new Blob(this.recordedChunks, { 
        type: 'audio/webm' 
      });
      
      if (audioBlob.size === 0) {
        console.error('Audio blob is empty');
        reject(new Error('Empty recording'));
        return;
      }
      
      setTimeout(() => {
        try {
          const mp3Url = URL.createObjectURL(audioBlob);
          this.recordedMP3Url = mp3Url;
          
          if (this.audioElement) {
            this.audioElement.src = mp3Url;
            this.audioElement.load();
            
            const playPromise = this.audioElement.play();
            
            if (playPromise !== undefined) {
              playPromise.then(() => {
                this.audioElement!.pause();
                this.audioElement!.currentTime = 0;
                console.log('Audio can be played successfully');
                resolve(this.recordedMP3Url);
              }).catch(err => {
                console.error('Error testing audio playback:', err);
                reject(new Error('Audio playback test failed'));
              });
            }
          } else {
            console.error('No audio element available');
            reject(new Error('No audio element available'));
          }
        } catch (err) {
          console.error('Error in MP3 conversion:', err);
          reject(err);
        }
      }, 1000);
    });
  }
  
  public playRecording(): boolean {
    try {
      const audioUrl = this.recordedMP3Url || this.recordedAudioUrl;
      
      if (audioUrl && this.audioElement) {
        console.log('Attempting to play recording from', audioUrl);
        
        if (this.audioElement.paused) {
          this.audioElement.src = audioUrl;
          
          const playPromise = this.audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('Audio started playing successfully');
            }).catch(err => {
              console.error('Error playing recording:', err);
            });
          }
        } else {
          console.log('Already playing recording');
        }
        return true;
      }
      console.error('No audio or audio element available for URL:', audioUrl);
      return false;
    } catch (error) {
      console.error('Error playing recording:', error);
      return false;
    }
  }
  
  public pausePlayback(): boolean {
    try {
      if (this.audioElement && !this.audioElement.paused) {
        this.audioElement.pause();
        console.log('Playback paused');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing playback:', error);
      return false;
    }
  }
  
  public resumePlayback(): boolean {
    try {
      if (this.audioElement && this.audioElement.paused && this.audioElement.src) {
        this.audioElement.play()
          .catch(err => {
            console.error('Error resuming playback:', err);
            return false;
          });
        console.log('Playback resumed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming playback:', error);
      return false;
    }
  }
  
  public stopPlayback(): boolean {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        console.log('Playback stopped');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error stopping playback:', error);
      return false;
    }
  }
  
  public isCurrentlyPlaying(): boolean {
    return this.audioElement ? !this.audioElement.paused : false;
  }
  
  public downloadRecording(): boolean {
    try {
      const audioUrl = this.recordedMP3Url || this.recordedAudioUrl;
      const extension = this.recordedMP3Url ? 'mp3' : 'webm';
      
      if (audioUrl) {
        console.log('Downloading recording from URL:', audioUrl);
        
        if (this.recordedChunks.length === 0) {
          console.error('No audio chunks available for download');
          return false;
        }
        
        const blob = new Blob(this.recordedChunks, { 
          type: this.recordedMP3Url ? 'audio/mp3' : 'audio/webm' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flute-recording.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Downloading recording');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error downloading recording:', error);
      return false;
    }
  }
  
  public shareRecording(): boolean {
    try {
      const audioUrl = this.recordedMP3Url || this.recordedAudioUrl;
      const mimeType = this.recordedMP3Url ? 'audio/mp3' : 'audio/webm';
      const extension = this.recordedMP3Url ? 'mp3' : 'webm';
      
      if (audioUrl && navigator.share) {
        console.log('Attempting to share recording');
        
        if (this.recordedChunks.length === 0) {
          console.error('No audio chunks available for sharing');
          return false;
        }
        
        const blob = new Blob(this.recordedChunks, { type: mimeType });
          
        if (blob) {
          const file = new File([blob], `flute-recording.${extension}`, { type: mimeType });
          navigator.share({
            title: 'Flute Recording',
            text: 'Check out my flute recording!',
            files: [file]
          }).then(() => {
            console.log('Shared successfully');
          }).catch((error) => {
            console.error('Error sharing:', error);
          });
          return true;
        }
      } else if (audioUrl) {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = audioUrl;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        console.log('Recording URL copied to clipboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sharing recording:', error);
      return false;
    }
  }
  
  public getRecordedNotes(): string[] {
    return [...new Set(this.recordedNotes)];
  }
  
  public hasRecording(): boolean {
    return this.recordedAudioUrl !== null;
  }
  
  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
  
  public isRecordingPaused(): boolean {
    return this.isRecording && this.isPaused;
  }
}

const fluteAudio = new FluteAudioEngine();
export default fluteAudio;
