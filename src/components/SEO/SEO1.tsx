
import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'HarmonyHub - Virtual Musical Instruments',
  description = 'Explore and play virtual musical instruments with HarmonyHub. Learn about different instruments and their history.',
  canonical = 'https://harmonyhub.app',
  image = '/og-image.png',
  type = 'website',
}) => {
  const siteTitle = title.includes('HarmonyHub') ? title : `${title} | HarmonyHub`;
  
  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
