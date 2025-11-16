import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Category, Location, Manufacturer, Supplier } from '@/types'

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories')
      // API retorna { items: [], total, skip, take }
      const data = response.data as any
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
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
      const response = await api.get<Location[]>('/locations')
      // API retorna { items: [], total, skip, take }
      const data = response.data as any
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
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
      const response = await api.get<Manufacturer[]>('/manufacturers')
      // API retorna { items: [], total, skip, take }
      const data = response.data as any
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
  })
}

// Suppliers
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get<Supplier[]>('/suppliers')
      // API retorna { items: [], total, skip, take }
      const data = response.data as any
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
  })
}
