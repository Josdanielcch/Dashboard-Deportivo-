import React from 'react';
import { Search, Calendar, ChevronRight, Compass, ShieldCheck, Smile, Star, UserPlus, Globe } from 'lucide-react';

interface HowItWorksProps {
  onExploreClick: () => void;
  onRegisterClick: () => void;
}

export default function HowItWorks({ onExploreClick, onRegisterClick }: HowItWorksProps) {
  const steps = [
    {
      num: '01',
      title: 'Busca y Compara',
      desc: 'Explora nuestra red de centros deportivos premium en tu ciudad. Filtra por deporte, tipo de superficie (arcilla, sintético, madera, cristal) y horarios.',
      icon: <Search className="h-6 w-6 text-[#c0ff00]" />,
    },
    {
      num: '02',
      title: 'Reserva & Turno Fijo',
      desc: 'Elige un bloque de 1.5 horas que se acomode a tus horarios escolares o laborales. Paga de forma segura y obtén hasta un 25% de ahorro con la membresía PRO.',
      icon: <Calendar className="h-6 w-6 text-[#c0ff00]" />,
    },
    {
      num: '03',
      title: 'Acude & Disfruta',
      desc: 'Recibe tu código QR y ID de reserva para el acceso inmediato. Ninguna fila de espera, ninguna llamada previa. ¡La cancha reservada está lista para ti!',
      icon: <ShieldCheck className="h-6 w-6 text-[#c0ff00]" />,
    },
  ];

  return (
    <div className="space-y-12 py-4 relative z-10 text-white" id="how-it-works-view">
      {/* Visual Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[#c0ff00] bg-[#c0ff00]/10 border border-[#c0ff00]/20 px-3 py-1 rounded text-xs font-black tracking-widest uppercase inline-block font-mono">
          SENCILLEZ Y VELOCIDAD
        </span>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white font-headline italic">
          El Deporte, en tus manos
        </h2>
        <p className="text-sm text-zinc-400 font-semibold">
          Diseñamos CourtConnect para arrancar la complejidad burocrática del alquiler deportivo clásico. Sin fricciones, sin intermediarios.
        </p>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className="bg-zinc-900/40 p-8 rounded-3xl border border-white/10 shadow-2xl relative group hover:border-[#c0ff00]/40 hover:shadow-[#c0ff00]/5 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="absolute top-6 right-8 text-5xl font-black text-white/5 group-hover:text-[#c0ff00]/10 select-none transition-colors font-mono">
              {s.num}
            </div>

            <div className="h-12 w-12 bg-[#c0ff00]/10 text-[#c0ff00] border border-[#c0ff00]/20 rounded-2xl flex items-center justify-center mb-6">
              {s.icon}
            </div>

            <h3 className="text-lg font-black font-headline text-white uppercase mb-3">
              {s.title}
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA teaser section */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-[-50px] right-[-50px] text-white/5 pointer-events-none">
          <Globe className="h-64 w-64 text-[#c0ff00]/10" />
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <span className="bg-[#c0ff00] text-black text-[10px] font-black tracking-widest px-2.5 py-1 rounded inline-block uppercase font-mono">
            MEMBRESÍA ACTIVA
          </span>
          <h3 className="text-2xl md:text-3xl font-black uppercase font-headline italic">
            ¿Listo para dominar la cancha hoy?
          </h3>
          <p className="text-sm text-zinc-300 font-medium">
            Regístrate para asegurar la disponibilidad priority, guardar estadísticas de tus retas pasadas y acceder al 25% de descuento directo en tus reservas.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <button
            onClick={onExploreClick}
            className="bg-[#c0ff00] text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-wider py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow shadow-[#c0ff00]/25 cursor-pointer"
          >
            <span>Reservar ahora</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onRegisterClick}
            className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white transition-all text-xs font-black uppercase tracking-wider py-4 px-6 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <span>Crear cuenta gratis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
