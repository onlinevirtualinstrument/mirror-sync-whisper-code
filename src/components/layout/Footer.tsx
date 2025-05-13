import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Music, 
  HelpCircle, 
  Users, 
  FileAudio, 
  MessageSquare, 
  Moon, 
  Sun, 
  Headphones, 
  Guitar, 
  Piano, 
  Mic, 
  Youtube as YoutubeIcon, 
  Send, 
  ThumbsUp, 
  Award, 
  ArrowRight, 
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Newsletter, {Unsubscribe, SubscribeInFooter} from './Newsletter';
import CreateRoomModal from '../room/CreateRoomModal';
import { toast } from 'sonner';

const Footer = () => {
  const [activeVisitors, setActiveVisitors] = useState(128);
  const [quote, setQuote] = useState({ text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Simulate changing visitor count
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2; // Random number between -2 and 2
      setActiveVisitors(prev => Math.max(100, prev + change));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Array of music quotes
  const musicQuotes = [
    { text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" },
    { text: "One good thing about music, when it hits you, you feel no pain.", author: "Bob Marley" },
    { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
    { text: "Music expresses that which cannot be said and on which it is impossible to be silent.", author: "Victor Hugo" },
    { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything.", author: "Plato" }
  ];

  // Change quote every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * musicQuotes.length);
      setQuote(musicQuotes[randomIndex]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Toggle dark mode (just visual in the footer, not functional)
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle auth navigation
  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    navigate('/auth/register');
  };

  // Handle navigation to music rooms
  const handleJoinLiveMusic = () => {
    navigate('/music-rooms');
    // Scroll to top when navigating
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-10">
      <div className="container mx-auto px-6">
        {/* Quote of the day */}
        <div className="text-center mb-10 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <p className="italic text-gray-700">"{quote.text}"</p>
          <p className="text-sm text-gray-500 mt-1">— {quote.author}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main info */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-semibold">
                H
              </div>
              <span className="text-xl font-semibold">HarmonyHub</span>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">
              Explore the world of musical instruments with our beautifully curated collection.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">
                <YoutubeIcon size={20} />
              </a>
              <a href="https://whatsapp.com/channel/0029Vb62vOn2ER6bd91xQk26"  className="text-gray-500 hover:text-gray-800 transition-colors">
                W
              </a>
            </div>
            
            {/* Live visitors counter */}
            <div className="mt-6 flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>{activeVisitors} musicians online now</span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <Link 
                  to="/music-rooms" 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Join Live Music
                </Link>
              </div>

              <CreateRoomModal />
            </div>
          </div>
          
          {/* Essential Links */}
          <div>
            <h3 className="font-semibold mb-4">Essential Links</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Music size={16} className="text-indigo-500" />
                <Link to="/explore" className="text-gray-600 hover:text-gray-900 text-sm">Explore Instruments</Link>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-500" />
                <Link to="/help" className="text-gray-600 hover:text-gray-900 text-sm">FAQs & Support</Link>
              </li>
              <li className="flex items-center gap-2">
                <FileAudio size={16} className="text-indigo-500" />
                <Link to="/about" className="text-gray-600 hover:text-gray-900 text-sm">About Us</Link>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle size={16} className="text-indigo-500" />
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</Link>
              </li>
              <li className="flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <Link to="/music-rooms" className="text-gray-600 hover:text-gray-900 text-sm">Live Music Rooms</Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-3">Join Our Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">Get updates on new instruments, features and musical tips.</p>
            
            {/* Using the new Newsletter component */}
           {/* <Newsletter variant="minimal" /> */}
            <SubscribeInFooter />

            {/* Sign In/Sign Up Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <Button 
                  // onClick={handleSignIn} 
                  onClick={() => toast.info('Feature not available yet!')}
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  Sign In
                </Button>
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <Button 
                  // onClick={handleSignUp} 
                  onClick={() => toast.info('Feature not available yet!')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Partners */}
        <div className="flex flex-wrap justify-center gap-8 items-center my-8 opacity-60">
          <span className="text-sm text-gray-400 font-medium">Trusted By:</span>
          <div className="text-gray-400 font-semibold">MusicSchool</div>
          <div className="text-gray-400 font-semibold">SoundStudio</div>
          <div className="text-gray-400 font-semibold">RhythmLab</div>
          <div className="text-gray-400 font-semibold">MelodyMakers</div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HarmonyHub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
          <Link to="/about" className="text-gray-600 hover:text-gray-900 text-sm">About Us</Link>
          <Link to="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</Link>
            <Link to="/help" className="text-gray-600 hover:text-gray-900 text-sm">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
