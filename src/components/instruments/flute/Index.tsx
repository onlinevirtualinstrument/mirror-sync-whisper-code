
import { HelmetProvider } from 'react-helmet-async';
import { lazy, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Music, Guitar, Bookmark, ChevronDown } from "lucide-react";
import AppLayout from '@/components/layout/AppLayout';

// Use lazy loading to improve initial load performance
const FluteMaster1Component = lazy(() => import("./FluteMasterComponent"));
const FluteMaster2Component = lazy(() => import("./flute2/FlutePage"));
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';



const Index = () => {
  // Get the canonical URL from the current window location
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : 'https://melodia-fluteverse.com/';
  
  const [selected, setSelected] = useState('Flute 2');
  const navigate = useNavigate();
  
  return (
    <>
    <HelmetProvider>
        <title>Virtual Flute - Interactive Virtual Flute Experience | HarmonyHub</title>
        <meta name="description" content="Play various flute types from around the world with HarmonyHub's interactive virtual flute application. Learn and create beautiful melodies with our digital instrument." />
        <meta name="keywords" content="virtual flute, digital instrument, melodia, music app, bansuri, pan flute, native flute, western flute, shakuhachi, online music instrument, learn flute, play flute online" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="Flute - Interactive Virtual Flute Experience" />
        <meta name="language" content="English" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Flute - Interactive Virtual Flute Experience" />
        <meta property="og:description" content="Play various flute types from around the world with HarmonyHub's interactive virtual flute application." />
        <meta property="og:image" content="/lovable-uploads/de01227d-7a6f-49d6-aa18-71d943558930.png" />
        <meta property="og:site_name" content="Melodia FlutVerse" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Flute - Interactive Virtual Flute Experience" />
        <meta name="twitter:description" content="Play various flute types from around the world with Harmonica's interactive virtual flute application." />
        <meta name="twitter:image" content="/lovable-uploads/de01227d-7a6f-49d6-aa18-71d943558930.png" />
        
        {/* Canonical link */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Structured Data - JSON-LD */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Melodia - Virtual Flute Experience",
              "description": "Interactive virtual flute application for playing various flute types from around the world.",
              "url": "${canonicalUrl}",
              "applicationCategory": "EducationalApplication, MusicApplication",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "operatingSystem": "Any"
            }
          `}
        </script>
</HelmetProvider>
      <AppLayout>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90 p-6 border-4 border-primary/30 rounded-xl shadow-xl mx-4 my-4">
        <div className="w-full max-w-screen-xl mx-auto space-y-8">
          {/* <Button variant="outline" className="hover:bg-gray-200" onClick={() => navigate("/")}>
            Back to Home
          </Button> */}
          
          <header className="text-center mb-6 md:mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-medium animate-fade-in">
              Virtual Flute Experience
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '0.1s' }}>
              Flute <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Studio</span>
              <Music className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ml-2 text-purple-500 animate-[string-vibration_2s_ease-in-out_infinite]" />
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Play, customize, and master the flute with AI-powered assistance
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Interactive
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Multiple Flute Types
              </div>
              
            </div>

            <div className="text-center flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={() => document.getElementById('flute-app')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Scroll to flute app"
              >
                Start Playing
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
            
            <div className="instrument-toggle flex gap-4 justify-center mt-3">
              <label className={`radio-option mr-2 ${selected === 'Flute 1' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Flute 1"
                  onClick={() => document.getElementById('flute-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Flute 1'}
                  onChange={() => setSelected('Flute 1')}
                />
                Design 1
              </label>
              <label className={`radio-option ${selected === 'Flute 2' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Flute 2"
                  onClick={() => document.getElementById('flute-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Flute 2'}
                  onChange={() => setSelected('Flute 2')}
                />
                Design 2
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
                background-color: #7c3aed;
                color: white;
                border-color: #7c3aed;
                box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
              }
              .radio-option:hover {
                background: #e5e7eb;
              }
            `}</style>
          </header>
        </div>
        
        <div id="flute-app">
          {selected === 'Flute 1' && <FluteMaster1Component />}
          {selected === 'Flute 2' && <FluteMaster2Component />}
        </div>
         
      </div>
      {/* Add instrument interlink */}
      <InstrumentInterlink currentInstrument="Flute" />
      </AppLayout>
    </>
  );
};

export default Index;
