
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '../SEO/SEOHead';
import { HelmetProvider } from 'react-helmet-async';


interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  keywords?: string;
  instrumentType?: string;
}

const AppLayout = ({ 
  children,
  title,
  description,
  canonical,
  image,
  type,
  keywords,
  instrumentType
}: AppLayoutProps) => {
  return (
    <HelmetProvider>

      <SEOHead 
        title={title}
        description={description}
        route={canonical}
        imagePath={image} 
        pageType={type as 'website' | 'article'}
        keywords={keywords}
        instrumentType={instrumentType}
      /> 
      
      <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer />
    </div>
    </HelmetProvider>
  );
};

export default AppLayout;
