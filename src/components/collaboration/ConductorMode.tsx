import React, { useState, useEffect } from 'react';
import { Crown, Users, Music, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGameification } from '@/hooks/useGameification';
import { cn } from '@/lib/utils';

interface ConductorModeProps {
  isConductor: boolean;
  participants: any[];
  onStartSession: () => void;
  onStopSession: () => void;
  onSyncMusic: (data: any) => void;
  className?: string;
}

const ConductorMode: React.FC<ConductorModeProps> = ({
  isConductor,
  participants,
  onStartSession,
  onStopSession,
  onSyncMusic,
  className
}) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentTempo, setCurrentTempo] = useState(120);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [syncedParticipants, setSyncedParticipants] = useState<string[]>([]);

  const {
    gameStats,
    isGameActive,
    startGame,
    endGame
  } = useGameification({
    gameMode: 'challenge',
    timeLimit: 300, // 5 minutes
    onGameEnd: (stats) => {
      setIsSessionActive(false);
      onStopSession();
    }
  });

  const handleStartSession = () => {
    setIsSessionActive(true);
    startGame();
    onStartSession();
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    endGame();
    onStopSession();
  };

  const activeParticipants = participants.filter(p => p.status === 'active');

  return (
    <div className={cn(
      "glassmorphism rounded-xl p-6 space-y-6",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className={cn(
            "h-6 w-6",
            isConductor ? "text-yellow-500" : "text-muted-foreground"
          )} />
          <h3 className="text-xl font-semibold">
            {isConductor ? "Conductor Mode" : "Following Conductor"}
          </h3>
          {isConductor && (
            <Badge variant="default" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
              Leader
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {activeParticipants.length} participants
          </span>
        </div>
      </div>

      <Separator />

      {/* Session Controls */}
      {isConductor && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={isSessionActive ? handleStopSession : handleStartSession}
              className={cn(
                "flex-1",
                isSessionActive 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              {isSessionActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Session
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
            
            <Button variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Tempo Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tempo</label>
              <span className="text-sm text-muted-foreground">{currentTempo} BPM</span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={currentTempo}
              onChange={(e) => setCurrentTempo(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Session Status */}
      {isSessionActive && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Session Active
            </span>
            {gameStats.timeRemaining && (
              <span className="text-sm text-muted-foreground">
                {Math.floor(gameStats.timeRemaining / 60)}:
                {(gameStats.timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
          
          <Progress value={sessionProgress} className="h-2" />
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Participants</h4>
        <div className="space-y-2">
          {activeParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {participant.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">{participant.instrument}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {syncedParticipants.includes(participant.id) && (
                  <Badge variant="secondary" className="text-xs">
                    Synced
                  </Badge>
                )}
                <Volume2 className={cn(
                  "h-4 w-4",
                  participant.audioActive ? "text-green-500" : "text-muted-foreground"
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sheet Music Sync */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Sheet Music</h4>
        <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center">
          <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isConductor ? "Upload sheet music to sync" : "Waiting for conductor's music"}
          </p>
          {isConductor && (
            <Button variant="outline" size="sm" className="mt-2">
              Upload Music
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductorMode;