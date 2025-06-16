
// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';
// import { toast } from '@/hooks/use-toast';
// import { useNotifications } from '@/hooks/useNotifications';
// import {
//   listenToRoomData,
//   isUserRoomParticipant,
//   removeUserFromRoom,
//   updateUserInstrument,
//   toggleUserMute,
//   toggleRoomChat,
//   toggleAutoCloseRoom,
//   updateRoomSettings,
//   handleJoinRequest,
//   deleteRoomFromFirestore,
//   listenToRoomChat,
//   saveChatMessage,
//   requestToJoinRoom,
//   getPrivateMessages,
//   sendPrivateMessage,
//   markMessageAsRead,
//   listenForUnreadMessages,
//   broadcastNote,
//   listenToInstrumentNotes
// } from '@/utils/firebase';
// import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

// interface InstrumentNote {
//   note: string;
//   instrument: string;
//   userId: string;
//   userName: string;
//   timestamp?: string;
// }

// type RoomContextType = {
//   room: any;
//   isLoading: boolean;
//   error: string | null;
//   isParticipant: boolean;
//   isHost: boolean;
//   userInfo: any;
//   messages: any[];
//   privateMessages: any[];
//   privateMessagingUser: string | null;
//   unreadCounts: Record<string, number>;
//   unreadMessageCount: number;
//   remotePlaying: InstrumentNote | null;
//   sendMessage: (message: string) => Promise<void>;
//   leaveRoom: () => Promise<void>;
//   closeRoom: () => Promise<void>;
//   switchInstrument: (instrument: string) => Promise<void>;
//   muteUser: (userId: string, mute: boolean) => Promise<void>;
//   removeUser: (userId: string) => Promise<void>;
//   toggleChat: (disabled: boolean) => Promise<void>;
//   toggleAutoClose: (enabled: boolean, timeout?: number) => Promise<void>;
//   updateSettings: (settings: any) => Promise<void>;
//   respondToJoinRequest: (userId: string, approve: boolean) => Promise<void>;
//   sendPrivateMsg: (receiverId: string, message: string) => Promise<void>;
//   setPrivateMessagingUser: (userId: string | null) => void;
//   requestJoin: (code?: string) => Promise<void>;
//   broadcastInstrumentNote: (note: InstrumentNote) => Promise<void>;
//   markChatAsRead: () => void;
// };

// const RoomContext = createContext<RoomContextType | undefined>(undefined);

// export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const { roomId } = useParams<{ roomId: string }>();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { addNotification } = useNotifications();

//   const [room, setRoom] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isParticipant, setIsParticipant] = useState<boolean>(false);
//   const [isHost, setIsHost] = useState<boolean>(false);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [privateMessages, setPrivateMessages] = useState<any[]>([]);
//   const [privateMessagingUser, setPrivateMessagingUser] = useState<string | null>(null);
//   const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
//   const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
//   const [wasRemoved, setWasRemoved] = useState<boolean>(false);
//   const [roomClosed, setRoomClosed] = useState<boolean>(false);
//   const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);


//   const [lastMessageId, setLastMessageId] = useState<string | null>(null);
//   const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
//   const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);


//   // Auto-close functionality with improved tracking
//   const checkInactivityAndClose = useCallback(async () => {
//     if (!room || !isHost || !room.autoCloseAfterInactivity) return;
//     const now = Date.now();
//     const inactivityTimeout = (room.inactivityTimeout || 5) * 60 * 1000; // Convert to milliseconds
//     // Check if there are any active participants
//     const activeParticipants = room.participants?.length || 0;
//     // Check time since last activity (either instrument play or message)
//     const timeSinceLastActivity = now - lastActivityTime;
//     console.log(`Checking inactivity: ${Math.round(timeSinceLastActivity / 1000)}s since last activity, ${activeParticipants} participants`);
//     if (activeParticipants === 0 || timeSinceLastActivity > inactivityTimeout) {
//       console.log('Auto-closing room due to inactivity');
//       try {
//         await deleteRoomFromFirestore(roomId!);
//         navigate('/music-rooms');
//         addNotification({
//           title: "Room Auto-Closed",
//           message: "Room was automatically closed due to inactivity",
//           type: "info"
//         });
//       } catch (error) {
//         console.error('Error auto-closing room:', error);
//       }
//     }
//   }, [room, isHost, roomId, navigate, addNotification, lastActivityTime]);


//   // Fetch room data and set up listeners
//   useEffect(() => {
//     if (!roomId || !user) return;

