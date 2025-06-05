import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import {
  listenToRoomData,
  isUserRoomParticipant,
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings,
  handleJoinRequest,
  deleteRoomFromFirestore,
  listenToRoomChat,
  saveChatMessage,
  requestToJoinRoom,
  getPrivateMessages,
  sendPrivateMessage,
  markMessageAsRead,
  listenForUnreadMessages
} from '@/utils/firebase';
import { broadcastNote, listenToInstrumentNotes, InstrumentNote } from '@/utils/firebase/room-instruments';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

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
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const [messages, setMessages] = useState<any[]>([]);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [privateMessagingUser, setPrivateMessagingUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [wasRemoved, setWasRemoved] = useState<boolean>(false);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastActivityCheck, setLastActivityCheck] = useState<number>(Date.now());

  // Auto-close functionality
  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;
    
    const now = Date.now();
    const timeSinceLastCheck = now - lastActivityCheck;
    
    // Only check every 30 seconds to avoid excessive checks
    if (timeSinceLastCheck < 30000) return;
    
    setLastActivityCheck(now);
    
    if (!room.lastActivity) return;

    const lastActivity = new Date(room.lastActivity);
    const diffMinutes = (now - lastActivity.getTime()) / (1000 * 60);
    const timeoutMinutes = room.inactivityTimeout || 5;

    console.log(`Checking inactivity: ${diffMinutes.toFixed(1)} minutes since last activity (timeout: ${timeoutMinutes})`);

    if (diffMinutes > timeoutMinutes) {
      console.log('Auto-closing room due to inactivity');
      try {
        await deleteRoomFromFirestore(roomId!);
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
  }, [room, isHost, roomId, navigate, addNotification, lastActivityCheck]);

  // Fetch room data and set up listeners
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

    // Listen for room data changes
    const unsubscribeRoom = listenToRoomData(
      roomId,
      (roomData) => {
        console.log("Room data updated:", roomData);
        
        if (!roomData) {
          setRoomClosed(true);
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
        
        // Check if user is a participant and host
        if (user) {
          const participants = roomData.participants || [];
          const participantInfo = participants.find((p: any) => p.id === user.uid);
          
          // User was previously a participant but now is not - they were removed
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

    // Enhanced chat listener with notifications
    const unsubscribeChat = listenToRoomChat(
      roomId,
      (messagesData) => {
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });
        
        // Check for new messages (excluding own messages)
        if (sortedMessages.length > 0) {
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          if (latestMessage.id !== lastMessageId && 
              latestMessage.senderId !== user.uid &&
              lastMessageId !== null) {
            
            // Show notification for new message
            addNotification({
              title: "New Message",
              message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
              type: "info"
            });
          }
          setLastMessageId(latestMessage.id);
        }
        
        setMessages(sortedMessages);
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    // Enhanced instrument notes listener with proper audio playback
    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          setRemotePlaying(noteData);
          
          // Play the note with enhanced audio
          try {
            const [note, octaveStr] = noteData.note.split(':');
            const octave = octaveStr ? parseInt(octaveStr) : 4;
            
            if (note) {
              playInstrumentNote(
                noteData.instrument,
                note,
                octave,
                600, // duration
                noteData.volume || 0.7,
                noteData.effects
              );
            }
          } catch (error) {
            console.error("Error playing remote note:", error);
          }
          
          // Clear remote playing indicator after delay
          setTimeout(() => {
            setRemotePlaying(null);
          }, 800);
        }
      },
      (error) => {
        console.error("Instrument notes error:", error);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeChat();
      unsubscribeNotes();
    };
  }, [roomId, user, navigate, isParticipant, wasRemoved, lastMessageId, addNotification]);

  // Auto-close check interval
  useEffect(() => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;

    const interval = setInterval(checkInactivityAndClose, 60000); // Check every minute
    checkInactivityAndClose(); // Initial check

    return () => clearInterval(interval);
  }, [room, isHost, checkInactivityAndClose]);

  // Set up private messaging if a user is selected
  useEffect(() => {
    if (!roomId || !user || !privateMessagingUser) return;

    const unsubscribePrivate = getPrivateMessages(
      roomId,
      user.uid,
      privateMessagingUser,
      (messagesData) => {
        // Sort messages by timestamp
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });
        
        setPrivateMessages(sortedMessages);
        
        // Mark messages as read
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
    
    room.participants.forEach((participant: any) => {
      if (participant.id === user.uid) return; // Skip self
      
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

  // Enhanced broadcastInstrumentNote with better error handling
  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) {
      console.warn('Cannot broadcast note: missing roomId or user');
      return;
    }
    
    try {
      await broadcastNote(roomId, {
        ...note,
        timestamp: new Date().toISOString(),
        volume: note.volume || 0.7
      });
      
      // Update room's last activity timestamp
      if (room) {
        await updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error broadcasting note:", error);
      addNotification({
        title: "Connection Error",
        message: "Failed to sync with other participants",
        type: "error"
      });
    }
  };

  // Send a chat message
  const sendMessage = async (message: string) => {
    if (!roomId || !user || !message.trim()) return;
    
    if (!isParticipant) {
      addNotification({
        title: "Access Denied",
        message: "You must be a participant to send messages",
        type: "error"
      });
      return;
    }
    
    if (room?.isChatDisabled && !isHost) {
      addNotification({
        title: "Chat Disabled",
        message: "Chat has been disabled by the host",
        type: "warning"
      });
      return;
    }
    
    try {
      await saveChatMessage(roomId, {
        text: message,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '',
        timestamp: new Date().toISOString()
      });
      
      // Update room's last activity timestamp
      if (room) {
        updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addNotification({
        title: "Error",
        message: "Failed to send message",
        type: "error"
      });
    }
  };

  // Leave the room
  const leaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
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
    }
  };

  // Close the room (host only)
  const closeRoom = useCallback(async () => {
    if (!roomId || !user || !isHost) return;
    
    try {
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
        message: "User removed from room",
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
      if (code && room && !room.isPublic) {
        if (room.joinCode === code) {
          await requestToJoinRoom(roomId, user.uid, true);
          addNotification({
            title: "Request Sent",
            message: "Join request sent with correct code",
            type: "success"
          });
        } else {
          addNotification({
            title: "Invalid Code",
            message: "Incorrect join code",
            type: "error"
          });
        }
      } else {
        await requestToJoinRoom(roomId, user.uid);
        addNotification({
          title: "Request Sent",
          message: "Join request sent to room host",
          type: "info"
        });
      }
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
    broadcastInstrumentNote
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
