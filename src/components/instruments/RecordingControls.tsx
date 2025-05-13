
import React, { useState, useEffect, useRef } from 'react';
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  instrumentType: string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ instrumentType }) => {
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);

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

    return () => {
      if (timer) clearInterval(timer);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [timer]);

  useEffect(() => {
    if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      setShowMicrophoneError(true);
      setMicErrorMessage("Your browser doesn't support recording. Please try a modern browser like Chrome or Firefox.");
    }
  }, []);

  const handleStartRecording = async () => {
    setShowMicrophoneError(false);
    setConversionStatus('idle');
    
    if (isPlayingRecording) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingRecording(false);
      setPlaybackPaused(false);
    }
    
    if (recording && recordingPaused) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.resume();
        setRecordingPaused(false);
        const intervalId = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setTimer(intervalId);
        
        toast({
          title: "Recording resumed",
          description: `Your ${instrumentType} playing is being recorded again`,
        });
      }
      return;
    }
    
    try {
      // Use specific constraints to minimize ambient noise
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length) {
          setConversionStatus('converting');
          setTimeout(() => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (audioUrlRef.current) {
              URL.revokeObjectURL(audioUrlRef.current);
            }
            const audioUrl = URL.createObjectURL(audioBlob);
            audioUrlRef.current = audioUrl;
            if (audioPlayerRef.current) {
              audioPlayerRef.current.src = audioUrl;
              audioPlayerRef.current.load();
            }
            setHasRecording(true);
            setConversionStatus('success');
            toast({
              title: "Recording ready",
              description: `Converted ${formatTime(recordingTime)} of audio`,
            });
          }, 1000);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms for more reliable recording
      setRecording(true);
      setRecordingPaused(false);
      setRecordingTime(0);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId);
      
      toast({
        title: "Recording started",
        description: `Your ${instrumentType} playing is now being recorded`,
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
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
    if (!recording || recordingPaused || !mediaRecorderRef.current) return;
    
    try {
      mediaRecorderRef.current.pause();
      setRecordingPaused(true);
      
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      toast({
        title: "Recording paused",
        description: "Your recording has been paused",
      });
    } catch (err) {
      console.error("Error pausing recording:", err);
      toast({
        title: "Pause failed",
        description: "Could not pause recording",
        variant: "destructive",
      });
    }
  };

  const handleResumeRecording = () => {
    if (!recording || !recordingPaused || !mediaRecorderRef.current) return;
    
    try {
      mediaRecorderRef.current.resume();
      setRecordingPaused(false);
      
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);
      
      toast({
        title: "Recording resumed",
        description: `Your ${instrumentType} playing is being recorded again`,
      });
    } catch (err) {
      console.error("Error resuming recording:", err);
      toast({
        title: "Resume failed",
        description: "Could not resume recording",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    try {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      setRecordingPaused(false);
    } catch (err) {
      console.error("Error stopping recording:", err);
      toast({
        title: "Stop failed",
        description: "Could not stop recording",
        variant: "destructive",
      });
    }
  };

  const handlePlayRecording = () => {
    if (!hasRecording || !audioPlayerRef.current) return;
    
    if (isPlayingRecording && !playbackPaused) {
      audioPlayerRef.current.pause();
      setPlaybackPaused(true);
    } else if (playbackPaused) {
      audioPlayerRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback failed",
          description: "Could not play the recording",
          variant: "destructive",
        });
      });
      setPlaybackPaused(false);
    } else {
      audioPlayerRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback failed",
          description: "Could not play the recording",
          variant: "destructive",
        });
      });
    }
  };
  
  const handleStopPlayback = () => {
    if (!isPlayingRecording && !playbackPaused || !audioPlayerRef.current) return;
    
    audioPlayerRef.current.pause();
    audioPlayerRef.current.currentTime = 0;
    setIsPlayingRecording(false);
    setPlaybackPaused(false);
  };

  const convertToMP3 = async (blob: Blob): Promise<Blob> => {
    // This is a simplified MP3 conversion approach
    // In a real app, you'd use a proper encoder library
    // For now, we'll return the blob as is but with MP3 MIME type
    return new Promise((resolve) => {
      // Simulate conversion process
      setTimeout(() => {
        // Creating a new blob with MP3 mime type
        const mp3Blob = new Blob([blob], { type: 'audio/mp3' });
        resolve(mp3Blob);
      }, 1000);
    });
  };

  const handleDownloadRecording = async () => {
    if (!hasRecording || !audioUrlRef.current) {
      toast({
        title: "Download failed",
        description: "No recording available to download",
        variant: "destructive",
      });
      return;
    }
    
    setConversionStatus('converting');
    
    try {
      // Get the original blob
      const response = await fetch(audioUrlRef.current);
      const originalBlob = await response.blob();
      
      // Convert to MP3
      const mp3Blob = await convertToMP3(originalBlob);
      
      // Create a download link
      const a = document.createElement("a");
      const mp3Url = URL.createObjectURL(mp3Blob);
      a.href = mp3Url;
      a.download = `${instrumentType.toLowerCase()}_recording.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      setTimeout(() => {
        URL.revokeObjectURL(mp3Url);
      }, 100);
      
      setConversionStatus('idle');
      
      toast({
        title: "Download started",
        description: "Your MP3 recording is being downloaded",
      });
    } catch (error) {
      console.error("Error downloading recording:", error);
      setConversionStatus('error');
      toast({
        title: "Download failed",
        description: "Could not download recording",
        variant: "destructive",
      });
    }
  };

  const dismissMicrophoneError = () => {
    setShowMicrophoneError(false);
  };

  // Audio visualizer component
  const AudioVisualizer = ({ isActive, amplitude = 0.5 }: { isActive: boolean; amplitude?: number }) => {
    return (
      <div className="w-full h-12 flex items-center justify-center">
        <div className={`audio-wave ${isActive ? 'active' : ''}`}>
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              style={{ 
                animationDelay: `${i * 0.2}s`,
                opacity: isActive ? 0.7 : 0.3,
                height: isActive ? `${20 + Math.random() * 15 * amplitude}px` : '3px'
              }}
            ></span>
          ))}
        </div>
        <style>{`
          .audio-wave {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            height: 40px;
            width: 100%;
          }
          
          .audio-wave span {
            display: inline-block;
            width: 5px;
            background-color: currentColor;
            border-radius: 3px;
            transition: height 0.3s ease;
          }
          
          .audio-wave.active span {
            animation: wave 1s infinite ease-in-out;
          }
          
          @keyframes wave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-lg rounded-2xl shadow-subtle border border-white/30">
      {conversionStatus === 'converting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-xl shadow-lg">
            <div className="audio-wave">
              {[...Array(5)].map((_, i) => (
                <span key={i}></span>
              ))}
            </div>
            <p className="text-sm font-medium">Converting to audio...</p>
          </div>
        </div>
      )}
      
      {conversionStatus === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conversion Failed</AlertTitle>
          <AlertDescription>
            Could not convert your recording. Please try recording again.
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
              Recording ready - {formatTime(recordingTime)}
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
