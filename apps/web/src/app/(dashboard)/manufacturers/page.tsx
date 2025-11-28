'use client'

import { useState } from 'react'
import { Factory, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
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
import { ManufacturerFormDialog } from '@/components/forms/manufacturer-form-dialog'
import { 
  useManufacturers, 
  useCreateManufacturer, 
  useUpdateManufacturer, 
  useDeleteManufacturer 
} from '@/hooks/use-metadata'
import { Manufacturer } from '@/types'
import { extractErrorMessage } from '@/lib/error-handler'

export default function ManufacturersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null)
  
  const { data: manufacturers = [], isLoading } = useManufacturers()
  const createManufacturer = useCreateManufacturer()
  const updateManufacturer = useUpdateManufacturer(editingManufacturer?.id || '')
  const deleteManufacturer = useDeleteManufacturer()

  const handleCreate = async (data: any) => {
    try {
      await createManufacturer.mutateAsync(data)
      toast.success('Fabricante criado com sucesso!')
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao criar fabricante')
      toast.error(message)
      throw error
    }
  }

  const handleEdit = async (data: any) => {
    if (!editingManufacturer) return
    
    try {
      await updateManufacturer.mutateAsync(data)
      toast.success('Fabricante atualizado com sucesso!')
      setEditingManufacturer(null)
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao atualizar fabricante')
      toast.error(message)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fabricante?')) return
    
    try {
      await deleteManufacturer.mutateAsync(id)
      toast.success('Fabricante excluído com sucesso!')
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao excluir fabricante')
      toast.error(message)
    }
  }

  const columns: ColumnDef<Manufacturer>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'website',
      header: 'Website',
      cell: ({ row }) => {
        const website = row.getValue('website') as string
        return website ? (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {website}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'contactEmail',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('contactEmail') || '-'}
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
        const manufacturer = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingManufacturer(manufacturer)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(manufacturer.id)}
                className="text-destructive"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando fabricantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fabricantes</h1>
          <p className="text-muted-foreground">
            Gerencie os fabricantes de equipamentos e dispositivos
          </p>
        </div>
        <Button onClick={() => {
          setEditingManufacturer(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fabricante
        </Button>
      </div>

      {manufacturers.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="Nenhum fabricante cadastrado"
          description="Comece criando seu primeiro fabricante de equipamentos"
          action={{
            label: 'Novo Fabricante',
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <DataTable columns={columns} data={manufacturers} />
      )}

      <ManufacturerFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingManufacturer(null)
        }}
        manufacturer={editingManufacturer}
        onSubmit={editingManufacturer ? handleEdit : handleCreate}
      />
    </div>
  )
}
