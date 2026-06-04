const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = localStorage.getItem('courtconnect_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  const contentType = response.headers.get('content-type');
  const body = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText;
    throw new Error(message || 'Error en la solicitud al servidor');
  }

  return body;
}

export async function createCustomer(customer: {
  full_name: string;
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
  full_name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: {
  username: string;
  password: string;
}) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
  return request('/auth/recover-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
