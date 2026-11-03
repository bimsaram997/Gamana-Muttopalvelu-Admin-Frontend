import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { getAllKeyServices } from "../../api/key-services";
import type { AdminKeyServiceResponseDto } from "../../types/key-services";
import KeyServiceFormModal from "./KeyServiceFormModal";

export default function KeyServicesSettings() {
  const [services, setServices] = useState<AdminKeyServiceResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  
  const [appliedTitle, setAppliedTitle] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminKeyServiceResponseDto | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
          pageNumber: page + 1,
          pageSize: pageSize,
        };
        if (appliedTitle.trim()) params.title = appliedTitle.trim();
        if (appliedStatus.trim()) params.status = appliedStatus.trim();

        const res = await getAllKeyServices(params, controller.signal);

        setServices(Array.isArray(res?.data) ? res.data : []);
        setTotalCount(res?.totalCount ?? 0);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(err instanceof Error ? err.message : "Failed to load key services");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [appliedTitle, appliedStatus, page, pageSize, refreshKey]);

  const handleSearch = () => {
    setAppliedTitle(draftTitle);
    setAppliedStatus(draftStatus);
    setPage(0);
  };

  const handleClear = () => {
    setDraftTitle("");
    setDraftStatus("");
    setAppliedTitle("");
    setAppliedStatus("");
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSaved = () => {
    setRefreshKey((prev) => prev + 1);
    setModalOpen(false);
  };

  // 👇 Helper functions for both languages
  const getServiceNameEN = (service: AdminKeyServiceResponseDto) => {
    return service.translations.find((t) => t.languageCode.toLowerCase() === "en")?.name || "—";
  };

  const getServiceNameFI = (service: AdminKeyServiceResponseDto) => {
    return service.translations.find((t) => t.languageCode.toLowerCase() === "fi")?.name || "—";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontWeight: "bold", typography: "h4" }}>
          Key Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingService(null);
            setModalOpen(true);
          }}
        >
          New Key Service
        </Button>
      </Box>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
          <TextField
            label="Search by name"
            size="small"
            sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" } }}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
            >
              <MenuItem value="">All Services</MenuItem>
              <MenuItem value="true">Active Only</MenuItem>
              <MenuItem value="false">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          <Stack sx={{ flexDirection: "row", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ height: 40, flex: 1 }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              sx={{ height: 40, flex: 1 }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  {/* 👇 Split into EN and FI columns */}
                  <TableCell>Name (English)</TableCell>
                  <TableCell>Name (Finnish)</TableCell>
                  <TableCell align="right">Display Order</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    {/* 👇 Updated colSpan to 6 */}
                    <TableCell colSpan={6} align="center">
                      No key services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>{service.id}</TableCell>
                      
                      {/* 👇 Render EN and FI side-by-side */}
                      <TableCell>
                        <Typography sx={{ }}>
                          {getServiceNameEN(service)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography >
                          {getServiceNameFI(service)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">{service.displayOrder}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={service.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={service.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setEditingService(service);
                            setModalOpen(true);
                          }}
                        >
                          <EditIcon />
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
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[6, 12, 24, 48]}
          />
        </Paper>
      )}

      <KeyServiceFormModal
        key={editingService ? editingService.id : "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        serviceToEdit={editingService}
      />
    </Box>
  );
}