
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';
import { deleteRoomFromFirestore } from './rooms';

export const isUserRoomParticipant = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      const participantIds = roomData.participantIds || [];
      return participantIds.includes(userId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking room participation:", error);
    return false;
  }
};

export const updateUserInstrument = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    const updatedParticipants = participants.map((p: any) => {
      if (p.id === userId) {
        return { ...p, instrument };
      }
      return p;
    });
    
    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating instrument:", error);
    throw error;
  }
};

export const toggleUserMute = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    const updatedParticipants = participants.map((p: any) => {
      if (p.id === userId) {
        return { ...p, muted: mute };
      }
      return p;
    });
    
    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating mute status:", error);
    throw error;
  }
};

export const removeUserFromRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    console.log(`removeUserFromRoom: Removing user ${userId} from room ${roomId}`);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log("removeUserFromRoom: Room doesn't exist");
      return;
    }
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    const participantIds = roomData.participantIds || [];
    
    // Find user in participants
    const userIndex = participants.findIndex((p: any) => p.id === userId);
    const isUserParticipant = participantIds.includes(userId);
    
    if (!isUserParticipant || userIndex === -1) {
      console.log("removeUserFromRoom: User not found in participants");
      return;
    }
    
    const userToRemove = participants[userIndex];
    const isHost = userToRemove.isHost;
    
    // Remove user from both arrays
    const updatedParticipants = participants.filter((p: any) => p.id !== userId);
    const updatedParticipantIds = participantIds.filter((id: string) => id !== userId);
    
    console.log(`removeUserFromRoom: Participants count - before: ${participants.length}, after: ${updatedParticipants.length}`);
    
    if (updatedParticipants.length === 0) {
      // Room is now empty, delete it
      console.log("removeUserFromRoom: Room is empty, deleting");
      await deleteRoomFromFirestore(roomId);
    } else if (isHost && updatedParticipants.length > 0) {
      // Assign new host (first remaining participant)
      const newHost = updatedParticipants[0];
      newHost.isHost = true;
      
      console.log(`removeUserFromRoom: Assigning new host: ${newHost.id}`);
      
      await updateDoc(roomRef, {
        participants: updatedParticipants,
        participantIds: updatedParticipantIds,
        hostId: newHost.id,
        lastActivity: new Date().toISOString()
      });
    } else {
      // Regular participant leaving
      console.log("removeUserFromRoom: Regular participant leaving");
      await updateDoc(roomRef, {
        participants: updatedParticipants,
        participantIds: updatedParticipantIds,
        lastActivity: new Date().toISOString()
      });
    }
    
    console.log("removeUserFromRoom: Successfully removed user from room");
  } catch (error) {
    console.error("Error removing user from room:", error);
    throw error;
  }
};

export const addUserToRoom = async (roomId: string, user: any): Promise<boolean> => {
  try {
    console.log('addUserToRoom: Starting for user:', user.uid, 'room:', roomId);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('addUserToRoom: Room does not exist');
      toast({ description: "Room no longer exists." });
      return false;
    }
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    const participantIds = roomData.participantIds || [];
    
    // Check if user is already a participant
    if (participantIds.includes(user.uid)) {
      console.log("addUserToRoom: User is already a participant");
      return true;
    }
    
    // Check if room is full
    if (participants.length >= (roomData.maxParticipants || 10)) {
      toast({ description: "Room is full." });
      return false;
    }
    
    // For private rooms, handle join permissions
    if (!roomData.isPublic) {
      const isHost = roomData.hostId === user.uid;
      const pendingRequests = roomData.pendingRequests || [];
      const isApproved = pendingRequests.includes(user.uid);
      
      if (!isHost && !isApproved) {
        // Check if user has correct join code
        if (user.joinCode && roomData.joinCode === user.joinCode) {
          console.log('addUserToRoom: Join code is correct');
        } else {
          toast({ description: "You need approval or correct join code to join this private room." });
          return false;
        }
      }
      
      // Remove from pending requests if approved
      if (isApproved) {
        await updateDoc(roomRef, {
          pendingRequests: roomData.pendingRequests.filter((id: string) => id !== user.uid)
        });
      }
    }
    
    // Create new participant object
    const newParticipant = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      instrument: roomData.allowDifferentInstruments ? 'piano' : (roomData.hostInstrument || 'piano'),
      avatar: user.photoURL || '',
      isHost: roomData.hostId === user.uid,
      status: 'active',
      muted: false
    };
    
    // Update both arrays atomically
    await updateDoc(roomRef, {
      participants: [...participants, newParticipant],
      participantIds: [...participantIds, user.uid],
      lastActivity: new Date().toISOString()
    });
    
    console.log("addUserToRoom: Successfully added user to room");
    toast({ description: "Successfully joined room!" });
    return true;
  } catch (error) {
    console.error("Error adding user to room:", error);
    toast({ description: "Failed to join room. Please try again." });
    return false;
  }
};
