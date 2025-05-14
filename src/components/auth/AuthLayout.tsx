
import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}


  
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  backgroundImage = '/images/auth-bg.jpg',
  className
}) => {

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleClose = () => {
    navigate('/'); // Navigate to home
  };


  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">

         

        <div className="h-full w-full bg-black/40 p-12 flex flex-col justify-between">
        <div className="fixed top-4 left-4 z-10 flex gap-4">
        <Button onClick={handleBack} variant="outline" size="icon" className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <Button onClick={handleClose} variant="secondary" size="icon" className="rounded-full">
          <X size={20} />
        </Button>
      </div>

          <div className="mt-5">
            <Link to="/" className="text-white flex items-center">
            <div className="mr-1 w-10 h-10 rounded-xl bg-gradient-to-br from-white-900 to-gray-700 dark:from-white-700 dark:to-gray-500 flex items-center justify-center text-white font-semibold animate-pulse-gentle">
            H
          </div>
              <span className="text-xl font-bold">HarmonyHub</span>
            </Link>
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Explore the world of music with virtual instruments
            </h2>
            <p className="text-white/80">
              Play, learn, and create music with our collection of high-quality virtual instruments. No downloads required.
            </p>
          </div>
        </div>
      </div>
      
      <div className={cn("flex flex-col justify-center p-8", className)}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center md:hidden mb-6">
            <span className="text-xl font-bold">HarmonyHub</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-center mb-2">{title}</h1>
          {subtitle && (
            <p className="text-center text-muted-foreground mb-6">{subtitle}</p>
          )}
          
          <div className="bg-card dark:bg-card shadow-none sm:shadow-lg sm:rounded-lg p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
