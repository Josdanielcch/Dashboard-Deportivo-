import React from 'react';
import { Share2, MessageSquare, Mail, Phone, MapPin, Trophy } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: 'CourtConnect - Reserva de Canchas',
        text: '¡Reserva las mejores canchas de pádel, tenis y fútbol en segundos!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Enlace copiado al portapapeles: ' + window.location.href);
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <footer className="w-full py-12 px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 bg-zinc-950/80 text-zinc-300 border-t border-white/10 mt-20 relative z-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[#c0ff00] font-black text-xl tracking-tighter italic uppercase animate-pulse">
          <Trophy className="h-5 w-5 fill-[#c0ff00]" />
          <span>COURTCONNECT</span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          La plataforma definitiva para deportistas. Reserva, compite y mejora en un solo lugar. Conectamos clubes urbanos de alto nivel con jugadores apasionados.
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
          <MapPin className="h-3 w-3" /> CDMX, México
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4 border-b border-[#c0ff00]/20 pb-1 w-fit">Plataforma</h4>
        <ul className="space-y-2.5">
          <li>
            <button
              onClick={() => setCurrentTab('explore')}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors text-left font-semibold"
            >
              Explorar Canchas
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentTab('how-it-works')}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors text-left font-semibold"
            >
              Cómo Funciona
            </button>
          </li>
          <li>
            <a
              href="#clubs"
              onClick={(e) => {
                e.preventDefault();
                alert('¡Próximamente! Herramientas de administración de torneos y agendas para clubes deportivos.');
              }}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors block font-semibold"
            >
              Para Clubes
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4 border-b border-[#c0ff00]/20 pb-1 w-fit">Compañía</h4>
        <ul className="space-y-2.5">
          <li>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert('Aviso de Privacidad: Protegemos tus datos de contacto y de pago bajo estándares avanzados de cifrado SSL.');
              }}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors block font-semibold"
            >
              Privacidad
            </a>
          </li>
          <li>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Términos de Servicio: Las canchas deben cancelarse con al menos 24 horas de anticipación para reembolsos totales.');
              }}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors block font-semibold"
            >
              Términos de Servicio
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                alert('Contacto: soporte@courtconnect.com | Teléfono: +52 (55) 4123-9876');
              }}
              className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors block font-semibold"
            >
              Contacto
            </a>
          </li>
        </ul>
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4 border-b border-[#c0ff00]/20 pb-1 w-fit">Social</h4>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center hover:bg-[#c0ff00] hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm border border-white/5"
              title="Compartir Plataforma"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                alert('Canal de Chat Comunitario CourtConnect: ¡Únete para concertar retas de Padel y Tenis!');
              }}
              className="w-10 h-10 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center hover:bg-[#c0ff00] hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm border border-white/5"
              title="Comunidad Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-8 leading-snug">
          © {new Date().getFullYear()} CourtConnect Sports Systems. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
