
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
const Home = React.lazy(() => import('@/pages/Index'));
const MusicRoom = React.lazy(() => import('@/components/room/MusicRoom'));
const BlogDraftManager = React.lazy(() => import('@/components/blog/BlogDraftManager'));
const Piano = React.lazy(() => import('@/pages/Piano'));
const Guitar = React.lazy(() => import('@/components/instruments/guitar/Guitar2/index'));
const Drums = React.lazy(() => import('@/components/instruments/drum-drum machine/components/drums2/DrumKit'));
const Flute = React.lazy(() => import('@/components/instruments/flute/Index'));
const Saxophone = React.lazy(() => import('@/components/instruments/Saxophone/Index'));
const BeatMaker = React.lazy(() => import('@/components/instruments/BeatMaker/Index'));
const Theremin = React.lazy(() => import('@/components/instruments/Theremin/Index'));
const Blog = React.lazy(() => import('@/components/blog/BlogList'));
const BlogPost = React.lazy(() => import('@/components/blog/BlogDetail'));
const BlogEditor = React.lazy(() => import('@/components/blog/BlogEditor'));
const Login = React.lazy(() => import('@/components/auth/LoginForm'));
const Register = React.lazy(() => import('@/components/auth/SignUpForm'));
const ForgotPassword = React.lazy(() => import('@/components/auth/ForgotPasswordForm'));
const Profile = React.lazy(() => import('@/components/auth/UserButton').then(module => ({ default: module.UserButton })));
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
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
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
