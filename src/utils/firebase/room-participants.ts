
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

// Check if user is a participant in a room
export const isUserRoomParticipant = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      
      // Check if user is in participants array
      const participantIds = roomData.participantIds || [];
      const participants = roomData.participants || [];
      
      // Check both participantIds array and participants array to be safe
      return participantIds.includes(userId) || participants.some((p: any) => p.id === userId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking room participation:", error);
    return false;
  }
};

// Add user as a participant to room
export const addUserToRoom = async (roomId: string, user: any): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      toast({ description: "Room no longer exists." });
      return false;
    }
    
    const roomData = roomSnap.data();
    let participants = roomData.participants || [];
    const participantIds = roomData.participantIds || [];
    
    // Check if user is already a participant
    if (participantIds.includes(user.uid)) {
      console.log("User is already a participant of this room");
      return true; // User is already in the room
    }
    
    // Check if room is full
    if (participants.length >= (roomData.maxParticipants || 3)) {
      toast({ description: "Room is full." });
      return false;
    }
    
    // For private rooms, check if user is approved or has join code
    if (!roomData.isPublic) {
      const pendingRequests = roomData.pendingRequests || [];
      const isApproved = pendingRequests.includes(user.uid);
      const isHost = roomData.hostId === user.uid;
      
      // If not approved or host, check if we have a join code match
      if (!isApproved && !isHost && user.joinCode) {
        if (roomData.joinCode !== user.joinCode) {
          toast({ description: "Incorrect join code for this private room." });
          return false;
        }
        // Join code is correct, proceed with joining
      } else if (!isApproved && !isHost) {
        // Neither approved nor has join code
        toast({ description: "You need approval to join this private room." });
        return false;
      }
      
      // Remove from pending requests if approved
      if (isApproved) {
        await updateDoc(roomRef, {
          pendingRequests: arrayRemove(user.uid)
        });
      }
    }
    
    // Add user to participants
    const newParticipant = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      instrument: roomData.allowDifferentInstruments ? 'piano' : roomData.hostInstrument, // Default instrument
      avatar: user.photoURL || '',
      isHost: false,
      status: 'active',
      muted: false
    };
    
    // First update participantIds array (crucial for security rules)
    await updateDoc(roomRef, {
      participantIds: arrayUnion(user.uid),
      lastActivity: new Date().toISOString()
    });
    
    // Then update participants array
    await updateDoc(roomRef, {
      participants: arrayUnion(newParticipant)
    });
    
    console.log("User successfully added to room:", user.uid);
    toast({ description: "Successfully joined room!" });
    return true;
  } catch (error) {
    console.error("Error adding user to room:", error);
    toast({ description: "Failed to join room. Please try again." });
    return false;
  }
};

// Remove user from a room
export const removeUserFromRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    // Find user in participants
    const userIndex = participants.findIndex((p: any) => p.id === userId);
    
    if (userIndex === -1) return; // User not in room
    
    // Check if user is host
    const isHost = participants[userIndex].isHost;
    
    if (isHost && participants.length > 1) {
      // If host is leaving and there are other participants, assign a new host
      const newHost = participants.find((p: any) => p.id !== userId);
      
      if (newHost) {
        // Remove old host
        const updatedParticipants = participants.filter((p: any) => p.id !== userId);
        
        // Update new host status
        const newHostIndex = updatedParticipants.findIndex((p: any) => p.id === newHost.id);
        if (newHostIndex !== -1) {
          updatedParticipants[newHostIndex].isHost = true;
        }
        
        // Update room with new host and without old host
        await updateDoc(roomRef, {
          participants: updatedParticipants,
          participantIds: roomData.participantIds.filter((id: string) => id !== userId),
          lastActivity: new Date().toISOString()
        });
      }
    } else if (isHost) {
      // If host is the only one or last one leaving, delete the room
      await deleteRoomFromFirestore(roomId);
    } else {
      // Regular participant leaving
      const updatedParticipants = participants.filter((p: any) => p.id !== userId);
      
      await updateDoc(roomRef, {
        participants: updatedParticipants,
        participantIds: roomData.participantIds.filter((id: string) => id !== userId),
        lastActivity: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error removing user from room:", error);
    toast({ description: "Failed to leave room properly." });
  }
};

// Update participant's instrument in a room
export const updateUserInstrument = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    // Find and update the user's instrument
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
    
    toast({ description: `Instrument changed to ${instrument}` });
  } catch (error) {
    console.error("Error updating instrument:", error);
    toast({ description: "Failed to update your instrument." });
  }
};

