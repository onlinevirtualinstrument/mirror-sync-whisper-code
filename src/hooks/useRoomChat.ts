
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
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribeChat = listenToRoomChat(
      roomId,
      (messagesData) => {
        const sortedMessages = [...messagesData].sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return timeA.getTime() - timeB.getTime();
        });

        setMessages(sortedMessages);

        // Calculate unread messages based on timestamp and sender
        if (!isFirstLoad) {
          const unreadCount = sortedMessages.filter(msg => {
            const msgTime = msg.timestamp?.toDate?.() || new Date(msg.timestamp || 0);
            return msg.senderId !== user.uid && 
                   msgTime.getTime() > lastSeenMessageTimestamp &&
                   !msg.isRead; // Add isRead flag if available
          }).length;
          
          setUnreadMessageCount(unreadCount);

          // Show notification for new messages
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          if (latestMessage && 
              latestMessage.senderId !== user.uid &&
              sortedMessages.length > 0) {
            const latestMsgTime = latestMessage.timestamp?.toDate?.() || new Date(latestMessage.timestamp || 0);
            if (latestMsgTime.getTime() > lastSeenMessageTimestamp) {
              addNotification({
                title: "New Message",
                message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
                type: "info"
              });
            }
          }
        } else {
          setIsFirstLoad(false);
          // On first load, don't count existing messages as unread
          setUnreadMessageCount(0);
        }
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    return () => {
      unsubscribeChat();
    };
  }, [roomId, user, lastSeenMessageTimestamp, addNotification, isFirstLoad]);

  const sendMessage = async (message: string) => {
    if (!roomId || !user || !message.trim()) return;
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
      await saveChatMessage(roomId, {
        text: message,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '',
        timestamp: new Date().toISOString(),
        isRead: false // Add read status
      });

      if (room) {
        updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
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