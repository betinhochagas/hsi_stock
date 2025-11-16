import { useQuery } from '@tanstack/react-query'
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
