import React from 'react';
import { Award, Layers, Users, Smile, Heart, CheckCircle2 } from 'lucide-react';

export default function AboutUs() {
  const stats = [
    { label: 'Canchas Aliadas', value: '128+' },
    { label: 'Jugadores Activos', value: '15,000+' },
    { label: 'Reservas Generadas', value: '98,000+' },
    { label: 'Ciudades de Cobertura', value: '8' }
  ];

  const values = [
    {
      title: 'Excelencia Deportiva',
      desc: 'Auditamos en persona cada cancha para garantizar condiciones perfectas de iluminación, red y superficie de rebote.'
    },
    {
      title: 'Fricción Cero',
      desc: 'Automatizamos agendas, pagos y claves de acceso para que pases más tiempo jugando y menos tiempo tecleando.'
    },
    {
      title: 'Comunidad Unida',
      desc: 'Facilitamos el encuentro entre deportistas del mismo nivel recreativo o competitivo con retas recurrentes.'
    }
  ];

  return (
    <div className="space-y-12 py-4 relative z-10 text-white" id="about-us-view">
      {/* Intro Narrative */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[#c0ff00] bg-[#c0ff00]/10 border border-[#c0ff00]/20 px-3 py-1 rounded text-xs font-black tracking-widest uppercase inline-block font-mono">
          NUESTRA MISIÓN
        </span>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white font-headline italic">
          Elevando el estándar amateur
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed font-semibold">
          Nacimos con una meta clara: conectar la pasión del juego amateur con la infraestructura tecnológica de las grandes ligas. Hacemos que jugar sea un placer sin esperas.
        </p>
      </div>

      {/* Grid statistics banners */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900/40 p-6 rounded-2xl border border-white/10 shadow-xl text-center backdrop-blur-sm">
            <div className="text-2xl md:text-4xl font-black font-headline text-[#c0ff00]">
              {stat.value}
            </div>
            <div className="text-xs text-zinc-400 font-bold mt-1 font-sans">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Deep split text content Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-zinc-900/40 p-8 md:p-12 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm">
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-black font-headline text-white uppercase italic">
            La Cancha que Sueñas, Al Alcance de tu Teléfono
          </h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans font-medium">
            Comenzamos con un pequeño nicho de amantes del pádel frustrados por los engorrosos canales de reserva de fin de semana (archivos Excel compartidos, pagos atrasados, llamadas sin contestar). 
            <br /><br />
            Hoy, CourtConnect representa el software aliado del deportista de alto rendimiento y el aficionado casual por igual. Ofrecemos herramientas de pago seguras, integración de códigos temporales de ingreso e invitaciones de juego cooperativo.
          </p>
          
          <ul className="space-y-2 pt-2">
            <li className="flex items-center gap-2 text-xs font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#c0ff00] shrink-0" />
              <span>Soporte al jugador 24 horas al día, 7 días de la semana</span>
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#c0ff00] shrink-0" />
              <span>Reembolsos ágiles bajo incidencias climáticas</span>
            </li>
          </ul>
        </div>

        {/* Visual Team representation */}
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 shadow-2xl border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200&auto=format&fit=crop"
            alt="Main clay court during high-precision match"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 text-white">
            <div className="text-xs font-black font-headline text-[#c0ff00] uppercase tracking-wider">INSTALACIONES PREMIUM</div>
            <p className="text-[10px] text-zinc-300 font-sans mt-0.5 font-medium">Sometemos cada club asociado a estándares de calidad olímpica.</p>
          </div>
        </div>
      </div>

      {/* Core Values grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-black font-headline uppercase text-white text-center italic">
          Nuestros Valores de Juego
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => (
            <div key={idx} className="bg-zinc-900/60 p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl">
              <div>
                <h4 className="text-sm font-black font-headline text-[#c0ff00] uppercase mb-2 tracking-wide font-mono">
                  {v.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
