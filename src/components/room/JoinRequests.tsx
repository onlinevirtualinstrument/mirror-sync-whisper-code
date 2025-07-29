
import React, { useState, useEffect } from 'react';
import { useRoom } from './RoomContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, UserX, Users, Clock } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase/config';

interface PendingUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  requestedAt?: string;
}

const JoinRequests: React.FC = () => {
  const { room, isHost, respondToJoinRequest } = useRoom();
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user details for pending requests
  useEffect(() => {
    const fetchPendingUserDetails = async () => {
      if (!room?.pendingRequests || room.pendingRequests.length === 0) {
        setPendingUsers([]);
        return;
      }

      setIsLoading(true);
      console.log('JoinRequests: Fetching details for pending users:', room.pendingRequests);

      try {
        const userPromises = room.pendingRequests.map(async (userId: string) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: userId,
                name: userData.displayName || userData.name || 'Anonymous User',
                avatar: userData.photoURL || userData.avatar || '',
                email: userData.email || '',
                requestedAt: userData.lastActivity || new Date().toISOString()
              };
            } else {
              // Fallback for users not in users collection
              return {
                id: userId,
                name: 'User',
                avatar: '',
                email: '',
                requestedAt: new Date().toISOString()
              };
            }
          } catch (error) {
            console.error(`JoinRequests: Error fetching user ${userId}:`, error);
            return {
              id: userId,
              name: 'Unknown User',
              avatar: '',
              email: '',
              requestedAt: new Date().toISOString()
            };
          }
        });

        const users = await Promise.all(userPromises);
        setPendingUsers(users);
        console.log('JoinRequests: Fetched pending user details:', users);
      } catch (error) {
        console.error('JoinRequests: Error fetching pending users:', error);
        setPendingUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingUserDetails();
  }, [room?.pendingRequests]);

  const handleApprove = async (userId: string) => {
    console.log('JoinRequests: Approving user:', userId);
    try {
      await respondToJoinRequest(userId, true);
    } catch (error) {
      console.error('JoinRequests: Error approving user:', error);
    }
  };

  const handleDeny = async (userId: string) => {
    console.log('JoinRequests: Denying user:', userId);
    try {
      await respondToJoinRequest(userId, false);
    } catch (error) {
      console.error('JoinRequests: Error denying user:', error);
    }
  };

  // Only show to host when there are pending requests
  if (!isHost || !room || !pendingUsers.length) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Join Requests
          <Badge variant="secondary">{pendingUsers.length}</Badge>
        </CardTitle>
        <CardDescription>
          Review and manage pending join requests for your private room
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading requests...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((pendingUser) => (
              <div
                key={pendingUser.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pendingUser.avatar} alt={pendingUser.name} />
                    <AvatarFallback>
                      {pendingUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{pendingUser.name}</p>
                    {pendingUser.email && (
                      <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Requested to join</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeny(pendingUser.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(pendingUser.id)}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinRequests;
