import React from 'react';
import { SPORT_CATEGORIES } from '../data';
import { SportType } from '../types';
import { ArrowRight } from 'lucide-react';

interface FeaturedSportsProps {
  onSportSelect: (sport: SportType) => void;
  dynamicSports?: any[];
}

export default function FeaturedSports({ onSportSelect, dynamicSports = [] }: FeaturedSportsProps) {
  const sportsToDisplay = dynamicSports.length > 0 
    ? dynamicSports.map(s => ({ id: s.name, name: s.name, image: s.image_url, tag: 'DISPONIBLE', description: 'Reserva tu cancha de ' + s.name }))
    : SPORT_CATEGORIES;

  return (
    <div className="mb-16 relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white relative inline-block italic">
          Domina cada terreno
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#c0ff00] rounded-full" />
        </h2>
        <p className="text-sm text-zinc-400 mt-4">
          Elige tu deporte favorito y descubre canchas de calidad profesional con disponibilidad garantizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sportsToDisplay.map((cat, idx) => (
          <div
            key={cat.id}
            onClick={() => onSportSelect(cat.id as SportType)}
            className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#c0ff00] hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#c0ff00]/10 transition-all duration-300"
            id={`sport-card-${cat.id}`}
          >
            {/* Background image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/5 group-hover:via-black/50 transition-all z-10" />
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Content overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end h-full">
              <span className="text-[9px] uppercase tracking-widest font-black text-[#c0ff00] bg-black/60 border border-[#c0ff00]/20 px-2.5 py-1 rounded w-fit mb-2 shadow font-mono">
                {cat.tag}
              </span>
              <h3 className="text-lg font-black text-white uppercase group-hover:text-[#c0ff00] transition-colors font-headline">
                {cat.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {cat.description}
              </p>
              
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                <span>Reservar cancha</span>
                <ArrowRight className="h-4 w-4 text-[#c0ff00]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
