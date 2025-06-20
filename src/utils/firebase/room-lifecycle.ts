
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

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
