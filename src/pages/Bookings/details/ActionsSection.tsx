import { Box, Typography, Paper, Stack, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Props {
  status: string;
  onStatusChange: (status: string) => void;
}

export default function ActionsSection({ status, onStatusChange }: Props) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
        Actions
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
          {status !== "Confirmed" && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => onStatusChange("Confirmed")}
            >
              Mark as Confirmed
            </Button>
          )}
          {status !== "Completed" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => onStatusChange("Completed")}
            >
              Mark as Completed
            </Button>
          )}
          {status !== "Cancelled" && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onStatusChange("Cancelled")}
            >
              Cancel Booking
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}