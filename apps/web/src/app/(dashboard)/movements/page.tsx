'use client'

import { useState } from 'react'
import { ArrowUpDown, Plus, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { useMovements, useDeleteMovement } from '@/hooks/use-movements'
import { Movement } from '@/types'
import { formatDateTime } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  CHECK_IN: 'Entrada',
  CHECK_OUT: 'Saída',
  TRANSFER: 'Transferência',
  ASSIGNMENT: 'Atribuição',
  RETURN: 'Devolução',
}

const typeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CHECK_IN: 'default',
  CHECK_OUT: 'secondary',
  TRANSFER: 'outline',
  ASSIGNMENT: 'default',
  RETURN: 'secondary',
}

export default function MovementsPage() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const { data, isLoading, error, isError } = useMovements({ type: typeFilter })
  const deleteMovement = useDeleteMovement()

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return
    
    try {
      await deleteMovement.mutateAsync(id)
      toast.success('Movimentação excluída com sucesso!')
    } catch {
      toast.error('Erro ao excluir movimentação')
    }
  }

  const columns: ColumnDef<Movement>[] = [
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant={typeVariants[type] || 'default'}>
            {typeLabels[type] || type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'asset',
      header: 'Ativo',
      cell: ({ row }) => {
        const asset = row.original.asset
        return (
          <div>
            <div className="font-medium">{asset?.name || '-'}</div>
            {asset?.assetTag && (
              <div className="text-xs text-muted-foreground font-mono">
                {asset.assetTag}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'fromLocation',
      header: 'Origem',
      cell: ({ row }) => {
        const location = row.original.fromLocation
        return location?.name || '-'
      },
    },
    {
      accessorKey: 'toLocation',
      header: 'Destino',
      cell: ({ row }) => {
        return row.original.toLocation || '-'
      },
    },
    {
      accessorKey: 'user',
      header: 'Responsável',
      cell: ({ row }) => {
        const user = row.original.user
        return user?.name || row.original.movedBy || '-'
      },
    },
    {
      accessorKey: 'movedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return formatDateTime(row.getValue('movedAt'))
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const movement = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(movement.id)}
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Histórico de movimentações de ativos
          </p>
        </div>
        <Button className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <Button
          variant={typeFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter(undefined)}
          className="shrink-0 touch-manipulation"
        >
          Todos
        </Button>
        {Object.entries(typeLabels).map(([type, label]) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(type)}
            className="shrink-0 touch-manipulation"
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando movimentações...</div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">
          Erro ao carregar movimentações: {error?.message || 'Erro desconhecido'}
        </div>
      ) : !data || !data.items || data.items.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="Nenhuma movimentação registrada"
          description="As movimentações de ativos aparecerão aqui"
          action={{
            label: 'Nova Movimentação',
            onClick: () => {
              toast.info('Formulário de movimentação em breve!')
            },
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          searchColumn="asset"
          searchPlaceholder="Buscar por ativo..."
        />
      )}
    </div>
  )
}
