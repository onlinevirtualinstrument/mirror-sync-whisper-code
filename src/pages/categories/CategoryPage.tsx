
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import SectionTitle from '@/components/ui-components/SectionTitle';
import InstrumentCard from '@/components/layout/InstrumentCard';


export const categoryData = {
  strings: {
    title: 'String Instruments',
    description: 'Instruments that produce sound through vibrating strings',
    instruments: [
      {
        id: 'violin',
        name: 'Violin',
        category: 'Strings',
        imageUrl: '/images/violin/OnlineVirtualViolinInstrument3.png'
      },
      {
        id: 'guitar',
        name: 'Guitar',
        category: 'Strings',
        imageUrl: '/images/guitar/OnlineVirtualGuitarInstrument2.png'
      },
      {
        id: 'harp',
        name: 'Harp',
        category: 'Strings',
        imageUrl: '/images/harp/OnlineVirtualHarpInstrument3.png'
      },
      {
        id: 'sitar',
        name: 'Sitar',
        category: 'Strings',
        imageUrl: '/images/sitar/OnlineVirtualSitarInstrument1.png'
      },
      {
        id: 'veena',
        name: 'Veena',
        category: 'Strings',
        imageUrl: '/images/veena/OnlineVirtualVeenaInstrument1.png'
      },
      {
        id: 'banjo',
        name: 'Banjo',
        category: 'Strings',
        imageUrl: '/images/banjo/OnlineVirtualBanjoInstrument3.png'
      },
    ]
  },
  wind: {
    title: 'Wind Instruments',
    description: 'Instruments that produce sound by blowing air into or across them',
    instruments: [
      {
        id: 'flute',
        name: 'Flute',
        category: 'wind',
        imageUrl: '/images/flute/OnlineVirtualFluteInstrument2.png'
      },
      {
        id: 'saxophone',
        name: 'Saxophone',
        category: 'wind',
        imageUrl: '/images/saxophone/OnlineVirtualSaxophoneInstrument3.png'
      },
      {
        id: 'trumpet',
        name: 'Trumpet',
        category: 'wind',
        imageUrl: '/images/trumpet/OnlineVirtualTrumpetInstrument1.png'
      },
      {
        id: 'harmonica',
        name: 'Harmonica',
        category: 'wind',
        imageUrl: '/images/harmonica/OnlineVirtualHarmonicaInstrument1.png'
      },
      
    ],
 
  },
  percussion: {
    title: 'Percussion Instruments',
    description: 'Instruments that produce sound by being struck, shaken, or scraped',
    instruments: [
      {
        id: 'drums',
        name: 'Drum Kit',
        category: 'Percussion',
        imageUrl: '/images/drums/OnlineVirtualDrumsInstrument2.png'
      },
      {
        id: 'xylophone',
        name: 'Xylophone',
        category: 'Percussion',
        imageUrl: '/images/xylophone/OnlineVirtualXylophoneInstrument2.png'
      },
      {
        id: 'kalimba',
        name: 'Kalimba',
        category: 'Percussion',
        imageUrl: '/images/kalimba/OnlineVirtualKalimbaInstrument1.png'
      },
      {
        id: 'marimba',
        name: 'Marimba',
        category: 'Percussion',
        imageUrl: '/images/marimba/OnlineVirtualMarimbaInstrument1.png'
      },
      {
        id: 'tabla',
        name: 'Tabla',
        category: 'Percussion',
        imageUrl: '/images/tabla/OnlineVirtualTablaInstrument3.png'
      }
      
    ],
  },
  keyboard: {
    title: 'Keyboard Instruments',
    description: 'Instruments that have keys that control sound production',
    instruments: [
      {
        id: 'piano',
        name: 'Grand Piano',
        category: 'Keyboard',
        imageUrl: '/images/piano/OnlineVirtualPianoInstrument3.png'
      },
      
      // {
      //   id: 'synthesizer',
      //   name: 'Synthesizer',
      //   category: 'Keyboard',
      //   imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      // },
      // {
      //   id: 'accordion',
      //   name: 'Accordion',
      //   category: 'Keyboard',
      //   imageUrl: 'https://images.unsplash.com/photo-1577079527290-f7abd88640c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      // },
    ]
  },
   electronic: {
    title: 'Electronic Instruments',
    description: 'Instruments that produce sound by various electronic means',
    instruments: [
      {
        id: 'theremin',
        name: 'Theremin',
        category: 'electronic',
        imageUrl: '/images/theremin/OnlineVirtualThereminInstrument3.png'
      },
      {
        id: 'drummachine',
        name: 'Drum Machine',
        category: 'electronic',
        imageUrl: '/images/drummachine/OnlineVirtualDrumMachineInstrument.png'
      },
      {
        id: 'chordprogression',
        name: 'Chord Progression',
        category: 'electronic',
        imageUrl: '/images/chordprogression/OnlineVirtualChordProgressionInstrument.png'
      },
    ]
  }
};

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  if (!categoryId || !categoryData[categoryId as keyof typeof categoryData]) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-20">
          <h1>Category not found</h1>
        </div>
      </AppLayout>
    );
  }
  
  const category = categoryData[categoryId as keyof typeof categoryData];
  
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-20">
        <SectionTitle 
          title={category.title}
          subtitle={category.description}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
          {category.instruments.map(instrument => (
            <InstrumentCard 
              key={instrument.id}
              id={instrument.id}
              name={instrument.name}
              category={instrument.category}
              imageUrl={instrument.imageUrl}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default CategoryPage;
