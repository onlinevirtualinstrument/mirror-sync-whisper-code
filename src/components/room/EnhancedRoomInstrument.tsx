import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Gamepad2, Music, Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import SimpleInstrument from './SimpleInstrument';
import ConductorMode from '@/components/collaboration/ConductorMode';
import VoiceChat from './VoiceChat';
import SessionRecording from './SessionRecording';
import EducationalModules from '@/components/education/EducationalModules';
import SocialFeatures from '@/components/social/SocialFeatures';
import { useRoom } from './RoomContext';

interface EnhancedRoomInstrumentProps {
  className?: string;
}

const EnhancedRoomInstrument: React.FC<EnhancedRoomInstrumentProps> = ({ className }) => {
  const { room, userInfo } = useRoom();
  const [activeTab, setActiveTab] = useState<'instrument' | 'education' | 'social' | 'conductor'>('instrument');
  const [gameMode, setGameMode] = useState<'normal' | 'tiles' | 'rhythm'>('normal');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isConductor, setIsConductor] = useState(false);

  if (!room || !userInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading enhanced room...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'instrument', label: 'Instrument', icon: Music },
    { id: 'education', label: 'Learn', icon: Settings },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'conductor', label: 'Conductor', icon: Crown }
  ];

  const participants = room.participants || [];
  const activeParticipants = participants.filter((p: any) => p.status === 'active');

  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Enhanced Header */}
      <div className="glassmorphism rounded-lg p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-secondary/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {activeParticipants.length} online
            </Badge>
            {isConductor && (
              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                Conductor
              </Badge>
            )}
          </div>
        </div>

        {/* Game Mode Controls (shown only on instrument tab) */}
        {activeTab === 'instrument' && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="text-sm font-medium">Game Mode:</span>
                <div className="flex gap-1">
                  {['normal', 'tiles', 'rhythm'].map((mode) => (
                    <Button
                      key={mode}
                      onClick={() => setGameMode(mode as any)}
                      variant={gameMode === mode ? "default" : "outline"}
                      size="sm"
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Difficulty:</span>
                <div className="flex gap-1">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <Button
                      key={diff}
                      onClick={() => setDifficulty(diff as any)}
                      variant={difficulty === diff ? "default" : "outline"}
                      size="sm"
                      className="capitalize text-xs px-2"
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {activeTab === 'instrument' && (
          <div className="h-full flex gap-4">
            {/* Main Instrument Panel */}
            <div className="flex-1 glassmorphism rounded-lg p-4">
              <SimpleInstrument
                type={userInfo.instrument}
                showGameMode={gameMode !== 'normal'}
                gameMode={gameMode}
                difficulty={difficulty}
                enableGameModeToggle={true}
              />
            </div>
            
            {/* Side Panel */}
            <div className="w-80 space-y-4">
              <VoiceChat
                participants={activeParticipants}
                userId={userInfo.id}
                onToggleMute={(muted) => console.log('Mute toggled:', muted)}
                onVolumeChange={(volume) => console.log('Volume changed:', volume)}
                isDisabled={room.isVoiceChatDisabled}
                isAdmin={userInfo.isHost}
                onToggleVoiceChat={(enabled) => {
                  // This would call room settings API
                  console.log('Voice chat toggled:', enabled);
                }}
              />
              
              <SessionRecording
                roomId={room.id}
                participants={activeParticipants}
                onStartRecording={() => console.log('Recording started')}
                onStopRecording={() => console.log('Recording stopped')}
                onPlayback={(id) => console.log('Playing recording:', id)}
              />
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="h-full glassmorphism rounded-lg p-6">
            <EducationalModules />
          </div>
        )}

        {activeTab === 'social' && (
          <div className="h-full glassmorphism rounded-lg p-6">
            <SocialFeatures />
          </div>
        )}

        {activeTab === 'conductor' && (
          <div className="h-full glassmorphism rounded-lg p-6">
            <ConductorMode
              isConductor={isConductor}
              participants={activeParticipants}
              onStartSession={() => {
                setIsConductor(true);
                console.log('Conductor session started');
              }}
              onStopSession={() => {
                setIsConductor(false);
                console.log('Conductor session stopped');
              }}
              onSyncMusic={(data) => console.log('Music synced:', data)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRoomInstrument;