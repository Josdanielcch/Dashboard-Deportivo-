import React, { useState, useEffect } from 'react';
import { Court, User, Booking } from '../types';
import { MOCK_TIME_SLOTS } from '../data';
import { 
  createCustomer, createBooking, checkAvailability,
  getExchangeRates, getPaymentMethods, ExchangeRate, PaymentMethodAccount
} from '../api';
import { 
  X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle, Flame, Mail, Phone, 
  User as UserIcon, Ticket, Sparkles, Smartphone, Landmark, DollarSign, Wallet
} from 'lucide-react';

interface BookingModalProps {
  court: Court;
  currentUser: User | null;
  selectedDate: string;
  onClose: () => void;
  onAddBooking: (booking: Booking) => void;
  onOpenAuth: () => void;
}

export default function BookingModal({
  court,
  currentUser,
  selectedDate,
  onClose,
  onAddBooking,
  onOpenAuth,
}: BookingModalProps) {
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [duration, setDuration] = useState<string>('1');
  
  // Contacts form state (used if no currentUser is logged in)
  const [guestFirstName, setGuestFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
  const [guestLastName, setGuestLastName] = useState(currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');

  // Payment & Multicurrency dynamic state
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentMethodAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | string>(1);
  const [paymentReference, setPaymentReference] = useState('');

  // Fallbacks de cuentas
  const fallbackAccounts: PaymentMethodAccount[] = [
    {
      id: 1,
      name: 'Pago Móvil Banco de Venezuela',
      type: 'pago_movil',
      currency_code: 'VES',
      bank_name: 'Banco de Venezuela (0102)',
      id_document: 'J-50123456-9',
      phone: '0412-3129425',
      instructions: 'Registrar los últimos dígitos del comprobante.'
    },
    {
      id: 2,
      name: 'Zelle Corporativo',
      type: 'zelle',
      currency_code: 'USD',
      account_holder: 'CourtConnect Sports LLC',
      email: 'pagos@courtconnect.com',
      instructions: 'Colocar tu nombre y número de reserva en la nota.'
    },
    {
      id: 3,
      name: 'Transferencia Bancolombia / Nequi',
      type: 'transfer_cop',
      currency_code: 'COP',
      bank_name: 'Bancolombia',
      account_number: 'Ahorros 123-456789-01',
      account_holder: 'CourtConnect Colombia SAS',
      id_document: 'NIT: 901.234.567-8',
      phone: '310-9876543',
      instructions: 'Transferencia directa o vía Nequi/PSE.'
    },
    {
      id: 4,
      name: 'Efectivo en Taquilla',
      type: 'cash',
      currency_code: 'USD',
      instructions: 'Cancela directamente en la recepción del complejo.'
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [ratesRes, accountsRes] = await Promise.all([
          getExchangeRates().catch(() => null),
          getPaymentMethods().catch(() => null),
        ]);
        if (ratesRes?.data && ratesRes.data.length > 0) {
          setExchangeRates(ratesRes.data);
        }
        if (accountsRes?.data && accountsRes.data.length > 0) {
          setPaymentAccounts(accountsRes.data);
          setSelectedAccountId(accountsRes.data[0].id);
        } else {
          setPaymentAccounts(fallbackAccounts);
          setSelectedAccountId(fallbackAccounts[0].id);
        }
      } catch (err) {
        setPaymentAccounts(fallbackAccounts);
        setSelectedAccountId(fallbackAccounts[0].id);
      }
    }
    loadData();
  }, []);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{ available: boolean; message: string } | null>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const hourlyRate = court.pricePerHour;
  const durationMultiplier = parseFloat(duration);
  const baseCost = Math.round(hourlyRate * durationMultiplier);
  
  const isPro = currentUser?.membershipLevel === 'pro';
  const discountRate = isPro ? 0.25 : 0;
  const discountAmount = Math.round(baseCost * discountRate);
  const totalCost = baseCost - discountAmount;

  const vesRateObj = exchangeRates.find(r => r.currency_code === 'VES');
  const copRateObj = exchangeRates.find(r => r.currency_code === 'COP');
  const vesRate = vesRateObj ? parseFloat(String(vesRateObj.rate_to_usd)) : 70.50;
  const copRate = copRateObj ? parseFloat(String(copRateObj.rate_to_usd)) : 4200.00;

  const activeAccounts = paymentAccounts.length > 0 ? paymentAccounts : fallbackAccounts;
  const selectedAccount = activeAccounts.find(a => a.id === selectedAccountId) || activeAccounts[0];

  const getAmountForAccount = (acc: PaymentMethodAccount) => {
    if (acc.currency_code === 'VES') {
      return (totalCost * vesRate).toFixed(2);
    }
    if (acc.currency_code === 'COP') {
      return Math.round(totalCost * copRate).toLocaleString('es-CO');
    }
    return totalCost.toString();
  };

  const getCurrencySymbol = (curr: string) => {
    if (curr === 'VES') return 'Bs.';
    if (curr === 'COP') return '$ COP';
    return 'USD';
  };

  const getEndTime = () => {
    const [h, m] = startTime.split(':').map(Number);
    const durationHours = parseFloat(duration);
    const totalMinutes = h * 60 + m + durationHours * 60;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
  };

  const formatAMPM = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${mStr} ${ampm}`;
  };

  const checkCurrentAvailability = async () => {
    setSlotAvailability(null);
    if (!court.backendId) {
      setSlotAvailability({ available: false, message: 'ID de cancha no disponible para la reserva.' });
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const end_time = getEndTime();
      const availability = await checkAvailability({
        court_id: court.backendId,
        booking_date: bookingDate,
        start_time: startTime + ':00',
        end_time,
      });
      setSlotAvailability({
        available: availability.available,
        message: availability.message,
      });
    } catch (error: any) {
      setSlotAvailability({
        available: false,
        message: error?.message || 'No se pudo verificar disponibilidad.',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  React.useEffect(() => {
    checkCurrentAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate, startTime, duration]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalName = currentUser ? currentUser.name : `${guestFirstName.trim()} ${guestLastName.trim()}`;
    const finalEmail = currentUser ? currentUser.email : guestEmail.trim();
    const finalPhone = currentUser ? currentUser.phone : guestPhone.trim();

    if (!startTime || !duration) {
      setFormError('Por favor, selecciona un horario disponible.');
      return;
    }

    if (!finalName || !finalEmail || !finalPhone) {
      setFormError('Por favor, completa todos los campos de contacto.');
      return;
    }

    const isDirectPayment = selectedAccount.type === 'cash' || selectedAccount.type === 'card';
    if (!isDirectPayment && !paymentReference.trim()) {
      setFormError(`Por favor ingresa el número de referencia del comprobante de ${selectedAccount.name}.`);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(finalEmail)) {
      setFormError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!court.backendId) {
      setFormError('No se puede reservar: falta el identificador de cancha en el backend.');
      return;
    }

    if (slotAvailability && slotAvailability.available === false) {
      setFormError(slotAvailability.message || 'Este horario ya está ocupado.');
      return;
    }

    setIsSubmitting(true);

    try {
      const start_time = startTime + ':00';
      const end_time = getEndTime();
      let customerId = currentUser?.customerId;

      if (!customerId) {
        // Crear cliente en el backend (registro de usuario para la reserva)
        const customerResponse = await createCustomer({
          first_name: currentUser ? currentUser.name.split(' ')[0] : guestFirstName.trim(),
          last_name: currentUser ? currentUser.name.split(' ').slice(1).join(' ') : guestLastName.trim(),
          email: finalEmail,
          phone: finalPhone,
        });

        customerId = customerResponse.data?.id;
        if (!customerId) {
          throw new Error('No se pudo obtener el id de cliente del backend.');
        }
      }

      const activeCurrency = selectedAccount?.currency_code || 'USD';
      const activeRate = activeCurrency === 'VES' ? vesRate : (activeCurrency === 'COP' ? copRate : 1.0);
      const calculatedAmount = activeCurrency === 'VES' 
        ? parseFloat((totalCost * vesRate).toFixed(2))
        : (activeCurrency === 'COP' ? Math.round(totalCost * copRate) : totalCost);

      const bookingResponse = await createBooking({
        customer_id: customerId,
        court_id: court.backendId,
        booking_date: bookingDate,
        start_time,
        end_time,
        payment_method: selectedAccount.type,
        payment_reference: paymentReference.trim() || undefined,
        total_amount: totalCost,
        currency_code: activeCurrency,
        exchange_rate: activeRate,
        amount_in_currency: calculatedAmount,
      });

      const bookingData = bookingResponse.data;
      const newBooking: Booking = {
        id: `BKG-${bookingData.id}`,
        courtId: court.id,
        courtName: court.name,
        courtImage: court.imageUrl,
        sport: court.sport,
        date: bookingDate,
        timeSlot: `${formatAMPM(start_time.slice(0, 5))} - ${formatAMPM(end_time.slice(0, 5))}`,
        price: bookingData.total_amount ?? totalCost,
        status: (bookingData.status || 'pending').toLowerCase() as any,
        userName: finalName,
        userEmail: finalEmail,
        userPhone: finalPhone,
        paymentMethod: selectedAccount.name,
        paymentReference: paymentReference.trim() || 'N/A',
        createdAt: new Date().toISOString(),
      };

      onAddBooking(newBooking);
      setCreatedBooking(newBooking);
      setIsSuccess(true);
    } catch (error: any) {
      setFormError(error?.message || 'Error al crear la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSportLabel = (sport: string) => {
    switch (sport) {
      case 'padel': return 'Pádel';
      case 'tenis': return 'Tenis';
      case 'futbol': return 'Fútbol';
      case 'basquet': return 'Básquet';
      default: return sport;
    }
  };

  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const totalMins = 8 * 60 + i * 30;
    const h = (Math.floor(totalMins / 60) % 24).toString().padStart(2, '0');
    const m = (totalMins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-white"
        id="booking-modal-container"
      >
        {/* Header bar */}
        <div className="bg-[#c0ff00] text-black px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-black text-black bg-black/10 px-2 py-0.5 rounded tracking-widest block w-fit mb-1 font-mono">
              CONTRATAR CANCHA
            </span>
            <h2 className="text-lg md:text-xl font-black font-headline tracking-tight uppercase">
              {court.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-black hover:bg-black/10 transition-colors cursor-pointer"
            id="close-modal-btn"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Success confirmation layout */}
        {isSuccess && createdBooking ? (
          <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-[#c0ff00] rounded-full flex items-center justify-center text-black mb-4 animate-bounce shadow-xl">
              <CheckCircle className="h-10 w-10 text-black fill-transparent" />
            </div>
            
            <h3 className="text-2xl font-black font-headline text-white uppercase tracking-tight italic">
              ¡RESERVA CONFIRMADA!
            </h3>
            
            <p className="text-sm text-zinc-400 mt-2 max-w-md">
              Tu turno de juego ha sido guardado con éxito. Hemos enviado los detalles y el código QR de acceso a tu buzón.
            </p>

            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-6 my-6 w-full max-w-md text-left space-y-3 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Código de Acceso:</span>
                <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">{createdBooking.id}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Cancha:</span>
                <span className="font-bold text-white text-right">{createdBooking.courtName}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Fecha:</span>
                <span className="font-bold text-white text-right">{createdBooking.date}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Horario:</span>
                <span className="font-bold text-[#c0ff00] text-right">{createdBooking.timeSlot} <span className="text-[10px] text-zinc-500">({duration} hr)</span></span>
              </div>

              <div className="flex justify-between text-xs border-t border-white/10 pt-3">
                <span className="text-zinc-500 font-semibold">Titular:</span>
                <span className="font-bold text-white">{createdBooking.userName}</span>
              </div>

              {createdBooking.paymentMethod && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Método de Pago:</span>
                  <span className="font-bold text-white uppercase text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded">
                    {createdBooking.paymentMethod === 'pago_movil' ? '📲 Pago Móvil' : createdBooking.paymentMethod === 'zelle' ? '💵 Zelle' : createdBooking.paymentMethod === 'card' ? '💳 Tarjeta' : '🏢 Taquilla'}
                    {createdBooking.paymentReference && createdBooking.paymentReference !== 'N/A' ? ` (Ref: ${createdBooking.paymentReference})` : ''}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-3">
                <span>Total a pagar:</span>
                <span className="text-[#c0ff00] font-black">${createdBooking.price} USD</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-[#c0ff00] text-black hover:scale-105 duration-200 font-black uppercase tracking-widest px-8 py-4.5 rounded-xl text-xs transition-all cursor-pointer w-full max-w-md"
            >
              Cerrar y ver mis canchas
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Split layout: Mini info and calendar Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-[#c0ff00] font-black uppercase tracking-wider font-mono">Superficie</span>
                  <div className="text-sm font-bold text-white mt-0.5">{getSportLabel(court.sport)} • {court.type}</div>
                  <p className="text-xs text-zinc-400 mt-1 font-sans">{court.club}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Costo regular:</span>
                  <span className="font-bold text-zinc-200">${court.pricePerHour} USD / hora</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 font-mono">
                  Modificar Fecha
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0ff00] h-4.5 w-4.5 pointer-events-none" />
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-sm font-bold text-white bg-zinc-950/30 outline-none focus:border-[#c0ff00] transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] flex items-center gap-1 font-mono">
                  <Clock className="h-4 w-4 text-[#c0ff00]" />
                  Horario de Reserva
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 mb-2 block font-mono">
                    Hora de Inicio
                  </label>
                  <select 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-white/10 text-xs font-bold text-white bg-zinc-950/30 outline-none focus:border-[#c0ff00] transition-all cursor-pointer"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time} className="bg-zinc-900">{formatAMPM(time)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 mb-2 block font-mono">
                    Duración
                  </label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-white/10 text-xs font-bold text-white bg-zinc-950/30 outline-none focus:border-[#c0ff00] transition-all cursor-pointer"
                  >
                    <option value="0.5" className="bg-zinc-900">30 Minutos</option>
                    <option value="1" className="bg-zinc-900">1 Hora</option>
                    <option value="1.5" className="bg-zinc-900">1.5 Horas</option>
                    <option value="2" className="bg-zinc-900">2 Horas</option>
                    <option value="2.5" className="bg-zinc-900">2.5 Horas</option>
                    <option value="3" className="bg-zinc-900">3 Horas</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-3 text-xs font-semibold">
                {isCheckingAvailability ? (
                  <span className="text-[#c0ff00]">Verificando disponibilidad...</span>
                ) : slotAvailability ? (
                  <span className={slotAvailability.available ? 'text-emerald-400' : 'text-red-400'}>
                    {slotAvailability.message}
                  </span>
                ) : null}
              </div>
            </div>

            {/* User Contact Info */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 flex items-center gap-1 font-mono">
                <UserIcon className="h-4 w-4 text-[#c0ff00]" />
                Información del Jugador Titular
              </h4>
              
              {currentUser ? (
                <div className="p-4 bg-[#c0ff00]/5 rounded-2xl border border-[#c0ff00]/25 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#c0ff00] text-black font-black flex items-center justify-center font-mono">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{currentUser.email} • {currentUser.phone}</div>
                    </div>
                  </div>
                  <span className="bg-[#c0ff00]/20 text-[#c0ff00] text-[10px] font-black px-2.5 py-1 rounded shadow-sm font-mono border border-[#c0ff00]/10">
                    LIGADO A CUENTA
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5 text-zinc-300 text-[11px] leading-relaxed flex items-center justify-between gap-4">
                    <span>
                      <strong>¿Tienes cuenta?</strong> Agenda más rápido sin llenar formularios y obtén 25% desc en membresía.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="bg-[#c0ff00] text-black px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider cursor-pointer font-mono hover:scale-105 transition-all"
                    >
                      Iniciar Sesión
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-12">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Nombres</label>
                        <input
                          type="text"
                          placeholder="John"
                          value={guestFirstName}
                          onChange={(e) => setGuestFirstName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950/30 text-white focus:border-[#c0ff00] outline-none font-semibold"
                          required={!currentUser}
                        />
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Apellidos</label>
                        <input
                          type="text"
                          placeholder="Doe"
                          value={guestLastName}
                          onChange={(e) => setGuestLastName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950/30 text-white focus:border-[#c0ff00] outline-none font-semibold"
                          required={!currentUser}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-12">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="ejemplo@correo.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950/30 text-white focus:border-[#c0ff00] outline-none font-semibold"
                          required={!currentUser}
                        />
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Teléfono de contacto</label>
                        <input
                          type="tel"
                          placeholder="+52 55 1234 5678"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950/30 text-white focus:border-[#c0ff00] outline-none font-semibold"
                          required={!currentUser}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selector Dinámico Multimoneda de Métodos de Pago */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] mb-3 flex items-center gap-1 font-mono">
                <CreditCard className="h-4 w-4 text-[#c0ff00]" />
                Método de Pago y Moneda
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {activeAccounts.map((acc) => {
                  const isSelected = selectedAccount?.id === acc.id;
                  const getIcon = () => {
                    if (acc.type === 'pago_movil') return '📲';
                    if (acc.type === 'zelle') return '💵';
                    if (acc.type === 'transfer_cop') return '🏦';
                    if (acc.type === 'card') return '💳';
                    return '🏢';
                  };

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-white font-bold ring-1 ring-[#c0ff00]'
                          : 'border-white/10 bg-zinc-950/40 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black truncate">{getIcon()} {acc.name}</div>
                      <div className="text-[9px] text-[#c0ff00] mt-0.5 font-mono font-bold flex items-center gap-1">
                        <span>{acc.currency_code}</span>
                        <span className="text-zinc-500 font-normal">
                          {acc.currency_code === 'VES' ? `(${vesRate} Bs/$)` : (acc.currency_code === 'COP' ? `(${copRate} $/$)` : '')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Caja de Datos Bancarios de la Cuenta Seleccionada */}
              {selectedAccount && (
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/10 space-y-3 font-sans">
                  <div className="text-xs space-y-1.5">
                    {selectedAccount.bank_name && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">Banco:</span>
                        <strong className="text-white">{selectedAccount.bank_name}</strong>
                      </div>
                    )}
                    {selectedAccount.account_holder && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">Titular:</span>
                        <strong className="text-white">{selectedAccount.account_holder}</strong>
                      </div>
                    )}
                    {selectedAccount.id_document && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">RIF / Cédula / NIT:</span>
                        <strong className="text-white font-mono">{selectedAccount.id_document}</strong>
                      </div>
                    )}
                    {selectedAccount.phone && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">Teléfono:</span>
                        <strong className="text-white font-mono">{selectedAccount.phone}</strong>
                      </div>
                    )}
                    {selectedAccount.email && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">Correo Electrónico:</span>
                        <strong className="text-white">{selectedAccount.email}</strong>
                      </div>
                    )}
                    {selectedAccount.account_number && (
                      <div className="flex justify-between text-zinc-300">
                        <span className="text-zinc-400">N° de Cuenta:</span>
                        <strong className="text-white font-mono">{selectedAccount.account_number}</strong>
                      </div>
                    )}
                    {selectedAccount.instructions && (
                      <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/5">
                        ℹ️ {selectedAccount.instructions}
                      </p>
                    )}

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-xs text-white">
                      <span>Monto Total a Cancelar ({selectedAccount.currency_code}):</span>
                      <span className="text-[#c0ff00] font-mono text-base font-black">
                        {getAmountForAccount(selectedAccount)} {getCurrencySymbol(selectedAccount.currency_code)}
                      </span>
                    </div>
                  </div>

                  {selectedAccount.type !== 'cash' && selectedAccount.type !== 'card' && (
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-1 block">
                        Número de Referencia / Comprobante (Requerido)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 849302 (últimos dígitos del comprobante)"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950 text-white focus:border-[#c0ff00] outline-none font-semibold font-mono"
                        required
                      />
                    </div>
                  )}

                  {selectedAccount.type === 'card' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-zinc-400">💳 Procesamiento inmediato con tarjeta ficticia de prueba.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="4242 •••• •••• 4242"
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950 text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="MM/AA  CVC"
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs bg-zinc-950 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {selectedAccount.type === 'cash' && (
                    <p className="text-xs text-zinc-300">
                      🏢 <strong>Pago en Taquilla:</strong> Realiza el pago directamente en recepción antes de iniciar el turno de cancha.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Calculations Card */}
            <div className="bg-zinc-950 text-white p-5 rounded-2xl relative overflow-hidden border border-white/10">
              <div className="absolute right-[-100px] bottom-[-100px] text-white/5 pointer-events-none">
                <CreditCard className="h-64 w-64" />
              </div>

              <div className="relative z-10 space-y-2.5 font-sans">
                <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] flex items-center gap-1 mb-1 font-mono">
                  <CreditCard className="h-4 w-4 text-[#c0ff00]" />
                  Resumen de Pago
                </h4>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Turno de cancha ({duration} hrs)</span>
                  <span className="font-semibold text-zinc-200">${baseCost} USD</span>
                </div>

                {isPro ? (
                  <div className="flex justify-between text-xs text-green-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sparkles className="h-3.5 w-3.5 fill-green-400" /> Descuento Membresía PRO (25% desc.)
                    </span>
                    <span>-${discountAmount} USD</span>
                  </div>
                ) : (
                  <div className="bg-[#c0ff00]/5 rounded-xl p-3 text-[10px] text-zinc-300 flex items-center justify-between gap-4 mt-1 border border-[#c0ff00]/15">
                    <span>
                      💡 <strong>Ahorra un 25%</strong> en este turno adquiriendo la membresía PRO de CourtConnect.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="text-[#c0ff00] font-black underline hover:text-[#c0ff00]/80 transition-colors cursor-pointer"
                    >
                      Saber Más
                    </button>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-white pt-2.5 border-t border-white/10">
                  <span className="uppercase tracking-wide text-xs text-zinc-500">Total a pagar:</span>
                  <span className="text-lg text-[#c0ff00] font-black tracking-normal">
                    ${totalCost} USD {paymentMethod === 'pago_movil' && <span className="text-xs text-zinc-400 font-mono">({totalCostBs} Bs)</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Error messaging */}
            {formError && (
              <p className="text-xs text-red-400 font-bold font-sans bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
                ⚠️ {formError}
              </p>
            )}

            {/* Booking action submit buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800/40 hover:text-white uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || isCheckingAvailability}
                className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#c0ff00]/5 ${
                  isSubmitting || isCheckingAvailability
                    ? 'bg-zinc-700 text-zinc-300 cursor-not-allowed border border-white/10'
                    : 'bg-[#c0ff00] text-black hover:scale-105 cursor-pointer'
                }`}
                id="modal-submit-booking"
              >
                {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
