
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

export const handleJoinRequest = async (roomId: string, userId: string, approve: boolean): Promise<void> => {
  try {
    console.log(`handleJoinRequest: ${approve ? 'Approving' : 'Denying'} user ${userId} for room ${roomId}`);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('handleJoinRequest: Room does not exist');
      toast({ description: "Room no longer exists." });
      return;
    }
    
    const roomData = roomSnap.data();
    const pendingRequests = roomData.pendingRequests || [];
    
    if (!pendingRequests.includes(userId)) {
      console.log('handleJoinRequest: User not in pending requests');
      toast({ description: "No pending request found for this user." });
      return;
    }
    
    // Remove from pending requests
    const updateData: any = {
      pendingRequests: arrayRemove(userId),
      lastActivity: new Date().toISOString()
    };
    
    if (approve) {
      // Get user data to create participant object
      let userData: any = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      } catch (error) {
        console.log('handleJoinRequest: Could not fetch user data, using defaults');
      }
      
      // Check room capacity
      const currentParticipants = roomData.participants || [];
      const maxParticipants = roomData.maxParticipants || 10;
      
      if (currentParticipants.length >= maxParticipants) {
        toast({ description: "Room is full. Cannot approve join request." });
        return;
      }
      
      // Create new participant
      const now = new Date().toISOString();
      const newParticipant = {
        id: userId,
        name: userData?.displayName || userData?.name || 'User',
        instrument: roomData.allowDifferentInstruments ? 'piano' : (roomData.hostInstrument || 'piano'),
        avatar: userData?.photoURL || userData?.avatar || '',
        isHost: false,
        status: 'active',
        muted: false,
        joinedAt: now,
        lastSeen: now,
        isInRoom: true,
        heartbeatTimestamp: Date.now()
      };
      
      // Add to participants
      updateData.participants = arrayUnion(newParticipant);
      updateData.participantIds = arrayUnion(userId);
      
      console.log('handleJoinRequest: Adding approved user to participants');
    }
    
    await updateDoc(roomRef, updateData);
    
    toast({ 
      description: approve 
        ? "User has been approved and added to the room" 
        : "Join request has been denied" 
    });
    
    console.log(`handleJoinRequest: Successfully ${approve ? 'approved' : 'denied'} user ${userId}`);
  } catch (error) {
    console.error("handleJoinRequest: Error handling join request:", error);
    toast({ 
      description: "Failed to process join request. Please try again." 
    });
    throw error;
  }
};

export const toggleRoomChat = async (roomId: string, disabled: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, {
      isChatDisabled: disabled,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error toggling room chat:", error);
    toast({ description: "Failed to update chat settings." });
    throw error;
  }
};

export const toggleAutoCloseRoom = async (roomId: string, enabled: boolean, timeout: number = 2): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, {
      autoCloseAfterInactivity: enabled,
      inactivityTimeout: enabled ? timeout : 10, // 10 minutes default when disabled
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error toggling auto-close:", error);
    toast({ description: "Failed to update auto-close settings." });
    throw error;
  }
};

export const updateRoomSettings = async (roomId: string, settings: any): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, {
      ...settings,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating room settings:", error);
    toast({ description: "Failed to update room settings." });
    throw error;
  }
};
