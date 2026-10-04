import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  TablePagination,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getAllBookings, updateBookingStatus } from "../../api/bookings";
import type { Booking } from "../../types/booking";

import AddIcon from "@mui/icons-material/Add"; // Optional icon




// ---- Main page ----
export default function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Pagination state ----
  const [page, setPage] = useState(0);        // MUI is 0-based
  const [pageSize, setPageSize] = useState(6); // matches backend default
  const [totalCount, setTotalCount] = useState(0);

  // Menu anchor state — stores the DOM element the menu is attached to
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuBooking, setMenuBooking] = useState<Booking | null>(null);

  // Snackbar for feedback
  const [snack, setSnack] = useState<string | null>(null);
  // ---- Fetch on mount and whenever page/pageSize changes ----
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // MUI page is 0-based, API is 1-based → add 1
        const res = await getAllBookings(page + 1, pageSize, controller.signal);

        setBookings(res.data);
        setTotalCount(res.totalCount);
      } catch (err: unknown) {
        // Ignore aborts — they're expected when the page changes fast
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();   // cancel the request if page changes/unmounts
  }, [page, pageSize]);                //  re-run when these change

  // ---- Menu handlers ----
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, booking: Booking) => {
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

  // ---- Pagination handlers ----
  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);   // reset to first page when size changes
  };

  // ---- Render ----
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Bookings</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {totalCount} total
          </Typography>
          <Button variant="contained" sx={{ color: "white", backgroundColor: "#000080",textTransform: "none" }} startIcon={<AddIcon />}>
            New Booking
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell align="right">Est. Hours</TableCell>
                  <TableCell>Service Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((b) => (
                    <TableRow key={b.bookingId} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                        {b.bookingId.slice(0, 8)}…
                      </TableCell>
                      <TableCell>{b.packageName}</TableCell>
                      <TableCell align="right">{b.estimatedHours}</TableCell>
                      <TableCell>{formatDate(b.serviceDate)}</TableCell>
                      <TableCell><StatusChip status={b.status} /></TableCell>
                      <TableCell>{b.fullName}</TableCell>
                      <TableCell>{b.email}</TableCell>
                      <TableCell>{b.phone}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, b)}
                          aria-label="row actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[6, 12, 24, 48]}
          />
        </Paper>
      )}

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
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

      {/* Snackbar */}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Box>
  );
}


// ---- Helper ----
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusChip({ status }: { status: string }) {
  const colorMap: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
    Pending: "warning",
    Approved: "info",
    Completed: "success",
    Cancelled: "error",
  };
  return (
    <Chip
      label={status}
      size="small"
      color={colorMap[status] ?? "default"}
    />
  );
}
