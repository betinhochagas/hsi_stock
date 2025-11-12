// Enums from backend
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum AssetStatus {
  EM_ESTOQUE = 'EM_ESTOQUE',
  EM_USO = 'EM_USO',
  EM_MANUTENCAO = 'EM_MANUTENCAO',
  INATIVO = 'INATIVO',
  DESCARTADO = 'DESCARTADO',
}

export enum LicenseStatus {
  ATIVA = 'ATIVA',
  EXPIRADA = 'EXPIRADA',
  SUSPENSA = 'SUSPENSA',
}

export enum MovementType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  TRANSFER = 'TRANSFER',
  ASSIGNMENT = 'ASSIGNMENT',
  RETURN = 'RETURN',
}

// Entities
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  building: string | null;
  floor: string | null;
  room: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface Manufacturer {
  id: string;
  name: string;
  website: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  contactPerson: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  tag: string;
  name: string;
  description: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyEnd: string | null;
  status: AssetStatus;
  notes: string | null;
  categoryId: string;
  locationId: string;
  manufacturerId: string | null;
  supplierId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  location?: Location;
  manufacturer?: Manufacturer;
  supplier?: Supplier;
  _count?: {
    movements: number;
  };
}

export interface License {
  id: string;
  softwareName: string;
  version: string | null;
  licenseKey: string | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  totalSeats: number;
  usedSeats: number;
  cost: number | null;
  renewalCost: number | null;
  notes: string | null;
  status: LicenseStatus;
  manufacturerId: string | null;
  supplierId: string | null;
  createdAt: string;
  updatedAt: string;
  manufacturer?: Manufacturer;
  supplier?: Supplier;
  _count?: {
    assignments: number;
  };
}

export interface Movement {
  id: string;
  type: MovementType;
  assetId: string;
  fromLocationId: string;
  toLocation: string;
  userId: string | null;
  reason: string | null;
  ticketNumber: string | null;
  movedBy: string | null;
  movedAt: string;
  createdAt: string;
  asset?: Asset;
  fromLocation?: Location;
  user?: User;
}

// API Response types
export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface DashboardStats {
  totalAssets: number;
  assetsByStatus: Record<AssetStatus, number>;
  totalLicenses: number;
  expiringLicenses: number;
  recentMovements: number;
}
