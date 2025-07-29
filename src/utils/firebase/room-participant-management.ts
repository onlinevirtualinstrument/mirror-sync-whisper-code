
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';
import { deleteRoomFromFirestore } from './rooms';

export const isUserRoomParticipant = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    console.log(`isUserRoomParticipant: Checking if user ${userId} is participant in room ${roomId}`);
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      const participantIds = roomData.participantIds || [];
      const isParticipant = participantIds.includes(userId);
      console.log(`isUserRoomParticipant: User ${userId} is participant: ${isParticipant}`);
      return isParticipant;
    }
    
    console.log(`isUserRoomParticipant: Room ${roomId} does not exist`);
    return false;
  } catch (error) {
    console.error("isUserRoomParticipant: Error checking room participation:", error);
    return false;
  }
};

export const updateUserInstrument = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    console.log(`updateUserInstrument: Updating instrument for user ${userId} in room ${roomId} to ${instrument}`);
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('updateUserInstrument: Room does not exist');
      return;
    }
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    const updatedParticipants = participants.map((p: any) => {
      if (p.id === userId) {
        console.log(`updateUserInstrument: Updated instrument for user ${userId}`);
        return { ...p, instrument };
      }
      return p;
    });
    
    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("updateUserInstrument: Error updating instrument:", error);
    throw error;
  }
};

export const toggleUserMute = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  try {
    console.log(`toggleUserMute: ${mute ? 'Muting' : 'Unmuting'} user ${userId} in room ${roomId}`);
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('toggleUserMute: Room does not exist');
      return;
    }
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    const updatedParticipants = participants.map((p: any) => {
      if (p.id === userId) {
        console.log(`toggleUserMute: Updated mute status for user ${userId} to ${mute}`);
        return { ...p, muted: mute };
      }
      return p;
    });
    
    await updateDoc(roomRef, {
      participants: updatedParticipants,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error("toggleUserMute: Error updating mute status:", error);
    throw error;
  }
};

export const removeUserFromRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    console.log(`removeUserFromRoom: Removing ONLY user ${userId} from room ${roomId}`);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log("removeUserFromRoom: Room doesn't exist");
      return;
    }
    
    const roomData = roomSnap.data();
    const currentParticipants = Array.isArray(roomData.participants) ? roomData.participants : [];
    const currentParticipantIds = Array.isArray(roomData.participantIds) ? roomData.participantIds : [];
    
    console.log(`removeUserFromRoom: Current participants before removal:`, currentParticipants.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })));
    
    // Find the user to remove
    const userToRemove = currentParticipants.find((p: any) => p.id === userId);
    if (!userToRemove) {
      console.log("removeUserFromRoom: User not found in participants");
      return;
    }

    // Remove ONLY the specified user from arrays
    const updatedParticipants = currentParticipants.filter((p: any) => p.id !== userId);
    const updatedParticipantIds = currentParticipantIds.filter((id: string) => id !== userId);
    
    console.log(`removeUserFromRoom: After filtering - Participants count: ${currentParticipants.length} -> ${updatedParticipants.length}`);
    console.log(`removeUserFromRoom: Remaining participants:`, updatedParticipants.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })));
    console.log(`removeUserFromRoom: User being removed - ID: ${userId}, isHost: ${userToRemove.isHost}`);

    if (updatedParticipants.length === 0) {
      // Room is now empty, delete it
      console.log("removeUserFromRoom: Room is empty after removal, deleting room");
      await deleteRoomFromFirestore(roomId);
      return;
    }

    // Handle host transfer if needed
    let updateData: any = {
      participants: updatedParticipants,
      participantIds: updatedParticipantIds,
      lastActivity: new Date().toISOString()
    };

    if (userToRemove.isHost && updatedParticipants.length > 0) {
      // Assign new host to first remaining participant
      const newHost = updatedParticipants[0];
      newHost.isHost = true;
      
      updateData.hostId = newHost.id;
      updateData.participants = updatedParticipants; // Already updated above
      
      console.log(`removeUserFromRoom: Transferring host from ${userId} to ${newHost.id} (${newHost.name})`);
    }

    console.log(`removeUserFromRoom: Updating room with data:`, {
      participantCount: updateData.participants.length,
      participantIds: updateData.participantIds,
      newHostId: updateData.hostId
    });

    await updateDoc(roomRef, updateData);
    console.log(`removeUserFromRoom: Successfully removed user ${userId} from room ${roomId}`);

  } catch (error) {
    console.error("removeUserFromRoom: Error removing user from room:", error);
    throw error;
  }
};

