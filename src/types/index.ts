export type UserRole = 'DRIVER' | 'PASSENGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
  status: 'IDLE' | 'ON_ROUTE' | 'DELAYED' | 'MAINTENANCE';
  routeId?: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: string;
  price: number;
  isActive?: boolean;
  waypoints?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  routeId: string;
  busId?: string;
  seats: string[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'USED' | 'CANCELLED';
  bookingDate: string;
  travelDate: string;
  qrCode: string;
  route?: Route;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pass {
  id: string;
  userId: string;
  type: 'WEEKLY' | 'MONTHLY';
  name: string;
  status: 'ACTIVE' | 'EXPIRED';
  purchaseDate: string;
  expiryDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
