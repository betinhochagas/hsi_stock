import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface UploadedFile {
  filename: string
  size: number
  path: string
}

export interface DetectionResult {
  filename: string
  encoding: string
  delimiter: string
  hasHeader: boolean
  headers: string[]
  fileType: 'hsi_inventario' | 'generic'
  sample: Record<string, string>[]
  suggestedMappings: ColumnMapping[]
  stats: {
    totalRows: number
    emptyRows: number
    estimatedDuration: number
    inconsistentColumns: boolean
  }
}

export interface ColumnMapping {
  csvColumn: string
  systemField: string
  confidence: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  preview: {
    assetsToCreate: AssetPreview[]
    assetsToUpdate: AssetPreview[]
  }
  stats: {
    totalRows: number
    validRows: number
    invalidRows: number
    newAssets: number
    existingAssets: number
    newLocations: number
    newManufacturers: number
    estimatedDuration: number
  }
}

export interface ValidationError {
  line: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface AssetPreview {
  assetTag: string
  name: string
  category?: string
  location?: string
  status?: string
}

export interface CommitResult {
  success: boolean
  message: string
  stats: {
    assetsCreated: number
    assetsUpdated: number
    movementsCreated: number
    duration: number
  }
}

export function useImportWizard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<UploadedFile>('/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadedFile(response.data)
      setCurrentStep(2)
      
      // Auto-detect format
      await detectFormat(response.data.filename)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer upload do arquivo'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const detectFormat = async (filename: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<DetectionResult>(`/import/detect/${filename}`)
      setDetectionResult(response.data)
      
      // Initialize custom mappings with suggested ones
      const mappings: Record<string, string> = {}
      response.data.suggestedMappings.forEach(m => {
        mappings[m.csvColumn] = m.systemField
      })
      setCustomMappings(mappings)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao detectar formato do arquivo'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const validateImport = async () => {
    if (!uploadedFile) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<ValidationResult>('/import/validate', {
        filename: uploadedFile.filename,
        mappings: customMappings,
      })

      setValidationResult(response.data)
      setCurrentStep(3)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao validar importação'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const commitImport = async () => {
    if (!uploadedFile) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<CommitResult>('/import/commit', {
        filename: uploadedFile.filename,
        mappings: customMappings,
      })

      setCurrentStep(4)
      toast.success(response.data.message)
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao executar importação'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateMapping = (csvColumn: string, systemField: string) => {
    setCustomMappings(prev => ({
      ...prev,
      [csvColumn]: systemField,
    }))
  }

  const reset = () => {
    setCurrentStep(1)
    setUploadedFile(null)
    setDetectionResult(null)
    setValidationResult(null)
    setCustomMappings({})
    setError(null)
  }

  return {
    currentStep,
    setCurrentStep,
    uploadedFile,
    detectionResult,
    validationResult,
    customMappings,
    isLoading,
    error,
    uploadFile,
    detectFormat,
    validateImport,
    commitImport,
    updateMapping,
    reset,
  }
}
