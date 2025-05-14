
import React from 'react';
import { Music, Guitar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialContentProps {
  onClose: () => void;
}

const TutorialContent: React.FC<TutorialContentProps> = ({ onClose }) => {
  return (
    <div className="space-y-4 my-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Music className="h-4 w-4" /> Basic Controls
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Click on the strings and frets to play individual notes</li>
          <li>Use the volume slider to adjust the sound level</li>
          <li>Choose different guitar types from the dropdown menu</li>
          <li>Toggle the play/pause button to control playback</li>
        </ul>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-semibold mb-2">Guitar Types</h3>
        <ul className="grid grid-cols-2 gap-3 text-sm">
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Acoustic:</span> Warm, balanced sound with strong mid-range
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Electric:</span> Bright tone with sustain, great with effects
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Bass:</span> Deep, low-end frequencies with 4 strings
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Classical:</span> Nylon strings with rich, mellow tone
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Flamenco:</span> Spanish guitar with unique sound
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">Steel:</span> Steel-string guitar with bright tone
          </li>
          <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <span className="font-medium">TwelveString:</span> Guitar with 12 strings
          </li>
        </ul>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-lg font-semibold mb-2">Keyboard Controls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium mb-2">String Keys:</h4>
            <ul className="space-y-1">
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Q</kbd> 
                <span>→ 1st string (high E)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">W</kbd> 
                <span>→ 2nd string (B)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">E</kbd> 
                <span>→ 3rd string (G)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">R</kbd> 
                <span>→ 4th string (D)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">T</kbd> 
                <span>→ 5th string (A)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Y</kbd> 
                <span>→ 6th string (low E)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Fret Keys:</h4>
            <ul className="space-y-1">
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">1-9</kbd> 
                <span>→ Frets 1-9</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">0</kbd> 
                <span>→ Fret 10</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Use the Effects & Settings panel to apply distortion, reverb, and delay</li>
          <li>Adjust tuning or use custom tunings for unique sounds</li>
          <li>Enable chord assist mode to see common chord fingerings</li>
          <li>Toggle note names or fret numbers for learning</li>
        </ul>
      </div>
      
      <div className="animate-fade-in bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg font-semibold mb-2">Tips & Tricks</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Try different themes to customize the look of your guitar</li>
          <li>Experiment with effects to create unique sounds</li>
          <li>Learn basic chord shapes using the chord assist mode</li>
          <li>Practice scales by enabling note names</li>
        </ul>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onClose}>Got It</Button>
      </div>
    </div>
  );
};

export default TutorialContent;
