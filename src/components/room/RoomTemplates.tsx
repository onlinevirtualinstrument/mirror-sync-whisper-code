
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Music, Users, Mic, MicOff, Copy, Star, Clock, Filter } from 'lucide-react';
import { saveRoomToFirestore } from "@/utils/auth/firebase";
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_TEMPLATES = [
  {
    id: 'piano-jam',
    name: 'Piano Jam Session',
    hostInstrument: 'piano',
    allowDifferentInstruments: false,
    maxParticipants: 3,
    isPublic: true,
    description: 'Collaborative piano session for practicing together',
    category: 'practice',
    tags: ['piano', 'beginner-friendly'],
    popularityScore: 85
  },
  {
    id: 'band-practice',
    name: 'Full Band Practice',
    hostInstrument: 'guitar',
    allowDifferentInstruments: true,
    maxParticipants: 7,
    isPublic: true,
    description: 'Practice with a full virtual band with multiple instruments',
    category: 'practice',
    tags: ['multi-instrument', 'band'],
    popularityScore: 92
  },
  {
    id: 'drum-circle',
    name: 'Rhythm Workshop',
    hostInstrument: 'drums',
    allowDifferentInstruments: true,
    maxParticipants: 5,
    isPublic: true,
    description: 'Focus on rhythm and percussion instruments',
    category: 'workshop',
    tags: ['drums', 'percussion', 'rhythm'],
    popularityScore: 78
  },
  {
    id: 'private-teaching',
    name: 'Private Teaching Session',
    hostInstrument: 'piano',
    allowDifferentInstruments: false,
    maxParticipants: 2,
    isPublic: false,
    description: 'One-on-one teaching session with private chat',
    category: 'teaching',
    tags: ['private', 'teaching', 'lesson'],
    popularityScore: 91
  },
  {
    id: 'string-quartet',
    name: 'String Instruments',
    hostInstrument: 'violin',
    allowDifferentInstruments: true,
    maxParticipants: 4,
    isPublic: true,
    description: 'Practice space for violin, viola, cello players',
    category: 'practice',
    tags: ['strings', 'classical', 'quartet'],
    popularityScore: 75
  },
  {
    id: 'saxophone-jazz',
    name: 'Jazz Improvisation',
    hostInstrument: 'saxophone',
    allowDifferentInstruments: true,
    maxParticipants: 6,
    isPublic: true,
    description: 'Jazz improvisation session with focus on saxophone',
    category: 'improvisation',
    tags: ['jazz', 'saxophone', 'improvisation'],
    popularityScore: 88
  },
  {
    id: 'guitar-masterclass',
    name: 'Guitar Masterclass',
    hostInstrument: 'guitar',
    allowDifferentInstruments: false,
    maxParticipants: 5,
    isPublic: false,
    description: 'Advanced techniques and theory for guitar players',
    category: 'teaching',
    tags: ['guitar', 'advanced', 'masterclass'],
    popularityScore: 82
  }
];

const RoomTemplates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  const createRoomFromTemplate = async (template: any) => {
    if (!user) {
      toast.error("Please log in to create a room");
      navigate('/music-room-templates');
      return;
    }

    setIsCreating(true);
    setCreatingTemplateId(template.id);

    try {
      // Generate a unique room ID
      const roomId = uuidv4();
      
      // Create a timestamp for 3 hours from now (room expiration)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 3);
      
      // Create room participant (host)
      const hostParticipant = {
        id: user.uid,
        name: user.displayName || 'Host',
        instrument: template.hostInstrument,
        avatar: user.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
        isHost: true,
        status: 'online',
        isActive: true
      };
      
      // Create the room object
      const newRoom = {
        id: roomId,
        name: template.name,
        hostId: user.uid,
        hostInstrument: template.hostInstrument,
        allowDifferentInstruments: template.allowDifferentInstruments,
        maxParticipants: template.maxParticipants,
        isPublic: template.isPublic,
        createdAt: new Date().toISOString(),
        expiresAt,
        participants: [hostParticipant],
        participantIds: [user.uid], // Important: Add the host to participantIds
        pendingRequests: [],
        isChatDisabled: false,
        createdFromTemplate: template.id
      };
      
      // Save to Firestore
      await saveRoomToFirestore(newRoom);
      
      toast.success("Room created successfully!");
      
      // Navigate to the new room
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room from template:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
      setCreatingTemplateId(null);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Music Room Templates</h1>
            <p className="text-muted-foreground">
              Choose from pre-made templates to quickly create music rooms for your sessions.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/music-rooms')} className="mt-4 md:mt-0">
            Back to Live Rooms
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="teaching">Teaching</TabsTrigger>
              <TabsTrigger value="workshop">Workshops</TabsTrigger>
              <TabsTrigger value="improvisation">Improvisation</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {activeFilter === 'all' ? 'Showing all templates' : `Filtered by: ${activeFilter}`}
              </span>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={template.isPublic ? "default" : "outline"}>
                        {template.isPublic ? "Public" : "Private"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm">{Math.floor(template.popularityScore / 10)}/10</span>
                      </div>
                    </div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Music className="h-5 w-5 mr-2 text-primary" />
                        <span>
                          {template.allowDifferentInstruments 
                            ? "Multiple instruments allowed" 
                            : `${template.hostInstrument.charAt(0).toUpperCase() + template.hostInstrument.slice(1)} only`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        <span>Up to {template.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center">
                        {template.isPublic ? (
                          <Mic className="h-5 w-5 mr-2 text-primary" />
                        ) : (
                          <MicOff className="h-5 w-5 mr-2 text-primary" />
                        )}
                        <span>
                          {template.isPublic 
                            ? "Anyone can join" 
                            : "Invitation only"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => createRoomFromTemplate(template)}
                      disabled={isCreating}
                    >
                      {isCreating && creatingTemplateId === template.id ? (
                        <>
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['practice', 'teaching', 'workshop', 'improvisation'].map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates
                  .filter(template => template.category === category)
                  .map(template => (
                    <Card key={template.id} className="transition-all hover:shadow-md">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={template.isPublic ? "default" : "outline"}>
                            {template.isPublic ? "Public" : "Private"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm">{Math.floor(template.popularityScore / 10)}/10</span>
                          </div>
                        </div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Music className="h-5 w-5 mr-2 text-primary" />
                            <span>
                              {template.allowDifferentInstruments 
                                ? "Multiple instruments allowed" 
                                : `${template.hostInstrument.charAt(0).toUpperCase() + template.hostInstrument.slice(1)} only`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary" />
                            <span>Up to {template.maxParticipants} participants</span>
                          </div>
                          <div className="flex items-center">
                            {template.isPublic ? (
                              <Mic className="h-5 w-5 mr-2 text-primary" />
                            ) : (
                              <MicOff className="h-5 w-5 mr-2 text-primary" />
                            )}
                            <span>
                              {template.isPublic 
                                ? "Anyone can join" 
                                : "Invitation only"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => createRoomFromTemplate(template)}
                          disabled={isCreating}
                        >
                          {isCreating && creatingTemplateId === template.id ? (
                            <>
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Use Template
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RoomTemplates;
