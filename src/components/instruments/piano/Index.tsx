
import React, { useState, useEffect } from 'react';
import { lazy, Suspense } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { Music, Piano, Bookmark, ChevronDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';
import AppLayout from '@/components/layout/AppLayout';
import { lockToLandscape } from "../../landscapeMode/lockToLandscape";


const LazyVirtualPianoComponent = lazy(() => 
  import(/* webpackChunkName: "virtual-guitar-component" */ "@/components/instruments/piano/piano1/Piano")
);



const Index = () => {

  // lockToLandscape();
  
  // React hooks must be called at the top level
  const navigate = useNavigate();
  const [selected, setSelected] = useState('Guitar 1');
  
  useEffect(() => {
   
    // Track page view for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Piano - Virtual Piano Experience',
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, []);

  return (
    <>
    <HelmetProvider>
        <title>Virtual Piano - Interactive Virtual Piano Experience | HarmonyHub</title>
        <meta name="description" content="Play, learn and create music with HarmonyHub, a virtual piano experience with multiple instrument types and realistic sounds." />
        <meta name="keywords" content="virtual piano, online piano, piano simulator, learn playing piano, acoustic piano, electric piano" />
        <link rel="canonical" href="/" />
    </HelmetProvider>
      
      <AppLayout>
      <div className="min-h-screen flex flex-col items-center justify-center py-8 overflow-x-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-8 border-purple-500/20 border-double rounded-2xl m-4">
        <div className="w-full  max-w-screen-xl mx-auto space-y-8">
          {/* <Button variant="outline" className="hover:bg-gray-200" onClick={() => navigate("/")}>
            Back to Home
          </Button> */}
          <header className="text-center  mt-6 md:mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-medium animate-fade-in">
              Virtual Piano Experience
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '0.1s' }}>
            Piano<span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Studio</span>
              <Piano className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ml-2 text-purple-500 animate-[string-vibration_2s_ease-in-out_infinite]" />
            </h1>
                

      
                        
                        <div className="flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                          <button 
                            onClick={() => document.getElementById('piano-app')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Scroll to guitar app"
                          >
                            Start Playing
                            <ChevronDown className="w-4 h-4 animate-bounce" />
                          </button>
                        </div>

            </header>
          
          <main id="guitar-app" className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Suspense fallback={
              <div className="flex justify-center p-8 animate-pulse">
                <div className="h-96 w-full max-w-4xl bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  Loading piano...
                </div>
              </div>
            }>
              <LazyVirtualPianoComponent />
              
            </Suspense>
          </main>
          
        </div>
      </div>

      {/* Add instrument interlink */}
      <InstrumentInterlink currentInstrument="Piano" />
      </AppLayout>
    </>
  );
};

export default Index;
