import React from 'react';
import { Calendar as CalendarIcon, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { SportType } from '../types';

interface FiltersProps {
  selectedSports: SportType[];
  onSportToggle: (sport: SportType) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedPeriods: string[];
  onPeriodToggle: (period: string) => void;
  onClearFilters: () => void;
  courtsCount: number;
  dynamicSports?: any[];
}

export default function Filters({
  selectedSports,
  onSportToggle,
  selectedDate,
  onDateChange,
  selectedPeriods,
  onPeriodToggle,
  onClearFilters,
  courtsCount,
  dynamicSports = [],
}: FiltersProps) {
  const sportsList = dynamicSports.length > 0
    ? dynamicSports.map(s => ({ id: s.name, label: s.name }))
    : [
        { id: 'padel', label: 'Pádel' },
        { id: 'tenis', label: 'Tenis' },
        { id: 'futbol', label: 'Fútbol' },
        { id: 'basquet', label: 'Básquet' },
      ];

  const periodsList = ['Mañana', 'Tarde', 'Noche', 'Madrugada'];

  return (
    <aside className="w-full md:w-80 shrink-0 space-y-6 relative z-10 animate-fade-in">
      <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <h3 className="text-sm font-black text-white font-headline uppercase flex items-center gap-2 tracking-wider italic">
            Filtros
          </h3>
          <button
            onClick={onClearFilters}
            className="text-[11px] font-black uppercase text-[#c0ff00] hover:underline flex items-center gap-1 cursor-pointer tracking-wider"
            id="clear-filters"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar
          </button>
        </div>

        {/* Deporte Checklist */}
        <div className="mb-6">
          <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 font-mono">
            Deporte
          </h4>
          <div className="space-y-3">
            {sportsList.map((sport) => {
              const isChecked = selectedSports.includes(sport.id);
              return (
                <label
                  key={sport.id}
                  onClick={() => onSportToggle(sport.id)}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <span className="text-[#c0ff00] transition-colors">
                    {isChecked ? (
                      <CheckSquare className="h-5 w-5 fill-[#c0ff00]/10 text-[#c0ff00]" />
                    ) : (
                      <Square className="h-5 w-5 text-zinc-600 group-hover:text-[#c0ff00]" />
                    )}
                  </span>
                  <span
                    className={`text-sm tracking-wide font-medium transition-colors ${
                      isChecked
                        ? 'text-white font-bold'
                        : 'text-zinc-300 group-hover:text-[#c0ff00]'
                    }`}
                  >
                    {sport.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Fecha Picker */}
        <div className="mb-6">
          <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 font-mono">
            Fecha para jugar
          </h4>
          <div className="relative">
            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-white bg-zinc-950/50 focus:border-[#c0ff00] focus:ring-1 focus:ring-[#c0ff00] outline-none transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Horario Periods (Bento Selection) */}
        <div>
          <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 font-mono">
            Rango Horario
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {periodsList.map((period) => {
              const isActive = selectedPeriods.includes(period);
              return (
                <button
                  key={period}
                  onClick={() => onPeriodToggle(period)}
                  className={`py-2.5 px-3 border rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-[#c0ff00] font-black shadow-sm'
                      : 'border-white/10 bg-zinc-950/20 text-zinc-300 hover:border-[#c0ff00] hover:text-[#c0ff00]'
                  }`}
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Promociones / Pro-Tip Ad Space directly underneath filters (Matches image 1) */}
      <div className="relative overflow-hidden rounded-2xl h-64 shadow-xl group border border-white/10">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOMZdAxBcXSJf_JwBnqwgeP1ogZ8_rVejyzCOVOxUUx0eu0imfhiJEzfdbRgIUYm7_jZ3Bm1J2N8tg2UlCFrUgc5AYdkvmxQSHd9w4kuonYCuxMCSKejRcT6SYAnKCRnXIC7JBTMLGVoezorHAUOUCLJ1MhTNB2iNdEsI2FkosqHEbNkXqkf9tkKqXdE0upcLpDtnJolSBSKPWOdiFNAtu5LGbKyRNEVShuh6OhYZ_H61AVbYk38FaqCUIxMmn0nB8444PHtBf0-M"
          alt="Tennis Pro Tip Coach"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent flex flex-col justify-end p-5">
          <span className="text-black bg-[#c0ff00] px-2 py-0.5 rounded text-[9px] font-black w-fit mb-2 shadow uppercase tracking-wider font-mono">
            Consejo Profesional
          </span>
          <p className="text-white font-headline font-black text-base leading-snug uppercase tracking-tight">
            Mejora tu juego con instructores certificados
          </p>
          <p className="text-zinc-300 text-[10px] font-semibold font-sans mt-1 leading-relaxed">
            Clases individuales de pádel y tenis los fines de semana.
          </p>
        </div>
      </div>
    </aside>
  );
}
