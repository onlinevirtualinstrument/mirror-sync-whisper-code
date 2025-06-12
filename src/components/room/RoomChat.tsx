
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRoom } from './RoomContext';
import UnreadMessageBadge from './UnreadMessageBadge';

const RoomChat: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    isParticipant, 
    unreadMessageCount,
    markChatAsRead 
  } = useRoom();
  
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      markChatAsRead();
    }
  }, [messages, isOpen, markChatAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markChatAsRead();
    }
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 relative"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat
        {unreadMessageCount > 0 && (
          <UnreadMessageBadge count={unreadMessageCount} />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-16 right-4 w-80 h-96 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm">Room Chat</CardTitle>
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages */}
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback className="text-xs">
                        {message.senderName?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs truncate">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs break-words">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            {isParticipant && (
              <form onSubmit={handleSendMessage} className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="text-sm"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default RoomChat;
