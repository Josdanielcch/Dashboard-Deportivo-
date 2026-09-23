import React, { useState } from 'react';
import { Award, LogOut, Trophy, User as UserIcon, Menu, X, Compass, HelpCircle, Info, Calendar } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-10 py-3 md:py-4 transition-all pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center w-full">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 md:gap-10 min-w-0">
          <button
            onClick={() => handleNavClick('home')}
            className="text-base sm:text-xl md:text-2xl font-black text-[#c0ff00] tracking-tighter hover:opacity-95 transition-opacity flex items-center gap-2 italic uppercase shrink-0"
            id="brand-logo"
          >
            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-[#c0ff00] fill-[#c0ff00] shrink-0" />
            <span className="truncate">COURTCONNECT</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('explore')}
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
              onClick={() => handleNavClick('how-it-works')}
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
              onClick={() => handleNavClick('about-us')}
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
                onClick={() => handleNavClick('my-bookings')}
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

        {/* Desktop User / Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
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
                onClick={() => handleNavClick('my-bookings')}
                title="Ver mis reservas"
                className="h-10 w-10 rounded-full bg-zinc-800 text-zinc-100 font-bold flex items-center justify-center hover:bg-[#c0ff00] hover:text-black transition-all relative group shadow border border-white/10"
              >
                <UserIcon className="h-5 w-5" />
                {currentUser.membershipLevel === 'pro' && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#c0ff00] rounded-full border-2 border-zinc-900 flex items-center justify-center text-[7px]" />
                )}
              </button>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 active:scale-95 duration-150"
                id="logout-btn"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-sm font-bold text-zinc-300 hover:text-[#c0ff00] px-4 py-2 hover:bg-white/5 rounded-xl transition-all"
                id="login-btn"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-[#c0ff00] text-black px-5 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg shadow-[#c0ff00]/15 shrink-0 uppercase tracking-widest"
                id="register-btn"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Actions (Designed specifically for iPhone 15 Pro & mobile viewports) */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => handleNavClick('my-bookings')}
              className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-100 font-bold flex items-center justify-center relative border border-white/10 active:scale-95"
              title="Mis Reservas"
            >
              <UserIcon className="h-4 w-4" />
              {currentUser.membershipLevel === 'pro' && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-[#c0ff00] rounded-full border-2 border-zinc-900" />
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth('login');
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#c0ff00] text-black px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 shadow-sm shadow-[#c0ff00]/20 shrink-0"
              id="mobile-quick-login-btn"
            >
              Ingresar
            </button>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/10 active:scale-95"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-[#c0ff00]" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-4 border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl space-y-4 animate-fade-in border border-white/5">
          {/* User profile card in drawer */}
          {currentUser && (
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#c0ff00]/10 border border-[#c0ff00]/30 flex items-center justify-center text-[#c0ff00] shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    {currentUser.name}
                    {currentUser.membershipLevel === 'pro' && (
                      <span className="bg-[#c0ff00] text-black text-[8px] px-1 py-0.2 rounded font-black tracking-wider">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('explore')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentTab === 'explore'
                  ? 'bg-[#c0ff00]/15 text-[#c0ff00] font-black'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Explorar Canchas</span>
            </button>

            {currentUser && (
              <button
                onClick={() => handleNavClick('my-bookings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === 'my-bookings'
                    ? 'bg-[#c0ff00]/15 text-[#c0ff00] font-black'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Mis Reservas</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentTab === 'how-it-works'
                  ? 'bg-[#c0ff00]/15 text-[#c0ff00] font-black'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Cómo Funciona</span>
            </button>

            <button
              onClick={() => handleNavClick('about-us')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentTab === 'about-us'
                  ? 'bg-[#c0ff00]/15 text-[#c0ff00] font-black'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>Nosotros</span>
            </button>
          </div>

          {/* Drawer Actions */}
          <div className="pt-3 border-t border-white/10">
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors uppercase tracking-wider"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 border border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-center active:scale-95 transition-all"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-[#c0ff00] text-black rounded-xl text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-[#c0ff00]/15 active:scale-95 transition-all"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
