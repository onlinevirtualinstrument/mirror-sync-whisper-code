import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';
import { Music, Users, Gamepad2, Mic } from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: <Music className="h-8 w-8" />,
      title: "Virtual Instruments",
      description: "Play piano, guitar, drums, and 15+ other instruments",
      href: "/explore"
    },
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: "Game Modes",
      description: "Experience gamified learning with tiles, rhythm, and challenge modes",
      href: "/explore"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Live Music Rooms",
      description: "Collaborate with others in real-time music sessions",
      href: "/music-rooms"
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice Chat",
      description: "Communicate with other musicians while playing",
      href: "/music-rooms"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6">
            Virtual Music Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Play, learn, and collaborate with virtual instruments. Experience gamified music learning
            and join live music rooms with voice chat and real-time collaboration.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/explore">Start Playing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/music-rooms">Join Live Rooms</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={feature.href}>Explore</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* New Features Highlight */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="mx-auto mb-4">New Features</Badge>
              <CardTitle className="text-2xl">Enhanced Gaming & Collaboration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Experience our latest gamification features with multiple game modes, 
                real-time voice chat in music rooms, and enhanced collaborative playing.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild>
                  <Link to="/piano">Try Game Modes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/music-rooms">Voice Chat Rooms</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;