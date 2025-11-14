'use client'

import { BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados sobre ativos e movimentações
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Centro de Relatórios
          </CardTitle>
          <CardDescription>
            Visualize e exporte relatórios personalizados em diversos formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Funcionalidade em desenvolvimento</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de relatórios será implementado no sprint final
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Sprint 7 - Polish & Extras (4h estimadas)
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Relatórios planejados:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Ativos por Status
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Movimentações por Período
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Licenças Expirando
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Valor Total por Categoria
                </span>
              </div>
            </div>
            <Button variant="outline" className="mt-4">
              Ver Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
