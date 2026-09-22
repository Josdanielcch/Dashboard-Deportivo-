import React from 'react';
import { Share2, MessageSquare, MapPin, Trophy, Lock, ArrowUp } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    if (document.documentElement) {
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

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

  const panelUrl = import.meta.env.VITE_PANEL_URL || '/panel/';

  return (
    <footer className="w-full bg-zinc-950/80 text-zinc-300 border-t border-white/10 mt-20 relative z-10">
      {/* Grid principal */}
      <div className="py-12 px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[#c0ff00] font-black text-xl tracking-tighter italic uppercase hover:opacity-85 transition-opacity text-left cursor-pointer group w-fit"
            title="Ir arriba / Inicio"
            id="footer-brand-logo"
          >
            <Trophy className="h-5 w-5 fill-[#c0ff00] group-hover:scale-110 transition-transform" />
            <span>COURTCONNECT</span>
          </button>
          <p className="text-sm text-zinc-400 leading-relaxed">
            La plataforma definitiva para deportistas. 
            <br /> <br />
            Reserva, compite y mejora en un solo lugar.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
            <MapPin className="h-3 w-3" /> Tachira, Venezuela
          </div>
        </div>

        {/* Plataforma */}
        <div>
          <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4 border-b border-[#c0ff00]/20 pb-1 w-fit">Plataforma</h4>
          <ul className="space-y-2.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('explore');
                  scrollToTop();
                }}
                className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors text-left font-semibold cursor-pointer"
              >
                Explorar Canchas
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('how-it-works');
                  scrollToTop();
                }}
                className="text-sm text-zinc-400 hover:text-[#c0ff00] hover:underline transition-colors text-left font-semibold cursor-pointer"
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

        {/* Compañía */}
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

        {/* Social */}
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
      </div>

      {/* Barra inferior — acceso discreto al panel administrativo y botón subir */}
      <div className="border-t border-white/5 px-6 md:px-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-zinc-700 font-mono text-center sm:text-left">
          CourtConnect v1.0 · SportSpaces OS
        </p>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#c0ff00] transition-colors py-1 px-3 rounded-full hover:bg-white/5 cursor-pointer group font-medium"
          title="Volver arriba"
        >
          <span>Volver arriba</span>
          <ArrowUp className="h-3.5 w-3.5 text-[#c0ff00] group-hover:-translate-y-0.5 transition-transform" />
        </button>

        <a
          href={panelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-400 transition-colors duration-300 group"
          title="Acceso al panel de administración"
        >
          <Lock className="h-3 w-3 group-hover:text-[#c0ff00] transition-colors" />
          <span className="font-mono">Administración</span>
        </a>
      </div>
    </footer>
  );
}
