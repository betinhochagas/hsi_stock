'use client'

import { FileKey, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LicensesPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Licenças</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gerencie licenças de software e assentos
          </p>
        </div>
        <Button className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Nova Licença
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
            <FileKey className="h-5 w-5" />
            Gerenciamento de Licenças
          </CardTitle>
          <CardDescription className="text-sm">
            Controle licenças ativas, assentos disponíveis e renovações
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 lg:py-12">
          <div className="text-center space-y-3 lg:space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileKey className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold">Funcionalidade em desenvolvimento</h3>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1 px-4">
                O gerenciamento completo de licenças será implementado em breve
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Sprint 6 - Licenses & Settings (6h estimadas)
              </p>
            </div>
            <Button variant="outline" className="mt-4 touch-manipulation">
              Ver Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
