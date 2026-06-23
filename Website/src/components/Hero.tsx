import React, { useState } from 'react';
import { Search, Calendar, Compass, Shield, Users, Zap } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
  onQuickSearch: (query: string) => void;
}

export default function Hero({ onExploreClick, onHowItWorksClick, onQuickSearch }: HeroProps) {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(searchVal);
    onExploreClick();
  };

  return (
    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
      {/* Background Image Container with Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-950/95 to-zinc-950/60 z-10" />
      <img
        src="/images/court-1.jpg"
        alt="Padel Court Background"
        className="absolute inset-0 w-full h-full object-cover object-center scale-100"
        referrerPolicy="no-referrer"
      />

      {/* Hero Content */}
      <div className="relative z-20 px-6 sm:px-12 py-16 md:py-28 max-w-4xl text-white">
        <span className="inline-block bg-[#c0ff00] text-black text-xs font-black tracking-widest uppercase px-3 py-1 rounded-md mb-4 shadow ring-1 ring-[#c0ff00]/30 font-mono">
          MÁXIMA VELOCIDAD DE RESERVA
        </span>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-headline mb-4 italic">
          Tu próxima victoria <span className="text-[#c0ff00]">comienza aquí</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-sans mb-8 leading-relaxed max-w-2xl">
          Encuentra y reserva las mejores canchas de tu ciudad en segundos. La plataforma definitiva para deportistas que buscan el siguiente nivel de competencia o entretenimiento.
        </p>

        {/* Dynamic CTA buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={onExploreClick}
            className="bg-[#c0ff00] text-black hover:scale-105 active:scale-95 font-sans font-black px-6 py-3.5 rounded-xl text-xs flex items-center gap-2 group shadow-xl shadow-[#c0ff00]/10 hover:shadow-[#c0ff00]/25 transition-all duration-300 uppercase tracking-widest cursor-pointer"
          >
            <Compass className="h-4.5 w-4.5 group-hover:rotate-45 transition-transform duration-300 text-black fill-black" />
            Explorar Canchas
          </button>
          
          <button
            onClick={onHowItWorksClick}
            className="bg-white/10 hover:bg-white/20 border border-white/20 font-sans font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all duration-300"
          >
            Cómo funciona
          </button>
        </div>

        {/* Integrated Quick Search inside Hero */}
        <form onSubmit={handleSearchSubmit} className="bg-zinc-900/60 backdrop-blur-md p-2 rounded-xl sm:rounded-2xl border border-white/10 max-w-xl flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="¿Qué club o zona buscas hoy? Ej: Polanco"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent text-white placeholder-zinc-400 text-sm focus:outline-none w-full py-2 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="bg-[#c0ff00] hover:bg-[#c0ff00]/90 hover:scale-[1.03] text-black px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase shrink-0 transition-all cursor-pointer"
          >
            Buscar Cancha
          </button>
        </form>
      </div>

      {/* Highlight Ribbon - Three benefits */}
      <div className="relative z-20 bg-zinc-950/90 text-white px-6 md:px-12 py-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white/5 rounded-xl text-[#c0ff00] border border-white/5 shrink-0 shadow-sm">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-headline text-white mb-0.5 uppercase tracking-wide">Busca tu cancha</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              Filtra por deporte, ubicación y tipo de superficie en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t sm:border-t-0 sm:border-x border-white/10 pt-4 sm:pt-0 sm:px-4">
          <div className="p-2 bg-white/5 rounded-xl text-[#c0ff00] border border-white/5 shrink-0 shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-headline text-white mb-0.5 uppercase tracking-wide">Reserva al instante</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              Olvídate de las llamadas. Confirma tu reserva en menos de un minuto.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
          <div className="p-2 bg-white/5 rounded-xl text-[#c0ff00] border border-white/5 shrink-0 shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-headline text-white mb-0.5 uppercase tracking-wide">Juega y disfruta</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              Preocúpate solo por jugar. Retamos tus límites con excelentes instalaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
