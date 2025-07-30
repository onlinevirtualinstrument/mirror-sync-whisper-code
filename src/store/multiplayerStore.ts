/**
 * Centralized Multiplayer State Management
 * Handles room state, participants, and real-time synchronization
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { InstrumentNote } from '@/types/InstrumentNote';

export interface Participant {
  id: string;
  displayName: string;
  avatar?: string;
  instrument: string;
  isActive: boolean;
  lastActivity: number;
  audioLevel: number;
  permissions: ('play' | 'admin' | 'mute' | 'kick')[];
}

export interface RoomState {
  id: string;
  name: string;
  isPrivate: boolean;
  maxParticipants: number;
  createdBy: string;
  settings: {
    allowGuestJoin: boolean;
    requireApproval: boolean;
    enableChat: boolean;
    enableVoice: boolean;
    tempo: number;
    key: string;
    scale: string;
  };
}

export interface MultiplayerState {
  // Connection state
  isConnected: boolean;
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  latency: number;
  
  // Room state
  currentRoom: RoomState | null;
  participants: Participant[];
  activeNotes: Map<string, InstrumentNote>;
  
  // Audio state
  masterVolume: number;
  isMuted: boolean;
  audioAnalyzer: AnalyserNode | null;
  
  // Game state
  gameSession: {
    isActive: boolean;
    mode: 'freeplay' | 'collaborative' | 'competitive' | 'synchronized';
    conductor: string | null;
    tempo: number;
    currentBeat: number;
  } | null;
  
  // Actions
  setConnectionState: (connected: boolean, quality?: 'poor' | 'fair' | 'good' | 'excellent') => void;
  setLatency: (latency: number) => void;
  joinRoom: (room: RoomState) => void;
  leaveRoom: () => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  addActiveNote: (noteId: string, note: InstrumentNote) => void;
  removeActiveNote: (noteId: string) => void;
  setMasterVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  startGameSession: (mode: MultiplayerState['gameSession']['mode'], conductor?: string) => void;
  endGameSession: () => void;
  updateGameBeat: (beat: number) => void;
}

export const useMultiplayerStore = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isConnected: false,
    connectionQuality: 'fair',
    latency: 0,
    currentRoom: null,
    participants: [],
    activeNotes: new Map(),
    masterVolume: 0.7,
    isMuted: false,
    audioAnalyzer: null,
    gameSession: null,

    // Actions
    setConnectionState: (connected, quality = 'fair') => 
      set({ isConnected: connected, connectionQuality: quality }),

    setLatency: (latency) => set({ latency }),

    joinRoom: (room) => 
      set({ 
        currentRoom: room, 
        participants: [], 
        activeNotes: new Map(),
        gameSession: null 
      }),

    leaveRoom: () => 
      set({ 
        currentRoom: null, 
        participants: [], 
        activeNotes: new Map(),
        gameSession: null 
      }),

    addParticipant: (participant) => 
      set((state) => ({
        participants: [...state.participants.filter(p => p.id !== participant.id), participant]
      })),

    removeParticipant: (participantId) => 
      set((state) => ({
        participants: state.participants.filter(p => p.id !== participantId)
      })),

    updateParticipant: (participantId, updates) => 
      set((state) => ({
        participants: state.participants.map(p => 
          p.id === participantId ? { ...p, ...updates } : p
        )
      })),

    addActiveNote: (noteId, note) => 
      set((state) => {
        const newActiveNotes = new Map(state.activeNotes);
        newActiveNotes.set(noteId, note);
        return { activeNotes: newActiveNotes };
      }),

    removeActiveNote: (noteId) => 
      set((state) => {
        const newActiveNotes = new Map(state.activeNotes);
        newActiveNotes.delete(noteId);
        return { activeNotes: newActiveNotes };
      }),

    setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),

    setMuted: (muted) => set({ isMuted: muted }),

    startGameSession: (mode, conductor) => 
      set({
        gameSession: {
          isActive: true,
          mode,
          conductor: conductor || null,
          tempo: 120,
          currentBeat: 0
        }
      }),

    endGameSession: () => set({ gameSession: null }),

    updateGameBeat: (beat) => 
      set((state) => 
        state.gameSession 
          ? { gameSession: { ...state.gameSession, currentBeat: beat } }
          : state
      ),
  }))
);

// Selectors
export const selectParticipants = (state: MultiplayerState) => state.participants;
export const selectActiveNotes = (state: MultiplayerState) => state.activeNotes;
export const selectIsConnected = (state: MultiplayerState) => state.isConnected;
export const selectCurrentRoom = (state: MultiplayerState) => state.currentRoom;
export const selectGameSession = (state: MultiplayerState) => state.gameSession;