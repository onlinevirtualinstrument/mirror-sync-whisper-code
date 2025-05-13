
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '../SEO/SEOHead';

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
    <div className="flex flex-col min-h-screen">
      {/* 
      <SEOHead 
        title={title}
        description={description}
        route={canonical}
        imagePath={image}
        pageType={type as 'website' | 'article'}
        keywords={keywords}
        instrumentType={instrumentType}
      /> 
      */}
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
