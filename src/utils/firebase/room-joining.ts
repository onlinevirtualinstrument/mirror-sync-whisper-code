
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

export const joinRoomWithCode = async (roomId: string, user: any, joinCode?: string): Promise<boolean> => {
  try {
    console.log('joinRoomWithCode: Starting for user:', user.uid, 'room:', roomId);
    
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      console.log('joinRoomWithCode: Room does not exist');
      toast({ description: "Room no longer exists." });
      return false;
    }
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    const participantIds = roomData.participantIds || [];
    
    // Check if user is already a participant
    if (participantIds.includes(user.uid)) {
      console.log("joinRoomWithCode: User is already a participant");
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
        if (joinCode && roomData.joinCode === joinCode) {
          console.log('joinRoomWithCode: Join code is correct');
        } else {
          toast({ description: "You need approval or correct join code to join this private room." });
          return false;
        }
      }
      
      // Remove from pending requests if approved
      if (isApproved) {
        await updateDoc(roomRef, {
          pendingRequests: arrayRemove(user.uid)
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
    
    console.log("joinRoomWithCode: Successfully added user to room");
    toast({ description: "Successfully joined room!" });
    return true;
  } catch (error) {
    console.error("Error joining room with code:", error);
    toast({ description: "Failed to join room. Please try again." });
    return false;
  }
};

export const requestToJoinRoom = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      toast({ description: "Room not found." });
      return false;
    }
    
    const roomData = roomSnap.data();
    const pendingRequests = roomData.pendingRequests || [];
    
    if (pendingRequests.includes(userId)) {
      toast({ description: "Join request already sent." });
      return false;
    }
    
    await updateDoc(roomRef, {
      pendingRequests: [...pendingRequests, userId],
      lastActivity: new Date().toISOString()
    });
    
    toast({ description: "Join request sent to host." });
    return true;
  } catch (error) {
    console.error("Error requesting to join room:", error);
    toast({ description: "Failed to send join request." });
    return false;
  }
};
