
import { lazy, Suspense, useEffect, useState } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { Music, Guitar, Bookmark, ChevronDown } from "lucide-react";
import { Button } from '@/components/ui/button';
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';
import AppLayout from '@/components/layout/AppLayout';

// Import the marimba components with lazy loading
const LazyMarimbaComponent = lazy(() => import("./marimba1/MarimbaPage"));
const LazyMarimba2Component = lazy(() => import("./marimba2/MarimbaPage"));

const Index = () => {
  const [selected, setSelected] = useState('Marimba 2');
  
  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Marimba - Virtual Marimba Experience',
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, []);

  return (
    <>
    <HelmetProvider>
        <title>Marimba - Interactive Virtual Marimba Experience | HarmonyHub</title>
        <meta name="description" content="Play, learn and create music with authentic marimbas - from traditional rosewood to modern synthetic, bass, and soprano models - all with realistic sounds." />
        <meta name="keywords" content="virtual marimba, online marimba, marimba simulator, rosewood marimba, synthetic marimba, bass marimba, marimba sounds" />
        <link rel="canonical" href="/" />
    </HelmetProvider>
      
      <AppLayout>
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-8 border-amber-500/20 border-double rounded-2xl m-4">
        <div className="w-full max-w-screen-xl mx-auto space-y-8">
          <header className="text-center mb-6 md:mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-medium animate-fade-in">
              Virtual Marimba Experience
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '0.1s' }}>
              Marimba <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Studio</span>
              <Music className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ml-2 text-amber-500 animate-[string-vibration_2s_ease-in-out_infinite]" />
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Play, customize, and master authentic marimbas with realistic sounds and textures
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Interactive
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Multiple Marimba Types
              </div>
            </div>


            <div className="flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={() => document.getElementById('marimba-app')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Scroll to marimba app"
              >
                Start Playing
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
            <div className="instrument-toggle flex gap-4 justify-center mt-3">
              <label className={`radio-option mr-2 ${selected === 'Marimba 1' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Marimba 1"
                  onClick={() => document.getElementById('marimba-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Marimba 1'}
                  onChange={() => setSelected('Marimba 1')}
                />
                Classic Design
              </label>
              <label className={`radio-option ${selected === 'Marimba 2' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Marimba 2"
                  onClick={() => document.getElementById('marimba-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Marimba 2'}
                  onChange={() => setSelected('Marimba 2')}
                />
                Modern Design
              </label>
            </div>

            <style>{`
                .radio-option {
                  padding: 5px 20px;
                  border: 2px solid #d1d5db;
                  border-radius: 9999px;
                  font-weight: 500;
                  color: #374151;
                  background: #f3f4f6;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  user-select: none;
                }
                .radio-option input {
                  display: none;
                }
                .radio-option.active {
                  background-color: #f59e0b;
                  color: white;
                  border-color: #d97706;
                  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
                }
                .radio-option:hover {
                  background: #e5e7eb;
                }
              `}</style>
          </header>
          
          <main id="marimba-app" className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Suspense fallback={
              <div className="flex justify-center p-8 animate-pulse">
                <div className="h-96 w-full max-w-4xl bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  Loading Marimba...
                </div>
              </div>
            }>
              {selected === 'Marimba 1' && <LazyMarimbaComponent />}
              {selected === 'Marimba 2' && <LazyMarimba2Component />}
            </Suspense>
          </main>
          
        </div>
      </div>

      {/* Add instrument interlink */}
      <InstrumentInterlink currentInstrument="Marimba" />
      </AppLayout>
    </>
  );
};

export default Index;