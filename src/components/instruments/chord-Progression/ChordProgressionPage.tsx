
import React, { useRef } from 'react';
import ChordProgressionPlayer from "./ChordProgressionPlayer";
import { motion } from "framer-motion";
import { ChordProgressionFooter } from "./ChordProgressionFooter";
import { CardFooter } from "@/components/ui/card";
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";


const ChordProgressionPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen py-1 max-w-4xl mx-auto px-1 bg-gradient-to-br from-background to-accent/10">

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="landscape-warning text-center mb-8 text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
          <p>For the best experience, expand to full screen.
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              Click here to expand
            </strong>
          </p>
        </div>
        <style>{`
            @media (min-width: 768px) {
              .landscape-warning {
                display: none;
              }
            }
          `}</style>


       <FullscreenWrapper ref={containerRef} instrumentName="banjo">
          <ChordProgressionPlayer />
        </FullscreenWrapper>
        <CardFooter className="border-2 border-black-500 rounded-xl flex flex-col px-0">
          <ChordProgressionFooter className="p-6" />
        </CardFooter>


      </motion.div>
    </div>
  );
};

export default ChordProgressionPage;
