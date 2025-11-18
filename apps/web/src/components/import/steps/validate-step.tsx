'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { useImportWizard } from '@/hooks/use-import-wizard'

interface ValidateStepProps {
  wizard: ReturnType<typeof useImportWizard>
}

export function ValidateStep({ wizard }: ValidateStepProps) {
  const [errorFilter, setErrorFilter] = useState<'all' | 'error' | 'warning'>('all')

  if (!wizard.validationResult) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Validando dados...</p>
      </div>
    )
  }

  const { validationResult } = wizard

  const filteredErrors = validationResult.errors.filter((error) =>
    errorFilter === 'all' ? true : error.severity === errorFilter
  )

  const errorCount = validationResult.errors.filter((e) => e.severity === 'error').length
  const warningCount = validationResult.errors.filter((e) => e.severity === 'warning').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Validação dos Dados</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise os dados antes de confirmar a importação
        </p>
      </div>

      {wizard.error && (
        <Alert variant="destructive">
          <AlertDescription>{wizard.error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de Linhas</p>
          <p className="text-2xl font-bold">{validationResult.stats.totalRows}</p>
        </div>
        <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
          <p className="text-sm text-muted-foreground">Linhas Válidas</p>
          <p className="text-2xl font-bold text-green-600">{validationResult.stats.validRows}</p>
        </div>
        <div className="rounded-lg border bg-red-50 dark:bg-red-950/20 p-4">
          <p className="text-sm text-muted-foreground">Com Erros</p>
          <p className="text-2xl font-bold text-red-600">{validationResult.stats.invalidRows}</p>
        </div>
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-sm text-muted-foreground">Novos Ativos</p>
          <p className="text-2xl font-bold text-blue-600">{validationResult.stats.newAssets}</p>
        </div>
        <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
          <p className="text-sm text-muted-foreground">Atualizações</p>
          <p className="text-2xl font-bold text-amber-600">{validationResult.stats.existingAssets}</p>
        </div>
      </div>

      {/* Validation Status */}
      <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
        <div className="flex items-start gap-3">
          {validationResult.valid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {validationResult.valid
                ? 'Validação aprovada - pronto para importar!'
                : `Encontrados ${errorCount} erro(s) que precisam ser corrigidos`}
            </p>
            {warningCount > 0 && (
              <p className="text-sm mt-1">
                {warningCount} aviso(s) - pode prosseguir mas revise os dados
              </p>
            )}
          </div>
        </div>
      </Alert>

      {/* Tabs: Preview, Errors */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">
            Preview ({validationResult.preview.assetsToCreate.length + validationResult.preview.assetsToUpdate.length})
          </TabsTrigger>
          <TabsTrigger value="errors">
            Erros e Avisos ({validationResult.errors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4 mt-4">
          {validationResult.preview.assetsToCreate.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                Ativos a Criar ({validationResult.preview.assetsToCreate.length})
              </h3>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.preview.assetsToCreate.slice(0, 10).map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{asset.assetTag}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.category || '-'}</TableCell>
                        <TableCell>{asset.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="default">{asset.status || 'EM_ESTOQUE'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {validationResult.preview.assetsToCreate.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  ... e mais {validationResult.preview.assetsToCreate.length - 10} ativos
                </p>
              )}
            </div>
          )}

          {validationResult.preview.assetsToUpdate.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                Ativos a Atualizar ({validationResult.preview.assetsToUpdate.length})
              </h3>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.preview.assetsToUpdate.slice(0, 10).map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{asset.assetTag}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.category || '-'}</TableCell>
                        <TableCell>{asset.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{asset.status || 'EM_ESTOQUE'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {validationResult.preview.assetsToUpdate.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  ... e mais {validationResult.preview.assetsToUpdate.length - 10} ativos
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="errors" className="mt-4">
          {validationResult.errors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p>Nenhum erro ou aviso encontrado!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error Filter */}
              <div className="flex items-center gap-2">
                <Button
                  variant={errorFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setErrorFilter('all')}
                >
                  Todos ({validationResult.errors.length})
                </Button>
                <Button
                  variant={errorFilter === 'error' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setErrorFilter('error')}
                >
                  Erros ({errorCount})
                </Button>
                <Button
                  variant={errorFilter === 'warning' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setErrorFilter('warning')}
                >
                  Avisos ({warningCount})
                </Button>
              </div>

              {/* Error List */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Linha</TableHead>
                      <TableHead className="w-[120px]">Campo</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{error.line}</TableCell>
                        <TableCell className="font-mono text-sm">{error.field}</TableCell>
                        <TableCell>{error.message}</TableCell>
                        <TableCell>
                          <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                            {error.severity === 'error' ? (
                              <><XCircle className="h-3 w-3 mr-1" /> Erro</>
                            ) : (
                              <><AlertTriangle className="h-3 w-3 mr-1" /> Aviso</>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => wizard.setCurrentStep(2)}
          disabled={wizard.isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={() => wizard.commitImport()}
          disabled={wizard.isLoading || !validationResult.valid}
        >
          {wizard.isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Importando...
            </>
          ) : (
            <>
              Confirmar Importação
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
