
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Apply dark mode class based on state
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <header className="py-4 px-6 flex justify-between items-center border-b border-slate-300 dark:border-slate-700">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-purple-400 dark:to-blue-400">
          Rhythm Master
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode} 
          className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
