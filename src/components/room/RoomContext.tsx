
import React, { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useRoomData } from '@/hooks/useRoomData';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useRoomInstruments } from '@/hooks/useRoomInstruments';
import { useParticipantManagement } from '@/hooks/useParticipantManagement';
import { useRoomJoin } from '@/hooks/useRoomJoin';
import {
  sendPrivateMessage,
  getPrivateMessages,
  markMessageAsRead,
  listenForUnreadMessages,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings,
  handleJoinRequest
} from '@/utils/firebase';
import { useState, useEffect } from 'react';

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
  removeUser: (userId: string) => Promise<void>;
  muteUser: (userId: string, mute: boolean) => Promise<void>;
  switchInstrument: (instrument: string) => Promise<void>;
  toggleChat: (disabled: boolean) => Promise<void>;
  toggleAutoClose: (enabled: boolean, timeout?: number) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  respondToJoinRequest: (userId: string, approve: boolean) => Promise<void>;
  sendPrivateMsg: (receiverId: string, message: string) => Promise<void>;
  setPrivateMessagingUser: (userId: string | null) => void;
  broadcastInstrumentNote: (note: InstrumentNote) => Promise<void>;
  markChatAsRead: () => void;
  requestJoin: (joinCode?: string) => Promise<void>;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
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
  } = useRealTimeChat(roomId, isParticipant, isHost, room);

  const {
    remotePlaying,
    broadcastInstrumentNote
  } = useRoomInstruments(room, setLastActivityTime, updateInstrumentPlayTime);

  const {
    leaveRoom,
    removeUser,
    muteUser,
    switchInstrument
  } = useParticipantManagement(roomId, room, isHost);

  const { requestJoin } = useRoomJoin(roomId);

  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [privateMessagingUser, setPrivateMessagingUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Room settings management
  const toggleChat = async (disabled: boolean): Promise<void> => {
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
  };

  const toggleAutoClose = async (enabled: boolean, timeout: number = 5): Promise<void> => {
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

  const updateSettings = async (settings: any): Promise<void> => {
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

  const respondToJoinRequest = async (userId: string, approve: boolean): Promise<void> => {
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
    if (!roomId || !user || !room?.participants) return;

    const unsubscribers: (() => void)[] = [];

    room.participants.forEach((participant: any) => {
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
  }, [roomId, user, room?.participants]);

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
    removeUser,
    muteUser,
    switchInstrument,
    toggleChat,
    toggleAutoClose,
    updateSettings,
    respondToJoinRequest,
    sendPrivateMsg,
    setPrivateMessagingUser,
    broadcastInstrumentNote,
    markChatAsRead,
    requestJoin
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
