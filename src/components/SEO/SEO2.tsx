
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
  children?: React.ReactNode;
}

/**
 * Enhanced SEO component for improved search engine optimization
 */
const SEO = ({
  title = 'Virtual Drum Kit - Interactive Online Drum Experience',
  description = 'Create music with our interactive virtual drum kit featuring customizable pads, sound effects, and a beat sequencer. Perfect for musicians and beginners alike.',
  keywords = [
    'virtual drum kit', 
    'online drums', 
    'drum machine', 
    'drum simulator', 
    'music maker', 
    'rhythm creator',
    'electronic drums',
    'drum pad',
    'drum lessons',
    'beat maker',
    'music production'
  ],
  ogImage = '/drum-kit-preview.png', // Default OG image
  ogUrl = 'https://virtualdrum.app',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  structuredData,
  children,
}: SEOProps) => {
  // Default structured data for a music application
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "MusicApplication",
    "name": "Virtual Drum Kit",
    "description": description,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "screenshot": ogImage,
    "url": canonicalUrl || ogUrl
  };

  const mergedStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Virtual Drum Kit preview" />
      <meta property="og:site_name" content="Virtual Drum Kit" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Virtual Drum Kit preview" />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="theme-color" content="#4f46e5" />
      <meta name="application-name" content="Virtual Drum Kit" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Virtual Drum Kit" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Performance optimization */}
      <meta http-equiv="x-dns-prefetch-control" content="on" />
      <link rel="dns-prefetch" href="https://cdn.lovable.dev" />
      <link rel="preconnect" href="https://cdn.lovable.dev" />
      
      {/* Canonical link */}
      <link rel="canonical" href={canonicalUrl || ogUrl} />
      
      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify(mergedStructuredData)}
      </script>
      
      {children}
    </Helmet>
  );
};

export default SEO;
