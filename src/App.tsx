import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { lazy, Suspense } from "react";
import MusicRooms from "./pages/MusicRooms.tsx";
import Blog from './pages/Blog';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

// Bundle common routes together for better chunk optimization
const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryPage = lazy(() => import("./pages/categories/CategoryPage"));
const InstrumentDetail = lazy(() => import("./pages/instruments/InstrumentDetail"));
const Auth = {
  Login: lazy(() => import("./pages/auth/Login")),
  Register: lazy(() => import("./pages/auth/Register")),
};
const Misc = {
  Tutorial: lazy(() => import("./components/Tutorial/Tutorial.tsx")),
  Blog: lazy(() => import("./pages/Blog.tsx")),
  NotFound: lazy(() => import("./pages/NotFound")),

  Help: lazy(() => import("./pages/Help")),
  About: lazy(() => import("./pages/About")),
  Privacy: lazy(() => import("./pages/Privacy")),
  MusicRoom: lazy(() => import("./pages/MusicRoom")),
  MusicRooms: lazy(() => import("./pages/MusicRooms")),
  Contact: lazy(() => import("./pages/Contact")),
  Unsubscribe: lazy(() => import("./pages/Unsubscribe.tsx")),

};

// Instrument Pages - grouped by instrument type for better code splitting
const KeyboardInstruments = {
  Piano: lazy(() => import("./pages/Piano"))
};

const StringInstruments = {
  GuitarIndex: lazy(() => import("./components/instruments/guitar/Index.tsx")),
  ViolinIndex: lazy(() => import("./components/instruments/violin/Index.tsx")),
  VeenaIndex: lazy(() => import("./components/instruments/veena/Index.tsx")),
  BanjoIndex: lazy(() => import("./components/instruments/banjo/Index.tsx")),
  SitarIndex: lazy(() => import("./components/instruments/sitar/Index.tsx")),
  HarpIndex: lazy(() => import("./components/instruments/harp/Index.tsx")),
};

const WindInstruments = {
  FluteIndex: lazy(() => import("./components/instruments/flute/Index.tsx")),
  SaxophoneIndex: lazy(() => import("./components/instruments/saxophone/Index.tsx")),
  TrumpetIndex: lazy(() => import("./components/instruments/trumpet/Index.tsx")),
  HarmonicaIndex: lazy(() => import("./components/instruments/harmonica/Index.tsx")),
};

const PercussionInstruments = {
  DrumsIndex: lazy(() => import("./components/instruments/drum/Index.tsx")),
  XylophoneIndex: lazy(() => import("./components/instruments/xylophone/Index.tsx")),
  KalimbaIndex: lazy(() => import("./components/instruments/Kalimba/Index.tsx")),
  MarimbaIndex: lazy(() => import("./components/instruments/Marimba/Index.tsx")),
  TablaIndex: lazy(() => import("./components/instruments/Tabla/Index.tsx")),
  ThereminIndex: lazy(() => import("./components/instruments/Theremin/Index.tsx")),
};

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered: ', registration);
    }).catch(error => {
      console.log('Service Worker registration failed: ', error);
    });
  });
}

// Create a QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes - replaces deprecated 'cacheTime'
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<CategoryPage />} />
              <Route path="/instruments/:instrumentId" element={<InstrumentDetail />} />
              <Route path="/auth/login" element={<Auth.Login />} />
              <Route path="/auth/register" element={<Auth.Register />} />
              <Route path="/tutorial" element={<Misc.Tutorial />} />
              <Route path="/blog/*" element={<Blog />} />

              {/* New routes */}
              <Route path="/help" element={<Misc.Help />} />
              <Route path="/about" element={<Misc.About />} />
              <Route path="/privacy" element={<Misc.Privacy />} />
              <Route path="/contact" element={<Misc.Contact />} />
              <Route path="/room/:roomId" element={<Misc.MusicRoom />} />
              <Route path="/music-rooms" element={<MusicRooms />} />
              <Route path="/unsubscribe" element={<Misc.Unsubscribe />} />
              
              {/* Instrument Routes */}
              <Route path="/piano" element={<KeyboardInstruments.Piano />} />
              <Route path="/flute" element={<WindInstruments.FluteIndex />} />
              <Route path="/guitar" element={<StringInstruments.GuitarIndex />} />
              <Route path="/violin" element={<StringInstruments.ViolinIndex />} />
              <Route path="/banjo" element={<StringInstruments.BanjoIndex />} />
              <Route path="/drums" element={<PercussionInstruments.DrumsIndex />} />
              <Route path="/harmonica" element={<WindInstruments.HarmonicaIndex />} />
              <Route path="/harp" element={<StringInstruments.HarpIndex />} />
              <Route path="/saxophone" element={<WindInstruments.SaxophoneIndex />} />
              <Route path="/sitar" element={<StringInstruments.SitarIndex />} />
              <Route path="/trumpet" element={<WindInstruments.TrumpetIndex />} />
              <Route path="/veena" element={<StringInstruments.VeenaIndex />} />
              <Route path="/xylophone" element={<PercussionInstruments.XylophoneIndex />} /> 
              <Route path="/kalimba" element={<PercussionInstruments.KalimbaIndex />} />
              <Route path="/marimba" element={<PercussionInstruments.MarimbaIndex />} />
              <Route path="/tabla" element={<PercussionInstruments.TablaIndex />} />
              <Route path="/theremin" element={<PercussionInstruments.ThereminIndex />} />
              
              {/* Alias routes for SEO and category organization */}
              <Route path="/categories/strings/piano" element={<KeyboardInstruments.Piano />} />
              <Route path="/categories/keyboard/piano" element={<KeyboardInstruments.Piano />} />
              <Route path="/categories/percussion/kalimba" element={<PercussionInstruments.KalimbaIndex />} />
              <Route path="/categories/percussion/marimba" element={<PercussionInstruments.MarimbaIndex />} />
              <Route path="/categories/percussion/tabla" element={<PercussionInstruments.TablaIndex />} />
              
              {/* 404 route - must be the last */}
              <Route path="*" element={<Misc.NotFound />} />
            </Routes>
            <OnboardingTutorial />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
