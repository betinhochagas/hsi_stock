import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Category, Location, Manufacturer, Supplier } from '@/types'

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<any>('/categories', {
        params: { take: 1000 } // Buscar todas as categorias
      })
      // API retorna { items: [], total, skip, take }
      const data = response.data
      return data?.items || data?.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<Category>('/categories', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<Category>(`/categories/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

// Locations
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await api.get<any>('/locations', {
        params: { take: 1000 } // Buscar todas as localizações
      })
      // API retorna { items: [], total, skip, take }
      const data = response.data
      return data?.items || data?.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<Location>('/locations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

export function useUpdateLocation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<Location>(`/locations/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/locations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

// Manufacturers
export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const response = await api.get<any>('/manufacturers', {
        params: { take: 1000 } // Buscar todos os fabricantes
      })
      // API retorna { items: [], total, skip, take }
      const data = response.data
      return data?.items || data?.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateManufacturer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<Manufacturer>('/manufacturers', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
    },
  })
}

export function useUpdateManufacturer(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<Manufacturer>(`/manufacturers/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
    },
  })
}

export function useDeleteManufacturer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/manufacturers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
    },
  })
}

// Suppliers
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get<any>('/suppliers', {
        params: { take: 1000 } // Buscar todos os fornecedores
      })
      // API retorna { items: [], total, skip, take }
      const data = response.data
      return data?.items || data?.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<Supplier>('/suppliers', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<Supplier>(`/suppliers/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}
