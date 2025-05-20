
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateRoomModal from '@/components/room/CreateRoomModal';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

import {
  MessageSquare,
  Mic,
  MicOff,
  Users,
  X,
  Share2,
  Music,
  Volume2,
  VolumeX,
  CircleX,
  Smile,
  Send,
  Settings,
  Trash2,
  UserMinus,
  Ban,
  CircleCheck,
  CircleMinus,
  CircleEllipsis
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { saveChatMessage, deleteRoomChat, saveRoomToFirestore, deleteRoomFromFirestore, listenToLiveRooms } from "@/utils/auth/firebase";
import { auth, db } from '@/utils/auth/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, onSnapshot, QueryDocumentSnapshot, getDoc, Timestamp, query, orderBy } from 'firebase/firestore';
// Importing Instrument components
import PianoComponent from '@/components/instruments/piano/Piano';
import SimpleInstrument from '@/components/room/SimpleInstrument';


// Emoji data for the emoji picker
const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚']
  },
  {
    name: 'Music',
    emojis: ['🎵', '🎶', '🎼', '🎤', '🎧', '🎷', '🎸', '🎹', '🥁', '🎺', '🪕', '🎻', '🪘', '🎭', '🎬', '🎨', '👏', '🙌', '🤘', '👍']
  },
  {
    name: 'Objects',
    emojis: ['🎮', '🎯', '🎲', '🧩', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '📱', '💻', '⌨️', '🖥️', '🖱️', '🖨️', '📷', '📹', '📺', '📻']
  }
];

// Message types
interface Message {
  id: string;
  type?: 'system' | 'user' | 'emoji' | 'image' | 'tagged';
  user?: string;
  message: string;
  timestamp: string;
  replyTo?: {
    user: string;
    message: string;
  };
  userId?: string;
  userAvatar?: string;
  isAnimated?: boolean;
}

// Participant type
interface Participant {
  id: string;
  name: string;
  instrument: string;
  avatar: string;
  isHost: boolean;
  isActive?: boolean;
  status?: 'online' | 'away' | 'busy';
  isMuted?: boolean;
  isBanned?: boolean;
}

// Room settings type
interface RoomSettings {
  allowDifferentInstruments: boolean;
  maxParticipants: number;
  hostInstrument: string;
  isPublic: boolean;
}

// Animation variants for messages
const messageAnimations = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

// Animation variants for user actions
const userActionAnimations = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

// Animation variants for instrument section
const instrumentAnimations = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.2
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

// Animation variants for participant list
const listAnimations = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemAnimations = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};


