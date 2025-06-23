
import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRoom } from './RoomContext';
import { validateChatMessage, sanitizeInput } from '@/utils/validation';
import { toast } from '@/components/ui/use-toast';

const emojiList = [
  "😀", "😂", "😊", "😍", "😎", "👏", "🙌", "🎉", "🔥", "🎵", "🎶", "🎧",
  "🥁", "🎸", "🎹", "🕺", "💃", "👍", "🙏", "👌", "💯", "😅", "🤘", "💥"
];

const quickMessages = [
  "Sounds good", "Can you hear me?", "Try again", "🎶 Nice!", "🎧 Ready!",
  "👏👏👏 Amazing performance!", "🎶 Perfect harmony!", "😲 Wow! That was incredible!",
];

const pastelColors = [
  'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100',
  'bg-teal-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100',
  'bg-pink-100', 'bg-rose-100', 'bg-lime-100', 'bg-cyan-100'
];
const borderColors = [
  'border-red-500', 'border-orange-500', 'border-yellow-500', 'border-green-500',
  'border-teal-500', 'border-blue-500', 'border-indigo-500', 'border-purple-500',
  'border-pink-500', 'border-rose-500', 'border-lime-500', 'border-cyan-500'
];

const getUserColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

const getUserBorderColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % borderColors.length;
  return borderColors[index];
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // scrollToBottom();
    markChatAsRead();
  }, [messages, markChatAsRead]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // slight delay to ensure DOM is rendered
  };


  const handleSendMessage = async (e?: React.FormEvent, overrideMessage?: string) => {
    if (e) e.preventDefault();

    const messageToSend = overrideMessage ?? newMessage.trim();
    if (!messageToSend || isSubmitting) return;

    // Validate message with enhanced security
    const validation = validateChatMessage(messageToSend, userInfo?.id || '');
    if (!validation.isValid) {
      toast({
        title: "Message Invalid",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('RoomChat: Sending message:', messageToSend);

    try {
      // Sanitize input before sending
      const sanitizedMessage = sanitizeInput(messageToSend);
      await sendMessage(sanitizedMessage);
      setNewMessage('');
      console.log('RoomChat: Message sent successfully');
    } catch (error) {
      console.error('RoomChat: Error sending message:', error);
      toast({
        title: "Failed to Send",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('RoomChat: Error formatting time:', error);
      return '';
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Basic input sanitization on change
    const sanitizedValue = sanitizeInput(value);
    setNewMessage(sanitizedValue.substring(0, 1000)); // Limit length
  };

  
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
                  {/* <div className={`p-2 rounded-lg text-sm ${isCurrentUser ? 'bg-gray-600 text-primary-foreground' : 'bg-muted'}`}> */}
                  <div className={`p-2 rounded-lg text-sm border ${isCurrentUser
                    ? 'bg-gray-600 text-primary-foreground border-gray-700'
                    : `${getUserColor(msg.senderId)} ${getUserBorderColor(msg.senderId)} text-gray-900`
                    }`}>


                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-medium">
                        {isCurrentUser ? 'You' : msg.senderName}
                      </span>
                      <span className={`text-xs ${isCurrentUser ? 'text-gray-300' : 'text-muted-foreground'}`}>
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
                disabled={isSubmitting}
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
                      className="hover:bg-muted rounded p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="text-sm flex-1"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || isSubmitting}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomChat;