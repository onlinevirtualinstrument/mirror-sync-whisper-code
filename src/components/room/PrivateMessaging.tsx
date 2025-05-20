
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, X } from 'lucide-react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PrivateMessaging: React.FC = () => {
  const { 
    room, 
    privateMessages, 
    privateMessagingUser, 
    setPrivateMessagingUser, 
    userInfo, 
    sendPrivateMsg 
  } = useRoom();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [privateMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && privateMessagingUser) {
      sendPrivateMsg(privateMessagingUser, message);
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

  if (!room || !userInfo || !privateMessagingUser) return null;

  const recipient = room.participants.find((p: any) => p.id === privateMessagingUser);
  if (!recipient) return null;

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';

    // Handle both ISO string timestamps and Firebase Firestore timestamps
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={!!privateMessagingUser} onOpenChange={() => setPrivateMessagingUser(null)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
              </Avatar>
              <DialogTitle>Private Chat with {recipient.name}</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPrivateMessagingUser(null)}
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {privateMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start a private conversation!
            </div>
          ) : (
            privateMessages.map((msg: any) => {
              const isCurrentUser = msg.senderId === userInfo.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                      <AvatarImage src={isCurrentUser ? userInfo.avatar : recipient.avatar} />
                      <AvatarFallback>
                        {isCurrentUser ? getInitials(userInfo.name) : getInitials(recipient.name)}
                      </AvatarFallback>
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
                          {isCurrentUser ? 'You' : recipient.name}
                        </span>
                        <span className="text-xs opacity-70 ml-2">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
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
              placeholder="Type your private message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send size={18} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PrivateMessaging;
