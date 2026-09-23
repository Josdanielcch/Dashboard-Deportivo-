import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, Globe, Trophy, Award, Check, KeyRound, ArrowLeft, CreditCard } from 'lucide-react';
import { User as UserType } from '../types';
import { 
  loginUser, registerUser, recoverPassword, resetPassword, googleLoginUser,
  getExchangeRates, getPaymentMethods, ExchangeRate, PaymentMethodAccount
} from '../api';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'reset';
  onModeSwitch?: (mode: 'login' | 'register') => void;
  onLoginSuccess: (user: UserType) => void;
  onCancel: () => void;
}

export default function AuthPage({ initialMode = 'register', onModeSwitch, onLoginSuccess, onCancel }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'recover' | 'reset'>(initialMode);
  const [token, setToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Recovery & Reset states
  const [recoverEmail, setRecoverEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check URL query parameters for token (e.g. ?token=...)
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setActiveTab('reset');
    }
  }, []);

  // Registration form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membership, setMembership] = useState<'standard' | 'pro'>('standard');
  const [membershipReference, setMembershipReference] = useState('');
  const [error, setError] = useState('');

  // Multicurrency & Payment accounts state for PRO membership
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentMethodAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | string>(1);

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
      instructions: 'Colocar tu nombre en la nota o concepto.'
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
          getPaymentMethods().catch(() => null)
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

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Computed rates & accounts for UI and submissions
  const vesRateObj = exchangeRates.find(r => r.currency_code === 'VES');
  const copRateObj = exchangeRates.find(r => r.currency_code === 'COP');
  const vesRate = vesRateObj ? parseFloat(String(vesRateObj.rate_to_usd)) : 70.50;
  const copRate = copRateObj ? parseFloat(String(copRateObj.rate_to_usd)) : 4200.00;

  const activeAccounts = paymentAccounts.length > 0 ? paymentAccounts : fallbackAccounts;
  const selectedAccount = activeAccounts.find(a => a.id === selectedAccountId) || activeAccounts[0] || null;

  const getAmountForAccount = (acc: PaymentMethodAccount) => {
    const usd = 10;
    if (acc.currency_code === 'VES') {
      return (usd * vesRate).toFixed(2);
    }
    if (acc.currency_code === 'COP') {
      return Math.round(usd * copRate).toLocaleString('es-CO');
    }
    return usd.toFixed(2);
  };

  const getCurrencySymbol = (code: string) => {
    if (code === 'VES') return 'Bs.';
    if (code === 'COP') return '$ COP';
    return 'USD';
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const isDirectPayment = selectedAccount && (selectedAccount.type === 'cash' || selectedAccount.type === 'card');
    if (membership === 'pro' && !isDirectPayment && !membershipReference.trim()) {
      setError(`Por favor ingresa la referencia de pago de ${selectedAccount ? selectedAccount.name : 'tu comprobante'} para activar la Membresía PRO.`);
      return;
    }

    try {
      const proCostUsd = 10;
      const activeCurrency = selectedAccount?.currency_code || 'USD';
      const calculatedAmount = activeCurrency === 'VES' 
        ? parseFloat((proCostUsd * vesRate).toFixed(2)) 
        : (activeCurrency === 'COP' ? Math.round(proCostUsd * copRate) : proCostUsd);

      const payload = {
        username: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        membershipLevel: membership,
        paymentReference: membershipReference.trim() || undefined,
        membership_currency: activeCurrency,
        membership_amount_in_currency: calculatedAmount,
      };
      const response = await registerUser(payload);

      const userSession: UserType = {
        name: response.user.full_name ?? `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        membershipLevel: membership,
        paymentReference: membershipReference.trim() || undefined,
        customerId: response.customer_id,
      };

      localStorage.removeItem('courtconnect_token');
      localStorage.setItem('courtconnect_user_session', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cuenta. Intenta de nuevo.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor ingresar correo y contraseña.');
      return;
    }

    try {
      const payload = {
        username: loginEmail.trim().toLowerCase(),
        password: loginPassword.trim(),
      };
      const response = await loginUser(payload);
      const userSession: UserType = {
        name: response.user.full_name || response.user.username || loginEmail.trim(),
        email: response.user.email || loginEmail.trim().toLowerCase(),
        phone: response.user.phone || '',
        membershipLevel: response.user.membership_level || 'standard',
        customerId: response.user.customer_id,
      };

      localStorage.removeItem('courtconnect_token');
      localStorage.setItem('courtconnect_user_session', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    } catch (err: any) {
      setError(err?.message || 'Email o contraseña incorrectos.');
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoverEmail.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      const response = await recoverPassword(recoverEmail.trim().toLowerCase());
      setSuccessMessage(response.message || 'Enlace de recuperación enviado con éxito.');
      setRecoverEmail('');
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la solicitud de recuperación.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor ingresa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await resetPassword({ token, password: newPassword });
      setSuccessMessage(response.message || 'Contraseña restablecida correctamente.');
      setTimeout(() => {
        setActiveTab('login');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al restablecer la contraseña.');
    }
  };

  const handleSocialClick = (platform: string) => {
    // Immediate login with social for frictionless UX
    const socialUser: UserType = {
      name: `Jugador ${platform}`,
      email: `deporte.${platform.toLowerCase()}@courtconnect.com`,
      phone: '+52 55 9999 8888',
      membershipLevel: 'pro',
      customerId: 1,
    };
    localStorage.setItem('courtconnect_user_session', JSON.stringify(socialUser));
    onLoginSuccess(socialUser);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const apiResponse = await googleLoginUser({ access_token: tokenResponse.access_token });
        const userSession: UserType = {
          name: apiResponse.user.full_name,
          email: apiResponse.user.email,
          phone: apiResponse.user.phone || '',
          membershipLevel: apiResponse.user.membership_level || 'standard',
          customerId: apiResponse.user.customer_id,
        };
        localStorage.removeItem('courtconnect_token');
        localStorage.setItem('courtconnect_user_session', JSON.stringify(userSession));
        onLoginSuccess(userSession);
      } catch (err: any) {
        setError(err?.message || 'Error al iniciar sesión con Google.');
      }
    },
    onError: () => setError('Error al autenticar con Google.'),
  });

  return (
    <div className="max-w-[1200px] mx-auto bg-zinc-900/60 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col md:flex-row min-h-[500px] mb-8 md:mb-12 relative z-10 animate-fade-in text-white">

      {/* LEFT COLUMN: Stadium branding and community metrics (Visible on desktop & tablets, hidden on mobile for instant login focus) */}
      <div className="hidden md:flex md:w-1/2 bg-black/95 text-white p-8 md:p-12 flex-col justify-between relative overflow-hidden shrink-0 border-r border-white/5">

        {/* Background mesh glow and stadium image mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/70 to-zinc-950/20 z-10" />
        <img
          src="/images/court-2.jpg"
          alt="Branded Basketball Stadium"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />

        <div className="relative z-20">
          <span className="text-black bg-[#c0ff00] text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest inline-block mb-6 shadow ring-1 ring-[#c0ff00]/20 font-mono">
            Pro Community
          </span>

          <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tight leading-tight uppercase italic">
            Únete a la comunidad <span className="text-[#c0ff00]">CourtConnect</span>
            <br />
            Reserva en segundos
          </h2>

          <p className="text-sm text-zinc-300 mt-4 leading-relaxed max-w-md font-sans font-medium">
            Accede a las mejores canchas de la ciudad, conecta con otros jugadores y lleva tu juego al siguiente nivel con nuestra plataforma premium.
          </p>
        </div>

        {/* Dynamic community metrics stack (Matches Image 3) */}
        <div className="relative z-20 mt-12 md:mt-0 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3.5">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="/images/avatar-1.jpg"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="/images/avatar-2.jpg"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="/images/avatar-3.jpg"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <div className="text-base font-black text-[#c0ff00] font-headline uppercase">+2,500 jugadores</div>
              <p className="text-xs text-zinc-400 font-semibold">ya están reservando activamente hoy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive login/register sheet */}
      <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center">

        {/* Mobile top navigation helper */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 md:hidden">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-[#c0ff00] transition-colors py-1 px-2.5 rounded-lg bg-white/5 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#c0ff00] uppercase tracking-tighter italic">
            <Trophy className="h-4 w-4 text-[#c0ff00] fill-[#c0ff00]" />
            <span>COURTCONNECT</span>
          </div>
        </div>

        {/* Segmented Tab Switcher (Fast thumb toggle on mobile and desktop) */}
        {(activeTab === 'login' || activeTab === 'register') && (
          <div className="flex p-1 bg-zinc-950/80 rounded-xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                onModeSwitch?.('login');
                setError('');
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#c0ff00] text-black shadow-md shadow-[#c0ff00]/15'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                onModeSwitch?.('register');
                setError('');
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#c0ff00] text-black shadow-md shadow-[#c0ff00]/15'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        {/* Dynamic Title */}
        <div className="mb-6" id="auth-header">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-headline">
            {activeTab === 'register' ? 'Crear ' : activeTab === 'login' ? 'Iniciar ' : activeTab === 'recover' ? 'Recuperar ' : 'Nueva '}
            <span className="text-[#c0ff00]">
              {activeTab === 'register' ? 'Cuenta' : activeTab === 'login' ? 'Sesión' : 'Contraseña'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
            {activeTab === 'register' ? 'Completa tus datos para unirte a la comunidad.' : 
             activeTab === 'login' ? 'Bienvenido de vuelta, ingresa tus credenciales.' : 
             activeTab === 'recover' ? 'Ingresa tu correo para enviarte un enlace de recuperación.' : 
             'Ingresa tu nueva contraseña segura.'}
          </p>
        </div>

        {activeTab === 'register' ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Nombres
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Apellidos
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Teléfono movil
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Email / Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Contraseña de acceso
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {/* Premium Membership Selection Toggle */}
            <div className="pt-2 space-y-3">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono block">
                Nivel de Membresía
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMembership('standard')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${membership === 'standard'
                      ? 'border-zinc-700 bg-zinc-950/50 ring-1 ring-zinc-500'
                      : 'border-white/10'
                    }`}
                >
                  <div className="text-xs font-bold text-white">Estándar (Gratis)</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Acceso básico sin costo</div>
                  {membership === 'standard' && <Check className="h-4 w-4 text-zinc-400 absolute top-2.5 right-2.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMembership('pro')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${membership === 'pro'
                      ? 'border-[#c0ff00] bg-[#c0ff00]/10 ring-1 ring-[#c0ff00]'
                      : 'border-white/10'
                    }`}
                >
                  <div className="text-xs font-black text-[#c0ff00] flex items-center gap-1 font-mono uppercase tracking-wide">
                    <Award className="h-3.5 w-3.5 text-[#c0ff00]" /> Pro Premium
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">$10 USD/mes • 25% desc</div>
                  {membership === 'pro' && <Check className="h-4 w-4 text-[#c0ff00] absolute top-2.5 right-2.5" />}
                </button>
              </div>

              {/* Payment Details for PRO Membership */}
              {membership === 'pro' && (
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-[#c0ff00]/30 space-y-3 font-sans">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-bold text-[#c0ff00] flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Suscripción PRO
                    </span>
                    <span className="font-mono font-black text-white">
                      $10.00 USD / mes {selectedAccount && `(${getAmountForAccount(selectedAccount)} ${getCurrencySymbol(selectedAccount.currency_code)})`}
                    </span>
                  </div>

                  {/* Selector de Cuentas / Métodos de Pago Activos */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-1.5 block">
                      Selecciona Método de Pago
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#c0ff00] bg-[#c0ff00]/15 text-white ring-1 ring-[#c0ff00]'
                                : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <div className="text-[11px] font-black truncate">{getIcon()} {acc.name}</div>
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
                  </div>

                  {/* Detalles bancarios de la cuenta seleccionada */}
                  {selectedAccount && (
                    <div className="text-[11px] text-zinc-300 space-y-1.5 bg-zinc-900/80 p-3.5 rounded-xl border border-white/5">
                      {selectedAccount.bank_name && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Banco:</span>
                          <strong className="text-white">{selectedAccount.bank_name}</strong>
                        </div>
                      )}
                      {selectedAccount.account_holder && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Titular:</span>
                          <strong className="text-white">{selectedAccount.account_holder}</strong>
                        </div>
                      )}
                      {selectedAccount.id_document && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Documento / RIF / NIT:</span>
                          <strong className="text-white font-mono">{selectedAccount.id_document}</strong>
                        </div>
                      )}
                      {selectedAccount.phone && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Teléfono:</span>
                          <strong className="text-white font-mono">{selectedAccount.phone}</strong>
                        </div>
                      )}
                      {selectedAccount.email && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Correo Electrónico:</span>
                          <strong className="text-white">{selectedAccount.email}</strong>
                        </div>
                      )}
                      {selectedAccount.account_number && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">N° de Cuenta:</span>
                          <strong className="text-white font-mono">{selectedAccount.account_number}</strong>
                        </div>
                      )}
                      {selectedAccount.instructions && (
                        <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-white/5">
                          ℹ️ {selectedAccount.instructions}
                        </p>
                      )}

                      <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-xs text-white">
                        <span>Total a pagar ({selectedAccount.currency_code}):</span>
                        <span className="text-[#c0ff00] font-mono text-sm font-black">
                          {getAmountForAccount(selectedAccount)} {getCurrencySymbol(selectedAccount.currency_code)}
                        </span>
                      </div>

                      {selectedAccount.type !== 'cash' && selectedAccount.type !== 'card' && (
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="N° de Referencia / Comprobante (Requerido)"
                            value={membershipReference}
                            onChange={(e) => setMembershipReference(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs font-mono text-white outline-none focus:border-[#c0ff00]"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
              id="submit-register"
            >
              Crear Cuenta
            </button>
            <div className="text-center mt-4">
              <span className="text-xs text-zinc-400 font-medium">¿Ya tienes cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  onModeSwitch?.('login');
                  setError('');
                }}
                className="text-xs text-[#c0ff00] hover:underline font-bold"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        ) : activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recover');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[9px] text-zinc-400 hover:text-[#c0ff00] hover:underline uppercase tracking-wider font-bold"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
              id="submit-login"
            >
              Iniciar Sesión
            </button>
            <div className="text-center mt-4">
              <span className="text-xs text-zinc-400 font-medium">¿No tienes cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  onModeSwitch?.('register');
                  setError('');
                }}
                className="text-xs text-[#c0ff00] hover:underline font-bold"
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        ) : activeTab === 'recover' ? (
          /* RECOVER PASSWORD FORM */
          <form onSubmit={handleRecoverSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-2">
              <KeyRound className="h-10 w-10 text-[#c0ff00] mx-auto animate-pulse" />
              <h3 className="text-base font-bold uppercase tracking-tight">¿Olvidaste tu contraseña?</h3>
              <p className="text-xs text-zinc-400 font-medium">Ingresa tu correo registrado y te enviaremos un enlace seguro para restablecerla.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}
            {successMessage && <p className="text-xs text-[#c0ff00] font-bold font-sans">✓ {successMessage}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
            >
              Enviar Enlace
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full flex items-center justify-center gap-1 text-[10px] font-black text-zinc-400 hover:text-[#c0ff00] transition-colors uppercase tracking-widest font-mono pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a iniciar sesión</span>
            </button>
          </form>
        ) : (
          /* RESET PASSWORD FORM */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-2">
              <Lock className="h-10 w-10 text-[#c0ff00] mx-auto animate-pulse" />
              <h3 className="text-base font-bold uppercase tracking-tight">Crear nueva contraseña</h3>
              <p className="text-xs text-zinc-400 font-medium">Define una nueva contraseña segura para tu cuenta.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-base md:text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}
            {successMessage && <p className="text-xs text-[#c0ff00] font-bold font-sans">✓ {successMessage}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
            >
              Restablecer Contraseña
            </button>
          </form>
        )}

        {/* SOCIAL AUTH DIVIDER (Matches Image 3) */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative z-10 bg-zinc-900 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">
            o continúa con
          </span>
        </div>

        {/* Google & Facebook Direct login tags */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="py-2.5 px-4 border border-white/10 rounded-xl text-xs font-bold text-white bg-zinc-950/40 hover:bg-zinc-800/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-sm"
          >
            {/* Google SVG Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialClick('Facebook')}
            className="py-2.5 px-4 border border-white/10 rounded-xl text-xs font-bold text-white bg-zinc-950/40 hover:bg-zinc-800/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-sm"
          >
            {/* Facebook SVG Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-black text-zinc-500 hover:text-[#c0ff00] hover:underline text-center mt-6 transition-colors uppercase tracking-widest font-mono cursor-pointer"
        >
          Volver a las canchas
        </button>
      </div>
    </div>
  );
}
