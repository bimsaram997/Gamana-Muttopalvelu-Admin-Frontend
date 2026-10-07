import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  TablePagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Booking } from "../../types/booking";
import StatusChip from "../../components/common/StatusChip";
import { BOOKING_STATUS_COLORS } from "../../utils/statusColor";

interface Props {
  bookings: Booking[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onMenu: (e: React.MouseEvent<HTMLElement>, booking: Booking) => void;
}

export default function BookingsTable({
  bookings,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onMenu,
}: Props) {
  return (
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
                  <TableCell>
                    <StatusChip status={b.status} colorMap={BOOKING_STATUS_COLORS} />
                  </TableCell>
                  <TableCell>{b.fullName}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => onMenu(e, b)}
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
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[6, 12, 24, 48]}
      />
    </Paper>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}