
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPresence } from './useUserPresence';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase/config';
import {
  listenToRoomData,
  isUserRoomParticipant,
  deleteRoomFromFirestore
} from '@/utils/firebase';

export const useRoomData = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { handleFirebaseError, handleAsyncError, logError } = useErrorHandler();

  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [wasRemoved, setWasRemoved] = useState<boolean>(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [lastInstrumentPlayTime, setLastInstrumentPlayTime] = useState<number>(Date.now());
  const [userPresenceHeartbeat, setUserPresenceHeartbeat] = useState<number>(Date.now());
  const [isUserActive, setIsUserActive] = useState<boolean>(true);
  const [roomCreatedAt, setRoomCreatedAt] = useState<number>(Date.now());

  // Enhanced user activity detection with logging
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      console.log(`useRoomData: Visibility changed - active: ${isActive}`);
      setIsUserActive(isActive);
      if (isActive) {
        setUserPresenceHeartbeat(Date.now());
      }
    };

    const handleBeforeUnload = () => {
      // Enhanced cleanup on page unload
      console.log('useRoomData: Page unloading, marking user as leaving');
      if (roomId && user && isParticipant) {
        const roomRef = doc(db, "musicRooms", roomId);
        
        // Use sendBeacon for more reliable cleanup on page unload
        const updateData = {
          [`participants.${user.uid}.leftAt`]: new Date().toISOString(),
          [`participants.${user.uid}.status`]: 'left',
          [`participants.${user.uid}.isInRoom`]: false
        };
        
        try {
          // Try beacon first for reliability during page unload
          if (navigator.sendBeacon) {
            const data = new FormData();
            data.append('roomId', roomId);
            data.append('userId', user.uid);
            data.append('action', 'leave');
            // Note: In a real app, you'd send this to a server endpoint
          }
          
          // Fallback to Firestore update
          updateDoc(roomRef, updateData).catch((error) => {
            console.error('useRoomData: Failed to update user status on unload:', error);
          });
        } catch (error) {
          console.error('useRoomData: Error during beforeunload cleanup:', error);
        }
      }
    };

    const handleFocus = () => {
      console.log('useRoomData: Window focused');
      setIsUserActive(true);
      setUserPresenceHeartbeat(Date.now());
    };

    const handleBlur = () => {
      console.log('useRoomData: Window blurred');
      setIsUserActive(false);
    };

    // Enhanced activity tracking with mouse/keyboard events
    const handleUserActivity = () => {
      if (isUserActive) {
        setUserPresenceHeartbeat(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('click', handleUserActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, [roomId, user, isParticipant, isUserActive]);

  // Enhanced heartbeat with better presence tracking and error handling
  useEffect(() => {
    if (!roomId || !user || !isParticipant || !room) return;

    console.log('useRoomData: Setting up heartbeat interval');
    
    const heartbeatInterval = setInterval(async () => {
      if (isUserActive) {
        console.log('useRoomData: Sending heartbeat');
        setUserPresenceHeartbeat(Date.now());

        try {
          const participants = Array.isArray(room.participants) ? room.participants : [];
          const updatedParticipants = participants.map((p: any) => {
            if (p.id === user.uid) {
              return {
                ...p,
                lastSeen: new Date().toISOString(),
                status: 'active',
                isInRoom: true,
                heartbeatTimestamp: Date.now()
              };
            }
            return p;
          });

          const roomRef = doc(db, "musicRooms", roomId);
          await updateDoc(roomRef, {
            participants: updatedParticipants,
            lastActivity: new Date().toISOString()
          });
          
          console.log('useRoomData: Heartbeat sent successfully');
        } catch (error) {
          console.error('useRoomData: Heartbeat failed:', error);
          handleFirebaseError(error, 'send heartbeat', user.uid, roomId);
        }
      }
    }, 15000); // Send heartbeat every 15 seconds

    return () => {
      console.log('useRoomData: Cleaning up heartbeat interval');
      clearInterval(heartbeatInterval);
    };
  }, [roomId, user, isParticipant, room, isUserActive, handleFirebaseError]);

  // Enhanced auto-close logic with comprehensive user tracking
  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity || !roomId) {
      return;
    }

    console.log('useRoomData: Checking room inactivity for auto-close');
    
    const now = Date.now();
    const creationTime = room.createdAt ? new Date(room.createdAt).getTime() : roomCreatedAt;
    
    // Skip if room is less than 30 seconds old
    if (now - creationTime < 30000) {
      console.log('useRoomData: Room too new for auto-close check');
      return;
    }
    
    const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // 5 minutes default
    const participants = Array.isArray(room.participants) ? room.participants : [];

    // Enhanced user activity analysis
    const activeParticipants = participants.filter((p: any) => {
      const lastSeen = p.lastSeen ? new Date(p.lastSeen).getTime() : 0;
      const timeSinceLastSeen = now - lastSeen;
      const leftAt = p.leftAt ? new Date(p.leftAt).getTime() : 0;
      const heartbeatTimestamp = p.heartbeatTimestamp || 0;
      const timeSinceHeartbeat = now - heartbeatTimestamp;

      const isActive = timeSinceLastSeen <= 45000 && // Last seen within 45 seconds
                      timeSinceHeartbeat <= 45000 && // Heartbeat within 45 seconds
                      leftAt === 0 && // Hasn't explicitly left
                      p.status === 'active' &&
                      p.isInRoom !== false;

      console.log(`useRoomData: Participant ${p.id} - active: ${isActive}, lastSeen: ${timeSinceLastSeen}ms ago, heartbeat: ${timeSinceHeartbeat}ms ago`);
      return isActive;
    });

    const allUsersLeft = activeParticipants.length === 0;
    const timeSinceLastActivity = now - lastActivityTime;
    const timeSinceLastInstrument = now - lastInstrumentPlayTime;

    console.log(`useRoomData: Room ${roomId} status - Active participants: ${activeParticipants.length}/${participants.length}, All users left: ${allUsersLeft}, Time since activity: ${Math.round(timeSinceLastActivity / 1000)}s, Time since instrument: ${Math.round(timeSinceLastInstrument / 1000)}s`);

    // Enhanced auto-close conditions with comprehensive logging
    let shouldClose = false;
    let closeReason = '';

    if (allUsersLeft) {
      shouldClose = true;
      closeReason = 'all users have left';
    } else if (timeSinceLastActivity > inactivityTimeout && timeSinceLastInstrument > inactivityTimeout) {
      shouldClose = true;
      closeReason = `inactivity timeout reached (${inactivityTimeout / 60000} minutes)`;
    }

    if (shouldClose) {
      console.log(`useRoomData: Auto-closing room: ${closeReason}`);
      
      try {
        await deleteRoomFromFirestore(roomId);
        navigate('/music-rooms');
        addNotification({
          title: "Room Auto-Closed",
          message: `Room was automatically closed because ${closeReason}`,
          type: "info"
        });
      } catch (error) {
        console.error('useRoomData: Error auto-closing room:', error);
        handleFirebaseError(error, 'auto-close room', user?.uid, roomId);
      }
    }
  }, [room, isHost, roomId, navigate, addNotification, lastActivityTime, lastInstrumentPlayTime, roomCreatedAt, handleFirebaseError, user]);

  const updateInstrumentPlayTime = useCallback(() => {
    const now = Date.now();
    console.log('useRoomData: Updating instrument play time:', new Date(now).toISOString());
    setLastInstrumentPlayTime(now);
  }, []);

  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`useRoomData: Setting up room data listener for room ${roomId}`);

    const checkParticipation = async () => {
      try {
        console.log('useRoomData: Checking user participation');
        const isUserParticipant = await isUserRoomParticipant(roomId, user.uid);
        console.log(`useRoomData: User ${user.uid} is participant: ${isUserParticipant}`);
        setIsParticipant(isUserParticipant);
      } catch (error) {
        console.error("useRoomData: Error checking participation:", error);
        handleAsyncError(error as Error, 'check participation', user.uid, roomId);
        setError("Failed to verify room participation");
      }
    };

    checkParticipation();

    const unsubscribeRoom = listenToRoomData(
      roomId,
      (roomData) => {
        if (!roomData) {
          console.warn('useRoomData: Room data is null, room may have been closed');
          addNotification({
            title: "Room Closed",
            message: "This room has been closed by the host",
            type: "warning"
          });
          navigate('/music-rooms');
          return;
        }

        console.log('useRoomData: Received room data update:', roomData.id);
        setRoom(roomData);
        setIsLoading(false);

        // Update activity times from room data
        if (roomData.createdAt) {
          const createdTime = new Date(roomData.createdAt).getTime();
          setRoomCreatedAt(createdTime);
          console.log('useRoomData: Room created at:', new Date(createdTime).toISOString());
        }

        if (roomData.lastActivity) {
          const activityTime = new Date(roomData.lastActivity).getTime();
          setLastActivityTime(activityTime);
          console.log('useRoomData: Last activity at:', new Date(activityTime).toISOString());
        }

        if (roomData.lastInstrumentPlay) {
          const instrumentTime = new Date(roomData.lastInstrumentPlay).getTime();
          setLastInstrumentPlayTime(instrumentTime);
          console.log('useRoomData: Last instrument play at:', new Date(instrumentTime).toISOString());
        }

        if (user) {
          const participants = Array.isArray(roomData.participants) ? roomData.participants : [];
          const participantInfo = participants.find((p: any) => p.id === user.uid);

          // Enhanced removal detection
          if (isParticipant && !participantInfo && !wasRemoved) {
            console.warn(`useRoomData: User ${user.uid} was removed from room ${roomId}`);
            setWasRemoved(true);
            addNotification({
              title: "Removed from Room",
              message: "You have been removed from this room by the host",
              type: "error"
            });
            navigate('/music-rooms');
            return;
          }

          if (participantInfo) {
            console.log(`useRoomData: User found in participants - isHost: ${participantInfo.isHost}`);
            setIsParticipant(true);
            setIsHost(participantInfo.isHost);
            setUserInfo(participantInfo);
          } else if (!isParticipant) {
            console.log('useRoomData: User not found in participants');
            setIsParticipant(false);
            setIsHost(false);
          }
        }
      },
      (error) => {
        console.error("useRoomData: Room data listener error:", error);
        handleFirebaseError(error, 'listen to room data', user?.uid, roomId);
        setError("Failed to load room data. The room may have been closed.");
        setIsLoading(false);
        navigate('/music-rooms');
      }
    );

    return () => {
      console.log('useRoomData: Cleaning up room data listener');
      unsubscribeRoom();
    };
  }, [roomId, user, navigate, isParticipant, wasRemoved, addNotification, handleFirebaseError, handleAsyncError]);

  useUserPresence(roomId, isParticipant);

  // Enhanced inactivity check with more frequent monitoring and error handling
  useEffect(() => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;
    
    console.log('useRoomData: Setting up auto-close monitoring');
    const interval = setInterval(() => {
      try {
        checkInactivityAndClose();
      } catch (error) {
        console.error('useRoomData: Error in auto-close check:', error);
        handleAsyncError(error as Error, 'auto-close check', user?.uid, roomId);
      }
    }, 10000); // Check every 10 seconds
    
    // Initial check
    checkInactivityAndClose();
    
    return () => {
      console.log('useRoomData: Cleaning up auto-close monitoring');
      clearInterval(interval);
    };
  }, [room, isHost, checkInactivityAndClose, handleAsyncError, user, roomId]);

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