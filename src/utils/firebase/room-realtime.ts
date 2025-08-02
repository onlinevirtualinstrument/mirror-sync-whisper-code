import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  query,
  orderBy,
  limit,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';

export interface RoomMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Timestamp;
  type: 'text' | 'system' | 'instrument' | 'gamemode';
}

export interface RoomParticipant {
  userId: string;
  username: string;
  joinedAt: Timestamp;
  lastActive: Timestamp;
  role: 'admin' | 'member';
  instrument?: string;
  gameMode?: string;
  status: 'active' | 'idle' | 'disconnected';
}

export interface RoomActivity {
  id: string;
  userId: string;
  username: string;
  action: 'joined' | 'left' | 'played_note' | 'changed_instrument' | 'started_game' | 'ended_game';
  details?: any;
  timestamp: Timestamp;
}

export interface RealTimeRoomData {
  participants: Record<string, RoomParticipant>;
  messages: RoomMessage[];
  activities: RoomActivity[];
  gameSession?: {
    isActive: boolean;
    mode: string;
    startedBy: string;
    startedAt: Timestamp;
    participants: string[];
    settings: any;
  };
  voiceChat: {
    enabled: boolean;
    participants: string[];
    adminOnly: boolean;
  };
}

// Subscribe to real-time room updates
export const subscribeToRoomRealTime = (
  roomId: string, 
  callback: (data: Partial<RealTimeRoomData>) => void
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as RealTimeRoomData);
    }
  }, (error) => {
    console.error('Error subscribing to room real-time data:', error);
  });
};

// Add participant to room
export const addParticipantToRoom = async (
  roomId: string, 
  participant: Omit<RoomParticipant, 'joinedAt' | 'lastActive'>
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  const participantData: RoomParticipant = {
    ...participant,
    joinedAt: Timestamp.now(),
    lastActive: Timestamp.now()
  };

  await updateDoc(roomRef, {
    [`participants.${participant.userId}`]: participantData
  });

  // Add activity
  await addRoomActivity(roomId, {
    userId: participant.userId,
    username: participant.username,
    action: 'joined',
    timestamp: Timestamp.now()
  });
};

// Remove participant from room
export const removeParticipantFromRoom = async (roomId: string, userId: string, username: string) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  await updateDoc(roomRef, {
    [`participants.${userId}`]: null
  });

  // Add activity
  await addRoomActivity(roomId, {
    userId,
    username,
    action: 'left',
    timestamp: Timestamp.now()
  });
};

// Update participant activity
export const updateParticipantActivity = async (
  roomId: string, 
  userId: string, 
  updates: Partial<RoomParticipant>
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  const updateData: any = {};
  Object.keys(updates).forEach(key => {
    updateData[`participants.${userId}.${key}`] = updates[key as keyof RoomParticipant];
  });
  
  updateData[`participants.${userId}.lastActive`] = Timestamp.now();

  await updateDoc(roomRef, updateData);
};

// Send message to room
export const sendMessageToRoom = async (roomId: string, message: Omit<RoomMessage, 'id' | 'timestamp'>) => {
  const messageData: RoomMessage = {
    id: Date.now().toString(),
    ...message,
    timestamp: Timestamp.now()
  };

  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  await updateDoc(roomRef, {
    messages: arrayUnion(messageData)
  });
};

// Add room activity
export const addRoomActivity = async (roomId: string, activity: Omit<RoomActivity, 'id'>) => {
  const activityData: RoomActivity = {
    id: Date.now().toString(),
    ...activity
  };

  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  await updateDoc(roomRef, {
    activities: arrayUnion(activityData)
  });
};

// Start game session
export const startGameSession = async (
  roomId: string, 
  gameData: {
    mode: string;
    startedBy: string;
    participants: string[];
    settings: any;
  }
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  await updateDoc(roomRef, {
    gameSession: {
      isActive: true,
      startedAt: Timestamp.now(),
      ...gameData
    }
  });

  // Add activity
  await addRoomActivity(roomId, {
    userId: gameData.startedBy,
    username: 'User',
    action: 'started_game',
    details: { mode: gameData.mode },
    timestamp: Timestamp.now()
  });
};

// End game session
export const endGameSession = async (roomId: string, endedBy: string) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  await updateDoc(roomRef, {
    'gameSession.isActive': false
  });

  // Add activity
  await addRoomActivity(roomId, {
    userId: endedBy,
    username: 'User',
    action: 'ended_game',
    timestamp: Timestamp.now()
  });
};

// Update voice chat settings
export const updateVoiceChatSettings = async (
  roomId: string, 
  settings: {
    enabled?: boolean;
    adminOnly?: boolean;
    participants?: string[];
  }
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  const updateData: any = {};
  Object.keys(settings).forEach(key => {
    updateData[`voiceChat.${key}`] = settings[key as keyof typeof settings];
  });

  await updateDoc(roomRef, updateData);
};

// Initialize room real-time data
export const initializeRoomRealTime = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  const initialData: RealTimeRoomData = {
    participants: {},
    messages: [],
    activities: [],
    voiceChat: {
      enabled: true,
      participants: [],
      adminOnly: false
    }
  };

  await setDoc(roomRef, initialData);
};

// Clean up old messages and activities (keep last 100 of each)
export const cleanupRoomData = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  // This would need to be implemented with cloud functions for efficiency
  // For now, we'll just keep it simple and rely on client-side cleanup
  console.log('Room cleanup scheduled for:', roomId);
};

// Subscribe to room participants only
export const subscribeToRoomParticipants = (
  roomId: string,
  callback: (participants: Record<string, RoomParticipant>) => void
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as RealTimeRoomData;
      callback(data.participants || {});
    }
  });
};

// Subscribe to room messages only
export const subscribeToRoomMessages = (
  roomId: string,
  callback: (messages: RoomMessage[]) => void
) => {
  const roomRef = doc(db, 'rooms', roomId, 'realtime', 'data');
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as RealTimeRoomData;
      callback(data.messages || []);
    }
  });
};

export default {
  subscribeToRoomRealTime,
  addParticipantToRoom,
  removeParticipantFromRoom,
  updateParticipantActivity,
  sendMessageToRoom,
  addRoomActivity,
  startGameSession,
  endGameSession,
  updateVoiceChatSettings,
  initializeRoomRealTime,
  cleanupRoomData,
  subscribeToRoomParticipants,
  subscribeToRoomMessages
};
