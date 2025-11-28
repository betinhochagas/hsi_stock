'use client'

import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { LocationFormDialog } from '@/components/forms/location-form-dialog'
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/use-metadata'
import { Location } from '@/types'
import { extractErrorMessage } from '@/lib/error-handler'

export default function LocationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  
  const { data: locations = [], isLoading } = useLocations()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation(editingLocation?.id || '')
  const deleteLocation = useDeleteLocation()

  const handleCreate = async (data: any) => {
    try {
      await createLocation.mutateAsync(data)
      toast.success('Localização criada com sucesso!')
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao criar localização')
      toast.error(message)
      throw error
    }
  }

  const handleEdit = async (data: any) => {
    if (!editingLocation) return
    
    try {
      await updateLocation.mutateAsync(data)
      toast.success('Localização atualizada com sucesso!')
      setEditingLocation(null)
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao atualizar localização')
      toast.error(message)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) return
    
    try {
      await deleteLocation.mutateAsync(id)
      toast.success('Localização excluída com sucesso!')
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao excluir localização')
      toast.error(message)
    }
  }

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'building',
      header: 'Prédio',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('building') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'floor',
      header: 'Andar',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('floor') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'room',
      header: 'Sala',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('room') || '-'}
        </div>
      ),
    },
    {
      accessorKey: '_count',
      header: 'Ativos',
      cell: ({ row }) => {
        const count = row.original._count?.assets || 0
        return <span className="text-muted-foreground">{count}</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const location = row.original

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
                  setEditingLocation(location)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(location.id)}
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Localizações</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gerencie salas, setores e locais físicos do hospital
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLocation(null)
            setDialogOpen(true)
          }}
          className="w-full sm:w-auto touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Localização
        </Button>
      </div>

      {/* Table or Empty State */}
      {locations.length === 0 && !isLoading ? (
        <EmptyState
          icon={MapPin}
          title="Nenhuma localização cadastrada"
          description="Comece criando sua primeira localização para organizar os ativos"
          action={{
            label: 'Nova Localização',
            onClick: () => {
              setEditingLocation(null)
              setDialogOpen(true)
            },
          }}
        />
      ) : (
        <DataTable columns={columns} data={locations} />
      )}

      {/* Form Dialog */}
      <LocationFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingLocation(null)
        }}
        onSubmit={editingLocation ? handleEdit : handleCreate}
        defaultValues={editingLocation ? {
          name: editingLocation.name,
          description: editingLocation.description || undefined,
          building: editingLocation.building || undefined,
          floor: editingLocation.floor || undefined,
          room: editingLocation.room || undefined,
        } : undefined}
        isEdit={!!editingLocation}
      />
    </div>
  )
}
