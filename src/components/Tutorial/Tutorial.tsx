
import AppLayout from '@/components/layout/AppLayout';
import React, { useRef, useState, useEffect } from "react";
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

import { instrumentTutorials, InstrumentTutorial } from "@/components/Tutorial/TutorialData";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, ArrowLeft, Sparkles, Music, BookOpen, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import InstrumentKnowledge from "@/components/Tutorial/TutorialInstrumentKnowledge";
import PianoTutorial from "@/components/Tutorial/InstrumentWiseTutorial/PianoTutorial";
import ViolinTutorial from "@/components/Tutorial/InstrumentWiseTutorial/ViolinTutorial";
import GuitarTutorial from "@/components/Tutorial/InstrumentWiseTutorial/GuitarTutorial";
import HarpTutorial from "@/components/Tutorial/InstrumentWiseTutorial/HarpTutorial";
import SitarTutorial from "@/components/Tutorial/InstrumentWiseTutorial/SitarTutorial";
import VeenaTutorial from "@/components/Tutorial/InstrumentWiseTutorial/VeenaTutorial";
import BanjoTutorial from "@/components/Tutorial/InstrumentWiseTutorial/BanjoTutorial";
import FluteTutorial from "@/components/Tutorial/InstrumentWiseTutorial/FluteTutorial";
import SaxophoneTutorial from "@/components/Tutorial/InstrumentWiseTutorial/SaxophoneTutorial";
import TrumpetTutorial from "@/components/Tutorial/InstrumentWiseTutorial/TrumpetTutorial";
import HarmonicaTutorial from "@/components/Tutorial/InstrumentWiseTutorial/HarmonicaTutorial";
import DrumTutorial from "@/components/Tutorial/InstrumentWiseTutorial/DrumTutorial";
import XylophoneTutorial from "@/components/Tutorial/InstrumentWiseTutorial/XylophoneTutorial";
 
const instrumentColors: Record<string, { bg: string, text: string, border: string }> = {
  violin: { bg: "from-pink-100 to-pink-50", text: "text-pink-800", border: "border-pink-500" },  
  guitar: { bg: "from-blue-100 to-blue-50", text: "text-blue-800", border: "border-blue-400" },
  harp: { bg: "from-purple-100 to-purple-50", text: "text-purple-800", border: "border-purple-400" },
  sitar: { bg: "from-orange-100 to-orange-50", text: "text-orange-800", border: "border-orange-500" },
  veena: { bg: "from-red-100 to-red-50", text: "text-red-800", border: "border-red-400" },
  banjo: { bg: "from-amber-100 to-amber-50", text: "text-amber-800", border: "border-amber-400" },
  flute: { bg: "from-teal-100 to-teal-50", text: "text-teal-800", border: "border-teal-300" },
  saxophone: { bg: "from-yellow-100 to-yellow-50", text: "text-yellow-800", border: "border-yellow-600" },
  trumpet: { bg: "from-green-100 to-green-50", text: "text-green-800", border: "border-green-500" },
  harmonica: { bg: "from-indigo-100 to-indigo-50", text: "text-indigo-800", border: "border-indigo-300" },
  drums: { bg: "from-gray-100 to-gray-50", text: "text-gray-800", border: "border-gray-700" },
  xylophone: { bg: "from-cyan-100 to-green-50", text: "text-cyan-800", border: "border-cyan-700" },
  piano: { bg: "from-violet-100 to-violet-50", text: "text-violet-800", border: "border-violet-600" },
  kalimba: { bg: "from-orange-100 to-orange-50", text: "text-orange-800", border: "border-orange-400" },
  tabla: { bg: "from-teal-100 to-teal-50", text: "text-teal-800", border: "border-teal-600" },
  theremin: { bg: "from-gray-100 to-green-50", text: "text-gray-800", border: "border-gray-600" },
  default: { bg: "from-gray-100 to-gray-50", text: "text-gray-800", border: "border-gray-300" }
};