// Component for rendering messages with appropriate styling
const ChatMessage = ({ message, onReply, isAdmin, canInteract }: { message: Message, onReply: (message: Message) => void, isAdmin: boolean, canInteract: boolean }) => {
  const isCurrentUser = message.user === 'You' || message.user === 'Admin';

  if (message.type === 'system') {
    return (
      <motion.div
        className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md w-full text-center my-2"
        initial="hidden"
        animate="visible"
        variants={messageAnimations}
      >
        {message.message}
      </motion.div>
    );
  }

  if (message.type === 'emoji') {
    return (
      <motion.div
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-1`}
        initial="hidden"
        animate="visible"
        variants={messageAnimations}
      >
        <div className="text-4xl">{message.message}</div>
      </motion.div>
    );
  }

  if (message.type === 'tagged') {
    return (
      <motion.div
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-1`}
        initial="hidden"
        animate="visible"
        variants={messageAnimations}
      >
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-sm">{message.user}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className={`bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm max-w-[240px] ${isCurrentUser ? 'bg-primary/10 rounded-tr-none' : 'rounded-tl-none'}`}>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2 border-l-2 border-primary text-xs">
              <span className="font-medium">{message.replyTo?.user}:</span> {message.replyTo?.message}
            </div>
            {message.message}
          </div>
          {canInteract && (
            <div className="mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReply(message)}
              >
                Reply
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-1`}
      initial="hidden"
      animate="visible"
      variants={messageAnimations}
    >
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {!isCurrentUser && (

          <Avatar className="w-8 h-8">
            <AvatarImage src={message.userAvatar || `https://i.pravatar.cc/150?img=${message.userId || '1'}`} />
            <AvatarFallback>{message.user?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-sm">{message.user}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div
            className={`px-3 py-2 rounded-lg text-sm max-w-[240px] 
              ${isCurrentUser
                ? 'bg-primary text-white rounded-tr-none'
                : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
              }`
            }
          >
            {message.message}
          </div>
          {canInteract && (
            <div className="mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReply(message)}
              >
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Component for instrument selection and playing
const InstrumentPlayer = ({
  instrument,
  userInstrument,
  allowDifferentInstruments
}: {
  instrument: string,
  userInstrument?: string,
  allowDifferentInstruments: boolean
}) => {
  const activeInstrument = allowDifferentInstruments ? userInstrument || instrument : instrument;

  return (
    <motion.div
      className="w-full overflow-hidden flex flex-col items-center"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={instrumentAnimations}
    >
      <div className="w-full max-w-full overflow-x-auto pb-4">
        <div className="min-w-[700px]">
          {activeInstrument === 'piano' ? (
            <PianoComponent />
          ) : (
            <SimpleInstrument type={activeInstrument || 'piano'} />
          )}
        </div>
      </div>
    </motion.div>
  );
};


const MusicRoom = () => {

  // Scroll to bottom of chat on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { roomId } = useParams<{ roomId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomData, setRoomData] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [isMuted, setIsMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    allowDifferentInstruments: false,
    maxParticipants: 3,
    hostInstrument: 'piano',
    isPublic: true
  });
  const [isJoining, setIsJoining] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [chatMessage, setChatMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [userInstrument, setUserInstrument] = useState<string>('');
  const [isChatDisabled, setIsChatDisabled] = useState(false);

  const navigate = useNavigate();

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const roomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameInputContainerRef = useRef<HTMLDivElement>(null);

  const { mode } = useTheme();

  useEffect(() => {
  if (!auth.currentUser) {
    toast({
      title: "Login required",
      description: "Please login to continue",
      variant: "destructive"
    });
    navigate('/music-rooms');
  }
}, []);

useEffect(() => {
  if (!roomId) return;
  const isHost = localStorage.getItem(`room_host_${roomId}`) === 'true';
  setIsAdmin(isHost);
}, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "musicRooms", roomId), (docSnap) => {
      const data = docSnap.data();

      if (!data) return;

      setIsChatDisabled(data?.isChatDisabled || false);
      setRoomDetails(data);
      setParticipants(data.participants || []);

      // 🔥 Check if room should auto-close
      if (data.expiresAt?.toDate() < new Date()) {
        // Delay so it doesn't flicker
        setTimeout(() => {
          destroyRoom(); // Host-only: OR call Firebase cleanup if guest
        }, 1000);
      }
    });

    return () => unsub();
  }, [roomId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle immediate message sending (real-time effect)

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(
      collection(db, 'musicRooms', roomId, 'chat'),
      (snapshot) => {
        const fetchedMessages: Message[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
          const data = doc.data();

          return {
            id: doc.id,
            message: data.message as string,
            timestamp: typeof data.timestamp?.toDate === "function"
              ? data.timestamp.toDate().toISOString()
              : (data.timestamp as string ?? new Date().toISOString()),
            type: data.type,
            replyTo: data.replyTo,
            user: data.user,
            userId: data.userId,
            userAvatar: data.userAvatar,
            isAnimated: false,
          };
        });



        setMessages(fetchedMessages);      // ✅ matches Message[]
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );

    return () => unsub();
  }, [roomId]);

  // Room Auto-destruction timer
  useEffect(() => {
    const checkRoomActivity = () => {
      const currentTime = Date.now();
      const inactivityTime = currentTime - lastActivityTime;

      // Check if room has been inactive for 5 minutes (300000ms)
      if (inactivityTime >= 300000 && isAdmin) {
        destroyRoom();
      }
    };

    // Set up interval to check room activity
    roomTimerRef.current = setInterval(checkRoomActivity, 60000); // Check every minute

    return () => {
      if (roomTimerRef.current) {
        clearInterval(roomTimerRef.current);
      }
    };
  }, [lastActivityTime, participants, isRoomActive]);

  // Reset activity timer on user actions
  const updateActivityTimer = () => {
    setLastActivityTime(Date.now());
  };



  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, "musicRooms", roomId);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) {
          setRoomNotFound(true);
          toast({
            title: "Room not found",
            description: "The room you're trying to join doesn't exist or has been closed.",
            variant: "destructive",
          });
          return;
        }

        const data = snap.data();
        setRoomDetails(data);
        setParticipants(data.participants || []);

        // initialize settings
        setRoomSettings({
          allowDifferentInstruments: data.allowDifferentInstruments || false,
          maxParticipants: data.maxParticipants || (data.allowDifferentInstruments ? 7 : 3),
          hostInstrument: data.hostInstrument || 'piano',
          isPublic: data.isPublic !== false,
        });

        // optional: seed welcome message
        setMessages([{
          id: "init",
          type: "system",
          message: `Welcome to ${data.name}!`,
          timestamp: new Date().toISOString(),
        }]);
      } catch (err) {
        console.error("Error fetching room:", err);
        toast({
          description: "Failed to load room. Check your network and try again.",
          variant: "destructive",
        });
        setRoomNotFound(true);
      }
    };

    fetchRoom();
  }, [roomId]);



  // Helper function to add messages with proper IDs and timestamps
  const cleanObject = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  };

  const addMessage = async (message: Partial<Message>) => {
    const tempMessage: Message = {
      ...message,
      id: "temp-" + Date.now(),
      message: message.message || '',
      timestamp: new Date().toISOString(),
      type: message.type || 'user',
      replyTo: message.replyTo,
      isAnimated: true,
      user: currentUser?.displayName || "Unknown",
      userId: currentUser?.uid || "anonymous",
      userAvatar: currentUser?.photoURL || '',
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const { id, ...messageToSend } = tempMessage;

      const cleanMessage = cleanObject({
        ...messageToSend,
        isAnimated: false,
      });

      const newId = await saveChatMessage(roomId!, cleanMessage);

      setMessages(prev =>
        prev.map(m =>
          m.id === tempMessage.id ? { ...tempMessage, id: newId, isAnimated: false } : m
        )
      );
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }

    updateActivityTimer();
  };


  // Function to remove a user from the room (admin only)
 const removeUser = async (userIdToRemove: string) => {
  if (!isAdmin || !roomId) return;

  try {
    const updatedParticipants = participants.filter(p => p.id !== userIdToRemove);
    const updatedIds = updatedParticipants.map(p => p.id);

    await updateDoc(doc(db, 'musicRooms', roomId), {
      participants: updatedParticipants,
      participantIds: updatedIds
    });

    console.log(`User ${userIdToRemove} removed from room ${roomId}`);

    addMessage({
      type: 'system',
      message: `A user was removed from the room.`,
    });

    toast({
      title: 'User Removed',
      description: 'The selected participant has been removed from the room.',
    });

  } catch (error) {
    console.error('Error removing user from room:', error);

    toast({
      title: 'Failed to remove user',
      description: 'An error occurred while removing the user. Please try again.',
      variant: 'destructive'
    });
  }
};


  // Function to toggle user chat ability
  const toggleUserChatMute = (userId: string) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only room admins can mute users",
        variant: "destructive",
      });
      return;
    }


    const userToMute = participants.find(p => p.id === userId);
    if (!userToMute || userToMute.isHost) return;

    const updatedParticipants = participants.map(p => {
      if (p.id === userId) {
        const newMuteStatus = !p.isMuted;
        addMessage({
          type: 'system',
          message: `${p.name} has been ${newMuteStatus ? 'muted' : 'unmuted'} by the admin`
        });

        return {
          ...p,
          isMuted: newMuteStatus
        };
      }
      return p;
    });

    setParticipants(updatedParticipants);

    // Update the room in localStorage
    updateRoomParticipants(updatedParticipants);
  };

  // Toggle all chat in room
  const toggleRoomChat = async () => {
    if (!isAdmin) return;
    if (!roomId) return;

    // setIsChatDisabled(!isChatDisabled);
    try {
      const roomRef = doc(db, "musicRooms", roomId);
      await updateDoc(roomRef, {
        isChatDisabled: !isChatDisabled,
      });
    } catch (error) {
      console.error("Failed to update chat toggle:", error);
    }

    addMessage({
      type: 'system',
      message: `Chat has been ${!isChatDisabled ? 'disabled' : 'enabled'} by the admin`
    });
  };

  // Function to update room instrument (admin only)
