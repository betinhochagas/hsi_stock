'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Package, MapPin, Factory, Calendar, DollarSign, FileText, X } from 'lucide-react'
import { Asset } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface AssetDetailsDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function AssetDetailsDialog({ asset, open, onOpenChange }: AssetDetailsDialogProps) {
  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-2xl">{asset.name}</DialogTitle>
              {asset.assetTag && (
                <DialogDescription className="text-base">
                  Patrimônio: {asset.assetTag}
                </DialogDescription>
              )}
            </div>
            <Badge variant={statusColors[asset.status] as any} className="ml-4">
              {statusLabels[asset.status]}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Informações Básicas</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-7">
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
              </div>
            </div>

            <Separator />

            {/* Localização e Fabricante */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Localização e Fabricante</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-7">
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
              </div>
            </div>

            {/* Informações Financeiras */}
            {(asset.purchasePrice || asset.purchaseDate || asset.warrantyUntil) && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Informações Financeiras</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-7">
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
                  </div>
                </div>
              </>
            )}

            {/* Observações */}
            {asset.notes && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Observações</h3>
                  </div>
                  <p className="text-sm pl-7 whitespace-pre-wrap">{asset.notes}</p>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Datas de Registro</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-7">
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
