'use client'

import { useState } from 'react'
import { Package, Plus, Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { AssetFormDialog } from '@/components/forms/asset-form-dialog'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/use-assets'
import { Asset } from '@/types'
import { formatCurrency } from '@/lib/utils'
import type { AssetFormData } from '@/lib/validations'

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Disponível',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Inativo',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  IN_USE: 'secondary',
  MAINTENANCE: 'outline',
  RETIRED: 'destructive',
}

export default function AssetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  
  const { data, isLoading } = useAssets()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset(editingAsset?.id || '')
  const deleteAsset = useDeleteAsset()

  const handleCreate = async (data: AssetFormData) => {
    try {
      await createAsset.mutateAsync(data)
      toast.success('Ativo criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar ativo')
      throw error
    }
  }

  const handleEdit = async (data: AssetFormData) => {
    if (!editingAsset) return
    
    try {
      await updateAsset.mutateAsync(data)
      toast.success('Ativo atualizado com sucesso!')
      setEditingAsset(null)
    } catch (error) {
      toast.error('Erro ao atualizar ativo')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return
    
    try {
      await deleteAsset.mutateAsync(id)
      toast.success('Ativo excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir ativo')
    }
  }

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'tag',
      header: 'Tag',
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.getValue('tag')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => {
        const category = row.original.category
        return category?.name || '-'
      },
    },
    {
      accessorKey: 'location',
      header: 'Localização',
      cell: ({ row }) => {
        const location = row.original.location
        return location?.name || '-'
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={statusVariants[status] || 'default'}>
            {statusLabels[status] || status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Valor',
      cell: ({ row }) => {
        const price = row.getValue('purchasePrice') as number | null
        return price ? formatCurrency(price) : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const asset = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 touch-manipulation">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem className="touch-manipulation">
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingAsset(asset)
                  setDialogOpen(true)
                }}
                className="touch-manipulation"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive touch-manipulation"
                onClick={() => handleDelete(asset.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Ativos</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gerencie todos os ativos de TI do hospital
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingAsset(null)
            setDialogOpen(true)
          }}
          className="w-full sm:w-auto touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Ativo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando ativos...</div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum ativo cadastrado"
          description="Comece criando seu primeiro ativo de TI"
          action={{
            label: 'Criar Primeiro Ativo',
            onClick: () => {
              setEditingAsset(null)
              setDialogOpen(true)
            },
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          searchColumn="name"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <AssetFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingAsset(null)
        }}
        onSubmit={editingAsset ? handleEdit : handleCreate}
        defaultValues={editingAsset ? {
          name: editingAsset.name,
          assetTag: editingAsset.tag,
          serialNumber: editingAsset.serialNumber || '',
          categoryId: editingAsset.categoryId,
          manufacturerId: editingAsset.manufacturerId || '',
          model: editingAsset.model || '',
          purchaseDate: editingAsset.purchaseDate || '',
          purchasePrice: editingAsset.purchasePrice || undefined,
          warrantyEndDate: editingAsset.warrantyEnd || '',
          locationId: editingAsset.locationId || '',
          status: editingAsset.status,
          condition: 'GOOD',
          notes: editingAsset.notes || '',
        } : undefined}
        isEdit={!!editingAsset}
      />
    </div>
  )
}
