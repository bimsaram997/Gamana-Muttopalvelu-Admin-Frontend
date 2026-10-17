import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Paper,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import StatusChip from "../../components/common/StatusChip";
import { BOOKING_STATUS_COLORS } from "../../utils/statusColor";
import { useBookingDetails } from "./details/useBookingDetails";
import ServiceSection from "./details/ServiceSection";
import AddressesSection from "./details/AddressesSection";
import ContactSection from "./details/ContactSection";
import ActionsSection from "./details/ActionsSection";
import RouteMap from "../../components/common/RouteMap";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    booking,
    draft,
    packages,
    packagesLoading,
    selectedPackage,
    calculatedTotal,
    mode,
    saving,
    loading,
    error,
    snack,
    setSnack,
    enterEdit,
    cancelEdit,
    save,
    changeStatus,
    updateDraft,
    updatePickup,
    addPickup,
    removePickup,
    updateDropoff,
  } = useBookingDetails(id);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking || !draft) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/bookings")}
        >
          Back to Bookings
        </Button>
      </Box>
    );
  }

  const isEdit = mode === "edit";

  return (
    // pb ensures the fixed bottom bar doesn't cover content while editing
    <Box sx={{ pb: isEdit ? 10 : 0 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/bookings")}
        sx={{ mb: 2 }}
        disabled={isEdit}
      >
        Back to Bookings
      </Button>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, fontFamily: "monospace" }}
          >
            #{booking.bookingId.slice(0, 8)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {booking.bookingId}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <StatusChip
            status={booking.status}
            colorMap={BOOKING_STATUS_COLORS}
            size="medium"
          />

          {!isEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={enterEdit}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      {/* 1. CONTACT */}
      <ContactSection
        draft={draft}
        isEdit={isEdit}
        calculatedTotal={calculatedTotal}
        onFieldChange={updateDraft}
      />

      {/* 2. SERVICE (includes Total price) */}
      <ServiceSection
        draft={draft}
        isEdit={isEdit}
        packages={packages}
        packagesLoading={packagesLoading}
        selectedPackage={selectedPackage}
        calculatedTotal={calculatedTotal}
        onFieldChange={updateDraft}
      />

      {/* 3. ADDRESSES */}
      <AddressesSection
        draft={draft}
        isEdit={isEdit}
        onUpdatePickup={updatePickup}
        onAddPickup={addPickup}
        onRemovePickup={removePickup}
        onUpdateDropoff={updateDropoff}
        onNotesChange={(notes) => updateDraft("notes", notes)}
        onAdminNotesChange={(adminNotes) => updateDraft("adminNotes", adminNotes)} 
      />

      {/* 4. ROUTE MAP (Only show if route data exists) */}
      {booking.routeResultDto && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
            Route Map
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {/* Pass the routeResult to the map */}
            <RouteMap routeResult={booking.routeResultDto} height={400} />
          </Paper>
        </Box>
      )}


      {/* 4. ACTIONS (view mode only) */}
      {!isEdit && (
        <ActionsSection status={booking.status} onStatusChange={changeStatus} />
      )}

      {/* STICKY BOTTOM ACTION BAR (edit mode only) */}
      {isEdit && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar - 1,
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            You have unsaved changes.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Box>
  );
}