'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Movement } from '@/types/entities';
import type { MovementFormData } from '@/lib/validations';

interface MovementsResponse {
  data: Movement[];
  pagination: {
    total: number;
    skip: number;
    take: number;
  };
}

interface MovementsParams {
  take?: number;
  skip?: number;
  type?: string;
  assetId?: string;
}

export function useMovements(params?: MovementsParams) {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: async () => {
      const response = await api.get<MovementsResponse>('/movements', { params });
      return {
        items: response.data.data,
        total: response.data.pagination.total,
        skip: response.data.pagination.skip,
        take: response.data.pagination.take,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useRecentMovements(limit: number = 10) {
  return useMovements({ take: limit, skip: 0 });
}

export function useMovement(id: string) {
  return useQuery({
    queryKey: ['movement', id],
    queryFn: async () => {
      const response = await api.get<Movement>(`/movements/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MovementFormData) => {
      const response = await api.post<Movement>('/movements', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/movements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

