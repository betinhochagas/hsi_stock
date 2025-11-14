'use client'

import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Localizações</h1>
          <p className="text-muted-foreground">
            Gerencie salas, setores e locais físicos do hospital
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Localização
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gerenciamento de Localizações
          </CardTitle>
          <CardDescription>
            Configure os locais físicos onde os ativos estão alocados
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Funcionalidade em desenvolvimento</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A interface de gerenciamento de localizações será implementada em breve
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Sprint 6 - Settings (parte da carga de 6h)
              </p>
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
