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
  // add the id/order fields your DTO has — this is a partial
  translations: FeatureTranslation[];
}

export interface AdminPackage {
  id: number;
  ratePerHour: number;
  isPopular: boolean;
  displayOrder: number;
  isActive: boolean;
  translations: PackageTranslation[];
  features: AdminFeature[];
}