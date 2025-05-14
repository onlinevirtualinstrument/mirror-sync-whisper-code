import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const instrumentCategories = [
  {
    name: "String Instruments",
    color: "bg-pink-100 text-pink-800",
    path: "/categories/strings",
    instruments: [
      { name: "Guitar", path: "/guitar" },
      { name: "Violin", path: "/violin" },
      { name: "Harp", path: "/harp" },
      { name: "Banjo", path: "/banjo" },
      { name: "Sitar", path: "/sitar" },
    ],
  },
  {
    name: "Keyboard Instruments",
    color: "bg-blue-100 text-blue-800",
    path: "/categories/keyboard",
    instruments: [
      { name: "Piano", path: "/piano" },
      { name: "Synthesizer", path: "/synthesizer" },
    ],
  },
  {
    name: "Wind Instruments",
    color: "bg-green-100 text-green-800",
    path: "/categories/wind",
    instruments: [
      { name: "Flute", path: "/flute" },
      { name: "Saxophone", path: "/saxophone" },
      { name: "Trumpet", path: "/trumpet" },
    ],
  },
  {
    name: "Percussion Instruments",
    color: "bg-yellow-100 text-yellow-800",
    path: "/categories/percussion",
    instruments: [
      { name: "Drums", path: "/drums" },
      { name: "Timpani", path: "/timpani" },
      { name: "Marimba", path: "/marimba" },
      { name: "Kalimba", path: "/kalimba" },
      { name: "Tabla", path: "/tabla" },
      { name: "Xylophone", path: "/xylophone" },
    ],
  },
  {
    name: "Electronic Instruments",
    color: "bg-purple-100 text-purple-800",
    path: "/categories/electronic",
    instruments: [{ name: "Theremin", path: "/theremin" }],
  },
];

const InstrumentNavDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1.5 px-4 py-2">
          <Music className="w-4 h-4" />
          Play Instrument
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={8} className="z-50 w-60">
        <DropdownMenuLabel className="text-base font-semibold px-3 py-2">
          Play Virtual Instrument
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {instrumentCategories.map((category) => (
         <DropdownMenu key={category.name}>
         <DropdownMenuTrigger asChild>
         <Link to={category.path}> 
           <DropdownMenuItem
             className={`justify-between m-3 px-4 py-2 rounded-md bg-gradient-to-r transition-all duration-300 ease-in-out cursor-pointer
               ${
                 category.name.includes("String")
                   ? "from-rose-100 to-rose-200 text-rose-900 hover:from-rose-200 hover:to-rose-300"
                   : category.name.includes("Wind")
                   ? "from-sky-100 to-sky-200 text-sky-900 hover:from-sky-200 hover:to-sky-300"
                   : category.name.includes("Keyboard")
                   ? "from-emerald-100 to-emerald-200 text-emerald-900 hover:from-emerald-200 hover:to-emerald-300"
                   : category.name.includes("Percussion")
                   ? "from-yellow-100 to-yellow-200 text-yellow-900 hover:from-yellow-200 hover:to-yellow-300"
                   : "from-purple-100 to-purple-200 text-purple-900 hover:from-purple-200 hover:to-purple-300"
               }
             `}
           >
             {category.name}
             <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
           </DropdownMenuItem>
           </Link>
         </DropdownMenuTrigger>
       

            {/* <DropdownMenuContent
   side={window.matchMedia("(max-width: 640px)").matches ? "bottom" : "right"}
  align="start"
  className="w-35 p-2 bg-white dark:bg-gray-900 rounded-md shadow-lg animate-fade-in"
>
  <div className="space-y-2">
    {category.instruments.map((instrument, index) => (
      <DropdownMenuItem key={instrument.name} asChild>
        <Link
          to={instrument.path}
          className={`block w-full px-3 py-2 text-sm rounded-md bg-gradient-to-r ${
            index % 2 === 0
              ? 'from-pink-100 to-pink-200 text-pink-900'
              : 'from-indigo-100 to-indigo-200 text-indigo-900'
          } hover:scale-[1.02] hover:shadow-md transition-all duration-300`}
        >
          {instrument.name}
        </Link>
      </DropdownMenuItem>
    ))}
  </div>
</DropdownMenuContent> */}

          </DropdownMenu>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InstrumentNavDropdown;




// <DropdownMenuSub key={category.name}>
// <DropdownMenuSubTrigger className="m-1.5">
//   <div
//     className={`w-full px-3 py-2 rounded-md bg-gradient-to-r transition-all duration-300 ease-in-out cursor-pointer
//       ${
//         category.name.includes("String")
//           ? "from-rose-100 to-rose-200 text-rose-900 hover:from-rose-200 hover:to-rose-300"
//           : category.name.includes("Wind")
//           ? "from-sky-100 to-sky-200 text-sky-900 hover:from-sky-200 hover:to-sky-300"
//           : category.name.includes("Keyboard")
//           ? "from-emerald-100 to-emerald-200 text-emerald-900 hover:from-emerald-200 hover:to-emerald-300"
//           : category.name.includes("Percussion")
//           ? "from-yellow-100 to-yellow-200 text-yellow-900 hover:from-yellow-200 hover:to-yellow-300"
//           : "from-purple-100 to-purple-200 text-purple-900 hover:from-purple-200 hover:to-purple-300"
//       }
//     `}
//   >
//     <div className="flex items-center justify-between">
//       <span>{category.name}</span>
//       <ChevronRight className="w-4 h-4 ml-2" />
//     </div>
//   </div>
// </DropdownMenuSubTrigger>

// <DropdownMenuSubContent className="w-40 p-2">
//   <div className="space-y-1">
//     {category.instruments.map((instrument, index) => (
//       <DropdownMenuItem key={instrument.name} asChild>
//         <Link
//           to={instrument.path}
//           className={`block w-full px-3 py-2 text-sm rounded-md bg-gradient-to-r ${
//             index % 2 === 0
//               ? 'from-pink-50 to-pink-100 text-pink-900'
//               : 'from-indigo-50 to-indigo-100 text-indigo-900'
//           } hover:scale-[1.02] hover:shadow-sm transition-all duration-300`}
//         >
//           {instrument.name}
//         </Link>
//       </DropdownMenuItem>
//     ))}
//   </div>
// </DropdownMenuSubContent>
// </DropdownMenuSub>
