
import { useState, useCallback } from 'react';

interface RoomParticipant {
  id: string;
  name: string;
  instrument: string;
  avatar: string;
  isHost: boolean;
  status: 'active' | 'inactive' | 'left';
  muted: boolean;
  lastSeen?: string;
  joinedAt?: string;
  leftAt?: string;
  isInRoom?: boolean;
  heartbeatTimestamp?: number;
}

interface RoomData {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  maxParticipants: number;
  hostId: string;
  hostInstrument: string;
  participants: RoomParticipant[];
  participantIds: string[];
  pendingRequests: string[];
  createdAt: any;
  creatorId: string;
  lastActivity?: string;
  lastInstrumentPlay?: string;
  autoCloseAfterInactivity?: boolean;
  inactivityTimeout?: number;
  isChatDisabled?: boolean;
  allowDifferentInstruments?: boolean;
  joinCode?: string;
}

export const useRoomState = () => {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<RoomParticipant | null>(null);

  const normalizeRoomData = useCallback((rawRoomData: any): RoomData => {
    console.log('useRoomState: Normalizing room data:', rawRoomData.id);

    let participants: RoomParticipant[] = [];
    if (Array.isArray(rawRoomData.participants)) {
      participants = rawRoomData.participants.map((p: any) => ({
        id: p.id || '',
        name: p.name || 'Anonymous',
        instrument: p.instrument || 'piano',
        avatar: p.avatar || '',
        isHost: p.isHost || false,
        status: p.status || 'active',
        muted: p.muted || false,
        lastSeen: p.lastSeen,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        isInRoom: p.isInRoom !== false,
        heartbeatTimestamp: p.heartbeatTimestamp || Date.now()
      }));
    }

    const participantIds = Array.isArray(rawRoomData.participantIds) 
      ? rawRoomData.participantIds 
      : participants.map(p => p.id);

    const pendingRequests = Array.isArray(rawRoomData.pendingRequests) 
      ? rawRoomData.pendingRequests 
      : [];

    return {
      id: rawRoomData.id || '',
      name: rawRoomData.name || 'Untitled Room',
      description: rawRoomData.description || '',
      isPublic: rawRoomData.isPublic !== false,
      maxParticipants: rawRoomData.maxParticipants || 3,
      hostId: rawRoomData.hostId || rawRoomData.creatorId || '',
      hostInstrument: rawRoomData.hostInstrument || 'piano',
      participants,
      participantIds,
      pendingRequests,
      createdAt: rawRoomData.createdAt || new Date(),
      creatorId: rawRoomData.creatorId || '',
      lastActivity: rawRoomData.lastActivity,
      lastInstrumentPlay: rawRoomData.lastInstrumentPlay,
      autoCloseAfterInactivity: rawRoomData.autoCloseAfterInactivity || false,
      inactivityTimeout: rawRoomData.inactivityTimeout || 5,
      isChatDisabled: rawRoomData.isChatDisabled || false,
      allowDifferentInstruments: rawRoomData.allowDifferentInstruments !== false,
      joinCode: rawRoomData.joinCode
    };
  }, []);

  const updateUserStatus = useCallback((userId: string, normalizedRoom: RoomData) => {
    const participantInfo = normalizedRoom.participants.find((p: RoomParticipant) => p.id === userId);
    
    if (participantInfo) {
      console.log(`useRoomState: User ${userId} found - isHost: ${participantInfo.isHost}, status: ${participantInfo.status}`);
      setIsParticipant(true);
      setIsHost(participantInfo.isHost);
      setUserInfo(participantInfo);
    } else {
      console.log(`useRoomState: User ${userId} not found in participants`);
      setIsParticipant(false);
      setIsHost(false);
      setUserInfo(null);
    }
  }, []);

  return {
    room,
    setRoom,
    isLoading,
    setIsLoading,
    error,
    setError,
    isParticipant,
    setIsParticipant,
    isHost,
    setIsHost,
    userInfo,
    setUserInfo,
    normalizeRoomData,
    updateUserStatus
  };
};
