
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Download, Square, 
  AlertTriangle, Pause, StopCircle, 
  CheckCircle2, RotateCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

// This is a standalone version of the RecordingControls component
// It's designed to be easily integrated into other projects

interface AudioVisualizerProps {
  isActive: boolean;
  amplitude?: number;
}

// Simple AudioVisualizer component that can be used standalone
const SimpleAudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
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

// Recording Controls Props
interface RecordingControlsProps {
  isPlaying?: boolean;
  onStateChange?: (state: { 
    recording: boolean; 
    playing: boolean; 
    hasRecording: boolean 
  }) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

// Simplified audio handling for standalone use
class SimpleAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioUrl: string | null = null;
  private audioContext: AudioContext | null = null;
  private isRecording = false;
  private isPaused = false;
  private isPlaying = false;
  
  // Initialize audio context
  async initialize(): Promise<boolean> {
    try {
      this.audioContext = new AudioContext();
      return true;
    } catch (err) {
      console.error("Audio context initialization failed:", err);
      return false;
    }
  }
  
  // Start recording
  async startRecording(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices) return false;
      
      this.audioChunks = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
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
  
  // Pause recording
  pauseRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) return false;
    
    try {
      this.mediaRecorder.pause();
      this.isPaused = true;
      return true;
    } catch (err) {
      console.error("Failed to pause recording:", err);
      return false;
    }
  }
  
  // Resume recording
  resumeRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording || !this.isPaused) return false;
    
    try {
      this.mediaRecorder.resume();
      this.isPaused = false;
      return true;
    } catch (err) {
      console.error("Failed to resume recording:", err);
      return false;
    }
  }
  
  // Stop recording
  stopRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) return false;
    
    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
      
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Revoke previous URL to avoid memory leaks
      if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
      
      // Create new URL for playback
      this.audioUrl = URL.createObjectURL(audioBlob);
      
      return true;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      return false;
    }
  }
  
  // Play recording
  playRecording(): boolean {
    if (!this.audioUrl) return false;
    
    try {
      const audio = new Audio(this.audioUrl);
      audio.play();
      this.isPlaying = true;
      
      audio.onended = () => {
        this.isPlaying = false;
      };
      
      return true;
    } catch (err) {
      console.error("Failed to play recording:", err);
      return false;
    }
  }
  
  // Download recording
  downloadRecording(): boolean {
    if (!this.audioUrl) return false;
    
    try {
      const a = document.createElement('a');
      a.href = this.audioUrl;
      a.download = `melodia-recording-${new Date().toISOString().slice(0,19)}.webm`;
      a.click();
      return true;
    } catch (err) {
      console.error("Failed to download recording:", err);
      return false;
    }
  }
  
  // Check if currently recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
  
  // Check if recording is paused
  isRecordingPaused(): boolean {
    return this.isPaused;
  }
  
  // Check if currently playing
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Standalone Recording Controls Component
const RecordingControlsStandalone: React.FC<RecordingControlsProps> = ({
  isPlaying = false,
  onStateChange,
  className = "",
  theme = 'light'
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
  
  const audioRecorder = useRef<SimpleAudioRecorder | null>(null);
  const mount = useRef(false);
  
  // Initialize audio recorder
  useEffect(() => {
    if (!mount.current) {
      mount.current = true;
      audioRecorder.current = new SimpleAudioRecorder();
      audioRecorder.current.initialize();
    }
    
    return () => {
      mount.current = false;
    };
  }, []);
  
  // Update parent component on state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        recording,
        playing: isPlayingRecording,
        hasRecording
      });
    }
  }, [recording, isPlayingRecording, hasRecording, onStateChange]);
  
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
    } else {
      setShowMicrophoneError(true);
      setMicErrorMessage("Could not access microphone. Please check your browser permissions.");
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
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasRecording(true);
        setConversionStatus('success');
      } catch (error) {
        console.error("Error processing recording:", error);
        setConversionStatus('error');
      }
    }
  };
  
  // Handle playback
  const handlePlayRecording = () => {
    if (!audioRecorder.current || !hasRecording) return;
    
    if (isPlayingRecording && !playbackPaused) {
      setPlaybackPaused(true);
    } else if (playbackPaused) {
      setPlaybackPaused(false);
      setIsPlayingRecording(true);
    } else {
      const success = audioRecorder.current.playRecording();
      if (success) {
        setIsPlayingRecording(true);
        setPlaybackPaused(false);
      }
    }
  };
  
  // Handle playback stop
  const handleStopPlayback = () => {
    setIsPlayingRecording(false);
    setPlaybackPaused(false);
  };
  
  // Handle download
  const handleDownloadRecording = () => {
    if (!audioRecorder.current || !hasRecording) return;
    audioRecorder.current.downloadRecording();
  };
  
  // Dismiss microphone error
  const dismissMicrophoneError = () => {
    setShowMicrophoneError(false);
  };
  
  // Theme-based classes
  const getBgClass = () => {
    return theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90';
  };
  
  const getTextClass = () => {
    return theme === 'dark' ? 'text-white' : 'text-slate-900';
  };
  
  return (
    <div className={`w-full max-w-md mx-auto p-6 ${getBgClass()} backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/30 ${className}`}>
      {conversionStatus === 'converting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-xl shadow-lg">
            <div className="audio-wave">
              {[...Array(5)].map((_, i) => (
                <span key={i}></span>
              ))}
            </div>
            <p className="text-sm font-medium">Processing recording...</p>
          </div>
        </div>
      )}
      
      {conversionStatus === 'error' && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Conversion Failed</h3>
          </div>
          <p className="mt-1 text-sm text-red-700">
            Could not process your recording. Please try recording again.
          </p>
          <button 
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            onClick={() => setConversionStatus('idle')}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {showMicrophoneError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Microphone Access Error</h3>
          </div>
          <p className="mt-1 text-sm text-red-700">{micErrorMessage}</p>
          <button 
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            onClick={dismissMicrophoneError}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <SimpleAudioVisualizer isActive={recording || isPlayingRecording} amplitude={recording ? 0.8 : 0.5} />
      
      {recording && (
        <div className="flex justify-center mt-2 mb-4">
          <div className={cn(
            "bg-red-500/80 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
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
        <div className="text-center mt-2 mb-4">
          <div className="flex items-center justify-center gap-2">
            {conversionStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            <p className="text-sm text-muted-foreground">
              Recording ready - {formatTime(recordingTime)}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {!recording ? (
          <button 
            onClick={handleStartRecording} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all p-3 rounded-lg border",
              !showMicrophoneError && "hover:bg-red-500/90 hover:text-white",
              theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
            )}
            disabled={showMicrophoneError || conversionStatus === 'converting'}
          >
            <Mic className="h-4 w-4" />
            <span className="text-xs">Record</span>
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {!recordingPaused ? (
              <button 
                onClick={handlePauseRecording} 
                className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600 p-3 rounded-lg"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </button>
            ) : (
              <button 
                onClick={handleResumeRecording} 
                className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600 p-3 rounded-lg"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </button>
            )}
            <button 
              onClick={handleStopRecording} 
              className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600 p-3 rounded-lg mt-1"
              data-recording="true"
            >
              <Square className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </button>
          </div>
        )}
        
        {!isPlayingRecording && !playbackPaused ? (
          <button 
            onClick={handlePlayRecording} 
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border",
              theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
            )}
            disabled={!hasRecording || conversionStatus === 'converting' || recording}
          >
            <Play className="h-4 w-4" />
            <span className="text-xs">Play</span>
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {!playbackPaused ? (
              <button 
                onClick={handlePlayRecording} 
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 p-3 rounded-lg"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </button>
            ) : (
              <button 
                onClick={handlePlayRecording} 
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 p-3 rounded-lg"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </button>
            )}
            <button 
              onClick={handleStopPlayback} 
              className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 p-3 rounded-lg mt-1"
            >
              <StopCircle className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </button>
          </div>
        )}
        
        <button 
          onClick={handleDownloadRecording} 
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg border",
            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
          )}
          disabled={!hasRecording || conversionStatus === 'converting' || recording}
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Download</span>
        </button>
      </div>
    </div>
  );
};

export default RecordingControlsStandalone;