//     const checkParticipation = async () => {
//       try {
//         const isUserParticipant = await isUserRoomParticipant(roomId, user.uid);
//         setIsParticipant(isUserParticipant);
//       } catch (error) {
//         console.error("Error checking participation:", error);
//         setError("Failed to verify room participation");
//       }
//     };

//     checkParticipation();

//     // Listen for room data changes
//     const unsubscribeRoom = listenToRoomData(
//       roomId,
//       (roomData) => {
//         console.log("Room data updated:", roomData);

//         if (!roomData) {
//           // Room was deleted or doesn't exist
//           setRoomClosed(true);
//            addNotification({
//             title: "Room Closed",
//             message: "This room has been closed by the host",
//             type: "warning"
//           });
//           navigate('/music-rooms');
//           return;
//         }

//         setRoom(roomData);
//         setIsLoading(false);

//         // Update last activity time when room data changes
//         if (roomData.lastActivity) {
//           const activityTime = new Date(roomData.lastActivity).getTime();
//           setLastActivityTime(activityTime);
//         }

//         // Check if user is a participant and host
//         if (user) {
//           const participants = roomData.participants || [];
//           const participantInfo = participants.find((p: any) => p.id === user.uid);

//           // User was previously a participant but now is not - they were removed
//           if (isParticipant && !participantInfo && !wasRemoved) {
//             setWasRemoved(true);
//             addNotification({
//               title: "Removed from Room",
//               message: "You have been removed from this room by the host",
//               type: "error"
//             });
//             navigate('/music-rooms');
//             return;
//           }

//           if (participantInfo) {
//             setIsParticipant(true);
//             setIsHost(participantInfo.isHost);
//             setUserInfo(participantInfo);
//           } else {
//             setIsParticipant(false);
//             setIsHost(false);
//           }
//         }

//         // Check for auto-close after inactivity
//         if (roomData.autoCloseAfterInactivity && roomData.lastActivity) {
//           const lastActivity = new Date(roomData.lastActivity);
//           const now = new Date();
//           const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

//           if (diffMinutes > (roomData.inactivityTimeout || 5)) {
//             if (isHost) {
//               // Only host can close the room automatically
//               closeRoom();
//             }
//           }
//         }
//       },
//       (error) => {
//         console.error("Room data error:", error);
//         setError("Failed to load room data. The room may have been closed.");
//         setIsLoading(false);
//         navigate('/music-rooms');
//       }
//     );

//     // Listen for chat messages
//     const unsubscribeChat = listenToRoomChat(
//       roomId,
//       (messagesData) => {
//         // Sort messages by timestamp
//         const sortedMessages = [...messagesData].sort((a, b) => {
//           const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
//           const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
//           return timeA.getTime() - timeB.getTime();
//         });

//         setMessages(sortedMessages);

//         // Calculate unread messages
//         if (sortedMessages.length > 0) {
//           const latestMessage = sortedMessages[sortedMessages.length - 1];
//           // Count unread messages
//           const unreadCount = sortedMessages.filter(msg => 
//             msg.senderId !== user.uid && 
//             (!lastSeenMessageId || msg.id !== lastSeenMessageId)
//           ).length;
//           setUnreadMessageCount(unreadCount);
//           // Show notification for new messages
//           if (latestMessage.id !== lastMessageId && 
//               latestMessage.senderId !== user.uid &&
//               lastMessageId !== null) {
//             addNotification({
//               title: "New Message",
//               message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
//               type: "info"
//             });
//           }
//           setLastMessageId(latestMessage.id);
//         }

//       },
//       (error) => {
//         console.error("Chat error:", error);
//       }
//     );

//     // Listen for instrument notes being played
//     const unsubscribeNotes = listenToInstrumentNotes(
//       roomId,
//       (noteData: InstrumentNote) => {
//         // Only process notes from other users
//         if (noteData && noteData.userId !== user.uid) {
//           setRemotePlaying(noteData);

//           // Play the note using the audio utilities
//           try {
//             // This will play the sound on this client
//             const [note, octave] = noteData.note.split(':');
//             if (note && octave) {
//               playInstrumentNote(
//                 noteData.instrument,
//                 note,
//                 parseInt(octave),
//                 500
//               );
//             }
//           } catch (error) {
//             console.error("Error playing remote note:", error);
//           }
//         }
//       },
//       (error) => {
//         console.error("Instrument notes error:", error);
//       }
//     );

//     return () => {
//       unsubscribeRoom();
//       unsubscribeChat();
//       unsubscribeNotes();
//     };
//   }, [roomId, user, navigate, isParticipant, wasRemoved, lastMessageId, addNotification, lastSeenMessageId]);
  
//   // Auto-close check interval - improved timing
//   useEffect(() => {
//     if (!room || !isHost || !room.autoCloseAfterInactivity) return;
//     const interval = setInterval(checkInactivityAndClose, 30000); // Check every 30 seconds
//     checkInactivityAndClose(); // Initial check
//     return () => clearInterval(interval);
//   }, [room, isHost, checkInactivityAndClose]);

//   // Set up private messaging if a user is selected
//   useEffect(() => {
//     if (!roomId || !user || !privateMessagingUser) return;

//     const unsubscribePrivate = getPrivateMessages(
//       roomId,
//       user.uid,
//       privateMessagingUser,
//       (messagesData) => {
//         // Sort messages by timestamp
//         const sortedMessages = [...messagesData].sort((a, b) => {
//           const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
//           const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
//           return timeA.getTime() - timeB.getTime();
//         });

//         setPrivateMessages(sortedMessages);

//         // Mark messages as read
//         messagesData.forEach(msg => {
//           if (msg.receiverId === user.uid && !msg.read) {
//             markMessageAsRead(roomId, msg.id);
//           }
//         });
//       },
//       (error) => {
//         console.error("Private messaging error:", error);
//       }
//     );

//     return () => {
//       unsubscribePrivate();
//     };
//   }, [roomId, user, privateMessagingUser]);

//   // Listen for unread messages from all participants
//   useEffect(() => {
//     if (!roomId || !user || !room) return;

//     const unsubscribers: (() => void)[] = [];

//     room.participants.forEach((participant: any) => {
//       if (participant.id === user.uid) return; // Skip self

//       const unsubscribe = listenForUnreadMessages(
//         roomId,
//         user.uid,
//         (count) => {
//           setUnreadCounts(prev => ({
//             ...prev,
//             [participant.id]: count
//           }));
//         }
//       );

//       unsubscribers.push(unsubscribe);
//     });

//     return () => {
//       unsubscribers.forEach(unsub => unsub());
//     };
//   }, [roomId, user, room]);

//   // Broadcast instrument notes to other participants
//   const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
//     if (!roomId || !user) return;

//     try {
//       await broadcastNote(roomId, {
//         ...note,
//         timestamp: new Date().toISOString()
//       });

//       // Update room's last activity timestamp
//       if (room) {
//         updateRoomSettings(roomId, {
//           lastActivity: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error("Error broadcasting note:", error);
//       addNotification({
//         title: "Connection Error",
//         message: "Failed to sync with other participants",
//         type: "error"
//       });
//     }
//   };

  

//  // Mark chat messages as read
//   const markChatAsRead = useCallback(() => {
//     if (messages.length > 0) {
//       const latestMessage = messages[messages.length - 1];
//       setLastSeenMessageId(latestMessage.id);
//       setUnreadMessageCount(0);
//     }
//   }, [messages]);

//   // Send a chat message with activity tracking
//   const sendMessage = async (message: string) => {
//     if (!roomId || !user || !message.trim()) return;
//     if (!isParticipant) {
//       addNotification({
//         title: "Access Denied",
//         message: "You must be a participant to send messages",
//         type: "error"
//       });
//       return;
//     }
//     if (room?.isChatDisabled && !isHost) {
//       addNotification({
//         title: "Chat Disabled",
//         message: "Chat has been disabled by the host",
//         type: "warning"
//       });
//       return;
//     }
//     try {
//       // Update activity time when sending message
//       setLastActivityTime(Date.now());
//       await saveChatMessage(roomId, {
//         text: message,
//         senderId: user.uid,
//         senderName: user.displayName || 'Anonymous',
//         senderAvatar: user.photoURL || '',
//         timestamp: new Date().toISOString()
//       });

//       // Update room's last activity timestamp
//       if (room) {
//         updateRoomSettings(roomId, {
//           lastActivity: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       addNotification({
//         title: "Error",
//         message: "Failed to send message",
//         type: "error"
//       });
//     }
//   };

//   // Leave the room
//   const leaveRoom = async () => {
//     if (!roomId || !user) return;

//     try {
//       await removeUserFromRoom(roomId, user.uid);
//       navigate('/music-rooms'); // Redirect to home
//       addNotification({
//         title: "Left Room",
//         message: "You have left the room",
//         type: "info"
//       });
//     } catch (error) {
//       console.error("Error leaving room:", error);
//       addNotification({
//         title: "Error",
//         message: "Failed to leave room",
//         type: "error"
//       });
//     }
//   };

//   // Close the room (host only)
//   const closeRoom = useCallback(async () => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await deleteRoomFromFirestore(roomId);
//       navigate('/music-rooms'); // Redirect to home
//       toast({ description: "Room has been closed" });
//     } catch (error) {
//       console.error("Error closing room:", error);
//       toast({ description: "Failed to close room" });
//     }
//   }, [roomId, user, isHost, navigate]);

//   // Switch instrument
//   const switchInstrument = async (instrument: string) => {
//     if (!roomId || !user) return;

//     try {
//       await updateUserInstrument(roomId, user.uid, instrument);
//       // Update local UI immediately for responsiveness
//       if (userInfo) {
//         setUserInfo({
//           ...userInfo,
//           instrument
//         });
//       }
//     } catch (error) {
//       console.error("Error switching instrument:", error);
//       toast({ description: "Failed to switch instrument" });
//     }
//   };

//   // Mute/unmute a user (host only)
//   const muteUser = async (userId: string, mute: boolean) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await toggleUserMute(roomId, userId, mute);
//       toast({
//         description: mute ?
//           "User has been muted" :
//           "User has been unmuted"
//       });
//     } catch (error) {
//       console.error("Error toggling mute:", error);
//       toast({ description: "Failed to update user mute status" });
//     }
//   };

//   // Remove a user from the room (host only)
//   const removeUser = async (userId: string) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await removeUserFromRoom(roomId, userId);
//       toast({ description: "User removed from room" });
//     } catch (error) {
//       console.error("Error removing user:", error);
//       toast({ description: "Failed to remove user from room" });
//     }
//   };

//   // Toggle chat for the room (host only)
//   const toggleChat = async (disabled: boolean) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await toggleRoomChat(roomId, disabled);
//       // Update local state immediately for UI responsiveness
//       setRoom(prev => ({
//         ...prev,
//         isChatDisabled: disabled
//       }));

//        addNotification({ 

//         title: disabled ? "Chat Disabled" : "Chat Enabled",

//         message: disabled ? "Chat has been disabled for all users" : "Chat has been enabled for all users",

//         type: "info"

//       });

//     } catch (error) {

//       console.error("Error toggling chat:", error);

//       addNotification({

//         title: "Error",

//         message: "Failed to update chat settings",

//         type: "error"

//       });

//     }

//   };

//   // Toggle auto-close after inactivity (host only)
//   const toggleAutoClose = async (enabled: boolean, timeout: number = 5) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await toggleAutoCloseRoom(roomId, enabled, timeout);
//     } catch (error) {
//       console.error("Error toggling auto-close:", error);
//       toast({ description: "Failed to update auto-close settings" });
//     }
//   };

//   // Update room settings (host only)
//   const updateSettings = async (settings: any) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await updateRoomSettings(roomId, settings);
//     } catch (error) {
//       console.error("Error updating settings:", error);
//        addNotification({

//         title: "Error",

//         message: "Failed to update auto-close settings",

//         type: "error"

//       });

//     }

//   };

//   // Respond to join request (host only)
//   const respondToJoinRequest = async (userId: string, approve: boolean) => {
//     if (!roomId || !user || !isHost) return;

//     try {
//       await handleJoinRequest(roomId, userId, approve);
//       addNotification({ 

//         title: approve ? "User Approved" : "Request Denied",

//         message: approve ? "User has been approved to join" : "User's request has been denied",

//         type: approve ? "success" : "info"

//       });

//     } catch (error) {

//       console.error("Error handling join request:", error);

//       addNotification({

//         title: "Error",

//         message: "Failed to process join request",

//         type: "error"

//       });

//     }

//   };

//   // Send private message
//   const sendPrivateMsg = async (receiverId: string, message: string) => {
//     if (!roomId || !user || !message.trim()) return;

//     try {
//       await sendPrivateMessage(roomId, user.uid, receiverId, message);
//     } catch (error) {
//       console.error("Error sending private message:", error);
//       addNotification({

//         title: "Error",

//         message: "Failed to send private message",

//         type: "error"

//       });

//     }

//   };

//   // Request to join room with optional join code
//   const requestJoin = async (code?: string) => {
//     if (!roomId || !user) return;

//     try {
//       if (code && room && !room.isPublic) {
//         if (room.joinCode === code) {
//           await requestToJoinRoom(roomId, user.uid, true); // Pass true to auto-approve with correct code
//            addNotification({

