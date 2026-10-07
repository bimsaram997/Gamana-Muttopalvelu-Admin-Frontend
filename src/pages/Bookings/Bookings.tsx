import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { getAllBookings, updateBookingStatus } from "../../api/bookings";
import { getAllPackages, getPackageTitle } from "../../api/packages";
import type { Booking } from "../../types/booking";
import type { AdminPackage } from "../../types/package";
import { useDebounce } from "../../hooks/useDebounce";
import BookingsFilters, { type FiltersState } from "./BookingsFilters";
import BookingsTable from "./BookingsTable";

const EMPTY_FILTERS: FiltersState = {
  searchTerm: "",
  status: "",
  serviceDate: "",
  selectedPackageId: "",
};

export default function Bookings() {
  const navigate = useNavigate();

  // ---- Data ----
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Filters ----
  // `draft` = what the user is editing in the UI
  // `applied` = what was submitted with the Search button
  // Search term is excluded from `applied` — it flows through the debounce
  // directly into the fetch effect for a live-search feel.
  const [draft, setDraft] = useState<FiltersState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FiltersState>(EMPTY_FILTERS);

  const debouncedRaw = useDebounce(draft.searchTerm, 400);
  const debouncedSearch = draft.searchTerm === "" ? "" : debouncedRaw;

  // ---- Pagination ----
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // ---- Packages dropdown ----
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // ---- Menu / Snackbar ----
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuBooking, setMenuBooking] = useState<Booking | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  // ============================================================
  // Load packages once
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPackagesLoading(true);
        const data = await getAllPackages();
        if (!cancelled) setPackages(data);
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // Fetch bookings whenever search / applied filters / paging change
  // ============================================================
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAllBookings(
          {
            searchTerm: debouncedSearch || undefined,       // 👈 live search
            status: applied.status || undefined,            // 👈 click-to-apply
            serviceDate: applied.serviceDate || undefined,
            selectedPackageId:
              applied.selectedPackageId === ""
                ? undefined
                : Number(applied.selectedPackageId),
            pageNumber: page + 1, // MUI 0-based → API 1-based
            pageSize,
          },
          controller.signal
        );

        setBookings(res.data);
        setTotalCount(res.totalCount);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    debouncedSearch,
    applied.status,
    applied.serviceDate,
    applied.selectedPackageId,
    page,
    pageSize,
  ]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Apply all draft filters — including search — and reset to page 0
  const handleSearch = () => {
    setApplied(draft);
    setPage(0);
  };

  const handleClearFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(0);
  };

  const hasAppliedFilters = useMemo(
    () =>
      applied.searchTerm !== "" ||
      applied.status !== "" ||
      applied.serviceDate !== "" ||
      applied.selectedPackageId !== "" ||
      debouncedSearch !== "",
    [applied, debouncedSearch]
  );

  const packageOptions = useMemo(
    () =>
      packages.map((p) => ({
        id: p.id,
        title: getPackageTitle(p, "en"),
      })),
    [packages]
  );

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuBooking(booking);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuBooking(null);
  };

  const handleView = () => {
    if (menuBooking) navigate(`/bookings/${menuBooking.bookingId}`);
    handleCloseMenu();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!menuBooking) return;
    const current = menuBooking;
    handleCloseMenu();
    try {
      await updateBookingStatus(current.bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === current.bookingId ? { ...b, status: newStatus } : b
        )
      );
      setSnack(`Booking marked as ${newStatus}`);
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Bookings</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ alignSelf: "center" }}
        >
          {totalCount} total
        </Typography>
      </Box>

      <BookingsFilters
        draft={draft}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        packageOptions={packageOptions}
        packagesLoading={packagesLoading}
        hasAppliedFilters={hasAppliedFilters}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <BookingsTable
          bookings={bookings}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(0);
          }}
          onMenu={handleOpenMenu}
        />
      )}

      {/* ===== Row actions menu ===== */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleView}>View details</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Confirmed")}>
          Mark as Confirmed
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Completed")}>
          Mark as Completed
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Cancelled")}
          sx={{ color: "error.main" }}
        >
          Cancel booking
        </MenuItem>
      </Menu>

      {/* ===== Feedback toast ===== */}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Box>
  );
}