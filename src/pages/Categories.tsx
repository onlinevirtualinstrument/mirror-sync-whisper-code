
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import SectionTitle from '@/components/ui-components/SectionTitle';
import CategoryCard from '@/components/layout/CategoryCard';
import { Music, Guitar, Drumstick, Keyboard, Radio, Globe, MicVocal } from 'lucide-react';

const Categories = () => {
  // Sample data for all categories
  const allCategories = [
    {
      id: 'strings',
      title: 'String Instruments',
      description: 'Explore violins, guitars, and more',
      icon: '🎻',
      imageUrl: '/images/guitar/OnlineVirtualGuitarInstrument2.png',
      to: '/categories/strings',
      color: 'bg-amber-100 dark:bg-amber-950',
      icon2: '🎻',
      instruments: [
        { name: 'Violin', link: '/instruments/violin' },
        { name: 'Guitar', link: '/instruments/guitar' },
        { name: 'Harp', link: '/instruments/harp' },
        { name: 'Sitar', link: '/instruments/sitar' },
        { name: 'Veena', link: '/instruments/vina' },
        { name: 'Banjo', link: '/instruments/banjo' }
      ],
       featured: {
        name: 'Guitar',
        description: 'Strum the virtual guitar 🎸',
        link: '/guitar' 
      }
    },
    {
      id: 'wind',
      title: 'Wind Instruments',
      description: 'Discover flutes, saxophones, and more',
      icon: '🎺',
      imageUrl: '/images/saxophone/OnlineVirtualSaxophoneInstrument3.png',
      to: '/categories/wind',
      color: 'bg-blue-100 dark:bg-blue-950',
      icon2: '🎷',
      instruments: [
        { name: 'Flute', link: '/flute' },
        { name: 'Saxophone', link: '/instruments/saxophone' },
        { name: 'Trumpet', link: '/instruments/trumpet' },
        { name: 'Harmonica', link: '/instruments/harmonica' },
      ]
    },
    {
      id: 'percussion',
      title: 'Percussion Instruments',
      description: 'Find drums, xylophones, and more',
      icon: '🥁',
      imageUrl: '/images/tabla/OnlineVirtualTablaInstrument3.png',
      to: '/categories/percussion',
      color: 'bg-red-100 dark:bg-red-950',
      icon2: '🥁',
      instruments: [
        { name: 'Drum Kit', link: '/instruments/drums' },
        { name: 'Xylophone', link: '/instruments/xylophone' },
        { name: 'Kalimba', link: '/instruments/kalimba' },
        { name: 'Marimba', link: '/instruments/marimba' },
        { name: 'Theremin', link: '/instruments/theremin' },
        { name: 'Tabla', link: '/instruments/tabla' },
      ]
    },
    {
      id: 'keyboard',
      title: 'Keyboard Instruments',
      description: 'Browse pianos, synths, and more',
      icon: '🎹',
      imageUrl: '/images/piano/OnlineVirtualPianoInstrument3.png',
      to: '/categories/keyboard',
      color: 'bg-purple-100 dark:bg-purple-950',
      icon2: '🎹',
      instruments: [
        { name: 'Piano', link: '/piano' },
      ],
      featured: {
        name: 'Piano',
        description: 'Play our interactive virtual piano 🎹',
        link: '/piano' 
      }
    },
    {
      id: 'electronic',
      title: 'Electronic Instruments',
      description: 'Play drum machine, chord progression, and more',
      icon: '🧩',
      imageUrl: '/images/drummachine/OnlineVirtualDrumMachineInstrument.png',
      to: '/categories/electronic',
      icon2: '🧩',
      name: "Electronic Instruments",
      color: "bg-purple-100 text-purple-800",
      path: "/categories/electronic",
      instruments: [
        { name: "Theremin", link: "/theremin" },
        { name: "Drum Machine", link: "/drummachine" },
        { name: "Chord Progression Player", link: "/chordprogression" }
      ],
      
    },

  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-20">
        <SectionTitle
          title="Browse All Categories"
          subtitle="Discover our comprehensive collection of musical instruments organized by families and types"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allCategories.map(category => (
            <div key={category.id} className="flex flex-col">
              <CategoryCard
                title={category.title}
                description={category.description}
                icon={category.icon}
                imageUrl={category.imageUrl}
                to={category.to}
                color=""
                icon2={category.icon2}
                id={category.id}
              />

              {/* Direct links to instruments
               <div className="mt-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                <h4 className="text-sm font-medium mb-2">Instruments</h4>
                <ul className="space-y-1">
                  {category.instruments.map((instrument, index) => (
                    <li key={index}>
                      <Link 
                        to={instrument.link} 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline block py-1"
                      >
                        {instrument.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div> */}

              {category.featured && (
                <div className="mt-2 p-3 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{category.featured.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{category.featured.description}</p>
                    </div>
                    <Link
                      to={category.featured.link}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Try Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Categories;
