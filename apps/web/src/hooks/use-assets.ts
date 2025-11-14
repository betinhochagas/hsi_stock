import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Asset } from '@/types'
import { AssetFormData } from '@/lib/validations'

interface AssetsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoryId?: string
  locationId?: string
}

interface AssetsResponse {
  items: Asset[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useAssets(params?: AssetsParams) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: async () => {
      const response = await api.get<{
        data: Asset[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>('/assets', { params })
      
      return {
        items: response.data.data,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
      } as AssetsResponse
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response = await api.get<Asset>(`/assets/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AssetFormData) => {
      const response = await api.post<Asset>('/assets', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateAsset(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<AssetFormData>) => {
      const response = await api.put<Asset>(`/assets/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
