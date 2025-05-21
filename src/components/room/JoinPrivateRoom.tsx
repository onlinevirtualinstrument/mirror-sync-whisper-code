
import React, { useState } from 'react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const JoinPrivateRoom: React.FC = () => {
  const { room, isParticipant, requestJoin } = useRoom();
  const [joinCode, setJoinCode] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  if (!room || isParticipant || room.isPublic) return null;

  const handleJoinRequest = async () => {
    setIsRequesting(true);
    try {
      await requestJoin(joinCode);
    } catch (error) {
      console.error("Error requesting to join:", error);
      toast({ 
        variant: "destructive",
        description: "Failed to send join request. Please try again." 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRequestWithoutCode = async () => {
    setIsRequesting(true);
    try {
      await requestJoin();
    } catch (error) {
      console.error("Error requesting to join:", error);
      toast({ 
        variant: "destructive",
        description: "Failed to send join request. Please try again." 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <AlertDialog open={!isParticipant && !room.isPublic} onOpenChange={() => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" /> Private Room
          </AlertDialogTitle>
          <AlertDialogDescription>
            This room requires a join code or host approval.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="join-code" className="text-sm font-medium">
                Enter Join Code
              </label>
              <Input
                id="join-code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. 123456"
                className="text-center font-mono"
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              If you don't have a code, you can request to join and wait for approval from the host.
            </p>
          </div>
        </div>
        
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={handleRequestWithoutCode}
            disabled={isRequesting}
          >
            {isRequesting ? 'Sending...' : 'Request to Join'}
          </Button>
          <Button
            className="sm:flex-1"
            onClick={handleJoinRequest}
            disabled={isRequesting || !joinCode.trim()}
          >
            {isRequesting ? 'Processing...' : 'Join with Code'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JoinPrivateRoom;