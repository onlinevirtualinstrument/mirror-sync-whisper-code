import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRoom } from './RoomContext';

const emojiList = [
  "😀", "😂", "😊", "😍", "😎", "👏", "🙌", "🎉", "🔥", "🎵", "🎶", "🎧",
  "🥁", "🎸", "🎹", "🕺", "💃", "👍", "🙏", "👌", "💯", "😅", "🤘", "💥"
];

const quickMessages = [
  "Sounds good", "Can you hear me?", "Try again", "🎶 Nice!", "🎧 Ready!", 
  "👏👏👏 Amazing performance!", "🎶 Perfect harmony!","😲 Wow! That was incredible!",
];

const RoomChat: React.FC = () => {
  const {
    messages,
    sendMessage,
    isParticipant,
    markChatAsRead,
    userInfo,
  } = useRoom();

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
    markChatAsRead();
  }, [messages]);

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideMessage?: string) => {
    if (e) e.preventDefault();
    const messageToSend = overrideMessage ?? newMessage.trim();
    if (messageToSend) {
      await sendMessage(messageToSend);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 pb-2">
          {messages.map((msg) => {
            const isCurrentUser = msg.senderId === userInfo?.id;
            return (
              <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-start gap-2 max-w-[80%]">
                  {!isCurrentUser && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={msg.senderAvatar} />
                      <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-2 rounded-lg text-sm ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-medium">
                        {isCurrentUser ? 'You' : msg.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {isParticipant && (
        <div className="border-t p-3 space-y-2">
          {/* Quick Messages */}
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg) => (
              <Button
                key={msg}
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs px-2 py-1"
                onClick={() => handleSendMessage(undefined, msg)}
              >
                {msg}
              </Button>
            ))}
          </div>

          {/* Input and Emoji Picker */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2">
                <div className="grid grid-cols-8 gap-1 text-lg">
                  {emojiList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="hover:bg-muted rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="text-sm flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-8 w-8">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomChat;
