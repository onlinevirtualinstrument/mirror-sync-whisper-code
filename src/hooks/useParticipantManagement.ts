
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { 
  removeUserFromRoomSafe, 
  updateUserInstrumentSafe, 
  toggleUserMuteSafe,
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
      
      const currentParticipants = room.participants || [];
      const userParticipant = currentParticipants.find((p: any) => p.id === user.uid);
      
      if (!userParticipant) {
        console.log('useParticipantManagement: User not found in participants, navigating away');
        navigate('/music-rooms');
        return;
      }

      // Use the safe removal function
      await removeUserFromRoomSafe(roomId, user.uid);
      
      addNotification({
        title: "Left Room",
        message: "You have left the room",
        type: "info"
      });
      
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
      
      if (userId === user.uid) {
        addNotification({
          title: "Error",
          message: "You cannot remove yourself. Use 'Leave Room' instead.",
          type: "error"
        });
        return;
      }

      await removeUserFromRoomSafe(roomId, userId);
      
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
      await toggleUserMuteSafe(roomId, userId, mute);
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
      await updateUserInstrumentSafe(roomId, user.uid, instrument);
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
