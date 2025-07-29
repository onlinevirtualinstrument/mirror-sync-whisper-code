
import React, { useEffect, useState, useCallback } from 'react';
import { useRoom } from './RoomContext';
import SimpleInstrument from './SimpleInstrument';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Volume2, VolumeX, Mic, MicOff, Users, Activity, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimplifiedAudioShare from '@/utils/audio/simplifiedAudioShare';

const RoomInstrument: React.FC = () => {
  const { room, userInfo } = useRoom();
  const [isAudioSharing, setIsAudioSharing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [needsAudioResume, setNeedsAudioResume] = useState(false);
  
  const audioShare = SimplifiedAudioShare.getInstance();

  // Initialize audio sharing when room and user info are available
  useEffect(() => {
    if (room?.id && userInfo?.id) {
      const initializeAudio = async () => {
        try {
          const initialized = await audioShare.initialize(room.id, userInfo.id);
          if (!initialized) {
            setAudioError('Failed to initialize audio system');
          } else {
            console.log('RoomInstrument: Audio system initialized successfully');
          }
        } catch (error) {
          console.error('RoomInstrument: Audio initialization error:', error);
          setAudioError('Audio system initialization failed');
        }
      };
      
      initializeAudio();
    }

    return () => {
      console.log('RoomInstrument: Cleaning up audio share');
      audioShare.dispose();
    };
  }, [room?.id, userInfo?.id]);

  // Update participants for audio sharing
  useEffect(() => {
    if (room?.participants && userInfo?.id) {
      const participantIds = room.participants
        .filter((p: any) => p.id !== userInfo.id && p.status === 'active')
        .map((p: any) => p.id);
      
      console.log('RoomInstrument: Updating participants for audio sharing:', participantIds);
      audioShare.updateParticipants(participantIds);
      
      // Update stats periodically
      const updateStats = () => {
        setConnectedPeers(audioShare.getConnectedPeersCount());
        setAudioLevel(audioShare.getActiveAudioLevel());
      };
      
      const interval = setInterval(updateStats, 1000);
      return () => clearInterval(interval);
    }
  }, [room?.participants, userInfo?.id]);

  // Handle user interaction to enable audio context
  const handleUserInteraction = useCallback(async () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setAudioError(null);
      setNeedsAudioResume(false);
      
      // Resume audio playback for all peers
      audioShare.resumeAudio();
      
      console.log('RoomInstrument: User interaction detected, audio context enabled');
    }
  }, [userInteracted]);

  const handleAudioToggle = useCallback(async () => {
    try {
      if (!isAudioSharing) {
        console.log('RoomInstrument: Starting audio sharing...');
        const success = await audioShare.startSharing();
        if (success) {
          setIsAudioSharing(true);
          setAudioError(null);
          setNeedsAudioResume(true); // May need user gesture for audio playback
          console.log('RoomInstrument: Audio sharing enabled successfully');
        } else {
          setAudioError('Failed to start audio sharing. Please allow microphone/system audio access.');
          console.error('RoomInstrument: Audio sharing failed to start');
        }
      } else {
        console.log('RoomInstrument: Stopping audio sharing...');
        audioShare.stopSharing();
        setIsAudioSharing(false);
        setConnectedPeers(0);
        setAudioLevel(0);
        setNeedsAudioResume(false);
        console.log('RoomInstrument: Audio sharing disabled');
      }
    } catch (error) {
      console.error('RoomInstrument: Error toggling audio sharing:', error);
      setAudioError('Audio sharing failed. Please check browser permissions and try again.');
      setIsAudioSharing(false);
    }
  }, [isAudioSharing, audioShare]);

  const handleResumeAudio = useCallback(() => {
    audioShare.resumeAudio();
    setNeedsAudioResume(false);
    handleUserInteraction();
  }, [handleUserInteraction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAudioSharing) {
        audioShare.stopSharing();
      }
    };
  }, [audioShare, isAudioSharing]);
  
  if (!room || !userInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loading instrument or connecting to room...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (audioError && !userInteracted) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <VolumeX className="h-4 w-4" />
          <AlertDescription>
            {audioError}
            <Button 
              onClick={handleUserInteraction}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Enable Audio
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeParticipants = room.participants?.filter((p: any) => 
    p.id !== userInfo.id && p.status === 'active'
  )?.length || 0;

  return (
    <div className="flex flex-col h-full" onClick={handleUserInteraction}>
      {/* Audio sharing controls */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${isAudioSharing ? 'text-green-600' : 'text-gray-500'}`}>
            <Volume2 className="h-3 w-3" />
            <span>
              {isAudioSharing 
                ? `Sharing audio to ${activeParticipants} user(s)` 
                : 'Audio Ready'
              }
            </span>
            {isAudioSharing && connectedPeers > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Users className="h-3 w-3" />
                <span>{connectedPeers} connected</span>
              </div>
            )}
            {isAudioSharing && audioLevel > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Activity className="h-3 w-3" />
                <span>Active</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {needsAudioResume && (
            <Button
              onClick={handleResumeAudio}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Enable Audio
            </Button>
          )}
          
          <Button
            onClick={handleAudioToggle}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            {isAudioSharing ? (
              <>
                <Mic className="h-3 w-3 mr-1" />
                Stop Sharing
              </>
            ) : (
              <>
                <MicOff className="h-3 w-3 mr-1" />
                Share Audio
              </>
            )}
          </Button>
        </div>
      </div>

      {isAudioSharing && (
        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <Mic className="h-3 w-3" />
          Your instrument sounds are being shared with {activeParticipants} participant(s)
          {connectedPeers > 0 && (
            <span className="ml-1 font-semibold">({connectedPeers} actively connected)</span>
          )}
        </div>
      )}

      {needsAudioResume && isAudioSharing && (
        <div className="text-xs text-yellow-600 mb-2 flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
          <Play className="h-3 w-3" />
          Click "Enable Audio" to hear other participants' instruments
        </div>
      )}

      {audioError && userInteracted && (
        <div className="text-xs text-red-600 mb-2 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          <AlertCircle className="h-3 w-3" />
          {audioError}
        </div>
      )}

      <SimpleInstrument type={userInfo.instrument} />
    </div>
  );
};

export default RoomInstrument;
