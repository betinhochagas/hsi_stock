import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Asset } from '@/types'
import { AssetFormData } from '@/lib/validations'
import { useAuthStore } from '@/store/auth-store'

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
        items: Asset[]
        total: number
        skip: number
        take: number
      }>('/assets', { params })
      
      return {
        items: response.data.items,
        total: response.data.total,
        page: Math.floor(response.data.skip / response.data.take) + 1,
        limit: response.data.take,
        totalPages: Math.ceil(response.data.total / response.data.take),
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
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (data: AssetFormData) => {
      // Limpar campos vazios e transformar em undefined
      const cleanData: any = {
        name: data.name,
        categoryId: data.categoryId,
        status: data.status,
        createdById: user?.id,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.assetTag && data.assetTag.trim()) cleanData.assetTag = data.assetTag
      if (data.serialNumber && data.serialNumber.trim()) cleanData.serialNumber = data.serialNumber
      if (data.model && data.model.trim()) cleanData.model = data.model
      if (data.observations && data.observations.trim()) cleanData.observations = data.observations
      
      // IDs opcionais
      if (data.locationId && data.locationId !== '') cleanData.locationId = data.locationId
      if (data.manufacturerId && data.manufacturerId !== '' && data.manufacturerId !== 'none') {
        cleanData.manufacturerId = data.manufacturerId
      }
      if (data.assignedToId && data.assignedToId !== '') cleanData.assignedToId = data.assignedToId
      
      // Datas e números
      if (data.purchaseDate) cleanData.purchaseDate = new Date(data.purchaseDate)
      if (data.purchasePrice !== undefined && data.purchasePrice !== '' && data.purchasePrice !== null) {
        const price = Number(data.purchasePrice)
        if (!isNaN(price) && price >= 0) cleanData.purchasePrice = price
      }
      if (data.warrantyUntil) cleanData.warrantyUntil = new Date(data.warrantyUntil)

      console.log('🔍 Payload enviado:', cleanData)
      
      const response = await api.post<Asset>('/assets', cleanData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssetFormData> }) => {
      // Limpar campos vazios e transformar em undefined
      const cleanData: any = {}

      // Adicionar campos apenas se existirem
      if (data.name) cleanData.name = data.name
      if (data.categoryId) cleanData.categoryId = data.categoryId
      if (data.status) cleanData.status = data.status
      
      // Campos opcionais
      if (data.assetTag !== undefined) {
        cleanData.assetTag = data.assetTag && data.assetTag.trim() ? data.assetTag : null
      }
      if (data.serialNumber !== undefined) {
        cleanData.serialNumber = data.serialNumber && data.serialNumber.trim() ? data.serialNumber : null
      }
      if (data.model !== undefined) {
        cleanData.model = data.model && data.model.trim() ? data.model : null
      }
      if (data.observations !== undefined) {
        cleanData.observations = data.observations && data.observations.trim() ? data.observations : null
      }
      
      // IDs opcionais
      if (data.locationId !== undefined) {
        cleanData.locationId = data.locationId && data.locationId !== '' ? data.locationId : null
      }
      if (data.manufacturerId !== undefined) {
        cleanData.manufacturerId = data.manufacturerId && data.manufacturerId !== '' && data.manufacturerId !== 'none' 
          ? data.manufacturerId 
          : null
      }
      
      // Datas
      if (data.purchaseDate !== undefined) {
        cleanData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null
      }
      if (data.warrantyUntil !== undefined) {
        cleanData.warrantyUntil = data.warrantyUntil ? new Date(data.warrantyUntil) : null
      }
      
      // Preço
      if (data.purchasePrice !== undefined) {
        if (data.purchasePrice === '' || data.purchasePrice === null) {
          cleanData.purchasePrice = null
        } else {
          const price = Number(data.purchasePrice)
          if (!isNaN(price) && price >= 0) cleanData.purchasePrice = price
        }
      }

      const response = await api.patch<Asset>(`/assets/${id}`, cleanData)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
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
