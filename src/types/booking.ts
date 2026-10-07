import type { AddressType } from "./enum";

// Matches AddressDto on the backend
export interface Address {
    id: string;
    bookingId: string | null;
    booking: Booking | null;
    offerId: string | null;
    type: AddressType;
    label: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
    floor: number;
    hasElevator: boolean;
}

// Matches RouteResultDto on the backend (fill this in when you know its shape)
export interface RouteResultDto {
    totalDistanceKm: number;
    totalDurationMinutes: number;
    encodedPolyline: string;
    optimizedWaypoints: AddressDto[];
}

export interface AddressDto {
    label: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
    floor: number;
    hasElevator: boolean;
}

// Matches AllBookingDetailResponseDto
export interface Booking {
  bookingId: string;                // Guid → string in TS
  selectedPackageId: number | null; // int? → number | null
  packageName: string;
  estimatedHours: number;
  includeCleaning: boolean;
  notes: string | null;
  serviceDate: string;              // DateTime → ISO string in JSON
  totalPrice: number;               // decimal → number
  status: string;
  createdAt: string;

  // User
  userId: string;
  fullName: string;
  email: string;
  phone: string;

  // Addresses
  pickupLocations: Address[];
  dropoffLocation: Address | null;

  routeResultDto: RouteResultDto;
}

export interface BookingQueryParams {
  searchTerm?: string;
  status?: string;
  serviceDate?: string;      // ISO date "YYYY-MM-DD"
  selectedPackageId?: number;
  createdAt?: string;        // ISO date
  pageNumber?: number;
  pageSize?: number;
}