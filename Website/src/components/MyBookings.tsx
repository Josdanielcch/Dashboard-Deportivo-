import React from 'react';
import { Booking } from '../types';
import { Calendar, Clock, MapPin, Trash2, ShieldAlert, BadgeCheck, Phone, CheckCircle } from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function MyBookings({ bookings, onCancelBooking, setCurrentTab }: MyBookingsProps) {
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'cancelled');

  const getSportLabel = (sport: string) => {
    switch (sport) {
      case 'padel': return 'Pádel';
      case 'tenis': return 'Tenis';
      case 'futbol': return 'Fútbol';
      case 'basquet': return 'Básquet';
      default: return sport;
    }
  };

  return (
    <div className="space-y-8 relative z-10" id="my-bookings-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-headline italic">
            Mis Canchas Reservadas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Revisa, accede con tus códigos o cancela tus agendas de juego activas.
          </p>
        </div>
        
        <button
          onClick={() => setCurrentTab('explore')}
          className="bg-[#c0ff00] text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#c0ff00]/10"
        >
          Reservar nueva cancha
        </button>
      </div>

      {activeBookings.length === 0 ? (
        <div className="bg-zinc-900/60 rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto space-y-4 shadow-2xl backdrop-blur-md">
          <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 mx-auto">
            <Calendar className="h-6 w-6 text-[#c0ff00]" />
          </div>
          <h3 className="text-lg font-black text-white font-headline uppercase tracking-wide">No tienes reservas activas</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto font-medium">
            Aún no has programado ningún juego. Explora nuestra amplia gama de canchas de pádel, tenis, fútbol o básquetbol.
          </p>
          <button
            onClick={() => setCurrentTab('explore')}
            className="text-black bg-[#c0ff00] hover:scale-105 transition-transform px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Explorar catálogo de canchas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between"
              id={`booking-item-${booking.id}`}
            >
              {/* Upper row */}
              <div className="flex bg-zinc-950/80 text-white p-5 gap-4 border-b border-white/5">
                <img
                  src={booking.courtImage}
                  alt={booking.courtName}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1">
                  <span className="text-[9px] uppercase tracking-widest bg-[#c0ff00]/20 text-[#c0ff00] border border-[#c0ff00]/20 px-2.5 py-1 rounded font-black font-mono">
                    {getSportLabel(booking.sport)}
                  </span>
                  <h3 className="text-base font-black font-headline text-white mt-2 line-clamp-1 uppercase whitespace-nowrap">{booking.courtName}</h3>
                  <p className="text-xs text-zinc-400 font-sans mt-1">Clave acceso: <span className="font-mono text-[#c0ff00] font-black">{booking.id}</span></p>
                </div>
              </div>

              {/* Lower info */}
              <div className="p-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Calendar className="h-4 w-4 text-[#c0ff00] shrink-0" />
                    <span>{booking.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-white font-bold">
                    <Clock className="h-4 w-4 text-[#c0ff00] shrink-0" />
                    <span>{booking.timeSlot} <span className="text-[10px] text-zinc-500 font-normal">(1.5 hr)</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#c0ff00]/80 shrink-0" />
                  <span>Titular: <strong className="text-white">{booking.userName}</strong> ({booking.userPhone})</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs">
                    <span className="text-zinc-500 mr-1 uppercase font-mono text-[9px] tracking-wider block">Pagado</span>
                    <span className="font-extrabold text-[#c0ff00] text-sm md:text-base">${booking.price} USD</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro que deseas cancelar esta reserva? Se reintegrará el importe según nuestros términos.')) {
                        onCancelBooking(booking.id);
                      }
                    }}
                    className="p-2 py-2.5 px-4 text-red-400 bg-red-950/20 hover:bg-red-900/30 hover:text-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black select-none active:scale-95 border border-red-900/30 uppercase tracking-widest"
                    title="Cancelar turno de juego"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial pasadas */}
      {pastBookings.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xs uppercase tracking-widest font-black text-zinc-500 mb-4 font-mono">
            Historial de Juego & Cancelaciones
          </h3>
          <div className="bg-zinc-950/50 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <div className="divide-y divide-white/5">
              {pastBookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap text-xs font-sans">
                  <div>
                    <div className="font-black text-white uppercase">{b.courtName}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{b.date} • {b.timeSlot}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-red-950/45 text-red-400 border border-red-900/40 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider font-mono">
                      CANCELADA
                    </span>
                    <span className="font-mono text-zinc-400 font-bold">${b.price} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