const Tutorial = () => {


  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [expandedInstrument, setExpandedInstrument] = useState<string | null>(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const instrumentRefs = useRef<Record<string, HTMLDivElement | null>>({});
   // State for tutorial dialogs for each instrument
   const [tutorialStates, setTutorialStates] = useState<Record<string, boolean>>({
    violin: false,
    guitar: false,
    harp: false,
    sitar: false,
    veena: false,
    banjo: false,
    flute: false,
    saxophone: false,
    trumpet: false,
    harmonica: false,
    drum: false,
    xylophone: false,
    piano: false,
    kalimba: false,
    marimba: false,
    tabla: false,
    theremin: false

  });

  const handleInstrumentSelect = (value: string) => {
    setSelectedInstrument(value);
    setExpandedInstrument(value);
    
    if (instrumentRefs.current[value]) {
      instrumentRefs.current[value]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

    // Function to open a specific tutorial
    const openTutorial = (instrumentId: string) => {
      setTutorialStates(prev => ({
        ...prev,
        [instrumentId]: true
      }));
    };
  
    // Function to close a specific tutorial
    const closeTutorial = (instrumentId: string) => {
      setTutorialStates(prev => ({
        ...prev,
        [instrumentId]: false
      }));
    };
  
  const toggleExpanded = (instrumentId: string) => {
    setExpandedInstrument(expandedInstrument === instrumentId ? null : instrumentId);
  };

  const getInstrumentColor = (instrumentId: string) => {
    return instrumentColors[instrumentId] || instrumentColors.default;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedInstrument(null);
    }, 2000);
    
    const welcomeTimeout = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 4000);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(welcomeTimeout);
    };
  }, [selectedInstrument]);

  const getRandomTip = () => {
    const tips = [
      "Practice regularly, even if just for 15 minutes a day!",
      "Record yourself playing to identify areas for improvement.",
      "Learning music theory can accelerate your progress.",
      "Try playing along with your favorite songs!",
      "Find a community of musicians to stay motivated."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (


      
    <div className="min-h-screen bg-white py-8 text-gray-800 relative overflow-hidden dark:bg-gray-900 dark:text-white">
      <Navbar />
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute animate-float opacity-20"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 10}s`
          }}
        >
          <Music 
            className="text-violet-500" 
            style={{ 
              transform: `rotate(${Math.random() * 360}deg)`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`
            }} 
          />
        </div>
      ))}
    </div>
          
    <div className="container px-4 mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center">
            <Button variant="ghost" className="text-violet-600 hover:text-purple-600 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back Home
            </Button>
          </Link>
          
          {showWelcomeAnimation && (
            <div className="animate-fade-in flex items-center bg-soft-500 rounded-full px-4 py-2 shadow-md">
              <Sparkles className="h-5 w-5 text-violet-900 mr-2" />
              <span className="text-sm font-medium text-purple-500">Welcome to our instrument tutorials!</span>
            </div>
          )}
        </div> 

        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-800 to-light bg-clip-text text-transparent animate-fade-in">
            Tutorial Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in">
          Unlock the world of music with in-depth tutorials for various instruments, tailored for beginners to pros.
          </p>
            <motion.div
  initial={{ opacity: 0, y: -8 }}   animate={{ opacity: 1, y: 0 }}
  className="bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-b-2 border-violet-500 animate-fade-in dark:border-white dark:text-white dark:bg-[#1e1e2f] shadow-md rounded-xl p-4 mb-6 transition-all duration-300"
>
            <div className="flex items-start">
              <HeartHandshake className="h-8 w-8 text-violet-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-purple-500 mb-1">Tip of the day</h3>
                <p className="text-sm text-gray-600">{getRandomTip()}</p>
              </div>
            </div>
          </motion.div>
 

          <div className="flex justify-start mb-6">
            <div className="w-full max-w-xs">
              <Select onValueChange={handleInstrumentSelect}>
                <SelectTrigger 
                  className={`border ${selectedInstrument ? getInstrumentColor(selectedInstrument).border || 'border-soft' : 'border-gray-300'} 
                  bg-white text-gray-800 w-full shadow-sm`}
                >
                  <SelectValue placeholder="Select an instrument" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-800">
                  {instrumentTutorials.map((instrument) => (
                    <SelectItem 
                      key={instrument.id} 
                      value={instrument.id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className={`h-4 w-4 rounded-full ${
                            getInstrumentColor(instrument.id).bg.split(" ")[0].replace("from-", "bg-") || "bg-gray-200"
                          }`} 
                        />
                        <span className={getInstrumentColor(instrument.id).text || ""}>{instrument.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      

<div className="space-y-8">
          {instrumentTutorials.map((instrument) => (
            <Collapsible 
              key={instrument.id}
              open={expandedInstrument === instrument.id}
              onOpenChange={() => toggleExpanded(instrument.id)}
              className="w-full"
            >
              <div 
                ref={(el) => (instrumentRefs.current[instrument.id] = el)}
                className={`transition-all duration-500 ${
                  selectedInstrument === instrument.id ? "ring-4 ring-violet-400/50 shadow-xl" : ""
                }`}
              >
                <Card className={`bg-gradient-to-br ${getInstrumentColor(instrument.id).bg} border-${getInstrumentColor(instrument.id).border.replace('border-', '')} overflow-hidden animate-scale-in hover:shadow-md transition-shadow duration-300`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <instrument.icon className={`h-8 w-8 ${getInstrumentColor(instrument.id).text}`} />
                        <CardTitle className={`text-2xl ${getInstrumentColor(instrument.id).text}`}>{instrument.name}</CardTitle>
                        <Link to={`/${instrument.id}`} className="ml-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`${getInstrumentColor(instrument.id).text} hover:bg-white/50 hover:${getInstrumentColor(instrument.id).text} flex items-center gap-1`}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${getInstrumentColor(instrument.id).text} hover:bg-white/50 hover:${getInstrumentColor(instrument.id).text} flex items-center gap-1`}
                        >
                          <span className="mr-1">Learn More</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${expandedInstrument === instrument.id ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CardDescription className="text-gray-600">
                      {instrument.about}
                    </CardDescription>
                  </CardHeader>
                  
                  <CollapsibleContent>
                    <CardContent className="pb-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div >
                        <div className="rounded-md overflow-hidden h-64 bg-white/30 shadow-sm group">
                          <img 
                            src={instrument.image + "?w=800&h=500&fit=crop&crop=entropy&auto=compress"} 
                            alt={instrument.name} 
                            className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-500 group-hover:scale-105" 
                          />
                          </div>
                          <div className="mt-6">

<Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTutorial(instrument.id);
                  }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Tutorial</span>
                </Button>  </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className={`text-xl font-medium ${getInstrumentColor(instrument.id).text}`}>{instrument.placement.title}</h3>
                          <div className="space-y-5">
                            {instrument.placement.steps.map((step) => (
                              <div key={step.id} className={`space-y-2 border-l-2 border-${getInstrumentColor(instrument.id).border.replace('border-', '')} pl-4 animate-fade-in`}>
                                <h4 className={`text-lg font-medium ${getInstrumentColor(instrument.id).text}`}>{step.title}</h4>
                                <p className="text-gray-600 text-sm">{step.description}</p>
                                {step.image && (
                                  <div className="mt-2 h-32 rounded-md overflow-hidden bg-white/20 shadow-sm">
                                    <img 
                                      src={step.image + "?w=600&h=300&fit=crop&auto=compress"} 
                                      alt={step.title} 
                                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                     
                      <div className="mt-8 transform transition-all duration-500 ease-in-out">
                        <InstrumentKnowledge 
                          instrumentId={instrument.id} 
                          colorClass={getInstrumentColor(instrument.id)} 
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                  
                  <CardFooter className={`bg-${getInstrumentColor(instrument.id).bg.split(" ")[0].replace("from-", "")} border-t ${getInstrumentColor(instrument.id).border} py-3`}>
                    <Link to={`/${instrument.id}`}>
                      <Button className="bg-violet-500 hover:bg-purple-600 text-white transition-colors duration-300 shadow-sm hover:shadow-md">
                        Play {instrument.name}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </Collapsible>
          ))}


          {/* Tutorial Components */}
        <PianoTutorial isOpen={tutorialStates.piano} onClose={() => closeTutorial('piano')} />
      \<ViolinTutorial isOpen={tutorialStates.violin} onClose={() => closeTutorial('violin')} />
        <GuitarTutorial isOpen={tutorialStates.guitar} onClose={() => closeTutorial('guitar')} />
        <HarpTutorial isOpen={tutorialStates.harp} onClose={() => closeTutorial('harp')} />
        <SitarTutorial isOpen={tutorialStates.sitar} onClose={() => closeTutorial('sitar')} />
        <VeenaTutorial isOpen={tutorialStates.veena} onClose={() => closeTutorial('veena')} />
        <BanjoTutorial isOpen={tutorialStates.banjo} onClose={() => closeTutorial('banjo')} />
        <FluteTutorial isOpen={tutorialStates.flute} onClose={() => closeTutorial('flute')} />
        <SaxophoneTutorial isOpen={tutorialStates.saxophone} onClose={() => closeTutorial('saxophone')} />
        <TrumpetTutorial isOpen={tutorialStates.trumpet} onClose={() => closeTutorial('trumpet')} />
        <HarmonicaTutorial isOpen={tutorialStates.harmonica} onClose={() => closeTutorial('harmonica')} />
        <DrumTutorial isOpen={tutorialStates.drum} onClose={() => closeTutorial('drum')} />
        <XylophoneTutorial isOpen={tutorialStates.xylophone} onClose={() => closeTutorial('xylophone')} />  

        </div>
      </div>
    </div>  
    <Footer />
     </div>
  
  
  );
};

export default Tutorial;