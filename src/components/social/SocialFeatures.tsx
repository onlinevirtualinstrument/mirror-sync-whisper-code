import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageCircle, Heart, Share2, Crown, Music, 
  Trophy, Star, Play, Pause, Volume2, UserPlus, 
  Settings, Search, Filter, Bookmark, ThumbsUp, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  xp: number;
  instruments: string[];
  badges: string[];
  followers: number;
  following: number;
  isOnline: boolean;
  lastSeen?: Date;
  favoriteGenres: string[];
  joinDate: Date;
}

interface Performance {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  instrument: string;
  genre: string;
  duration: number; // in seconds
  recordingUrl?: string;
  thumbnailUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  createdAt: Date;
  isLiked: boolean;
  replies?: Comment[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  instrument: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  deadline: Date;
  participants: number;
  prize: string;
  requirements: string[];
  tags: string[];
  createdBy: User;
  isParticipating: boolean;
}

const SocialFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [showComments, setShowComments] = useState(false);

  // Mock data - replace with real API calls
  const currentUser: User = {
    id: 'current-user',
    username: 'musiclover123',
    displayName: 'Music Lover',
    level: 15,
    xp: 15750,
    instruments: ['Piano', 'Guitar', 'Violin'],
    badges: ['Perfect Pitch', 'Rhythm Master', 'Composer'],
    followers: 324,
    following: 189,
    isOnline: true,
    favoriteGenres: ['Jazz', 'Classical', 'Rock'],
    joinDate: new Date('2023-01-15')
  };

  const mockPerformances: Performance[] = [
    {
      id: '1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        username: 'pianopro',
        displayName: 'Piano Pro',
        level: 20,
        xp: 25000,
        instruments: ['Piano'],
        badges: ['Classical Master'],
        followers: 1200,
        following: 300,
        isOnline: true,
        favoriteGenres: ['Classical'],
        joinDate: new Date('2022-06-10')
      },
      title: 'Chopin Nocturne in E-flat major',
      description: 'My interpretation of this beautiful nocturne. Still working on the dynamics!',
      instrument: 'Piano',
      genre: 'Classical',
      duration: 240,
      likes: 45,
      comments: 12,
      shares: 8,
      createdAt: new Date('2024-01-20'),
      isLiked: false,
      isBookmarked: true,
      tags: ['chopin', 'nocturne', 'romantic'],
      difficulty: 'advanced'
    },
    {
      id: '2',
      userId: 'user-2',
      user: {
        id: 'user-2',
        username: 'jazzguitar',
        displayName: 'Jazz Guitar',
        level: 18,
        xp: 22000,
        instruments: ['Guitar'],
        badges: ['Jazz Virtuoso'],
        followers: 890,
        following: 250,
        isOnline: false,
        lastSeen: new Date('2024-01-19'),
        favoriteGenres: ['Jazz', 'Blues'],
        joinDate: new Date('2022-09-20')
      },
      title: 'Autumn Leaves - Jazz Standard',
      description: 'Working on my jazz improvisation skills. Feedback welcome!',
      instrument: 'Guitar',
      genre: 'Jazz',
      duration: 180,
      likes: 32,
      comments: 8,
      shares: 5,
      createdAt: new Date('2024-01-19'),
      isLiked: true,
      isBookmarked: false,
      tags: ['jazz', 'improvisation', 'standards'],
      difficulty: 'intermediate'
    }
  ];

  const mockChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      title: 'Weekly Piano Challenge',
      description: 'Play any piece by Beethoven and share your performance!',
      instrument: 'Piano',
      difficulty: 'intermediate',
      deadline: new Date('2024-01-28'),
      participants: 47,
      prize: 'Premium Badge + 500 XP',
      requirements: ['Must be Beethoven composition', 'Minimum 2 minutes', 'Original recording'],
      tags: ['beethoven', 'classical', 'piano'],
      createdBy: {
        id: 'admin-1',
        username: 'musicadmin',
        displayName: 'Music Admin',
        level: 50,
        xp: 100000,
        instruments: ['All'],
        badges: ['Administrator'],
        followers: 5000,
        following: 100,
        isOnline: true,
        favoriteGenres: ['All'],
        joinDate: new Date('2021-01-01')
      },
      isParticipating: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = (performanceId: string) => {
    // Implement like functionality
    console.log('Liked performance:', performanceId);
  };

  const handleShare = (performance: Performance) => {
    // Implement share functionality
    console.log('Shared performance:', performance);
  };

  const handleFollow = (userId: string) => {
    // Implement follow functionality
    console.log('Followed user:', userId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold gradient-text">Social Hub</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with musicians worldwide, share your performances, and join challenges
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass-card">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search performances, users, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card"
              />
            </div>
            <Button variant="outline" className="glass-card">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Performance Feed */}
          <div className="space-y-6">
            {mockPerformances.map((performance) => (
              <motion.div
                key={performance.id}
                className="glass-card p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Performance Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={performance.user.avatar} />
                      <AvatarFallback>
                        {performance.user.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{performance.user.displayName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Level {performance.user.level}
                        </Badge>
                        {performance.user.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{performance.user.username} • {performance.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollow(performance.user.id)}
                    className="glass-card"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </div>

                {/* Performance Content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold">{performance.title}</h4>
                    <p className="text-muted-foreground">{performance.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyColor(performance.difficulty)} text-white`}>
                      {performance.difficulty}
                    </Badge>
                    <Badge variant="outline">{performance.instrument}</Badge>
                    <Badge variant="outline">{performance.genre}</Badge>
                    {performance.tags.map(tag => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>

                  {/* Mock Audio Player */}
                  <div className="neo-morphism p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className="w-1/3 h-full bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(performance.duration)}
                      </span>
                      <Button size="sm" variant="ghost">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Performance Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(performance.id)}
                        className={performance.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${performance.isLiked ? 'fill-current' : ''}`} />
                        {performance.likes}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPerformance(performance);
                          setShowComments(true);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {performance.comments}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(performance)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {performance.shares}
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Bookmark className={`w-4 h-4 ${performance.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Active Challenges</h2>
            <Button className="glass-card">
              <Trophy className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                className="glass-card p-6 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{challenge.title}</h3>
                      <p className="text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>{challenge.prize}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="w-4 h-4" />
                      <span>{challenge.instrument}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {challenge.requirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {challenge.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">
                      Ends {challenge.deadline.toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm"
                      variant={challenge.isParticipating ? "outline" : "default"}
                      className="glass-card"
                    >
                      {challenge.isParticipating ? 'Participating' : 'Join Challenge'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Other tabs content would go here... */}
        <TabsContent value="leaderboard">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Leaderboard Coming Soon</h3>
            <p className="text-muted-foreground">See how you rank against other musicians</p>
          </div>
        </TabsContent>

        <TabsContent value="following">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Following Coming Soon</h3>
            <p className="text-muted-foreground">See updates from musicians you follow</p>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Profile Settings Coming Soon</h3>
            <p className="text-muted-foreground">Customize your profile and preferences</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialFeatures;
