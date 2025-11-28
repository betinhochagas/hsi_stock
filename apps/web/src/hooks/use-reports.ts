import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardMetrics {
  overview: {
    totalAssets: number;
    totalValue: number;
    activeUsers: number;
    totalMovements: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
    value: number;
  }>;
  byLocation: Array<{
    location: string;
    count: number;
    percentage: number;
    value: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    month: string;
    acquisitions: number;
    movements: number;
    value: number;
  }>;
}

export interface AssetsByCategoryReport {
  categories: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    totalValue: number;
    averageValue: number;
  }>;
  total: number;
}

export interface AssetsByLocationReport {
  locations: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    totalValue: number;
    inUse: number;
    available: number;
  }>;
  total: number;
}

export interface LicensesExpiringReport {
  expiringSoon: Array<{
    id: string;
    name: string;
    expirationDate: string;
    daysUntilExpiry: number;
    totalSeats: number;
    usedSeats: number;
    cost: number;
    severity: 'critical' | 'warning' | 'info';
  }>;
  summary: {
    critical: number;
    warning: number;
    info: number;
    totalValue: number;
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['reports', 'dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get<DashboardMetrics>('/reports/dashboard-metrics');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAssetsByCategoryReport() {
  return useQuery({
    queryKey: ['reports', 'assets-by-category'],
    queryFn: async () => {
      const response = await api.get<AssetsByCategoryReport>('/reports/assets-by-category');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAssetsByLocationReport() {
  return useQuery({
    queryKey: ['reports', 'assets-by-location'],
    queryFn: async () => {
      const response = await api.get<AssetsByLocationReport>('/reports/assets-by-location');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLicensesExpiringReport(days: number = 90) {
  return useQuery({
    queryKey: ['reports', 'licenses-expiring', days],
    queryFn: async () => {
      const response = await api.get<LicensesExpiringReport>('/reports/licenses-expiring', {
        params: { days },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
