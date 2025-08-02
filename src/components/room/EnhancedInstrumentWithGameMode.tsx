import React, { useState, useCallback } from 'react';
import { UniversalGameModeWrapper } from '@/components/gamification/UniversalGameModeWrapper';
import SimpleInstrument from './SimpleInstrument';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstrumentGameification, InstrumentGameMode } from '@/hooks/useInstrumentGameification';
import { Music, Settings, Trophy, Star, Zap } from 'lucide-react';

interface EnhancedInstrumentProps {
  instrumentType: string;
  userId: string;
  userName: string;
  isAdmin?: boolean;
  onGameModeChange?: (mode: InstrumentGameMode) => void;
  onSettingsChange?: (settings: any) => void;
}

export const EnhancedInstrumentWithGameMode: React.FC<EnhancedInstrumentProps> = ({
  instrumentType,
  userId,
  userName,
  isAdmin = false,
  onGameModeChange,
  onSettingsChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState({
    gamification: true,
    animations: true,
    soundEffects: true,
    analytics: true
  });

  const {
    config,
    gameStats,
    isGameActive,
    startGame,
    endGame,
    updateGameMode,
    updateAnimationType,
    updateDifficulty,
    getGameModeDescription,
    availableGameModes,
    availableAnimations
  } = useInstrumentGameification(instrumentType);

  const handleGameModeChange = useCallback((mode: InstrumentGameMode) => {
    updateGameMode(mode);
    onGameModeChange?.(mode);
    
    // Notify room of game mode change
    onSettingsChange?.({
      gameMode: mode,
      userId,
      userName,
      timestamp: Date.now()
    });
  }, [updateGameMode, onGameModeChange, onSettingsChange, userId, userName]);

  const handleFeatureToggle = useCallback((feature: keyof typeof enabledFeatures) => {
    setEnabledFeatures(prev => {
      const newFeatures = { ...prev, [feature]: !prev[feature] };
      onSettingsChange?.({
        features: newFeatures,
        userId,
        userName,
        timestamp: Date.now()
      });
      return newFeatures;
    });
  }, [onSettingsChange, userId, userName]);

  const getGameModeIcon = (mode: InstrumentGameMode) => {
    switch (mode) {
      case 'tiles': return <Zap className="h-4 w-4" />;
      case 'rhythm': return <Music className="h-4 w-4" />;
      case 'challenge': return <Trophy className="h-4 w-4" />;
      case 'educational': return <Star className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Control Panel */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              {instrumentType} Studio
              <Badge variant={isGameActive ? "default" : "secondary"} className="ml-2">
                {isGameActive ? "Game Active" : config.gameMode}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              {config.gameMode !== 'normal' && (
                <Button
                  onClick={isGameActive ? endGame : startGame}
                  variant={isGameActive ? "destructive" : "default"}
                  size="sm"
                >
                  {isGameActive ? 'End Game' : 'Start Game'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Game Mode Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {availableGameModes.map((mode) => (
              <Button
                key={mode}
                variant={config.gameMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => handleGameModeChange(mode)}
                className="flex items-center gap-1"
              >
                {getGameModeIcon(mode)}
                <span className="capitalize">{mode}</span>
              </Button>
            ))}
          </div>

          {/* Game Stats Display */}
          {config.gameMode !== 'normal' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{gameStats.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{gameStats.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">{gameStats.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground">L{gameStats.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          )}

          {/* Advanced Settings (Admin Only) */}
          {showAdvanced && isAdmin && (
            <Card className="bg-background/50">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Feature Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Features</h4>
                    {Object.entries(enabledFeatures).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{feature}</span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => handleFeatureToggle(feature as keyof typeof enabledFeatures)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Game Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Game Settings</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Animation Type</label>
                      <Select value={config.animationType} onValueChange={updateAnimationType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAnimations.map((animation) => (
                            <SelectItem key={animation} value={animation}>
                              <span className="capitalize">{animation}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm">Difficulty</label>
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
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {getGameModeDescription()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Instrument with Game Mode */}
      <UniversalGameModeWrapper
        instrumentType={instrumentType}
        enableAdmin={isAdmin}
        onGameModeChange={handleGameModeChange}
        className="min-h-[400px]"
      >
        <SimpleInstrument
          type={instrumentType}
          showGameMode={config.gameMode !== 'normal'}
          gameMode={config.gameMode === 'normal' ? 'normal' : 'tiles'}
          difficulty={config.difficulty}
          enableGameModeToggle={isAdmin}
        />
      </UniversalGameModeWrapper>
    </div>
  );
};

export default EnhancedInstrumentWithGameMode;