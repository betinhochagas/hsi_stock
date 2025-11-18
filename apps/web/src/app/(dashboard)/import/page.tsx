'use client'

import { Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportWizard } from '@/components/import/import-wizard'

export default function ImportPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Importar CSV</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Importe dados de ativos a partir de arquivos CSV
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Wizard de Importação
          </CardTitle>
          <CardDescription>
            Siga os passos para validar e importar seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportWizard />
        </CardContent>
      </Card>
    </div>
  )
}
