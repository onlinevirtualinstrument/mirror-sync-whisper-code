
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useRoomState } from './useRoomState';
import { useRoomPresence } from './useRoomPresence';
import { useRoomCleanup } from './useRoomCleanup';
import { useUserRemovalDetection } from './useUserRemovalDetection';
import { listenToRoomData } from '@/utils/firebase';

export const useRoomData = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { handleFirebaseError, handleAsyncError } = useErrorHandler();

  const {
    room,
    setRoom,
    isLoading,
    setIsLoading,
    error,
    setError,
    isParticipant,
    isHost,
    userInfo,
    setUserInfo,
    normalizeRoomData,
    updateUserStatus
  } = useRoomState();

  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [lastInstrumentPlayTime, setLastInstrumentPlayTime] = useState<number>(Date.now());
  const [roomDataListener, setRoomDataListener] = useState<(() => void) | null>(null);

  // Enable automatic room cleanup with proper timing
  const { scheduleRoomDestruction, clearDestruction } = useRoomCleanup(roomId);
  const { updateFirestorePresence } = useRoomPresence(roomId, isParticipant);
  
  useUserRemovalDetection(room, isParticipant);

  const updateInstrumentPlayTime = useCallback(() => {
    const now = Date.now();
    console.log('useRoomData: Updating instrument play time:', new Date(now).toISOString());
    setLastInstrumentPlayTime(now);
  }, []);

  useEffect(() => {
    if (!roomId || !user) {
      console.log(`useRoomData: Missing requirements - roomId: ${roomId}, user: ${!!user}`);
      setIsLoading(false);
      return;
    }

    console.log(`useRoomData: Setting up room data listener for room ${roomId}`);
    setIsLoading(true);
    clearDestruction();

    // Clean up previous listener if it exists
    if (roomDataListener) {
      roomDataListener();
    }

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

          console.log('useRoomData: Processing room data update for room:', rawRoomData.id);
          
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

          // Update user status
          updateUserStatus(user.uid, normalizedRoom);

          // Schedule room destruction check with delay to allow for proper participant updates
          setTimeout(() => {
            scheduleRoomDestruction(normalizedRoom);
          }, 5000);

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
        
        if (error.message?.includes('Room not found')) {
          setError("Loading room... Please wait");
          setTimeout(() => {
            if (isLoading) {
              setError("Room could not be loaded. Please try again.");
              navigate('/music-rooms');
            }
          }, 8000);
        } else {
          setError("Failed to load room data");
          setTimeout(() => {
            navigate('/music-rooms');
          }, 3000);
        }
        setIsLoading(false);
      }
    );

    setRoomDataListener(() => unsubscribeRoom);

    return () => {
      console.log('useRoomData: Cleaning up room data listener');
      clearDestruction();
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [roomId, user?.uid, navigate, addNotification, handleFirebaseError, handleAsyncError, normalizeRoomData, updateUserStatus, clearDestruction, scheduleRoomDestruction]);

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
