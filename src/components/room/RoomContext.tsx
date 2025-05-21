
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
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
  listenForUnreadMessages,
  broadcastNote,
  listenToInstrumentNotes
} from '@/utils/firebase';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

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
          // Room was deleted or doesn't exist
          setRoomClosed(true);
          toast({
            title: "Room Closed",
            description: "This room has been closed by the host",
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
            toast({
              title: "Removed from Room",
              description: "You have been removed from this room by the host",
              variant: "destructive"
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
        
        // Check for auto-close after inactivity
        if (roomData.autoCloseAfterInactivity && roomData.lastActivity) {
          const lastActivity = new Date(roomData.lastActivity);
          const now = new Date();
          const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
          
          if (diffMinutes > (roomData.inactivityTimeout || 5)) {
            if (isHost) {
              // Only host can close the room automatically
              closeRoom();
            }
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

    // Listen for chat messages
    const unsubscribeChat = listenToRoomChat(
      roomId,
      (messagesData) => {
        // Sort messages by timestamp
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });
        
        setMessages(sortedMessages);
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    // Listen for instrument notes being played
    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        // Only process notes from other users
        if (noteData && noteData.userId !== user.uid) {
          setRemotePlaying(noteData);
          
          // Play the note using the audio utilities
          try {
            // This will play the sound on this client
            const [note, octave] = noteData.note.split(':');
            if (note && octave) {
              playInstrumentNote(
                noteData.instrument,
                note,
                parseInt(octave),
                500
              );
            }
          } catch (error) {
            console.error("Error playing remote note:", error);
          }
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
  }, [roomId, user, navigate, isParticipant, wasRemoved]);

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

  // Broadcast instrument notes to other participants
  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) return;
    
    try {
      await broadcastNote(roomId, {
        ...note,
        timestamp: new Date().toISOString()
      });
      
      // Update room's last activity timestamp
      if (room) {
        updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error broadcasting note:", error);
    }
  };

  // Send a chat message
  const sendMessage = async (message: string) => {
    if (!roomId || !user || !message.trim()) return;
    
    if (!isParticipant) {
      toast({ description: "You must be a participant to send messages" });
      return;
    }
    
    if (room?.isChatDisabled && !isHost) {
      toast({ description: "Chat has been disabled by the host" });
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
      toast({ description: "Failed to send message" });
    }
  };

  // Leave the room
  const leaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      await removeUserFromRoom(roomId, user.uid);
      navigate('/music-rooms'); // Redirect to home
      toast({ description: "You have left the room" });
    } catch (error) {
      console.error("Error leaving room:", error);
      toast({ description: "Failed to leave room" });
    }
  };

  // Close the room (host only)
  const closeRoom = useCallback(async () => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await deleteRoomFromFirestore(roomId);
      navigate('/music-rooms'); // Redirect to home
      toast({ description: "Room has been closed" });
    } catch (error) {
      console.error("Error closing room:", error);
      toast({ description: "Failed to close room" });
    }
  }, [roomId, user, isHost, navigate]);

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
      toast({ description: "Failed to switch instrument" });
    }
  };

  // Mute/unmute a user (host only)
  const muteUser = async (userId: string, mute: boolean) => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await toggleUserMute(roomId, userId, mute);
      toast({ 
        description: mute ? 
          "User has been muted" : 
          "User has been unmuted" 
      });
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast({ description: "Failed to update user mute status" });
    }
  };

  // Remove a user from the room (host only)
  const removeUser = async (userId: string) => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await removeUserFromRoom(roomId, userId);
      toast({ description: "User removed from room" });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({ description: "Failed to remove user from room" });
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
      
      toast({ 
        description: disabled ? 
          "Chat has been disabled for all users" : 
          "Chat has been enabled for all users" 
      });
    } catch (error) {
      console.error("Error toggling chat:", error);
      toast({ description: "Failed to update chat settings" });
    }
  };

  // Toggle auto-close after inactivity (host only)
  const toggleAutoClose = async (enabled: boolean, timeout: number = 5) => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await toggleAutoCloseRoom(roomId, enabled, timeout);
    } catch (error) {
      console.error("Error toggling auto-close:", error);
      toast({ description: "Failed to update auto-close settings" });
    }
  };

  // Update room settings (host only)
  const updateSettings = async (settings: any) => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await updateRoomSettings(roomId, settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({ description: "Failed to update room settings" });
    }
  };

  // Respond to join request (host only)
  const respondToJoinRequest = async (userId: string, approve: boolean) => {
    if (!roomId || !user || !isHost) return;
    
    try {
      await handleJoinRequest(roomId, userId, approve);
      toast({ 
        description: approve ? 
          "User has been approved to join" : 
          "User's request has been denied" 
      });
    } catch (error) {
      console.error("Error handling join request:", error);
      toast({ description: "Failed to process join request" });
    }
  };

  // Send private message
  const sendPrivateMsg = async (receiverId: string, message: string) => {
    if (!roomId || !user || !message.trim()) return;
    
    try {
      await sendPrivateMessage(roomId, user.uid, receiverId, message);
    } catch (error) {
      console.error("Error sending private message:", error);
      toast({ description: "Failed to send private message" });
    }
  };

  // Request to join room with optional join code
  const requestJoin = async (code?: string) => {
    if (!roomId || !user) return;
    
    try {
      if (code && room && !room.isPublic) {
        if (room.joinCode === code) {
          await requestToJoinRoom(roomId, user.uid, true); // Pass true to auto-approve with correct code
          toast({ description: "Join request sent with correct code" });
        } else {
          toast({ description: "Incorrect join code" });
        }
      } else {
        await requestToJoinRoom(roomId, user.uid);
        toast({ description: "Join request sent to room host" });
      }
    } catch (error) {
      console.error("Error requesting to join:", error);
      toast({ description: "Failed to send join request" });
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