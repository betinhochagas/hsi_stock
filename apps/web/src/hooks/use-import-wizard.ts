import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface UploadedFile {
  filePath: string
  filename: string
  size: number
}

export interface DetectionResult {
  encoding: string
  delimiter: string
  headers: string[]
  sample: Record<string, string>[]
  totalRows: number
  fileType?: string
  suggestedMappings?: ColumnMapping[]
  stats?: Record<string, any>
}

export interface ColumnMapping {
  csvColumn: string
  systemField: string
  confidence: number
}

export interface ValidationResult {
  isValid: boolean
  validRows: number
  errorRows: number
  warningRows: number
  errors: ValidationError[]
  stats: Record<string, any>
  preview?: Record<string, any>
}

export interface ValidationError {
  row: number
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
  jobId: string
  importLogId: string
  message: string
  status: string
}

export interface JobStatus {
  id: string
  filename: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  totalRows: number
  successRows: number
  errorRows: number
  stats?: {
    assetsCreated?: number
    assetsUpdated?: number
    movementsCreated?: number
  }
  errors?: any
  startedAt?: string
  completedAt?: string
  duration?: number
}

export function useImportWizard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)

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
      await detectFormat(response.data.filePath)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer upload do arquivo'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const detectFormat = async (filePath: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<DetectionResult>('/import/detect', {
        filePath,
        skipRows: 0,
      })
      setDetectionResult(response.data)
      
      // Initialize custom mappings with suggested ones
      const mappings: Record<string, string> = {}
      response.data.suggestedMappings?.forEach(m => {
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
    if (!uploadedFile || !detectionResult) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<ValidationResult>('/import/validate', {
        filePath: uploadedFile.filePath,
        fileType: detectionResult.fileType || 'generic',
        columnMapping: customMappings,
        config: {
          encoding: detectionResult.encoding,
          delimiter: detectionResult.delimiter,
          skipRows: 0,
        },
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
    if (!uploadedFile || !detectionResult) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<CommitResult>('/import/commit', {
        filePath: uploadedFile.filePath,
        fileType: detectionResult.fileType || 'generic',
        columnMapping: customMappings,
        config: {
          encoding: detectionResult.encoding,
          delimiter: detectionResult.delimiter,
          skipRows: 0,
          createMovements: true,
          isHSIInventario: detectionResult.fileType === 'hsi-inventario',
        },
      })

      setCurrentStep(4)
      toast.success(response.data.message)
      
      // Start polling job status
      startPolling(response.data.importLogId)
      
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

  const pollJobStatus = async (importLogId: string) => {
    try {
      const response = await api.get<JobStatus>(`/import/jobs/${importLogId}/status`)
      setJobStatus(response.data)
      
      // Stop polling if job is completed or failed
      if (response.data.status === 'COMPLETED' || response.data.status === 'FAILED') {
        setIsPolling(false)
        setIsLoading(false)
        
        if (response.data.status === 'COMPLETED') {
          toast.success('Importação concluída com sucesso!')
          // Redirect to dashboard or import history after a delay
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          setError('Falha na importação')
          toast.error('Falha na importação')
        }
      }
      
      return response.data
    } catch (err: any) {
      console.error('Erro ao consultar status do job:', err)
      // If 404, the job might have completed already - check one more time
      if (err.response?.status === 404) {
        setIsPolling(false)
        setIsLoading(false)
      }
      // Don't throw - keep polling unless it's 404
    }
  }

  const startPolling = (importLogId: string) => {
    setIsPolling(true)
    setIsLoading(true)
    
    // Check status immediately first
    pollJobStatus(importLogId)
    
    const interval = setInterval(async () => {
      const status = await pollJobStatus(importLogId)
      
      if (status && (status.status === 'COMPLETED' || status.status === 'FAILED')) {
        clearInterval(interval)
      }
    }, 1000) // Poll every 1 second for faster feedback
    
    // Store interval ID for cleanup
    return () => clearInterval(interval)
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
    setJobStatus(null)
    setIsPolling(false)
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
    jobStatus,
    isPolling,
    uploadFile,
    detectFormat,
    validateImport,
    commitImport,
    pollJobStatus,
    updateMapping,
    reset,
  }
}
