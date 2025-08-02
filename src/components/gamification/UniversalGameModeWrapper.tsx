import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstrumentGameification, InstrumentGameMode, AnimationType } from '@/hooks/useInstrumentGameification';
import { ParticleSystem } from '@/components/ui/particle-system';
import { PianoTilesGame, GuitarRhythmGame, DrumBeatGame, ViolinBowGame, FluteBreathGame } from './InstrumentGameModes';
import { 
  Music, 
  Zap, 
  Target, 
  GraduationCap, 
  Play, 
  Square, 
  Settings,
  Sparkles,
  Star,
  Circle
} from 'lucide-react';

interface UniversalGameModeWrapperProps {
  instrumentType: string;
  children: React.ReactNode;
  className?: string;
  enableAdmin?: boolean;
  onGameModeChange?: (mode: InstrumentGameMode) => void;
}

const gameIcons = {
  normal: Music,
  tiles: Zap,
  rhythm: Target,
  challenge: Target,
  educational: GraduationCap
};

const animationIcons = {
  particles: Circle,
  sparkles: Sparkles,
  musical: Music,
  bubbles: Circle,
  stars: Star,
  none: Square
};

export const UniversalGameModeWrapper: React.FC<UniversalGameModeWrapperProps> = ({
  instrumentType,
  children,
  className = '',
  enableAdmin = false,
  onGameModeChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    config,
    gameStats,
    isGameActive,
    startGame,
    endGame,
    handleNoteHit,
    resetStats,
    updateGameMode,
    updateAnimationType,
    toggleAnimation,
    updateDifficulty,
    getGameModeDescription,
    getAnimationConfig,
    availableGameModes,
    availableAnimations
  } = useInstrumentGameification(instrumentType);

  const handleGameModeChange = (mode: InstrumentGameMode) => {
    updateGameMode(mode);
    onGameModeChange?.(mode);
  };

  const renderSpecificGameMode = () => {
    if (config.gameMode === 'normal' || !isGameActive) return null;

    const handleGameNoteHit = (timing: 'perfect' | 'good' | 'miss', note?: string) => {
      handleNoteHit(timing, note);
    };

    const commonProps = {
      instrument: instrumentType,
      onNoteHit: handleGameNoteHit,
      isActive: isGameActive,
      difficulty: config.difficulty
    };

    switch (instrumentType.toLowerCase()) {
      case 'piano':
        return <PianoTilesGame {...commonProps} />;
      case 'guitar':
        return <GuitarRhythmGame {...commonProps} />;
      case 'drums':
      case 'drum':
        return <DrumBeatGame {...commonProps} />;
      case 'violin':
        return <ViolinBowGame {...commonProps} />;
      case 'flute':
        return <FluteBreathGame {...commonProps} />;
      default:
        // Generic rhythm game for other instruments
        return <PianoTilesGame {...commonProps} />;
    }
  };

  const animationConfig = getAnimationConfig();

  return (
    <div className={`relative ${className}`}>
      {/* Particle System */}
      {animationConfig.enabled && animationConfig.type !== 'none' && (
        <ParticleSystem
          isActive={isGameActive || config.gameMode !== 'normal'}
          type={animationConfig.type as any}
          intensity={animationConfig.intensity}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Game Mode Controls */}
      <Card className="mb-4 bg-background/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {React.createElement(gameIcons[config.gameMode], { size: 20 })}
              {instrumentType} Game Mode
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
              </Button>
              {config.gameMode !== 'normal' && (
                <Button
                  onClick={isGameActive ? endGame : startGame}
                  variant={isGameActive ? "destructive" : "default"}
                  size="sm"
                >
                  {isGameActive ? <Square size={16} /> : <Play size={16} />}
                  {isGameActive ? 'Stop' : 'Start'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Game Mode Selection */}
          <Tabs value={config.gameMode} onValueChange={handleGameModeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {availableGameModes.map((mode) => {
                const Icon = gameIcons[mode];
                return (
                  <TabsTrigger key={mode} value={mode} className="flex items-center gap-1">
                    <Icon size={14} />
                    <span className="hidden sm:inline capitalize">{mode}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {availableGameModes.map((mode) => (
              <TabsContent key={mode} value={mode} className="mt-3">
                <p className="text-sm text-muted-foreground">
                  {getGameModeDescription()}
                </p>
              </TabsContent>
            ))}
          </Tabs>

          {/* Game Stats */}
          {config.gameMode !== 'normal' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{gameStats.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{gameStats.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{gameStats.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{gameStats.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          )}

          {/* Time Progress for Challenge Mode */}
          {config.gameMode === 'challenge' && gameStats.timeRemaining !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Remaining</span>
                <span>{gameStats.timeRemaining}s</span>
              </div>
              <Progress value={(gameStats.timeRemaining / 60) * 100} className="h-2" />
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Animation Settings */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Animation</label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.animationEnabled}
                        onCheckedChange={toggleAnimation}
                      />
                      <span className="text-sm">Enable Effects</span>
                    </div>
                    {config.animationEnabled && (
                      <Select value={config.animationType} onValueChange={updateAnimationType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAnimations.map((animation) => {
                            const Icon = animationIcons[animation];
                            return (
                              <SelectItem key={animation} value={animation}>
                                <div className="flex items-center gap-2">
                                  <Icon size={14} />
                                  <span className="capitalize">{animation}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Difficulty Settings */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={config.difficulty} onValueChange={updateDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Game Controls */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Controls</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetStats}
                      className="w-full"
                    >
                      Reset Stats
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Game Mode Overlay */}
      {config.gameMode !== 'normal' && isGameActive && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {renderSpecificGameMode()}
        </div>
      )}

      {/* Main Instrument */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default UniversalGameModeWrapper;