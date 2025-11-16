import { z } from 'zod'

// Asset validation schema
export const assetSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  assetTag: z.string()
    .min(3, 'Tag deve ter no mínimo 3 caracteres')
    .max(50, 'Tag deve ter no máximo 50 caracteres'),
  
  serialNumber: z.string()
    .max(100, 'Número de série deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  categoryId: z.string()
    .min(1, 'Categoria é obrigatória'),
  
  manufacturerId: z.string()
    .optional()
    .or(z.literal('')),
  
  model: z.string()
    .max(255, 'Modelo deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  
  purchaseDate: z.string()
    .optional()
    .or(z.literal('')),
  
  purchasePrice: z.coerce
    .number()
    .positive('Preço deve ser positivo')
    .optional()
    .or(z.literal('')),
  
  warrantyEndDate: z.string()
    .optional()
    .or(z.literal('')),
  
  locationId: z.string()
    .optional()
    .or(z.literal('')),
  
  assignedToId: z.string()
    .optional()
    .or(z.literal('')),
  
  status: z.enum(['EM_ESTOQUE', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO', 'DESCARTADO']),
  
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  
  notes: z.string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type AssetFormData = z.infer<typeof assetSchema>

// Movement validation schema
export const movementSchema = z.object({
  assetId: z.string()
    .uuid('Ativo inválido'),
  
  type: z.enum(['CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ASSIGNMENT', 'RETURN', 'MAINTENANCE', 'DISPOSAL']),
  
  fromLocationId: z.string()
    .uuid('Localização de origem inválida')
    .optional(),
  
  toLocationId: z.string()
    .uuid('Localização de destino inválida')
    .optional(),
  
  assignedToId: z.string()
    .uuid('Usuário inválido')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional(),
  
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)')
    .optional(),
})

export type MovementFormData = z.infer<typeof movementSchema>

// License validation schema
export const licenseSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  licenseKey: z.string()
    .min(5, 'Chave deve ter no mínimo 5 caracteres')
    .max(500, 'Chave deve ter no máximo 500 caracteres')
    .optional(),
  
  type: z.enum(['SOFTWARE', 'SERVICE', 'SUBSCRIPTION']),
  
  purchaseDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)'),
  
  expirationDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)')
    .optional(),
  
  cost: z.coerce
    .number()
    .positive('Custo deve ser positivo'),
  
  seats: z.coerce
    .number()
    .int('Assentos deve ser um número inteiro')
    .positive('Assentos deve ser positivo')
    .default(1),
  
  supplierId: z.string()
    .uuid('Fornecedor inválido')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional(),
})

export type LicenseFormData = z.infer<typeof licenseSchema>

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Location validation schema
export const locationSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  parentId: z.string()
    .uuid('Localização pai inválida')
    .optional(),
})

export type LocationFormData = z.infer<typeof locationSchema>

// User validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const userSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  email: z.string()
    .email('Email inválido'),
  
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional(),
  
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
  
  active: z.boolean()
    .default(true),
})

export type UserFormData = z.infer<typeof userSchema>
