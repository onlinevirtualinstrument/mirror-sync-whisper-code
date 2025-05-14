
import React, { useState } from 'react';
import { X, ChevronRight, Play, Book, Medal, Lightbulb, Sparkles, Keyboard, Music, Volume2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const beginnerSections = [
    {
      title: 'Getting Started',
      steps: [
        'Select your preferred violin type from the options at the top',
        'Click on any string or piano key to hear it play',
        'Adjust the controls on the right to customize your sound',
        'Use the recording panel to capture your performance'
      ]
    },
    {
      title: 'Playing Techniques',
      steps: [
        'Increase bow pressure for a stronger, more intense sound',
        'Adjust bow speed to control the character of each note',
        'Use vibrato to add expression and emotion to sustained notes',
        'Experiment with reverb to simulate different performance spaces'
      ]
    },
    {
      title: 'Basic Features',
      steps: [
        'Record your performances and download as MP3 files',
        'Share your recordings directly to social media',
        'Explore different violin types for various musical styles',
        'Adjust string tension to fine-tune the responsiveness'
      ]
    }
  ];
  
  const howToPlaySections = [
    {
      title: 'Keyboard Controls',
      steps: [
        'Use keys 1-9 for the lower octave notes',
        'Use keys Q-P for middle octave notes',
        'Use keys A-L for higher octave notes',
        'Hold Shift + any key to play sharp notes (e.g., Shift+1 for G#)',
        'Each row represents different octaves for more range',
      ]
    },
    {
      title: 'Mouse/Touch Controls',
      steps: [
        'Tap or click directly on the on-screen keyboard to play notes',
        'White keys represent natural notes (C, D, E, etc.)',
        'Black keys represent sharp/flat notes (C#, D#, etc.)',
        'Press and hold for sustained notes',
      ]
    },
    {
      title: 'Settings',
      steps: [
        'Use the Settings panel to customize how the keyboard displays',
        'Toggle key labels to show/hide keyboard shortcut labels',
        'Toggle note labels to show/hide musical notation labels',
        'Adjust bow pressure and speed for different timbres',
        'Experiment with vibrato and reverb for expression',
      ]
    },
  ];
  
  const advancedTechniques = [
    {
      title: 'Double Stops',
      description: 'Playing two strings simultaneously to create harmony',
      steps: [
        'Select notes that form consonant intervals (thirds, sixths, octaves)',
        'Apply even bow pressure across both strings',
        'Practice maintaining clean contact with both strings'
      ],
      videoUrl: '#'
    },
    {
      title: 'Harmonics',
      description: 'Creating bell-like tones by lightly touching the string',
      steps: [
        'Touch the string lightly at nodal points (1/2, 1/3, 1/4 of string length)',
        'Use a faster bow speed than normal notes',
        'Apply less bow pressure for clear harmonic sounds'
      ],
      videoUrl: '#'
    },
    {
      title: 'Tremolo',
      description: 'Rapid repetition of a note or alternation between notes',
      steps: [
        'Use small, rapid bow movements from the wrist',
        'Keep the bow in the middle to upper half for best control',
        'Practice increasing speed while maintaining even dynamics'
      ],
      videoUrl: '#'
    },
    {
      title: 'Pizzicato',
      description: 'Plucking the strings with fingers instead of using the bow',
      steps: [
        'Use the pad of your index finger to pluck the string',
        'Pluck the string perpendicular to the fingerboard',
        'For louder pizzicato, use the thumb and index finger together'
      ],
      videoUrl: '#'
    }
  ];
  
  const aiLearningFeatures = [
    {
      title: 'Real-time Feedback',
      description: 'AI analyzes your playing and provides instant guidance on intonation, rhythm, and tone quality.'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with detailed progress reports and skill analysis.'
    },
    {
      title: 'Personalized Exercises',
      description: 'Get custom practice routines based on your strengths and areas that need improvement.'
    },
    {
      title: 'Style Recognition',
      description: 'Learn different playing styles with AI that can identify and teach baroque, classical, romantic, and contemporary techniques.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl max-h-[80vh] overflow-y-auto animate-scale-up">
        <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg z-10 p-6 pb-4 flex justify-between items-start border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold">Advanced Violin Tutorial</h2>
            <p className="text-gray-500 dark:text-gray-400">Master the virtual violin with step-by-step guidance</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="how-to-play" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="how-to-play" className="flex items-center gap-2">
                <Keyboard size={16} />
                <span>How to Play</span>
              </TabsTrigger>
              <TabsTrigger value="beginner" className="flex items-center gap-2">
                <Book size={16} />
                <span>Beginner Guide</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Medal size={16} />
                <span>Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="ai-learning" className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>AI Learning</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="how-to-play" className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 rounded-lg border border-amber-100 dark:border-amber-900 mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold mb-2 text-amber-700 dark:text-amber-400">
                  <Music className="h-5 w-5" />
                  <span>How to Play the Virtual Violin</span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Use your keyboard or touch screen to play this virtual violin. Experiment with different violin types 
                  and sound settings to create your own unique sound.
                </p>
              </div>
              
              {howToPlaySections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {index === 0 && <Keyboard className="h-4 w-4" />}
                    {index === 1 && <Music className="h-4 w-4" />}
                    {index === 2 && <Volume2 className="h-4 w-4" />}
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violin-accent/10 text-violin-accent flex items-center justify-center text-sm">
                          {stepIndex + 1}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">Quick Reference</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">1-9</span>: Lower octave
                  </div>
                  <div>
                    <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">Q-P</span>: Middle octave
                  </div>
                  <div>
                    <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">A-L</span>: Higher octave
                  </div>
                  <div>
                    <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">Shift+Key</span>: Sharp notes
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="beginner" className="space-y-6">
              {beginnerSections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violin-accent/10 text-violin-accent flex items-center justify-center text-sm">
                          {stepIndex + 1}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advancedTechniques.map((technique, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold mb-1 text-violin-accent">{technique.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{technique.description}</p>
                    
                    <div className="mb-3 bg-black/90 rounded-lg h-32 flex items-center justify-center">
                      <button className="text-white bg-violin-accent/80 hover:bg-violin-accent rounded-full p-3">
                        <Play size={24} />
                      </button>
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2">Practice Steps:</h4>
                    <ul className="space-y-1">
                      {technique.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                          <ChevronRight size={12} className="mt-1 mr-1 text-violin-accent" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="ai-learning" className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-lg border border-blue-100 dark:border-blue-900 mb-6">
                <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">AI-Powered Learning Mode</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our advanced AI analyzes your playing in real-time, offering personalized feedback and suggestions to improve your technique. 
                  Practice more efficiently with guidance tailored specifically to your skills and playing style.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiLearningFeatures.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-violin-accent/10 p-2 rounded-full">
                        <Lightbulb className="text-violin-accent h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-black/90 rounded-lg p-4 text-center">
                <button className="violin-button">
                  Start AI-Powered Practice Session
                </button>
                <p className="text-gray-400 text-xs mt-2">
                  Premium feature - Upgrade your account to unlock
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Practice regularly to improve your virtual violin skills. Experiment with different settings
              to discover your own unique sound.
            </p>
            
            <button 
              onClick={onClose}
              className="violin-button w-full"
            >
              Start Playing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
