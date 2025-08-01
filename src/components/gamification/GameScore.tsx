import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Timer, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GameStats {
  score: number;
  notesPlayed: number;
  accuracy: number;
  streak: number;
  timeRemaining?: number;
  level: number;
  multiplier: number;
}

interface GameScoreProps {
  stats: GameStats;
  gameMode?: 'freeplay' | 'challenge' | 'rhythm' | 'educational';
  showTimer?: boolean;
  onLevelUp?: (newLevel: number) => void;
  className?: string;
}

const GameScore: React.FC<GameScoreProps> = ({
  stats,
  gameMode = 'freeplay',
  showTimer = false,
  onLevelUp,
  className
}) => {
  const [previousScore, setPreviousScore] = useState(stats.score);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);

  useEffect(() => {
    if (stats.score > previousScore) {
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 500);
      setPreviousScore(stats.score);
    }
  }, [stats.score, previousScore]);

  useEffect(() => {
    if (stats.streak > 0 && stats.streak % 5 === 0) {
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1000);
    }
  }, [stats.streak]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 20) return 'text-purple-400';
    if (streak >= 10) return 'text-yellow-400';
    if (streak >= 5) return 'text-orange-400';
    return 'text-white';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    if (accuracy >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm",
      "border border-white/10 rounded-lg p-4 shadow-xl",
      "text-white font-mono",
      className
    )}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-300">Score</div>
            <div className={cn(
              "text-xl font-bold transition-all duration-500",
              scoreAnimation && "scale-110 text-yellow-400"
            )}>
              {stats.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center space-x-2">
          <Zap className={cn(
            "h-5 w-5 transition-all duration-300",
            getStreakColor(stats.streak),
            streakAnimation && "animate-pulse scale-125"
          )} />
          <div>
            <div className="text-xs text-gray-300">Streak</div>
            <div className={cn(
              "text-xl font-bold transition-all duration-300",
              getStreakColor(stats.streak),
              streakAnimation && "animate-bounce"
            )}>
              {stats.streak}
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-400" />
          <div>
            <div className="text-xs text-gray-300">Accuracy</div>
            <div className={cn(
              "text-xl font-bold",
              getAccuracyColor(stats.accuracy)
            )}>
              {stats.accuracy}%
            </div>
          </div>
        </div>

        {/* Timer or Level */}
        <div className="flex items-center space-x-2">
          {showTimer && stats.timeRemaining !== undefined ? (
            <>
              <Timer className={cn(
                "h-5 w-5",
                stats.timeRemaining <= 10 ? "text-red-400 animate-pulse" : "text-green-400"
              )} />
              <div>
                <div className="text-xs text-gray-300">Time</div>
                <div className={cn(
                  "text-xl font-bold",
                  stats.timeRemaining <= 10 ? "text-red-400" : "text-green-400"
                )}>
                  {formatTime(stats.timeRemaining)}
                </div>
              </div>
            </>
          ) : (
            <>
              <Star className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-xs text-gray-300">Level</div>
                <div className="text-xl font-bold text-purple-400">
                  {stats.level}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar for level/multiplier */}
      {gameMode !== 'freeplay' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Level Progress</span>
            <span>x{stats.multiplier} multiplier</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(stats.notesPlayed % 50) * 2}%` }}
            />
          </div>
        </div>
      )}

      {/* Game mode indicator */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-gray-300">
          {gameMode.toUpperCase()} MODE
        </span>
      </div>
    </div>
  );
};

export default GameScore;