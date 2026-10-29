import { useEffect, useState, Fragment } from "react";
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
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import { getAllPackages, getPackageTitle } from "../../api/packages";
import type { AdminPackageResponseDto } from "../../types/package";

export default function PackagesSettings() {
  // ---- Data State ----
  const [packages, setPackages] = useState<AdminPackageResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Filters & Pagination ----
  const [draftTitle, setDraftTitle] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  
  const [appliedTitle, setAppliedTitle] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(2);

  // ---- Expansion State ----
  const [expandedPkg, setExpandedPkg] = useState<number | null>(null);
  const [expandedFeat, setExpandedFeat] = useState<Record<string, boolean>>({});

  // ---- Fetch Data from Server ----
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

        const res = await getAllPackages(params, controller.signal);

        setPackages(res.data);
        setTotalCount(res.totalCount);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(err instanceof Error ? err.message : "Failed to load packages");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [appliedTitle, appliedStatus, page, pageSize]);

  // ---- Handlers ----
  const handleSearch = () => {
    setAppliedTitle(draftTitle);
    setAppliedStatus(draftStatus);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
    setExpandedPkg(null);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
    setExpandedPkg(null);
  };

  const togglePkgExpand = (id: number) => {
    setExpandedPkg(expandedPkg === id ? null : id);
  };

  const toggleFeatExpand = (pkgId: number, featId: number) => {
    const key = `${pkgId}-${featId}`;
    setExpandedFeat((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---- Render ----
  return (
    <Box>
      <Typography sx={{ fontWeight: "bold", mb: 3, typography: "h4" }}>
        Packages Settings
      </Typography>

      {/* Filters Bar */}
   {/* Filters Bar */}
     {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          sx={{ 
            flexDirection: { xs: "column", sm: "row" }, 
            gap: 2, 
            alignItems: "center" 
          }}
        >
          <TextField
            label="Search by title"
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
              <MenuItem value="">All Packages</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ height: 40, minWidth: 120, width: { xs: "100%", sm: "auto" } }}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      {/* Loading / Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Table */}
      {!loading && !error && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 50 }} />
                  <TableCell>ID</TableCell>
                  <TableCell>Title (English)</TableCell>
                  <TableCell align="right">Rate / Hour</TableCell>
                  <TableCell align="right">Features</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No packages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => {
                    const isExpanded = expandedPkg === pkg.id;
                    return (
                      <Fragment key={pkg.id}>
                        <TableRow 
                          hover 
                          onClick={() => togglePkgExpand(pkg.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>{pkg.id}</TableCell>
                          <TableCell>
                            <Stack sx={{ direction: "row", spacing: 1, alignItems: "center" }}>
                              <Typography sx={{ fontWeight: "bold" }}>
                                {getPackageTitle(pkg, "en")}
                              </Typography>
                              {pkg.isPopular && (
                                <Chip label="Popular" size="small" color="error" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{pkg.ratePerHour} €</TableCell>
                          <TableCell align="right">{pkg.features?.length || 0}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={pkg.isActive ? "Active" : "Inactive"}
                              size="small"
                              color={pkg.isActive ? "success" : "default"}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                                
                                <Typography sx={{ fontWeight: "bold", mb: 1, typography: "subtitle2" }}>
                                  Translations
                                </Typography>
                                <Stack sx={{ spacing: 1, mb: 3 }}>
                                  {pkg.translations.map((t) => (
                                    <Paper key={t.languageCode} variant="outlined" sx={{ p: 1.5 }}>
                                      <Typography sx={{ typography: "caption", color: "primary.main", fontWeight: "bold" }}>
                                        {t.languageCode.toUpperCase()}
                                      </Typography>
                                      <Typography sx={{ typography: "body2" }}><strong>Title:</strong> {t.title}</Typography>
                                      <Typography sx={{ typography: "body2" }}><strong>Price Display:</strong> {t.priceDisplay} {t.unit}</Typography>
                                      <Typography sx={{ typography: "body2", color: "text.secondary" }}>
                                        <strong>Desc:</strong> {t.description || "—"}
                                      </Typography>
                                    </Paper>
                                  ))}
                                </Stack>

                                <Typography sx={{ fontWeight: "bold", mb: 1, typography: "subtitle2" }}>
                                  Features ({pkg.features?.length || 0})
                                </Typography>
                                <List dense>
                                  {pkg.features?.map((feat) => {
                                    const featKey = `${pkg.id}-${feat.id}`;
                                    const isFeatOpen = !!expandedFeat[featKey];

                                    return (
                                      <Paper key={feat.id} variant="outlined" sx={{ mb: 1 }}>
                                        <ListItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFeatExpand(pkg.id, feat.id);
                                          }}
                                          sx={{ cursor: "pointer", bgcolor: "background.paper" }}
                                        >
                                          <ListItemText 
                                            primary={`Feature #${feat.id}`} 
                                            secondary={`Display Order: ${feat.displayOrder}`}
                                          />
                                          {isFeatOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItem>
                                        
                                        <Collapse in={isFeatOpen} timeout="auto" unmountOnExit>
                                          <Box sx={{ pl: 4, pr: 2, pb: 2, bgcolor: "grey.100" }}>
                                            {feat.translations.map((ft) => (
                                              <Box key={ft.languageCode} sx={{ display: "flex", gap: 2, py: 0.5 }}>
                                                <Typography sx={{ typography: "caption", color: "text.secondary", minWidth: 30 }}>
                                                  {ft.languageCode.toUpperCase()}:
                                                </Typography>
                                                <Typography sx={{ typography: "body2" }}>{ft.text}</Typography>
                                              </Box>
                                            ))}
                                          </Box>
                                        </Collapse>
                                      </Paper>
                                    );
                                  })}
                                </List>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })
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
    </Box>
  );
}