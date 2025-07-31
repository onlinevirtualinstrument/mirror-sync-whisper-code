import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Play, Award, Users, Star, Clock, Target, 
  Music, HeadphonesIcon, Zap, Brain, Trophy, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameification } from '@/hooks/useGameification';

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
  lastAttempt?: Date;
}

interface EducationalModule {
  id: string;
  title: string;
  description: string;
  category: 'theory' | 'practice' | 'ear-training' | 'composition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  lessons: Lesson[];
  prerequisites?: string[];
  skills: string[];
  rewards: {
    xp: number;
    badges: string[];
  };
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz' | 'practice' | 'game';
  content: string;
  duration: number;
  objectives: string[];
  activities: Activity[];
}

interface Activity {
  id: string;
  type: 'note-identification' | 'rhythm-clapping' | 'chord-progression' | 'scale-practice';
  title: string;
  description: string;
  difficulty: number; // 1-10
  minScore: number;
}

const EducationalModules: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<EducationalModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [showProgress, setShowProgress] = useState(false);

  const { gameStats, isGameActive, startGame, endGame, handleNoteHit } = useGameification({
    gameMode: 'educational',
    onGameEnd: (stats) => {
      // Update lesson progress based on game stats
      console.log('Educational game ended:', stats);
    }
  });

  const modules: EducationalModule[] = [
    {
      id: 'music-theory-basics',
      title: 'Music Theory Fundamentals',
      description: 'Learn the building blocks of music: notes, scales, chords, and key signatures.',
      category: 'theory',
      difficulty: 'beginner',
      estimatedTime: 120,
      skills: ['Note Reading', 'Scales', 'Key Signatures', 'Intervals'],
      rewards: { xp: 500, badges: ['Theory Master', 'Note Reader'] },
      lessons: [
        {
          id: 'notes-staff',
          title: 'Notes and the Staff',
          type: 'interactive',
          content: 'Learn to identify notes on the musical staff',
          duration: 20,
          objectives: ['Identify treble clef notes', 'Understand staff lines and spaces'],
          activities: [
            {
              id: 'note-id-1',
              type: 'note-identification',
              title: 'Treble Clef Notes',
              description: 'Identify notes on the treble clef staff',
              difficulty: 3,
              minScore: 80
            }
          ]
        },
        {
          id: 'scales-intervals',
          title: 'Scales and Intervals',
          type: 'practice',
          content: 'Understanding major and minor scales',
          duration: 30,
          objectives: ['Play major scales', 'Recognize interval patterns'],
          activities: [
            {
              id: 'scale-practice-1',
              type: 'scale-practice',
              title: 'C Major Scale',
              description: 'Practice playing the C major scale',
              difficulty: 4,
              minScore: 75
            }
          ]
        }
      ]
    },
    {
      id: 'ear-training',
      title: 'Ear Training Essentials',
      description: 'Develop your musical ear with interval recognition, chord identification, and melody training.',
      category: 'ear-training',
      difficulty: 'intermediate',
      estimatedTime: 90,
      skills: ['Interval Recognition', 'Chord Quality', 'Melody Memory'],
      rewards: { xp: 400, badges: ['Golden Ear', 'Chord Detective'] },
      lessons: [
        {
          id: 'interval-training',
          title: 'Interval Recognition',
          type: 'game',
          content: 'Train your ear to recognize musical intervals',
          duration: 25,
          objectives: ['Identify major and minor intervals', 'Recognize perfect intervals'],
          activities: [
            {
              id: 'interval-game-1',
              type: 'note-identification',
              title: 'Interval Quiz',
              description: 'Listen and identify intervals',
              difficulty: 6,
              minScore: 70
            }
          ]
        }
      ]
    },
    {
      id: 'rhythm-mastery',
      title: 'Rhythm and Timing',
      description: 'Master rhythm patterns, time signatures, and develop your internal metronome.',
      category: 'practice',
      difficulty: 'beginner',
      estimatedTime: 75,
      skills: ['Beat Recognition', 'Time Signatures', 'Syncopation'],
      rewards: { xp: 300, badges: ['Rhythm Master', 'Beat Keeper'] },
      lessons: [
        {
          id: 'basic-rhythm',
          title: 'Basic Rhythm Patterns',
          type: 'interactive',
          content: 'Learn fundamental rhythm patterns',
          duration: 20,
          objectives: ['Clap quarter note patterns', 'Understand time signatures'],
          activities: [
            {
              id: 'rhythm-clap-1',
              type: 'rhythm-clapping',
              title: 'Quarter Note Patterns',
              description: 'Clap along with basic rhythm patterns',
              difficulty: 3,
              minScore: 85
            }
          ]
        }
      ]
    },
    {
      id: 'advanced-harmony',
      title: 'Advanced Harmony',
      description: 'Explore complex chord progressions, voice leading, and harmonic analysis.',
      category: 'theory',
      difficulty: 'advanced',
      estimatedTime: 180,
      prerequisites: ['music-theory-basics'],
      skills: ['Chord Progressions', 'Voice Leading', 'Harmonic Analysis'],
      rewards: { xp: 800, badges: ['Harmony Expert', 'Progression Master'] },
      lessons: [
        {
          id: 'chord-progressions',
          title: 'Common Chord Progressions',
          type: 'practice',
          content: 'Learn and practice popular chord progressions',
          duration: 40,
          objectives: ['Play ii-V-I progressions', 'Understand circle of fifths'],
          activities: [
            {
              id: 'progression-practice-1',
              type: 'chord-progression',
              title: 'ii-V-I in Major',
              description: 'Practice the most common jazz progression',
              difficulty: 7,
              minScore: 75
            }
          ]
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theory': return <BookOpen className="w-5 h-5" />;
      case 'practice': return <Play className="w-5 h-5" />;
      case 'ear-training': return <HeadphonesIcon className="w-5 h-5" />;
      case 'composition': return <Music className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const calculateModuleProgress = (module: EducationalModule) => {
    const completedLessons = module.lessons.filter(lesson => 
      userProgress.get(lesson.id)?.completed
    ).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    if (lesson.type === 'game' || lesson.type === 'practice') {
      startGame();
    }
  };

  const completeLesson = (lesson: Lesson, score: number) => {
    const existing = userProgress.get(lesson.id);
    const newProgress: LessonProgress = {
      lessonId: lesson.id,
      completed: score >= 70, // 70% minimum to complete
      score: Math.max(score, existing?.score || 0),
      attempts: (existing?.attempts || 0) + 1,
      timeSpent: (existing?.timeSpent || 0) + lesson.duration,
      lastAttempt: new Date()
    };
    
    setUserProgress(prev => new Map(prev.set(lesson.id, newProgress)));
    setActiveLesson(null);
    
    if (isGameActive) {
      endGame();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold gradient-text">Educational Modules</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enhance your musical knowledge with structured learning paths designed for all skill levels
        </p>
        
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowProgress(!showProgress)}
            className="glass-card"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Progress
          </Button>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            className="glass-card p-6 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your Learning Progress
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="neo-morphism p-4 rounded-lg text-center">
                <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userProgress.size}</p>
                <p className="text-sm text-muted-foreground">Lessons Started</p>
              </div>
              
              <div className="neo-morphism p-4 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {Array.from(userProgress.values()).filter(p => p.completed).length}
                </p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
              
              <div className="neo-morphism p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {Math.round(Array.from(userProgress.values()).reduce((acc, p) => acc + p.timeSpent, 0) / 60)}h
                </p>
                <p className="text-sm text-muted-foreground">Time Studied</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Grid */}
      {!selectedModule && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              className="glass-card p-6 rounded-xl hover-lift cursor-pointer"
              onClick={() => setSelectedModule(module)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="neo-morphism p-3 rounded-lg">
                  {getCategoryIcon(module.category)}
                </div>
                <Badge className={`${getDifficultyColor(module.difficulty)} text-white`}>
                  {module.difficulty}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{module.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {module.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{module.estimatedTime} minutes</span>
                  <Users className="w-4 h-4 ml-2" />
                  <span>{module.lessons.length} lessons</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(calculateModuleProgress(module))}%</span>
                  </div>
                  <Progress value={calculateModuleProgress(module)} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {module.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {module.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{module.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Module Detail View */}
      {selectedModule && !activeLesson && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => setSelectedModule(null)}
            className="mb-6"
          >
            ← Back to Modules
          </Button>
          
          <div className="glass-card p-8 rounded-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedModule.title}</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {selectedModule.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedModule.estimatedTime} minutes
                  </span>
                  <Badge className={`${getDifficultyColor(selectedModule.difficulty)} text-white`}>
                    {selectedModule.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {selectedModule.rewards.xp} XP
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Lessons</h3>
              
              {selectedModule.lessons.map((lesson, index) => {
                const progress = userProgress.get(lesson.id);
                const isCompleted = progress?.completed || false;
                const canStart = index === 0 || userProgress.get(selectedModule.lessons[index - 1].id)?.completed;
                
                return (
                  <motion.div
                    key={lesson.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : canStart
                        ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer'
                        : 'border-border bg-muted/50 opacity-60'
                    }`}
                    onClick={() => canStart && startLesson(lesson)}
                    whileHover={canStart ? { scale: 1.01 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : canStart
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {lesson.duration} minutes • {lesson.type}
                          </p>
                          {progress && (
                            <p className="text-xs text-muted-foreground">
                              Best Score: {progress.score}% • Attempts: {progress.attempts}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {canStart && !isCompleted && (
                        <Button size="sm" onClick={() => startLesson(lesson)}>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <Button size="sm" variant="outline" onClick={() => startLesson(lesson)}>
                          Review
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Lesson View */}
      {activeLesson && (
        <motion.div
          className="glass-card p-8 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
              <p className="text-muted-foreground">{activeLesson.type} • {activeLesson.duration} minutes</p>
            </div>
            
            <Button variant="ghost" onClick={() => setActiveLesson(null)}>
              ← Back to Module
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {activeLesson.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 neo-morphism rounded-lg">
              <p className="text-center text-muted-foreground mb-4">
                Interactive lesson content would be rendered here
              </p>
              
              {isGameActive && (
                <div className="text-center">
                  <p className="mb-4">Practice session in progress...</p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => completeLesson(activeLesson, 85)}>
                      Complete with 85%
                    </Button>
                    <Button onClick={() => completeLesson(activeLesson, 65)} variant="outline">
                      Complete with 65%
                    </Button>
                  </div>
                </div>
              )}
              
              {!isGameActive && (
                <div className="text-center">
                  <Button onClick={() => startLesson(activeLesson)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EducationalModules;