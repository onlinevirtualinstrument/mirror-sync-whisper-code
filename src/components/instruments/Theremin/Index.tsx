
import { lazy, Suspense, useEffect, useState } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { Music, Guitar, Bookmark, ChevronDown, Wand2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PlaceholderComponent from '../PlaceholderComponent';
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';
import AppLayout from '@/components/layout/AppLayout';

// Lazy load the components
const LazyThereminComponent = lazy(() => import("./theremin1/ThereminPage"));
const LazyThereminAdvancedComponent = lazy(() => import("../PlaceholderComponent"));

// Guitar images for better loading management
const guitarImages = [
  {
    src: "/images/theremin/OnlineVirtualThereminInstrument1.png",
    alt: "Online Virtual Theremin Instrument1",
    // label: "Acoustic Guitar"
  },
  {
    src: "/images/theremin/OnlineVirtualThereminInstrument2.png",
    alt: "Online Virtual Theremin Instrument2",
    // label: "Electric Guitar"
  },
  {
    src: "/images/theremin/OnlineVirtualThereminInstrument3.png",
    alt: "Online Virtual Theremin Instrument3",
    // label: "Bass Guitar"
  }
];

const Index = () => {
  const [selected, setSelected] = useState('Guitar 1');
  
  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Theremin - Virtual Theremin Experience',
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, []);

  const navigate = useNavigate();

  return (
    <>
    <HelmetProvider>
        <title>Virtual Theremin - Interactive Virtual Theremin Experience | HarmonyHub</title>
        <meta name="description" content="Play, learn and create music with Theremin, a virtual Theremin experience with multiple Theremin types and realistic sounds." />
        <meta name="keywords" content="virtual Theremin, online Theremin, Theremin simulator, learn Theremin" />
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
              Virtual Theremin Experience
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '0.1s' }}>
              Theremin <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Studio</span>
              <Music className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ml-2 text-purple-500 animate-[string-vibration_2s_ease-in-out_infinite]" />
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Play, customize, and master the theremin with AI-powered assistance
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Interactive
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 dark:bg-gray-800/80 shadow-sm px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4 mr-1.5" />
                Multiple Theremin Types
              </div>
              
            </div>

            <div className="mt-8 grid grid-cols-3 md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {guitarImages.map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl shadow-md group hover-scale">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading={index === 0 ? "eager" : "lazy"}
                    width="500"
                    height="320"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    {/* <span className="text-white font-medium">{image.label}</span> */}
                  </div>
                </div>
              ))}
            </div>
                 
            <div className="flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={() => document.getElementById('sitar-app')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Scroll to sitar app"
              >
                Start Playing
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
            
            <div className="instrument-toggleflex gap-4 justify-center mt-3">
              <label className={`radio-option mr-2 ${selected === 'Guitar 1' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Guitar 1"
                  onClick={() => document.getElementById('sitar-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Guitar 1'}
                  onChange={() => setSelected('Guitar 1')}
                />
                Design 1
              </label>
              <label className={`radio-option ${selected === 'Guitar 2' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="instrument"
                  value="Guitar 2"
                  onClick={() => document.getElementById('sitar-app')?.scrollIntoView({ behavior: 'smooth' })}
                  checked={selected === 'Guitar 2'}
                  onChange={() => setSelected('Guitar 2')}
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
          
          <main id="sitar-app" className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Suspense fallback={
              <div className="flex justify-center p-8 animate-pulse">
                <div className="h-96 w-full max-w-4xl bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  Loading theremin...
                </div>
              </div>
            }>
              {selected === 'Guitar 1' && <LazyThereminComponent/>}
              {selected === 'Guitar 2' && <LazyThereminAdvancedComponent instrumentName="Theremin Advanced" />}
            </Suspense>
          </main>
         
        </div>
      </div>

       {/* Add instrument interlink */}
       <InstrumentInterlink currentInstrument="Theremin" />
      </AppLayout>
    </>
  );
};

export default Index;
