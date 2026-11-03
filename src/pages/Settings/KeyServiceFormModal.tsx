import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from "@mui/material";
import { createKeyService, updateKeyService } from "../../api/key-services";
import type { AdminKeyServiceResponseDto, KeyServiceUpsertPayload } from "../../types/key-services";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  serviceToEdit: AdminKeyServiceResponseDto | null;
}

const EMPTY_FORM: KeyServiceUpsertPayload = {
  displayOrder: 0,
  isActive: true,
  translations: [
    { languageCode: "en", name: "" },
    { languageCode: "fi", name: "" },
  ],
};

export default function KeyServiceFormModal({ open, onClose, onSaved, serviceToEdit }: Props) {
  const [formData, setFormData] = useState<KeyServiceUpsertPayload>(() => {
    if (!serviceToEdit) return EMPTY_FORM;
    return {
      displayOrder: serviceToEdit.displayOrder,
      isActive: serviceToEdit.isActive,
      translations: serviceToEdit.translations.map((t) => ({
        languageCode: t.languageCode,
        name: t.name,
      })),
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      if (serviceToEdit) {
        await updateKeyService(serviceToEdit.id, formData);
      } else {
        await createKeyService(formData);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof KeyServiceUpsertPayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (index: number, name: string) => {
    setFormData((prev) => {
      const newTranslations = [...prev.translations];
      newTranslations[index] = { ...newTranslations[index], name };
      return { ...prev, translations: newTranslations };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{serviceToEdit ? "Edit Key Service" : "Create Key Service"}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              size="small"
              value={formData.displayOrder}
              onChange={(e) => updateField("displayOrder", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Translations</Typography>
        {formData.translations.map((t, i) => (
          <Box key={t.languageCode} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold" }}>
              {t.languageCode.toUpperCase()}
            </Typography>
            <TextField
              label="Service Name"
              fullWidth
              size="small"
              value={t.name}
              onChange={(e) => updateTranslation(i, e.target.value)}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}