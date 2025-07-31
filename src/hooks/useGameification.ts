import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface GameStats {
  score: number;
  notesPlayed: number;
  accuracy: number;
  streak: number;
  timeRemaining?: number;
  level: number;
  multiplier: number;
  perfectHits: number;
  goodHits: number;
  missedHits: number;
}

export type GameMode = 'freeplay' | 'challenge' | 'rhythm' | 'educational';
export type HitTiming = 'perfect' | 'good' | 'miss';

interface UseGameificationOptions {
  gameMode: GameMode;
  timeLimit?: number; // in seconds
  targetScore?: number;
  onGameEnd?: (stats: GameStats) => void;
  onLevelUp?: (newLevel: number) => void;
}

export const useGameification = (options: UseGameificationOptions) => {
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    notesPlayed: 0,
    accuracy: 100,
    streak: 0,
    timeRemaining: options.timeLimit,
    level: 1,
    multiplier: 1,
    perfectHits: 0,
    goodHits: 0,
    missedHits: 0
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);

  // Start game
  const startGame = useCallback(() => {
    setIsGameActive(true);
    setGameStats({
      score: 0,
      notesPlayed: 0,
      accuracy: 100,
      streak: 0,
      timeRemaining: options.timeLimit,
      level: 1,
      multiplier: 1,
      perfectHits: 0,
      goodHits: 0,
      missedHits: 0
    });

    // Start timer if time limit is set
    if (options.timeLimit) {
      const timer = setInterval(() => {
        setGameStats(prev => {
          const newTimeRemaining = (prev.timeRemaining || 0) - 1;
          if (newTimeRemaining <= 0) {
            setIsGameActive(false);
            options.onGameEnd?.(prev);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
      setGameTimer(timer);
    }

    toast.success(`${options.gameMode.toUpperCase()} mode started!`);
  }, [options]);

  // End game
  const endGame = useCallback(() => {
    setIsGameActive(false);
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    options.onGameEnd?.(gameStats);
    toast.info('Game ended!');
  }, [gameTimer, gameStats, options]);

  // Handle note hit
  const handleNoteHit = useCallback((timing: HitTiming) => {
    if (!isGameActive) return;

    setGameStats(prev => {
      const newStats = { ...prev };
      
      // Update hit counts
      if (timing === 'perfect') {
        newStats.perfectHits++;
        newStats.streak++;
      } else if (timing === 'good') {
        newStats.goodHits++;
        newStats.streak++;
      } else {
        newStats.missedHits++;
        newStats.streak = 0;
      }

      newStats.notesPlayed++;

      // Calculate score
      let points = 0;
      if (timing === 'perfect') {
        points = 100 * newStats.multiplier;
        
        // Streak bonus
        if (newStats.streak >= 10) points *= 2;
        else if (newStats.streak >= 5) points *= 1.5;
        
      } else if (timing === 'good') {
        points = 50 * newStats.multiplier;
      }

      newStats.score += points;

      // Calculate accuracy
      const totalHits = newStats.perfectHits + newStats.goodHits;
      newStats.accuracy = newStats.notesPlayed > 0 
        ? Math.round((totalHits / newStats.notesPlayed) * 100) 
        : 100;

      // Level progression
      const newLevel = Math.floor(newStats.score / 1000) + 1;
      if (newLevel > newStats.level) {
        newStats.level = newLevel;
        newStats.multiplier = Math.min(newLevel, 5); // Max 5x multiplier
        options.onLevelUp?.(newLevel);
        toast.success(`Level up! Level ${newLevel}`, {
          description: `Multiplier: x${newStats.multiplier}`
        });
      }

      // Special streak notifications
      if (newStats.streak === 5) {
        toast.success('5 hit streak! 🔥');
      } else if (newStats.streak === 10) {
        toast.success('10 hit streak! Double points! ⚡');
      } else if (newStats.streak === 20) {
        toast.success('AMAZING! 20 hit streak! 🌟');
      }

      // Check win condition for challenge mode
      if (options.gameMode === 'challenge' && options.targetScore && newStats.score >= options.targetScore) {
        setTimeout(() => {
          setIsGameActive(false);
          options.onGameEnd?.(newStats);
          toast.success('Challenge completed!', {
            description: `Final score: ${newStats.score}`
          });
        }, 100);
      }

      return newStats;
    });
  }, [isGameActive, options]);

  // Handle note played (for freeplay mode)
  const handleNotePlayed = useCallback((instrument: string, note: string) => {
    if (!isGameActive || options.gameMode !== 'freeplay') return;

    setGameStats(prev => ({
      ...prev,
      notesPlayed: prev.notesPlayed + 1,
      score: prev.score + 10 // Small points for just playing
    }));
  }, [isGameActive, options.gameMode]);

  // Reset stats
  const resetStats = useCallback(() => {
    setGameStats({
      score: 0,
      notesPlayed: 0,
      accuracy: 100,
      streak: 0,
      timeRemaining: options.timeLimit,
      level: 1,
      multiplier: 1,
      perfectHits: 0,
      goodHits: 0,
      missedHits: 0
    });
  }, [options.timeLimit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) {
        clearInterval(gameTimer);
      }
    };
  }, [gameTimer]);

  return {
    gameStats,
    isGameActive,
    startGame,
    endGame,
    handleNoteHit,
    handleNotePlayed,
    resetStats
  };
};