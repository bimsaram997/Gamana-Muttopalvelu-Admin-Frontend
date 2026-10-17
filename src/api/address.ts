import { api } from "./axios";

export interface AddressFeature {
  // Raw GeoJSON feature from your API
  properties?: {
    label?: string;
    street?: string;
    name?: string;
    housenumber?: string;
    houseNumber?: string;
    postalcode?: string;
    postalCode?: string;
    locality?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  geometry?: {
    coordinates?: [number, number]; // [lng, lat]
  };
  // Sometimes the API returns the address flat
  label?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Query the address lookup API.
 * Returns an array of features (handles both `{ features: [] }` and flat array).
 */
export async function lookupAddress(
  query: string,
  signal?: AbortSignal
): Promise<AddressFeature[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await api.get<any>("/Address/lookup", {
    params: { query },
    signal,
  });
  return res.data?.features ?? res.data ?? [];
}

/**
 * Extract the display label from a feature or a raw string.
 * Accepts string so it works with MUI's freeSolo Autocomplete.
 */
export function getAddressLabel(
  feature: AddressFeature | string | null | undefined
): string {
  if (feature == null) return "";
  if (typeof feature === "string") return feature;

  const p = feature.properties ?? {};
  return (
    (p.label as string) ??
    (feature.label as string) ??
    (p.name as string) ??
    (feature.street as string) ??
    ""
  );
}