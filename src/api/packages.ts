import { api } from "./axios";
import type { AdminPackageResponseDto, PackageQueryParams, PackageUpsertPayload } from "../types/package";
import type { PagedResponse } from "../types/general";

export async function getDropdownAllPackages(): Promise<AdminPackageResponseDto[]> {
  const response = await api.get<AdminPackageResponseDto[]>("/admin/packages/dropdown");
  return response.data;
}

// Small helper — get the English title of a package, or fallback
export function getPackageTitle(pkg: AdminPackageResponseDto, lang = "en"): string {
  const t = pkg.translations.find((x) => x.languageCode === lang);
  return t?.title ?? pkg.translations[0]?.title ?? `Package #${pkg.id}`;
}



export async function getAllPackages(
  params?: PackageQueryParams,
  signal?: AbortSignal
): Promise<PagedResponse<AdminPackageResponseDto>> {
  const response = await api.get<PagedResponse<AdminPackageResponseDto>>("/admin/packages", {
    params,
    signal,
  });
  return response.data;
}

export async function createPackage(payload: PackageUpsertPayload): Promise<number> {
  const response = await api.post<number>("/admin/packages", payload);
  return response.data; // Returns the new ID
}

// Update
export async function updatePackage(id: number, payload: PackageUpsertPayload): Promise<number> {
  const response = await api.put<number>(`/admin/packages/${id}`, payload);
  return response.data;
}