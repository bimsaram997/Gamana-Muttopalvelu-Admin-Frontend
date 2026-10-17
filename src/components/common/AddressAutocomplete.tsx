import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import {
  lookupAddress,
  getAddressLabel,
  type AddressFeature,
} from "../../api/address";
import type { AddressDto } from "../../types/booking";
import { useDebounce } from "../../hooks/useDebounce";

interface Props {
  label?: string;
  value: AddressDto;
  onChange: (next: AddressDto) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function AddressAutocomplete({
  label = "Search address",
  value,
  onChange,
  disabled = false,
  required = false,
}: Props) {
  // Local "user is typing" buffer. Null = show value.label.
  // Cleared when the user picks an option or clears the field.
  const [typedText, setTypedText] = useState<string | null>(null);

  const [options, setOptions] = useState<AddressFeature[]>([]);
  const [loading, setLoading] = useState(false);

  // Text shown in the input: user-typed buffer wins, else the address label.
  const displayText = typedText ?? value?.label ?? "";

  // Debounce the display text so we don't spam the API while typing
  const debouncedQuery = useDebounce(displayText, 400);

  // ---- Fetch options when the debounced query changes ----
  useEffect(() => {
    if (disabled) return;
    const q = debouncedQuery.trim();
    if (q.length <= 2) return;   // too short — leave current options alone

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const results = await lookupAddress(q, controller.signal);
        setOptions(results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        console.error("Address lookup failed:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery, disabled]);

  // ---- Handlers ----

  // Called when the user types in the input
  const handleInputChange = (text: string) => {
    setTypedText(text);
    // Clear options immediately when too short (safe — this is an event handler)
    if (text.trim().length <= 2) {
      setOptions([]);
    }
  };

  // Called when the user picks an option (or clears the field)
  const handleSelect = (
    _: React.SyntheticEvent,
    feature: string | AddressFeature | null
  ) => {
    // Case 1: cleared
    if (feature === null) {
      setTypedText(null);
      onChange({
        label: "",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        latitude: 0,
        longitude: 0,
        floor: value?.floor ?? 0,
        hasElevator: value?.hasElevator ?? false,
      });
      return;
    }

    // Case 2: free-typed a string (no option picked)
    if (typeof feature === "string") {
      setTypedText(null);
      return;
    }

    // Case 3: picked a real feature
    const p = feature.properties ?? {};
    const coords = feature.geometry?.coordinates ?? [0, 0];

    const next: AddressDto = {
      label: getAddressLabel(feature),
      street: p.street ?? feature.street ?? p.name ?? "",
      houseNumber:
        p.housenumber ?? p.houseNumber ?? feature.houseNumber ?? "",
      postalCode:
        p.postalcode ?? p.postalCode ?? feature.postalCode ?? "",
      city: p.locality ?? p.city ?? feature.city ?? "",
      latitude: coords[1] ?? p.latitude ?? feature.latitude ?? 0,
      longitude: coords[0] ?? p.longitude ?? feature.longitude ?? 0,
      floor: value?.floor ?? 0,
      hasElevator: value?.hasElevator ?? false,
    };

    setTypedText(null);
    onChange(next);
  };

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={options}
      loading={loading}
      value={null}
      inputValue={displayText}
      onInputChange={(_, text, reason) => {
        // Only react to user typing and clearing
        if (reason === "input" || reason === "clear") {
          handleInputChange(text);
        }
      }}
      onChange={handleSelect}
      getOptionLabel={(opt) =>
        typeof opt === "string" ? opt : getAddressLabel(opt)
      }
      isOptionEqualToValue={(a, b) =>
        getAddressLabel(a) === getAddressLabel(b)
      }
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          fullWidth
          slotProps={{
            ...params.slotProps,
            input: {
              ...(params.slotProps?.input ?? {}),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.slotProps?.input?.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}