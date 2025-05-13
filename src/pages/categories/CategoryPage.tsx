
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
        imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'guitar',
        name: 'Guitar',
        category: 'Strings',
        imageUrl: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      {
        id: 'harp',
        name: 'Harp',
        category: 'Strings',
        imageUrl: 'https://images.unsplash.com/photo-1619472351888-861b93e84cad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      {
        id: 'sitar',
        name: 'Sitar',
        category: 'Strings',
        imageUrl: 'https://images.unsplash.com/photo-1619472351888-861b93e84cad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      {
        id: 'veena',
        name: 'Veena',
        category: 'Strings',
        imageUrl: 'https://images.unsplash.com/photo-1619472351888-861b93e84cad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      {
        id: 'banjo',
        name: 'Banjo',
        category: 'Strings',
        imageUrl: 'https://images.unsplash.com/photo-1619472351888-861b93e84cad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
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
        category: 'Woodwind',
        imageUrl: 'https://images.unsplash.com/photo-1621368286550-f54551f39b91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'saxophone',
        name: 'Saxophone',
        category: 'Woodwind',
        imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'trumpet',
        name: 'Trumpet',
        category: 'Brass',
        imageUrl: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'harmonica',
        name: 'Harmonica',
        category: 'Brass',
        imageUrl: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
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
        category: 'Untuned Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'xylophone',
        name: 'Xylophone',
        category: 'Tuned Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'timpani',
        name: 'Timpani',
        category: 'Tuned Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'kalimba',
        name: 'Kalimba',
        category: 'Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1577079527290-f7abd88640c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'marimba',
        name: 'Marimba',
        category: 'Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1577079527290-f7abd88640c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'theremin',
        name: 'Theremin',
        category: 'Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1577079527290-f7abd88640c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: 'tabla',
        name: 'Tabla',
        category: 'Percussion',
        imageUrl: 'https://images.unsplash.com/photo-1577079527290-f7abd88640c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
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
        imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
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
