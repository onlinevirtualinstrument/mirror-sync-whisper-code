import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '@/components/ui-components/HeroSection';
import CategoryCard from '@/components/layout/CategoryCard';
import InstrumentCard from '@/components/layout/InstrumentCard';

import { Button } from '@/components/ui/button';
import { Wind, Music2, Mic, Volume2, Piano, Guitar, Music, FileMusic, Drum, MicVocal, ArrowRight, Trophy, BadgeDollarSign, ShieldCheck, Headphones, GemIcon, Star } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const premiumFeatures = [
  {
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    title: 'Exclusive Instrument Collection',
    description: 'Access our library of 500+ premium instruments with studio-quality sound samples'
  },
  {
    icon: <BadgeDollarSign className="h-5 w-5 text-yellow-400" />,
    title: 'Advanced Recording Studio',
    description: 'Professional-grade recording tools with unlimited storage and advanced mixing capabilities'
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-yellow-400" />,
    title: 'Expert-Led Masterclasses',
    description: 'Weekly live workshops and on-demand tutorials from Grammy-winning musicians'
  },
  {
    icon: <Headphones className="h-5 w-5 text-yellow-400" />,
    title: 'Priority Support',
    description: '24/7 access to our team of music experts for personalized guidance and technical help'
  }
];

const categories = [
  {
    id: 'strings',
    title: 'String Instruments',
    description: 'Guitars, violins, cellos and more',
    icon: <Guitar size={20} />,
    to: '/categories/strings',
    color: 'bg-amber-100 dark:bg-amber-950',
    icon2: '🎻',
    // imageUrl: 'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'keyboard',
    title: 'Keyboard Instruments',
    description: 'Pianos, keyboards, synthesizers',
    icon: <Piano size={20} />,
    to: '/categories/keyboard',
    color: 'bg-blue-100 dark:bg-blue-950',
    icon2: '🎹',
    // imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'percussion',
    title: 'Percussion Instruments',
    description: 'Drums, cymbals and more',
    icon: <Drum size={20} />,
    to: '/categories/percussion',
    color: 'bg-red-100 dark:bg-red-950',
    icon2: '🥁',
    // imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wind',
    title: 'Wind Instruments',
    description: 'Microphones and vocal processors',
    icon: <MicVocal size={20} />,
    to: '/categories/wind',
    color: 'bg-purple-100 dark:bg-purple-950',
    icon2: '🎤',
    // imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80'
  }
];

const featuredInstruments = [
  {
    id: 'piano',
    name: 'Grand Piano',
    category: 'Keyboard',
    imageUrl: '/images/piano/OnlineVirtualPianoInstrument3.png',
    isFeatured: true,
  },
  {
    id: 'guitar',
    name: 'Acoustic Guitar',
    category: 'String',
    imageUrl: '/images/guitar/OnlineVirtualGuitarInstrument2.png',
    isFeatured: true,
  },
  {
    id: 'drums',
    name: 'Professional Drum Kit',
    category: 'Percussion',
    imageUrl: '/images/drums/OnlineVirtualDrumsInstrument2.png',
    isFeatured: true
  }
];

const Index = () => {
  return (
    <AppLayout>
      <div className="min-h-screen">
        <HeroSection
          title="Discover the World of Music"
          subtitle="Explore, play, and master musical instruments from around the globe"
          ctaText="Explore Instruments"
          ctaLink="/explore"
          secondaryCtaText="Try Piano"
          secondaryCtaLink="/piano"
          imageUrl="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920&q=80"
        />

        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2">Featured Instruments</h2>
              <p className="text-gray-600 dark:text-gray-400">Top picks and popular instruments to explore</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredInstruments.map((instrument) => (
                <InstrumentCard
                  key={instrument.id}
                  id={instrument.id}
                  name={instrument.name}
                  category={instrument.category}
                  imageUrl={instrument.imageUrl}
                  isFeatured={instrument.isFeatured}
                />
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link to="/explore">
                <Button variant="outline" size="lg" className="group">
                  Explore All Instruments
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-1 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-gray-600 dark:text-gray-400">Explore instruments by category and find the perfect match for your musical journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  to={category.to}
                  color={category.color}
                  icon2={category.icon2}
                  
                />
              ))}
            </div>
            
            <div className="mt-10 mb-5 text-center">
              <Link to="/categories">
                <Button variant="outline" size="lg" className="group">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">Try Our Interactive Piano</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Experience music hands-on with our interactive piano. Play, record, and share your creations directly from your browser.
                </p>
                <Link to="/piano">
                  <Button>
                    Go to Piano
                    <Piano className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <h2 className="mt-8 font-bold mb-4">Try Other Interesting Instrument</h2>
                <div className="mt-4 mb-4 mr-4 grid grid-cols-3 sm:grid-cols-3 gap-4">
  <Link to="/violin">
    <Button className="w-full justify-between bg-gradient-to-r from-rose-200 to-rose-400 text-rose-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Music className="h-4 w-4" />
        Violin
      </span>
    </Button>
  </Link>

  <Link to="/flute">
    <Button className="w-full justify-between bg-gradient-to-r from-sky-200 to-sky-400 text-sky-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Wind className="h-4 w-4" />
        Flute
      </span>
    </Button>
  </Link>

  <Link to="/veena">
    <Button className="w-full justify-between bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Music2 className="h-4 w-4" />
        Veena
      </span>
    </Button>
  </Link>

  <Link to="/harmonica">
    <Button className="w-full justify-between bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Mic className="h-4 w-4" />
        Harmonica
      </span>
    </Button>
  </Link>

  <Link to="/saxophone">
    <Button className="w-full justify-between bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Saxophone
      </span>
    </Button>
  </Link>

  <Link to="/xylophone">
    <Button className="w-full justify-between bg-gradient-to-r from-green-200 to-green-400 text-green-900 hover:scale-105 transition-transform duration-300 shadow-md">
      <span className="flex items-center gap-2">
        <Drum className="h-4 w-4" />
        Xylophone
      </span>
    </Button>
  </Link>
</div>

            
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=800&q=80" 
                  alt="Interactive Piano" 
                  className="rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