//             title: "Request Sent",

//             message: "Join request sent with correct code",

//             type: "success"

//           });

//         } else {

//           addNotification({

//             title: "Invalid Code",

//             message: "Incorrect join code",

//             type: "error"

//           });

//         }

//       } else {

//         await requestToJoinRoom(roomId, user.uid);

//         addNotification({

//           title: "Request Sent",

//           message: "Join request sent to room host",

//           type: "info"

//         });

//       }

//     } catch (error) {

//       console.error("Error requesting to join:", error);

//       addNotification({

//         title: "Error",

//         message: "Failed to send join request",

//         type: "error"

//       });

//     }

//   };

//   const value = {
//     room,
//     isLoading,
//     error,
//     isParticipant,
//     isHost,
//     userInfo,
//     messages,
//     privateMessages,
//     privateMessagingUser,
//     unreadCounts,

//    unreadMessageCount,

//     remotePlaying,

//     sendMessage,

//     leaveRoom: async () => {

//       if (!roomId || !user) return;

//       try {

//         await removeUserFromRoom(roomId, user.uid);

//         navigate('/music-rooms');

//         addNotification({

//           title: "Left Room",

//           message: "You have left the room",

//           type: "info"

//         });

//       } catch (error) {

//         console.error("Error leaving room:", error);

//       }

//     },

//     closeRoom: async () => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await deleteRoomFromFirestore(roomId);

//         navigate('/music-rooms');

//         addNotification({

//           title: "Room Closed", 

//           message: "Room has been closed",

//           type: "info"

//         });

//       } catch (error) {

//         console.error("Error closing room:", error);

//       }

//     },

//     switchInstrument: async (instrument: string) => {

//       if (!roomId || !user) return;

//       try {

//         await updateUserInstrument(roomId, user.uid, instrument);

//         if (userInfo) {

//           setUserInfo({ ...userInfo, instrument });

//         }

//       } catch (error) {

//         console.error("Error switching instrument:", error);

//       }

//     },

//     muteUser: async (userId: string, mute: boolean) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await toggleUserMute(roomId, userId, mute);

//       } catch (error) {

//         console.error("Error toggling mute:", error);

//       }

//     },

//     removeUser: async (userId: string) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await removeUserFromRoom(roomId, userId);

//       } catch (error) {

//         console.error("Error removing user:", error);

//       }

//     },

//     toggleChat: async (disabled: boolean) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await toggleRoomChat(roomId, disabled);

//         setRoom(prev => ({ ...prev, isChatDisabled: disabled }));

//       } catch (error) {

//         console.error("Error toggling chat:", error);

//       }

//     },

//     toggleAutoClose: async (enabled: boolean, timeout: number = 5) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await toggleAutoCloseRoom(roomId, enabled, timeout);

//       } catch (error) {

//         console.error("Error toggling auto-close:", error);

//       }

//     },

//     updateSettings: async (settings: any) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await updateRoomSettings(roomId, settings);

//       } catch (error) {

//         console.error("Error updating settings:", error);

//       }

//     },

//     respondToJoinRequest: async (userId: string, approve: boolean) => {

//       if (!roomId || !user || !isHost) return;

//       try {

//         await handleJoinRequest(roomId, userId, approve);

//       } catch (error) {

//         console.error("Error handling join request:", error);

//       }

//     },

//     sendPrivateMsg: async (receiverId: string, message: string) => {

//       if (!roomId || !user || !message.trim()) return;

//       try {

//         await sendPrivateMessage(roomId, user.uid, receiverId, message);

//       } catch (error) {

//         console.error("Error sending private message:", error);

//       }

//     },

//     setPrivateMessagingUser,

//     requestJoin: async (code?: string) => {

//       if (!roomId || !user) return;

//       try {

//         await requestToJoinRoom(roomId, user.uid, !!code);

//       } catch (error) {

//         console.error("Error requesting to join:", error);

//       }

//     },

//     broadcastInstrumentNote,

//     markChatAsRead

//   };

//   return (
//     <RoomContext.Provider value={value}>
//       {children}
//     </RoomContext.Provider>
//   );
// };

// export const useRoom = () => {
//   const context = useContext(RoomContext);
//   if (context === undefined) {
//     throw new Error('useRoom must be used within a RoomProvider');
//   }
//   return context;
// }; 



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
    setLastActivityTime
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
  } = useRoomInstruments(room, setLastActivityTime);

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