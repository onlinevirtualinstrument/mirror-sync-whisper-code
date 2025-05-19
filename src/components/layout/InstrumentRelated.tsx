
import { Link } from 'react-router-dom';

interface RelatedInstrument {
  id: string;
  name: string;
  imageUrl: string;
}

interface InstrumentRelatedProps {
  relatedInstruments: RelatedInstrument[];
}

const InstrumentRelated = ({ relatedInstruments }: InstrumentRelatedProps) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        {relatedInstruments.map((related) => (
          <Link key={related.id} to={`/instruments/${related.id}`} className="block">
            <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={related.imageUrl} 
                alt={related.name} 
                className="w-full h-32 object-cover" 
              />
              <div className="p-3">
                <h3 className="font-medium">{related.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InstrumentRelated;
