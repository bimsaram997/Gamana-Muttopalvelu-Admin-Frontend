import type { PagedResponse } from "../types/general";
import type { AdminKeyServiceResponseDto, KeyServiceQueryParameters, KeyServiceUpsertPayload } from "../types/key-services";
import { api } from "./axios";




export async function createKeyService(payload: KeyServiceUpsertPayload): Promise<number> {
  const response = await api.post<number>("/admin/key-services", payload);
  return response.data;
}

export async function updateKeyService(id: number, payload: KeyServiceUpsertPayload): Promise<number> {
  const response = await api.put<number>(`/admin/key-services/${id}`, payload);
  return response.data;
}

export async function getAllKeyServices(
  params?: KeyServiceQueryParameters,
  signal?: AbortSignal
): Promise<PagedResponse<AdminKeyServiceResponseDto>> {
  const response = await api.get<PagedResponse<AdminKeyServiceResponseDto>>("/admin/key-services/list", {
    params,
    signal,
  });
  return response.data;
}

