
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './config';

// Listen to room chat
export const listenToRoomChat = (
  roomId: string,
  onMessages: (messages: any[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onMessages(messages);
      },
      (error) => {
        console.error('Error listening to chat:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up chat listener:', error);
    onError(error as Error);
    return () => {};
  }
};

// Save chat message
export const saveChatMessage = async (roomId: string, messageData: any): Promise<void> => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    
    const messageWithTimestamp = {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    await addDoc(messagesRef, messageWithTimestamp);
    console.log('Chat message saved successfully');
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// Send private message
export const sendPrivateMessage = async (roomId: string, senderId: string, receiverId: string, message: string): Promise<void> => {
  try {
    const privateMessagesRef = collection(db, 'rooms', roomId, 'privateMessages');
    
    const messageData = {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      read: false
    };

    await addDoc(privateMessagesRef, messageData);
    console.log('Private message sent successfully');
  } catch (error) {
    console.error('Error sending private message:', error);
    throw error;
  }
};

// Get private messages
export const getPrivateMessages = (
  roomId: string,
  userId1: string,
  userId2: string,
  onMessages: (messages: any[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  try {
    const privateMessagesRef = collection(db, 'rooms', roomId, 'privateMessages');
    const messagesQuery = query(
      privateMessagesRef,
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onMessages(messages);
      },
      (error) => {
        console.error('Error getting private messages:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up private messages listener:', error);
    onError(error as Error);
    return () => {};
  }
};

// Mark message as read
export const markMessageAsRead = async (roomId: string, messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'privateMessages', messageId);
    await updateDoc(messageRef, {
      read: true,
      readAt: serverTimestamp()
    });
    console.log('Message marked as read');
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Listen for unread messages
export const listenForUnreadMessages = (
  roomId: string,
  userId: string,
  onUnreadCount: (count: number) => void
): (() => void) => {
  try {
    const privateMessagesRef = collection(db, 'rooms', roomId, 'privateMessages');
    const unreadQuery = query(
      privateMessagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => {
        onUnreadCount(snapshot.size);
      },
      (error) => {
        console.error('Error listening for unread messages:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up unread messages listener:', error);
    return () => {};
  }
};
