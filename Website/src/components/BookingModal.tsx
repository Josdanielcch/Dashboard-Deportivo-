import React, { useState, useEffect } from 'react';
import { Court, User, Booking } from '../types';
import { MOCK_TIME_SLOTS } from '../data';
import { 
  createCustomer, createBooking, checkAvailability, getOccupiedSlots,
  getExchangeRates, getPaymentMethods, ExchangeRate, PaymentMethodAccount
} from '../api';
import { 
  X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle, Flame, Mail, Phone, 
  User as UserIcon, Ticket, Sparkles, Smartphone, Landmark, DollarSign, Wallet, Sun, Moon,
  ArrowRight, ArrowLeft, Edit3
} from 'lucide-react';
import { io } from 'socket.io-client';

interface BookingModalProps {
  court: Court;
  currentUser: User | null;
  selectedDate: string;
  onClose: () => void;
  onAddBooking: (booking: Booking) => void;
  onOpenAuth: () => void;
}

// Helper para obtener el primer bloque futuro disponible
const getInitialSlot = (dateStr: string) => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (dateStr === todayStr) {
    let nextMins = now.getHours() * 60 + now.getMinutes() + 30;
    nextMins = Math.ceil(nextMins / 30) * 30;
    const h = Math.floor(nextMins / 60);
    const m = nextMins % 60;
    if (h < 23) {
      const slotH = Math.max(8, h).toString().padStart(2, '0');
      const slotM = m.toString().padStart(2, '0');
      const period: 'AM' | 'PM' = parseInt(slotH, 10) >= 12 ? 'PM' : 'AM';
      return { time: `${slotH}:${slotM}`, period };
    }
  }
  return { time: '08:00', period: 'AM' as const };
};

