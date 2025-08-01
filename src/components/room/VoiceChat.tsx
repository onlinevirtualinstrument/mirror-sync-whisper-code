import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VoiceChatProps {
  participants: any[];
  userId: string;
  onToggleMute: (isMuted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  participants,
  userId,
  onToggleMute,
  onVolumeChange,
  className
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audioLevels, setAudioLevels] = useState<{[key: string]: number}>({});
  const [isConnected, setIsConnected] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    initializeAudio();
    return () => cleanup();
  }, []);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsConnected(true);
      startAudioLevelMonitoring();
    } catch (error) {
      console.error('Voice chat initialization failed:', error);
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const level = (average / 255) * 100;
      
      setAudioLevels(prev => ({ ...prev, [userId]: level }));
      requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  };

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onToggleMute(newMutedState);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const activeSpeakers = participants.filter(p => 
    audioLevels[p.id] > 10 && p.id !== userId
  );

  return (
    <div className={cn(
      "glassmorphism rounded-lg p-4 space-y-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Voice Chat</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleMuteToggle}
          variant={isMuted ? "destructive" : "default"}
          size="sm"
          className="flex-1"
        >
          {isMuted ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Unmute
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Mute
            </>
          )}
        </Button>
        
        <div className="flex items-center gap-2 flex-1">
          <VolumeX className="h-4 w-4" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1"
          />
          <Volume2 className="h-4 w-4" />
          <span className="text-sm w-8">{volume}</span>
        </div>
      </div>

      {/* Audio Level Indicator */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Your Audio Level</div>
        <Progress value={audioLevels[userId] || 0} className="h-2" />
      </div>

      {/* Participants */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Participants ({participants.length})
        </div>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={cn(
                "flex items-center justify-between p-2 rounded bg-secondary/30",
                audioLevels[participant.id] > 10 && "bg-green-500/20"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs">
                    {participant.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <span className="text-sm">{participant.name}</span>
                {participant.id === userId && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {participant.isMuted ? (
                  <MicOff className="h-3 w-3 text-red-500" />
                ) : (
                  <Mic className={cn(
                    "h-3 w-3",
                    audioLevels[participant.id] > 10 ? "text-green-500" : "text-muted-foreground"
                  )} />
                )}
                <div className="w-12">
                  <Progress 
                    value={audioLevels[participant.id] || 0} 
                    className="h-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Speakers */}
      {activeSpeakers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Currently Speaking</div>
          <div className="flex flex-wrap gap-1">
            {activeSpeakers.map((speaker) => (
              <Badge key={speaker.id} variant="default" className="text-xs">
                {speaker.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;