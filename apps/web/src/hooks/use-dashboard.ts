'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types/entities';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/assets/stats/dashboard');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Refetch a cada 5 minutos
    retry: 2,
  });
}

export function useStockByCategory() {
  return useQuery({
    queryKey: ['dashboard', 'stock-by-category'],
    queryFn: async () => {
      const response = await api.get('/assets', {
        params: { take: 10000 } // Buscar todos
      });
      
      // Agrupar por categoria
      const categoryMap = new Map<string, {
        categoryName: string
        categoryId: string
        inStock: number
        inUse: number
        total: number
      }>();

      response.data.items.forEach((asset: any) => {
        const categoryId = asset.categoryId || 'sem-categoria'
        const categoryName = asset.category?.name || 'Sem Categoria'
        
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            inStock: 0,
            inUse: 0,
            total: 0
          })
        }

        const category = categoryMap.get(categoryId)!
        category.total++
        
        if (asset.status === 'EM_ESTOQUE') {
          category.inStock++
        } else if (asset.status === 'EM_USO') {
          category.inUse++
        }
      })

      return Array.from(categoryMap.values())
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

