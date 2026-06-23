import React from 'react';
import { Award, Layers, LogOut, Ticket, Trophy, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onOpenAuth,
}: HeaderProps) {
  return (
    <header className="sticky top-0 w-full z-50 flex justify-between items-center px-4 md:px-10 py-4 bg-zinc-950/40 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-6 md:gap-10">
        <button
          onClick={() => setCurrentTab('home')}
          className="text-lg md:text-2xl font-black text-[#c0ff00] tracking-tighter hover:opacity-95 transition-opacity flex items-center gap-2 italic uppercase"
          id="brand-logo"
        >
          <Trophy className="h-5 w-5 md:h-6 md:w-6 text-[#c0ff00] fill-[#c0ff00]" />
          <span>COURTCONNECT</span>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('explore')}
            className={`text-sm font-bold tracking-wide transition-all pb-1 border-b-2 uppercase ${
              currentTab === 'explore'
                ? 'text-[#c0ff00] border-[#c0ff00]'
                : 'text-zinc-400 border-transparent hover:text-[#c0ff00]'
            }`}
            id="nav-sports"
          >
            Explorar Canchas
          </button>
          <button
            onClick={() => setCurrentTab('how-it-works')}
            className={`text-sm font-bold tracking-wide transition-all pb-1 border-b-2 uppercase ${
              currentTab === 'how-it-works'
                ? 'text-[#c0ff00] border-[#c0ff00]'
                : 'text-zinc-400 border-transparent hover:text-[#c0ff00]'
            }`}
            id="nav-how"
          >
            Cómo Funciona
          </button>
          <button
            onClick={() => setCurrentTab('about-us')}
            className={`text-sm font-bold tracking-wide transition-all pb-1 border-b-2 uppercase ${
              currentTab === 'about-us'
                ? 'text-[#c0ff00] border-[#c0ff00]'
                : 'text-zinc-400 border-transparent hover:text-[#c0ff00]'
            }`}
            id="nav-about"
          >
            Nosotros
          </button>
          {currentUser && (
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className={`text-sm font-bold tracking-wide transition-all pb-1 border-b-2 uppercase ${
                currentTab === 'my-bookings'
                  ? 'text-[#c0ff00] border-[#c0ff00]'
                  : 'text-zinc-400 border-transparent hover:text-[#c0ff00]'
              }`}
              id="nav-bookings"
            >
              Mis Reservas
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile menu trigger helper */}
        <div className="md:hidden flex items-center gap-2 mr-1">
          <button
            onClick={() => setCurrentTab('explore')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
              currentTab === 'explore'
                ? 'bg-[#c0ff00]/10 text-[#c0ff00] ring-1 ring-[#c0ff00]/25'
                : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            Explorar
          </button>
          {currentUser && (
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                currentTab === 'my-bookings'
                  ? 'bg-[#c0ff00]/10 text-[#c0ff00] ring-1 ring-[#c0ff00]/25'
                  : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              Reservas
            </button>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-zinc-100 flex items-center justify-end gap-1">
                {currentUser.name}
                {currentUser.membershipLevel === 'pro' && (
                  <span className="bg-[#c0ff00] text-black text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-0.5 shadow-sm">
                    <Award className="h-2.5 w-2.5" /> PRO
                  </span>
                )}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</span>
            </div>

            <button
              onClick={() => setCurrentTab('my-bookings')}
              title="Ver mis reservas"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-zinc-800 text-zinc-100 font-bold flex items-center justify-center hover:bg-[#c0ff00] hover:text-black transition-all relative group shadow"
            >
              <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
              {currentUser.membershipLevel === 'pro' && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-yellow-400 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[7px]" />
              )}
            </button>

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 text-zinc-400 hover:text-[#c0ff00] transition-colors rounded-lg hover:bg-white/5 active:scale-95 duration-150"
              id="logout-btn"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs md:text-sm font-bold text-zinc-400 hover:text-[#c0ff00] px-2.5 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-all"
              id="login-btn"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-[#c0ff00] text-black px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-black hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg shadow-[#c0ff00]/10 hover:shadow-[#c0ff00]/25 shrink-0 uppercase tracking-widest"
              id="register-btn"
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
