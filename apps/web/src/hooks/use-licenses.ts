import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { License, LicenseStatus } from '@/types'

interface LicenseFormData {
  softwareName: string
  version?: string
  licenseKey?: string
  purchaseDate?: string
  expiryDate?: string
  totalSeats: number
  cost?: number
  renewalCost?: number
  notes?: string
  status: LicenseStatus
  manufacturerId?: string
  supplierId?: string
}

export function useLicenses() {
  return useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const { data } = await api.get<License[]>('/licenses')
      return data
    },
  })
}

export function useCreateLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LicenseFormData) => {
      const { data: license } = await api.post<License>('/licenses', data)
      return license
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    },
  })
}

export function useUpdateLicense(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LicenseFormData) => {
      const { data: license } = await api.patch<License>(`/licenses/${id}`, data)
      return license
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    },
  })
}

export function useDeleteLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/licenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    },
  })
}
