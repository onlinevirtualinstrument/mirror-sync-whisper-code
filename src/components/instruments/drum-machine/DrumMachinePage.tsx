
import React from "react";
import DrumMachine from "./DrumMachine";
import { DrumFooter } from "./DrumFooter";
import { motion } from "framer-motion";
import { CardFooter } from "@/components/ui/card";
import { toggleFullscreen } from "../../landscapeMode/lockToLandscape";


const DrumMachinePage: React.FC = () => {

  return (
    <div className="min-h-screen py-1  bg-gradient-to-br from-background to-accent/10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-4"
        >
          <DrumMachine />
          <CardFooter className="mt-6  border-2 border-black-500 rounded-xl flex flex-col px-0">
            <DrumFooter />
          </CardFooter>
        </motion.div>
    </div>
  );
};

export default DrumMachinePage;
