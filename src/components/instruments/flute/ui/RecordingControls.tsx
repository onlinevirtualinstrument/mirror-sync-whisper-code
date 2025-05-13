
import React, { useState, useEffect, useRef } from 'react';
import AudioVisualizer from '../ui/AudioVisualizer';
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Play, 
  Download, 
  Square, 
  AlertTriangle,
  Pause,
  StopCircle,
  CheckCircle2,
  RotateCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import fluteAudio from "../utils/fluteAudio";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  isPlaying: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ isPlaying }) => {
  const { toast } = useToast();
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
  
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.onended = () => {
        setIsPlayingRecording(false);
        setPlaybackPaused(false);
      };
      audioPlayerRef.current.onpause = () => {
        if (audioPlayerRef.current && audioPlayerRef.current.currentTime > 0 &&
            audioPlayerRef.current.currentTime < audioPlayerRef.current.duration) {
          setPlaybackPaused(true);
        } else {
          setIsPlayingRecording(false);
          setPlaybackPaused(false);
        }
      };
      audioPlayerRef.current.onplay = () => {
        setIsPlayingRecording(true);
        setPlaybackPaused(false);
      };
    }

    const checkStatusInterval = setInterval(() => {
      if (fluteAudio.isCurrentlyPlaying() !== isPlayingRecording) {
        setIsPlayingRecording(fluteAudio.isCurrentlyPlaying());
      }
      
      if (fluteAudio.isCurrentlyRecording() !== recording) {
        setRecording(fluteAudio.isCurrentlyRecording());
        if (!fluteAudio.isCurrentlyRecording()) {
          if (timer) {
            clearInterval(timer);
            setTimer(null);
          }
        }
      }
      
      if (fluteAudio.isRecordingPaused() !== recordingPaused) {
        setRecordingPaused(fluteAudio.isRecordingPaused());
      }
    }, 300);

    return () => {
      if (timer) clearInterval(timer);
      clearInterval(checkStatusInterval);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, [timer, isPlayingRecording, recording, recordingPaused]);
  
  useEffect(() => {
    if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      setShowMicrophoneError(true);
      setMicErrorMessage("Your browser doesn't support recording. Please try a modern browser like Chrome or Firefox.");
    }
  }, []);

  const handleStartRecording = async () => {
    setShowMicrophoneError(false);
    setConversionStatus('idle');
    
    if (fluteAudio["audioContext"] && (fluteAudio["audioContext"] as AudioContext).state === "suspended") {
      await (fluteAudio["audioContext"] as AudioContext).resume();
    }
    
    if (isPlayingRecording) {
      fluteAudio.stopPlayback();
      setIsPlayingRecording(false);
      setPlaybackPaused(false);
    }
    
    if (recording && recordingPaused) {
      const success = fluteAudio.resumeRecording();
      if (success) {
        setRecordingPaused(false);
        const intervalId = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setTimer(intervalId);
        
        toast({
          title: "Recording resumed",
          description: "Your flute playing is being recorded again",
        });
      }
      return;
    }
    
    const success = await fluteAudio.startRecording();
    
    if (success) {
      setRecording(true);
      setRecordingPaused(false);
      setRecordingTime(0);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId);
      
      toast({
        title: "Recording started",
        description: "Your flute playing is now being recorded",
      });
    } else {
      setShowMicrophoneError(true);
      setMicErrorMessage("Could not access microphone. Please check your browser permissions and ensure that no other app is using your microphone.");
      
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const handlePauseRecording = () => {
    if (!recording || recordingPaused) return;
    
    const success = fluteAudio.pauseRecording();
    
    if (success) {
      setRecordingPaused(true);
      
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      toast({
        title: "Recording paused",
        description: "Your recording has been paused",
      });
    }
  };

  const handleResumeRecording = () => {
    if (!recording || !recordingPaused) return;
    
    const success = fluteAudio.resumeRecording();
    
    if (success) {
      setRecordingPaused(false);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);
      
      toast({
        title: "Recording resumed",
        description: "Your flute playing is being recorded again",
      });
    }
  };

  const handleStopRecording = async () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    const success = fluteAudio.stopRecording();
    
    if (success) {
      setRecording(false);
      setRecordingPaused(false);
      setConversionStatus('converting');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mp3Url = await fluteAudio.convertToMP3();
        
        if (mp3Url && audioPlayerRef.current) {
          audioPlayerRef.current.src = mp3Url;
          audioPlayerRef.current.load();
          setHasRecording(true);
          setConversionStatus('success');
          
          toast({
            title: "Recording ready",
            description: `Converted ${formatTime(recordingTime)} of audio to MP3`,
          });
        } else {
          throw new Error("Conversion failed");
        }
      } catch (error) {
        console.error("Error converting to MP3:", error);
        setConversionStatus('error');
        
        toast({
          title: "Conversion failed",
          description: "Could not convert recording to MP3. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePlayRecording = () => {
    if (!hasRecording) return;
    
    if (isPlayingRecording && !playbackPaused) {
      fluteAudio.pausePlayback();
      setPlaybackPaused(true);
    } else if (playbackPaused) {
      fluteAudio.resumePlayback();
      setPlaybackPaused(false);
    } else {
      const success = fluteAudio.playRecording();
      if (!success) {
        toast({
          title: "Playback failed",
          description: "Could not play the recording",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleStopPlayback = () => {
    if (!isPlayingRecording && !playbackPaused) return;
    
    fluteAudio.stopPlayback();
    setIsPlayingRecording(false);
    setPlaybackPaused(false);
  };

  const handleDownloadRecording = () => {
    const success = fluteAudio.downloadRecording();
    
    if (success) {
      toast({
        title: "Download started",
        description: "Your MP3 recording is being downloaded",
      });
    } else {
      toast({
        title: "Download failed",
        description: "No recording available to download",
        variant: "destructive",
      });
    }
  };

  const dismissMicrophoneError = () => {
    setShowMicrophoneError(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-lg rounded-2xl shadow-subtle border border-white/30 animate-fade-in">
      {conversionStatus === 'converting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl z-10">
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
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conversion Failed</AlertTitle>
          <AlertDescription>
            Could not convert your recording to MP3. Please try recording again.
            <div className="mt-2">
              <Button 
                size="sm" 
                onClick={() => setConversionStatus('idle')} 
                variant="outline"
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {showMicrophoneError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Microphone Access Error</AlertTitle>
          <AlertDescription>
            {micErrorMessage}
            <div className="mt-2">
              <Button 
                size="sm" 
                onClick={dismissMicrophoneError} 
                variant="outline"
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <AudioVisualizer isActive={recording || isPlayingRecording} amplitude={recording ? 0.8 : 0.5} />
      
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
              MP3 Recording ready - {formatTime(recordingTime)}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {!recording ? (
          <Button 
            onClick={handleStartRecording} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              !showMicrophoneError && "hover:bg-red-500/90 hover:text-white"
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
                className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </Button>
            ) : (
              <Button 
                onClick={handleResumeRecording} 
                className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600"
                variant="outline"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </Button>
            )}
            <Button 
              onClick={handleStopRecording} 
              className="flex flex-col items-center gap-1 bg-red-500/80 text-white hover:bg-red-600 mt-1"
              variant="outline"
              data-recording="true"
            >
              <Square className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        )}
        
        {!isPlayingRecording && !playbackPaused ? (
          <Button 
            onClick={handlePlayRecording} 
            className="flex flex-col items-center gap-1"
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
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </Button>
            ) : (
              <Button 
                onClick={handlePlayRecording} 
                className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                variant="outline"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </Button>
            )}
            <Button 
              onClick={handleStopPlayback} 
              className="flex flex-col items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 mt-1"
              variant="outline"
            >
              <StopCircle className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        )}
        
        <Button 
          onClick={handleDownloadRecording} 
          className="flex flex-col items-center gap-1"
          variant="outline"
          disabled={!hasRecording || conversionStatus === 'converting' || recording}
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Download</span>
        </Button>
      </div>
    </div>
  );
};

export default RecordingControls;
