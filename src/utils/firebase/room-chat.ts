import { collection, addDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, writeBatch, getDoc, updateDoc, doc, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { db } from './config';

// Save a chat message in Firestore
export const saveChatMessage = async (roomId: string, message: any): Promise<string | null> => {
  try {
    // Remove undefined keys again just in case
    const cleanMessage = Object.fromEntries(
      Object.entries(message).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, "musicRooms", roomId, "chat"), cleanMessage);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving message:", error);
    toast({ description: "Failed to send message. Try again." });
    return null;
  }
};

// Delete all chat messages of a room
export const deleteRoomChat = async (roomId: string): Promise<void> => {
  try {
    const snapshot = await getDocs(collection(db, "musicRooms", roomId, "chat"));
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
  } catch (error) {
    console.error("Error deleting chat:", error);
    toast({ description: "Failed to delete room chat." });
  }
};

// Add private messaging between room participants
export const sendPrivateMessage = async (
  roomId: string, 
  senderId: string, 
  receiverId: string, 
  message: string
): Promise<boolean> => {
  try {
    await addDoc(collection(db, "musicRooms", roomId, "privateMessages"), {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    return true;
  } catch (error) {
    console.error("Error sending private message:", error);
    toast({ description: "Failed to send private message." });
    return false;
  }
};

// Get private messages between two users in a room
export const getPrivateMessages = (
  roomId: string,
  userId1: string,
  userId2: string,
  onSuccess: (messages: any[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(
    collection(db, "musicRooms", roomId, "privateMessages"),
    where("senderId", "in", [userId1, userId2]),
    where("receiverId", "in", [userId1, userId2])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      onSuccess(messages);
    },
    (error) => {
      console.error("Error getting private messages:", error);
      if (onError) onError(error);
    }
  );
};

// Mark private message as read
export const markMessageAsRead = async (
  roomId: string,
  messageId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, "musicRooms", roomId, "privateMessages", messageId);
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};

// Listen to all chat messages for a room
export const listenToRoomChat = (
  roomId: string,
  onSuccess: (messages: any[]) => void,
  onError?: (error: any) => void
) => {
  const chatRef = collection(db, "musicRooms", roomId, "chat");
  
  return onSnapshot(
    chatRef,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      onSuccess(messages);
    },
    (error) => {
      console.error("Error listening to chat:", error);
      if (onError) onError(error);
    }
  );
};

// Broadcast note play events for collaborative music
export const broadcastNotePlayToRoom = async (roomId: string, noteData: any): Promise<string | null> => {
  try {
    // Add the note event to the notePlays subcollection
    const noteRef = await addDoc(collection(db, "musicRooms", roomId, "notePlays"), {
      ...noteData,
      timestamp: serverTimestamp()
    });
    
    // Clean up old note events (keep the collection small)
    cleanupOldNoteEvents(roomId);
    
    return noteRef.id;
  } catch (error) {
    console.error("Error broadcasting note:", error);
    return null;
  }
};

// Listen for note play events in a room
export const listenForNotePlayEvents = (
  roomId: string,
  onNote: (noteData: any) => void
) => {
  // Listen to the most recent 20 notes only
  const notesQuery = query(
    collection(db, "musicRooms", roomId, "notePlays"),
    // Add any filtering if needed
  );
  
  return onSnapshot(
    notesQuery,
    (snapshot) => {
      snapshot.docChanges().forEach(change => {
        // Only process newly added notes
        if (change.type === 'added') {
          const noteData = {
            id: change.doc.id,
            ...change.doc.data()
          };
          onNote(noteData);
        }
      });
    },
    (error) => {
      console.error("Error listening for notes:", error);
    }
  );
};

// Clean up old note events to keep the collection manageable
const cleanupOldNoteEvents = async (roomId: string): Promise<void> => {
  try {
    const notesRef = collection(db, "musicRooms", roomId, "notePlays");
    const snapshot = await getDocs(notesRef);
    
    // If there are more than 100 note events, delete the oldest ones
    if (snapshot.size > 100) {
      // Sort by timestamp
      const notesByTime = snapshot.docs
        .map(doc => ({ id: doc.id, data: doc.data() }))
        .sort((a, b) => {
          const timeA = a.data.timestamp?.toDate?.() || new Date(a.data.timestamp || 0);
          const timeB = b.data.timestamp?.toDate?.() || new Date(b.data.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });
      
      // Delete the oldest (leaving the most recent 50)
      const toDelete = notesByTime.slice(0, notesByTime.length - 50);
      
      for (const note of toDelete) {
        await deleteDoc(doc(db, "musicRooms", roomId, "notePlays", note.id));
      }
    }
  } catch (error) {
    console.error("Error cleaning up old notes:", error);
  }
};

// Get unread message count for private messaging
export const getUnreadMessageCount = async (
  roomId: string,
  userId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, "musicRooms", roomId, "privateMessages"),
      where("receiverId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Listen for unread messages
export const listenForUnreadMessages = (
  roomId: string,
  userId: string,
  onUpdate: (count: number) => void,
  onError?: (error: any) => void
) => {
  const q = query(
    collection(db, "musicRooms", roomId, "privateMessages"),
    where("receiverId", "==", userId),
    where("read", "==", false)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.size);
    },
    (error) => {
      console.error("Error listening for unread messages:", error);
      if (onError) onError(error);
    }
  );
};


export const markChatAsRead = async (roomId: string, userId: string) => {
  const q = query(
    collection(db, "musicRooms", roomId, "privateMessages"),
    where("receiverId", "==", userId),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  if (!snapshot.empty) {
    await batch.commit();
  }
};


export const markChatAsReadInFirestore = async (roomId: string, userId: string) => {
  const q = query(
    collection(db, "musicRooms", roomId, "privateMessages"),
    where("receiverId", "==", userId),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });

  if (!snapshot.empty) {
    await batch.commit();
  }
};
