
import { collection, addDoc, query, where, doc, setDoc, getDoc, onSnapshot, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, getDocs } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

// Save or update a room
export const saveRoomToFirestore = async (room: any): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", room.id);
    // Ensure participants and participantIds are properly synchronized
    // This is crucial for the security rules to work correctly
    const participantIds = room.participants ? room.participants.map((p: any) => p.id) : [];
    
    // Create join code for private rooms if needed
    if (!room.isPublic && !room.joinCode) {
      room.joinCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    await setDoc(roomRef, {
      ...room,
      participants: room.participants || [],
      maxParticipants: room.maxParticipants || 3,
      hostInstrument: room.hostInstrument || 'piano',
      createdAt: room.createdAt || serverTimestamp(),
      allowDifferentInstruments: room.allowDifferentInstruments ?? true,
      participantIds: participantIds, // Make sure this is properly synced with participants
      lastUpdated: serverTimestamp(), // Add this field to track when the room was last updated
      lastActivity: room.lastActivity || serverTimestamp()
    });

  } catch (error) {
    console.error("Failed to save room:", error);
    toast({ description: "Failed to save room. Please try again." });
    throw error; // so calling function can handle it
  }
};

// Listen to all live rooms
export const listenToLiveRooms = (
  onSuccess: (rooms: any[]) => void,
  onError?: (error: any) => void
) => {
  return onSnapshot(
    collection(db, "musicRooms"),
    (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date(),
        participants: doc.data().participants || [],
        pendingRequests: doc.data().pendingRequests || [],
        participantIds: doc.data().participantIds || []
      }));
      onSuccess(rooms);
    },
    (error) => {
      console.error("🔥 Firestore listener error:", error);
      if (onError) onError(error);
    }
  );
};

// Get room data and listen for updates
export const listenToRoomData = (
  roomId: string,
  onSuccess: (room: any) => void,
  onError?: (error: any) => void
) => {
  const roomRef = doc(db, "musicRooms", roomId);
  
  return onSnapshot(
    roomRef,
    (doc) => {
      if (doc.exists()) {
        const roomData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date(),
          participants: doc.data().participants || [],
          pendingRequests: doc.data().pendingRequests || [],
          participantIds: doc.data().participantIds || []
        };
        onSuccess(roomData);
      } else {
        // Room doesn't exist
        if (onError) onError(new Error("Room not found"));
      }
    },
    (error) => {
      console.error("Error listening to room:", error);
      if (onError) onError(error);
    }
  );
};

// Delete a room (when destroyed)
export const deleteRoomFromFirestore = async (roomId: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await deleteDoc(roomRef);
  } catch (error) {
    console.error("Failed to delete room:", error);
    toast({ description: "Failed to delete room." });
    throw error; // so calling function can handle it
  }
};

// Save a room template
export const saveRoomTemplate = async (
  userId: string,
  template: any
): Promise<string | null> => {
  try {
    const templateRef = await addDoc(collection(db, "roomTemplates"), {
      ...template,
      creatorId: userId,
      createdAt: serverTimestamp()
    });
    
    return templateRef.id;
  } catch (error) {
    console.error("Error saving room template:", error);
    toast({ description: "Failed to save room template." });
    return null;
  }
};

// Create a room from a template
export const createRoomFromTemplate = async (
  template: any,
  user: any
): Promise<string | null> => {
  try {
    // Generate a unique ID for the new room
    const roomId = doc(collection(db, "musicRooms")).id;
    
    // Create the host participant
    const hostParticipant = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      instrument: template.hostInstrument || 'piano',
      avatar: user.photoURL || '',
      isHost: true,
      status: 'active'
    };
    
    // Create the new room with template settings
    const newRoom = {
      id: roomId,
      name: template.name || 'Music Room',
      description: template.description || '',
      isPublic: template.isPublic ?? true,
      maxParticipants: template.maxParticipants || 3,
      hostInstrument: template.hostInstrument || 'piano',
      allowDifferentInstruments: template.allowDifferentInstruments ?? true,
      participants: [hostParticipant],
      participantIds: [user.uid],
      pendingRequests: [],
      createdAt: serverTimestamp(),
      creatorId: user.uid,
      lastUpdated: serverTimestamp(),
      lastActivity: serverTimestamp()
    };
    
    await setDoc(doc(db, "musicRooms", roomId), newRoom);
    
    return roomId;
  } catch (error) {
    console.error("Error creating room from template:", error);
    toast({ description: "Failed to create room from template." });
    return null;
  }
};

// Get user's room templates
export const getUserRoomTemplates = (
  userId: string,
  onSuccess: (templates: any[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(
    collection(db, "roomTemplates"),
    where("creatorId", "==", userId)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      onSuccess(templates);
    },
    (error) => {
      console.error("Error getting room templates:", error);
      if (onError) onError(error);
    }
  );
};
