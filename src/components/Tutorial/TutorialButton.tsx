
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TutorialButtonProps {
  instrumentName: string;
  instructions: string[];
  keyMappings?: { key: string; description: string }[];
}

export function TutorialButton({ instrumentName, instructions, keyMappings }: TutorialButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <HelpCircle size={18} />
        <span className="sr-only md:not-sr-only md:inline-block">Tutorial</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How to Play the {instrumentName}
            </DialogTitle>
            <DialogDescription>
              Learn how to play this virtual instrument with your mouse and keyboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 bg-white p-4 rounded-md">
            <div className="space-y-2">
              <h3 className="font-medium">Getting Started</h3>
              <ul className="space-y-1 list-disc pl-5">
                {instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{instruction}</li>
                ))}
              </ul>
            </div>

            {keyMappings && keyMappings.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Keyboard Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  {keyMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                      <kbd className="px-2 py-1 bg-background rounded text-xs font-semibold border border-border">{mapping.key}</kbd>
                      <span className="text-sm text-muted-foreground">{mapping.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <DialogClose asChild>
                <Button className="w-full">Got it</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
