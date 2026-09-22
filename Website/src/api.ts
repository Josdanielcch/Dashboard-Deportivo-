// ======= CONFIGURACIÓN DE ENTORNO =======
// Para correr de manera LOCAL: Descomenta la siguiente línea y comenta la de producción
//const API_BASE_URL = 'http://localhost:3000/api';

// Para correr en PRODUCCIÓN: Descomenta la siguiente línea y comenta la local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboard-deportivo.onrender.com/api';
// ========================================

export interface ExchangeRate {
  id: number;
  currency_code: string;
  currency_name: string;
  symbol: string;
  rate_to_usd: string | number;
  is_active: boolean;
}

export interface PaymentMethodAccount {
  id: number;
  name: string;
  type: string;
  currency_code: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  id_document?: string;
  phone?: string;
  email?: string;
  instructions?: string;
  display_order?: number;
}

let inMemoryToken: string | null = null;
let isRefreshing = false;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (inMemoryToken) {
    (headers as any)['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  const config: RequestInit = {
    credentials: 'include', // Transmite y recibe cookies HttpOnly automáticamente
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // Manejo de expiración del token (401) con renovación silenciosa
  if (
    response.status === 401 &&
    !path.includes('/auth/client/login') &&
    !path.includes('/auth/client/register') &&
    !path.includes('/auth/client/refresh') &&
    !path.includes('/auth/client/logout')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/client/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.token) {
          setAuthToken(refreshData.token);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        setAuthToken(null);
      } finally {
        isRefreshing = false;
      }
    }

    // Reintentar si conseguimos nuevo access token
    if (inMemoryToken) {
      (config.headers as any)['Authorization'] = `Bearer ${inMemoryToken}`;
      response = await fetch(url, config);
    }
  }

  const contentType = response.headers.get('content-type');
  const body = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText;
    throw new Error(message || 'Error en la solicitud al servidor');
  }

  return body;
}

export async function refreshClientSession() {
  const res = await request('/auth/client/refresh', {
    method: 'POST',
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function logoutClient() {
  try {
    await request('/auth/client/logout', {
      method: 'POST',
    });
  } finally {
    setAuthToken(null);
  }
}

export async function createCustomer(customer: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}) {
  return request('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export async function createBooking(payload: {
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  user_id?: number;
  payment_method?: string;
  payment_reference?: string;
  total_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  amount_in_currency?: number;
}) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkAvailability(params: {
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
}) {
  const query = new URLSearchParams({
    court_id: String(params.court_id),
    booking_date: params.booking_date,
    start_time: params.start_time,
    end_time: params.end_time,
  }).toString();
  return request(`/bookings/check-availability?${query}`);
}

export async function registerUser(payload: {
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const res = await request('/auth/client/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function loginUser(payload: {
  username: string;
  password: string;
}) {
  const res = await request('/auth/client/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function googleLoginUser(payload: { access_token: string }) {
  const res = await request('/auth/client/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function getCustomerBookings(customerId: number) {
  return request(`/bookings/customer/${customerId}`);
}

export async function updateBookingStatus(bookingId: number, status: string) {
  return request(`/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function recoverPassword(email: string) {
  return request('/auth/client/recover-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return request('/auth/client/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCourts() {
  return request('/courts');
}

export async function getSports() {
  return request('/sports');
}

export async function getMyProfile() {
  return request('/auth/me');
}

export async function getExchangeRates(): Promise<{ success: boolean; data: ExchangeRate[] }> {
  return request('/exchange-rates');
}

export async function getPaymentMethods(): Promise<{ success: boolean; data: PaymentMethodAccount[] }> {
  return request('/payment-methods');
}

