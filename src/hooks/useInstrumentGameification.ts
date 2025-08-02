import { useState, useCallback } from 'react';
import { useGameification, GameMode, HitTiming } from './useGameification';
import { toast } from 'sonner';

export type InstrumentGameMode = 'normal' | 'tiles' | 'rhythm' | 'challenge' | 'educational';
export type AnimationType = 'particles' | 'sparkles' | 'musical' | 'bubbles' | 'stars' | 'none';

interface InstrumentGameificationConfig {
  instrumentType: string;
  gameMode: InstrumentGameMode;
  animationType: AnimationType;
  animationEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  autoMode?: boolean;
}

export interface InstrumentGameStats {
  score: number;
  accuracy: number;
  streak: number;
  notesPlayed: number;
  level: number;
  perfectHits: number;
  goodHits: number;
  missedHits: number;
  timeRemaining?: number;
}

export const useInstrumentGameification = (instrumentType: string) => {
  const [config, setConfig] = useState<InstrumentGameificationConfig>({
    instrumentType,
    gameMode: 'normal',
    animationType: 'particles',
    animationEnabled: true,
    difficulty: 'medium',
    autoMode: false
  });

  const [isGameActive, setIsGameActive] = useState(false);

  // Convert instrument game mode to standard game mode
  const getStandardGameMode = (mode: InstrumentGameMode): GameMode => {
    switch (mode) {
      case 'tiles':
      case 'rhythm':
        return 'rhythm';
      case 'challenge':
        return 'challenge';
      case 'educational':
        return 'educational';
      default:
        return 'freeplay';
    }
  };

  const {
    gameStats,
    isGameActive: gameificationActive,
    startGame: startGameification,
    endGame: endGameification,
    handleNoteHit: handleGameNoteHit,
    handleNotePlayed,
    resetStats
  } = useGameification({
    gameMode: getStandardGameMode(config.gameMode),
    timeLimit: config.gameMode === 'challenge' ? 60 : undefined,
    targetScore: config.gameMode === 'challenge' ? 5000 : undefined,
    onGameEnd: (stats) => {
      setIsGameActive(false);
      toast.success(`Game completed! Final score: ${stats.score}`, {
        description: `Accuracy: ${stats.accuracy}% | Max streak: ${stats.streak}`
      });
    },
    onLevelUp: (newLevel) => {
      toast.success(`Level ${newLevel} unlocked!`, {
        description: `New challenges available`
      });
    }
  });

  const updateGameMode = useCallback((newMode: InstrumentGameMode) => {
    setConfig(prev => ({ ...prev, gameMode: newMode }));
    if (isGameActive) {
      endGameification();
      setIsGameActive(false);
    }
  }, [isGameActive, endGameification]);

  const updateAnimationType = useCallback((newType: AnimationType) => {
    setConfig(prev => ({ ...prev, animationType: newType }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setConfig(prev => ({ ...prev, animationEnabled: !prev.animationEnabled }));
  }, []);

  const updateDifficulty = useCallback((newDifficulty: 'easy' | 'medium' | 'hard') => {
    setConfig(prev => ({ ...prev, difficulty: newDifficulty }));
  }, []);

  const startGame = useCallback(() => {
    if (config.gameMode !== 'normal') {
      setIsGameActive(true);
      startGameification();
    }
  }, [config.gameMode, startGameification]);

  const endGame = useCallback(() => {
    setIsGameActive(false);
    endGameification();
  }, [endGameification]);

  const handleNoteHit = useCallback((timing: HitTiming = 'perfect', note?: string) => {
    if (config.gameMode !== 'normal' && isGameActive) {
      handleGameNoteHit(timing);
    }
    
    // Handle note played for freeplay mode
    if (config.gameMode === 'normal' && note) {
      handleNotePlayed(instrumentType, note);
    }
  }, [config.gameMode, isGameActive, handleGameNoteHit, handleNotePlayed, instrumentType]);

  const getGameModeDescription = useCallback(() => {
    switch (config.gameMode) {
      case 'tiles':
        return `${instrumentType} Tiles: Hit the falling notes at the right time`;
      case 'rhythm':
        return `Rhythm Mode: Follow the beat and play in time`;
      case 'challenge':
        return `Challenge Mode: Reach 5000 points in 60 seconds`;
      case 'educational':
        return `Educational Mode: Learn while you play`;
      default:
        return `Free Play: Explore and create music`;
    }
  }, [config.gameMode, instrumentType]);

  const getAnimationConfig = useCallback(() => {
    if (!config.animationEnabled) return { type: 'none' as AnimationType, enabled: false };
    
    return {
      type: config.animationType,
      enabled: true,
      intensity: config.difficulty === 'easy' ? 0.5 : config.difficulty === 'hard' ? 2 : 1
    };
  }, [config.animationEnabled, config.animationType, config.difficulty]);

  return {
    config,
    gameStats: gameStats as InstrumentGameStats,
    isGameActive: isGameActive && gameificationActive,
    
    // Game controls
    startGame,
    endGame,
    handleNoteHit,
    resetStats,
    
    // Configuration
    updateGameMode,
    updateAnimationType,
    toggleAnimation,
    updateDifficulty,
    
    // Helpers
    getGameModeDescription,
    getAnimationConfig,
    
    // Game modes available for this instrument
    availableGameModes: ['normal', 'tiles', 'rhythm', 'challenge', 'educational'] as InstrumentGameMode[],
    availableAnimations: ['particles', 'sparkles', 'musical', 'bubbles', 'stars', 'none'] as AnimationType[]
  };
};

export default useInstrumentGameification;