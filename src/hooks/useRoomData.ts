
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPresence } from './useUserPresence';
import { useNotifications } from '@/hooks/useNotifications';
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

  // Enhanced user activity detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsUserActive(!document.hidden);
      if (!document.hidden) {
        setUserPresenceHeartbeat(Date.now());
      }
    };

    const handleBeforeUnload = () => {
      // Mark user as leaving when they navigate away or close tab
      if (roomId && user && isParticipant) {
        const roomRef = doc(db, "musicRooms", roomId);
        updateDoc(roomRef, {
          [`participants.${user.uid}.leftAt`]: new Date().toISOString(),
          [`participants.${user.uid}.status`]: 'left'
        }).catch(console.error);
      }
    };

    const handleFocus = () => {
      setIsUserActive(true);
      setUserPresenceHeartbeat(Date.now());
    };

    const handleBlur = () => {
      setIsUserActive(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [roomId, user, isParticipant]);

  // Enhanced heartbeat with better presence tracking
  useEffect(() => {
    if (!roomId || !user || !isParticipant) return;

    const heartbeatInterval = setInterval(() => {
      if (isUserActive) {
        setUserPresenceHeartbeat(Date.now());

        if (room) {
          const updatedParticipants = room.participants?.map((p: any) => {
            if (p.id === user.uid) {
              return {
                ...p,
                lastSeen: new Date().toISOString(),
                status: 'active',
                isInRoom: true
              };
            }
            return p;
          }) || [];

          const roomRef = doc(db, "musicRooms", roomId);
          updateDoc(roomRef, {
            participants: updatedParticipants,
            lastActivity: new Date().toISOString()
          }).catch(console.error);
        }
      }
    }, 15000); // Send heartbeat every 15 seconds

    return () => clearInterval(heartbeatInterval);
  }, [roomId, user, isParticipant, room, isUserActive]);



  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity || !roomId) return;

    const now = Date.now();
    const creationTime = room.createdAt ? new Date(room.createdAt).getTime() : roomCreatedAt;
    if (now - creationTime < 10000) return; // Skip if room is <10s old
    const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // 5 minutes default

    // Enhanced user tracking logic
    const allUsersLeft = room.participants?.every((p: any) => {
      const lastSeen = p.lastSeen ? new Date(p.lastSeen).getTime() : 0;
      const timeSinceLastSeen = now - lastSeen;
      const leftAt = p.leftAt ? new Date(p.leftAt).getTime() : 0;

      // Consider user left if:
      // 1. No heartbeat for 45 seconds (3 missed heartbeats)
      // 2. Explicitly marked as left
      // 3. Status is not active
      return timeSinceLastSeen > 45000 ||
        leftAt > 0 ||
        p.status !== 'active' ||
        !p.isInRoom;
    }) || false;

    const activeParticipants = room.participants?.filter((p: any) => {
      const lastSeen = p.lastSeen ? new Date(p.lastSeen).getTime() : 0;
      const timeSinceLastSeen = now - lastSeen;
      return timeSinceLastSeen <= 45000 && p.status === 'active' && p.isInRoom;
    }).length || 0;

    const timeSinceLastActivity = now - lastActivityTime;
    const timeSinceLastInstrument = now - lastInstrumentPlayTime;

    console.log(`Room ${roomId} - Active participants: ${activeParticipants}, All users left: ${allUsersLeft}, Time since activity: ${Math.round(timeSinceLastActivity / 1000)}s, Time since instrument: ${Math.round(timeSinceLastInstrument / 1000)}s`);

    // Enhanced auto-close conditions
    if (allUsersLeft || activeParticipants === 0) {
      console.log('Auto-closing room: all users have left');
      try {
        await deleteRoomFromFirestore(roomId);
        navigate('/music-rooms');
        addNotification({
          title: "Room Auto-Closed",
          message: "Room was automatically closed because all users left",
          type: "info"
        });
      } catch (error) {
        console.error('Error auto-closing room:', error);
      }
    } else if (timeSinceLastActivity > inactivityTimeout && timeSinceLastInstrument > inactivityTimeout) {
      console.log('Auto-closing room: inactivity timeout reached');
      try {
        await deleteRoomFromFirestore(roomId);
        navigate('/music-rooms');
        addNotification({
          title: "Room Auto-Closed",
          message: "Room was automatically closed due to inactivity",
          type: "info"
        });
      } catch (error) {
        console.error('Error auto-closing room:', error);
      }
    }
  }, [room, isHost, roomId, navigate, addNotification, lastActivityTime, lastInstrumentPlayTime, roomCreatedAt]);

  const updateInstrumentPlayTime = useCallback(() => {
    setLastInstrumentPlayTime(Date.now());
  }, []);

  useEffect(() => {
    if (!roomId || !user) return;

    const checkParticipation = async () => {
      try {
        const isUserParticipant = await isUserRoomParticipant(roomId, user.uid);
        setIsParticipant(isUserParticipant);
      } catch (error) {
        console.error("Error checking participation:", error);
        setError("Failed to verify room participation");
      }
    };

    checkParticipation();

    const unsubscribeRoom = listenToRoomData(
      roomId,
      (roomData) => {
        if (!roomData) {
          addNotification({
            title: "Room Closed",
            message: "This room has been closed by the host",
            type: "warning"
          });
          navigate('/music-rooms');
          return;
        }

        setRoom(roomData);
        setIsLoading(false);

        // Update activity times from room data
         if (roomData.createdAt) {
          setRoomCreatedAt(new Date(roomData.createdAt).getTime());
        }

        if (roomData.lastActivity) {
          const activityTime = new Date(roomData.lastActivity).getTime();
          setLastActivityTime(activityTime);
        }

        if (roomData.lastInstrumentPlay) {
          const instrumentTime = new Date(roomData.lastInstrumentPlay).getTime();
          setLastInstrumentPlayTime(instrumentTime);
        }

        if (user) {
          const participants = roomData.participants || [];
          const participantInfo = participants.find((p: any) => p.id === user.uid);

          if (isParticipant && !participantInfo && !wasRemoved) {
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
            setIsParticipant(true);
            setIsHost(participantInfo.isHost);
            setUserInfo(participantInfo);
          } else {
            setIsParticipant(false);
            setIsHost(false);
          }
        }
      },
      (error) => {
        console.error("Room data error:", error);
        setError("Failed to load room data. The room may have been closed.");
        setIsLoading(false);
        navigate('/music-rooms');
      }
    );

    return () => {
      unsubscribeRoom();
    };
  }, [roomId, user, navigate, isParticipant, wasRemoved, addNotification]);

  useUserPresence(roomId, isParticipant);

  // Enhanced inactivity check with more frequent monitoring
  useEffect(() => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;
    const interval = setInterval(checkInactivityAndClose, 10000); // Check every 10 seconds
    checkInactivityAndClose();
    return () => clearInterval(interval);
  }, [room, isHost, checkInactivityAndClose]);

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
