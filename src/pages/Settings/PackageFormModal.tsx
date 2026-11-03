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
  Typography,
  Divider,
  IconButton,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import type { AdminPackageResponseDto, PackageUpsertPayload } from "../../types/package";
import { createPackage, updatePackage } from "../../api/packages";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  packageToEdit: AdminPackageResponseDto | null;
}

const EMPTY_FORM: PackageUpsertPayload = {
  ratePerHour: 0,
  isPopular: false,
  displayOrder: 0,
  isActive: true,
  translations: [
    { languageCode: "en", title: "", priceDisplay: "", unit: "", description: "" },
    { languageCode: "fi", title: "", priceDisplay: "", unit: "", description: "" },
  ],
  features: [],
};

export default function PackageFormModal({ open, onClose, onSaved, packageToEdit }: Props) {
  // 👇 Initialize state directly from props! No effect needed.
  const [formData, setFormData] = useState<PackageUpsertPayload>(() => {
    if (!packageToEdit) return EMPTY_FORM;
    
    return {
      ratePerHour: packageToEdit.ratePerHour,
      isPopular: packageToEdit.isPopular,
      displayOrder: packageToEdit.displayOrder,
      isActive: packageToEdit.isActive,
      translations: packageToEdit.translations.map(t => ({
        languageCode: t.languageCode,
        title: t.title,
        priceDisplay: t.priceDisplay,
        unit: t.unit,
        description: t.description,
      })),
      features: packageToEdit.features.map(f => ({
        displayOrder: f.displayOrder,
        translations: f.translations.map(ft => ({
          languageCode: ft.languageCode,
          text: ft.text,
        })),
      })),
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      if (packageToEdit) {
        await updatePackage(packageToEdit.id, formData);
      } else {
        await createPackage(formData);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PackageUpsertPayload, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newTranslations = [...prev.translations];
      newTranslations[index] = { ...newTranslations[index], [field]: value };
      return { ...prev, translations: newTranslations };
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [
        ...prev.features,
        {
          displayOrder: prev.features.length,
          translations: [
            { languageCode: "en", text: "" },
            { languageCode: "fi", text: "" },
          ],
        },
      ],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (featIndex: number, lang: string, value: string) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      const feat = newFeatures[featIndex];
      const transIndex = feat.translations.findIndex(t => t.languageCode === lang);
      
      if (transIndex >= 0) {
        feat.translations[transIndex].text = value;
      }
      
      return { ...prev, features: newFeatures };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{packageToEdit ? "Edit Package" : "Create New Package"}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Rate / Hour"
              type="number"
              fullWidth
              size="small"
              value={formData.ratePerHour}
              onChange={(e) => updateField("ratePerHour", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              size="small"
              value={formData.displayOrder}
              onChange={(e) => updateField("displayOrder", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={formData.isActive} onChange={(e) => updateField("isActive", e.target.checked)} />}
              label="Active"
            />
            <FormControlLabel
              control={<Checkbox checked={formData.isPopular} onChange={(e) => updateField("isPopular", e.target.checked)} />}
              label="Popular"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Translations</Typography>
        {formData.translations.map((t, i) => (
          <Box key={t.languageCode} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold" }}>
              {t.languageCode.toUpperCase()}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Title" fullWidth size="small" value={t.title} onChange={(e) => updateTranslation(i, "title", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField label="Price Display" fullWidth size="small" value={t.priceDisplay} onChange={(e) => updateTranslation(i, "priceDisplay", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField label="Unit (e.g., /h)" fullWidth size="small" value={t.unit} onChange={(e) => updateTranslation(i, "unit", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Description" fullWidth size="small" multiline rows={2} value={t.description} onChange={(e) => updateTranslation(i, "description", e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Features</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addFeature} variant="outlined">
            Add Feature
          </Button>
        </Box>

        {formData.features.map((feat, fIndex) => (
          <Box key={fIndex} sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1, display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Feature Text (EN)"
                    fullWidth
                    size="small"
                    value={feat.translations.find(t => t.languageCode === "en")?.text || ""}
                    onChange={(e) => updateFeature(fIndex, "en", e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Feature Text (FI)"
                    fullWidth
                    size="small"
                    value={feat.translations.find(t => t.languageCode === "fi")?.text || ""}
                    onChange={(e) => updateFeature(fIndex, "fi", e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
            <IconButton color="error" onClick={() => removeFeature(fIndex)}>
              <DeleteIcon />
            </IconButton>
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