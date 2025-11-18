'use client'

import { useCallback } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { useImportWizard } from '@/hooks/use-import-wizard'

interface UploadStepProps {
  wizard: ReturnType<typeof useImportWizard>
}

export function UploadStep({ wizard }: UploadStepProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      await wizard.uploadFile(file)
    },
    [wizard]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled: wizard.isLoading,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload do Arquivo CSV</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione ou arraste um arquivo CSV para começar a importação
        </p>
      </div>

      {wizard.error && (
        <Alert variant="destructive">
          <AlertDescription>{wizard.error}</AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}
          ${wizard.isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {wizard.isLoading ? (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div>
                <p className="text-lg font-medium">Enviando arquivo...</p>
                <p className="text-sm text-muted-foreground">Por favor aguarde</p>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-primary" />
              <div>
                <p className="text-lg font-medium">Solte o arquivo aqui</p>
                <p className="text-sm text-muted-foreground">O arquivo será processado automaticamente</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Arraste um arquivo CSV aqui</p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
              </div>
              <Button type="button" variant="outline" disabled={wizard.isLoading}>
                Selecionar Arquivo
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="text-sm font-medium mb-2">Formatos aceitos:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Arquivo CSV (separado por vírgula, ponto-e-vírgula ou tab)</li>
          <li>• Encoding: UTF-8, Latin-1, ou Windows-1252</li>
          <li>• Primeira linha deve conter os cabeçalhos das colunas</li>
          <li>• Tamanho máximo: 10 MB</li>
        </ul>
      </div>
    </div>
  )
}
