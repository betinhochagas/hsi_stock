'use client'

import { useState } from 'react'
import { FileKey, Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react'
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
import { LicenseFormDialog } from '@/components/forms/license-form-dialog'
import { useLicenses, useCreateLicense, useUpdateLicense, useDeleteLicense } from '@/hooks/use-licenses'
import { License } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format, isPast } from 'date-fns'

const statusLabels: Record<string, string> = {
  ATIVA: 'Ativa',
  EXPIRADA: 'Expirada',
  CANCELADA: 'Cancelada',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ATIVA: 'default',
  EXPIRADA: 'destructive',
  CANCELADA: 'secondary',
}

export default function LicensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  
  const { data: licenses = [], isLoading } = useLicenses()
  const createLicense = useCreateLicense()
  const updateLicense = useUpdateLicense(editingLicense?.id || '')
  const deleteLicense = useDeleteLicense()

  const handleCreate = async (data: any) => {
    try {
      await createLicense.mutateAsync(data)
      toast.success('Licença criada com sucesso!')
      setDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao criar licença')
      throw error
    }
  }

  const handleEdit = async (data: any) => {
    if (!editingLicense) return
    
    try {
      await updateLicense.mutateAsync(data)
      toast.success('Licença atualizada com sucesso!')
      setEditingLicense(null)
      setDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar licença')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta licença?')) return
    
    try {
      await deleteLicense.mutateAsync(id)
      toast.success('Licença excluída com sucesso!')
    } catch {
      toast.error('Erro ao excluir licença')
    }
  }

  const columns: ColumnDef<License>[] = [
    {
      accessorKey: 'softwareName',
      header: 'Software',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('softwareName')}</div>
          {row.original.version && (
            <div className="text-xs text-muted-foreground">v{row.original.version}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'totalSeats',
      header: 'Assentos',
      cell: ({ row }) => {
        const total = row.original.totalSeats
        const used = row.original.usedSeats
        const percentage = (used / total) * 100
        const isHigh = percentage >= 90

        return (
          <div className="flex items-center gap-2">
            {isHigh && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <span className={isHigh ? 'text-destructive font-medium' : ''}>
              {used}/{total}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Validade',
      cell: ({ row }) => {
        const expiryDate = row.getValue('expiryDate') as string | null
        if (!expiryDate) return <span className="text-muted-foreground">-</span>

        const isExpired = isPast(new Date(expiryDate))
        return (
          <span className={isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}>
            {format(new Date(expiryDate), 'dd/MM/yyyy')}
          </span>
        )
      },
    },
    {
      accessorKey: 'cost',
      header: 'Custo',
      cell: ({ row }) => {
        const cost = row.getValue('cost') as number | null
        return cost ? formatCurrency(cost) : <span className="text-muted-foreground">-</span>
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
      id: 'actions',
      cell: ({ row }) => {
        const license = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingLicense(license)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(license.id)}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Licenças</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gerencie licenças de software e assentos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLicense(null)
            setDialogOpen(true)
          }}
          className="w-full sm:w-auto touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Licença
        </Button>
      </div>

      {/* Table or Empty State */}
      {licenses.length === 0 && !isLoading ? (
        <EmptyState
          icon={FileKey}
          title="Nenhuma licença cadastrada"
          description="Comece criando sua primeira licença para controlar assentos e renovações"
          action={{
            label: 'Nova Licença',
            onClick: () => {
              setEditingLicense(null)
              setDialogOpen(true)
            },
          }}
        />
      ) : (
        <DataTable columns={columns} data={licenses} />
      )}

      {/* Form Dialog */}
      <LicenseFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingLicense(null)
        }}
        onSubmit={editingLicense ? handleEdit : handleCreate}
        defaultValues={editingLicense ? {
          name: editingLicense.softwareName,
          licenseKey: editingLicense.licenseKey || undefined,
          totalSeats: editingLicense.totalSeats,
          purchaseDate: editingLicense.purchaseDate || undefined,
          expirationDate: editingLicense.expiryDate || undefined,
          cost: editingLicense.cost || undefined,
          vendor: editingLicense.manufacturer?.name || undefined,
          notes: editingLicense.notes || undefined,
          status: editingLicense.status as 'ATIVA' | 'EXPIRADA' | 'CANCELADA',
        } : undefined}
        isEdit={!!editingLicense}
      />
    </div>
  )
}
