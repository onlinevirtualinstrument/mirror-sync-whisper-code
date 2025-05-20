
import { collection, addDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, getDoc, updateDoc, doc, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";
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
