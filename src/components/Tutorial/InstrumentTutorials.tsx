
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music } from "lucide-react";

const tutorialsData = [
  {
    id: "piano",
    title: "Piano Tutorial",
    description: "Learn to play the piano with interactive lessons and exercises.",
    color: "bg-blue-500",
    textColor: "text-blue-50",
    hoverColor: "hover:bg-blue-600",
    icon: "🎹",
    link: "/piano",
    tutorialLink: "/tutorial/piano"
  },
  {
    id: "guitar",
    title: "Guitar Tutorial",
    description: "Master guitar chords, strumming patterns, and fingerpicking techniques.",
    color: "bg-amber-600",
    textColor: "text-amber-50",
    hoverColor: "hover:bg-amber-700",
    icon: "🎸",
    link: "/guitar",
    tutorialLink: "/tutorial/guitar"
  },
  {
    id: "drums",
    title: "Drums Tutorial",
    description: "Learn drum patterns, fills, and techniques for various music styles.",
    color: "bg-red-500",
    textColor: "text-red-50",
    hoverColor: "hover:bg-red-600",
    icon: "🥁",
    link: "/drums",
    tutorialLink: "/tutorial/drums"
  },
  {
    id: "violin",
    title: "Violin Tutorial",
    description: "Master the violin with bow techniques and finger positioning guides.",
    color: "bg-purple-500",
    textColor: "text-purple-50",
    hoverColor: "hover:bg-purple-600",
    icon: "🎻",
    link: "/violin",
    tutorialLink: "/tutorial/violin"
  },
  {
    id: "flute",
    title: "Flute Tutorial",
    description: "Learn proper breathing techniques and fingerings for the flute.",
    color: "bg-cyan-500",
    textColor: "text-cyan-50",
    hoverColor: "hover:bg-cyan-600",
    icon: "🎵",
    link: "/flute",
    tutorialLink: "/tutorial/flute"
  },
  {
    id: "saxophone",
    title: "Saxophone Tutorial",
    description: "Master saxophone embouchure, fingerings, and jazz improvisation techniques.",
    color: "bg-yellow-600",
    textColor: "text-yellow-50",
    hoverColor: "hover:bg-yellow-700",
    icon: "🎷",
    link: "/saxophone",
    tutorialLink: "/tutorial/saxophone"
  },
  {
    id: "trumpet",
    title: "Trumpet Tutorial",
    description: "Learn trumpet embouchure, breath control, and playing techniques.",
    color: "bg-yellow-500",
    textColor: "text-yellow-50",
    hoverColor: "hover:bg-yellow-600",
    icon: "🎺",
    link: "/trumpet",
    tutorialLink: "/tutorial/trumpet"
  },
  {
    id: "marimba",
    title: "Marimba Tutorial",
    description: "Master marimba mallet techniques, scales, and musical expression.",
    color: "bg-yellow-700",
    textColor: "text-yellow-50",
    hoverColor: "hover:bg-yellow-800",
    icon: "🪘",
    link: "/marimba",
    tutorialLink: "/tutorial/marimba"
  },
  {
    id: "kalimba",
    title: "Kalimba Tutorial",
    description: "Learn kalimba thumb piano techniques and beautiful melodies.",
    color: "bg-amber-500",
    textColor: "text-amber-50",
    hoverColor: "hover:bg-amber-600",
    icon: "🎵",
    link: "/kalimba",
    tutorialLink: "/tutorial/kalimba"
  },
  {
    id: "tabla",
    title: "Tabla Tutorial",
    description: "Master tabla rhythms, hand techniques, and Indian classical percussion.",
    color: "bg-red-700",
    textColor: "text-red-50",
    hoverColor: "hover:bg-red-800",
    icon: "🥁",
    link: "/tabla",
    tutorialLink: "/tutorial/tabla"
  },
   {
    id: "theremin",
    title: "Theremin Tutorial",
    description: "Master the theremin's unique contactless playing technique and musical expression.",
    color: "bg-purple-700",
    textColor: "text-purple-50",
    hoverColor: "hover:bg-purple-800",
    icon: "🎵",
    link: "/theremin",
    tutorialLink: "/tutorial/theremin"
  }
];

const InstrumentTutorials = () => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Instrument Tutorials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorialsData.map((tutorial) => (
          <div 
            key={tutorial.id}
            className={`rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${tutorial.color}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${tutorial.textColor}`}>{tutorial.title}</h3>
                <span className="text-3xl">{tutorial.icon}</span>
              </div>
              <p className={`mb-6 ${tutorial.textColor} opacity-90`}>{tutorial.description}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={tutorial.tutorialLink}>
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
                <Link to={tutorial.link}>
                  <Button className={`w-full sm:w-auto bg-white text-gray-800 ${tutorial.hoverColor}`}>
                    Play {tutorial.id.charAt(0).toUpperCase() + tutorial.id.slice(1)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="h-3 bg-black/10"></div>
            <div className="instrument-animation h-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Music className={`${tutorial.textColor} h-10 w-10 animate-pulse`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstrumentTutorials;
