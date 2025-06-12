
import { useState, useRef } from 'react';
import { useHarpAudio } from './HarpAudio';
import { useHarpKeyboard } from './HarpKeyboard';
import { harpVariants } from './HarpVariants';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import SoundControls from '@/utils/music/SoundControls';
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import { motion } from 'framer-motion';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

 
const Harp = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [harpVariant, setHarpVariant] = useState<string>('standard');
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  const { 
    activeString,
    strings,
    pluckString
  } = useHarpAudio(harpVariant);
  
  // Setup keyboard control
  useHarpKeyboard({
    strings,
    pluckString
  });
  
  // Tutorial content
  const harpInstructions = [
    "Click on the strings to play different notes on the harp",
    "You can also use keyboard keys A-K to play different strings",
    "Try different harp types from the dropdown menu for different sounds",
    "Adjust the volume using the controls below"
  ];

  const keyMappings = [
    { key: "A-K", description: "Play different strings" }
  ];
  
  // Get style classes based on variant
  const getStyleClasses = () => {
    switch(harpVariant) {
      case 'celtic':
        return {
          card: 'from-green-50/30 to-green-100/40 border-green-200/50',
          frameLeft: 'from-green-700 to-green-900',
          frameBottom: 'from-green-700 to-green-800',
          button: 'bg-green-100 hover:bg-green-200',
          stringBase: 'bg-amber-200',
          stringActive: 'bg-accent shadow-accent/50',
          stringColor: 'green'
        };
      case 'concert':
        return {
          card: 'from-yellow-50/30 to-yellow-100/40 border-yellow-200/50',
          frameLeft: 'from-yellow-700 to-yellow-900',
          frameBottom: 'from-yellow-700 to-yellow-800',
          button: 'bg-yellow-100 hover:bg-yellow-200',
          stringBase: 'bg-amber-300',
          stringActive: 'bg-yellow-200 shadow-yellow-500/50',
          stringColor: 'gold'
        };
      case 'classical':
        return {
          card: 'from-amber-50/30 to-amber-100/40 border-amber-200/50',
          frameLeft: 'from-amber-800 to-amber-950',
          frameBottom: 'from-amber-800 to-amber-900',
          button: 'bg-amber-100 hover:bg-amber-200',
          stringBase: 'bg-amber-400',
          stringActive: 'bg-amber-200 shadow-amber-500/50',
          stringColor: 'amber'
        };
      case 'electric':
        return {
          card: 'from-blue-50/30 to-blue-100/40 border-blue-200/50',
          frameLeft: 'from-blue-800 to-blue-950',
          frameBottom: 'from-blue-800 to-blue-900',
          button: 'bg-blue-100 hover:bg-blue-200',
          stringBase: 'bg-blue-200',
          stringActive: 'bg-blue-100 shadow-blue-300/50',
          stringColor: 'blue'
        };
      default:
        return {
          card: 'from-blue-50/30 to-blue-100/40 border-blue-200/50',
          frameLeft: 'from-amber-700 to-amber-900',
          frameBottom: 'from-amber-700 to-amber-800',
          button: 'bg-blue-100 hover:bg-blue-200',
          stringBase: 'bg-amber-200',
          stringActive: 'bg-accent shadow-accent/50',
          stringColor: 'amber'
        };
    }
  };
  
  const styles = getStyleClasses();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={harpVariant}
          setVariant={setHarpVariant}
          variants={harpVariants}
          label="Select Harp Type"
        />
        
        <TutorialButton 
          instrumentName="Harp"
          instructions={harpInstructions}
          keyMappings={keyMappings}
        />

        <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
                    <p>
                      <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                        ⛶Zoom
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
      </div>
      
      <FullscreenWrapper ref={containerRef} instrumentName="banjo">
      <motion.div 
        className={`glass-card p-8 rounded-xl backdrop-blur-sm bg-gradient-to-br ${styles.card} border shadow-xl`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-full h-80 flex justify-center">
          <div className="relative w-56 h-full">
            <motion.div 
              className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b ${styles.frameLeft} rounded-t-lg shadow-md`}
              animate={{ x: activeString ? [-1, 1, 0] : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            ></motion.div>
            <motion.div 
              className={`absolute left-0 bottom-0 w-40 h-12 bg-gradient-to-r ${styles.frameBottom} rounded-r-lg shadow-md`}
              animate={{ y: activeString ? [-1, 1, 0] : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            ></motion.div>
            
            {strings.map((string, i) => (
              <motion.div 
                key={i}
                className={`absolute cursor-pointer transition-all ${
                  activeString === string.id 
                    ? `animate-[pulse_0.5s_ease-in-out] ${styles.stringActive}`
                    : `${styles.stringBase} hover:bg-accent/70`
                } shadow-sm`}
                style={{ 
                  left: `${20 + i * 12}px`,
                  height: `${string.length + 130}px`,
                  width: activeString === string.id ? '2px' : '1px',
                  bottom: '48px',
                  transform: `rotate(${5 + i}deg)`,
                  transformOrigin: 'bottom center'
                }}
                onClick={() => pluckString(string.id)}
                animate={activeString === string.id ? {
                  width: ['1px', '3px', '1px'],
                  filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                } : {}}
                transition={{ duration: 0.5 }}
                // whileHover={{ scale: 1.01 }}
              >
                <motion.span 
                  className="absolute -bottom-10 -left-2 text-xs font-medium"
                  animate={activeString === string.id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >{string.note}</motion.span>
                <span className="absolute -top-10 -left-2 text-xs text-muted-foreground">{string.key}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      </FullscreenWrapper>

      <div className="mt-6">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>
      
      {/* <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Pluck the harp strings by clicking on them or using keyboard keys (A-K)</p>
      </div> */}
    </div>
  );
};

export default Harp;
