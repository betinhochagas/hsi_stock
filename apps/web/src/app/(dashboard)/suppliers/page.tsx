'use client'

import { useState } from 'react'
import { Package, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
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
import { SupplierFormDialog } from '@/components/forms/supplier-form-dialog'
import { 
  useSuppliers, 
  useCreateSupplier, 
  useUpdateSupplier, 
  useDeleteSupplier 
} from '@/hooks/use-metadata'
import { Supplier } from '@/types'
import { extractErrorMessage } from '@/lib/error-handler'

export default function SuppliersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  
  const { data: suppliers = [], isLoading } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier(editingSupplier?.id || '')
  const deleteSupplier = useDeleteSupplier()

  const handleCreate = async (data: any) => {
    try {
      await createSupplier.mutateAsync(data)
      toast.success('Fornecedor criado com sucesso!')
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao criar fornecedor')
      toast.error(message)
      throw error
    }
  }

  const handleEdit = async (data: any) => {
    if (!editingSupplier) return
    
    try {
      await updateSupplier.mutateAsync(data)
      toast.success('Fornecedor atualizado com sucesso!')
      setEditingSupplier(null)
      setDialogOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao atualizar fornecedor')
      toast.error(message)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return
    
    try {
      await deleteSupplier.mutateAsync(id)
      toast.success('Fornecedor excluído com sucesso!')
    } catch (error) {
      const message = extractErrorMessage(error, 'Erro ao excluir fornecedor')
      toast.error(message)
    }
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'contactName',
      header: 'Contato',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('contactName') || '-'}
        </div>
      ),
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
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('phone') || '-'}
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
        const supplier = row.original

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
                  setEditingSupplier(supplier)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(supplier.id)}
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
          <p className="text-muted-foreground">Carregando fornecedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie os fornecedores de equipamentos e serviços
          </p>
        </div>
        <Button onClick={() => {
          setEditingSupplier(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum fornecedor cadastrado"
          description="Comece criando seu primeiro fornecedor de equipamentos"
          action={{
            label: 'Novo Fornecedor',
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <DataTable columns={columns} data={suppliers} />
      )}

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingSupplier(null)
        }}
        supplier={editingSupplier}
        onSubmit={editingSupplier ? handleEdit : handleCreate}
      />
    </div>
  )
}
