
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { RoomProvider } from './RoomContext';
import RoomHeader from './RoomHeader';
import RoomParticipants from './RoomParticipants';
import RoomChat from './RoomChat';
import RoomInstrument from './RoomInstrument';
import PrivateMessaging from './PrivateMessaging';
import JoinRequests from './JoinRequests';
import JoinPrivateRoom from './JoinPrivateRoom';
import AppLayout from '@/components/layout/AppLayout';
import { addUserToRoom, isUserRoomParticipant } from '@/utils/firebase/room-participants';
import { listenToRoomData } from '@/utils/firebase/rooms';

const MusicRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  // Check if user is authenticated
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please login to access music rooms",
      variant: "destructive",
    });
    return <Navigate to="/login" />;
  }

  if (!roomId) {
    toast({
      title: "Invalid Room",
      description: "No room ID provided",
      variant: "destructive",
    });
    return <Navigate to="/music-rooms" />;
  }

  // Handle room joining logic
  useEffect(() => {
    if (!roomId || !user || isJoining) return;

    const handleRoomJoin = async () => {
      setIsJoining(true);
      setJoinError(null);

      try {
        // Check if room exists and listen to it
        const unsubscribe = listenToRoomData(
          roomId,
          async (roomData) => {
            console.log('MusicRoom: Room data received:', roomData);
            setRoomExists(true);
            
            // Check if user is already a participant
            const isParticipant = await isUserRoomParticipant(roomId, user.uid);
            
            if (!isParticipant) {
              console.log('MusicRoom: User not a participant, attempting to join');
              
              // Try to join the room
              const joinSuccess = await addUserToRoom(roomId, user);
              
              if (!joinSuccess) {
                console.log('MusicRoom: Failed to join room');
                setJoinError("Failed to join room");
                navigate('/music-rooms');
              } else {
                console.log('MusicRoom: Successfully joined room');
              }
            } else {
              console.log('MusicRoom: User is already a participant');
            }
            
            setIsJoining(false);
            unsubscribe(); // Stop listening once we've handled the join
          },
          (error) => {
            console.error('MusicRoom: Error getting room data:', error);
            setRoomExists(false);
            setJoinError("Room not found");
            setIsJoining(false);
            navigate('/music-rooms');
          }
        );
      } catch (error) {
        console.error('MusicRoom: Error in room join process:', error);
        setJoinError("Failed to access room");
        setIsJoining(false);
        navigate('/music-rooms');
      }
    };

    handleRoomJoin();
  }, [roomId, user, navigate, isJoining]);

  // Show loading while joining
  if (isJoining || roomExists === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading instrument or connecting to room...</p>
        </div>
      </div>
    );
  }

  // Show error if join failed
  if (joinError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{joinError}</p>
          <button 
            onClick={() => navigate('/music-rooms')}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Return to Music Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <RoomProvider>
        <RoomHeader />
        <JoinRequests />
        <RoomInstrument />
        <PrivateMessaging />
        <JoinPrivateRoom />
      </RoomProvider>
    </AppLayout>
  );
};

export default MusicRoom;
