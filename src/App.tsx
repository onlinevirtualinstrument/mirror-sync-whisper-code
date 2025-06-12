import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import './App.css';

// SEO and PWA Components
import AdvancedSEO from '@/components/seo/AdvancedSEO';
import InstallPrompt from '@/components/pwa/InstallPrompt';

// Lazy load components for better performance
const Home = React.lazy(() => import('@/components/Home/Home'));
const MusicRoom = React.lazy(() => import('@/components/room/MusicRoom'));
const BlogDraftManager = React.lazy(() => import('@/components/blog/BlogDraftManager'));
const Piano = React.lazy(() => import('@/components/instruments/Piano/Piano'));
const Guitar = React.lazy(() => import('@/components/instruments/Guitar/Guitar'));
const Drums = React.lazy(() => import('@/components/instruments/drum-drum machine/components/drums2/DrumKit'));
const Flute = React.lazy(() => import('@/components/instruments/Flute/Flute'));
const Saxophone = React.lazy(() => import('@/components/instruments/Saxophone/Saxophone'));
const BeatMaker = React.lazy(() => import('@/components/instruments/BeatMaker/BeatMaker'));
const Theremin = React.lazy(() => import('@/components/instruments/Theremin/Theremin'));
const Blog = React.lazy(() => import('@/components/blog/Blog'));
const BlogPost = React.lazy(() => import('@/components/blog/BlogPost'));
const BlogEditor = React.lazy(() => import('@/components/blog/BlogEditor'));
const Login = React.lazy(() => import('@/components/Auth/Login'));
const Register = React.lazy(() => import('@/components/Auth/Register'));
const ForgotPassword = React.lazy(() => import('@/components/Auth/ForgotPassword'));
const Profile = React.lazy(() => import('@/components/Auth/Profile'));
const Contact = React.lazy(() => import('@/components/Contact/Contact'));
const About = React.lazy(() => import('@/components/About/About'));
const Pricing = React.lazy(() => import('@/components/Pricing/Pricing'));
const Terms = React.lazy(() => import('@/components/Terms/Terms'));
const Privacy = React.lazy(() => import('@/components/Privacy/Privacy'));
const NotFound = React.lazy(() => import('@/components/NotFound/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AdvancedSEO />
            <div className="App">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/music-room/:roomId" element={<MusicRoom />} />
                  <Route path="/piano" element={<Piano />} />
                  <Route path="/guitar" element={<Guitar />} />
                  <Route path="/drums" element={<Drums />} />
                  <Route path="/flute" element={<Flute />} />
                  <Route path="/saxophone" element={<Saxophone />} />
                  <Route path="/beatmaker" element={<BeatMaker />} />
                  <Route path="/theremin" element={<Theremin />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/blog/create" element={<BlogEditor mode="create" />} />
                  <Route path="/blog/edit/:id" element={<BlogEditor mode="edit" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/blog/drafts" element={<BlogDraftManager />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              
              <InstallPrompt />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
