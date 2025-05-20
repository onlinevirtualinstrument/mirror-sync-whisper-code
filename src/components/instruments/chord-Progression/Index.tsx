import { lazy, Suspense, useEffect, useState } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { Music, Guitar, Bookmark, ChevronDown, Wand2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';
import AppLayout from '@/components/layout/AppLayout';
import { lockToLandscape } from "../../landscapeMode/lockToLandscape";
import LandscapeInstrumentModal from '../../landscapeMode/LandscapeInstrumentModal';
import ChordProgressionPlayer from "./ChordProgressionPlayer";


const LazyChordProgressionPlayerComponent = lazy(() => import("./ChordProgressionPage"));


const Index = () => {

  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Chord Progression - Virtual Chord Progression Experience',
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, []);

 const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    await lockToLandscape();
    setOpen(true);
  };

  return (


    <>
      <HelmetProvider>
        <title>Virtual Chord Progression - Interactive Virtual Chord Progression Experience | HarmonyHub</title>
        <meta name="description" content="Play, learn and create music with a virtual chord progression experience with dynamic change types and realistic sounds." />
        <meta name="keywords" content="virtual Chord Progression, online Chord Progression, Chord Progression simulator, play Chord Progression online " />
        <link rel="canonical" href="/" />
      </HelmetProvider>

      <AppLayout>

      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-8 border-purple-500/20 border-double rounded-2xl m-4">
        <div className="w-full max-w-screen-xl mx-auto space-y-8">
        {/* <Button variant="outline" className="hover:bg-gray-200" onClick={() => navigate("/")}>
          Back to Home
        </Button> */}
          <header className="text-center mb-6 md:mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-medium animate-fade-in">
              Virtual Chord Progression Experience
            </div>
            
            <h1 className="flex flex-row gap-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in flex items-center justify-center" style={{ animationDelay: '0.1s' }}>
              Chord Progression <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Studio</span>
              <Music className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ml-2 text-purple-500 animate-[string-vibration_2s_ease-in-out_infinite]" />
            </h1>
  
            <div className="flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={() => document.getElementById('banjo-app')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Scroll to banjo app"
              >
                Start Playing
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
              </div>

          </header>
          
          <main id="banjo-app" className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 p-2 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, please rotate your device to landscape mode.
                  <strong  onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                    Click to enter Landscape Mode
                  </strong> 
                </p>
                <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
                  <LazyChordProgressionPlayerComponent />
                </LandscapeInstrumentModal>
              </div>
              <style>{`
                @media (min-width: 768px) {
          .landscape-warning {
            display: none;
          }
        }
      `}</style>
            <Suspense fallback={
              <div className="flex justify-center p-8 animate-pulse">
                <div className="h-96 w-full max-w-4xl bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  Loading Chord Progression Player...
                </div>
              </div>
            }>
             <LazyChordProgressionPlayerComponent/>
            </Suspense>
          </main>
          
        </div>
      </div>
       {/* Add instrument interlink */}
       <InstrumentInterlink currentInstrument="Banjo" />
      </AppLayout>
    </>

  );
};

export default Index;
