import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import InstrumentImages from '@/components/layout/InstrumentImages';
import InstrumentRelated from '@/components/layout/InstrumentRelated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Upload, 
  Download, 
  Share2, 
  FileMusic
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import audioPlayer from '@/utils/music/audioPlayer';
import { toast } from '@/components/ui/use-toast';

const MOCK_INSTRUMENTS = {
  'grand-piano': {
    id: 'grand-piano',
    name: 'Grand Piano',
    category: 'Keyboard',
    description: 'A grand piano is a large piano with horizontal strings that extend away from the keyboard. The strings are struck by hammers activated by keys on the keyboard. The frame and strings are housed in a large wooden case.',
    features: [
      'Full 88-key keyboard',
      'Responsive hammer action',
      'Rich, resonant tone',
      'Sustain, soft, and sostenuto pedals'
    ],
    specifications: {
      'Length': '4.5-9 feet',
      'Weight': '500-1,200 pounds',
      'Strings': '230 steel strings',
      'Keys': '88 keys (52 white, 36 black)'
    },
    images: [
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595069906974-f8ae7ffc3e7a?auto=format&fit=crop&w=600&q=80'
    ],
    price: '$15,000 - $200,000',
    soundUrl: '/sounds/piano.mp3',
    relatedInstruments: [
      {
        id: 'upright-piano',
        name: 'Upright Piano',
        imageUrl: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'digital-piano',
        name: 'Digital Piano',
        imageUrl: 'https://images.unsplash.com/photo-1545293527-e26058c5b48b?auto=format&fit=crop&w=300&q=80'
      }
    ]
  },
  'acoustic-guitar': {
    id: 'acoustic-guitar',
    name: 'Acoustic Guitar',
    category: 'String',
    description: 'The acoustic guitar is a fretted musical instrument with six strings. It is played by strumming or plucking the strings with the fingers or a pick. The sound is projected acoustically through the hollow body of the guitar.',
    features: [
      'Hollow wooden body',
      'Six steel strings',
      'Fretted fingerboard',
      'Natural acoustic projection'
    ],
    specifications: {
      'Body Type': 'Dreadnought',
      'Top Wood': 'Spruce',
      'Back & Sides': 'Mahogany',
      'Strings': '6 steel strings'
    },
    images: [
      'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=600&q=80'
    ],
    price: '$200 - $3,000',
    soundUrl: '/sounds/guitar.mp3',
    relatedInstruments: [
      {
        id: 'electric-guitar',
        name: 'Electric Guitar',
        imageUrl: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'bass-guitar',
        name: 'Bass Guitar',
        imageUrl: 'https://images.unsplash.com/photo-1583424221644-3b8f895156d6?auto=format&fit=crop&w=300&q=80'
      }
    ]
  }
};

