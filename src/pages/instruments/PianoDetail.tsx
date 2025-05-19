
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Piano from '@/components/instruments/piano/piano/Piano';
import PianoTutorial from '@/components/instruments/piano/piano/PianoTutorial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Piano as PianoIcon, 
  MusicIcon, 
  BookIcon, 
  Layers, 
  BookOpen,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

const PianoTypes = [
  { id: 'grand', name: 'Grand Piano', description: 'Full-sized concert grand piano with rich, resonant sound' },
  { id: 'upright', name: 'Upright Piano', description: 'Compact vertical piano with excellent tonal quality' },
  { id: 'digital', name: 'Digital Piano', description: 'Modern electric piano with authentic weighted keys' },
  { id: 'synth', name: 'Synthesizer', description: 'Versatile electronic keyboard with extensive sound options' },
];

const PianoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/categories/keyboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Keyboard Instruments</span>
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="font-normal">Instrument</Badge>
          <Badge>Interactive</Badge>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
              <PianoIcon className="h-8 w-8" />
              Piano Experience
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-6">
              Explore different types of pianos and play them with our interactive virtual keyboard. 
              Learn and create beautiful music with realistic sound.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Tutorial button */}
              <Button 
                variant="outline" 
                onClick={() => setTutorialOpen(true)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Show Piano Tutorial</span>
              </Button>
            </div>
          </div>
          
          {/* Add the PianoTutorial component */}
          <PianoTutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
          
          <Tabs defaultValue="virtual">
            <TabsList className="mb-6 w-full grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="virtual">Virtual Piano</TabsTrigger>
              <TabsTrigger value="types">Piano Types</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="virtual" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <Piano 
                  startOctave={3} 
                  endOctave={5} 
                  theme="classic" 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="types">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PianoTypes.map(type => (
                  <div key={type.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{type.description}</p>
                    <Button variant="outline" className="w-full">Explore {type.name}</Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">The History of Pianos</h3>
                <p className="mb-4">
                  The piano was invented by Bartolomeo Cristofori in Italy around 1700. Originally called the "gravicembalo col piano e forte" 
                  (harpsichord with soft and loud), it revolutionized keyboard instruments by allowing players to control volume through touch.
                </p>
                <p className="mb-4">
                  Over the centuries, the piano evolved from the early fortepiano to the modern grand piano, 
                  becoming one of the most versatile and expressive instruments in music history.
                </p>
                <div className="mt-4">
                  <Button>Learn More About Piano History</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="lessons">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Start Learning Piano</h3>
                <p className="mb-6">Begin your piano journey with our interactive lessons and tutorials.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Beginner Lessons</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Learn fundamentals and basic techniques</p>
                    <Button size="sm" variant="outline" className="w-full">Start</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Intermediate Practice</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Scales, chords and music theory</p>
                    <Button size="sm" variant="outline" className="w-full">Explore</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Advanced Techniques</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Complex compositions and performance</p>
                    <Button size="sm" variant="outline" className="w-full">Master</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default PianoDetailPage;
