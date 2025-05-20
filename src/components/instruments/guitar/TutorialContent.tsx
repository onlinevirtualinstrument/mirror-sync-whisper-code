
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Music, Guitar, Volume2, Settings, Mic, Play, Sliders, X } from 'lucide-react';

interface TutorialContentProps {
  onClose?: () => void;
}

const TutorialContent: React.FC<TutorialContentProps> = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    {
      id: 'basics',
      title: 'Basic Controls',
      content: (
        <div className="space-y-4">
          <div className="w-full h-64 rounded-lg mb-4 overflow-hidden animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1588449668365-d15e397f6787?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Acoustic Guitar Close-up" 
              className="w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 hover:scale-105"
            />
          </div>
          <h3 className="text-lg font-medium animate-slide-in" style={{ animationDelay: '0.1s' }}>Playing the Strings</h3>
          <p className="animate-slide-in" style={{ animationDelay: '0.2s' }}>Click on any string to play it. The strings are numbered from 1 (thinnest) to 6 (thickest).</p>
          
          <h3 className="text-lg font-medium animate-slide-in" style={{ animationDelay: '0.3s' }}>Using Frets</h3>
          <p className="animate-slide-in" style={{ animationDelay: '0.4s' }}>Click on a fret position to play a note at that position. Higher frets produce higher pitched notes.</p>
          
          <div className="p-4 bg-blue-50 rounded-lg mt-4 animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <h4 className="font-medium text-blue-700">Pro Tip</h4>
            <p className="text-blue-600">Try clicking different parts of the fretboard to get familiar with the sound range.</p>
          </div>
        </div>
      )
    },
    {
      id: 'effects',
      title: 'Effects & Settings',
      content: (
        <div className="space-y-4">
          <div className="w-full h-48 rounded-lg mb-4 overflow-hidden animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1546058256-1ad6c5569e24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Guitar Effects Pedals" 
              className="w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="h-5 w-5" />
                <h3 className="font-medium">Distortion</h3>
              </div>
              <p>Adds crunch and grit to your sound. Perfect for rock and metal styles.</p>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-black h-full animate-[slideRight_1s_ease-out]" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-5 w-5" />
                <h3 className="font-medium">Reverb</h3>
              </div>
              <p>Adds spaciousness and depth to your tone, simulating playing in different spaces.</p>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-black h-full animate-[slideRight_1s_ease-out]" style={{ width: '40%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-5 w-5" />
                <h3 className="font-medium">Delay</h3>
              </div>
              <p>Creates echo effects that repeat your notes. Great for atmospheric sounds.</p>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-black h-full animate-[slideRight_1s_ease-out]" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5" />
                <h3 className="font-medium">Tuning</h3>
              </div>
              <p>Change how the guitar is tuned to play in different keys or styles.</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs px-2 py-1 bg-gray-200 rounded animate-scale-in" style={{ animationDelay: '0.5s' }}>Standard</span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded animate-scale-in" style={{ animationDelay: '0.6s' }}>Drop D</span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded animate-scale-in" style={{ animationDelay: '0.7s' }}>Open G</span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded animate-scale-in" style={{ animationDelay: '0.8s' }}>Custom</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <h4 className="font-medium text-blue-700">Settings Tips</h4>
            <p className="text-blue-600">Different guitar types (electric, acoustic, bass) respond differently to effects. Electric guitars work best with distortion.</p>
          </div>
        </div>
      )
    },
    {
      id: 'recording',
      title: 'Recording & Sharing',
      content: (
        <div className="space-y-4">
          <div className="w-full h-48 rounded-lg mb-4 overflow-hidden animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Recording Studio Setup" 
              className="w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 hover:scale-105"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="p-4 border rounded-lg flex-1 animate-slide-in hover:shadow-md transition-all" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-5 w-5" />
                <h3 className="font-medium">Record Your Playing</h3>
              </div>
              <ol className="list-decimal pl-5 space-y-2">
                <li className="animate-slide-in" style={{ animationDelay: '0.2s' }}>Click the Record button to start recording</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.3s' }}>Play notes on the virtual guitar</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.4s' }}>Click Stop when finished</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.5s' }}>Play back your recording using the Play button</li>
              </ol>
            </div>
            
            <div className="p-4 border rounded-lg flex-1 animate-slide-in hover:shadow-md transition-all" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-5 w-5" />
                <h3 className="font-medium">Share & Download</h3>
              </div>
              <ol className="list-decimal pl-5 space-y-2">
                <li className="animate-slide-in" style={{ animationDelay: '0.4s' }}>Click Share to share your recording</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.5s' }}>Download to save to your device</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.6s' }}>Share with friends via link or social media</li>
                <li className="animate-slide-in" style={{ animationDelay: '0.7s' }}>Record as many takes as you like</li>
              </ol>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <h4 className="font-medium text-blue-700">Recording Tips</h4>
            <p className="text-blue-600">For the best sound quality, adjust your effects before recording. Try to keep recordings under 2 minutes for better performance.</p>
          </div>
        </div>
      )
    },
    {
      id: 'chords',
      title: 'Learning Chords',
      content: (
        <div className="space-y-4">
          <div className="w-full h-48 rounded-lg mb-4 overflow-hidden animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Guitar Chord Chart" 
              className="w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-medium text-center mb-2">E Major</h3>
              <div className="grid grid-cols-6 gap-1 mb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-5 border-b-2 border-black relative flex justify-center">
                    {i === 0 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 1 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 2 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center">(Fret: 0 0 1 2 2 0)</p>
            </div>
            
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-medium text-center mb-2">A Major</h3>
              <div className="grid grid-cols-6 gap-1 mb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-5 border-b-2 border-black relative flex justify-center">
                    {i === 1 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 2 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 3 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center">(Fret: X 0 2 2 2 0)</p>
            </div>
            
            <div className="p-4 border rounded-lg animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: '0.3s' }}>
              <h3 className="font-medium text-center mb-2">D Major</h3>
              <div className="grid grid-cols-6 gap-1 mb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-5 border-b-2 border-black relative flex justify-center">
                    {i === 3 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 4 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                    {i === 5 && <div className="absolute top-0 w-3 h-3 rounded-full bg-black animate-pulse"></div>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center">(Fret: X X 0 2 3 2)</p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium animate-slide-in" style={{ animationDelay: '0.4s' }}>Using Chord Assist Mode</h3>
          <p className="animate-slide-in" style={{ animationDelay: '0.5s' }}>Enable Chord Assist Mode in the settings to get visual guidance for playing common chords. The virtual fretboard will highlight where to place your fingers.</p>
          
          <div className="p-4 bg-blue-50 rounded-lg mt-4 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <h4 className="font-medium text-blue-700">Practice Tips</h4>
            <p className="text-blue-600">Start with basic chords like E, A, and D. Once comfortable, try chord progressions like E-A-D which are used in many songs.</p>
          </div>
        </div>
      )
    }
  ];
  
  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };
  
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };
  
  return (
    <div className="space-y-6 py-4 relative">
      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close tutorial"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <Tabs defaultValue={sections[currentSection].id} value={sections[currentSection].id}>
        <TabsList className="grid grid-cols-4 mb-4">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              onClick={() => setCurrentSection(sections.findIndex(s => s.id === section.id))}
              className="transition-all duration-300 hover:bg-gray-100 data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="animate-fade-in">
            {section.content}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={prevSection}
          disabled={currentSection === 0}
          className="transition-all duration-300 hover:translate-x-[-5px]"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          onClick={nextSection}
          disabled={currentSection === sections.length - 1}
          className="transition-all duration-300 hover:translate-x-[5px]"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TutorialContent;
