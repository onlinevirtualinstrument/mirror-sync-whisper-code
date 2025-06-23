
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { 
  removeUserFromRoom, 
  updateUserInstrument, 
  toggleUserMute,
  deleteRoomFromFirestore 
} from '@/utils/firebase';

export const useParticipantManagement = (roomId: string | undefined, room: any, isHost: boolean) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const leaveRoom = useCallback(async () => {
    if (!roomId || !user || !room) return;

    try {
      console.log('useParticipantManagement: User leaving room');
      
      // Check if user is the last participant or host
      const currentParticipants = room.participants || [];
      const isLastParticipant = currentParticipants.length === 1;
      const userParticipant = currentParticipants.find((p: any) => p.id === user.uid);
      const isCurrentUserHost = userParticipant?.isHost || false;

      if (isLastParticipant) {
        // If last participant, delete the room
        console.log('useParticipantManagement: Last participant leaving, deleting room');
        await deleteRoomFromFirestore(roomId);
        
        addNotification({
          title: "Room Closed",
          message: "Room was closed as you were the last participant",
          type: "info"
        });
      } else {
        // Remove user from room
        await removeUserFromRoom(roomId, user.uid);
        
        addNotification({
          title: "Left Room",
          message: "You have left the room",
          type: "info"
        });
      }
      
      navigate('/music-rooms');
    } catch (error) {
      console.error("useParticipantManagement: Error leaving room:", error);
      addNotification({
        title: "Error",
        message: "Failed to leave room",
        type: "error"
      });
      navigate('/music-rooms');
    }
  }, [roomId, user, room, navigate, addNotification]);

  const removeUser = useCallback(async (userId: string) => {
    if (!roomId || !user || !isHost || !room) return;

    try {
      console.log('useParticipantManagement: Host removing user:', userId);
      
      // Prevent host from removing themselves
      if (userId === user.uid) {
        addNotification({
          title: "Error",
          message: "You cannot remove yourself. Use 'Leave Room' instead.",
          type: "error"
        });
        return;
      }

      const currentParticipants = room.participants || [];
      const remainingAfterRemoval = currentParticipants.filter((p: any) => p.id !== userId);

      if (remainingAfterRemoval.length === 0) {
        // This shouldn't happen as host can't remove themselves, but safety check
        console.log('useParticipantManagement: No participants left, deleting room');
        await deleteRoomFromFirestore(roomId);
        navigate('/music-rooms');
        addNotification({
          title: "Room Closed",
          message: "Room was closed as no participants remain",
          type: "info"
        });
        return;
      }

      await removeUserFromRoom(roomId, userId);
      
      addNotification({
        title: "User Removed",
        message: "User has been removed from the room",
        type: "info"
      });
    } catch (error) {
      console.error("useParticipantManagement: Error removing user:", error);
      addNotification({
        title: "Error",
        message: "Failed to remove user from room",
        type: "error"
      });
    }
  }, [roomId, user, isHost, room, navigate, addNotification]);

  const muteUser = useCallback(async (userId: string, mute: boolean) => {
    if (!roomId || !user || !isHost) return;

    try {
      await toggleUserMute(roomId, userId, mute);
      addNotification({
        title: mute ? "User Muted" : "User Unmuted",
        message: mute ? "User has been muted" : "User has been unmuted",
        type: "info"
      });
    } catch (error) {
      console.error("useParticipantManagement: Error toggling mute:", error);
      addNotification({
        title: "Error",
        message: "Failed to update user mute status",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const switchInstrument = useCallback(async (instrument: string) => {
    if (!roomId || !user) return;

    try {
      await updateUserInstrument(roomId, user.uid, instrument);
    } catch (error) {
      console.error("useParticipantManagement: Error switching instrument:", error);
      addNotification({
        title: "Error",
        message: "Failed to switch instrument",
        type: "error"
      });
    }
  }, [roomId, user, addNotification]);

  return {
    leaveRoom,
    removeUser,
    muteUser,
    switchInstrument
  };
};
