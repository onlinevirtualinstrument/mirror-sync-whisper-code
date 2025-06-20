
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  listenToRoomChat, 
  saveChatMessage, 
  updateRoomSettings 
} from '@/utils/firebase';

export const useRoomChat = (room: any, isParticipant: boolean, isHost: boolean) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [messages, setMessages] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [lastSeenMessageTimestamp, setLastSeenMessageTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (!roomId || !user) {
      console.log('useRoomChat: Missing roomId or user, skipping chat setup');
      return;
    }

    console.log('useRoomChat: Setting up chat listener for room:', roomId);

    const unsubscribeChat = listenToRoomChat(
      roomId,
      (messagesData) => {
        console.log('useRoomChat: Received messages:', messagesData.length);
        
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });

        // Update messages immediately for real-time display
        setMessages(sortedMessages);

        // Calculate unread messages
        const unreadCount = sortedMessages.filter(msg => {
          const msgTime = msg.timestamp?.toDate?.() || new Date(msg.timestamp || 0);
          return msg.senderId !== user.uid && 
                 msgTime.getTime() > lastSeenMessageTimestamp;
        }).length;
        
        setUnreadMessageCount(unreadCount);

        // Show notification for latest message if it's from another user
        const latestMessage = sortedMessages[sortedMessages.length - 1];
        if (latestMessage && 
            latestMessage.senderId !== user.uid) {
          const latestMsgTime = latestMessage.timestamp?.toDate?.() || new Date(latestMessage.timestamp || 0);
          if (latestMsgTime.getTime() > lastSeenMessageTimestamp) {
            addNotification({
              title: "New Message",
              message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
              type: "info"
            });
          }
        }
      },
      (error) => {
        console.error("useRoomChat: Chat error:", error);
        addNotification({
          title: "Chat Error",
          message: "Failed to load chat messages",
          type: "error"
        });
      }
    );

    return () => {
      console.log('useRoomChat: Cleaning up chat listener');
      unsubscribeChat();
    };
  }, [roomId, user?.uid, addNotification, lastSeenMessageTimestamp]);

  const sendMessage = async (message: string) => {
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
  };

  const markChatAsRead = useCallback(() => {
    setLastSeenMessageTimestamp(Date.now());
    setUnreadMessageCount(0);
  }, []);

  return {
    messages,
    unreadMessageCount,
    sendMessage,
    markChatAsRead
  };
};
