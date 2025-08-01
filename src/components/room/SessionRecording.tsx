import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Download, Upload, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SessionRecordingProps {
  roomId: string;
  participants: any[];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayback: (recordingId: string) => void;
  className?: string;
}

interface Recording {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  participants: string[];
  size: number;
}

const SessionRecording: React.FC<SessionRecordingProps> = ({
  roomId,
  participants,
  onStartRecording,
  onStopRecording,
  onPlayback,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Session ${new Date().toLocaleDateString()}`,
          duration: recordingDuration,
          timestamp: new Date(),
          participants: participants.map(p => p.name),
          size: blob.size
        };
        
        setRecordings(prev => [newRecording, ...prev]);
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${newRecording.name}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      onStartRecording();
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    
    setIsRecording(false);
    onStopRecording();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handlePlayback = (recordingId: string) => {
    if (playingRecording === recordingId) {
      setPlayingRecording(null);
      setPlaybackProgress(0);
    } else {
      setPlayingRecording(recordingId);
      onPlayback(recordingId);
      // Simulate playback progress
      const interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPlayingRecording(null);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  return (
    <div className={cn(
      "glassmorphism rounded-lg p-4 space-y-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Session Recording</h3>
        <Badge variant={isRecording ? "destructive" : "secondary"}>
          {isRecording ? "Recording" : "Ready"}
        </Badge>
      </div>

      {/* Recording Controls */}
      <div className="space-y-3">
        {isRecording ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recording in progress...</span>
              <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
            </div>
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        ) : (
          <Button
            onClick={startRecording}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
              Start Recording
            </div>
          </Button>
        )}
      </div>

      {/* Recording Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Records all audio and screen activity</p>
        <p>• Participants: {participants.length}</p>
        <p>• Auto-downloads when stopped</p>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Recordings</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="p-3 rounded-lg bg-secondary/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{recording.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {recording.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">{formatDuration(recording.duration)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(recording.size)}
                    </p>
                  </div>
                </div>
                
                {/* Participants */}
                <div className="flex flex-wrap gap-1">
                  {recording.participants.slice(0, 3).map((participant, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                  {recording.participants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recording.participants.length - 3} more
                    </Badge>
                  )}
                </div>
                
                {/* Playback Progress */}
                {playingRecording === recording.id && (
                  <Progress value={playbackProgress} className="h-1" />
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePlayback(recording.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {playingRecording === recording.id ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRecording;