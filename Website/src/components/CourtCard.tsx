import React from 'react';
import { Court } from '../types';
import { Star, MapPin, ArrowRight, Activity, Zap } from 'lucide-react';

interface CourtCardProps {
  key?: string;
  court: Court;
  onSelectCourt: (court: Court) => void;
}

export default function CourtCard({ court, onSelectCourt }: CourtCardProps) {
  // Format sport labels beautifully
  const getSportLabel = (sport: string) => {
    switch (sport) {
      case 'padel':
        return 'Pádel';
      case 'tenis':
        return 'Tenis';
      case 'futbol':
        return 'Fútbol';
      case 'basquet':
        return 'Básquet';
      default:
        return sport;
    }
  };

  return (
    <div className="bg-zinc-900/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-[#c0ff00]/5 hover:scale-[1.01] transition-all duration-300 border border-white/10 hover:border-[#c0ff00]/50 flex flex-col group h-full backdrop-blur-sm">
      {/* Upper image block */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img
          src={court.imageUrl}
          alt={court.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />

        {/* Floating Availability badges (matches image 1) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          {court.isAvailable ? (
            <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg font-mono">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
              <span>Disponible</span>
            </div>
          ) : court.upcomingSpots ? (
            <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg font-mono">
              <Zap className="h-3 w-3 fill-amber-950 text-amber-950" />
              <span>Últimos cupos</span>
            </div>
          ) : (
            <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg border border-white/5 font-mono">
              <span>Agenda llena</span>
            </div>
          )}
        </div>

        {/* Lower tags overlap */}
        <div className="absolute bottom-3 left-3 flex gap-2 z-10">
          <span className="bg-black/75 backdrop-blur-md text-white font-sans text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border border-white/5">
            {getSportLabel(court.sport)}
          </span>
          <span className="bg-black/75 backdrop-blur-md text-white font-sans text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border border-white/5">
            {court.type}
          </span>
        </div>
      </div>

      {/* Description block */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-base md:text-lg font-black font-headline text-white group-hover:text-[#c0ff00] transition-colors line-clamp-1 uppercase">
            {court.name}
          </h3>
          <div className="flex items-center gap-0.5 text-[#c0ff00] shrink-0 font-mono">
            <Star className="h-4 w-4 fill-[#c0ff00] text-[#c0ff00]" />
            <span className="font-bold text-xs md:text-sm">{court.score.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-4 flex items-center gap-1 font-sans">
          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="line-clamp-1 font-semibold">{court.club}, {court.city}</span>
        </p>

        {/* CTA section strictly customized */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-black block font-mono">Desde</span>
            <span className="text-base md:text-xl text-[#c0ff00] font-black tracking-tight flex items-baseline gap-1" id={`price-${court.id}`}>
              ${court.pricePerHour}
              <span className="text-xs font-normal text-zinc-400">/ hr</span>
            </span>
          </div>
          
          <button
            onClick={() => onSelectCourt(court)}
            className="bg-[#c0ff00] text-black px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase hover:scale-[1.03] transition-all duration-200 group/btn flex items-center gap-1.5 shadow-lg shadow-[#c0ff00]/10 hover:shadow-[#c0ff00]/25 cursor-pointer"
            id={`btn-view-${court.id}`}
          >
            <span>Ver Horarios</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
