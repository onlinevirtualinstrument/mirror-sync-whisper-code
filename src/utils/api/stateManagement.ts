import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, updateDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { InstrumentGameStats } from '@/hooks/useInstrumentGameification';

// Global App State
interface AppState {
  // User preferences
  theme: 'light' | 'dark' | 'system';
  volume: number;
  keyboardShortcuts: boolean;
  
  // Audio settings
  audioLatency: number;
  audioQuality: 'low' | 'medium' | 'high';
  enableSpatialAudio: boolean;
  
  // Game settings
  defaultGameMode: 'normal' | 'tiles' | 'rhythm' | 'challenge' | 'educational';
  animationsEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Social features
  allowJoinRequests: boolean;
  sharePerformances: boolean;
  leaderboardParticipation: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setVolume: (volume: number) => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  setAudioLatency: (latency: number) => void;
  setAudioQuality: (quality: 'low' | 'medium' | 'high') => void;
  setEnableSpatialAudio: (enabled: boolean) => void;
  setDefaultGameMode: (mode: 'normal' | 'tiles' | 'rhythm' | 'challenge' | 'educational') => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  setAllowJoinRequests: (allow: boolean) => void;
  setSharePerformances: (share: boolean) => void;
  setLeaderboardParticipation: (participate: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      volume: 0.7,
      keyboardShortcuts: true,
      audioLatency: 0,
      audioQuality: 'medium',
      enableSpatialAudio: false,
      defaultGameMode: 'normal',
      animationsEnabled: true,
      difficulty: 'medium',
      allowJoinRequests: true,
      sharePerformances: false,
      leaderboardParticipation: true,

      // Actions
      setTheme: (theme) => set({ theme }),
      setVolume: (volume) => set({ volume }),
      setKeyboardShortcuts: (keyboardShortcuts) => set({ keyboardShortcuts }),
      setAudioLatency: (audioLatency) => set({ audioLatency }),
      setAudioQuality: (audioQuality) => set({ audioQuality }),
      setEnableSpatialAudio: (enableSpatialAudio) => set({ enableSpatialAudio }),
      setDefaultGameMode: (defaultGameMode) => set({ defaultGameMode }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setAllowJoinRequests: (allowJoinRequests) => set({ allowJoinRequests }),
      setSharePerformances: (sharePerformances) => set({ sharePerformances }),
      setLeaderboardParticipation: (leaderboardParticipation) => set({ leaderboardParticipation }),
    }),
    {
      name: 'music-app-storage',
      partialize: (state) => ({
        theme: state.theme,
        volume: state.volume,
        keyboardShortcuts: state.keyboardShortcuts,
        audioLatency: state.audioLatency,
        audioQuality: state.audioQuality,
        enableSpatialAudio: state.enableSpatialAudio,
        defaultGameMode: state.defaultGameMode,
        animationsEnabled: state.animationsEnabled,
        difficulty: state.difficulty,
        allowJoinRequests: state.allowJoinRequests,
        sharePerformances: state.sharePerformances,
        leaderboardParticipation: state.leaderboardParticipation,
      }),
    }
  )
);

// Game Statistics State
interface GameStatsState {
  stats: Record<string, InstrumentGameStats>;
  achievements: string[];
  totalPlayTime: number;
  favoriteInstruments: string[];
  recentInstruments: string[];
  
  // Actions
  updateStats: (instrument: string, stats: InstrumentGameStats) => void;
  addAchievement: (achievement: string) => void;
  addPlayTime: (minutes: number) => void;
  addToFavorites: (instrument: string) => void;
  removeFromFavorites: (instrument: string) => void;
  addToRecent: (instrument: string) => void;
  clearStats: () => void;
}

