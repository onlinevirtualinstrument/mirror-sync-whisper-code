
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addUserToRoom, isUserRoomParticipant } from '@/utils/firebase';
import { toast } from '@/hooks/use-toast';

export const useRoomJoin = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomJoin = async () => {
      if (!roomId || !user) return;

      try {
        console.log('useRoomJoin: Checking if user can join room:', roomId);
        
        // Check if user is already a participant
        const isParticipant = await isUserRoomParticipant(roomId, user.uid);
        
        if (isParticipant) {
          console.log('useRoomJoin: User is already a participant');
          return; // User is already in the room
        }

        // Try to add user to room
        const joinResult = await addUserToRoom(roomId, user);
        
        if (!joinResult) {
          console.log('useRoomJoin: Failed to join room, redirecting');
          toast({
            title: "Unable to Join",
            description: "Could not join the room. It may be full or private.",
            variant: "destructive"
          });
          navigate('/music-rooms');
        } else {
          console.log('useRoomJoin: Successfully joined room');
        }
      } catch (error) {
        console.error('useRoomJoin: Error joining room:', error);
        toast({
          title: "Error",
          description: "Failed to join room. Please try again.",
          variant: "destructive"
        });
        navigate('/music-rooms');
      }
    };

    handleRoomJoin();
  }, [roomId, user, navigate]);
};
