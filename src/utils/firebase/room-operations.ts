
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';
import { deleteRoomFromFirestore } from './rooms';

export const removeUserFromRoomSafe = async (roomId: string, userId: string): Promise<void> => {
  try {
    console.log(`removeUserFromRoomSafe: Removing user ${userId} from room ${roomId}`);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log("removeUserFromRoomSafe: Room doesn't exist");
      return;
    }
    
    const roomData = roomSnap.data();
    const currentParticipants = Array.isArray(roomData.participants) ? roomData.participants : [];
    const currentParticipantIds = Array.isArray(roomData.participantIds) ? roomData.participantIds : [];
    
    console.log(`removeUserFromRoomSafe: Current participants:`, currentParticipants.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })));
    
    // Find the user to remove
    const userToRemove = currentParticipants.find((p: any) => p.id === userId);
    if (!userToRemove) {
      console.log("removeUserFromRoomSafe: User not found in participants");
      return;
    }

    // Filter out ONLY the specified user
    const updatedParticipants = currentParticipants.filter((p: any) => p.id !== userId);
    const updatedParticipantIds = currentParticipantIds.filter((id: string) => id !== userId);
    
    console.log(`removeUserFromRoomSafe: After removal - ${updatedParticipants.length} participants remain`);

    if (updatedParticipants.length === 0) {
      console.log("removeUserFromRoomSafe: Room is empty, deleting room");
      await deleteRoomFromFirestore(roomId);
      return;
    }

    // Prepare update data
    let updateData: any = {
      participants: updatedParticipants,
      participantIds: updatedParticipantIds,
      lastActivity: new Date().toISOString()
    };

    // Handle host transfer if the removed user was the host
    if (userToRemove.isHost && updatedParticipants.length > 0) {
      // Find the next suitable host (prefer someone who was there longer)
      const newHost = updatedParticipants.sort((a: any, b: any) => {
        const joinTimeA = new Date(a.joinedAt || 0).getTime();
        const joinTimeB = new Date(b.joinedAt || 0).getTime();
        return joinTimeA - joinTimeB;
      })[0];
      
      // Update the new host in the participants array
      const updatedParticipantsWithNewHost = updatedParticipants.map((p: any) => {
        if (p.id === newHost.id) {
          return { ...p, isHost: true };
        }
        return { ...p, isHost: false };
      });
      
      updateData.hostId = newHost.id;
      updateData.participants = updatedParticipantsWithNewHost;
      
      console.log(`removeUserFromRoomSafe: Transferring host to ${newHost.id} (${newHost.name})`);
    }

    await updateDoc(roomRef, updateData);
    console.log(`removeUserFromRoomSafe: Successfully removed user ${userId}`);

  } catch (error) {
    console.error("removeUserFromRoomSafe: Error removing user:", error);
    throw error;
  }
};

export const updateUserInstrumentSafe = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    console.log(`updateUserInstrumentSafe: Updating instrument for user ${userId} to ${instrument}`);
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('updateUserInstrumentSafe: Room does not exist');
      return;
    }
    
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
    console.error("updateUserInstrumentSafe: Error updating instrument:", error);
    throw error;
  }
};

export const toggleUserMuteSafe = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  try {
    console.log(`toggleUserMuteSafe: ${mute ? 'Muting' : 'Unmuting'} user ${userId}`);
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('toggleUserMuteSafe: Room does not exist');
      return;
    }
    
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
    console.error("toggleUserMuteSafe: Error updating mute status:", error);
    throw error;
  }
};
