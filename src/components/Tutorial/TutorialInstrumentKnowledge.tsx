
import React from "react";
import { ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface InstrumentKnowledgeProps {
  instrumentId: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
  };
}

interface KnowledgeSection {
  id: string;
  title: string;
  content: React.ReactNode;
  images?: string[];
}

const getKnowledgeSections = (instrumentId: string): KnowledgeSection[] => {
  const knowledgeBase: Record<string, KnowledgeSection[]> = {
    violin: [
      {
        id: "history",
        title: "Historical Development",
        content: (
          <div className="space-y-3">
            <p>The violin emerged in northern Italy in the early 16th century, particularly from the Brescia area. Andrea Amati, who worked in Cremona, is credited with creating the first modern violin. The instrument evolved from earlier bowed instruments like the medieval fiddle, rebec, and lira da braccio.</p>
            <p>The 17th and 18th centuries are considered the golden age of violin making, with legendary luthiers like Antonio Stradivari and Giuseppe Guarneri del Gesù crafting instruments that remain unmatched in quality and sound to this day.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=800&auto=format",
          "https://images.unsplash.com/photo-1566913485262-74e675c2e281?w=800&auto=format"
        ]
      },
      {
        id: "technique",
        title: "Advanced Techniques",
        content: (
          <div className="space-y-3">
            <p>Beyond basic playing, violinists develop specialized techniques including vibrato (oscillating pitch variation), different bow strokes (détaché, spiccato, martelé), double stops (playing two strings simultaneously), and harmonics (creating bell-like tones by lightly touching the string).</p>
            <p>Position work is crucial - violinists typically learn positions 1-7, with each position placing the hand higher on the fingerboard to reach higher notes. This allows for playing across the violin's four-octave range.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=800&auto=format",
          "https://images.unsplash.com/photo-1558865869-c93d2a4087c1?w=800&auto=format"
        ]
      }
    ],
    guitar: [
      {
        id: "history",
        title: "Historical Evolution",
        content: (
          <div className="space-y-3">
            <p>The modern guitar descended from the ancient stringed instruments of Mesopotamia and Egypt. Its direct ancestors include the European lute and the Moorish oud. The instrument we recognize today began taking shape in Spain during the 15th-16th centuries.</p>
            <p>Antonio de Torres Jurado revolutionized guitar design in the 19th century, establishing the dimensions and proportions of the classical guitar. Electric guitars emerged in the 1930s, with Leo Fender and Les Paul pioneering designs that would change popular music forever.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format",
          "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format"
        ]
      },
      {
        id: "technique",
        title: "Playing Techniques",
        content: (
          <div className="space-y-3">
            <p>Guitar techniques vary widely by style. Classical guitarists use fingerstyle techniques with precise right-hand fingerings. Rock and metal players often use alternate picking, palm muting, and power chords. Blues guitarists employ string bending, vibrato, and slides.</p>
            <p>Advanced techniques include sweep picking (rapid arpeggios), tapping (using both hands on the fretboard), harmonics (creating bell-like tones), and complex rhythm patterns specific to genres like flamenco, jazz, and metal.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&auto=format",
          "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=800&auto=format"
        ]
      }
    ],
    piano: [
      {
        id: "history",
        title: "Historical Development",
        content: (
          <div className="space-y-3">
            <p>The piano was invented by Bartolomeo Cristofori in Florence, Italy around 1700. His "gravicembalo col piano e forte" (harpsichord with soft and loud) was revolutionary because it allowed players to control dynamics through touch, unlike its predecessor, the harpsichord.</p>
            <p>The instrument evolved throughout the 18th and 19th centuries, with significant developments by builders like Broadwood, Érard, and Steinway. The modern grand piano design was largely established by the 1880s, featuring a cast iron frame, cross-stringing, and the full 88-key range.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format",
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format"
        ]
      },
      {
        id: "technique",
        title: "Piano Technique",
        content: (
          <div className="space-y-3">
            <p>Piano technique focuses on touch, tone production, and independence of fingers. Proper technique includes maintaining curved fingers, relaxed wrists, proper posture, and efficient movement. Pianists develop skills in finger legato, staccato, scales, arpeggios, and chord voicing.</p>
            <p>The pedals are essential to piano playing: the damper (right) pedal sustains notes, the soft (left) pedal modifies tone quality, and the sostenuto (middle) pedal holds selected notes. Mastering pedal techniques is crucial for expressive playing.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1552422089-4f5e512c1299?w=800&auto=format",
          "https://images.unsplash.com/photo-1604077350837-c96f0275d513?w=800&auto=format"
        ]
      }
    ],
    harp: [
      {
        id: "history",
        title: "Historical Development",
        content: (
          <div className="space-y-3">
            <p>The harp is one of humanity's oldest instruments, with evidence dating back to 3500 BCE in Mesopotamia and Egypt. Throughout history, various cultures developed their own harp traditions, including the Celtic, African, and Asian harps.</p>
            <p>The modern concert harp was revolutionized in the early 19th century by Sébastien Érard, who invented the double-action pedal system that allows the instrument to play in all keys. Today's concert harps typically have 47 strings and seven pedals, each with three positions.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1603063489233-48def3da0aa7?w=800&auto=format",
          "https://images.unsplash.com/photo-1603063391526-4eb3c9170461?w=800&auto=format"
        ]
      },
      {
        id: "technique",
        title: "Harp Techniques",
        content: (
          <div className="space-y-3">
            <p>Harp technique involves proper hand position with rounded fingers and precise finger placement. Harpists use different articulations like plucking, glissando (sliding across strings), harmonics (creating bell-like tones), and pedal techniques to change key or create enharmonic notes.</p>
            <p>Advanced techniques include enharmonic effects (using pedals to create special effects), près de la table (playing near the soundboard for a metallic sound), and complex pedal changes that must be coordinated with hand movements.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1624631633408-5c93ebdc5abd?w=800&auto=format",
          "https://images.unsplash.com/photo-1603063690144-905a0f8956e9?w=800&auto=format"
        ]
      }
    ],
    flute: [
      {
        id: "history",
        title: "Historical Development",
        content: (
          <div className="space-y-3">
            <p>The flute is one of the oldest known musical instruments, with primitive flutes dating back 40,000+ years. The modern concert flute evolved from simple wooden transverse flutes used in medieval and Renaissance Europe.</p>
            <p>Theobald Boehm revolutionized the flute in the 19th century, creating the key system still used today. His 1847 cylindrical metal flute with padded keys arranged according to acoustic principles transformed the instrument's technical capabilities and sound projection.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1621368886730-724a7b61e3ab?w=800&auto=format",
          "https://images.unsplash.com/photo-1569790884853-4b8e4edd5067?w=800&auto=format"
        ]
      },
      {
        id: "technique",
        title: "Flute Techniques",
        content: (
          <div className="space-y-3">
            <p>Flute playing centers around breath control, embouchure (lip position), and finger technique. Players direct a focused airstream across the embouchure hole, creating sound through air vibration rather than a reed or mouthpiece.</p>
            <p>Advanced techniques include multiple tonguing (double/triple tonguing for rapid articulation), harmonic tones, flutter tonguing, key clicks, whistle tones, and various timbral modifications achieved through embouchure and air direction changes.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1583085453398-99909df6c99e?w=800&auto=format",
          "https://images.unsplash.com/photo-1595073752098-bea7c7de54ed?w=800&auto=format"
        ]
      }
    ],
    default: [
      {
        id: "general",
        title: "About This Instrument",
        content: (
          <div className="space-y-3">
            <p>Each instrument has a rich history and unique playing techniques that have evolved over centuries. Learning an instrument connects you to cultural traditions and provides both cognitive and emotional benefits.</p>
            <p>Regular practice, proper technique, and enthusiasm are key to mastering any musical instrument. Consider working with a teacher to develop proper skills and avoid common mistakes.</p>
          </div>
        ),
        images: [
          "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&auto=format",
          "https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800&auto=format"
        ]
      }
    ]
  };

  // Return knowledge sections for the specific instrument or default content
  return knowledgeBase[instrumentId] || knowledgeBase.default;
};

