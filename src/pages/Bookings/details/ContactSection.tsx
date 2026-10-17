import { Box, Typography, Grid, TextField } from "@mui/material";
import type { BookingDetailResponseDto } from "../../../types/booking";
import { mergeDateTime, toDateInput, toTimeInput } from "./dateHelpers";

interface Props {
  draft: BookingDetailResponseDto;
  isEdit: boolean;
  calculatedTotal: number;
  onFieldChange: <K extends keyof BookingDetailResponseDto>(
    key: K,
    value: BookingDetailResponseDto[K]
  ) => void;
}

export default function ContactSection({
  draft,
  isEdit,
  onFieldChange,
}: Props) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
        Contact
      </Typography>

      <Grid container spacing={3}>
        {/* Move date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Move date"
            type="date"
            fullWidth
            value={toDateInput(draft.serviceDate)}
            onChange={(e) =>
              onFieldChange(
                "serviceDate",
                mergeDateTime(e.target.value, toTimeInput(draft.serviceDate))
              )
            }
            slotProps={{
              input: { readOnly: !isEdit },
              inputLabel: { shrink: true },
            }}
          />
        </Grid>

        {/* Move time */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Move time"
            type="time"
            fullWidth
            value={toTimeInput(draft.serviceDate)}
            onChange={(e) =>
              onFieldChange(
                "serviceDate",
                mergeDateTime(toDateInput(draft.serviceDate), e.target.value)
              )
            }
            slotProps={{
              input: { readOnly: !isEdit },
              inputLabel: { shrink: true },
            }}
          />
        </Grid>

        {/* Name (always read-only) */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Full name"
            fullWidth
            value={draft.fullName}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>

        {/* Email (always read-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={draft.email}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>

        {/* Phone (editable) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Phone"
            fullWidth
            value={draft.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            slotProps={{ input: { readOnly: !isEdit } }}
          />
        </Grid>

       
      </Grid>
    </Box>
  );
}