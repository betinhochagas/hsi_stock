'use client'

import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { useImportWizard } from '@/hooks/use-import-wizard'

interface DetectStepProps {
  wizard: ReturnType<typeof useImportWizard>
}

// Campos disponíveis para mapeamento
const SYSTEM_FIELDS = [
  { value: 'assetTag', label: 'Tag do Ativo' },
  { value: 'name', label: 'Nome' },
  { value: 'serialNumber', label: 'Número de Série' },
  { value: 'category', label: 'Categoria' },
  { value: 'manufacturer', label: 'Fabricante' },
  { value: 'model', label: 'Modelo' },
  { value: 'location', label: 'Localização' },
  { value: 'status', label: 'Status' },
  { value: 'condition', label: 'Condição' },
  { value: 'purchaseDate', label: 'Data de Compra' },
  { value: 'purchasePrice', label: 'Preço de Compra' },
  { value: 'warrantyEnd', label: 'Fim da Garantia' },
  { value: 'notes', label: 'Observações' },
  { value: 'ignore', label: '(Ignorar coluna)' },
]

export function DetectStep({ wizard }: DetectStepProps) {
  if (!wizard.detectionResult) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Detectando formato do arquivo...</p>
      </div>
    )
  }

  const { detectionResult } = wizard

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Detecção e Mapeamento</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise a detecção automática e configure o mapeamento das colunas
        </p>
      </div>

      {wizard.error && (
        <Alert variant="destructive">
          <AlertDescription>{wizard.error}</AlertDescription>
        </Alert>
      )}

      {/* File Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Arquivo</p>
          <p className="font-medium truncate">{detectionResult.filename}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Encoding</p>
          <p className="font-medium">{detectionResult.encoding}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Delimitador</p>
          <p className="font-medium">{detectionResult.delimiter === ',' ? 'Vírgula' : detectionResult.delimiter === ';' ? 'Ponto-e-vírgula' : 'Tab'}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de Linhas</p>
          <p className="font-medium">{detectionResult.stats.totalRows}</p>
        </div>
      </div>

      {/* File Type */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Tipo de arquivo detectado:</p>
          <Badge variant={detectionResult.fileType === 'hsi_inventario' ? 'default' : 'secondary'}>
            {detectionResult.fileType === 'hsi_inventario' ? 'HSI Inventário' : 'CSV Genérico'}
          </Badge>
        </div>
        {detectionResult.stats.estimatedDuration && (
          <p className="text-sm text-muted-foreground mt-1">
            Tempo estimado de importação: ~{detectionResult.stats.estimatedDuration}s
          </p>
        )}
      </div>

      {/* Column Mapping */}
      <div>
        <h3 className="text-lg font-medium mb-3">Mapeamento de Colunas</h3>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coluna do CSV</TableHead>
                <TableHead>Campo do Sistema</TableHead>
                <TableHead className="text-right">Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detectionResult.suggestedMappings.map((mapping) => (
                <TableRow key={mapping.csvColumn}>
                  <TableCell className="font-mono text-sm">{mapping.csvColumn}</TableCell>
                  <TableCell>
                    <Select
                      value={wizard.customMappings[mapping.csvColumn] || mapping.systemField}
                      onValueChange={(value) => wizard.updateMapping(mapping.csvColumn, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SYSTEM_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        mapping.confidence >= 0.8
                          ? 'default'
                          : mapping.confidence >= 0.5
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {Math.round(mapping.confidence * 100)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sample Preview */}
      <div>
        <h3 className="text-lg font-medium mb-3">Amostra dos Dados (5 linhas)</h3>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {detectionResult.headers.map((header) => (
                  <TableHead key={header} className="font-mono text-xs">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {detectionResult.sample.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {detectionResult.headers.map((header) => (
                    <TableCell key={header} className="text-xs max-w-[200px] truncate">
                      {row[header] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => wizard.reset()}
          disabled={wizard.isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={() => wizard.validateImport()}
          disabled={wizard.isLoading}
        >
          {wizard.isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Validando...
            </>
          ) : (
            <>
              Validar Dados
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