export default function BookingModal({
  court,
  currentUser,
  selectedDate,
  onClose,
  onAddBooking,
  onOpenAuth,
}: BookingModalProps) {
  const initialConfig = getInitialSlot(selectedDate);
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState<string>(initialConfig.time);
  const [duration, setDuration] = useState<string>('1');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>(initialConfig.period);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Contacts form state (used if no currentUser is logged in)
  const [guestFirstName, setGuestFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
  const [guestLastName, setGuestLastName] = useState(currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');

  // Payment & Multicurrency dynamic state
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentMethodAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | string>(4);
  const [paymentReference, setPaymentReference] = useState('');

  // Fallbacks de cuentas (Taquilla predeterminado)
  const fallbackAccounts: PaymentMethodAccount[] = [
    {
      id: 4,
      name: 'Pago en Taquilla',
      type: 'cash',
      currency_code: 'USD',
      instructions: 'Paga directamente en la recepción del complejo al llegar (Efectivo, Tarjeta o Pago Móvil presencial).'
    },
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
          // Ordenar para que Pago en Taquilla / Efectivo aparezca de primero
          const sorted = [...accountsRes.data].sort((a, b) => {
            const isACash = a.type === 'cash' || a.name.toLowerCase().includes('taquilla') || a.name.toLowerCase().includes('efectivo');
            const isBCash = b.type === 'cash' || b.name.toLowerCase().includes('taquilla') || b.name.toLowerCase().includes('efectivo');
            if (isACash && !isBCash) return -1;
            if (!isACash && isBCash) return 1;
            return 0;
          });
          setPaymentAccounts(sorted);
          const cashAcc = sorted.find(a => 
            a.type === 'cash' || 
            a.name.toLowerCase().includes('taquilla') || 
            a.name.toLowerCase().includes('efectivo')
          );
          setSelectedAccountId(cashAcc ? cashAcc.id : sorted[0].id);
        } else {
          setPaymentAccounts(fallbackAccounts);
          setSelectedAccountId(4);
        }
      } catch (err) {
        setPaymentAccounts(fallbackAccounts);
        setSelectedAccountId(4);
      }
    }
    loadData();
  }, []);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{ available: boolean; message: string } | null>(null);
  
  // Lista de reservas activas / confirmadas en la cancha para la fecha seleccionada
  const [occupiedSlots, setOccupiedSlots] = useState<Array<{ id: number; start_time: string; end_time: string; status: string }>>([]);
  const [isLoadingOccupied, setIsLoadingOccupied] = useState<boolean>(false);

  useEffect(() => {
    if (!court.backendId || !bookingDate) return;
    let isCurrent = true;
    setIsLoadingOccupied(true);

    const fetchSlots = () => {
      getOccupiedSlots(court.backendId!, bookingDate)
        .then((res) => {
          if (isCurrent && res?.data) {
            setOccupiedSlots(res.data);
          }
        })
        .catch(() => {
          if (isCurrent) setOccupiedSlots([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoadingOccupied(false);
        });
    };

    fetchSlots();

    // Sincronización en tiempo real vía WebSockets:
    // Si un administrador o usuario aprueba/crea una reserva en esta cancha y fecha, se actualizan las horas ocupadas de inmediato
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    const handleScheduleUpdate = (data?: { court_id?: number | string; booking_date?: string }) => {
      if (
        !data || 
        !data.court_id || 
        (String(data.court_id) === String(court.backendId) && (!data.booking_date || data.booking_date.startsWith(bookingDate)))
      ) {
        fetchSlots();
      }
    };

    socket.on('court-schedule-updated', handleScheduleUpdate);
    socket.on('booking-status-changed', () => fetchSlots());

    return () => {
      isCurrent = false;
      socket.disconnect();
    };
  }, [court.backendId, bookingDate]);
  
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
    const endH = Math.floor(totalMinutes / 60) % 24;
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

  const validateStep1 = () => {
    setFormError('');
    const finalName = currentUser ? currentUser.name : `${guestFirstName.trim()} ${guestLastName.trim()}`;
    const finalEmail = currentUser ? currentUser.email : guestEmail.trim();
    const finalPhone = currentUser ? currentUser.phone : guestPhone.trim();

    if (!bookingDate) {
      setFormError('Por favor selecciona una fecha válida.');
      return false;
    }

    if (!startTime || !duration) {
      setFormError('Por favor selecciona un horario disponible.');
      return false;
    }

    if (!currentUser) {
      if (!guestFirstName.trim() || !guestLastName.trim()) {
        setFormError('Por favor completa tus nombres y apellidos.');
        return false;
      }
      if (!guestEmail.trim()) {
        setFormError('Por favor ingresa un correo electrónico de contacto.');
        return false;
      }
      if (!guestPhone.trim()) {
        setFormError('Por favor ingresa un número de teléfono de contacto.');
        return false;
      }
    }

    if (!finalName.trim() || !finalEmail.trim() || !finalPhone.trim()) {
      setFormError('Por favor completa todos los campos de contacto del titular.');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(finalEmail)) {
      setFormError('Por favor ingresa un correo electrónico válido.');
      return false;
    }

    if (!court.backendId) {
      setFormError('No se puede reservar: falta el identificador de cancha en el backend.');
      return false;
    }

    if (slotAvailability && slotAvailability.available === false) {
      setFormError(slotAvailability.message || 'Este horario ya está ocupado.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setFormError('');
      setCurrentStep(2);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    const finalName = currentUser ? currentUser.name : `${guestFirstName.trim()} ${guestLastName.trim()}`;
    const finalEmail = currentUser ? currentUser.email : guestEmail.trim();
    const finalPhone = currentUser ? currentUser.phone : guestPhone.trim();

    const isDirectPayment = selectedAccount.type === 'cash' || selectedAccount.type === 'card';
    if (!isDirectPayment && !paymentReference.trim()) {
      setFormError(`Por favor ingresa el número de referencia del comprobante de ${selectedAccount.name}.`);
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
        paymentMethod: selectedAccount.type as any,
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

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'padel': return '🎾';
      case 'tenis': return '🎾';
      case 'futbol': return '⚽';
      case 'basquet': return '🏀';
      default: return '🏆';
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

  const allTimeSlots = Array.from({ length: 31 }, (_, i) => {
    const totalMins = 8 * 60 + i * 30; // 08:00 a 23:00
    const h = (Math.floor(totalMins / 60) % 24).toString().padStart(2, '0');
    const m = (totalMins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = bookingDate === todayStr;
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  // Si hoy ya pasaron las 12:00 PM, los turnos AM quedan deshabilitados
  const isAmDisabled = isToday && currentTotalMins >= 12 * 60;

  // Determina si un horario entra en conflicto con una reserva aceptada/activa
  const isTimeSlotOccupied = (time: string, durHours: number = parseFloat(duration)) => {
    const [h, m] = time.split(':').map(Number);
    const slotStartMins = h * 60 + m;
    const slotEndMins = slotStartMins + Math.round(durHours * 60);

    return occupiedSlots.some(occ => {
      const [occStartH, occStartM] = occ.start_time.slice(0, 5).split(':').map(Number);
      const [occEndH, occEndM] = occ.end_time.slice(0, 5).split(':').map(Number);
      const occStartMins = occStartH * 60 + occStartM;
      const occEndMins = occEndH * 60 + occEndM;

      // Solapamiento: el inicio del turno es menor que el fin de la reserva y el fin es mayor que el inicio
      return slotStartMins < occEndMins && slotEndMins > occStartMins;
    });
  };

  const filteredTimeSlots = allTimeSlots.filter(time => {
    const [h, m] = time.split(':').map(Number);
    const matches = timePeriod === 'AM' ? h < 12 : h >= 12;
    if (!matches) return false;
    if (isToday && h * 60 + m <= currentTotalMins) return false;
    // Excluir horas que ya tienen reservas aceptadas/confirmadas
    if (isTimeSlotOccupied(time, parseFloat(duration))) return false;
    return true;
  });

  const getNextAvailableSlotInPeriod = (period: 'AM' | 'PM', targetDate: string) => {
    const isTargetToday = targetDate === todayStr;
    const candidates = allTimeSlots.filter(t => {
      const [h, m] = t.split(':').map(Number);
      const matches = period === 'AM' ? h < 12 : h >= 12;
      if (!matches) return false;
      if (isTargetToday && h * 60 + m <= currentTotalMins) return false;
      if (isTimeSlotOccupied(t, parseFloat(duration))) return false;
      return true;
    });

    if (candidates.length > 0) return candidates[0];
    return period === 'AM' ? '08:00' : '14:00';
  };

  // Mantener sincronizado startTime y evitar horas pasadas
  React.useEffect(() => {
    if (isToday && isAmDisabled && timePeriod === 'AM') {
      setTimePeriod('PM');
      return;
    }
    if (filteredTimeSlots.length > 0 && !filteredTimeSlots.includes(startTime)) {
      setStartTime(filteredTimeSlots[0]);
    }
  }, [bookingDate, isToday, isAmDisabled, timePeriod, filteredTimeSlots, startTime]);

  const handlePeriodChange = (period: 'AM' | 'PM') => {
    if (period === 'AM' && isAmDisabled) return;
    setTimePeriod(period);
    const [h] = startTime.split(':').map(Number);
    const currentPeriod = h >= 12 ? 'PM' : 'AM';
    if (period !== currentPeriod) {
      const nextSlot = getNextAvailableSlotInPeriod(period, bookingDate);
      setStartTime(nextSlot);
    }
  };

  const handleDateChange = (newDate: string) => {
    setBookingDate(newDate);
    const isNewToday = newDate === todayStr;
    if (isNewToday) {
      const config = getInitialSlot(newDate);
      setStartTime(config.time);
      setTimePeriod(config.period);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 12 && timePeriod !== 'PM') {
      setTimePeriod('PM');
    } else if (hour < 12 && timePeriod !== 'AM') {
      setTimePeriod('AM');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-white"
        id="booking-modal-container"
      >
        {/* Header bar */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 transition-colors ${
          isSuccess ? 'bg-zinc-950 border-b border-white/10 text-white' : 'bg-[#c0ff00] text-black'
        }`}>
          <div>
            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest block w-fit mb-1 font-mono ${
              isSuccess ? 'bg-[#c0ff00]/15 text-[#c0ff00]' : 'text-black bg-black/10'
            }`}>
              {isSuccess ? 'COMPROBANTE DE RESERVA' : 'CONTRATAR CANCHA'}
            </span>
            <h2 className="text-lg md:text-xl font-black font-headline tracking-tight uppercase">
              {court.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isSuccess ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
            }`}
            id="close-modal-btn"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Stepper Tabs */}
        {!isSuccess && (
          <div className="bg-zinc-950/80 border-b border-white/10 px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 md:gap-4 w-full max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setCurrentStep(1);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentStep === 1
                    ? 'bg-[#c0ff00] text-black shadow-md font-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 1 ? 'bg-black text-[#c0ff00]' : 'bg-white/10 text-white'
                }`}>
                  1
                </span>
                <span className="truncate">Turno y Datos</span>
              </button>

              <div className="h-0.5 w-6 bg-white/10 shrink-0" />

              <button
                type="button"
                onClick={handleNextStep}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentStep === 2
                    ? 'bg-[#c0ff00] text-black shadow-md font-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 2 ? 'bg-black text-[#c0ff00]' : 'bg-white/10 text-white'
                }`}>
                  2
                </span>
                <span className="truncate">Pago y Confirmación</span>
              </button>
            </div>
          </div>
        )}

        {/* Success confirmation layout */}
        {isSuccess && createdBooking ? (
          <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-[#c0ff00] rounded-full flex items-center justify-center text-black mb-3.5 shadow-xl shrink-0 mt-2">
              <CheckCircle className="h-10 w-10 text-black fill-[#c0ff00]" />
            </div>
            
            <h3 className="text-xl md:text-2xl font-black font-headline text-white uppercase tracking-tight italic">
              ¡RESERVA CONFIRMADA!
            </h3>
            
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
              Tu turno de juego ha sido guardado con éxito. Hemos enviado los detalles y el código de acceso a tu buzón.
            </p>

            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 my-4 w-full max-w-md text-left space-y-2.5 font-sans">
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

              <div className="flex justify-between text-xs border-t border-white/10 pt-2.5">
                <span className="text-zinc-500 font-semibold">Titular:</span>
                <span className="font-bold text-white">{createdBooking.userName}</span>
              </div>

              {createdBooking.paymentMethod && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Método de Pago:</span>
                  <span className="font-bold text-white uppercase text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded">
                    {createdBooking.paymentMethod === 'pago_movil' ? '📲 Pago Móvil' : createdBooking.paymentMethod === 'zelle' ? '💵 Zelle' : createdBooking.paymentMethod === 'transfer_cop' ? '🏦 Bancolombia / Nequi' : createdBooking.paymentMethod === 'card' ? '💳 Tarjeta' : '🏢 Taquilla'}
                    {createdBooking.paymentReference && createdBooking.paymentReference !== 'N/A' ? ` (Ref: ${createdBooking.paymentReference})` : ''}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-2.5">
                <span>Total a pagar:</span>
                <span className="text-[#c0ff00] font-black">${createdBooking.price} USD</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-[#c0ff00] text-black hover:scale-[1.02] duration-200 font-black uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs transition-all cursor-pointer w-full max-w-md shrink-0 mb-2"
            >
              Cerrar y ver mis canchas
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
            
            {/* SECCIÓN 1: CARACTERÍSTICAS DE LA RESERVA Y DATOS */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Franja compacta con info de la cancha */}
                <div className="bg-zinc-950/60 p-3 sm:p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {getSportIcon(court.sport)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {getSportLabel(court.sport)} • {court.type}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#c0ff00]/15 text-[#c0ff00] px-2 py-0.5 rounded font-mono">
                          {court.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{court.club}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider block">Tarifa</span>
                    <span className="text-xs sm:text-sm font-black text-[#c0ff00] font-mono">
                      ${court.pricePerHour} USD<span className="text-[10px] text-zinc-400 font-normal">/h</span>
                    </span>
                  </div>
                </div>

                {/* Tarjeta Unificada: Fecha y Horario */}
                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] flex items-center gap-1.5 font-mono">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#c0ff00]" />
                      Fecha y Horario de Juego
                    </h4>
                    {isToday && (
                      <span className="text-[9px] font-mono text-[#c0ff00] bg-[#c0ff00]/10 px-2 py-0.5 rounded border border-[#c0ff00]/20 font-bold">
                        Hoy
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Fila 1 Col 1: Fecha */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 block font-mono mb-1.5">
                        Fecha de Reserva
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0ff00] h-4 w-4 pointer-events-none" />
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-white bg-zinc-900/60 outline-none focus:border-[#c0ff00] transition-all cursor-pointer h-10"
                        />
                      </div>
                    </div>

                    {/* Fila 1 Col 2: Turno AM / PM */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 block font-mono">
                          Turno de Juego
                        </label>
                        <span className="text-[9px] text-zinc-400 font-mono">
                          {filteredTimeSlots.length} horarios
                        </span>
                      </div>
                      <div className="grid grid-cols-2 bg-zinc-900/60 p-1 rounded-xl border border-white/10 gap-1 h-10">
                        <button
                          type="button"
                          disabled={isAmDisabled}
                          onClick={() => handlePeriodChange('AM')}
                          className={`rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 font-mono ${
                            isAmDisabled
                              ? 'opacity-30 cursor-not-allowed text-zinc-500'
                              : timePeriod === 'AM'
                                ? 'bg-[#c0ff00] text-black font-black shadow-md cursor-pointer'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer'
                          }`}
                          title={isAmDisabled ? 'Los horarios AM de hoy ya finalizaron' : ''}
                        >
                          <Sun className="h-3.5 w-3.5 shrink-0" />
                          <span>AM {isAmDisabled ? <span className="text-[9px]">(Fin)</span> : <span className="text-[9px] opacity-75">(Mañana)</span>}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePeriodChange('PM')}
                          className={`rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 font-mono cursor-pointer ${
                            timePeriod === 'PM'
                              ? 'bg-[#c0ff00] text-black font-black shadow-md'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Moon className="h-3.5 w-3.5 shrink-0" />
                          <span>PM <span className="text-[9px] opacity-75">(Tarde)</span></span>
                        </button>
                      </div>
                    </div>

                    {/* Fila 2 Col 1: Hora de Inicio */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 block font-mono">
                          Hora de Inicio
                        </label>
                        <span className="text-[9px] text-[#c0ff00] font-mono font-bold">
                          {filteredTimeSlots.length} disponibles
                        </span>
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0ff00] h-4 w-4 pointer-events-none" />
                        <select 
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-white bg-zinc-900/60 outline-none focus:border-[#c0ff00] transition-all cursor-pointer h-10"
                        >
                          {filteredTimeSlots.length === 0 ? (
                            <option value="" disabled className="bg-zinc-900">Sin horarios disponibles en este turno</option>
                          ) : (
                            filteredTimeSlots.map(time => (
                              <option key={time} value={time} className="bg-zinc-900">{formatAMPM(time)}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Fila 2 Col 2: Duración */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 block font-mono">
                          Duración
                        </label>
                        <span className="text-[9px] text-[#c0ff00] font-mono font-bold">
                          Hasta {formatAMPM(getEndTime().slice(0, 5))}
                        </span>
                      </div>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-white bg-zinc-900/60 outline-none focus:border-[#c0ff00] transition-all cursor-pointer h-10"
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

                  {/* Horarios ya reservados / ocupados */}
                  {occupiedSlots.length > 0 && (
                    <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        🔒 Horarios con reserva activa hoy (excluidos de la lista):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {occupiedSlots.map((occ) => (
                          <span
                            key={occ.id}
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/30"
                          >
                            {formatAMPM(occ.start_time.slice(0, 5))} - {formatAMPM(occ.end_time.slice(0, 5))}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback inline de disponibilidad */}
                  <div className="pt-0.5">
                    {isCheckingAvailability ? (
                      <div className="flex items-center gap-2 text-xs text-[#c0ff00] font-mono bg-[#c0ff00]/10 px-3 py-2 rounded-xl border border-[#c0ff00]/20">
                        <div className="w-3 h-3 rounded-full border-2 border-[#c0ff00] border-t-transparent animate-spin" />
                        <span>Verificando disponibilidad de la cancha...</span>
                      </div>
                    ) : slotAvailability ? (
                      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border ${
                        slotAvailability.available
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                          : 'bg-red-950/30 border-red-800/40 text-red-400'
                      }`}>
                        <span>{slotAvailability.available ? '✓' : '⚠️'}</span>
                        <span>{slotAvailability.message}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Información del Jugador Titular */}
                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[#c0ff00] flex items-center gap-1.5 font-mono">
                      <UserIcon className="h-3.5 w-3.5 text-[#c0ff00]" />
                      Datos del Titular
                    </h4>
                    {!currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAuth();
                        }}
                        className="text-[10px] text-[#c0ff00] hover:underline font-mono font-bold cursor-pointer"
                      >
                        ¿Tienes cuenta? Ingresar (25% off)
                      </button>
                    )}
                  </div>

                  {currentUser ? (
                    <div className="p-3 bg-[#c0ff00]/5 rounded-xl border border-[#c0ff00]/25 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#c0ff00] text-black font-black flex items-center justify-center font-mono text-xs">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">{currentUser.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{currentUser.email} • {currentUser.phone}</div>
                        </div>
                      </div>
                      <span className="bg-[#c0ff00]/20 text-[#c0ff00] text-[9px] font-black px-2 py-0.5 rounded font-mono border border-[#c0ff00]/20">
                        LIGADO A CUENTA
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Nombres</label>
                        <input
                          type="text"
                          placeholder="Ej. Carlos"
                          value={guestFirstName}
                          onChange={(e) => setGuestFirstName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs bg-zinc-900/60 text-white focus:border-[#c0ff00] outline-none font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Apellidos</label>
                        <input
                          type="text"
                          placeholder="Ej. Mendoza"
                          value={guestLastName}
                          onChange={(e) => setGuestLastName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs bg-zinc-900/60 text-white focus:border-[#c0ff00] outline-none font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs bg-zinc-900/60 text-white focus:border-[#c0ff00] outline-none font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Teléfono</label>
                        <input
                          type="tel"
                          placeholder="+58 412 1234567"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 text-xs bg-zinc-900/60 text-white focus:border-[#c0ff00] outline-none font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error de Paso 1 */}
                {formError && (
                  <p className="text-xs text-red-400 font-bold font-sans bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
                    ⚠️ {formError}
                  </p>
                )}

                {/* Botones de acción Paso 1 */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800/40 hover:text-white uppercase tracking-wider transition-all cursor-pointer font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={slotAvailability?.available === false || isCheckingAvailability}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 font-mono ${
                      slotAvailability?.available === false || isCheckingAvailability
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-[#c0ff00] text-black hover:scale-[1.02] shadow-[#c0ff00]/10 cursor-pointer'
                    }`}
                  >
                    <span>Continuar al Pago</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SECCIÓN 2: MÉTODOS DE PAGO Y CONFIRMACIÓN */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* Resumen compacto del turno reservado */}
                <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#c0ff00]/15 text-[#c0ff00] px-2 py-0.5 rounded font-mono">
                        {court.name}
                      </span>
                      <span className="text-xs text-zinc-400 font-sans">
                        {court.club}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <CalendarIcon className="h-3.5 w-3.5 text-[#c0ff00]" /> {bookingDate}
                      </span>
                      <span className="text-zinc-600 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 text-[#c0ff00]">
                        <Clock className="h-3.5 w-3.5" /> {formatAMPM(startTime)} - {formatAMPM(getEndTime().slice(0, 5))}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">({duration} hr)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormError('');
                      setCurrentStep(1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-[#c0ff00] hover:bg-[#c0ff00]/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0 font-mono w-fit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Modificar Turno</span>
                  </button>
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
                        ${totalCost} USD
                        {selectedAccount?.type === 'pago_movil' && (
                          <span className="text-xs text-zinc-400 font-mono ml-1.5">
                            ({(totalCost * vesRate).toFixed(2)} Bs)
                          </span>
                        )}
                        {selectedAccount?.type === 'transfer_cop' && (
                          <span className="text-xs text-zinc-400 font-mono ml-1.5">
                            ({Math.round(totalCost * copRate).toLocaleString('es-CO')} COP)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error de Paso 2 */}
                {formError && (
                  <p className="text-xs text-red-400 font-bold font-sans bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
                    ⚠️ {formError}
                  </p>
                )}

                {/* Botones de acción Paso 2 */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError('');
                      setCurrentStep(1);
                    }}
                    className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800/40 hover:text-white uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver a Detalles</span>
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
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
