
import React from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import VirtualGuitarComponent from "./VirtualGuitarComponent";
import { Music, Settings, Guitar } from 'lucide-react';

const VirtualGuitar = () => {
  return (
    <>
      <Helmet>
        <title>Virtual Guitar Studio - Play and Create Music | Guitarscape</title>
        <meta name="description" content="Play guitar with customizable sounds and effects in our interactive virtual guitar studio. Choose from acoustic, electric, bass and more guitar types." />
        <meta name="keywords" content="virtual guitar, online guitar, guitar simulator, acoustic guitar, electric guitar, bass guitar" />
        <link rel="canonical" href="/virtual-guitar" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicComposition",
            "name": "Virtual Guitar Experience",
            "musicCompositionForm": "Guitar",
            "instrument": {
              "@type": "MusicInstrument",
              "name": "Guitar",
              "musicInstrumentCategory": "string instrument"
            }
          })}
        </script>
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Virtual Guitar Studio - Play Guitar Online" />
        <meta property="og:description" content="Play guitar with customizable sounds and effects in our interactive virtual guitar studio." />
        <meta property="og:image" content="/images/guitar-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Virtual Guitar Studio" />
        <meta name="twitter:description" content="Play guitar online with customizable sounds and effects" />
        <meta name="twitter:image" content="/images/guitar-twitter.jpg" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8 gap-2">
            <Guitar className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-semibold">Virtual Guitar</h1>
          </div>
        <VirtualGuitarComponent />
        <TooltipProvider>
          <Toaster />
        </TooltipProvider>
      </div>
    </>
  );
};

export default VirtualGuitar;
