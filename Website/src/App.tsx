import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FeaturedSports from './components/FeaturedSports';
import Filters from './components/Filters';
import CourtCard from './components/CourtCard';
import BookingModal from './components/BookingModal';
import AuthPage from './components/AuthPage';
import MyBookings from './components/MyBookings';
import HowItWorks from './components/HowItWorks';
import AboutUs from './components/AboutUs';

import { INITIAL_COURTS, ADS_IMAGE_PRO_TIP } from './data';
import { Court, Booking, User, SportType } from './types';
import { Search, MapPin, Calendar, Award, ChevronLeft, ChevronRight, Trophy, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home'); // 'home' | 'explore' | 'how-it-works' | 'about-us' | 'my-bookings' | 'auth'
  
  // User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Active Bookings database stored locally
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Filtering States in Explorar view
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination State for catalog
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Active Overlays
  const [selectedCourtForBooking, setSelectedCourtForBooking] = useState<Court | null>(null);

  // Load persistence configurations from localStorage on mount
  useEffect(() => {
    // 1. User Session
    const savedSession = localStorage.getItem('courtconnect_user_session');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (err) {
        console.error('Failed to parse user session', err);
      }
    }

    // 2. Check for recovery token
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setCurrentTab('auth');
    }
  }, []);

  // Sync bookings from backend if logged in, otherwise from localStorage
  useEffect(() => {
    const fetchBookings = async () => {
      if (currentUser?.customerId) {
        try {
          const { getCustomerBookings } = await import('./api');
          const response = await getCustomerBookings(currentUser.customerId);
          if (response && response.success && Array.isArray(response.data)) {
            const backendBookings: Booking[] = response.data.map((b: any) => {
              const courtDetail = INITIAL_COURTS.find((c) => c.backendId === b.court_id);
              const cleanStart = b.start_time ? b.start_time.split(':').slice(0, 2).join(':') : '';
              const cleanEnd = b.end_time ? b.end_time.split(':').slice(0, 2).join(':') : '';
              const cleanDate = b.booking_date ? b.booking_date.split('T')[0] : '';
              
              return {
                id: `BKG-${b.id}`,
                courtId: courtDetail?.id || `court-${b.court_id}`,
                courtName: b.court_name || courtDetail?.name || 'Cancha',
                courtImage: courtDetail?.imageUrl || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258',
                sport: (courtDetail?.sport || 'padel') as SportType,
                date: cleanDate,
                timeSlot: `${cleanStart} - ${cleanEnd}`,
                price: parseFloat(b.total_amount || '30'),
                status: b.status === 'Cancelled' || b.status === 'No_show' ? 'cancelled' : 'confirmed',
                userName: currentUser.name,
                userEmail: currentUser.email,
                userPhone: currentUser.phone,
                createdAt: new Date().toISOString()
              };
            });
            setBookings(backendBookings);
            return;
          }
        } catch (error) {
          console.error('Error fetching bookings from backend:', error);
        }
      }
      
      // Fallback to localStorage
      const savedBookings = localStorage.getItem('courtconnect_bookings');
      if (savedBookings) {
        try {
          setBookings(JSON.parse(savedBookings));
        } catch (err) {
          console.error('Failed to parse bookings', err);
        }
      } else {
        const defaultBookings: Booking[] = [
          {
            id: 'CC-A899E2',
            courtId: 'court-1',
            courtName: 'Cancha Central Padel 1',
            courtImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrK7kD9iB7twRwcrmMZeAd-AaejnMF-N5b18ei_MNi77qds9xXqzQu8Y07WfPMAg69oQz6WUHjEIWRolvq34BGGwZKtAjF1tnFAwTBR_mLa9OvGhwmAMJpYA-XHoZ_7ikUbuaVI6fTj1OUwTUMDaOoZ0Cl4BvO_08oXYSSoeRnflr47QDl1EKeXk3njkjQWj70rcMdhzbZyRbksyLrwML9fCW00AklWNpk6Kx0tkA3UkT2ei9FEmOTZ09Yvc51OFAPqBFnYTD8O2g',
            sport: 'padel',
            date: '2026-05-28',
            timeSlot: '17:30 - 19:00',
            price: 338,
            status: 'confirmed',
            userName: 'Josedaniel',
            userEmail: 'josdanielcch@gmail.com',
            userPhone: '+52 55 9876 5432',
            createdAt: new Date().toISOString()
          },
          {
            id: 'CC-B110B2',
            courtId: 'court-3',
            courtName: 'Estadio Urbano Sky',
            courtImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB94KbkV0VHtWs83FMAxH31xsdN-r6945eD6mEXUX_pq4vv9ZOc3Ca_SqU93EEoXnCDJJwsdKg_j9Yy7LevuebLGgLiaVqVkysZYgoLH9QZOwnbWEp5CQWPs3LtgBMLcPjsGmgpVqLHL6L14Ce-n4yQi7jhPYrAJNLv8_A4nkvVUR8E3fZoYEOTNMS5ugsPC3_FjPBG6ycZ_k0pfWexLDEt_Te-zx_JyqpZ3ohRvJ2V69V0YW-f68kZB4aYXqW0CMtw1qS69fDrCAs',
            sport: 'futbol',
            date: '2026-05-30',
            timeSlot: '19:00 - 20:30',
            price: 675,
            status: 'confirmed',
            userName: 'Josedaniel',
            userEmail: 'josdanielcch@gmail.com',
            userPhone: '+52 55 9876 5432',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setBookings(defaultBookings);
        localStorage.setItem('courtconnect_bookings', JSON.stringify(defaultBookings));
      }
    };
    fetchBookings();
  }, [currentUser]);

  // Update localStorage when bookings are modified
  const updateLocalStorageBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('courtconnect_bookings', JSON.stringify(updatedBookings));
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('courtconnect_user_session');
    localStorage.removeItem('courtconnect_token');
    setCurrentUser(null);
    setCurrentTab('home');
  };

  // Login/Register handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (selectedCourtForBooking) {
      setCurrentTab('explore');
    } else {
      setCurrentTab('my-bookings');
    }
  };

  // Cancel reservation
  const handleCancelBooking = async (bookingId: string) => {
    const isBackend = bookingId.startsWith('BKG-');
    if (isBackend) {
      try {
        const numericId = parseInt(bookingId.replace('BKG-', ''), 10);
        const { updateBookingStatus } = await import('./api');
        await updateBookingStatus(numericId, 'Cancelled');
      } catch (err) {
        console.error('Failed to cancel booking on backend', err);
      }
    }

    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });
    updateLocalStorageBookings(updated);
  };

  // Add new reservation
  const handleAddBooking = (newBooking: Booking) => {
    const updated = [newBooking, ...bookings];
    updateLocalStorageBookings(updated);
  };

  // Sidebar Filter Helpers
  const handleSportToggle = (sport: SportType) => {
    setSelectedSports((prev) => {
      const idx = prev.indexOf(sport);
      if (idx > -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      } else {
        return [...prev, sport];
      }
    });
    setCurrentPage(1); // Reset page on filter change
  };

  const handlePeriodToggle = (period: string) => {
    setSelectedPeriods((prev) => {
      const idx = prev.indexOf(period);
      if (idx > -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      } else {
        return [...prev, period];
      }
    });
    setCurrentPage(1); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setSelectedSports([]);
    setSelectedPeriods([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleQuickSportSelect = (sport: SportType) => {
    setSelectedSports([sport]);
    setCurrentTab('explore');
    setCurrentPage(1);
  };

  // Master Filter Routine for Court Listings
  const filteredCourts = INITIAL_COURTS.filter((court) => {
    // 1. Sport check
    if (selectedSports.length > 0 && !selectedSports.includes(court.sport)) {
      return false;
    }

    // 2. Text Search check
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchName = court.name.toLowerCase().includes(query);
      const matchClub = court.club.toLowerCase().includes(query);
      const matchCity = court.city.toLowerCase().includes(query);
      const matchAddress = court.address.toLowerCase().includes(query);
      const matchType = court.type.toLowerCase().includes(query);
      if (!matchName && !matchClub && !matchCity && !matchAddress && !matchType) {
        return false;
      }
    }

    // 3. Period select check simulation
    // In our model, we map periods of day Mañana/Tarde/Noche. Since any court represents multiple slots, we support any query
    return true;
  });

  // Pagination bounds calculated
  const totalCourts = filteredCourts.length;
  const totalPages = Math.ceil(totalCourts / pageSize) || 1;
  const paginatedCourts = filteredCourts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-between text-[#f4f4f5] font-sans relative overflow-x-hidden">
      
      {/* Background radial atmosphere glow highlights (Immersive UI aspect) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-[#c0ff00] opacity-[0.08] blur-[130px] rounded-full"></div>
        <div className="absolute top-[35%] left-[-15%] w-[500px] h-[500px] bg-blue-600 opacity-[0.06] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[#c0ff00] opacity-[0.05] blur-[120px] rounded-full"></div>
      </div>

      {/* Dynamic Navigation Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setCurrentTab('auth')}
      />

      {/* Main Container Wrapper */}
      <main className="max-w-[1440px] mx-auto w-full px-4 md:px-10 py-8 flex-1 relative z-10">
        
        {/* VIEW: HOME / LANDING VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-12 animate-fade-in duration-300">
            {/* Athletic Hero */}
            <Hero
              onExploreClick={() => setCurrentTab('explore')}
              onHowItWorksClick={() => setCurrentTab('how-it-works')}
              onQuickSearch={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
            />

            {/* DOMINA CADA TERRENO: Sports grid */}
            <FeaturedSports onSportSelect={handleQuickSportSelect} />

            {/* Teaser interactive PRO membership card (Matches Image 1 layout) w/ Immersive style */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 bg-zinc-950/40 backdrop-blur-md shadow-2xl">
              <div className="absolute right-[-60px] top-[-60px] opacity-[0.05] pointer-events-none rotate-12 text-[#c0ff00]">
                <Trophy className="h-96 w-96" />
              </div>
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[150px] bg-[#c0ff00]/10 blur-[80px] pointer-events-none rounded-full"></div>

              <div className="space-y-4 max-w-xl relative z-10">
                <span className="text-[10px] uppercase tracking-widest font-black bg-[#c0ff00]/20 text-[#c0ff00] px-3 py-1 rounded inline-block shadow-sm ring-1 ring-[#c0ff00]/30 font-mono">
                  Beneficio de Membresía PRO
                </span>
                <h3 className="text-2xl md:text-4xl font-black uppercase font-headline tracking-tight leading-none text-white">
                  Ahorra hasta un <span className="text-[#c0ff00]">25%</span> en cada reservación
                </h3>
                <p className="text-sm text-zinc-400">
                  Únete a nuestro club premium y agenda con acceso prioritario nocturno. Descarga reportes y QR en segundos.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('auth')}
                className="bg-[#c0ff00] text-black hover:scale-105 active:scale-95 font-sans font-black uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-lg shadow-[#c0ff00]/10 hover:shadow-[#c0ff00]/20 transition-all cursor-pointer relative z-10 font-bold"
              >
                Descubrir Más
              </button>
            </div>
          </div>
        )}

        {/* VIEW: EXPLORE COURTS (Sidebar filters + main result grid) */}
        {currentTab === 'explore' && (
          <div className="space-y-8 animate-fade-in duration-300" id="explore-view-tab">
            
            {/* Top Search Banner and dynamic available statistics */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
              <div className="flex-1 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-headline tracking-tight">
                  Explorar Canchas
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Encuentra canchas premium cerca de ti y aparta tus horarios de juego.</p>
                
                {/* Search Bar Input */}
                <div className="relative mt-4 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500 group-focus-within:text-[#c0ff00] transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar por club, ciudad o tipo de cancha..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-[#c0ff00] focus:ring-1 focus:ring-[#c0ff00] outline-none transition-all text-sm font-semibold text-white bg-zinc-900/40 backdrop-blur-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-end gap-1.5 font-sans">
                  <span className="h-2 w-2 rounded-full bg-[#c0ff00] inline-block animate-ping" />
                  {totalCourts} canchas filtradas disponibles
                </p>
              </div>
            </div>

            {/* Layout Split: Sidebar filters + Grid view */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Dynamic sidebar filters */}
              <Filters
                selectedSports={selectedSports}
                onSportToggle={handleSportToggle}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedPeriods={selectedPeriods}
                onPeriodToggle={handlePeriodToggle}
                onClearFilters={handleClearFilters}
                courtsCount={totalCourts}
              />

              {/* Main Catalog View */}
              <div className="flex-1 space-y-8">
                {totalCourts === 0 ? (
                  <div className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/10 space-y-4 shadow-sm max-w-lg mx-auto mt-6">
                    <p className="text-zinc-400 font-sans text-sm">
                      No encontramos canchas que coincidan con tu búsqueda actual. Intenta remover filtros o usar palabras clave diferentes.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-[#c0ff00] text-black hover:bg-[#c0ff00]/90 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all font-bold"
                    >
                      Restablecer Filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedCourts.map((court) => (
                        <CourtCard
                          key={court.id}
                          court={court}
                          onSelectCourt={(c) => setSelectedCourtForBooking(c)}
                        />
                      ))}

                      {/* Static PRO membership ad box inside catalog (Matches Image 1 card slot 6) */}
                      <div className="rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group h-full border border-white/10 bg-zinc-900/60 backdrop-blur-sm">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.06] font-headline font-black rotate-12 text-[100px] pointer-events-none text-[#c0ff00]">
                          PRO
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-[#c0ff00]/10 blur-[50px] pointer-events-none rounded-full"></div>
                        <div className="relative z-10">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-[#c0ff00]/20 text-[#c0ff00] px-2 py-1 rounded inline-block mb-4 shadow border border-[#c0ff00]/20">
                            Membresía Pro
                          </span>
                          <h3 className="text-lg md:text-xl font-black font-headline leading-tight uppercase text-white">
                            Ahorra hasta un <span className="text-[#c0ff00]">25%</span> en cada reservación
                          </h3>
                          <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                            Únete a nuestra comunidad elite y obtén acceso prioritario nocturno y reservas ilimitadas.
                          </p>
                        </div>
                        <button
                          onClick={() => setCurrentTab('auth')}
                          className="bg-[#c0ff00] text-black text-xs font-black uppercase tracking-wider py-3 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow w-fit mt-6 cursor-pointer relative z-10 font-bold"
                        >
                          Descubrir Más
                        </button>
                      </div>
                    </div>

                    {/* Pagination control (Matches image 1 control numbers) */}
                    {totalPages > 1 && (
                      <div className="pt-6 flex items-center justify-center gap-2 border-t border-white/10">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:border-[#c0ff00] hover:text-[#c0ff00] disabled:opacity-40 transition-all bg-zinc-900/20"
                          title="Anterior"
                        >
                          <ChevronLeft className="h-4.5 w-4.5" />
                        </button>

                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pagNum = idx + 1;
                          const isCurrent = currentPage === pagNum;
                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(pagNum)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${
                                isCurrent
                                  ? 'bg-[#c0ff00] text-black shadow-md shadow-[#c0ff00]/10'
                                  : 'border border-white/10 text-zinc-400 hover:border-[#c0ff00] hover:text-[#c0ff00] bg-zinc-900/20'
                              }`}
                            >
                              {pagNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:border-[#c0ff00] hover:text-[#c0ff00] disabled:opacity-40 transition-all bg-zinc-900/20"
                          title="Siguiente"
                        >
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HOW IT WORKS */}
        {currentTab === 'how-it-works' && (
          <HowItWorks
            onExploreClick={() => setCurrentTab('explore')}
            onRegisterClick={() => setCurrentTab('auth')}
          />
        )}

        {/* VIEW: ABOUT US */}
        {currentTab === 'about-us' && <AboutUs />}

        {/* VIEW: MY BOOKINGS SCREEN */}
        {currentTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            setCurrentTab={setCurrentTab}
          />
        )}

        {/* VIEW: AUTHENTICATION SHEET SCREEN (Split registration) */}
        {currentTab === 'auth' && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentTab('explore')}
          />
        )}

      </main>

      {/* FOOTER */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* BOOKING MODAL (Drives slot select and validation) */}
      {selectedCourtForBooking && (
        <BookingModal
          court={selectedCourtForBooking}
          currentUser={currentUser}
          selectedDate={selectedDate}
          onClose={() => setSelectedCourtForBooking(null)}
          onAddBooking={handleAddBooking}
          onOpenAuth={() => setCurrentTab('auth')}
        />
      )}
    </div>
  );
}
