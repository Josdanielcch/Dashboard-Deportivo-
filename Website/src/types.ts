export type SportType = string;

export interface Court {
  id: string;
  backendId?: number;
  name: string;
  sport: SportType;
  sport_image?: string;
  type: string; // 'indoor' | 'outdoor' | 'arcilla' | 'sintetico' | 'duela' etc.
  club: string;
  city: string;
  score: number;
  pricePerHour: number;
  imageUrl: string;
  address: string;
  isAvailable: boolean;
  upcomingSpots?: boolean;
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  courtImage: string;
  sport: SportType;
  date: string;
  timeSlot: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  userName: string;
  userEmail: string;
  userPhone: string;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  membershipLevel: 'standard' | 'pro';
  customerId?: number;
}
