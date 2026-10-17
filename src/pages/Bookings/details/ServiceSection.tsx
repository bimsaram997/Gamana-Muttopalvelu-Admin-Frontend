import {
  Box,
  Typography,
  Card,
  Chip,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getPackageTitle } from "../../../api/packages";
import type { BookingDetailResponseDto } from "../../../types/booking";
import type { AdminPackage } from "../../../types/package";

interface Props {
  draft: BookingDetailResponseDto;
  isEdit: boolean;
  packages: AdminPackage[];
  packagesLoading: boolean;
  selectedPackage: AdminPackage | null;
  calculatedTotal: number;
  onFieldChange: <K extends keyof BookingDetailResponseDto>(
    key: K,
    value: BookingDetailResponseDto[K]
  ) => void;
}

export default function ServiceSection({
  draft,
  isEdit,
  packages,
  packagesLoading,
  selectedPackage,
  calculatedTotal,
  onFieldChange,
}: Props) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
        Service
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Package and service details.
      </Typography>

      <Grid container spacing={3}>
        
        {/* 👇 NEW: Status Dropdown (only in Edit mode) */}
        {isEdit && (
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={draft.status}
                onChange={(e) => onFieldChange("status", e.target.value)}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Package */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={!isEdit || packagesLoading}>
            <InputLabel>Package</InputLabel>
            <Select
              label="Package"
              value={draft.selectedPackageId}
              onChange={(e) =>
                onFieldChange("selectedPackageId", Number(e.target.value))
              }
            >
              {packages.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {getPackageTitle(p, "en")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Hours */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Estimated hours"
            type="number"
            fullWidth
            value={draft.estimatedHours}
            onChange={(e) => {
              const n = Number(e.target.value);
              const clamped = Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
              onFieldChange("estimatedHours", clamped);
            }}
            slotProps={{
              input: { readOnly: !isEdit },
              htmlInput: { min: 1, step: 1 },
            }}
          />
        </Grid>

        {/* Package card */}
        {selectedPackage && (
          <Grid size={{ xs: 12 }}>
            <Card
              variant="outlined"
              sx={{
                p: 3,
                borderColor: "#D2232A",
                borderWidth: 2,
                bgcolor: "rgba(210, 35, 42, 0.03)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {getPackageTitle(selectedPackage, "en")}
                </Typography>
                {selectedPackage.isPopular && (
                  <Chip
                    label="Popular"
                    size="small"
                    sx={{ bgcolor: "#D2232A", color: "#fff" }}
                  />
                )}
              </Box>
              <Typography
                variant="h5"
                sx={{ color: "#D2232A", fontWeight: 700 }}
              >
                {selectedPackage.ratePerHour} €
                <Typography
                  component="span"
                  sx={{ fontSize: "0.75rem", color: "text.secondary", ml: 0.5 }}
                >
                  / h
                </Typography>
              </Typography>
            </Card>
          </Grid>
        )}

        {/* Cleaning */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={draft.includeCleaning}
                disabled={!isEdit}
                onChange={(e) =>
                  onFieldChange("includeCleaning", e.target.checked)
                }
              />
            }
            label="Include cleaning"
          />
        </Grid>

        {/* Total price */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Total price (€)"
            type="number"
            fullWidth
            value={calculatedTotal}
            slotProps={{ input: { readOnly: true } }}
            helperText={`${selectedPackage?.ratePerHour ?? 0} €/h × ${draft.estimatedHours} h`}
          />
        </Grid>
      </Grid>
    </Box>
  );
}