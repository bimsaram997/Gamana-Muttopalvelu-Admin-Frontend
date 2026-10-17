import type { AddressDto, Booking, BookingDetailResponseDto, BookingQueryParams } from "../types/booking";
import type { PagedResponse } from "../types/general";
import { api } from "./axios";


export interface UpdateBookingPayload {
  status: string;
  serviceDate: string;   // ISO string
  selectedPackageId: number;
  estimatedHours: number;
  includeCleaning: boolean;
  totalPrice: number;
  notes: string | null;
  fullName: string;
  email: string;
  phone: string;
  pickupLocations: AddressDto[];
  dropoffLocation: AddressDto | null;
   adminNotes: string | null;
}
export interface UpdateStatusDto {
  status: string;
}


export async function updateBooking(
  bookingId: string,
  payload: UpdateBookingPayload
): Promise<BookingDetailResponseDto> {
  // Assuming your route is PUT /admin/bookings/{id}
  // Update this URL if your controller uses a different path
  const response = await api.put<BookingDetailResponseDto>(
    `/bookings/${bookingId}`,
    payload
  );
  return response.data;
}

export async function getAllBookings(
   params: BookingQueryParams,
  signal?: AbortSignal
): Promise<PagedResponse<Booking>> {
  const response = await api.get<PagedResponse<Booking>>("/bookings", {
    params,
    signal,                                  // allows cancellation
  });
  return response.data;
}



export async function getBookingById(
  bookingId: string,
  signal?: AbortSignal
): Promise<BookingDetailResponseDto> {
  const response = await api.get<BookingDetailResponseDto>(`/bookings/${bookingId}`, {
    signal,
  });
  return response.data;
}

export async function updateBookingStatus(
  bookingId: string,
  payload: UpdateStatusDto
): Promise<{ bookingId: string; status: string }> {
  const response = await api.patch<{ bookingId: string; status: string }>(
    `/bookings/${bookingId}/status`,
    payload
  );
  return response.data;
}