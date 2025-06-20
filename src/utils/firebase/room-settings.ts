
import { getFirestore, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

/**
 * Toggle chat functionality in a room
 * @param roomId Room ID
 * @param disabled Whether chat should be disabled
 */
export const toggleRoomChat = async (roomId: string, disabled: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    await updateDoc(roomRef, {
      isChatDisabled: disabled,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling room chat:', error);
    throw error;
  }
};

/**
 * Toggle auto-close after inactivity for a room
 * @param roomId Room ID
 * @param enabled Whether auto-close should be enabled
 * @param timeout Timeout in minutes before auto-close
 */
export const toggleAutoCloseRoom = async (
  roomId: string, 
  enabled: boolean, 
  timeout: number = 5
): Promise<void> => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    await updateDoc(roomRef, {
      autoCloseAfterInactivity: enabled,
      inactivityTimeout: timeout,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling auto-close:', error);
    throw error;
  }
};

/**
 * Update room settings
 * @param roomId Room ID
 * @param settings Settings object to update
 */
export const updateRoomSettings = async (
  roomId: string,
  settings: any
): Promise<void> => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    
    // Check if room exists before updating
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      console.warn('Room does not exist, skipping settings update');
      return;
    }
    
    await updateDoc(roomRef, {
      ...settings,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating room settings:', error);
    throw error;
  }
};

/**
 * Handle join request for a room
 * @param roomId Room ID
 * @param userId User ID requesting to join
 * @param approve Whether to approve the join request
 */
export const handleJoinRequest = async (
  roomId: string,
  userId: string,
  approve: boolean
): Promise<void> => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    
    // Get current room data
    const roomDoc = await getDoc(roomRef);
    if (!roomDoc.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomDoc.data();
    const currentParticipants = roomData.participants || [];
    const currentPendingRequests = roomData.pendingRequests || [];
    
    if (approve) {
      // Add user to participants
      const newParticipant = { 
        id: userId, 
        name: 'Anonymous',
        instrument: 'piano',
        avatar: '',
        isHost: false,
        status: 'active',
        muted: false
      };
      
      const updatedParticipants = [...currentParticipants, newParticipant];
      const updatedParticipantIds = [...(roomData.participantIds || []), userId];
      
      // Remove from pending requests
      const updatedPendingRequests = currentPendingRequests.filter((reqUserId: string) => reqUserId !== userId);
      
      await updateDoc(roomRef, {
        participants: updatedParticipants,
        participantIds: updatedParticipantIds,
        pendingRequests: updatedPendingRequests,
        lastActivity: new Date().toISOString()
      });
    } else {
      // Remove from pending requests only
      const updatedPendingRequests = currentPendingRequests.filter((reqUserId: string) => reqUserId !== userId);
      
      await updateDoc(roomRef, {
        pendingRequests: updatedPendingRequests,
        lastActivity: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error handling join request:', error);
    throw error;
  }
};

/**
 * Broadcast instrument note to room
 * @param roomId Room ID
 * @param noteData Note data to broadcast
 */
export const broadcastNote = async (roomId: string, noteData: any): Promise<void> => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    await updateDoc(roomRef, {
      currentNote: noteData,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error broadcasting note:', error);
    throw error;
  }
};

/**
 * Listen for instrument notes being played
 * @param roomId Room ID
 * @param callback Callback function for note events
 * @param errorCallback Error callback function
 */
export const listenToInstrumentNotes = (
  roomId: string,
  callback: (noteData: any) => void,
  errorCallback: (error: any) => void
): (() => void) => {
  try {
    const roomRef = doc(db, 'musicRooms', roomId);
    return onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data.currentNote) {
        callback(data.currentNote);
      }
    }, errorCallback);
  } catch (error) {
    console.error('Error listening to instrument notes:', error);
    errorCallback(error);
    return () => {}; // Return empty function as fallback
  }
};
