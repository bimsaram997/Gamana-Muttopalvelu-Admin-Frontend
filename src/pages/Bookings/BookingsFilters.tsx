import {
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export interface FiltersState {
  searchTerm: string;
  status: string;
  serviceDate: string;
  selectedPackageId: number | "";
}

interface Props {
  draft: FiltersState;
  onChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  onSearch: () => void;
  onClear: () => void;
  packageOptions: { id: number; title: string }[];
  packagesLoading: boolean;
  hasAppliedFilters: boolean;
}

export default function BookingsFilters({
  draft,
  onChange,
  onSearch,
  onClear,
  packageOptions,
  packagesLoading,
  hasAppliedFilters,
}: Props) {
  // Submit when user presses Enter in the search field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" } }}   
        
      >
        <TextField
          label="Search"
          placeholder="Name, email, phone…"
          size="small"
          sx={{ width: { xs: "75%", md: "75%" } }}
          value={draft.searchTerm}
          onChange={(e) => onChange("searchTerm", e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={draft.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Service date"
          type="date"
          size="small"
          value={draft.serviceDate}
          onChange={(e) => onChange("serviceDate", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 170 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Package</InputLabel>
          <Select
            label="Package"
            value={draft.selectedPackageId}
            onChange={(e) =>
              onChange("selectedPackageId", e.target.value as number | "")
            }
            disabled={packagesLoading}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {packageOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={onSearch}
        >
          Search
        </Button>

        {hasAppliedFilters && (
          <Button onClick={onClear} startIcon={<ClearIcon />} size="small">
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
}