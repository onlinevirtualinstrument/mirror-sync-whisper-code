
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
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

  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity || !roomId) return;
    
    const now = Date.now();
    const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // 5 minutes default
    const activeParticipants = room.participants?.filter((p: any) => p.status === 'active').length || 0;
    
    // Check both general activity and instrument activity
    const timeSinceLastActivity = now - lastActivityTime;
    const timeSinceLastInstrument = now - lastInstrumentPlayTime;
    
    console.log(`Checking inactivity: ${Math.round(timeSinceLastActivity / 1000)}s since last activity, ${Math.round(timeSinceLastInstrument / 1000)}s since instrument play, ${activeParticipants} active participants`);
    
    // Auto-close if:
    // 1. No active participants, OR
    // 2. No activity for the timeout period, OR
    // 3. No instrument play for the timeout period
    if (activeParticipants === 0 || 
        (timeSinceLastActivity > inactivityTimeout && timeSinceLastInstrument > inactivityTimeout)) {
      console.log('Auto-closing room due to inactivity');
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