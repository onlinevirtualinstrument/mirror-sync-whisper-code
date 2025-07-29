
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
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);

  console.log(`useRoomJoin: Hook initialized for room ${roomId}, user: ${user?.uid}`);

  const attemptJoin = async (joinCode?: string) => {
    if (!roomId || !user || isJoining) {
      console.log(`useRoomJoin: Cannot join - roomId: ${roomId}, user: ${!!user}, isJoining: ${isJoining}`);
      return false;
    }

    console.log(`useRoomJoin: Starting join attempt for room ${roomId} with user ${user.uid}`);
    setIsJoining(true);
    setJoinError(null);

    try {
      // First check if user is already a participant
      console.log(`useRoomJoin: Checking if user ${user.uid} is already participant in room ${roomId}`);
      const isParticipant = await isUserRoomParticipant(roomId, user.uid);
      
      if (isParticipant) {
        console.log('useRoomJoin: User is already a participant, join successful');
        setIsJoining(false);
        return true;
      }

      console.log(`useRoomJoin: User not a participant, attempting to add to room`);
      let joinSuccess = false;

      if (joinCode) {
        console.log(`useRoomJoin: Attempting join with code: ${joinCode}`);
        const userWithCode = { ...user, joinCode };
        joinSuccess = await addUserToRoom(roomId, userWithCode);
      } else {
        console.log(`useRoomJoin: Attempting regular join`);
        joinSuccess = await addUserToRoom(roomId, user);
      }

      if (!joinSuccess) {
        console.error('useRoomJoin: Failed to join room - addUserToRoom returned false');
        setJoinError("Failed to join room");
        navigate('/music-rooms');
        return false;
      }

      console.log(`useRoomJoin: Successfully joined room ${roomId}`);
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
    if (!roomId || !user) {
      console.log('useRoomJoin: Cannot request join - missing roomId or user');
      return;
    }

    console.log(`useRoomJoin: Requesting to join room ${roomId} with user ${user.uid}`);

    try {
      if (joinCode) {
        console.log(`useRoomJoin: Requesting join with code`);
        await joinRoomWithCode(roomId, user, joinCode);
      } else {
        console.log(`useRoomJoin: Sending join request to host`);
        await requestToJoinRoom(roomId, user.uid);
      }
    } catch (error) {
      console.error("useRoomJoin: Error requesting to join:", error);
      addNotification({
        title: "Error",
        message: "Failed to process join request",
        type: "error"
      });
    }
  };

  // Auto-attempt join when room ID and user are available
  useEffect(() => {
    if (!roomId || !user || isJoining || hasAttemptedJoin) {
      console.log(`useRoomJoin: Skipping auto-join - roomId: ${roomId}, user: ${!!user}, isJoining: ${isJoining}, hasAttempted: ${hasAttemptedJoin}`);
      return;
    }

    console.log(`useRoomJoin: Setting up auto-join for room ${roomId}`);

    const handleAutoJoin = async () => {
      setHasAttemptedJoin(true);
      
      // Add a longer delay to ensure room creation is complete
      console.log('useRoomJoin: Waiting for room creation to complete...');
      setTimeout(async () => {
        // Listen to room data to check if it exists
        const unsubscribe = listenToRoomData(
          roomId,
          async (roomData) => {
            console.log('useRoomJoin: Room data received, room exists');
            setRoomExists(true);
            unsubscribe(); // Stop listening once we've confirmed room exists
            
            // Longer delay to ensure room is fully created and all systems are ready
            setTimeout(async () => {
              console.log('useRoomJoin: Attempting auto-join after room confirmation');
              await attemptJoin();
            }, 2000); // Increased to 2 seconds
          },
          (error) => {
            console.error('useRoomJoin: Error getting room data:', error);
            setRoomExists(false);
            setJoinError("Room not found");
            setIsJoining(false);
            
            // Add a delay before redirecting to prevent immediate redirect
            setTimeout(() => {
              navigate('/music-rooms');
            }, 2000);
          }
        );
      }, 3000); // Increased to 3 seconds for room creation to complete
    };

    handleAutoJoin();
  }, [roomId, user?.uid]); // Only depend on roomId and user.uid to avoid unnecessary re-runs

  return {
    isJoining,
    joinError,
    roomExists,
    attemptJoin,
    requestJoin
  };
};
