export interface Property {
  reference: string;
  price: number;
  priceMax?: number;
  currency: string;
  location: string;
  province: string;
  bedrooms: number;
  bedroomsMax?: number;
  bathrooms: number;
  bathroomsMax?: number;
  builtArea: number;
  builtAreaMax?: number;
  plotArea?: number;
  plotAreaMax?: number;
  propertyType: string;
  mainImage: string;
  images: string[];
  description: string;
  features: string[];
  pool?: string;
  garden?: string;
  parking?: string;
  orientation?: string;
  views?: string;
  
  // Additional size measurements (for new developments)
  interiorSize?: number;
  interiorSizeMax?: number;
  terraceSize?: number;
  terraceSizeMax?: number;
  totalSize?: number;
  totalSizeMax?: number;
  
  // Development info
  developmentName?: string;
  newDevelopment?: boolean;
  status?: string;
  
  // Construction details
  completionDate?: string;
  buildingLicense?: string;
  
  // Energy certificates
  energyRating?: string;
  co2Rating?: string;
  
  // Associated costs
  communityFees?: number;
  ibi?: number;
  garbageTax?: number;
  
  // Payment terms
  reservationAmount?: number;
  vatPercentage?: number;
  
  // Grouped features by category
  featureCategories?: Record<string, string[]>;
}

export interface PropertySearchParams {
  reference?: string;
  location?: string;
  sublocation?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  transactionType?: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  newDevs?: 'only' | 'resales' | 'all' | '';
  page?: number;
  limit?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}
