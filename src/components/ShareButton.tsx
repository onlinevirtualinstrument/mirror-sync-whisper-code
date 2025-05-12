
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCodeStore } from '../utils/codeStore';
import { toast } from '@/components/ui/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';

const ShareButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { html, css, javascript } = useCodeStore();
  
  const generateShareableLink = () => {
    // In a real app, this would save to a backend and return a unique URL
    // For now, we'll just encode the content in a base64 URL parameter
    const codeData = {
      html,
      css,
      javascript
    };
    
    const encodedData = btoa(JSON.stringify(codeData));
    const shareUrl = `${window.location.origin}/?code=${encodedData}`;
    return shareUrl;
  };

  const handleCopy = () => {
    const shareUrl = generateShareableLink();
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share this link to collaborate on your code.",
      duration: 2000
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Share your code</h4>
          <p className="text-xs text-muted-foreground">
            Copy this link to share your code with others
          </p>
          <div className="flex space-x-2">
            <Input
              value={generateShareableLink()}
              readOnly
              className="text-xs"
            />
            <Button size="sm" onClick={handleCopy}>
              Copy
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
