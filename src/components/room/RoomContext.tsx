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
import { playRealtimeNote, initializeRealtimeAudio, stopAllRealtimeNotes, setMasterVolume } from '@/utils/audio/realtimeAudio';

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
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [wasRemoved, setWasRemoved] = useState<boolean>(false);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);

  // Initialize real-time audio on mount
  useEffect(() => {
    initializeRealtimeAudio().catch(console.error);
  }, []);

  // Auto-close functionality with improved tracking
  const checkInactivityAndClose = useCallback(async () => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;
    
    const now = Date.now();
    const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // Convert to milliseconds
    
    // Check if there are any active participants
    const activeParticipants = room.participants?.length || 0;
    
    // Check time since last activity (either instrument play or message)
    const timeSinceLastActivity = now - lastActivityTime;
    
    console.log(`Checking inactivity: ${Math.round(timeSinceLastActivity / 1000)}s since last activity, ${activeParticipants} participants`);

    if (activeParticipants === 0 || timeSinceLastActivity > inactivityTimeout) {
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
  }, [room, isHost, roomId, navigate, addNotification, lastActivityTime]);

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
        
        // Update last activity time when room data changes
        if (roomData.lastActivity) {
          const activityTime = new Date(roomData.lastActivity).getTime();
          setLastActivityTime(activityTime);
        }
        
        // Check if user is a participant and host
        if (user) {
          const participants = roomData.participants || [];
          const participantInfo = participants.find((p: any) => p.id === user.uid);
          
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

    // Enhanced chat listener with unread message tracking
    const unsubscribeChat = listenToRoomChat(
      roomId,
      (messagesData) => {
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });
        
        setMessages(sortedMessages);
        
        // Calculate unread messages
        if (sortedMessages.length > 0) {
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          
          // Count unread messages
          const unreadCount = sortedMessages.filter(msg => 
            msg.senderId !== user.uid && 
            (!lastSeenMessageId || msg.id !== lastSeenMessageId)
          ).length;
          
          setUnreadMessageCount(unreadCount);
          
          // Show notification for new messages
          if (latestMessage.id !== lastMessageId && 
              latestMessage.senderId !== user.uid &&
              lastMessageId !== null) {
            
            addNotification({
              title: "New Message",
              message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
              type: "info"
            });
          }
          setLastMessageId(latestMessage.id);
        }
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    // Enhanced instrument notes listener with better audio mixing
    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      async (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          setRemotePlaying(noteData);
          
          // Update activity time when any user plays an instrument
          setLastActivityTime(Date.now());
          
          // Play the note with enhanced real-time audio
          try {
            const noteId = `${noteData.userId}-${noteData.note}-${Date.now()}`;
            const frequency = getNoteFrequency(noteData.note) || 440;
            
            // Use real-time audio for better synchronization
            await playRealtimeNote(
              noteId,
              frequency,
              noteData.instrument,
              noteData.userId,
              noteData.volume || 0.7,
              600
            );
            
            console.log(`Playing remote note: ${noteData.note} from ${noteData.userName} on ${noteData.instrument}`);
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
  }, [roomId, user, navigate, isParticipant, wasRemoved, lastMessageId, addNotification, lastSeenMessageId]);

  // Auto-close check interval - improved timing
  useEffect(() => {
    if (!room || !isHost || !room.autoCloseAfterInactivity) return;

    const interval = setInterval(checkInactivityAndClose, 30000); // Check every 30 seconds
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
      // Update activity time when local user plays
      setLastActivityTime(Date.now());
      
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

  // Mark chat messages as read
  const markChatAsRead = useCallback(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setLastSeenMessageId(latestMessage.id);
      setUnreadMessageCount(0);
    }
  }, [messages]);

  // Send a chat message with activity tracking
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
      // Update activity time when sending message
      setLastActivityTime(Date.now());
      
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
    unreadMessageCount,
    remotePlaying,
    sendMessage,
    leaveRoom: async () => {
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
      }
    },
    closeRoom: async () => {
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
      }
    },
    switchInstrument: async (instrument: string) => {
      if (!roomId || !user) return;
      try {
        await updateUserInstrument(roomId, user.uid, instrument);
        if (userInfo) {
          setUserInfo({ ...userInfo, instrument });
        }
      } catch (error) {
        console.error("Error switching instrument:", error);
      }
    },
    muteUser: async (userId: string, mute: boolean) => {
      if (!roomId || !user || !isHost) return;
      try {
        await toggleUserMute(roomId, userId, mute);
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    },
    removeUser: async (userId: string) => {
      if (!roomId || !user || !isHost) return;
      try {
        await removeUserFromRoom(roomId, userId);
      } catch (error) {
        console.error("Error removing user:", error);
      }
    },
    toggleChat: async (disabled: boolean) => {
      if (!roomId || !user || !isHost) return;
      try {
        await toggleRoomChat(roomId, disabled);
        setRoom(prev => ({ ...prev, isChatDisabled: disabled }));
      } catch (error) {
        console.error("Error toggling chat:", error);
      }
    },
    toggleAutoClose: async (enabled: boolean, timeout: number = 5) => {
      if (!roomId || !user || !isHost) return;
      try {
        await toggleAutoCloseRoom(roomId, enabled, timeout);
      } catch (error) {
        console.error("Error toggling auto-close:", error);
      }
    },
    updateSettings: async (settings: any) => {
      if (!roomId || !user || !isHost) return;
      try {
        await updateRoomSettings(roomId, settings);
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    },
    respondToJoinRequest: async (userId: string, approve: boolean) => {
      if (!roomId || !user || !isHost) return;
      try {
        await handleJoinRequest(roomId, userId, approve);
      } catch (error) {
        console.error("Error handling join request:", error);
      }
    },
    sendPrivateMsg: async (receiverId: string, message: string) => {
      if (!roomId || !user || !message.trim()) return;
      try {
        await sendPrivateMessage(roomId, user.uid, receiverId, message);
      } catch (error) {
        console.error("Error sending private message:", error);
      }
    },
    setPrivateMessagingUser,
    requestJoin: async (code?: string) => {
      if (!roomId || !user) return;
      try {
        await requestToJoinRoom(roomId, user.uid, !!code);
      } catch (error) {
        console.error("Error requesting to join:", error);
      }
    },
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

// Helper function to convert note to frequency
const getNoteFrequency = (note: string): number | null => {
  const noteFrequencies: Record<string, number> = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47, 'C#3': 138.59,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
  };
  
  return noteFrequencies[note.toUpperCase()] || null;
};
