
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Music, 
  Keyboard, 
  BookOpen, 
  Volume2, 
  Settings, 
  PenSquare 
} from 'lucide-react';

interface PianoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const PianoTutorial: React.FC<PianoTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorialSteps = [
    {
      title: "Welcome to the Piano Tutorial",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Welcome to the interactive piano experience! This tutorial will guide you through all the features available to help you play and learn piano.</p>
          <p>Click 'Next' to continue or navigate through the tutorial steps using the dots below.</p>
        </div>
      )
    },
    {
      title: "Playing the Piano",
      icon: <Music className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Click on the piano keys with your mouse to play notes. White keys are natural notes (C, D, E, F, G, A, B) and black keys are sharps/flats (C#, D#, F#, G#, A#).</p>
          <p>You can also use your computer keyboard to play:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
              <span className="font-bold">A</span> = C
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
              <span className="font-bold">W</span> = C#
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
              <span className="font-bold">S</span> = D
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
              <span className="font-bold">E</span> = D#
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Keyboard Shortcuts",
      icon: <Keyboard className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>The keyboard layout follows a piano-like pattern:</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
              <p className="text-sm"><span className="font-bold">Bottom Row:</span> A, S, D, F, G, H, J, K, L, ;</p>
              <p className="text-sm font-light">Maps to white keys C through E</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
              <p className="text-sm"><span className="font-bold">Top Row:</span> W, E, T, Y, U, O, P</p>
              <p className="text-sm font-light">Maps to black keys (sharps/flats)</p>
            </div>
          </div>
          <p className="text-sm italic">Tip: Look for keyboard letters on the piano keys when "Keyboard Shortcuts" is enabled in settings.</p>
        </div>
      )
    },
    {
      title: "Recording",
      icon: <PenSquare className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>You can record your piano playing:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click the "Start Recording" button to begin</li>
            <li>Play any notes on the piano</li>
            <li>Click "Stop Recording" when finished</li>
            <li>Use "Play Recording" to hear your melody</li>
            <li>Click "Save" to download your recording as MP3</li>
          </ol>
          <p className="text-sm italic">Recordings can be played back anytime and saved to your device.</p>
        </div>
      )
    },
    {
      title: "Sound Settings",
      icon: <Volume2 className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Customize your piano sound:</p>
          <ul className="space-y-2">
            <li><span className="font-medium">Volume:</span> Adjust the slider to increase or decrease overall volume</li>
            <li><span className="font-medium">Sound Type:</span> Choose between different piano sounds including Classical Piano, Grand Piano, Upright Piano and more</li>
            <li><span className="font-medium">Octave:</span> Use the Octave Up/Down buttons to shift the pitch range</li>
          </ul>
        </div>
      )
    },
    {
      title: "Advanced Settings",
      icon: <Settings className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>The Settings tab offers advanced customization:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Change visual themes (Classic, Dark, Light, Neon)</li>
            <li>Show or hide keyboard shortcuts</li>
            <li>Enable metronome and adjust tempo</li>
            <li>Toggle black key labels</li>
            <li>Enable learning mode for interactive lessons</li>
          </ul>
          <p className="text-sm italic">Experiment with different settings to personalize your piano experience.</p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < tutorialSteps.length) {
      setCurrentStep(step);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-gray-900 w-full max-w-2xl mx-4 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                {tutorialSteps[currentStep].icon}
                <h2 className="text-xl font-semibold">{tutorialSteps[currentStep].title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tutorialSteps[currentStep].content}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-between items-center">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentStep 
                        ? 'bg-primary scale-125' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    onClick={() => goToStep(index)}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={currentStep === tutorialSteps.length - 1}
                  className="flex items-center gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PianoTutorial;