export const addUserToRoom = async (roomId: string, user: any): Promise<boolean> => {
  try {
    console.log('addUserToRoom: Starting for user:', user.uid, 'in room:', roomId);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('addUserToRoom: Room does not exist');
      toast({ description: "Room no longer exists." });
      return false;
    }
    
    const roomData = roomSnap.data();
    const currentParticipants = Array.isArray(roomData.participants) ? roomData.participants : [];
    const currentParticipantIds = Array.isArray(roomData.participantIds) ? roomData.participantIds : [];
    
    console.log(`addUserToRoom: Current state - Participants: ${currentParticipants.length}, IDs: ${currentParticipantIds.length}`);
    console.log(`addUserToRoom: Current participant IDs:`, currentParticipantIds);
    
    // Check if user is already a participant
    if (currentParticipantIds.includes(user.uid)) {
      console.log("addUserToRoom: User is already a participant - returning success");
      return true;
    }
    
    // Check if room is full
    if (currentParticipants.length >= (roomData.maxParticipants || 10)) {
      console.log('addUserToRoom: Room is full');
      toast({ description: "Room is full." });
      return false;
    }
    
    // For private rooms, handle join permissions
    if (!roomData.isPublic) {
      console.log('addUserToRoom: Handling private room permissions');
      const isHost = roomData.hostId === user.uid;
      const pendingRequests = Array.isArray(roomData.pendingRequests) ? roomData.pendingRequests : [];
      const isApproved = pendingRequests.includes(user.uid);
      
      console.log(`addUserToRoom: Private room check - isHost: ${isHost}, isApproved: ${isApproved}, hasJoinCode: ${!!user.joinCode}`);
      
      if (!isHost && !isApproved) {
        // Check if user has correct join code
        if (user.joinCode && roomData.joinCode === user.joinCode) {
          console.log('addUserToRoom: Join code is correct, allowing access');
        } else {
          console.log('addUserToRoom: Access denied - no permission or correct join code');
          toast({ description: "You need approval or correct join code to join this private room." });
          return false;
        }
      }
      
      // Remove from pending requests if approved
      if (isApproved) {
        console.log('addUserToRoom: Removing user from pending requests');
        const updatedPendingRequests = pendingRequests.filter((id: string) => id !== user.uid);
        await updateDoc(roomRef, {
          pendingRequests: updatedPendingRequests
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
      muted: false,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isInRoom: true,
      heartbeatTimestamp: Date.now()
    };
    
    console.log(`addUserToRoom: Adding new participant:`, {
      id: newParticipant.id,
      name: newParticipant.name,
      isHost: newParticipant.isHost
    });
    
    // Update both arrays atomically
    const updatedParticipants = [...currentParticipants, newParticipant];
    const updatedParticipantIds = [...currentParticipantIds, user.uid];
    
    console.log(`addUserToRoom: Final update - Participants: ${updatedParticipants.length}, IDs: ${updatedParticipantIds.length}`);
    
    await updateDoc(roomRef, {
      participants: updatedParticipants,
      participantIds: updatedParticipantIds,
      lastActivity: new Date().toISOString()
    });
    
    console.log("addUserToRoom: Successfully added user to room");
    toast({ description: "Successfully joined room!" });
    return true;
  } catch (error) {
    console.error("addUserToRoom: Error adding user to room:", error);
    toast({ description: "Failed to join room. Please try again." });
    return false;
  }
};