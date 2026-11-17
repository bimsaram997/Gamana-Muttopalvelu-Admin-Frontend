export interface KeyServiceTranslationDto {
    languageCode: string;
    name: string;
}
export interface AdminKeyServiceResponseDto {
    id: number;
    displayOrder: number;
    isActive: boolean;
    translations: KeyServiceTranslationDto[];
}

export interface KeyServiceQueryParameters {
    title: string | null;
    status: string | null;
    pageNumber: number;
    pageSize: number;
}

export interface KeyServiceUpsertPayload {
  displayOrder: number;
  isActive: boolean;
  translations: KeyServiceTranslationDto[];
}