const InstrumentDetail = () => {
  const { instrumentId } = useParams();
  const [instrument, setInstrument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{ instrumental: Blob | null, notes: string[] }>({
    instrumental: null,
    notes: []
  });
  const [notesShown, setNotesShown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const foundInstrument = MOCK_INSTRUMENTS[instrumentId as keyof typeof MOCK_INSTRUMENTS];
      setInstrument(foundInstrument || null);
      setIsLoading(false);
    }, 500);
    
    return () => {
      audioPlayer.stop();
    };
  }, [instrumentId]);
  
  const handlePlayClick = () => {
    if (!instrument?.soundUrl) return;
    
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else {
      audioPlayer.play(instrument.soundUrl);
      setIsPlaying(true);
      
      const checkIfPlaying = setInterval(() => {
        if (!audioPlayer.isCurrentlyPlaying()) {
          setIsPlaying(false);
          clearInterval(checkIfPlaying);
        }
      }, 500);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  
  const generateFromAudio = async () => {
    if (!instrument || !uploadedFile) return;
    
    setIsGenerating(true);
    
    try {
      const instrumentId = instrument.id;
      
      const result = await audioPlayer.generateInstrumentalFromAudio(uploadedFile, instrumentId);
      
      setGeneratedMusic({
        instrumental: result.instrumental || null,
        notes: result.notes
      });
      
      setNotesShown(true); // Automatically show notes when generated
      
      toast({
        title: "Success!",
        description: `Generated instrumental track for ${instrument.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate instrumental music.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const playGeneratedMusic = () => {
    if (generatedMusic.instrumental) {
      if (isPlaying) {
        audioPlayer.stop();
        setIsPlaying(false);
      } else {
        const url = URL.createObjectURL(generatedMusic.instrumental);
        audioPlayer.play(url);
        setIsPlaying(true);
        
        const checkIfPlaying = setInterval(() => {
          if (!audioPlayer.isCurrentlyPlaying()) {
            setIsPlaying(false);
            clearInterval(checkIfPlaying);
          }
        }, 500);
      }
    }
  };
  
  const downloadGeneratedMusic = () => {
    if (generatedMusic.instrumental) {
      const url = URL.createObjectURL(generatedMusic.instrumental);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${instrument?.name.toLowerCase().replace(/\s+/g, '-')}-instrumental.mp3`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Your instrumental track has been downloaded."
      });
    }
  };
  
  const shareGeneratedMusic = async () => {
    if (generatedMusic.instrumental) {
      try {
        if (navigator.share) {
          const file = new File(
            [generatedMusic.instrumental], 
            `${instrument?.name} Instrumental.mp3`, 
            { type: 'audio/mp3', lastModified: Date.now() }
          );
          
          await navigator.share({
            title: `${instrument?.name} Instrumental`,
            text: 'Check out this instrumental I generated on HarmonyHub!',
            files: [file]
          });
          
          toast({
            title: "Shared successfully",
            description: "Your instrumental has been shared."
          });
        } else {
          throw new Error("Web Share API not supported");
        }
      } catch (error) {
        console.error("Error sharing:", error);
        
        if (generatedMusic.instrumental) {
          navigator.clipboard.writeText(`${instrument?.name} Instrumental`);
          
          toast({
            title: "Share option not available",
            description: "Details copied to clipboard instead."
          });
        }
      }
    } else {
      toast({
        title: "Nothing to share",
        description: "Generate an instrumental first."
      });
    }
  };
  
  const toggleNotes = () => {
    if (generatedMusic.notes.length === 0) {
      toast({
        title: "No notes available",
        description: "Generate an instrumental first to see notes."
      });
      return;
    }
    setNotesShown(!notesShown);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!instrument) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Instrument Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find the instrument you're looking for.
        </p>
        <Link to="/explore">
          <Button>Browse All Instruments</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <InstrumentImages
            images={instrument.images}
            name={instrument.name}
            activeIndex={activeImageIndex}
            setActiveIndex={setActiveImageIndex}
            soundUrl={instrument.soundUrl}
            isPlaying={isPlaying}
            onPlayClick={handlePlayClick}
          />
        </div>
        
        <div className="lg:w-1/2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{instrument.name}</h1>
            <p className="text-gray-500">{instrument.category} Instrument</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">{instrument.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Key Features</h3>
            <ul className="list-disc list-inside">
              {instrument.features.map((feature: string, index: number) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Specifications</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(instrument.specifications).map(([key, value]: [string, any], index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-500">{key}:</span>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Price Range</h3>
            <p className="text-gray-700 dark:text-gray-300">{instrument.price}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to={`/piano`}>
              <Button className="flex items-center gap-2">
                <Play size={16} />
                Play Virtual {instrument.name}
              </Button>
            </Link>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileMusic size={16} />
                  Generate Instrumental
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Generate Instrumental Music</DialogTitle>
                  <DialogDescription>
                    Upload a song to generate an instrumental version and extract notes you can play.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p>{uploadedFile ? uploadedFile.name : 'Drag and drop or click to upload audio'}</p>
                    {uploadedFile && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setUploadedFile(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={generateFromAudio}
                    disabled={isGenerating || !uploadedFile}
                  >
                    {isGenerating ? 'Processing...' : 'Generate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {generatedMusic.instrumental && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8 animate-fade-in">
              <h3 className="font-medium mb-3">Generated Instrumental</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={playGeneratedMusic}>
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadGeneratedMusic}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareGeneratedMusic}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" onClick={toggleNotes}>
                    <FileMusic className="h-4 w-4 mr-2" />
                    {notesShown ? 'Hide Notes' : 'Show Notes'}
                  </Button>
                </div>
                
                {notesShown && generatedMusic.notes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Extracted Notes</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedMusic.notes.map((note, index) => (
                        <div 
                          key={index} 
                          className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                        >
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-gray-500">
                    <FileMusic className="h-4 w-4 inline mr-1" /> 
                    Instrumental track
                  </div>
                  <Link 
                    to="/piano" 
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Play these notes on piano →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Instruments</h2>
        <InstrumentRelated relatedInstruments={instrument.relatedInstruments} />
      </div>
    </div>
  );
};

export default InstrumentDetail;
