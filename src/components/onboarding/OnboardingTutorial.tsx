
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Music, Heart, Headphones, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const OnboardingTutorial = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setOpen(true);
      localStorage.setItem('hasVisitedBefore', 'true');
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

  const tutorialContent = [
    {
      icon: <Music className="h-12 w-12 text-primary" />,
      title: 'Welcome to HarmonyHub',
      description: 'Your one-stop destination for exploring musical instruments and creating beautiful music. Let us show you around!'
    },
    {
      icon: <Headphones className="h-12 w-12 text-indigo-500" />,
      title: 'Explore Instruments',
      description: 'Discover a wide range of musical instruments. Click on any instrument to learn more and even play it virtually.'
    },
    {
      icon: <Heart className="h-12 w-12 text-rose-500" />,
      title: 'Practice and Learn',
      description: 'Use our interactive tools to practice playing instruments. Record your sessions and track your progress.'
    },
    {
      icon: <Share2 className="h-12 w-12 text-emerald-500" />,
      title: 'Share Your Music',
      description: 'Create music and share it with friends and the community. Upload songs and generate instrumental versions with notes.'
    },
    {
      icon: <Music className="h-12 w-12 text-primary" />,
      title: "You're All Set!",
      description: 'Enjoy your musical journey with HarmonyHub. Click "Get Started" to begin exploring now!'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-2 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          {tutorialContent[step - 1].icon}
          <button 
            onClick={handleSkip} 
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        
        <div className="p-6">
          <DialogTitle className="text-xl text-center mb-2">
            {tutorialContent[step - 1].title}
          </DialogTitle>
          <DialogDescription className="text-center mb-6">
            {tutorialContent[step - 1].description}
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
