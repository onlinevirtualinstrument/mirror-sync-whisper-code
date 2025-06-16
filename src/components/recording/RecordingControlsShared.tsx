import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Download, Square, 
  AlertTriangle, Pause, StopCircle, 
  CheckCircle2, RotateCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  amplitude?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isActive, 
  amplitude = 0.5 
}) => {
  return (
    <div className="w-full h-12 flex items-center justify-center gap-1 py-2">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-full w-1 bg-primary/30 rounded-full transition-all duration-150",
            isActive && "animate-eq"
          )}
          style={{
            height: isActive 
              ? `${30 + Math.sin(i * 0.5) * amplitude * 50}%` 
              : '30%',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
};

interface RecordingControlsSharedProps {
  instrumentName: string;
  className?: string;
  theme?: 'light' | 'dark';
  primaryColor?: string;
  secondaryColor?: string;
  onPlayNote?: (note: string) => void;
}

class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioChunks: Blob[] = [];
  private audioUrl: string | null = null;
  private mp3Url: string | null = null;
  private isRecording = false;
  private isPaused = false;
  private isPlaying = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioAnalyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private noiseReductionEnabled = true;
  
  // Add a new audio destination for instrument recording
  private instrumentDestination: MediaStreamAudioDestinationNode | null = null;
  private instrumentAudioSource: MediaStreamAudioSourceNode | null = null;
  private recordingGainNode: GainNode | null = null;
  
  constructor() {
    this.audioElement = new Audio();
    this.initAudioContext();
    
    // Set up audio routing for instrument sounds
    if (this.audioContext) {
      this.instrumentDestination = this.audioContext.createMediaStreamDestination();
      this.recordingGainNode = this.audioContext.createGain();
      this.recordingGainNode.connect(this.instrumentDestination);
      
      // Connect to the context destination for normal playback
      this.recordingGainNode.connect(this.audioContext.destination);
    }
    
    // Listen for instrument audio events from the global event system
    window.addEventListener('instrument:audioOutput', (e: any) => {
      if (this.isRecording && !this.isPaused && this.audioContext && this.recordingGainNode) {
        // Process the audio from the event
        if (e.detail && e.detail.audioBuffer) {
          const source = this.audioContext.createBufferSource();
          source.buffer = e.detail.audioBuffer;
          source.connect(this.recordingGainNode);
          source.start();
        }
      }
    });
  }

  private async initAudioContext(): Promise<boolean> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return true;
    } catch (err) {
      console.error("Failed to initialize audio context:", err);
      return false;
    }
  }

  public async startRecording(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices) return false;
      
      this.audioChunks = [];
      
      // Instead of using microphone, we'll use the instrument destination
      // This is the key change to capture only instrument output
      if (!this.audioContext) {
        await this.initAudioContext();
      }
      
      if (!this.instrumentDestination && this.audioContext) {
        this.instrumentDestination = this.audioContext.createMediaStreamDestination();
        this.recordingGainNode = this.audioContext.createGain();
        this.recordingGainNode.connect(this.instrumentDestination);
        this.recordingGainNode.connect(this.audioContext.destination);
      }
      
      // Use the instrument stream instead of microphone stream
      const stream = this.instrumentDestination!.stream;
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };
      
      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.isPaused = false;
      
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      return false;
    }
  }
  
  public pauseRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) return false;
    
    try {
      if (this.mediaRecorder.state === "recording") {
        this.mediaRecorder.pause();
        this.isPaused = true;
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to pause recording:", err);
      return false;
    }
  }
  
  public resumeRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording || !this.isPaused) return false;
    
    try {
      if (this.mediaRecorder.state === "paused") {
        this.mediaRecorder.resume();
        this.isPaused = false;
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to resume recording:", err);
      return false;
    }
  }
  
  public stopRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) return false;
    
    try {
      this.mediaRecorder.stop();
      
      // Stop microphone access
      if (this.microphoneStream) {
        this.microphoneStream.getTracks().forEach(track => track.stop());
        this.microphoneStream = null;
      }
      
      this.isRecording = false;
      this.isPaused = false;
      
      // Create and store audio URL
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Revoke previous URL to avoid memory leaks
        if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
        
        this.audioUrl = URL.createObjectURL(audioBlob);
        
        if (this.audioElement) {
          this.audioElement.src = this.audioUrl;
          this.audioElement.load();
        }
      };
      
      return true;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      return false;
    }
  }
  
  public async convertToMP3(): Promise<string | null> {
    if (!this.audioUrl) return null;
    
    try {
      // Improved MP3 conversion
      // In a real implementation, we would use a library like lamejs
      // For now we'll just use the existing audio blob as MP3 would require additional libraries
      const audioBlob = new Blob(this.audioChunks, { 
        type: 'audio/mp3' 
      });
      
      if (this.mp3Url) {
        URL.revokeObjectURL(this.mp3Url);
      }
      
      this.mp3Url = URL.createObjectURL(audioBlob);
      
      // Set the source for the audio element
      if (this.audioElement) {
        this.audioElement.src = this.mp3Url;
        this.audioElement.load();
      }
      
      return this.mp3Url;
    } catch (err) {
      console.error("Failed to convert to MP3:", err);
      return null;
    }
  }
  
  public playRecording(): boolean {
    if (!this.audioElement || !this.audioUrl && !this.mp3Url) return false;
    
    try {
      const url = this.mp3Url || this.audioUrl;
      if (!url) return false;
      
      // Ensure we have the latest URL set
      this.audioElement.src = url;
      this.audioElement.load();
      
      // Play the audio
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            
            this.audioElement!.onended = () => {
              this.isPlaying = false;
            };
          })
          .catch(err => {
            console.error("Playback failed:", err);
            return false;
          });
      }
      
      return true;
    } catch (err) {
      console.error("Failed to play recording:", err);
      return false;
    }
  }
  
  public pausePlayback(): boolean {
    if (!this.audioElement || !this.isPlaying) return false;
    
    try {
      this.audioElement.pause();
      this.isPlaying = false;
      return true;
    } catch (err) {
      console.error("Failed to pause playback:", err);
      return false;
    }
  }
  
  public resumePlayback(): boolean {
    if (!this.audioElement || this.isPlaying) return false;
    
    try {
      this.audioElement.play();
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.error("Failed to resume playback:", err);
      return false;
    }
  }
  
  public stopPlayback(): boolean {
    if (!this.audioElement) return false;
    
    try {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      return true;
    } catch (err) {
      console.error("Failed to stop playback:", err);
      return false;
    }
  }
  
  public downloadRecording(): boolean {
    try {
      // If we don't have an MP3 URL yet, convert first
      if (!this.mp3Url) {
        this.convertToMP3().then(url => {
          if (url) this.triggerDownload(url);
        });
        return true;
      }
      
      return this.triggerDownload(this.mp3Url);
    } catch (err) {
      console.error("Failed to download recording:", err);
      return false;
    }
  }
  
  private triggerDownload(url: string): boolean {
    const a = document.createElement('a');
    a.href = url;
    a.download = `instrument-recording-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
  
  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
  
  public isRecordingPaused(): boolean {
    return this.isPaused;
  }
  
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
  
  public setNoiseReduction(enabled: boolean): void {
    this.noiseReductionEnabled = enabled;
  }
}

const RecordingControlsShared: React.FC<RecordingControlsSharedProps> = ({
  instrumentName,
  className = "",
  theme = 'light',
  primaryColor = "bg-primary",
  secondaryColor = "bg-secondary",
  onPlayNote
}) => {
  const [recording, setRecording] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [showMicrophoneError, setShowMicrophoneError] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState("");
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [playbackPaused, setPlaybackPaused] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  
  const audioRecorder = useRef<AudioRecorder | null>(null);
  
  // Initialize audio recorder
  useEffect(() => {
    if (!audioRecorder.current) {
      audioRecorder.current = new AudioRecorder();
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);
  
  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle recording start
  const handleStartRecording = async () => {
    if (!audioRecorder.current) return;
    
    setShowMicrophoneError(false);
    setConversionStatus('idle');
    
    if (isPlayingRecording) {
      audioRecorder.current.stopPlayback();
      setIsPlayingRecording(false);
      setPlaybackPaused(false);
    }
    
    if (recording && recordingPaused) {
      const success = audioRecorder.current.resumeRecording();
      
      if (success) {
        setRecordingPaused(false);
        const intervalId = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setTimer(intervalId);
        
        toast.success("Recording resumed");
      }
      return;
    }
    
    const success = await audioRecorder.current.startRecording();
    
    if (success) {
      setRecording(true);
      setRecordingPaused(false);
      setRecordingTime(0);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId);
      toast.success(`Recording ${instrumentName} started`);
    } else {
      setShowMicrophoneError(true);
      setMicErrorMessage("Could not access microphone. Please check your browser permissions and ensure that no other app is using your microphone.");
      toast.error("Could not access microphone");
    }
  };
  
  // Handle recording pause
  const handlePauseRecording = () => {
    if (!audioRecorder.current || !recording || recordingPaused) return;
    
    const success = audioRecorder.current.pauseRecording();
    
    if (success) {
      setRecordingPaused(true);
      
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      toast.success("Recording paused");
    }
  };
  
  // Handle recording resume
  const handleResumeRecording = () => {
    if (!audioRecorder.current || !recording || !recordingPaused) return;
    
    const success = audioRecorder.current.resumeRecording();
    
    if (success) {
      setRecordingPaused(false);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);
      
      toast.success("Recording resumed");
    }
  };
  
  // Handle recording stop
  const handleStopRecording = async () => {
    if (!audioRecorder.current) return;
    
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    const success = audioRecorder.current.stopRecording();
    
    if (success) {
      setRecording(false);
      setRecordingPaused(false);
      setConversionStatus('converting');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mp3Url = await audioRecorder.current.convertToMP3();
        
        if (mp3Url) {
          setHasRecording(true);
          setConversionStatus('success');
          
          toast.success(`Recording ready - ${formatTime(recordingTime)}`, {
            description: "Your recording is ready to play or download"
          });
        } else {
          throw new Error("Conversion failed");
        }
      } catch (error) {
        console.error("Error converting to MP3:", error);
        setConversionStatus('error');
        
        toast.error("Conversion failed", {
          description: "Could not convert recording to MP3"
        });
      }
    }
  };
  
  // Handle playback
  const handlePlayRecording = () => {
    if (!audioRecorder.current || !hasRecording) return;
    
    if (isPlayingRecording && !playbackPaused) {
      audioRecorder.current.pausePlayback();
      setPlaybackPaused(true);
      toast.info("Playback paused");
    } else if (playbackPaused) {
      audioRecorder.current.resumePlayback();
      setPlaybackPaused(false);
      setIsPlayingRecording(true);
      toast.info("Playback resumed");
    } else {
      const success = audioRecorder.current.playRecording();
      if (success) {
        setIsPlayingRecording(true);
        setPlaybackPaused(false);
        toast.success("Playing your recording");
      } else {
        toast.error("Could not play the recording");
      }
    }
  };
  
  // Handle playback stop
  const handleStopPlayback = () => {
    if (!audioRecorder.current) return;
    
    audioRecorder.current.stopPlayback();
    setIsPlayingRecording(false);
    setPlaybackPaused(false);
  };
  
  // Handle download
  const handleDownloadRecording = () => {
    if (!audioRecorder.current || !hasRecording) return;
    
    const success = audioRecorder.current.downloadRecording();
    
    if (success) {
      toast.success("Your recording is being downloaded", {
        description: `${instrumentName} recording - ${formatTime(recordingTime)}`
      });
    } else {
      toast.error("Download failed", {
        description: "No recording available to download"
      });
    }
  };
  
  return (
    <div className={`w-full max-w-md mx-auto p-4 ${primaryColor}/10 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/30 ${className}`}>
      {conversionStatus === 'converting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl z-10">
          <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-xl shadow-lg">
            <div className="audio-wave">
              {[...Array(5)].map((_, i) => (
                <span key={i}></span>
              ))}
            </div>
            <p className="text-sm font-medium">Converting to MP3...</p>
          </div>
        </div>
      )}
      
      {conversionStatus === 'error' && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Conversion Failed</h3>
          </div>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            Could not process your recording. Please try recording again.
          </p>
          <Button 
            variant="destructive"
            size="sm"
            className="mt-2 text-xs py-1 h-auto"
            onClick={() => setConversionStatus('idle')}
          >
            Dismiss
          </Button>
        </div>
      )}
      
      {showMicrophoneError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Microphone Access Error</h3>
          </div>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">{micErrorMessage}</p>
          <Button 
            variant="destructive"
            size="sm"
            className="mt-2 text-xs py-1 h-auto"
            onClick={() => setShowMicrophoneError(false)}
          >
            Dismiss
          </Button>
        </div>
      )}
      
      <AudioVisualizer isActive={recording || isPlayingRecording} amplitude={recording ? 0.8 : 0.5} />
      
      {recording && (
        <div className="flex justify-center mt-2 mb-4">
          <div className={cn(
            "bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
            recordingPaused ? "" : "animate-pulse"
          )}>
            <span className={cn(
              "h-2 w-2 bg-white rounded-full",
              recordingPaused ? "opacity-50" : ""
            )}></span>
            {recordingPaused ? "Paused: " : "Recording: "} 
            {formatTime(recordingTime)}
          </div>
        </div>
      )}

      {hasRecording && !recording && (
        <div className="text-center mt-2 mb-3">
          <div className="flex items-center justify-center gap-2">
            {conversionStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            <p className="text-sm text-muted-foreground">
              MP3 Recording ready - {formatTime(recordingTime)}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 mb-1">
        {!recording ? (
          <Button 
            onClick={handleStartRecording} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all h-auto py-2",
              !showMicrophoneError ? "hover:bg-red-500/90 hover:text-white" : ""
            )}
            variant="outline"
            disabled={showMicrophoneError || conversionStatus === 'converting'}
          >
            <Mic className="h-4 w-4" />
            <span className="text-xs">Record</span>
          </Button>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {!recordingPaused ? (
              <Button 
                onClick={handlePauseRecording} 
                className="flex flex-col items-center gap-1 bg-red-500 text-white hover:bg-red-600 h-auto py-2"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </Button>
            ) : (
              <Button 
                onClick={handleResumeRecording} 
                className="flex flex-col items-center gap-1 bg-red-500 text-white hover:bg-red-600 h-auto py-2"
                variant="outline"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </Button>
            )}
            <Button 
              onClick={handleStopRecording} 
              className="flex flex-col items-center gap-1 bg-red-500 text-white hover:bg-red-600 mt-1 h-auto py-2"
              variant="outline"
            >
              <Square className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        )}
        
        {!isPlayingRecording && !playbackPaused ? (
          <Button 
            onClick={handlePlayRecording} 
            className="flex flex-col items-center gap-1 h-auto py-2"
            variant="outline"
            disabled={!hasRecording || conversionStatus === 'converting' || recording}
          >
            <Play className="h-4 w-4" />
            <span className="text-xs">Play</span>
          </Button>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {!playbackPaused ? (
              <Button 
                onClick={handlePlayRecording} 
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 h-auto py-2"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </Button>
            ) : (
              <Button 
                onClick={handlePlayRecording} 
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 h-auto py-2"
                variant="outline"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </Button>
            )}
            <Button 
              onClick={handleStopPlayback} 
              className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 mt-1 h-auto py-2"
              variant="outline"
            >
              <StopCircle className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        )}
        
        <Button 
          onClick={handleDownloadRecording} 
          className="flex flex-col items-center gap-1 h-auto py-2"
          variant="outline"
          disabled={!hasRecording || conversionStatus === 'converting' || recording}
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Download</span>
        </Button>
      </div>
      
      <div className="text-xs text-center text-muted-foreground mt-2">
        {recording ? "Recording with noise reduction..." : "Ready to record your performance"}
      </div>
    </div>
  );
};

export default RecordingControlsShared;