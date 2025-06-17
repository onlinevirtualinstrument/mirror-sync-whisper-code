import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useRoomData } from '@/hooks/useRoomData';
import { useRoomChat } from '@/hooks/useRoomChat';
import { useRoomInstruments } from '@/hooks/useRoomInstruments';
import {
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings,
  handleJoinRequest,
  deleteRoomFromFirestore,
  sendPrivateMessage,
  requestToJoinRoom,
  getPrivateMessages,
  markMessageAsRead,
  listenForUnreadMessages
} from '@/utils/firebase';
import { useState, useEffect, useCallback } from 'react';

interface InstrumentNote {
  note: string;
  instrument: string;
  userId: string;
  userName: string;
  timestamp?: string;
}

type RoomContextType = {
  room: any;
  isLoading: boolean;
  error: string | null;
  isParticipant: boolean;
  isHost: boolean;
  userInfo: any;
  messages: any[];
  privateMessages: any[];
  privateMessagingUser: string | null;
  unreadCounts: Record<string, number>;
  unreadMessageCount: number;
  remotePlaying: InstrumentNote | null;
  sendMessage: (message: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  closeRoom: () => Promise<void>;
  switchInstrument: (instrument: string) => Promise<void>;
  muteUser: (userId: string, mute: boolean) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  toggleChat: (disabled: boolean) => Promise<void>;
  toggleAutoClose: (enabled: boolean, timeout?: number) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  respondToJoinRequest: (userId: string, approve: boolean) => Promise<void>;
  sendPrivateMsg: (receiverId: string, message: string) => Promise<void>;
  setPrivateMessagingUser: (userId: string | null) => void;
  requestJoin: (code?: string) => Promise<void>;
  broadcastInstrumentNote: (note: InstrumentNote) => Promise<void>;
  markChatAsRead: () => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const {
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
  } = useRoomData();

  const {
    messages,
    unreadMessageCount,
    sendMessage,
    markChatAsRead
  } = useRoomChat(room, isParticipant, isHost);

  const {
    remotePlaying,
    broadcastInstrumentNote
  } = useRoomInstruments(room, setLastActivityTime, updateInstrumentPlayTime);

  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [privateMessagingUser, setPrivateMessagingUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Private messaging setup
  useEffect(() => {
    if (!roomId || !user || !privateMessagingUser) return;

    const unsubscribePrivate = getPrivateMessages(
      roomId,
      user.uid,
      privateMessagingUser,
      (messagesData) => {
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });

        setPrivateMessages(sortedMessages);

        messagesData.forEach(msg => {
          if (msg.receiverId === user.uid && !msg.read) {
            markMessageAsRead(roomId, msg.id);
          }
        });
      },
      (error) => {
        console.error("Private messaging error:", error);
      }
    );

    return () => {
      unsubscribePrivate();
    };
  }, [roomId, user, privateMessagingUser]);

  // Listen for unread messages from all participants
  useEffect(() => {
    if (!roomId || !user || !room) return;

    const unsubscribers: (() => void)[] = [];

    Object.values(room.participants || {}).forEach((participant: any) => {
      if (participant.id === user.uid) return;
      const unsubscribe = listenForUnreadMessages(
        roomId,
        user.uid,
        (count) => {
          setUnreadCounts(prev => ({
            ...prev,
            [participant.id]: count
          }));
        }
      );
      unsubscribers.push(unsubscribe);
    });



    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [roomId, user, room]);

  const leaveRoom = async () => {
    if (!roomId || !user) return;

    try {
      await removeUserFromRoom(roomId, user.uid);
      navigate('/music-rooms'); // Redirect to home
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
    }
  };

  // Close the room (host only)
  const closeRoom = useCallback(async () => {
    if (!roomId || !user || !isHost) return;

    try {
      await deleteRoomFromFirestore(roomId);
      navigate('/music-rooms'); // Redirect to home
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

  // Switch instrument
  const switchInstrument = async (instrument: string) => {
    if (!roomId || !user) return;

    try {
      await updateUserInstrument(roomId, user.uid, instrument);
      // Update local UI immediately for responsiveness
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          instrument
        });
      }
    } catch (error) {
      console.error("Error switching instrument:", error);
      addNotification({
        title: "Error",
        message: "Failed to switch instrument",
        type: "error"
      });
    }
  };

  // Mute/unmute a user (host only)
  const muteUser = async (userId: string, mute: boolean) => {
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
  };

  // Remove a user from the room (host only)
  const removeUser = async (userId: string) => {
    if (!roomId || !user || !isHost) return;

    try {
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
  };

  // Toggle chat for the room (host only)
  const toggleChat = async (disabled: boolean) => {
    if (!roomId || !user || !isHost) return;

    try {
      await toggleRoomChat(roomId, disabled);
      // Update local state immediately for UI responsiveness
      setRoom(prev => ({
        ...prev,
        isChatDisabled: disabled
      }));

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

  };

  // Toggle auto-close after inactivity (host only)
  const toggleAutoClose = async (enabled: boolean, timeout: number = 5) => {
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
  };

  // Update room settings (host only)
  const updateSettings = async (settings: any) => {
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

  };

  // Respond to join request (host only)
  const respondToJoinRequest = async (userId: string, approve: boolean) => {
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

  };

  // Send private message
  const sendPrivateMsg = async (receiverId: string, message: string) => {
    if (!roomId || !user || !message.trim()) return;

    try {
      await sendPrivateMessage(roomId, user.uid, receiverId, message);
      addNotification({
        title: "Private Message Sent",
        message: "Your message has been sent",
        type: "success"
      });
    } catch (error) {
      console.error("Error sending private message:", error);
      addNotification({

        title: "Error",

        message: "Failed to send private message",

        type: "error"

      });

    }

  };

  // Request to join room with optional join code
  const requestJoin = async (code?: string) => {
    if (!roomId || !user) return;

    try {
      await requestToJoinRoom(roomId, user.uid, !!code);
      addNotification({
        title: "Join Request Sent",
        message: "Your request to join has been sent",
        type: "info"
      });
    } catch (error) {
      console.error("Error requesting to join:", error);
      addNotification({

        title: "Error",

        message: "Failed to send join request",

        type: "error"

      });

    }

  };

  const value = {
    room,
    isLoading,
    error,
    isParticipant,
    isHost,
    userInfo,
    messages,
    privateMessages,
    privateMessagingUser,
    unreadCounts,
    unreadMessageCount,
    remotePlaying,
    sendMessage,
    leaveRoom,
    closeRoom,
    switchInstrument,
    muteUser,
    removeUser,
    toggleChat,
    toggleAutoClose,
    updateSettings,
    respondToJoinRequest,
    sendPrivateMsg,
    setPrivateMessagingUser,
    requestJoin,
    broadcastInstrumentNote,
    markChatAsRead
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};