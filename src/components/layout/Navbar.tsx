
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '../auth/UserButton';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useTheme } from '@/contexts/ThemeContext';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import InstrumentNavDropdown from './InstrumentNavDropdown';
import { NavbarLoginDropdown } from './NavbarLoginDropdown';
import { toast } from 'sonner';


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { mode } = useTheme();

  // Configure gesture navigation based on current route
  useGestureNavigation({
    enableSwipe: true,
    enableKeyboard: true,
    navigationMap: {
      left: getPreviousPage(),
      right: getNextPage(),
      up: '',
      down: ''
    }
  });

  function getPreviousPage() {
    const path = location.pathname;
    if (path === '/explore') return '/';
    if (path === '/categories') return '/explore';
    if (path.startsWith('/categories/')) return '/categories';
    if (path.startsWith('/instruments/')) return '/explore';
    return '';
  }

  function getNextPage() {
    const path = location.pathname;
    if (path === '/') return '/explore';
    if (path === '/explore') return '/categories';
    return '';
  }

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Categories', path: '/categories' },
    { name: 'Play with friends', path: '/music-rooms' },
    { name: 'Tutorial', path: '/tutorial' },
    { name: 'Blog', path: '/blog' },
    { name: 'Play', path: '/' },

  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-300`}>
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Navigation arrows for gesture nav visual feedback */}
        {/* <div className="hidden md:flex items-center gap-2">
          {getPreviousPage() && (
            <Link to={getPreviousPage()} className="touch-friendly p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          )}
          {getNextPage() && (
            <Link to={getNextPage()} className="touch-friendly p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </div> */}

        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-500 flex items-center justify-center text-white font-semibold animate-pulse-gentle">
            H
          </div>
          <span className="text-xl font-semibold">HarmonyHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            //  if (link.name === 'Play with friends') {
            //   return null; // ✅ Skip rendering
            //  }
            if (link.name === 'Blog') {
              return null; // ✅ Skip rendering
            }
            if (link.name === 'Play') {
              return (
                <div key="instrument-dropdown-desktop" className="nav-link">
                  <InstrumentNavDropdown />
                </div>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'font-medium' : ''} dark:text-white`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>


        <div className="hidden md:flex items-center gap-1">
          <ThemeSwitcher />
          {/* onClick={() => toast.info('Feature not available yet!')} */}
          {/* <div className="ml-2 gap-4" >
            <Link to="/auth/login">
              <Button variant="outline" className="rounded-lg mr-3">
                Log in
              </Button>
            </Link>
            <Link to="/auth/register" className="ml-2">
              <Button className="rounded-lg">
                Sign up
              </Button>
            </Link>
          </div> */}
          <NavbarLoginDropdown />

        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ?
              <X size={24} className="animate-scale-in" /> :
              <Menu size={24} className="animate-scale-in" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">


            {navLinks.map((link) =>
              link.name !== 'Play' ? (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-2 text-lg transition-colors duration-200 ${isActive(link.path)
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <div key="instrument-dropdown-mobile">
                  <InstrumentNavDropdown />
                </div>
              )
            )}


            <NavbarLoginDropdown />

            {/* <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-800" onClick={() => toast.info('Feature not available yet!')}>
              {/* <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}> */}
            {/* <Button variant="outline" className="w-full rounded-lg">
                  Log in
                </Button> */}
            {/* </Link> */}
            {/* <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}> */}
            {/* <Button className="w-full rounded-lg">
                  Sign up
                </Button> */}
            {/* </Link> */}
            {/* </div> */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
