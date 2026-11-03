export interface PackageTranslation {
  languageCode: string;
  title: string;
  priceDisplay: string;
  unit: string;
  description: string;
}

export interface FeatureTranslation {
  languageCode: string;
  text: string;
}

export interface AdminFeature {
  id: number;
  displayOrder: number;
  translations: FeatureTranslation[];
}

export interface AdminPackageResponseDto {
  id: number;
  ratePerHour: number;
  isPopular: boolean;
  displayOrder: number;
  isActive: boolean;
  translations: PackageTranslation[];
  features: AdminFeature[];
}

export interface PackageQueryParams {
  title?: string;
  status?: string;
 pageNumber?: number;
pageSize?: number;
}

// Matches C# AdminPackageUpsertDto
export interface PackageUpsertPayload {
  ratePerHour: number;
  isPopular: boolean;
  displayOrder: number;
  isActive: boolean;
  translations: {
    languageCode: string;
    title: string;
    priceDisplay: string;
    unit: string;
    description: string;
  }[];
  features: {
    displayOrder: number;
    translations: {
      languageCode: string;
      text: string;
    }[];
  }[];
}

