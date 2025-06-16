
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
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);

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

        if (sortedMessages.length > 0) {
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          const unreadCount = sortedMessages.filter(msg => 
            msg.senderId !== user.uid && 
            (!lastSeenMessageId || msg.id !== lastSeenMessageId)
          ).length;
          setUnreadMessageCount(unreadCount);

          if (latestMessage.id !== lastMessageId && 
              latestMessage.senderId !== user.uid &&
              lastMessageId !== null) {
            addNotification({
              title: "New Message",
              message: `${latestMessage.senderName}: ${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}`,
              type: "info"
            });
          }
          setLastMessageId(latestMessage.id);
        }
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    return () => {
      unsubscribeChat();
    };
  }, [roomId, user, lastMessageId, addNotification, lastSeenMessageId]);

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
        timestamp: new Date().toISOString()
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
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setLastSeenMessageId(latestMessage.id);
      setUnreadMessageCount(0);
    }
  }, [messages]);

  return {
    messages,
    unreadMessageCount,
    sendMessage,
    markChatAsRead
  };
};
