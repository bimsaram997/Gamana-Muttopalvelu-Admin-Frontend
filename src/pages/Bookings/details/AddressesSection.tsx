import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Button,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddressAutocomplete from "../../../components/common/AddressAutocomplete";
import type { AddressDto, BookingDetailResponseDto } from "../../../types/booking";

interface Props {
  draft: BookingDetailResponseDto;
  isEdit: boolean;
  onUpdatePickup: (index: number, next: AddressDto) => void;
  onAddPickup: () => void;
  onRemovePickup: (index: number) => void;
  onUpdateDropoff: (next: AddressDto) => void;
  onNotesChange: (notes: string) => void;
    onAdminNotesChange: (adminNotes: string) => void;
}

export default function AddressesSection({
  draft,
  isEdit,
  onUpdatePickup,
  onAddPickup,
  onRemovePickup,
  onUpdateDropoff,
  onNotesChange,
  onAdminNotesChange
}: Props) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
        Addresses
      </Typography>

      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        <Grid size={{ xs: 12, lg: 10 }}>
          {/* Pickups */}
          {draft.pickupLocations?.length ? (
            draft.pickupLocations.map((pickup, i) => (
              <Card key={i} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Pickup Location #{i + 1}
                  </Typography>
                  {isEdit && draft.pickupLocations.length > 1 && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => onRemovePickup(i)}
                      aria-label="remove pickup"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </Box>

                {isEdit ? (
                  <AddressAutocomplete
                    label="Search address... *"
                    value={pickup}
                    onChange={(next) => onUpdatePickup(i, next)}
                    required
                  />
                ) : (
                  <TextField
                    label="Address"
                    fullWidth
                    value={pickup.label ?? ""}
                    slotProps={{ input: { readOnly: true } }}
                  />
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Floor"
                      type="number"
                      fullWidth
                      value={pickup.floor ?? 0}
                      onChange={(e) =>
                        onUpdatePickup(i, {
                          ...pickup,
                          floor: Number(e.target.value),
                        })
                      }
                      slotProps={{ input: { readOnly: !isEdit } }}
                    />
                  </Grid>
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!pickup.hasElevator}
                          disabled={!isEdit}
                          onChange={(e) =>
                            onUpdatePickup(i, {
                              ...pickup,
                              hasElevator: e.target.checked,
                            })
                          }
                        />
                      }
                      label="Elevator Available"
                    />
                  </Grid>
                </Grid>
              </Card>
            ))
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No pickup locations.
            </Alert>
          )}

          {/* Add pickup */}
          {isEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddPickup}
              sx={{
                mb: 4,
                bgcolor: "#300C0E",
                color: "#fff",
                "&:hover": { bgcolor: "#4a1418" },
              }}
            >
              Add Another Pickup Location
            </Button>
          )}

          {/* Dropoff */}
          {draft.dropoffLocation ? (
            <Card
              variant="outlined"
              sx={{
                p: 3,
                mb: 3,
                borderColor: "#D2232A",
                borderWidth: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Dropoff</Typography>

              {isEdit ? (
                <AddressAutocomplete
                  label="Search address... *"
                  value={draft.dropoffLocation}
                  onChange={onUpdateDropoff}
                  required
                />
              ) : (
                <TextField
                  label="Address"
                  fullWidth
                  value={draft.dropoffLocation.label ?? ""}
                  slotProps={{ input: { readOnly: true } }}
                />
              )}

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Floor"
                    type="number"
                    fullWidth
                    value={draft.dropoffLocation.floor ?? 0}
                    onChange={(e) =>
                      onUpdateDropoff({
                        ...draft.dropoffLocation!,
                        floor: Number(e.target.value),
                      })
                    }
                    slotProps={{ input: { readOnly: !isEdit } }}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 6 }}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!draft.dropoffLocation.hasElevator}
                        disabled={!isEdit}
                        onChange={(e) =>
                          onUpdateDropoff({
                            ...draft.dropoffLocation!,
                            hasElevator: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Elevator Available"
                  />
                </Grid>
              </Grid>
            </Card>
          ) : (
            <Alert severity="warning">No dropoff location.</Alert>
          )}

          {/* Notes */}
          <TextField
            label="Customer Notes"
            fullWidth
            multiline
            minRows={3}
            value={draft.notes ?? ""}
            onChange={(e) => onNotesChange(e.target.value)}
            slotProps={{ input: { readOnly: true} }}
            
            sx={{ mt: 3 }}
          />

           <TextField
            label="Owner Notes (Internal)"
            fullWidth
            multiline
            minRows={3}
            value={draft.adminNotes ?? ""}
            onChange={(e) => onAdminNotesChange(e.target.value)}
            slotProps={{ input: { readOnly: !isEdit } }}
            sx={{ 
              mt: 3,
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(255, 193, 7, 0.05)", // Slight yellow tint to show it's internal
              }
            }}
            helperText="These notes are only visible to admins."
          />
        </Grid>
      </Grid>
    </Box>
  );
}