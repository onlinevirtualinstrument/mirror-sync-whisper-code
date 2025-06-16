
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChordInProgression, rootNotes, chordTypes } from "./types/chordTypes";

interface ChordBlockProps {
  chord: ChordInProgression;
  isActive?: boolean;
  onChange: (chord: ChordInProgression) => void;
  onPlay: () => void;
}

export const ChordBlock: React.FC<ChordBlockProps> = ({
  chord,
  isActive = false,
  onChange,
  onPlay
}) => {
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Get chord display text
  const getChordDisplay = () => {
    const chordType = chordTypes.find(ct => ct.id === chord.type);
    return `${chord.root}${chordType?.symbol || ''}`;
  };

  return (
    <Card 
      className={`
        md:w-24 md:h-24 w-20 h-20 cursor-pointer transition-all duration-300
        ${isActive 
          ? 'bg-primary/20 scale-105 shadow-lg border-primary/30' 
          : 'hover:bg-accent hover:scale-[1.03]'}
      `}
      onClick={onPlay}
    >
      <CardContent className="p-0 h-full w-full flex items-center justify-center relative">
        {/* Chord display */}
        <div className="text-3xl font-medium transition-all duration-300">
          {getChordDisplay()}
        </div>
        
        {/* Root note selector (on long press or right click in full implementation) */}
        <DropdownMenu open={isRootOpen} onOpenChange={setIsRootOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="absolute top-0 left-0 h-8 w-8 p-0 opacity-0 hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsRootOpen(true);
              }}
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[100px] max-h-[200px] overflow-y-auto">
            {rootNotes.map((note) => (
              <DropdownMenuItem 
                key={note}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...chord, root: note });
                  setIsRootOpen(false);
                }}
                className={chord.root === note ? 'bg-primary/20' : ''}
              >
                {note}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Chord type selector */}
        <DropdownMenu open={isTypeOpen} onOpenChange={setIsTypeOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="absolute top-0 right-0 h-8 w-8 p-0 opacity-0 hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeOpen(true);
              }}
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px] max-h-[200px] overflow-y-auto">
            {chordTypes.map((type) => (
              <DropdownMenuItem 
                key={type.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...chord, type: type.id });
                  setIsTypeOpen(false);
                }}
                className={chord.type === type.id ? 'bg-primary/20' : ''}
              >
                {type.name} ({type.symbol || 'Major'})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Visual indicators at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-evenly p-1">
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};
