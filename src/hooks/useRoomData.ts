
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { doc, updateDoc } from 'firebase/firestore';
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

  // Send heartbeat every 30 seconds to indicate user is still active in room
  useEffect(() => {
    if (!roomId || !user || !isParticipant) return;

    const heartbeatInterval = setInterval(() => {
      setUserPresenceHeartbeat(Date.now());
      // Update user's last seen timestamp in Firebase
      if (room) {
        const updatedParticipants = room.participants?.map((p: any) => {
          if (p.id === user.uid) {
            return { ...p, lastSeen: new Date().toISOString() };
          }
          return p;
        }) || [];

        // Update room with new participant data
        const roomRef = doc(db, "musicRooms", roomId);
        updateDoc(roomRef, {
          participants: updatedParticipants,
          lastActivity: new Date().toISOString()
        }).catch(console.error);
      }
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [roomId, user, isParticipant, room]);

  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity || !roomId) return;
    
    const now = Date.now();
    const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // 5 minutes default
    const activeParticipants = room.participants?.filter((p: any) => p.status === 'active').length || 0;
    
    // Check both general activity and instrument activity
    const timeSinceLastActivity = now - lastActivityTime;
    const timeSinceLastInstrument = now - lastInstrumentPlayTime;
    
    // NEW: Check if all users have left the room (no recent heartbeat)
    const allUsersLeft = room.participants?.every((p: any) => {
      const lastSeen = p.lastSeen ? new Date(p.lastSeen).getTime() : 0;
      const timeSinceLastSeen = now - lastSeen;
      return timeSinceLastSeen > 90000; // 1.5 minutes without heartbeat = user left
    }) || false;
    
    console.log(`Checking inactivity: ${Math.round(timeSinceLastActivity / 1000)}s since last activity, ${Math.round(timeSinceLastInstrument / 1000)}s since instrument play, ${activeParticipants} active participants, all users left: ${allUsersLeft}`);
    
    // Auto-close if:
    // 1. No active participants, OR
    // 2. No activity for the timeout period, OR
    // 3. No instrument play for the timeout period, OR
    // 4. All users have left the room (NEW LOGIC)
    if (activeParticipants === 0 || 
        (timeSinceLastActivity > inactivityTimeout && timeSinceLastInstrument > inactivityTimeout) ||
        allUsersLeft) {
      console.log('Auto-closing room due to inactivity or all users left');
      try {
        await deleteRoomFromFirestore(roomId);
        navigate('/music-rooms');
        addNotification({
          title: "Room Auto-Closed",
          message: allUsersLeft ? "Room was automatically closed because all users left" : "Room was automatically closed due to inactivity",
          type: "info"
        });
      } catch (error) {
        console.error('Error auto-closing room:', error);
      }
    }
  }, [room, isHost, roomId, navigate, addNotification, lastActivityTime, lastInstrumentPlayTime]);

  // Method to update instrument play time
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

  // Enhanced inactivity check with more frequent intervals
  useEffect(() => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;
    const interval = setInterval(checkInactivityAndClose, 15000); // Check every 15 seconds
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