
import React from 'react';
import { useRoom } from './RoomContext';
import { Button } from '@/components/ui/button';
import { Check, X, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const JoinRequests: React.FC = () => {
  const { room, isHost, respondToJoinRequest } = useRoom();

  if (!room || !isHost || !room.pendingRequests || room.pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b bg-muted/50">
      <Alert>
        <User className="h-4 w-4" />
        <AlertTitle>Pending Join Requests</AlertTitle>
        <AlertDescription>
          {room.pendingRequests.length} user(s) waiting for approval
        </AlertDescription>
      </Alert>
      
      <div className="mt-3 space-y-2">
        {room.pendingRequests.map((userId: string) => (
          <div key={userId} className="flex justify-between items-center p-2 bg-background rounded">
            <span>User ID: {userId.substring(0, 8)}...</span>
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => respondToJoinRequest(userId, true)}
              >
                <Check size={16} className="mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => respondToJoinRequest(userId, false)}
              >
                <X size={16} className="mr-1" /> Deny
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRequests;
