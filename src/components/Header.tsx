
import React from 'react';
import { useCodeStore } from '../utils/codeStore';
import { Language } from '../types';
import { Code, FileCog, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareButton from './ShareButton';

interface HeaderProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ showPreview, setShowPreview }) => {
  const { activeTab, setActiveTab, resetCode } = useCodeStore();

  const tabs: { id: Language; label: string; icon: React.ReactNode }[] = [
    { id: 'html', label: 'HTML', icon: <Code className="h-4 w-4 mr-1" /> },
    { id: 'css', label: 'CSS', icon: <FileCog className="h-4 w-4 mr-1" /> },
    { id: 'javascript', label: 'JS', icon: <Code className="h-4 w-4 mr-1" /> }
  ];

  return (
    <header className="bg-card p-2 border-b border-border flex justify-between items-center">
      <div className="flex items-center">
        <div className="text-primary font-bold text-lg mr-6 flex items-center">
          <Code className="h-6 w-6 mr-2 text-primary animate-pulse-glow" />
          CodeSync Mirror
        </div>
        
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetCode()}
          className="text-xs"
        >
          Reset
        </Button>
        
        <ShareButton />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPreview(!showPreview)}
          className={showPreview ? "text-primary" : "text-muted-foreground"}
          title={showPreview ? "Hide Preview" : "Show Preview"}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
