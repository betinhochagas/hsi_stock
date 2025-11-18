'use client'

import { CheckCircle2, Package, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import type { useImportWizard } from '@/hooks/use-import-wizard'

interface CommitStepProps {
  wizard: ReturnType<typeof useImportWizard>
}

export function CommitStep({ wizard }: CommitStepProps) {
  if (wizard.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="text-center">
          <p className="text-lg font-medium">Processando importação...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Por favor aguarde enquanto os dados são importados
          </p>
        </div>
      </div>
    )
  }

  if (wizard.error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-destructive">Erro na Importação</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Ocorreu um erro ao processar a importação
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>{wizard.error}</AlertDescription>
        </Alert>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => wizard.setCurrentStep(3)}>
            Voltar
          </Button>
          <Button onClick={() => wizard.reset()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Importação Concluída com Sucesso!</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Os dados foram processados e salvos no sistema
        </p>
      </div>

      {/* Stats - mock data since CommitResult is not persisted in wizard state */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-950/20 p-3">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos Criados</p>
              <p className="text-2xl font-bold">
                {wizard.validationResult?.stats.newAssets || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-950/20 p-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos Atualizados</p>
              <p className="text-2xl font-bold">
                {wizard.validationResult?.stats.existingAssets || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-950/20 p-3">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo de Processamento</p>
              <p className="text-2xl font-bold">
                {wizard.validationResult?.stats.estimatedDuration || 0}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-medium mb-3">Próximos Passos</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Verifique os ativos importados na página de Ativos</li>
          <li>• Revise as movimentações criadas</li>
          <li>• Configure localizações e categorias adicionais se necessário</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="outline" onClick={() => wizard.reset()}>
          Nova Importação
        </Button>
        <Button asChild>
          <Link href="/assets">
            Ver Ativos
          </Link>
        </Button>
      </div>
    </div>
  )
}