const InstrumentKnowledge: React.FC<InstrumentKnowledgeProps> = ({ instrumentId, colorClass }) => {
  const knowledgeSections = getKnowledgeSections(instrumentId);

  return (
    <div className="animate-fade-in">
      <h3 className={`text-xl font-medium ${colorClass.text} mb-4`}>In-Depth Knowledge</h3>
      <Card className={`bg-white/60 shadow-sm`}>
        <Accordion type="single" collapsible className="w-full">
          {knowledgeSections.map((section) => (
            <AccordionItem key={section.id} value={section.id} className="border-b last:border-b-0">
              <AccordionTrigger className={`${colorClass.text} hover:no-underline py-4 px-5`}>
                <span className="flex items-center gap-2">{section.title}</span>
              </AccordionTrigger>
              <AccordionContent className="p-5 pb-6 pt-0">
                <div className="grid grid-cols-1 gap-6">
                  <div className="text-gray-700 text-sm space-y-4">
                    {section.content}
                  </div>
                  
                  {section.images && section.images.length > 0 && (
                    <div className="mt-4">
                      <Carousel className="w-full max-w-xs mx-auto">
                        <CarouselContent>
                          {section.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="h-48 rounded-md overflow-hidden bg-white/20 shadow-sm">
                                <img 
                                  src={image} 
                                  alt={`${section.title} illustration ${index + 1}`} 
                                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default InstrumentKnowledge;