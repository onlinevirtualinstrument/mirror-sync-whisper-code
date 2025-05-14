
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Headphones, Info } from "lucide-react";

interface BaseTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  instrumentName: string;
  description: string;
  basics?: React.ReactNode;
  techniques?: React.ReactNode;
  listening?: React.ReactNode;
}

const BaseTutorial = ({ 
  isOpen, 
  onClose, 
  instrumentName, 
  description,
  basics,
  techniques,
  listening
}: BaseTutorialProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{instrumentName} Tutorial</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basics" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Basics</span>
            </TabsTrigger>
            <TabsTrigger value="techniques" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Techniques</span>
            </TabsTrigger>
            <TabsTrigger value="listening" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">Listening</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            {basics || (
              <>
                <p>Learn the basics of playing the {instrumentName}:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Proper hand positions and posture</li>
                  <li>Basic fingering and technique</li>
                  <li>Reading music notation for {instrumentName}</li>
                  <li>Essential care and maintenance</li>
                </ul>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">Interactive {instrumentName}</h3>
                  <div className="h-40 flex items-center justify-center bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    {/* Virtual Instrument will be integrated here */}
                    <p>{instrumentName} interface will appear here</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="techniques" className="space-y-4">
            {techniques || (
              <>
                <p>Master advanced techniques for the {instrumentName}:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Specialized playing methods</li>
                  <li>Common patterns and exercises</li>
                  <li>Style-specific techniques</li>
                  <li>Performance tips</li>
                </ul>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">Technique Examples</h3>
                  <p>Interactive technique demonstrations will be shown here.</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="listening" className="space-y-4">
            {listening || (
              <>
                <p>Listen to {instrumentName} examples:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Classical repertoire highlights</li>
                  <li>Famous {instrumentName} performers</li>
                  <li>Contemporary uses of the {instrumentName}</li>
                  <li>Cultural significance and history</li>
                </ul>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">Listen to Examples</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-white dark:bg-gray-700 rounded">
                      <Button variant="outline" size="sm" className="mr-2">▶️</Button>
                      <div>
                        <p className="font-medium">Example 1: Basic Melody</p>
                        <p className="text-xs text-gray-500">0:45</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-700 rounded">
                      <Button variant="outline" size="sm" className="mr-2">▶️</Button>
                      <div>
                        <p className="font-medium">Example 2: Advanced Technique</p>
                        <p className="text-xs text-gray-500">1:12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close Tutorial</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BaseTutorial;
