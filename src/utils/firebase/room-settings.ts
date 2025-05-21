
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

/**
 * Toggle chat functionality in a room
 * @param roomId Room ID
 * @param disabled Whether chat should be disabled
 */
export const toggleRoomChat = async (roomId: string, disabled: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      isChatDisabled: disabled,
      lastUpdated: new Date().toISOString()
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
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      autoCloseAfterInactivity: enabled,
      inactivityTimeout: timeout,
      lastActivity: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
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
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...settings,
      lastUpdated: new Date().toISOString()
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
    const roomRef = doc(db, 'rooms', roomId);
    
    if (approve) {
      // Add user to participants
      // You'd typically need to get user data from users collection first
      // For simplicity, we'll just add user ID
      await updateDoc(roomRef, {
        participants: [...user.participants, { id: userId, joinedAt: new Date().toISOString() }],
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Remove from join requests
      await updateDoc(roomRef, {
        joinRequests: user.joinRequests.filter((req: any) => req.userId !== userId),
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error handling join request:', error);
    throw error;
  }
};

/**
 * Request to join a room
 * @param roomId Room ID
 * @param userId User ID requesting to join
 * @param autoApprove Whether to auto-approve based on join code
 */
export const requestToJoinRoom = async (
  roomId: string,
  userId: string,
  autoApprove: boolean = false
): Promise<void> => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    
    if (autoApprove) {
      // Add user directly to participants if auto-approved
      // You'd typically need to get user data from users collection first
      await updateDoc(roomRef, {
        participants: [...user.participants, { 
          id: userId, 
          joinedAt: new Date().toISOString(),
          isHost: false,
          muted: false
        }],
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Add to join requests
      await updateDoc(roomRef, {
        joinRequests: [...user.joinRequests, { 
          userId, 
          requestedAt: new Date().toISOString() 
        }],
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error requesting to join room:', error);
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
    const roomRef = doc(db, 'rooms', roomId);
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
    const roomRef = doc(db, 'rooms', roomId);
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
