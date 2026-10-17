import { api } from "./axios";
import type { AdminPackage } from "../types/package";

export async function getAllPackages(): Promise<AdminPackage[]> {
  const response = await api.get<AdminPackage[]>("/admin/packages");
  return response.data;
}

// Small helper — get the English title of a package, or fallback
export function getPackageTitle(pkg: AdminPackage, lang = "en"): string {
  const t = pkg.translations.find((x) => x.languageCode === lang);
  return t?.title ?? pkg.translations[0]?.title ?? `Package #${pkg.id}`;
}