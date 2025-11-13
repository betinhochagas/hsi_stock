'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Movement } from '@/types/entities';

interface MovementsResponse {
  items: Movement[];
  total: number;
  skip: number;
  take: number;
}

export function useRecentMovements(limit: number = 10) {
  return useQuery({
    queryKey: ['movements', 'recent', limit],
    queryFn: async () => {
      const response = await api.get<MovementsResponse>('/movements', {
        params: {
          take: limit,
          skip: 0,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
