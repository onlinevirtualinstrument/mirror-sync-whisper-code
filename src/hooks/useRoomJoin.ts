
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { addUserToRoom, isUserRoomParticipant } from '@/utils/firebase/room-participant-management';
import { joinRoomWithCode, requestToJoinRoom } from '@/utils/firebase/room-joining';
import { listenToRoomData } from '@/utils/firebase/rooms';

export const useRoomJoin = (roomId: string | undefined) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  const attemptJoin = async (joinCode?: string) => {
    if (!roomId || !user || isJoining) return false;

    setIsJoining(true);
    setJoinError(null);

    try {
      // Check if user is already a participant
      const isParticipant = await isUserRoomParticipant(roomId, user.uid);
      
      if (isParticipant) {
        console.log('useRoomJoin: User is already a participant');
        setIsJoining(false);
        return true;
      }

      let joinSuccess = false;

      if (joinCode) {
        // Try to join with code
        const userWithCode = { ...user, joinCode };
        joinSuccess = await addUserToRoom(roomId, userWithCode);
      } else {
        // Try regular join
        joinSuccess = await addUserToRoom(roomId, user);
      }

      if (!joinSuccess) {
        setJoinError("Failed to join room");
        navigate('/music-rooms');
        return false;
      }

      setIsJoining(false);
      return true;
    } catch (error) {
      console.error('useRoomJoin: Error joining room:', error);
      setJoinError("Failed to access room");
      setIsJoining(false);
      navigate('/music-rooms');
      return false;
    }
  };

  const requestJoin = async (joinCode?: string) => {
    if (!roomId || !user) return;

    try {
      if (joinCode) {
        // Try to join with code
        await joinRoomWithCode(roomId, user, joinCode);
      } else {
        // Send join request
        await requestToJoinRoom(roomId, user.uid);
      }
    } catch (error) {
      console.error("Error requesting to join:", error);
      addNotification({
        title: "Error",
        message: "Failed to process join request",
        type: "error"
      });
    }
  };

  // Auto-attempt join when room ID and user are available
  useEffect(() => {
    if (!roomId || !user || isJoining) return;

    const handleAutoJoin = async () => {
      // Listen to room data to check if it exists
      const unsubscribe = listenToRoomData(
        roomId,
        async (roomData) => {
          console.log('useRoomJoin: Room data received');
          setRoomExists(true);
          await attemptJoin();
          unsubscribe(); // Stop listening once we've handled the join
        },
        (error) => {
          console.error('useRoomJoin: Error getting room data:', error);
          setRoomExists(false);
          setJoinError("Room not found");
          setIsJoining(false);
          navigate('/music-rooms');
        }
      );
    };

    handleAutoJoin();
  }, [roomId, user]);

  return {
    isJoining,
    joinError,
    roomExists,
    attemptJoin,
    requestJoin
  };
};