// Mute/unmute a participant
export const toggleUserMute = async (roomId: string, userId: string, mute: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    // Find and update the user's mute status
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
    
    toast({ description: mute ? `User muted` : `User unmuted` });
  } catch (error) {
    console.error("Error updating mute status:", error);
    toast({ description: "Failed to update user mute status." });
  }
};

// Toggle chat for a room
export const toggleRoomChat = async (roomId: string, disable: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, { 
      isChatDisabled: disable,
      lastActivity: new Date().toISOString()
    });
    
    toast({ description: disable ? "Chat disabled for room" : "Chat enabled for room" });
  } catch (error) {
    console.error("Error toggling room chat:", error);
    toast({ description: "Failed to update room chat settings." });
  }
};

// Handle auto-close room functionality
export const toggleAutoCloseRoom = async (roomId: string, enable: boolean, timeout: number = 5): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, { 
      autoCloseAfterInactivity: enable,
      inactivityTimeout: timeout, // in minutes
      lastActivity: new Date().toISOString()
    });
    
    toast({ 
      description: enable 
        ? `Room will auto-close after ${timeout} minutes of inactivity` 
        : "Auto-close disabled for room" 
    });
  } catch (error) {
    console.error("Error toggling auto-close:", error);
    toast({ description: "Failed to update auto-close settings." });
  }
};

// Handle room settings
export const updateRoomSettings = async (roomId: string, settings: any): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await updateDoc(roomRef, { 
      ...settings,
      lastActivity: new Date().toISOString() 
    });
    
    toast({ description: "Room settings updated" });
  } catch (error) {
    console.error("Error updating room settings:", error);
    toast({ description: "Failed to update room settings." });
  }
};

// Handle join request for private rooms
export const handleJoinRequest = async (roomId: string, userId: string, approve: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    
    if (approve) {
      // If approved, first add to participantIds (critical for security rules)
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId),
        participantIds: arrayUnion(userId),
        lastActivity: new Date().toISOString()
      });
      
      // Fetch user data to add to participants
      const userRecord = await getDoc(doc(db, "users", userId));
      let userData: any = { id: userId, name: 'Anonymous', avatar: '' };
      
      if (userRecord.exists()) {
        userData = {
          id: userId,
          name: userRecord.data().displayName || 'Anonymous',
          instrument: 'piano',
          avatar: userRecord.data().photoURL || '',
          isHost: false,
          status: 'active',
          muted: false
        };
      } else {
        // If user record doesn't exist, try to get info from auth
        const authUsers = await getDocs(collection(db, "users"));
        const foundUser = authUsers.docs.find(doc => doc.id === userId);
        if (foundUser) {
          const data = foundUser.data();
          userData = {
            id: userId,
            name: data.displayName || 'Anonymous',
            instrument: 'piano',
            avatar: data.photoURL || '',
            isHost: false,
            status: 'active',
            muted: false
          };
        }
      }
      
      // Then add to participants array
      await updateDoc(roomRef, {
        participants: arrayUnion(userData)
      });
      
      toast({ description: "User approved to join the room" });
    } else {
      // If rejected, just remove from pendingRequests
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId),
        lastActivity: new Date().toISOString()
      });
      
      toast({ description: "User rejected from joining the room" });
    }
  } catch (error) {
    console.error("Error handling join request:", error);
    toast({ description: "Failed to process join request." });
  }
};

// Request to join a private room
export const requestToJoinRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      toast({ description: "Room no longer exists." });
      return;
    }
    
    const roomData = roomSnap.data();
    
    // Check if already a participant
    if (roomData.participantIds.includes(userId)) {
      toast({ description: "You're already in this room." });
      return;
    }
    
    // Check if already in pending requests
    if (roomData.pendingRequests.includes(userId)) {
      toast({ description: "Your request is already pending." });
      return;
    }
    
    await updateDoc(roomRef, {
      pendingRequests: arrayUnion(userId),
      lastActivity: new Date().toISOString()
    });
    
    toast({ description: "Join request sent. Waiting for approval." });
  } catch (error) {
    console.error("Error requesting to join room:", error);
    toast({ description: "Failed to send join request." });
  }
};

// Import needed for completion of function imported and used in room-participants.ts
import { deleteRoomFromFirestore } from './rooms';
import { collection, getDocs } from 'firebase/firestore';