const changeRoomInstrument = async (newInstrument: string) => {
  if (!isAdmin || !roomId) return;

  try {
    const roomRef = doc(db, 'musicRooms', roomId);

    await updateDoc(roomRef, {
      hostInstrument: newInstrument,
      participants: !roomSettings.allowDifferentInstruments
        ? participants.map(p => ({ ...p, instrument: newInstrument }))
        : participants,
    });

    toast({
      title: 'Instrument Changed',
      description: `Room instrument changed to ${newInstrument}.`,
    });

    addMessage({
      type: 'system',
      message: `Instrument changed to ${newInstrument}`,
    });

  } catch (error) {
    console.error("Failed to change instrument:", error);
    toast({
      title: 'Instrument Change Failed',
      description: 'Something went wrong while updating the instrument.',
      variant: 'destructive',
    });
  }
};


  // Function to update room settings
  const updateRoomSettings = (newSettings: RoomSettings) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only room admins can update room settings",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setRoomSettings(newSettings);

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
    const updatedRooms = rooms.map((r: any) => {
      if (r.id === roomId) {
        return {
          ...r,
          allowDifferentInstruments: newSettings.allowDifferentInstruments,
          maxParticipants: newSettings.maxParticipants,
          hostInstrument: newSettings.hostInstrument,
          isPublic: newSettings.isPublic
        };
      }
      return r;
    });

    localStorage.setItem('musicRooms', JSON.stringify(updatedRooms));

    // Add system message
    addMessage({
      type: 'system',
      message: `Room settings have been updated by admin`
    });
  };

  // Function to toggle instrument mode
  const toggleInstrumentMode = () => {
    if (!isAdmin) return;

    const newAllowDifferent = !roomSettings.allowDifferentInstruments;

    // Update max participants based on the new setting
    const newMaxParticipants = newAllowDifferent ?
      (roomSettings.maxParticipants > 7 ? 7 : roomSettings.maxParticipants) :
      (roomSettings.maxParticipants > 3 ? 3 : roomSettings.maxParticipants);

    const newSettings = {
      ...roomSettings,
      allowDifferentInstruments: newAllowDifferent,
      maxParticipants: newMaxParticipants
    };

    updateRoomSettings(newSettings);

    toast({
      title: `Instrument mode changed`,
      description: `Users can now play ${newAllowDifferent ? 'different instruments' : 'only one instrument'}`
    });
  };

  // Helper function to update room participants in localStorage
  const updateRoomParticipants = (updatedParticipants: Participant[]) => {
    const rooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
    const updatedRooms = rooms.map((r: any) => {
      if (r.id === roomId) {
        return {
          ...r,
          participants: updatedParticipants
        };
      }
      return r;
    });

    localStorage.setItem('musicRooms', JSON.stringify(updatedRooms));
  };

  // Function to destroy the room
const destroyRoom = async () => {
  if (!roomId || !isAdmin) return;

  try {
    const activeUsers = participants.filter(p => p.isActive !== false);
    if (activeUsers.length === 0) {
      await deleteRoomChat(roomId);
      await deleteRoomFromFirestore(roomId);

      toast({
        title: 'Room Closed',
        description: 'Room auto-closed due to inactivity.',
      });

      navigate('/music-rooms');
    }
  } catch (error) {
    console.error('Error auto-closing room:', error);
    toast({
      title: 'Failed to close room',
      description: 'An error occurred while closing the room.',
      variant: 'destructive'
    });
  }
};

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !replyingTo) return;

    // Check if user has joined with a name
    if (!userName) {
      toast({
        title: "Not joined yet",
        description: "You need to join the room to chat",
        variant: "destructive",
      });
      return;
    }

    // Check if chat is disabled and user is not admin
    if (isChatDisabled && !isAdmin) {
      toast({
        title: "Chat disabled",
        description: "The admin has disabled chat in this room",
        variant: "destructive",
      });
      return;
    }

    // Check if this user is muted
    const currentUser = participants.find(p => p.name === userName && !p.isHost);
    if (currentUser?.isMuted && !isAdmin) {
      toast({
        title: "You are muted",
        description: "The admin has muted you in this room",
        variant: "destructive",
      });
      return;
    }

    // Handle reply case
    if (replyingTo) {
      addMessage({
        user: isAdmin ? 'Admin' : 'You',
        message: chatMessage || '👍', // Default thumbs up if empty when replying
        type: 'tagged',
        replyTo: {
          user: replyingTo.user || 'User',
          message: replyingTo.message
        }
      });

      setReplyingTo(null);
    } else {
      // Regular message
      addMessage({
        user: isAdmin ? 'Admin' : 'You',
        message: chatMessage
      });
    }

    setChatMessage('');

    // Focus the input after sending
    chatInputRef.current?.focus();

    // Update activity timer
    updateActivityTimer();
  };

  const handleShareRoom = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);

    toast({
      title: "Link copied!",
      description: "Room link copied to clipboard",
    });
  };


  const handleJoinRoom = () => {
    const user = auth.currentUser;
    const userName = user?.displayName || "Anonymous";

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to join the room.",
        variant: "destructive",
      });
      return;
    }

    if (participants.length >= roomSettings.maxParticipants) {
      toast({
        title: "Room is full",
        description: `This room is limited to ${roomSettings.maxParticipants} participants`,
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    setTimeout(() => {
      const newUser = {
        id: user.uid,
        name: userName,
        instrument: roomSettings.allowDifferentInstruments
          ? userInstrument || roomSettings.hostInstrument
          : roomSettings.hostInstrument,
        avatar: user.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
        isHost: false,
        status: 'online' as const,
        isActive: true,
      };

      setParticipants(prev => [...prev, newUser]);
      addMessage({
        type: 'system',
        message: `${userName} has joined the room`,
      });

      setIsJoining(false);

      updateRoomParticipants([...participants, newUser]);

      toast({
        title: "Joined room!",
        description: `You've successfully joined ${roomDetails?.name}`,
      });
    }, 1500);
  };


const handleEnterAsAdmin = () => {
  localStorage.setItem(`room_host_${roomId}`, 'true');
  setIsAdmin(true);
  setUserName('Room Admin');
  setShowNameInput(false);
console.log("isAdmin:", isAdmin);
  toast({
    title: "Admin Mode",
    description: "You've entered the room as admin",
  });
};


  const handleAddEmoji = (emoji: string) => {
    if (!userName) {
      toast({
        title: "Not joined yet",
        description: "You need to join the room to chat",
        variant: "destructive",
      });
      return;
    }

    // Check if chat is disabled and user is not admin
    if (isChatDisabled && !isAdmin) {
      toast({
        title: "Chat disabled",
        description: "The admin has disabled chat in this room",
        variant: "destructive",
      });
      return;
    }

    // Check if this user is muted
    const currentUser = participants.find(p => p.name === userName && !p.isHost);
    if (currentUser?.isMuted && !isAdmin) {
      toast({
        title: "You are muted",
        description: "The admin has muted you in this room",
        variant: "destructive",
      });
      return;
    }

    // If replying with just an emoji
    if (replyingTo) {
      addMessage({
        user: isAdmin ? 'Admin' : 'You',
        message: emoji,
        type: 'tagged',
        replyTo: {
          user: replyingTo.user || 'User',
          message: replyingTo.message
        }
      });
      setReplyingTo(null);
    } else {
      // Send as emoji message
      addMessage({
        user: isAdmin ? 'Admin' : 'You',
        message: emoji,
        type: 'emoji'
      });
    }

    setIsEmojiPickerOpen(false);

    // Update activity timer
    updateActivityTimer();
  };

  const handleReplyToMessage = (message: Message) => {
    if (isChatDisabled && !isAdmin) return;

    setReplyingTo(message);
    chatInputRef.current?.focus();

    // Update activity timer
    updateActivityTimer();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleChangeInstrument = (instrument: string) => {
    if (!roomSettings.allowDifferentInstruments && !isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the admin can change instruments in this room",
        variant: "destructive",
      });
      return;
    }

    setUserInstrument(instrument);

    // If this is the admin, change for everyone if single instrument mode
    if (isAdmin && !roomSettings.allowDifferentInstruments) {
      changeRoomInstrument(instrument);
    } else {
      // Just update the current user's instrument
      const updatedParticipants = participants.map(p => {
        if ((p.isHost && isAdmin) || (p.name === userName && !p.isHost)) {
          return {
            ...p,
            instrument
          };
        }
        return p;
      });

      setParticipants(updatedParticipants);
      updateRoomParticipants(updatedParticipants);

      // Add message
      addMessage({
        type: 'system',
        message: `${isAdmin ? 'Admin' : userName} switched to playing ${instrument}`
      });
    }
  };


  if (roomNotFound) {
    return (

      <AppLayout
        title="Room Not Found | HarmonyHub"
        description="The music room you're looking for doesn't exist."
      >
        <div className="container mx-auto px-4 py-16 text-center">
          <CircleX size={64} className="mx-auto text-red-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Room Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
            The music room you're trying to access doesn't exist or has been closed.
            You can create a new room or go back to explore other features.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/')}>Go Home</Button>
            <Link
              to="/music-rooms"
              onClick={() => {
                window.scrollTo({ top: 50, behavior: 'smooth' });
              }}
              className={`inline-flex items-center border-1 justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm 
    ${mode === 'dark'
                  ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                  : 'bg-white text-gray-800 hover:bg-gray-300'
                }`}
            >
              Join Other Live Music
            </Link>
            <Button variant="outline">
              <CreateRoomModal />
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Live Music Room | HarmonyHub"
      description="Join a collaborative music session with musicians from around the world."
    >
      <div className="container mx-auto px-4 py-6">
        <motion.div
          className="flex flex-col md:flex-row gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main stage area */}
          <div className="flex-grow">
            <motion.div
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Music Room:
                  </span> {roomDetails?.name || roomId}
                </h1>
                <Badge variant="outline" className="flex gap-1 items-center animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span> Live
                </Badge>
                {isAdmin && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Settings size={14} className="mr-1" /> Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                        to="/music-rooms"
                        onClick={() => window.scrollTo({ top: 50, behavior: 'smooth' })}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition"
                      > <Button variant="outline" >
                        Join other room</Button>
                      </Link>
                <Button variant="outline" size="sm" onClick={handleShareRoom} className="group">
                  <Share2 size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                  Share
                </Button>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 size={16} className="mr-1" />
                        Close Room
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Close this music room?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all participants and destroy the room. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={destroyRoom}>
                          Yes, close room
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Users size={14} />
                  {participants.length}/{roomSettings.maxParticipants}
                </Badge>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6 min-h-[400px] shadow-xl border border-gray-200 dark:border-gray-700 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* If admin, show instrument directly */}
              {isAdmin && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                      {roomSettings.allowDifferentInstruments ? "Your Instrument" : "Room Instrument"}
                    </h2>
                    <div className="flex gap-2">
                      <Select
                        value={userInstrument || roomSettings.hostInstrument}
                        onValueChange={handleChangeInstrument}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piano">Piano</SelectItem>
                          <SelectItem value="guitar">Guitar</SelectItem>
                          <SelectItem value="drummachine">Drum Machine</SelectItem>
                          <SelectItem value="chordprogression">ChordProgression</SelectItem>
                          <SelectItem value="drums">Drums</SelectItem>
                          <SelectItem value="flute">Flute</SelectItem>
                          <SelectItem value="saxophone">Saxophone</SelectItem>
                          <SelectItem value="trumpet">Trumpet</SelectItem>
                          <SelectItem value="veena">Veena</SelectItem>
                          <SelectItem value="violin">Violin</SelectItem>
                          <SelectItem value="xylophone">Xylophone</SelectItem>
                          <SelectItem value="kalimba">Kalimba</SelectItem>
                          <SelectItem value="marimba">Marimba</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <InstrumentPlayer
                    instrument={roomSettings.hostInstrument}
                    userInstrument={userInstrument}
                    allowDifferentInstruments={roomSettings.allowDifferentInstruments}
                  />
                </>
              )}

              {/* For regular users, show join form or instrument based on state */}
              {!isAdmin && (
                <>
                  {showNameInput ? (
                    <motion.div
                      ref={nameInputContainerRef}
                      className="max-w-md mx-auto overflow-visible bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <h2 className="text-xl font-semibold mb-6 text-center">Join this room</h2>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="user-name">Your Name</Label>
                          <Input
                            id="user-name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name"
                            className="mt-1"
                          />
                        </div>

                        {roomSettings.allowDifferentInstruments && (
                          <div>
                            <Label htmlFor="user-instrument">Choose Your Instrument</Label>
                            <Select
                              value={userInstrument || roomSettings.hostInstrument}
                              onValueChange={setUserInstrument}
                            >
                              <SelectTrigger id="user-instrument" className="w-full mt-1">
                                <SelectValue placeholder="Select instrument" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piano">Piano</SelectItem>
                                <SelectItem value="guitar">Guitar</SelectItem>
                                <SelectItem value="drummachine">Drum Machine</SelectItem>
                                <SelectItem value="chordprogression">ChordProgression</SelectItem>
                                <SelectItem value="drums">Drums</SelectItem>
                                <SelectItem value="flute">Flute</SelectItem>
                                <SelectItem value="saxophone">Saxophone</SelectItem>
                                <SelectItem value="trumpet">Trumpet</SelectItem>
                                <SelectItem value="veena">Veena</SelectItem>
                                <SelectItem value="violin">Violin</SelectItem>
                                <SelectItem value="xylophone">Xylophone</SelectItem>
                                <SelectItem value="kalimba">Kalimba</SelectItem>
                                <SelectItem value="marimba">Marimba</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground mb-4">
                          {roomSettings.allowDifferentInstruments
                            ? "You can play your own instrument alongside other participants"
                            : `You'll play the ${roomSettings.hostInstrument || 'piano'} together with other participants`
                          }
                        </div>

                        <Button
                          onClick={handleJoinRoom}
                          disabled={isJoining || !userName.trim()}
                          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600"
                        >
                          {isJoining ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                              Joining...
                            </span>
                          ) : (
                            'Join Session'
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {roomSettings.allowDifferentInstruments && (
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                            Your Instrument
                          </h2>
                          <Select
                            value={userInstrument || roomSettings.hostInstrument}
                            onValueChange={handleChangeInstrument}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select instrument" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="piano">Piano</SelectItem>
                              <SelectItem value="guitar">Guitar</SelectItem>
                              <SelectItem value="drummachine">Drum Machine</SelectItem>
                              <SelectItem value="chordprogression">ChordProgression</SelectItem>
                              <SelectItem value="drums">Drums</SelectItem>
                              <SelectItem value="flute">Flute</SelectItem>
                              <SelectItem value="saxophone">Saxophone</SelectItem>
                              <SelectItem value="trumpet">Trumpet</SelectItem>
                              <SelectItem value="veena">Veena</SelectItem>
                              <SelectItem value="violin">Violin</SelectItem>
                              <SelectItem value="xylophone">Xylophone</SelectItem>
                              <SelectItem value="kalimba">Kalimba</SelectItem>
                              <SelectItem value="marimba">Marimba</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <InstrumentPlayer
                        instrument={roomSettings.hostInstrument}
                        userInstrument={userInstrument}
                        allowDifferentInstruments={roomSettings.allowDifferentInstruments}
                      />
                    </>
                  )}
                </>
              )}
            </motion.div>

            {/* Admin controls for changing instrument and room settings */}
            {isAdmin && (
              <motion.div
                className="mb-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Admin Controls</h3>

                <div className="space-y-6">
                  {/* Instrument mode toggle */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="instrument-mode-toggle" className="text-sm font-medium">
                        Allow Different Instruments
                      </Label>
                      <Switch
                        id="instrument-mode-toggle"
                        checked={roomSettings.allowDifferentInstruments}
                        onCheckedChange={toggleInstrumentMode}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {roomSettings.allowDifferentInstruments
                        ? "Users can play different instruments simultaneously"
                        : "All users play the same instrument together"}
                    </p>
                  </div>

                  {/* Max participants slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Maximum Participants</Label>
                      <span className="text-sm font-medium">{roomSettings.maxParticipants}</span>
                    </div>
                    <Slider
                      value={[roomSettings.maxParticipants]}
                      min={1}
                      max={roomSettings.allowDifferentInstruments ? 7 : 3}
                      step={1}
                      onValueChange={(value) => {
                        updateRoomSettings({
                          ...roomSettings,
                          maxParticipants: value[0]
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {roomSettings.allowDifferentInstruments
                        ? "Up to 7 participants can join when different instruments are allowed"
                        : "Up to 3 participants can join when playing the same instrument"}
                    </p>
                  </div>

                  {/* Chat controls */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Chat Controls</h4>
                      <p className="text-xs text-muted-foreground">Enable or disable chat for all users</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isChatDisabled ? "outline" : "default"}
                        onClick={toggleRoomChat}
                      >
                        {isChatDisabled ? "Enable Chat" : "Disable Chat"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chat and participants section */}
            <motion.div
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                    <MessageSquare size={16} className="mr-2" />
                    Chat
                    {isChatDisabled && !isAdmin && (
                      <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full px-2 py-0.5">
                        Disabled
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="participants" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                    <Users size={16} className="mr-2" />
                    Participants
                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                      {participants.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Chat tab */}
                <TabsContent value="chat" className="p-0">
                  <div className="p-4 h-[300px] md:h-[400px] flex flex-col">
                    {/* Messages list */}
                    <div className="flex-grow overflow-y-auto px-2">
                      <div className="space-y-2 pb-4">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <ChatMessage
                              key={message.id}
                              message={message}
                              onReply={handleReplyToMessage}
                              isAdmin={isAdmin}
                              canInteract={!isChatDisabled || isAdmin}
                            />
                          ))}
                        </AnimatePresence>

                        {/* Typing indicators */}
                        {Object.entries(isTyping).map(([userId, isTyping]) =>
                          isTyping && (
                            <motion.div
                              key={`typing-${userId}`}
                              className="flex items-center gap-2 p-2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >

                              <Avatar className="w-6 h-6">
                                <AvatarImage
                                  src={user?.photoURL || `https://i.pravatar.cc/150?img=${userId}`}
                                  alt={user?.displayName || "Guest"}
                                />
                                <AvatarFallback>{user.displayName || 'User Avatar'}</AvatarFallback>
                              </Avatar>

                              <span className="text-xs text-gray-500">
                                <span className="typing-indicator">
                                  <span className="dot"></span>
                                  <span className="dot"></span>
                                  <span className="dot"></span>
                                </span>
                              </span>
                            </motion.div>
                          )
                        )}

                        {/* Invisible element for scrolling */}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Reply preview */}
                    {replyingTo && (
                      <motion.div
                        className="bg-gray-100 dark:bg-gray-800 p-2 mb-2 rounded-md flex justify-between items-center"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <div className="text-sm">
                          <span className="text-gray-500">Reply to </span>
                          <span className="font-medium">{replyingTo.user}:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{replyingTo.message}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                          <X size={14} />
                        </Button>
                      </motion.div>
                    )}

                    {/* Chat input */}
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2 mt-2">
                      <div className="relative flex-grow">
                        <Textarea
                          ref={chatInputRef}
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder={
                            isChatDisabled && !isAdmin
                              ? "Chat is disabled by admin"
                              : "Type your message..."
                          }
                          className="min-h-[60px] pr-10"
                          disabled={(isChatDisabled && !isAdmin) || !userName}
                        />
                        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute bottom-2 right-2 h-7 w-7 p-0"
                              disabled={(isChatDisabled && !isAdmin) || !userName}
                            >
                              <Smile size={18} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-0" align="end">
                            <div className="p-2">
                              <div className="font-medium text-sm mb-2">Emoji</div>
                              <Tabs defaultValue={emojiCategories[0].name}>
                                <TabsList className="mb-2">
                                  {emojiCategories.map((category) => (
                                    <TabsTrigger
                                      key={category.name}
                                      value={category.name}
                                      className="text-xs py-1 px-2"
                                    >
                                      {category.name}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>

                                {emojiCategories.map((category) => (
                                  <TabsContent key={category.name} value={category.name} className="m-0">
                                    <div className="grid grid-cols-5 gap-1">
                                      {category.emojis.map((emoji) => (
                                        <Button
                                          key={emoji}
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleAddEmoji(emoji)}
                                        >
                                          {emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={(isChatDisabled && !isAdmin) || !userName}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                {/* Participants tab */}
                <TabsContent value="participants" className="p-0">
                  <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto">
                    <motion.ul
                      className="divide-y divide-gray-200 dark:divide-gray-800"
                      variants={listAnimations}
                      initial="hidden"
                      animate="visible"
                    >
                      {participants.map((participant) => (
                        <motion.li
                          key={participant.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                          variants={itemAnimations}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                                <AvatarImage src={participant.avatar} />
                                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {participant.status === 'online' && (
                                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{participant.name}</span>
                                {participant.isHost && (
                                  <Badge variant="secondary" className="text-xs">Host</Badge>
                                )}
                                {participant.isMuted && (
                                  <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                                    Muted
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Music size={12} className="mr-1" />
                                {participant.instrument}
                              </div>
                            </div>
                          </div>

                          {isAdmin && !participant.isHost && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => toggleUserChatMute(participant.id)}
                                title={participant.isMuted ? "Unmute user" : "Mute user"}
                              >
                                {participant.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => removeUser(participant.id)}
                                title="Remove user"
                              >
                                <UserMinus size={16} />
                              </Button>
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>

                    {participants.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No participants yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>

      </div>

      <style>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .typing-indicator .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          animation: bounce 1.4s infinite ease-in-out;
        }
        
        .typing-indicator .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          }
          40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </AppLayout>
  );
};

export default MusicRoom;