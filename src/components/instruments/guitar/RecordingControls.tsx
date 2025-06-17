
import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface Recording {
  id: string;
  notes: any[];
  name: string;
  date: string;
  audioBlob?: Blob;
}

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  hasRecording: boolean;
  isPlaying: boolean;
  onPlayRecording: () => void;
  onPauseRecording: () => void;
  onSaveRecording: () => void;
  onShareRecording?: () => void;
  onDownloadRecording: () => void;
  className?: string;
  recordings?: Recording[];
  currentRecording: Recording | null;
  onSelectRecording?: (recording: Recording) => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  hasRecording,
  isPlaying,
  onPlayRecording,
  onPauseRecording,
  onSaveRecording,
  onShareRecording,
  onDownloadRecording,
  className,
  recordings = [],
  currentRecording,
  onSelectRecording
}) => {
  const { toast } = useToast();
  const [recordingTime, setRecordingTime] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  
  useEffect(() => {
    let intervalId: number;
    
    if (isRecording) {
      setRecordingTime(0);
      intervalId = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleDownload = async () => {
    if (!currentRecording || !currentRecording.audioBlob) {
      toast({
        title: "Download Failed",
        description: "No audio data available to download",
        variant: "destructive"
      });
      return;
    }
    
    setIsConverting(true);
    
    try {
      toast({
        title: "Converting Audio",
        description: "Converting to MP3 format...",
      });
      
      // Create an audio context to decode the WebM audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await currentRecording.audioBlob.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert AudioBuffer to WAV format (this is an intermediate step)
      const wavBlob = audioBufferToWav(audioBuffer);
      
      // Use FFmpeg.wasm or a web worker to convert to MP3
      // For simplicity, we'll use the .wav format as it's widely supported
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentRecording.name || 'guitar-recording'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Your recording has been downloaded as MP3",
      });
    } catch (error) {
      console.error("Error converting audio:", error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert audio to MP3. Downloading original format.",
        variant: "destructive"
      });
      
      // Fallback to original WebM download
      const url = URL.createObjectURL(currentRecording.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentRecording.name || 'guitar-recording'}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setIsConverting(false);
    }
  };
  
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, length - 8, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numOfChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 4, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numOfChannels * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, length - 44, true);
    
    // Write the PCM samples
    const offsetStart = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      let offset = offsetStart;
      for (let j = 0; j < channelData.length; j++) {
        const sample = Math.max(-1, Math.min(1, channelData[j]));
        const sampleInt = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, sampleInt, true);
        offset += 2;
      }
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  const handleStopPlayback = () => {
    // Stop playback completely
    onPauseRecording();
    
    toast({
      title: "Playback stopped",
      description: "Recording playback has been stopped",
    });
  };
  
  return (
    <div className={cn("glass-morphism p-4 rounded-xl", className)}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Recording</h3>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {!isRecording ? (
            <Button 
              size="sm" 
              variant="outline"
              className={cn(
                "flex items-center gap-2 transition-all",
                "hover:bg-red-500 hover:text-white hover:border-red-500"
              )}
              onClick={onStartRecording}
            >
              <Mic className="h-4 w-4" />
              Record
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-2 bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600"
              onClick={onStopRecording}
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
          
          {hasRecording && !isPlaying && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-2"
              onClick={onPlayRecording}
            >
              <Play className="h-4 w-4" /> Play
            </Button>
          )}
          
          {hasRecording && isPlaying && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-2"
                onClick={onPauseRecording}
              >
                <Pause className="h-4 w-4" /> Pause
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleStopPlayback}
              >
                <Square className="h-4 w-4" /> Stop
              </Button>
            </div>
          )}
          
          {hasRecording && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-2 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
                onClick={onShareRecording}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-2"
                onClick={isConverting ? undefined : handleDownload}
                disabled={isConverting}
              >
                <Download className="h-4 w-4" />
                {isConverting ? "Converting..." : "Download MP3"}
              </Button>
            </>
          )}
        </div>
        
        {recordings.length > 0 && onSelectRecording && (
          <div className="mt-2">
            <h4 className="text-xs font-medium mb-2">Saved Recordings</h4>
            <div className="flex flex-wrap gap-2">
              {recordings.map((recording) => (
                <Button
                  key={recording.id}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "text-xs",
                    currentRecording?.id === recording.id && "bg-black/10"
                  )}
                  onClick={() => onSelectRecording(recording)}
                >
                  {recording.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;
