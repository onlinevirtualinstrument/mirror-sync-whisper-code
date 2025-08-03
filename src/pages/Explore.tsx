import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { Gamepad2, Star, Zap } from 'lucide-react';

const Explore: React.FC = () => {
  const instruments = [
    { name: 'Piano', path: '/piano', category: 'Keyboard', featured: true, hasGameModes: true },
    { name: 'Guitar', path: '/guitar', category: 'Strings', featured: true, hasGameModes: true },
    { name: 'Drums', path: '/drums', category: 'Percussion', featured: true, hasGameModes: true },
    { name: 'Violin', path: '/violin', category: 'Strings', hasGameModes: true },
    { name: 'Flute', path: '/flute', category: 'Wind', hasGameModes: true },
    { name: 'Harp', path: '/harp', category: 'Strings' },
    { name: 'Saxophone', path: '/saxophone', category: 'Wind' },
    { name: 'Drums', path: '/drums', category: 'Percussion' },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Explore Instruments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instruments.map((instrument, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {instrument.name}
                  {instrument.hasGameModes && (
                    <Badge><Gamepad2 className="h-3 w-3" /></Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={instrument.path}>Play Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;