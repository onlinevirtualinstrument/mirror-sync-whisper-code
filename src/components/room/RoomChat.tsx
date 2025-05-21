
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Lock, Smile, Music, Heart, Sparkle, StarIcon } from 'lucide-react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const RoomChat: React.FC = () => {
  const { room, messages, isHost, userInfo, sendMessage } = useRoom();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [animatingMessages, setAnimatingMessages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && (!room.isChatDisabled || isHost)) {
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

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const addMusicEffect = (effect: string) => {
    const effectMessage = `*${effect}*`;
    setMessage(prev => prev + ' ' + effectMessage);
  };

  const addSpecialMessage = (type: string) => {
    const messages: Record<string, string> = {
      clap: "👏👏👏 Amazing performance!",
      amazing: "✨🎵 That was incredible! 🎵✨",
      encore: "🔄 ENCORE! Let's hear that again! 🔄",
      bravo: "🌟 BRAVO! Standing ovation! 🌟",
      teamup: "🤝 Let's collaborate on the next one!",
      learn: "📚 I'd love to learn how you played that!",
      goosebumps: "😮 Wow! That gave me goosebumps!",
      harmony: "🎶 Perfect harmony! We're in sync!"
    };
    
    if (messages[type]) {
      setMessage(messages[type]);
    }
  };

  const handleAnimateMessage = (messageId: string) => {
    setAnimatingMessages(prev => ({
      ...prev,
      [messageId]: true
    }));
    
    setTimeout(() => {
      setAnimatingMessages(prev => ({
        ...prev,
        [messageId]: false
      }));
    }, 2000);
  };

  if (!room || !userInfo) return null;

  const formatTime = (timestamp: string | any) => {
    if (!timestamp) return '';

    // Handle both ISO string timestamps and Firebase Firestore timestamps
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp || 0);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parse message content for special formatting
  const renderMessageContent = (text: string) => {
    // Handle music effect formatting with asterisks
    const parts = text.split(/(\*[^*]+\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const effect = part.slice(1, -1);
        return (
          <span
            key={index}
            className="inline-block animate-pulse text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded"
          >
            🎵 {effect} 🎵
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Check for special message types
  const isEmojiOnly = (text: string) => {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    return emojiRegex.test(text) && text.trim().length > 0;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-background border-b">
        <h2 className="text-sm font-semibold flex items-center">
          <MessageSquare size={16} className="mr-2" /> Room Chat
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
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg: any) => {
                const isCurrentUser = msg.senderId === userInfo.id;
                const isEmojiMessage = isEmojiOnly(msg.text);
                const isAnimating = animatingMessages[msg.id];
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    onDoubleClick={() => handleAnimateMessage(msg.id)}
                  >
                    <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className={`h-6 w-6 ${isCurrentUser ? 'ml-1' : 'mr-1'}`}>
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                      </Avatar>
                      
                      <div 
                        className={`
                          rounded-lg p-2 text-sm
                          ${isAnimating ? 'animate-bounce' : ''}
                          ${isEmojiMessage ? 'bg-transparent text-2xl' : isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                          }
                        `}
                      >
                        {!isEmojiMessage && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs">
                              {isCurrentUser ? 'You' : msg.senderName}
                            </span>
                            <span className="text-xs opacity-70 ml-2">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">
                          {isEmojiMessage ? msg.text : renderMessageContent(msg.text)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2 border-t">
            <div className="flex flex-col gap-2">
              {/* Quick Reaction Buttons */}
              <div className="flex flex-wrap gap-1 justify-center mb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => addSpecialMessage('clap')}
                >
                  👏 Applause
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => addSpecialMessage('amazing')}
                >
                  ✨ Amazing!
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => addSpecialMessage('encore')}
                >
                  🔄 Encore
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => addSpecialMessage('harmony')}
                >
                  🎶 Harmony
                </Button>
              </div>
              
              <div className="flex gap-1">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8" 
                      disabled={room.isChatDisabled && !isHost}
                    >
                      <Smile size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-8 gap-1">
                      {["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", 
                        "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗",
                        "🤔", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐",
                        "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒",
                        "👍", "👎", "👏", "🙌", "👐", "🤝", "🙏", "💪", "🎵", "🎶",
                        "🎸", "🎹", "🎷", "🎺", "🥁", "🎻", "🎤", "🎧", "💯", "✨"
                      ].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded"
                          onClick={() => addEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8" 
                      disabled={room.isChatDisabled && !isHost}
                    >
                      <Music size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-2">Music Effects</p>
                      <div className="grid grid-cols-2 gap-1">
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Solo")}>Solo</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Crescendo")}>Crescendo</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Staccato")}>Staccato</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Legato")}>Legato</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Fermata")}>Fermata</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => addMusicEffect("Tremolo")}>Tremolo</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={room.isChatDisabled && !isHost}
                  className="flex-1 text-sm h-8"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={room.isChatDisabled && !isHost}
                  className="h-8 w-8"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RoomChat;
