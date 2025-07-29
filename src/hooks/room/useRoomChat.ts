
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../useAuth';
import { useNotifications } from '../useNotifications';
import { 
  listenToRoomChat, 
  saveChatMessage, 
  updateRoomSettings 
} from '@/utils/firebase';

export const useRoomChat = (roomId: string | undefined, isParticipant: boolean, isHost: boolean, room: any) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastSeenRef = useRef<number>(Date.now());
  const mountedRef = useRef(true);

  // Reset chat state when room changes
  useEffect(() => {
    setMessages([]);
    setUnreadMessageCount(0);
    setIsLoading(true);
    lastSeenRef.current = Date.now();
  }, [roomId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!roomId || !user) {
      setIsLoading(false);
      return;
    }

    console.log('useRoomChat: Setting up chat listener for room:', roomId);

    const unsubscribe = listenToRoomChat(
      roomId,
      (messagesData) => {
        if (!mountedRef.current) return;

        console.log('useRoomChat: Received messages update:', messagesData.length);
        
        // Sort messages by timestamp
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });

        // Force re-render by creating new array reference with unique key
        setMessages(sortedMessages.map((msg, index) => ({ ...msg, _key: `${msg.id}-${index}` })));
        setIsLoading(false);

        // Calculate unread count
        const unreadCount = sortedMessages.filter(msg => {
          const msgTime = msg.timestamp?.toDate?.() || new Date(msg.timestamp || 0);
          return msg.senderId !== user.uid && 
                 msgTime.getTime() > lastSeenRef.current;
        }).length;
        
        setUnreadMessageCount(unreadCount);

        // Show notification for new messages (but not on initial load)
        if (sortedMessages.length > 0 && !isLoading) {
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          if (latestMessage && 
              latestMessage.senderId !== user.uid) {
            const latestMsgTime = latestMessage.timestamp?.toDate?.() || new Date(latestMessage.timestamp || 0);
            if (latestMsgTime.getTime() > lastSeenRef.current) {
              addNotification({
                title: "New Message",
                message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}`,
                type: "info"
              });
            }
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        console.error("useRoomChat: Chat listener error:", error);
        setIsLoading(false);
        addNotification({
          title: "Chat Error",
          message: "Failed to load chat messages",
          type: "error"
        });
      }
    );

    return () => {
      console.log('useRoomChat: Cleaning up chat listener');
      unsubscribe();
    };
  }, [roomId, user?.uid, addNotification, isLoading]);

  const sendMessage = useCallback(async (message: string) => {
    if (!roomId || !user || !message.trim()) {
      console.log('useRoomChat: Cannot send message - missing requirements');
      return;
    }
    
    if (!isParticipant) {
      addNotification({
        title: "Access Denied",
        message: "You must be a participant to send messages",
        type: "error"
      });
      return;
    }
    
    if (room?.isChatDisabled && !isHost) {
      addNotification({
        title: "Chat Disabled",
        message: "Chat has been disabled by the host",
        type: "warning"
      });
      return;
    }

    try {
      console.log('useRoomChat: Sending message to room:', roomId);
      
      await saveChatMessage(roomId, {
        text: message,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '',
        timestamp: new Date().toISOString(),
        isRead: false
      });

      // Update room activity
      if (room) {
        try {
          await updateRoomSettings(roomId, {
            lastActivity: new Date().toISOString()
          });
        } catch (settingsError) {
          console.warn('useRoomChat: Failed to update room settings:', settingsError);
        }
      }
    } catch (error) {
      console.error("useRoomChat: Error sending message:", error);
      addNotification({
        title: "Error",
        message: "Failed to send message",
        type: "error"
      });
    }
  }, [roomId, user, isParticipant, isHost, room, addNotification]);

  const markChatAsRead = useCallback(() => {
    lastSeenRef.current = Date.now();
    setUnreadMessageCount(0);
  }, []);

  return {
    messages,
    unreadMessageCount,
    isLoading,
    sendMessage,
    markChatAsRead
  };
};
