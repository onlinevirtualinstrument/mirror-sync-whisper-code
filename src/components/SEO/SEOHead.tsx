
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  pageType?: 'website' | 'article';
  imagePath?: string;
  route?: string;
  keywords?: string;
  instrumentType?: string;
  dateModified?: string;
}

/**
 * Enhanced SEO component for website pages
 */
const SEOHead = ({ 
  title = "Musicca - Virtual Music Studio", 
  description = "Play various musical instruments online in this interactive virtual music studio.", 
  pageType = "website",
  imagePath = "https://lovable.dev/opengraph-image-p98pqg.png",
  route = "",
  keywords = "virtual instruments, online music, play music, interactive instruments",
  instrumentType = "",
  dateModified = new Date().toISOString().split('T')[0]
}: SEOHeadProps) => {
  const fullUrl = `https://musicca.lovable.app${route}`;
  const siteName = "Musicca";
  
  // Enhanced Schema.org JSON-LD
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "image": imagePath,
    "url": fullUrl,
    "applicationCategory": "MultimediaApplication, EducationalApplication",
    "operatingSystem": "Web browser",
    "dateModified": dateModified,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Musicca",
      "url": "https://musicca.lovable.app"
    }
  };

  // Create a more specific schema for instrument pages
  const instrumentSchema = instrumentType ? {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    "name": `${instrumentType} Virtual Instrument`,
    "musicCompositionForm": instrumentType,
    "dateModified": dateModified,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  } : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${keywords}${instrumentType ? ', ' + instrumentType + ', play ' + instrumentType + ' online' : ''}`} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Performance optimization */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={pageType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imagePath} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imagePath} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
      
      {/* Additional schema for instrument pages */}
      {instrumentType && (
        <script type="application/ld+json">
          {JSON.stringify(instrumentSchema)}
        </script>
      )}
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="application-name" content="Musicca" />
      <meta name="apple-mobile-web-app-title" content="Musicca" />
      <meta name="theme-color" content="#ffffff" />
    </Helmet>
  );
};

export default SEOHead;
