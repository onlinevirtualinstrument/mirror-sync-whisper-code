
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgImageUrl?: string;
  imageUrl?: string;  // Added to support either naming convention
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const HeroSection = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  bgImageUrl, 
  imageUrl,
  secondaryCtaText,
  secondaryCtaLink
}: HeroSectionProps) => {
  // Use either bgImageUrl or imageUrl (for backward compatibility)
  const backgroundImage = bgImageUrl || imageUrl;
  
  return (
    <div className="relative h-[50vh] md:h-[80vh] min-h-[300px] md:min-h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={backgroundImage} 
          alt="Hero background" 
          className="w-full h-full object-cover transition-transform duration-30000 hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mt-4 md:mt-6 max-w-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>
          <div className="mt-6 md:mt-10 animate-fade-in flex gap-4 flex-wrap" style={{ animationDelay: '0.4s' }}>
            <Link to={ctaLink}>
              <Button className="rounded-lg text-base md:text-lg px-4 md:px-6 py-2 md:py-6 flex items-center gap-2 group hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                {ctaText}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            {secondaryCtaText && secondaryCtaLink && (
              <Link to={secondaryCtaLink}>
                <Button 
                  variant="outline" 
                  className="rounded-lg text-base md:text-lg px-4 md:px-6 py-2 md:py-6 bg-transparent border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated accent elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute top-1/4 right-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 left-[5%] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }}></div>
    </div>
  );
};

export default HeroSection;
