
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AdvancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: object;
  alternateLanguages?: { hreflang: string; href: string }[];
  robots?: string;
  viewport?: string;
}

const AdvancedSEO: React.FC<AdvancedSEOProps> = ({
  title = "HarmonyHub - Virtual Musical Instruments Hub | Play Music Online",
  description = "Discover the world's most comprehensive virtual musical instruments platform. Play piano, guitar, drums, flute, saxophone, and 15+ instruments online. Learn music theory, collaborate in real-time rooms, and create beautiful melodies. Free, no download required.",
  keywords = [
    "virtual instruments", "online piano", "virtual guitar", "drum machine", 
    "music education", "learn music online", "music theory", "digital instruments",
    "online music studio", "collaborative music", "music rooms", "virtual saxophone",
    "online flute", "digital drums", "music practice", "instrument simulator",
    "music creation", "online jam session", "virtual orchestra", "music learning platform"
  ],
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "/HarmonyHubOnlineVirtualInstrument-1200x630.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite = "@HarmonyHubApp",
  twitterCreator = "@HarmonyHubApp",
  structuredData,
  alternateLanguages = [],
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  viewport = "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HarmonyHub",
    "description": description,
    "url": "https://harmonyhub.app",
    "applicationCategory": "MusicApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "HarmonyHub",
      "url": "https://harmonyhub.app"
    },
    "featureList": [
      "Virtual Piano",
      "Virtual Guitar", 
      "Virtual Drums",
      "Virtual Saxophone",
      "Virtual Flute",
      "Music Theory Learning",
      "Real-time Collaboration",
      "Offline Mode",
      "Mobile Responsive"
    ],
    "screenshot": ogImage,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://harmonyhub.app"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Instruments",
        "item": "https://harmonyhub.app/instruments"
      }
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content={viewport} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="HarmonyHub" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="HarmonyHub Team" />
      <meta name="publisher" content="HarmonyHub" />
      <meta name="copyright" content="© 2024 HarmonyHub. All rights reserved." />
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 day" />
      
      {/* Mobile and App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="HarmonyHub" />
      <meta name="application-name" content="HarmonyHub" />
      <meta name="msapplication-TileColor" content="#9b87f5" />
      <meta name="theme-color" content="#9b87f5" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Alternate Languages */}
      {alternateLanguages.map((lang, index) => (
        <link key={index} rel="alternate" hrefLang={lang.hreflang} href={lang.href} />
      ))}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData)}
      </script>
      
      {/* Performance and Security Headers */}
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Rich Snippets for Music App */}
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={ogImage} />
      
      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Preload Critical Resources */}
      <link rel="preload" href="/onlinevirtualinstrument.ico" as="image" type="image/x-icon" />
    </Helmet>
  );
};

export default AdvancedSEO;
