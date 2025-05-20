
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Lock } from 'lucide-react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RoomChat: React.FC = () => {
  const { room, messages, isHost, userInfo, sendMessage } = useRoom();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!room || !userInfo) return null;

  const formatTime = (timestamp: string | any) => {
    if (!timestamp) return '';

    // Handle both ISO string timestamps and Firebase Firestore timestamps
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-background border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <MessageSquare size={18} className="mr-2" /> Room Chat
        </h2>
      </div>

      {room.isChatDisabled && !isHost ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Chat Disabled</AlertTitle>
            <AlertDescription>
              The host has disabled chat for this room.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg: any) => {
                const isCurrentUser = msg.senderId === userInfo.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                      </Avatar>
                      
                      <div className={`
                        rounded-lg p-3 
                        ${isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                        }
                      `}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {isCurrentUser ? 'You' : msg.senderName}
                          </span>
                          <span className="text-xs opacity-70 ml-2">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send size={18} />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RoomChat;
