
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, PianoIcon, Headphones, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const FirstVisitTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('firstVisitTourSeen');
    if (!hasVisited) {
      setOpen(true);
      localStorage.setItem('firstVisitTourSeen', 'true');
    }
  }, []);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setOpen(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  const tourContent = [
    {
      icon: <Music className="h-12 w-12 text-primary" />,
      title: 'Welcome to HarmonyHub',
      description: 'Your place to explore and enjoy musical instruments. Let us show you around!'
    },
    {
      icon: <PianoIcon className="h-12 w-12 text-indigo-500" />,
      title: 'Play the Piano',
      description: 'Click on the piano keys or use your computer keyboard to play. You can record your melodies too!'
    },
    {
      icon: <Headphones className="h-12 w-12 text-rose-500" />,
      title: 'Explore More Instruments',
      description: 'Discover various musical instruments in our collection. Click on any instrument to learn more and try it out.'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          {tourContent[step - 1].icon}
          <button 
            onClick={handleSkip} 
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        
        <div className="p-6">
          <DialogTitle className="text-xl text-center mb-2">
            {tourContent[step - 1].title}
          </DialogTitle>
          <DialogDescription className="text-center mb-6">
            {tourContent[step - 1].description}
          </DialogDescription>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-6 rounded-full ${i + 1 === step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button onClick={handleNext}>
                {step === totalSteps ? 'Get Started' : 'Next'}
                {step !== totalSteps && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstVisitTour;
