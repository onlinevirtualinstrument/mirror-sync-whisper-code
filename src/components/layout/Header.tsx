
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Music } from 'lucide-react';
import InstrumentNavDropdown from './InstrumentNavDropdown';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Instrument links configuration
  const instrumentLinks = [
    { path: "/piano", name: "Piano" },
    { path: "/guitar", name: "Guitar" },
    { path: "/drums", name: "Drums" },
    { path: "/xylophone", name: "Xylophone" },
    { path: "/flute", name: "Flute" },
    { path: "/violin", name: "Violin" },
    { path: "/banjo", name: "Banjo" },
    { path: "/harmonica", name: "Harmonica" },
    { path: "/harp", name: "Harp" },
    { path: "/saxophone", name: "Saxophone" },
    { path: "/sitar", name: "Sitar" },
    { path: "/trumpet", name: "Trumpet" },
    { path: "/veena", name: "Veena" },
    { path: "/kalimba", name: "Kalimba" },
    { path: "/marimba", name: "Marimba" },
    { path: "/tabla", name: "Tabla" },
    { path: "/timpani", name: "Timpani" },
    { path: "/theremin", name: "Theremin" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-white bg-opacity-80 backdrop-blur-md shadow-sm dark:bg-gray-900/80' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-display text-xl sm:text-2xl font-bold">
            <Music className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="hidden sm:inline">Musicca</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <InstrumentNavDropdown />
          
          <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">
            Explore
          </Link>
          
          <Link to="/tutorial" className="text-sm font-medium hover:text-primary transition-colors">
            Tutorial
          </Link>
          
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Play
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="block md:hidden p-2 hover:bg-secondary/20 rounded-full"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg animate-fade-in py-4">
          <div className="container mx-auto px-4 flex flex-col gap-3">
            {/* Mobile instruments dropdown */}
            <div className="py-2 px-4">
              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="text-base font-medium">Instruments</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="pb-2 pt-3">
                  {instrumentLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block py-2 px-4 hover:bg-secondary/20 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
            
            <Link
              to="/explore"
              className="py-2 px-4 hover:bg-secondary/20 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            
            <Link
              to="/tutorial"
              className="py-2 px-4 hover:bg-secondary/20 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutorial
            </Link>
            
            <Link
              to="/"
              className="py-2 px-4 hover:bg-secondary/20 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Play
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
