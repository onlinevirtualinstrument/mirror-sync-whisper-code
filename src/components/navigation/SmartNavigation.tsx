import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, Star, Clock, Music, Piano, Guitar, 
  Mic, Volume2, Settings, User, Heart, Trophy, BookOpen,
  ChevronRight, ArrowRight, Keyboard, Target, Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'instrument' | 'feature' | 'learning' | 'social';
  path: string;
  keywords: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isNew?: boolean;
  isFavorite?: boolean;
  lastUsed?: Date;
  usageCount?: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

const SmartNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: 'piano',
      title: 'Piano',
      description: 'Virtual piano with falling notes and gamification',
      icon: <Piano className="w-5 h-5" />,
      category: 'instrument',
      path: '/piano',
      keywords: ['piano', 'keyboard', 'classical', 'keys'],
      difficulty: 'beginner',
      lastUsed: new Date('2024-01-20'),
      usageCount: 15
    },
    {
      id: 'guitar',
      title: 'Guitar',
      description: 'Acoustic and electric guitar simulator',
      icon: <Guitar className="w-5 h-5" />,
      category: 'instrument',
      path: '/guitar',
      keywords: ['guitar', 'acoustic', 'electric', 'strings'],
      difficulty: 'intermediate',
      lastUsed: new Date('2024-01-19'),
      usageCount: 8
    },
    {
      id: 'saxophone',
      title: 'Saxophone',
      description: 'Smooth jazz saxophone experience',
      icon: <Mic className="w-5 h-5" />,
      category: 'instrument',
      path: '/saxophone',
      keywords: ['saxophone', 'sax', 'jazz', 'wind'],
      difficulty: 'advanced',
      isNew: true
    },
    {
      id: 'music-theory',
      title: 'Music Theory',
      description: 'Learn scales, chords, and harmony',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'learning',
      path: '/education',
      keywords: ['theory', 'scales', 'chords', 'harmony', 'learn'],
      difficulty: 'beginner'
    },
    {
      id: 'social-hub',
      title: 'Social Hub',
      description: 'Connect with musicians and share performances',
      icon: <User className="w-5 h-5" />,
      category: 'social',
      path: '/social',
      keywords: ['social', 'community', 'share', 'connect', 'friends']
    },
    {
      id: 'challenges',
      title: 'Music Challenges',
      description: 'Compete in weekly music challenges',
      icon: <Trophy className="w-5 h-5" />,
      category: 'feature',
      path: '/challenges',
      keywords: ['challenge', 'compete', 'contest', 'prize'],
      isNew: true
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'quick-piano',
      title: 'Quick Piano',
      icon: <Piano className="w-4 h-4" />,
      action: () => navigateTo('/piano'),
      shortcut: 'P'
    },
    {
      id: 'random-instrument',
      title: 'Random Instrument',
      icon: <Music className="w-4 h-4" />,
      action: () => {
        const instruments = navigationItems.filter(item => item.category === 'instrument');
        const random = instruments[Math.floor(Math.random() * instruments.length)];
        navigateTo(random.path);
      },
      shortcut: 'R'
    },
    {
      id: 'practice-mode',
      title: 'Practice Mode',
      icon: <Target className="w-4 h-4" />,
      action: () => console.log('Practice mode'),
      shortcut: 'Ctrl+P'
    }
  ];

  const filteredItems = navigationItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instrument': return <Music className="w-4 h-4" />;
      case 'feature': return <Star className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'social': return <User className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateTo = (path: string) => {
    console.log('Navigate to:', path);
    setIsOpen(false);
    setSearchQuery('');
    // Add to recent items
    const item = navigationItems.find(i => i.path === path);
    if (item) {
      setRecentItems(prev => {
        const filtered = prev.filter(i => i.id !== item.id);
        return [{ ...item, lastUsed: new Date() }, ...filtered].slice(0, 5);
      });
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      if (isOpen) {
        // Navigate with arrow keys
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            navigateTo(filteredItems[selectedIndex].path);
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setSearchQuery('');
        }

        // Quick action shortcuts
        quickActions.forEach(action => {
          if (action.shortcut && e.key.toLowerCase() === action.shortcut.toLowerCase()) {
            e.preventDefault();
            action.action();
            setIsOpen(false);
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative w-64 justify-start text-muted-foreground glass-card"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        <span>Search instruments, features...</span>
        <div className="ml-auto flex items-center gap-1">
          <Keyboard className="w-3 h-3" />
          <span className="text-xs">⌘K</span>
        </div>
      </Button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Search Dialog */}
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <div className="glass-surface rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center p-4 border-b border-border/20">
                  <Search className="w-5 h-5 text-muted-foreground mr-3" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search instruments, lessons, features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus:ring-0 text-lg"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>↑↓ navigate</span>
                    <span>↵ select</span>
                    <span>esc close</span>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Quick Actions */}
                  {!searchQuery && (
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {quickActions.map((action) => (
                          <Button
                            key={action.id}
                            variant="ghost"
                            size="sm"
                            onClick={action.action}
                            className="justify-start h-auto p-3 glass-card"
                          >
                            <div className="flex items-center gap-2">
                              {action.icon}
                              <span className="text-sm">{action.title}</span>
                              {action.shortcut && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {action.shortcut}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Items */}
                  {!searchQuery && recentItems.length > 0 && (
                    <>
                      <Separator />
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Recently Used
                        </h3>
                        <div className="space-y-1">
                          {recentItems.map((item) => (
                            <Button
                              key={item.id}
                              variant="ghost"
                              onClick={() => navigateTo(item.path)}
                              className="w-full justify-start h-auto p-3 glass-card"
                            >
                              <div className="flex items-center gap-3 w-full">
                                {item.icon}
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.lastUsed?.toLocaleDateString()}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Search Results */}
                  {searchQuery && (
                    <>
                      <Separator />
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          {filteredItems.length} results for "{searchQuery}"
                        </h3>
                      </div>
                    </>
                  )}

                  {/* Navigation Items */}
                  {(searchQuery ? filteredItems : navigationItems).length > 0 && (
                    <div className="pb-4">
                      {(searchQuery ? filteredItems : navigationItems).map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={`mx-4 mb-1 rounded-lg transition-all duration-150 ${
                            index === selectedIndex 
                              ? 'bg-primary/10 ring-2 ring-primary/20' 
                              : 'hover:bg-muted/50'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo(item.path)}
                            className="w-full justify-start h-auto p-4"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="neo-morphism p-2 rounded-lg">
                                {item.icon}
                              </div>
                              
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{item.title}</span>
                                  {item.isNew && (
                                    <Badge className="bg-green-500 text-white text-xs">New</Badge>
                                  )}
                                  {item.difficulty && (
                                    <Badge 
                                      className={`${getDifficultyColor(item.difficulty)} text-white text-xs`}
                                    >
                                      {item.difficulty}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {getCategoryIcon(item.category)}
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {item.category}
                                  </span>
                                  {item.usageCount && (
                                    <span className="text-xs text-muted-foreground">
                                      • Used {item.usageCount} times
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                  }}
                                  className="p-1 h-auto"
                                >
                                  <Heart 
                                    className={`w-4 h-4 ${
                                      favorites.includes(item.id) 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                </Button>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery && filteredItems.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try searching with different keywords
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery('')}
                        className="glass-card"
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartNavigation;