
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useUserPresence } from './useUserPresence';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  listenToRoomData,
  deleteRoomFromFirestore
} from '@/utils/firebase';

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

export const useRoomData = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { handleFirebaseError, handleAsyncError } = useErrorHandler();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<RoomParticipant | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [lastInstrumentPlayTime, setLastInstrumentPlayTime] = useState<number>(Date.now());
  const [roomDestructionTimeout, setRoomDestructionTimeout] = useState<NodeJS.Timeout | null>(null);

  console.log(`useRoomData: Hook initialized for room ${roomId}, user: ${user?.uid}`);

  const normalizeRoomData = useCallback((rawRoomData: any): RoomData => {
    console.log('useRoomData: Normalizing room data:', rawRoomData);

    // Ensure participants is always an array
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

    const normalizedRoom: RoomData = {
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

    console.log('useRoomData: Normalized room data:', {
      id: normalizedRoom.id,
      participantCount: participants.length,
      participantIds: participantIds,
      hostId: normalizedRoom.hostId
    });
    return normalizedRoom;
  }, []);

  const checkRoomForDestruction = useCallback(async (currentRoom: RoomData) => {
    if (!roomId || !currentRoom) return;

    // Clear any existing timeout
    if (roomDestructionTimeout) {
      clearTimeout(roomDestructionTimeout);
      setRoomDestructionTimeout(null);
    }

    const activeParticipants = currentRoom.participants.filter(p => 
      p.status === 'active' && p.isInRoom !== false
    );

    console.log(`useRoomData: Room ${roomId} destruction check - ${activeParticipants.length} active participants`);

    if (activeParticipants.length === 0) {
      console.log('useRoomData: No active participants, scheduling room destruction in 5 seconds');
      
      // Add a delay before destroying to prevent immediate destruction during joins
      const timeout = setTimeout(async () => {
        try {
          console.log('useRoomData: Executing room destruction after delay');
          await deleteRoomFromFirestore(roomId);
          navigate('/music-rooms');
          addNotification({
            title: "Room Closed",
            message: "Room was closed as all participants have left",
            type: "info"
          });
        } catch (error) {
          console.error('useRoomData: Error destroying empty room:', error);
          handleFirebaseError(error, 'destroy empty room', user?.uid, roomId);
        }
      }, 5000); // 5 second delay

      setRoomDestructionTimeout(timeout);
    } else {
      console.log(`useRoomData: Room has ${activeParticipants.length} active participants, not destroying`);
    }
  }, [roomId, navigate, addNotification, handleFirebaseError, user, roomDestructionTimeout]);

  const updateInstrumentPlayTime = useCallback(() => {
    const now = Date.now();
    console.log('useRoomData: Updating instrument play time:', new Date(now).toISOString());
    setLastInstrumentPlayTime(now);
  }, []);

  useEffect(() => {
    if (!roomId || !user) {
      console.log(`useRoomData: Missing requirements - roomId: ${roomId}, user: ${!!user}`);
      return;
    }

    console.log(`useRoomData: Setting up room data listener for room ${roomId}`);
    setIsLoading(true);

    const unsubscribeRoom = listenToRoomData(
      roomId,
      (rawRoomData) => {
        try {
          if (!rawRoomData) {
            console.warn('useRoomData: Room data is null, room may have been closed');
            addNotification({
              title: "Room Closed",
              message: "This room has been closed or no longer exists",
              type: "warning"
            });
            navigate('/music-rooms');
            return;
          }

          console.log('useRoomData: Processing room data update');
          
          const normalizedRoom = normalizeRoomData(rawRoomData);
          setRoom(normalizedRoom);
          setIsLoading(false);
          setError(null);

          // Update activity timestamps
          if (normalizedRoom.lastActivity) {
            const activityTime = new Date(normalizedRoom.lastActivity).getTime();
            setLastActivityTime(activityTime);
          }

          if (normalizedRoom.lastInstrumentPlay) {
            const instrumentTime = new Date(normalizedRoom.lastInstrumentPlay).getTime();
            setLastInstrumentPlayTime(instrumentTime);
          }

          // Check user participation
          const participantInfo = normalizedRoom.participants.find((p: RoomParticipant) => p.id === user.uid);
          
          if (participantInfo) {
            console.log(`useRoomData: User found in participants - isHost: ${participantInfo.isHost}, status: ${participantInfo.status}`);
            setIsParticipant(true);
            setIsHost(participantInfo.isHost);
            setUserInfo(participantInfo);
          } else {
            console.log('useRoomData: User not found in participants');
            setIsParticipant(false);
            setIsHost(false);
            setUserInfo(null);
          }

          // Only check for room destruction if room has been loaded for a while
          // This prevents immediate destruction during room creation/joining
          setTimeout(() => {
            checkRoomForDestruction(normalizedRoom);
          }, 2000);

        } catch (error) {
          console.error('useRoomData: Error processing room data:', error);
          handleAsyncError(error as Error, 'process room data', user.uid, roomId);
          setError('Failed to process room data');
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("useRoomData: Room data listener error:", error);
        handleFirebaseError(error, 'listen to room data', user?.uid, roomId);
        setError("Failed to load room data");
        setIsLoading(false);
      }
    );

    return () => {
      console.log('useRoomData: Cleaning up room data listener');
      if (roomDestructionTimeout) {
        clearTimeout(roomDestructionTimeout);
      }
      unsubscribeRoom();
    };
  }, [roomId, user?.uid, navigate, addNotification, handleFirebaseError, handleAsyncError, normalizeRoomData, checkRoomForDestruction]);

  useUserPresence(roomId, isParticipant);

  return {
    room,
    isLoading,
    error,
    isParticipant,
    isHost,
    userInfo,
    setRoom,
    setUserInfo,
    setLastActivityTime,
    updateInstrumentPlayTime
  };
};
