
import React from "react";
import ChordProgressionPlayer from "./ChordProgressionPlayer";
import { motion } from "framer-motion";
import { ChordProgressionFooter } from "./ChordProgressionFooter";
import { CardFooter } from "@/components/ui/card";


const ChordProgressionPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-accent/10">
      
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <ChordProgressionPlayer />
<CardFooter className="border-2 border-black-500 rounded-xl flex flex-col px-0">
  <ChordProgressionFooter className="p-6"/>
</CardFooter>


        </motion.div>
      </div>
    </div>
  );
};

export default ChordProgressionPage;
