
import React, { ReactNode, memo } from 'react';
import SEOHead from '../SEO/SEOHead';
import { HelmetProvider } from 'react-helmet-async';


interface InstrumentPageWrapperProps { 
  children: ReactNode;
  title: string;
  description: string;
  instrumentType: string;
  borderColor?: string;
  route?: string;
}

const InstrumentPageWrapper = memo(({
  children,
  title,
  description,
  instrumentType,
  borderColor = 'border-primary',
  route = '/'
}: InstrumentPageWrapperProps) => {
  return (
    <HelmetProvider>
       <SEOHead
        title={title}
        description={description}
        instrumentType={instrumentType}
        route={route}
        keywords={`virtual ${instrumentType.toLowerCase()}, online ${instrumentType.toLowerCase()}, ${instrumentType.toLowerCase()} simulator, play ${instrumentType.toLowerCase()} online, music instrument`}
      /> 
      
    <div className="bg-gradient-to-b from-background to-background/95">
      
      <main className="container px-4 pt-10 pb-10">
        <div className={`max-w-5xl mx-auto border-2 rounded-xl p-6 ${borderColor}`}>
          {/* <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">{title}</h1>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">{description}</p>
          </div> */}
          {children}
        </div>
      </main>
      
    </div>
    </HelmetProvider>
  );
});

// Add display name for better debugging
InstrumentPageWrapper.displayName = 'InstrumentPageWrapper';

export default InstrumentPageWrapper;