export const useGameStatsStore = create<GameStatsState>()(
  persist(
    (set, get) => ({
      stats: {},
      achievements: [],
      totalPlayTime: 0,
      favoriteInstruments: [],
      recentInstruments: [],

      updateStats: (instrument, newStats) => set((state) => {
        const currentStats = state.stats[instrument] || {
          score: 0,
          accuracy: 0,
          streak: 0,
          notesPlayed: 0,
          level: 1,
          perfectHits: 0,
          goodHits: 0,
          missedHits: 0
        };

        return {
          stats: {
            ...state.stats,
            [instrument]: {
              score: Math.max(currentStats.score, newStats.score),
              accuracy: Math.max(currentStats.accuracy, newStats.accuracy),
              streak: Math.max(currentStats.streak, newStats.streak),
              notesPlayed: currentStats.notesPlayed + newStats.notesPlayed,
              level: Math.max(currentStats.level, newStats.level),
              perfectHits: currentStats.perfectHits + newStats.perfectHits,
              goodHits: currentStats.goodHits + newStats.goodHits,
              missedHits: currentStats.missedHits + newStats.missedHits
            }
          }
        };
      }),

      addAchievement: (achievement) => set((state) => ({
        achievements: state.achievements.includes(achievement) 
          ? state.achievements 
          : [...state.achievements, achievement]
      })),

      addPlayTime: (minutes) => set((state) => ({
        totalPlayTime: state.totalPlayTime + minutes
      })),

      addToFavorites: (instrument) => set((state) => ({
        favoriteInstruments: state.favoriteInstruments.includes(instrument)
          ? state.favoriteInstruments
          : [...state.favoriteInstruments, instrument]
      })),

      removeFromFavorites: (instrument) => set((state) => ({
        favoriteInstruments: state.favoriteInstruments.filter(i => i !== instrument)
      })),

      addToRecent: (instrument) => set((state) => {
        const filtered = state.recentInstruments.filter(i => i !== instrument);
        return {
          recentInstruments: [instrument, ...filtered].slice(0, 10)
        };
      }),

      clearStats: () => set({
        stats: {},
        achievements: [],
        totalPlayTime: 0
      })
    }),
    {
      name: 'game-stats-storage'
    }
  )
);

// Room State Management
interface RoomState {
  currentRoomId: string | null;
  isRoomAdmin: boolean;
  roomSettings: {
    voiceChatEnabled: boolean;
    gameModeEnabled: boolean;
    allowGuestUsers: boolean;
    maxParticipants: number;
  };
  participants: Array<{
    id: string;
    name: string;
    instrument: string;
    isAdmin: boolean;
    isMuted: boolean;
  }>;
  
  // Actions
  setCurrentRoom: (roomId: string | null) => void;
  setIsRoomAdmin: (isAdmin: boolean) => void;
  updateRoomSettings: (settings: Partial<RoomState['roomSettings']>) => void;
  setParticipants: (participants: RoomState['participants']) => void;
  addParticipant: (participant: RoomState['participants'][0]) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<RoomState['participants'][0]>) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoomId: null,
  isRoomAdmin: false,
  roomSettings: {
    voiceChatEnabled: false,
    gameModeEnabled: true,
    allowGuestUsers: true,
    maxParticipants: 10
  },
  participants: [],

  setCurrentRoom: (currentRoomId) => set({ currentRoomId }),
  setIsRoomAdmin: (isRoomAdmin) => set({ isRoomAdmin }),
  
  updateRoomSettings: (newSettings) => set((state) => ({
    roomSettings: { ...state.roomSettings, ...newSettings }
  })),

  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),
  
  removeParticipant: (participantId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== participantId)
  })),
  
  updateParticipant: (participantId, updates) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === participantId ? { ...p, ...updates } : p
    )
  }))
}));

// Firebase Integration Functions
export const syncRoomStateWithFirebase = async (roomId: string) => {
  const roomStore = useRoomStore.getState();
  
  try {
    // Listen for room changes
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        roomStore.updateRoomSettings(data.settings || {});
        roomStore.setParticipants(data.participants || []);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error syncing room state:', error);
    return () => {};
  }
};

export const updateRoomSettingsInFirebase = async (roomId: string, settings: any) => {
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      settings,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating room settings:', error);
    throw error;
  }
};

// Performance Analytics
interface PerformanceState {
  metrics: {
    audioLatency: number[];
    frameRate: number[];
    memoryUsage: number[];
    networkLatency: number[];
  };
  isOptimized: boolean;
  
  // Actions
  addMetric: (type: keyof PerformanceState['metrics'], value: number) => void;
  clearMetrics: () => void;
  setOptimized: (optimized: boolean) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  metrics: {
    audioLatency: [],
    frameRate: [],
    memoryUsage: [],
    networkLatency: []
  },
  isOptimized: false,

  addMetric: (type, value) => set((state) => ({
    metrics: {
      ...state.metrics,
      [type]: [...state.metrics[type].slice(-50), value] // Keep last 50 measurements
    }
  })),

  clearMetrics: () => set({
    metrics: {
      audioLatency: [],
      frameRate: [],
      memoryUsage: [],
      networkLatency: []
    }
  }),

  setOptimized: (isOptimized) => set({ isOptimized })
}));

export default {
  useAppStore,
  useGameStatsStore,
  useRoomStore,
  usePerformanceStore,
  syncRoomStateWithFirebase,
  updateRoomSettingsInFirebase
};