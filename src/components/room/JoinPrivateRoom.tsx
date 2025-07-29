import React, { useState, useEffect } from 'react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const JoinPrivateRoom: React.FC = () => {
  const { room, isParticipant, requestJoin } = useRoom();
  const [joinCode, setJoinCode] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Control dialog visibility more carefully
  useEffect(() => {
    if (room && !isParticipant && !room.isPublic) {
      console.log('JoinPrivateRoom: Private room detected, showing join dialog');
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [room, isParticipant]);

  const handleJoinRequest = async () => {
    if (!joinCode.trim()) {
      toast({ 
        variant: "destructive",
        description: "Please enter a valid join code" 
      });
      return;
    }

    setIsRequesting(true);
    console.log('JoinPrivateRoom: Attempting to join with code:', joinCode);
    
    try {
      await requestJoin(joinCode);
      setRequestSent(true);
      
      // Keep dialog open for a bit to show success state
      setTimeout(() => {
        setShowDialog(false);
      }, 2000);
    } catch (error) {
      console.error("JoinPrivateRoom: Error requesting to join:", error);
      toast({ 
        variant: "destructive",
        description: "Failed to join with the provided code. Please check the code and try again." 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRequestWithoutCode = async () => {
    setIsRequesting(true);
    console.log('JoinPrivateRoom: Requesting to join without code');
    
    try {
      await requestJoin();
      setRequestSent(true);
      toast({ 
        description: "Join request sent to the host. Please wait for approval." 
      });
      
      // Keep dialog open to show request sent state
      setTimeout(() => {
        setShowDialog(false);
      }, 3000);
    } catch (error) {
      console.error("JoinPrivateRoom: Error requesting to join:", error);
      toast({ 
        variant: "destructive",
        description: "Failed to send join request. Please try again." 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (!room || isParticipant || room.isPublic) return null;

  return (
    <AlertDialog open={showDialog} onOpenChange={() => {}}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" /> Private Room Access Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            {requestSent 
              ? "Your request has been sent. Please wait for the host to approve your access."
              : "This room requires a join code or host approval to enter."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!requestSent && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="join-code" className="text-sm font-medium">
                  Enter Join Code (Optional)
                </label>
                <Input
                  id="join-code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.trim())}
                  placeholder="e.g. 123456"
                  className="text-center font-mono"
                  maxLength={6}
                  disabled={isRequesting}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                If you don't have a code, you can request to join and wait for approval from the host.
              </p>
            </div>
          </div>
        )}
        
        {!requestSent && (
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={handleRequestWithoutCode}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Request to Join'
              )}
            </Button>
            <Button
              className="sm:flex-1"
              onClick={handleJoinRequest}
              disabled={isRequesting || !joinCode.trim()}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Join with Code'
              )}
            </Button>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JoinPrivateRoom;
