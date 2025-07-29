
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  limit,
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from './config';

// Use consistent collection name 'musicRooms' across all room operations
const ROOMS_COLLECTION = 'musicRooms';

interface RoomData {
  id: string;
  name: string;
  createdAt?: any;
  lastActivity?: any;
  participants: any[];
  participantIds: string[];
  isActive: boolean;
  [key: string]: any;
}

// Save room to Firestore
export const saveRoomToFirestore = async (roomData: any): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomData.id);
    await setDoc(roomRef, {
      ...roomData,
      isActive: true,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    console.log('Room saved to Firestore successfully');
  } catch (error) {
    console.error('Error saving room to Firestore:', error);
    throw error;
  }
};

// Listen to live rooms - simplified query without orderBy to avoid index requirement
export const listenToLiveRooms = (
  onRooms: (rooms: RoomData[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const roomsQuery = query(
      roomsRef,
      where('isActive', '==', true),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      roomsQuery,
      (snapshot) => {
        const rooms = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          } as RoomData;
        });
        
        // Sort on client side to avoid index requirement
        rooms.sort((a: RoomData, b: RoomData) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime();
        });
        onRooms(rooms);
      },
      (error) => {
        console.error('Error listening to rooms:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up rooms listener:', error);
    onError(error as Error);
    return () => {};
  }
};

// Add user to room - improved version with better error handling
export const addUserToRoom = async (roomId: string, user: any): Promise<boolean> => {
  try {
    console.log(`addUserToRoom: Attempting to add user ${user.uid} to room ${roomId}`);
    
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      console.error('addUserToRoom: Room does not exist in collection:', ROOMS_COLLECTION);
      return false;
    }

    const roomData = roomDoc.data();
    console.log('addUserToRoom: Room data retrieved:', roomData.name);
    
    const participantIds = roomData.participantIds || [];
    const participants = roomData.participants || [];
    
    // Check if user is already a participant
    if (participantIds.includes(user.uid)) {
      console.log('addUserToRoom: User is already a participant in the room');
      return true;
    }

    // Check room capacity
    const maxParticipants = roomData.maxParticipants || 10;
    if (participantIds.length >= maxParticipants) {
      console.error('addUserToRoom: Room is at maximum capacity');
      return false;
    }

    // Check if room is private and user has permission
    if (!roomData.isPublic && roomData.hostId !== user.uid) {
      const pendingRequests = roomData.pendingRequests || [];
      if (!pendingRequests.includes(user.uid) && !user.joinCode) {
        console.error('addUserToRoom: User does not have permission to join private room');
        return false;
      }
    }

    const newParticipant = {
      id: user.uid,
      name: user.displayName || user.email || 'Anonymous',
      instrument: roomData.allowDifferentInstruments ? 'piano' : (roomData.hostInstrument || 'piano'),
      avatar: user.photoURL || '',
      isHost: roomData.hostId === user.uid,
      status: 'active',
      muted: false,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isInRoom: true,
      heartbeatTimestamp: Date.now()
    };

    // Add user to room
    await updateDoc(roomRef, {
      participantIds: arrayUnion(user.uid),
      participants: arrayUnion(newParticipant),
      lastActivity: serverTimestamp(),
      // Remove from pending requests if they were there
      pendingRequests: arrayRemove(user.uid)
    });

    console.log('addUserToRoom: User successfully added to room');
    return true;
  } catch (error) {
    console.error('addUserToRoom: Error adding user to room:', error);
    return false;
  }
};

// Remove user from room (safe version)
export const removeUserFromRoomSafe = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      console.error('Room does not exist');
      return;
    }

    const roomData = roomDoc.data();
    const participants = roomData.participants || [];
    const updatedParticipants = participants.filter((p: any) => p.id !== userId);

    await updateDoc(roomRef, {
      participantIds: arrayRemove(userId),
      participants: updatedParticipants,
      lastActivity: serverTimestamp()
    });

    console.log('User removed from room successfully');
  } catch (error) {
    console.error('Error removing user from room:', error);
    throw error;
  }
};

// Remove user from room (regular version)
export const removeUserFromRoom = async (roomId: string, userId: string): Promise<void> => {
  return removeUserFromRoomSafe(roomId, userId);
};

// Update user instrument (safe version)
export const updateUserInstrumentSafe = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      console.error('Room does not exist');
      return;
    }

    const roomData = roomDoc.data();
    const participants = roomData.participants || [];
    const updatedParticipants = participants.map((p: any) => 
      p.id === userId ? { ...p, instrument } : p
    );

    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: serverTimestamp()
    });

    console.log('User instrument updated successfully');
  } catch (error) {
    console.error('Error updating user instrument:', error);
    throw error;
  }
};

// Update user instrument (regular version)
export const updateUserInstrument = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  return updateUserInstrumentSafe(roomId, userId, instrument);
};

// Toggle user mute (safe version)
export const toggleUserMuteSafe = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      console.error('Room does not exist');
      return;
    }

    const roomData = roomDoc.data();
    const participants = roomData.participants || [];
    const updatedParticipants = participants.map((p: any) => 
      p.id === userId ? { ...p, isMuted: mute } : p
    );

    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: serverTimestamp()
    });

    console.log('User mute status updated successfully');
  } catch (error) {
    console.error('Error updating user mute status:', error);
    throw error;
  }
};

// Toggle user mute (regular version)
export const toggleUserMute = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  return toggleUserMuteSafe(roomId, userId, mute);
};

// Update room settings
export const updateRoomSettings = async (roomId: string, settings: any): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      ...settings,
      lastActivity: serverTimestamp()
    });
    console.log('Room settings updated successfully');
  } catch (error) {
    console.error('Error updating room settings:', error);
    throw error;
  }
};

// Toggle room chat
export const toggleRoomChat = async (roomId: string, disabled: boolean): Promise<void> => {
  try {
    await updateRoomSettings(roomId, { isChatDisabled: disabled });
  } catch (error) {
    console.error('Error toggling room chat:', error);
    throw error;
  }
};

// Toggle auto close room
export const toggleAutoCloseRoom = async (roomId: string, enabled: boolean, timeout?: number): Promise<void> => {
  try {
    await updateRoomSettings(roomId, { 
      autoClose: enabled,
      autoCloseTimeout: timeout || 5
    });
  } catch (error) {
    console.error('Error toggling auto close room:', error);
    throw error;
  }
};

// Handle join request
export const handleJoinRequest = async (roomId: string, userId: string, approve: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    if (approve) {
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId),
        participantIds: arrayUnion(userId),
        lastActivity: serverTimestamp()
      });
    } else {
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId),
        lastActivity: serverTimestamp()
      });
    }
    
    console.log('Join request handled successfully');
  } catch (error) {
    console.error('Error handling join request:', error);
    throw error;
  }
};

// Delete room from Firestore
export const deleteRoomFromFirestore = async (roomId: string): Promise<void> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await deleteDoc(roomRef);
    console.log('Room deleted successfully');
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Listen to room data
export const listenToRoomData = (
  roomId: string,
  onRoom: (room: any) => void,
  onError: (error: Error) => void
): (() => void) => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);

    const unsubscribe = onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) {
          onRoom({ id: doc.id, ...doc.data() });
        } else {
          console.error('listenToRoomData: Room not found in collection:', ROOMS_COLLECTION);
          onError(new Error('Room not found'));
        }
      },
      (error) => {
        console.error('Error listening to room data:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up room data listener:', error);
    onError(error as Error);
    return () => {};
  }
};
