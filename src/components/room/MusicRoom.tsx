
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  CircleX,
  Share2,
  Trash2,
  Users,
  MessageSquare,
  Send,
  Settings,
  Music,
  X,
  Smile,
  MicOff,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  auth,
  db,
  onSnapshot,
  doc,
  collection,
  updateDoc,
  deleteDoc,
  saveChatMessage,
  saveRoomToFirestore,
  deleteRoomChat,
  deleteRoomFromFirestore,
  onAuthStateChanged,
  listenToRoomData,
  sendPrivateMessage,
  getPrivateMessages,
  markMessageAsRead,
} from '@/utils/blog/firebase-config';
import type { User } from 'firebase/auth';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

// Simple Piano Component for demo purposes
const PianoComponent = () => {
  return (
    <div className="p-4 bg-black rounded-lg">
      <div className="flex">
        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
          <div
            key={note}
            className="w-12 h-32 bg-white border border-gray-300 flex items-end justify-center pb-2 cursor-pointer hover:bg-gray-100"
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple instrument component for instruments other than piano
const SimpleInstrument = ({ instrument }) => {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="text-xl mb-4 text-center">Virtual {instrument}</h3>
      <div className="grid grid-cols-3 gap-2">
        {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#'].map((note) => (
          <div
            key={note}
            className="p-4 bg-gray-700 rounded text-center cursor-pointer hover:bg-gray-600"
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

// Types
interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: any;
  type?: 'chat' | 'system' | 'private';
}

interface RoomParticipant {
  id: string;
  name: string;
  instrument: string;
  avatar: string;
  isHost: boolean;
  status: string;
  isMuted?: boolean;
}

interface RoomData {
  id: string;
  name: string;
  hostInstrument: string;
  allowDifferentInstruments: boolean;
  maxParticipants: number;
  isPublic: boolean;
  createdAt: any;
  participants: RoomParticipant[];
  participantIds?: string[];
  hostId?: string;
  pendingRequests?: string[];
  isChatDisabled?: boolean;
  lastActivity?: any;
  autoCloseAfterInactivity?: boolean;
  joinCode?: string;
}

const MusicRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentParticipant, setCurrentParticipant] = useState<RoomParticipant | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState('instrument');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [privateMessageUser, setPrivateMessageUser] = useState<RoomParticipant | null>(null);
  const [privateMessage, setPrivateMessage] = useState('');
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojis = ['😀', '😂', '🎵', '🎹', '🎸', '🥁', '🎷', '🎺', '🎻', '👍', '❤️', '👏', '🔥'];
  const [autoClosingEnabled, setAutoClosingEnabled] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState(5); // in minutes
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Auto-close room after inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (roomData?.autoCloseAfterInactivity && isHost) {
        const timeoutMs = inactivityTimeout * 60 * 1000;
        
        timeoutId = setTimeout(() => {
          // Auto-close room logic
          handleLeaveRoom(true);
          toast({
            description: "Room automatically closed due to inactivity"
          });
        }, timeoutMs);
      }
    };
    
    if (roomData) {
      resetInactivityTimer();
      
      // Update last activity in Firestore
      const updateActivity = async () => {
        try {
          const roomRef = doc(db, "musicRooms", roomId);
          await updateDoc(roomRef, {
            lastActivity: new Date().toISOString()
          });
        } catch (err) {
          console.error("Failed to update room activity:", err);
        }
      };
      
      // User activity event handlers
      const handleUserActivity = () => {
        resetInactivityTimer();
        updateActivity();
      };
      
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('click', handleUserActivity);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keydown', handleUserActivity);
        window.removeEventListener('click', handleUserActivity);
      };
    }
  }, [roomData, inactivityTimeout, isHost, roomId]);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) {
        // Not logged in, redirect to login
        toast({ description: "Please login to join music rooms" });
        navigate('/auth/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Fetch room data on component mount
  useEffect(() => {
    if (!roomId || !user) {
      setLoading(false);
      setError("Invalid room ID or user not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    // Listen for room data changes
    const unsubscribeRoom = listenToRoomData(
      roomId,
      (roomData) => {
        setRoomData(roomData);
        
        // Check if user is a participant
        const participant = roomData.participants?.find(p => p.id === user.uid);
        if (participant) {
          setCurrentParticipant(participant);
          setIsHost(participant.isHost);

          // Update auto-close setting if host
          if (participant.isHost) {
            setAutoClosingEnabled(!!roomData.autoCloseAfterInactivity);
            setInactivityTimeout(roomData.inactivityTimeout || 5);
          }
        } else {
          // User not in participants list
          setError("You are not a participant of this room");
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching room:", error);
        setError("The room you're trying to join doesn't exist or has been closed");
        setLoading(false);
      }
    );

    // Listen for chat messages
    const unsubscribeChat = onSnapshot(
      collection(db, "musicRooms", roomId, "chat"),
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data() as Omit<ChatMessage, 'id'>
        }));
        
        // Sort messages by timestamp
        newMessages.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return timeA.getTime() - timeB.getTime();
        });
        
        setMessages(newMessages);
        
        // Scroll to bottom of chat
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    );
    
    return () => {
      unsubscribeRoom();
      unsubscribeChat();
    };
  }, [roomId, user, navigate]);

  // Effect to handle private messages
  useEffect(() => {
    if (!roomId || !user || !privateMessageUser) return;
    
    const unsubscribePrivateMessages = getPrivateMessages(
      roomId,
      user.uid,
      privateMessageUser.id,
      (messages) => {
        setPrivateMessages(messages);
        
        // Mark messages as read
        messages.forEach(msg => {
          if (msg.receiverId === user.uid && !msg.read) {
            markMessageAsRead(roomId, msg.id);
          }
        });
        
        // Scroll to bottom of private messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    );
    
    return () => unsubscribePrivateMessages();
  }, [roomId, user, privateMessageUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      if (activeTab === 'chat') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (privateMessageUser) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [messages, privateMessages, activeTab, privateMessageUser]);

  const handleUpdateAutoClose = async () => {
    if (!roomId || !isHost) return;
    
    try {
      const updatedRoom = {
        ...roomData,
        autoCloseAfterInactivity: autoClosingEnabled,
        inactivityTimeout: inactivityTimeout
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      toast({
        description: autoClosingEnabled 
          ? `Room will auto-close after ${inactivityTimeout} minutes of inactivity` 
          : "Auto-close disabled"
      });
    } catch (error) {
      console.error("Failed to update auto-close settings:", error);
      toast({
        variant: "destructive",
        description: "Failed to update settings"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !roomData || !user) return;
    
    try {
      const trimmedMessage = message.trim();
      const newMessage: ChatMessage = {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        message: trimmedMessage,
        timestamp: new Date().toISOString(),
        type: 'chat'
      };
      
      await saveChatMessage(roomId, newMessage);
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        description: "Failed to send message"
      });
    }
  };

  const handleSendPrivateMessage = async () => {
    if (!privateMessage.trim() || !roomData || !user || !privateMessageUser) return;
    
    try {
      await sendPrivateMessage(
        roomId, 
        user.uid, 
        privateMessageUser.id, 
        privateMessage.trim()
      );
      
      setPrivateMessage('');
    } catch (error) {
      console.error("Error sending private message:", error);
      toast({
        variant: "destructive",
        description: "Failed to send private message"
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!roomId || !messageId) return;
    
    try {
      await deleteDoc(doc(db, "musicRooms", roomId, "chat", messageId));
      toast({
        description: "Message deleted"
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleLeaveRoom = async (isDeleteRoom: boolean = false) => {
    if (!roomId || !user) return;
    
    try {
      if (isHost && isDeleteRoom) {
        // Delete all chat messages first
        await deleteRoomChat(roomId);
        // Then delete the room itself
        await deleteRoomFromFirestore(roomId);
        toast({
          description: "Room closed and deleted"
        });
      } else {
        // Just update the room to remove the current user
        if (roomData) {
          const updatedParticipants = roomData.participants.filter(p => p.id !== user.uid);
          const updatedParticipantIds = (roomData.participantIds || []).filter(id => id !== user.uid);
          
          // If the host is leaving, assign a new host if there are other participants
          let newHostAssigned = false;
          if (isHost && updatedParticipants.length > 0) {
            updatedParticipants[0].isHost = true;
            newHostAssigned = true;
          }
          
          const updatedRoom = {
            ...roomData,
            participants: updatedParticipants,
            participantIds: updatedParticipantIds
          };
          
          await saveRoomToFirestore(updatedRoom);
          toast({
            description: newHostAssigned 
              ? "You left the room and a new host was assigned" 
              : "You left the room"
          });
        }
      }
      
      // Navigate back to rooms list
      navigate('/music-rooms');
    } catch (error) {
      console.error("Error leaving room:", error);
      toast({
        variant: "destructive",
        description: "Failed to leave room properly"
      });
    }
  };

  const toggleChatDisabled = async () => {
    if (!roomId || !isHost || !roomData) return;
    
    try {
      const updatedRoom = {
        ...roomData,
        isChatDisabled: !roomData.isChatDisabled
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      toast({
        description: updatedRoom.isChatDisabled 
          ? "Chat has been disabled" 
          : "Chat has been enabled"
      });
    } catch (error) {
      console.error("Error toggling chat:", error);
      toast({
        variant: "destructive",
        description: "Failed to update chat settings"
      });
    }
  };
  
  const toggleUserMute = async (participantId: string) => {
    if (!roomId || !isHost || !roomData) return;
    
    try {
      const updatedParticipants = roomData.participants.map(p => {
        if (p.id === participantId) {
          return { ...p, isMuted: !p.isMuted };
        }
        return p;
      });
      
      const updatedRoom = {
        ...roomData,
        participants: updatedParticipants
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      const participant = roomData.participants.find(p => p.id === participantId);
      toast({
        description: `${participant?.name} has been ${participant?.isMuted ? 'unmuted' : 'muted'}`
      });
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast({
        variant: "destructive",
        description: "Failed to update participant settings"
      });
    }
  };
  
  const removeUserFromRoom = async (participantId: string) => {
    if (!roomId || !isHost || !roomData) return;
    
    try {
      const updatedParticipants = roomData.participants.filter(p => p.id !== participantId);
      const updatedParticipantIds = (roomData.participantIds || []).filter(id => id !== participantId);
      
      const updatedRoom = {
        ...roomData,
        participants: updatedParticipants,
        participantIds: updatedParticipantIds
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      toast({
        description: "User has been removed from the room"
      });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        variant: "destructive",
        description: "Failed to remove user"
      });
    }
  };

  const handleUpdateInstrument = async (instrument: string) => {
    if (!user || !roomId || !roomData) return;
    
    try {
      // Check if different instruments are allowed
      if (!roomData.allowDifferentInstruments && instrument !== roomData.hostInstrument) {
        toast({
          variant: "destructive",
          description: "This room only allows the host instrument"
        });
        return;
      }
      
      // Update participant's instrument
      const updatedParticipants = roomData.participants.map(p => {
        if (p.id === user.uid) {
          return { ...p, instrument };
        }
        return p;
      });
      
      const updatedRoom = {
        ...roomData,
        participants: updatedParticipants
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      toast({
        description: `Your instrument has been updated to ${instrument}`
      });
      
      // Update local state
      setCurrentParticipant(prev => prev ? { ...prev, instrument } : null);
    } catch (error) {
      console.error("Error updating instrument:", error);
      toast({
        variant: "destructive",
        description: "Failed to update instrument"
      });
    }
  };

  const copyInviteLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateJoinCode = async () => {
    if (!roomId || !isHost || !roomData) return;
    
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const updatedRoom = {
        ...roomData,
        joinCode: code
      };
      
      await saveRoomToFirestore(updatedRoom);
      
      toast({
        description: `Join code generated: ${code}`
      });
    } catch (error) {
      console.error("Error generating join code:", error);
      toast({
        variant: "destructive",
        description: "Failed to generate join code"
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset private messaging when changing tabs
    if (value !== 'private') {
      setPrivateMessageUser(null);
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
    if (privateMessageUser) {
      setPrivateMessage(prev => prev + emoji);
    } else {
      setMessage(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };
  
  const handleStartPrivateChat = (participant: RoomParticipant) => {
    setPrivateMessageUser(participant);
    setActiveTab('private');
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast({
        description: "You have been signed out"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        description: "Failed to sign out"
      });
    }
  };

  // Handle response to join request (for private rooms)
  const handleJoinRequest = async (userId: string, approve: boolean) => {
    if (!roomId || !isHost || !roomData) return;
    
    try {
      if (approve) {
        // Add user to participants
        const userToAdd = roomData.pendingRequests?.find(id => id === userId);
        if (!userToAdd) return;
        
        // Get user data if available
        // For now we'll create a placeholder participant
        const newParticipant: RoomParticipant = {
          id: userId,
          name: `User ${userId.substring(0, 5)}`,
          instrument: roomData.hostInstrument,
          avatar: `https://i.pravatar.cc/150?u=${userId}`,
          isHost: false,
          status: 'online'
        };
        
        // Update the room data
        const updatedRoom = {
          ...roomData,
          participants: [...roomData.participants, newParticipant],
          participantIds: [...(roomData.participantIds || []), userId],
          pendingRequests: roomData.pendingRequests?.filter(id => id !== userId)
        };
        
        await saveRoomToFirestore(updatedRoom);
        
        toast({
          description: "Join request approved"
        });
      } else {
        // Reject the request by removing from pendingRequests
        const updatedRoom = {
          ...roomData,
          pendingRequests: roomData.pendingRequests?.filter(id => id !== userId)
        };
        
        await saveRoomToFirestore(updatedRoom);
        
        toast({
          description: "Join request rejected"
        });
      }
    } catch (error) {
      console.error("Error handling join request:", error);
      toast({
        variant: "destructive",
        description: "Failed to process join request"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !roomData) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
            <CircleX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error || "Room not found"}</h2>
            <p className="text-muted-foreground mb-6">
              The room you're trying to join doesn't exist or has been closed by the host.
            </p>
            <Button onClick={() => navigate('/music-rooms')}>
              Return to Music Rooms
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg shadow-md p-4 mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{roomData.name}</h1>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full hover:bg-muted"
                    onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                  >
                    <Settings size={20} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full hover:bg-muted"
                    onClick={copyInviteLink}
                  >
                    <Share2 size={20} />
                  </motion.button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Close Music Room?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {isHost 
                            ? "This will close the room for all participants and delete all messages." 
                            : "Are you sure you want to leave this room?"}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleLeaveRoom(isHost)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isHost ? "Close Room" : "Leave Room"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full hover:bg-muted"
                    onClick={() => setActiveTab(activeTab === 'users' ? 'instrument' : 'users')}
                  >
                    <Users size={20} />
                  </motion.button>
                </div>
              </div>
              
              {copied && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-green-600 mb-2"
                >
                  Room link copied to clipboard!
                </motion.div>
              )}
              
              {showSettingsPanel && isHost && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-muted/30 p-3 rounded-md mb-3 border"
                >
                  <h3 className="font-medium mb-2">Room Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input 
                          type="checkbox" 
                          checked={autoClosingEnabled} 
                          onChange={e => setAutoClosingEnabled(e.target.checked)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Auto-close after inactivity</span>
                      </label>
                      
                      {autoClosingEnabled && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm">Close after</span>
                          <select 
                            value={inactivityTimeout} 
                            onChange={e => setInactivityTimeout(Number(e.target.value))}
                            className="text-sm rounded border p-1"
                          >
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                          </select>
                        </div>
                      )}
                      
                      <Button 
                        size="sm"
                        onClick={handleUpdateAutoClose}
                        className="mt-1"
                      >
                        Save Settings
                      </Button>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input 
                          type="checkbox" 
                          checked={roomData.isChatDisabled} 
                          onChange={toggleChatDisabled}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Disable chat for all users</span>
                      </label>
                      
                      <div className="mb-2">
                        <Button 
                          size="sm"
                          onClick={generateJoinCode}
                          className="w-full justify-center"
                        >
                          Generate Join Code
                        </Button>
                        
                        {roomData.joinCode && (
                          <div className="mt-2 p-2 bg-primary/10 rounded text-center">
                            <span className="text-primary font-mono font-bold">{roomData.joinCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="relative">
                <Badge className={`absolute -top-3 right-0 z-10 ${roomData.isPublic ? 'bg-green-500' : 'bg-amber-500'}`}>
                  {roomData.isPublic ? 'Public' : 'Private'}
                </Badge>
                
                {roomData.allowDifferentInstruments ? (
                  <Badge className="absolute -top-3 left-0 z-10 bg-blue-500">
                    Multiple Instruments
                  </Badge>
                ) : (
                  <Badge className="absolute -top-3 left-0 z-10 bg-purple-500">
                    Single Instrument
                  </Badge>
                )}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {activeTab === 'instrument' && (
                  <div className="h-[300px] md:h-[400px] flex items-center justify-center bg-black/5 rounded-lg">
                    {currentParticipant?.instrument === 'piano' ? (
                      <PianoComponent />
                    ) : (
                      <SimpleInstrument instrument={currentParticipant?.instrument || 'Unknown'} />
                    )}
                  </div>
                )}
                
                {activeTab === 'users' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-lg p-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">Participants</h3>
                    <div className="space-y-3">
                      {roomData.participants.map((participant) => (
                        <motion.div 
                          key={participant.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-background">
                                <img 
                                  src={participant.avatar || '/default-avatar.png'} 
                                  alt={participant.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              {participant.isHost && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full h-4 w-4 flex items-center justify-center">
                                  <span className="text-[8px] text-white">Host</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{participant.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Music className="h-3 w-3 mr-1" />
                                {participant.instrument}
                                {participant.isMuted && (
                                  <span className="ml-2 text-destructive flex items-center">
                                    <MicOff size={12} className="mr-1" />
                                    Muted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isHost && participant.id !== user.uid && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleUserMute(participant.id)}
                              >
                                {participant.isMuted ? 'Unmute' : 'Mute'}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStartPrivateChat(participant)}
                              >
                                Message
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeUserFromRoom(participant.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                          
                          {!isHost && participant.id !== user.uid && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleStartPrivateChat(participant)}
                            >
                              Message
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {isHost && roomData.pendingRequests && roomData.pendingRequests.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <h3 className="text-lg font-semibold mb-2">Join Requests</h3>
                        <div className="space-y-2">
                          {roomData.pendingRequests.map((userId) => (
                            <motion.div 
                              key={userId}
                              className="flex items-center justify-between p-2 rounded-lg border bg-amber-50/30"
                            >
                              <div className="text-sm">User is requesting to join</div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleJoinRequest(userId, false)}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleJoinRequest(userId, true)}
                                >
                                  Approve
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {roomData.allowDifferentInstruments && currentParticipant && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Change your instrument:</h3>
                        <Select
                          value={currentParticipant.instrument}
                          onValueChange={handleUpdateInstrument}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select instrument" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="piano">Piano</SelectItem>
                            <SelectItem value="guitar">Guitar</SelectItem>
                            <SelectItem value="drums">Drums</SelectItem>
                            <SelectItem value="violin">Violin</SelectItem>
                            <SelectItem value="flute">Flute</SelectItem>
                            <SelectItem value="saxophone">Saxophone</SelectItem>
                            <SelectItem value="trumpet">Trumpet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[300px] md:h-[400px] flex flex-col bg-card rounded-lg"
                  >
                    <ScrollArea className="flex-1 p-4">
                      {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </div>
                      )}
                      
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`mb-3 ${msg.senderId === user?.uid ? 'text-right' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {msg.senderId !== user?.uid && (
                              <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                  src={roomData.participants.find(p => p.id === msg.senderId)?.avatar || '/default-avatar.png'} 
                                  alt="" 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className={`flex-1 ${msg.senderId === user?.uid ? 'flex justify-end' : ''}`}>
                              <div className="flex items-center gap-2 mb-1">
                                {msg.senderId !== user?.uid && (
                                  <span className="font-medium text-sm">{msg.senderName}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {msg.timestamp && (typeof msg.timestamp === 'string' 
                                    ? format(new Date(msg.timestamp), 'HH:mm') 
                                    : format(msg.timestamp.toDate?.() || new Date(), 'HH:mm')
                                  )}
                                </span>
                              </div>
                              
                              <div 
                                className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                                  msg.senderId === user?.uid 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                            
                            {msg.senderId === user?.uid && (
                              <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                  src={user.photoURL || '/default-avatar.png'} 
                                  alt="" 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          
                          {isHost && (
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-xs text-destructive opacity-0 hover:opacity-100 transition-opacity"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </ScrollArea>
                    
                    <div className="p-3 border-t">
                      {roomData.isChatDisabled && !isHost ? (
                        <div className="text-center text-muted-foreground text-sm py-2">
                          Chat has been disabled by the host
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 rounded-full"
                              >
                                <Smile size={20} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-2" align="start">
                              <div className="grid grid-cols-7 gap-2">
                                {emojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl h-8 w-8 flex items-center justify-center hover:bg-muted rounded"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={roomData.isChatDisabled && !isHost}
                          />
                          
                          <Button 
                            onClick={handleSendMessage}
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            disabled={!message.trim() || (roomData.isChatDisabled && !isHost)}
                          >
                            <Send size={18} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'private' && privateMessageUser && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[300px] md:h-[400px] flex flex-col bg-card rounded-lg"
                  >
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img 
                            src={privateMessageUser.avatar || '/default-avatar.png'} 
                            alt={privateMessageUser.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{privateMessageUser.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {privateMessageUser.instrument}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => setActiveTab('instrument')}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      {privateMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                          <p>No messages yet</p>
                          <p className="text-sm">Send a private message to {privateMessageUser.name}</p>
                        </div>
                      )}
                      
                      {privateMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`mb-3 ${msg.senderId === user?.uid ? 'text-right' : ''}`}
                        >
                          <div className={`flex items-start gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={
                                  msg.senderId === user?.uid 
                                    ? user?.photoURL || '/default-avatar.png'
                                    : privateMessageUser.avatar || '/default-avatar.png'
                                } 
                                alt="" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {msg.timestamp && (typeof msg.timestamp === 'string' 
                                    ? format(new Date(msg.timestamp), 'HH:mm') 
                                    : format(msg.timestamp.toDate?.() || new Date(), 'HH:mm')
                                  )}
                                </span>
                              </div>
                              
                              <div 
                                className={`inline-block px-3 py-2 rounded-lg ${
                                  msg.senderId === user?.uid 
                                    ? 'bg-primary/80 text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </ScrollArea>
                    
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-10 w-10 rounded-full"
                            >
                              <Smile size={20} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-2" align="start">
                            <div className="grid grid-cols-7 gap-2">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleEmojiClick(emoji)}
                                  className="text-xl h-8 w-8 flex items-center justify-center hover:bg-muted rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        <Input
                          value={privateMessage}
                          onChange={(e) => setPrivateMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendPrivateMessage();
                            }
                          }}
                          placeholder={`Message ${privateMessageUser.name}...`}
                          className="flex-1"
                        />
                        
                        <Button 
                          onClick={handleSendPrivateMessage}
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          disabled={!privateMessage.trim()}
                        >
                          <Send size={18} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
            
            <div className="flex justify-center">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="instrument">
                    <Music className="h-4 w-4 mr-2" />
                    Instrument
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users className="h-4 w-4 mr-2" />
                    Users ({roomData.participants.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {activeTab !== 'users' && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-card rounded-lg shadow-md p-4 h-fit"
              >
                <h2 className="text-xl font-semibold mb-4">Room Participants</h2>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {roomData.participants.map((participant) => (
                      <motion.div 
                        key={participant.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-background">
                              <img 
                                src={participant.avatar || '/default-avatar.png'} 
                                alt={participant.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {participant.isHost && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full h-4 w-4 flex items-center justify-center">
                                <span className="text-[8px] text-white">Host</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Music className="h-3 w-3 mr-1" />
                              {participant.instrument}
                            </div>
                          </div>
                        </div>
                        
                        {participant.id !== user?.uid && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStartPrivateChat(participant)}
                          >
                            Message
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default MusicRoom;
