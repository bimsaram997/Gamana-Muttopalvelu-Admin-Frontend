import { useEffect, useMemo, useState } from "react";
import { getBookingById, updateBooking, type UpdateBookingPayload } from "../../../api/bookings";
import { getAllPackages } from "../../../api/packages";
import type { AddressDto, BookingDetailResponseDto } from "../../../types/booking";
import type { AdminPackage } from "../../../types/package";

export type Mode = "view" | "edit";

export function useBookingDetails(id: string | undefined) {
  const [booking, setBooking] = useState<BookingDetailResponseDto | null>(null);
  const [draft, setDraft] = useState<BookingDetailResponseDto | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Fetch booking
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBookingById(id, controller.signal);
        setBooking(data);
        setDraft(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  // Fetch packages
  useEffect(() => {
    (async () => {
      try {
        setPackagesLoading(true);
        const data = await getAllPackages();
        setPackages(
          data
            .filter((p) => p.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
      } catch {
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    })();
  }, []);

  // Derived
  const selectedPackage = useMemo(() => {
    if (!draft) return null;
    return packages.find((p) => p.id === draft.selectedPackageId) ?? null;
  }, [draft, packages]);

  const calculatedTotal = useMemo(() => {
    if (!draft) return 0;
    const rate = selectedPackage?.ratePerHour ?? 0;
    return Math.round(rate * draft.estimatedHours * 100) / 100;
  }, [draft, selectedPackage]);

  // Field updater
  const updateDraft = <K extends keyof BookingDetailResponseDto>(
    key: K,
    value: BookingDetailResponseDto[K]
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // Address updaters
  const updatePickup = (index: number, next: AddressDto) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const list = prev.pickupLocations.slice();
      list[index] = next;
      return { ...prev, pickupLocations: list };
    });
  };

  const addPickup = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const blank: AddressDto = {
        label: "",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        latitude: 0,
        longitude: 0,
        floor: 0,
        hasElevator: false,
      };
      return { ...prev, pickupLocations: [...prev.pickupLocations, blank] };
    });
  };

  const removePickup = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pickupLocations: prev.pickupLocations.filter((_, i) => i !== index),
      };
    });
  };

  const updateDropoff = (next: AddressDto) => {
    setDraft((prev) => (prev ? { ...prev, dropoffLocation: next } : prev));
  };

  // Actions
  const enterEdit = () => {
    if (!booking) return;
    setDraft(structuredClone(booking));
    setMode("edit");
  };

  const cancelEdit = () => {
    setDraft(booking);
    setMode("view");
  };

     const save = async () => {
    if (!draft || !booking) return;
    try {
      setSaving(true);

      const payload: UpdateBookingPayload = {
        status: draft.status,
        serviceDate: draft.serviceDate,
        selectedPackageId: draft.selectedPackageId,
        estimatedHours: draft.estimatedHours,
        includeCleaning: draft.includeCleaning,
        totalPrice: calculatedTotal,
        notes: draft.notes,
        fullName: draft.fullName,
        email: draft.email,
        phone: draft.phone,
        pickupLocations: draft.pickupLocations,
        dropoffLocation: draft.dropoffLocation,
        adminNotes: draft.adminNotes, // Adjust this if you have a field for admin notes
      };

      // 1. Call the PUT endpoint
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await updateBooking(booking.bookingId, payload);

      // 2. Extract the ID (handles both string response or { bookingId: "..." })
      const updatedId = typeof response === "string" ? response : response?.bookingId || booking.bookingId;

      // 3. Re-fetch the full data to ensure we have the latest state
      const freshData = await getBookingById(updatedId);

      // 4. Update local state
      setBooking(freshData);
      setDraft(freshData);
      setMode("view");
      setSnack("Booking updated successfully");
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!booking) return;
    try {
      await updateBooking(booking.bookingId, { ...booking, status: newStatus });
      const updated = { ...booking, status: newStatus };
      setBooking(updated);
      setDraft(updated);
      setSnack(`Booking marked as ${newStatus}`);
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return {
    // data
    booking,
    draft,
    packages,
    packagesLoading,
    selectedPackage,
    calculatedTotal,
    // state
    mode,
    saving,
    loading,
    error,
    snack,
    // setters
    setSnack,
    // actions
    enterEdit,
    cancelEdit,
    save,
    changeStatus,
    updateDraft,
    updatePickup,
    addPickup,
    removePickup,
    updateDropoff,
  };
}