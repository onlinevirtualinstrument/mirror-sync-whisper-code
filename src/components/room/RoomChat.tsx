
import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import UnreadMessageBadge from './UnreadMessageBadge';

const RoomChat: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    room, 
    isHost, 
    userInfo, 
    unreadMessageCount, 
    markChatAsRead 
  } = useRoom();
  const [newMessage, setNewMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
      markChatAsRead();
    }
  }, [messages, isVisible, markChatAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleToggleChat = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      markChatAsRead();
    }
  };

  if (room?.isChatDisabled && !isHost) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Chat has been disabled by the host
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Chat Header with Unread Badge */}
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 relative">
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Room Chat</span>
            <UnreadMessageBadge count={unreadMessageCount} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleChat}
            className="text-xs"
          >
            {isVisible ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {isVisible && (
        <>
          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.senderId === userInfo?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.senderId === userInfo?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.senderId !== userInfo?.id && (
                      <div className="text-xs opacity-70 mb-1">
                        {message.senderName}
                      </div>
                    )}
                    <div className="text-sm">{message.text}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/25">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={room?.isChatDisabled && !isHost}
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RoomChat;
