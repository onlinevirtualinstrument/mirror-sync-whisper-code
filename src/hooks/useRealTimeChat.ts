
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  listenToRoomChat, 
  saveChatMessage, 
  updateRoomSettings 
} from '@/utils/firebase';

export const useRealTimeChat = (roomId: string | undefined, isParticipant: boolean, isHost: boolean, room: any) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastSeenRef = useRef<number>(Date.now());
  const mountedRef = useRef(true);

  // Reset messages when roomId changes
  useEffect(() => {
    setMessages([]);
    setUnreadMessageCount(0);
    setIsLoading(true);
    lastSeenRef.current = Date.now();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !user) {
      setIsLoading(false);
      return;
    }

    console.log('useRealTimeChat: Setting up real-time chat listener for room:', roomId);

    const unsubscribe = listenToRoomChat(
      roomId,
      (messagesData) => {
        if (!mountedRef.current) return;

        console.log('useRealTimeChat: Received messages update:', messagesData.length);
        
        // Sort messages by timestamp
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });

        setMessages(sortedMessages);
        setIsLoading(false);

        // Calculate unread count
        const unreadCount = sortedMessages.filter(msg => {
          const msgTime = msg.timestamp?.toDate?.() || new Date(msg.timestamp || 0);
          return msg.senderId !== user.uid && 
                 msgTime.getTime() > lastSeenRef.current;
        }).length;
        
        setUnreadMessageCount(unreadCount);

        // Show notification for new messages from others
        const latestMessage = sortedMessages[sortedMessages.length - 1];
        if (latestMessage && 
            latestMessage.senderId !== user.uid && 
            sortedMessages.length > 0) {
          const latestMsgTime = latestMessage.timestamp?.toDate?.() || new Date(latestMessage.timestamp || 0);
          if (latestMsgTime.getTime() > lastSeenRef.current) {
            addNotification({
              title: "New Message",
              message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}`,
              type: "info"
            });
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        console.error("useRealTimeChat: Chat listener error:", error);
        setIsLoading(false);
        addNotification({
          title: "Chat Error",
          message: "Failed to load chat messages",
          type: "error"
        });
      }
    );

    return () => {
      console.log('useRealTimeChat: Cleaning up chat listener');
      unsubscribe();
    };
  }, [roomId, user?.uid, addNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!roomId || !user || !message.trim()) {
      console.log('useRealTimeChat: Cannot send message - missing requirements');
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
      console.log('useRealTimeChat: Sending message to room:', roomId);
      
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
          console.warn('useRealTimeChat: Failed to update room settings:', settingsError);
        }
      }
    } catch (error) {
      console.error("useRealTimeChat: Error sending message:", error);
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
