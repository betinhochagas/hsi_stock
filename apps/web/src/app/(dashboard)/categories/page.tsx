'use client'

import { useState } from 'react'
import { Folder, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
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
import { CategoryFormDialog } from '@/components/forms/category-form-dialog'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-metadata'
import { Category } from '@/types'

interface CategoryFormData {
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(editingCategory?.id || '')
  const deleteCategory = useDeleteCategory()

  const handleCreate = async (data: CategoryFormData) => {
    try {
      await createCategory.mutateAsync(data)
      toast.success('Categoria criada com sucesso!')
      setDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao criar categoria')
      throw error
    }
  }

  const handleEdit = async (data: CategoryFormData) => {
    if (!editingCategory) return
    
    try {
      await updateCategory.mutateAsync(data)
      toast.success('Categoria atualizada com sucesso!')
      setEditingCategory(null)
      setDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar categoria')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    
    try {
      await deleteCategory.mutateAsync(id)
      toast.success('Categoria excluída com sucesso!')
    } catch {
      toast.error('Erro ao excluir categoria')
    }
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.getValue('description') || '-'}
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
        const category = row.original

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
                  setEditingCategory(category)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(category.id)}
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Organize ativos por categorias personalizadas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setDialogOpen(true)
          }}
          className="w-full sm:w-auto touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Table or Empty State */}
      {categories.length === 0 && !isLoading ? (
        <EmptyState
          icon={Folder}
          title="Nenhuma categoria cadastrada"
          description="Comece criando sua primeira categoria para organizar os ativos"
          action={{
            label: 'Nova Categoria',
            onClick: () => {
              setEditingCategory(null)
              setDialogOpen(true)
            },
          }}
        />
      ) : (
        <DataTable columns={columns} data={categories} />
      )}

      {/* Form Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCategory(null)
        }}
        onSubmit={editingCategory ? handleEdit : handleCreate}
        defaultValues={editingCategory ? {
          name: editingCategory.name,
          description: editingCategory.description || undefined,
        } : undefined}
        isEdit={!!editingCategory}
      />
    </div>
  )
}
