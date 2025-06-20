
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import {
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings,
  handleJoinRequest,
  deleteRoomFromFirestore
} from '@/utils/firebase';

export const useRoomActions = (roomId: string | undefined, user: any, isHost: boolean) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const leaveRoom = useCallback(async () => {
    if (!roomId || !user) return;

    try {
      console.log('useRoomActions: User leaving room');
      await removeUserFromRoom(roomId, user.uid);
      
      navigate('/music-rooms');
      addNotification({
        title: "Left Room",
        message: "You have left the room",
        type: "info"
      });
    } catch (error) {
      console.error("Error leaving room:", error);
      addNotification({
        title: "Error",
        message: "Failed to leave room",
        type: "error"
      });
      navigate('/music-rooms');
    }
  }, [roomId, user, navigate, addNotification]);

  const closeRoom = useCallback(async () => {
    if (!roomId || !user || !isHost) return;

    try {
      console.log('useRoomActions: Host closing room');
      await deleteRoomFromFirestore(roomId);
      navigate('/music-rooms');
      addNotification({
        title: "Room Closed",
        message: "Room has been closed",
        type: "info"
      });
    } catch (error) {
      console.error("Error closing room:", error);
      addNotification({
        title: "Error",
        message: "Failed to close room",
        type: "error"
      });
    }
  }, [roomId, user, isHost, navigate, addNotification]);

  const switchInstrument = useCallback(async (instrument: string) => {
    if (!roomId || !user) return;

    try {
      await updateUserInstrument(roomId, user.uid, instrument);
    } catch (error) {
      console.error("Error switching instrument:", error);
      addNotification({
        title: "Error",
        message: "Failed to switch instrument",
        type: "error"
      });
    }
  }, [roomId, user, addNotification]);

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
      console.error("Error toggling mute:", error);
      addNotification({
        title: "Error",
        message: "Failed to update user mute status",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const removeUser = useCallback(async (userId: string) => {
    if (!roomId || !user || !isHost) return;

    try {
      console.log('useRoomActions: Host removing user:', userId);
      await removeUserFromRoom(roomId, userId);
      addNotification({
        title: "User Removed",
        message: "User has been removed from the room",
        type: "info"
      });
    } catch (error) {
      console.error("Error removing user:", error);
      addNotification({
        title: "Error",
        message: "Failed to remove user from room",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const toggleChat = useCallback(async (disabled: boolean) => {
    if (!roomId || !user || !isHost) return;

    try {
      await toggleRoomChat(roomId, disabled);
      addNotification({
        title: disabled ? "Chat Disabled" : "Chat Enabled",
        message: disabled ? "Chat has been disabled for all users" : "Chat has been enabled for all users",
        type: "info"
      });
    } catch (error) {
      console.error("Error toggling chat:", error);
      addNotification({
        title: "Error",
        message: "Failed to update chat settings",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const toggleAutoClose = useCallback(async (enabled: boolean, timeout: number = 5) => {
    if (!roomId || !user || !isHost) return;

    try {
      await toggleAutoCloseRoom(roomId, enabled, timeout);
      addNotification({
        title: enabled ? "Auto-Close Enabled" : "Auto-Close Disabled",
        message: enabled ? `Room will auto-close after ${timeout} minutes of inactivity` : "Auto-close has been disabled for this room",
        type: "info"
      });
    } catch (error) {
      console.error("Error toggling auto-close:", error);
      addNotification({
        title: "Error",
        message: "Failed to update auto-close settings",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const updateSettings = useCallback(async (settings: any) => {
    if (!roomId || !user || !isHost) return;

    try {
      await updateRoomSettings(roomId, settings);
      addNotification({
        title: "Room Settings Updated",
        message: "Room settings have been updated successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      addNotification({
        title: "Error",
        message: "Failed to update room settings",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  const respondToJoinRequest = useCallback(async (userId: string, approve: boolean) => {
    if (!roomId || !user || !isHost) return;

    try {
      await handleJoinRequest(roomId, userId, approve);
      addNotification({
        title: approve ? "User Approved" : "Request Denied",
        message: approve ? "User has been approved to join" : "User's request has been denied",
        type: approve ? "success" : "info"
      });
    } catch (error) {
      console.error("Error handling join request:", error);
      addNotification({
        title: "Error",
        message: "Failed to process join request",
        type: "error"
      });
    }
  }, [roomId, user, isHost, addNotification]);

  return {
    leaveRoom,
    closeRoom,
    switchInstrument,
    muteUser,
    removeUser,
    toggleChat,
    toggleAutoClose,
    updateSettings,
    respondToJoinRequest
  };
};
