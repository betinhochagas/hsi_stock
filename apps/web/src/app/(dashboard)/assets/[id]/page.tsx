'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Package, MapPin, Factory, Calendar, DollarSign, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAsset, useDeleteAsset } from '@/hooks/use-assets'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusLabels: Record<string, string> = {
  EM_ESTOQUE: 'Disponível',
  EM_USO: 'Em Uso',
  EM_MANUTENCAO: 'Manutenção',
  INATIVO: 'Inativo',
  DESCARTADO: 'Descartado',
}

const statusColors: Record<string, string> = {
  EM_ESTOQUE: 'default',
  EM_USO: 'secondary',
  EM_MANUTENCAO: 'warning',
  INATIVO: 'destructive',
  DESCARTADO: 'outline',
}

export default function AssetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  const { data: asset, isLoading } = useAsset(assetId)
  const deleteAsset = useDeleteAsset()

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return

    try {
      await deleteAsset.mutateAsync(assetId)
      toast.success('Ativo excluído com sucesso!')
      router.push('/assets')
    } catch (error) {
      toast.error('Erro ao excluir ativo')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Ativo não encontrado</h2>
        <Button onClick={() => router.push('/assets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Ativos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/assets')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {asset.name}
              </h1>
              {asset.assetTag && (
                <p className="text-sm text-muted-foreground">
                  Patrimônio: {asset.assetTag}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/assets?edit=${assetId}`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAsset.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Separator />

      {/* Status Badge */}
      <div>
        <Badge variant={statusColors[asset.status] as any}>
          {statusLabels[asset.status]}
        </Badge>
      </div>

      {/* Main Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.serialNumber && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Série</p>
                <p className="text-sm">{asset.serialNumber}</p>
              </div>
            )}
            {asset.model && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                <p className="text-sm">{asset.model}</p>
              </div>
            )}
            {asset.category && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                <p className="text-sm">{asset.category.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Localização e Fabricante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização e Fabricante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Localização</p>
                <p className="text-sm">{asset.location.name}</p>
              </div>
            )}
            {asset.manufacturer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fabricante</p>
                <p className="text-sm">{asset.manufacturer.name}</p>
              </div>
            )}
            {asset.supplier && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                <p className="text-sm">{asset.supplier.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.purchasePrice && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preço de Compra</p>
                <p className="text-sm font-semibold">{formatCurrency(asset.purchasePrice)}</p>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Compra</p>
                <p className="text-sm">
                  {format(new Date(asset.purchaseDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
            {asset.warrantyUntil && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Garantia até</p>
                <p className="text-sm">
                  {format(new Date(asset.warrantyUntil), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {asset.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Datas de Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Criado em</p>
            <p className="text-sm">
              {format(new Date(asset.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
            <p className="text-sm">
              {format(new Date(asset.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
