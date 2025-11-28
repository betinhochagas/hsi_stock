import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Category, Location, Manufacturer, Supplier } from '@/types'

interface PaginatedResponse<T> {
  items?: T[]
  data?: T[]
  total?: number
  skip?: number
  take?: number
}

interface CategoryFormData {
  name: string
  description?: string
}

interface LocationFormData {
  name: string
  description?: string
  building?: string
  floor?: string
  room?: string
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Category>>('/categories')
      const data = response.data
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
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
    mutationFn: async (data: CategoryFormData) => {
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
      const response = await api.get<PaginatedResponse<Location>>('/locations')
      const data = response.data
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LocationFormData) => {
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
    mutationFn: async (data: LocationFormData) => {
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
      const response = await api.get<PaginatedResponse<Manufacturer>>('/manufacturers')
      const data = response.data
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
      const response = await api.get<PaginatedResponse<Supplier>>('/suppliers')
      const data = response.data
      return data.items || data.data || (Array.isArray(data) ? data : [])
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
  })
}
