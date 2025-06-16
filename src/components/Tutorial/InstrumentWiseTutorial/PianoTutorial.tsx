
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Keyboard, PenSquare, Volume2, Settings } from "lucide-react";

interface PianoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const PianoTutorial = ({ isOpen, onClose }: PianoTutorialProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Piano Tutorial</DialogTitle>
          <DialogDescription>
            Learn how to play the virtual piano with this interactive guide
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="playing" className="mt-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="playing" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Playing</span>
            </TabsTrigger>
            <TabsTrigger value="keyboard" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Keyboard</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Recording</span>
            </TabsTrigger>
            <TabsTrigger value="sound" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sound</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playing" className="space-y-4">
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
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Interactive Piano</h3>
              <div className="h-40 flex items-center justify-center bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                {/* Virtual Piano will be integrated here */}
                <p>Piano interface will appear here</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keyboard" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="recording" className="space-y-4">
            <p>You can record your piano playing:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the "Start Recording" button to begin</li>
              <li>Play any notes on the piano</li>
              <li>Click "Stop Recording" when finished</li>
              <li>Use "Play Recording" to hear your melody</li>
              <li>Click "Save" to download your recording as MP3</li>
            </ol>
            <p className="text-sm italic">Recordings can be played back anytime and saved to your device.</p>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline">Start Recording</Button>
              <Button variant="outline" disabled>Stop Recording</Button>
              <Button variant="outline" disabled>Play Recording</Button>
            </div>
          </TabsContent>

          <TabsContent value="sound" className="space-y-4">
            <p>Customize your piano sound:</p>
            <ul className="space-y-2">
              <li><span className="font-medium">Volume:</span> Adjust the slider to increase or decrease overall volume</li>
              <li><span className="font-medium">Sound Type:</span> Choose between different piano sounds including Classical Piano, Grand Piano, Upright Piano and more</li>
              <li><span className="font-medium">Octave:</span> Use the Octave Up/Down buttons to shift the pitch range</li>
            </ul>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Volume</h3>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
              
              <h3 className="font-semibold mb-2 mt-4">Sound Type</h3>
              <select className="w-full p-2 rounded border">
                <option>Grand Piano</option>
                <option>Classical Piano</option>
                <option>Upright Piano</option>
                <option>Electric Piano</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <p>The Settings tab offers advanced customization:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Change visual themes (Classic, Dark, Light, Neon)</li>
              <li>Show or hide keyboard shortcuts</li>
              <li>Enable metronome and adjust tempo</li>
              <li>Toggle black key labels</li>
              <li>Enable learning mode for interactive lessons</li>
            </ul>
            <p className="text-sm italic">Experiment with different settings to personalize your piano experience.</p>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Theme</h3>
              <select className="w-full p-2 rounded border">
                <option>Classic</option>
                <option>Dark</option>
                <option>Light</option>
                <option>Neon</option>
              </select>
              
              <div className="flex items-center mt-4">
                <input type="checkbox" id="keyboard-shortcuts" className="mr-2" />
                <label htmlFor="keyboard-shortcuts">Show keyboard shortcuts</label>
              </div>
              
              <div className="flex items-center mt-2">
                <input type="checkbox" id="metronome" className="mr-2" />
                <label htmlFor="metronome">Enable metronome</label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close Tutorial</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PianoTutorial;
