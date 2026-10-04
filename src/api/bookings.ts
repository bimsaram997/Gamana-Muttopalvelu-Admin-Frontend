import type { Booking } from "../types/booking";
import type { PagedResponse } from "../types/general";
import { api } from "./axios";

export async function getAllBookings(
  pageNumber: number = 1,
  pageSize: number = 6,
  signal?: AbortSignal
): Promise<PagedResponse<Booking>> {
  const response = await api.get<PagedResponse<Booking>>("/bookings", {
    params: { pageNumber, pageSize },
    signal,                                  // allows cancellation
  });
  return response.data;
}

export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<void> {
  // 🔧 MOCK: pretend it worked
  console.log(`[mock] Updating booking ${bookingId} → ${status}`);
  await new Promise((r) => setTimeout(r, 300));

  // 👇 Uncomment when backend is ready:
  // await api.patch(`/admin/bookings/${bookingId}/status`, { status });
}