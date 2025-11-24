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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { useManufacturers, useCreateManufacturer, useUpdateManufacturer, useDeleteManufacturer } from '@/hooks/use-metadata'
import { Manufacturer } from '@/types'

export default function ManufacturersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  
  const { data: manufacturers = [], isLoading } = useManufacturers()
  const createManufacturer = useCreateManufacturer()
  const updateManufacturer = useUpdateManufacturer(editingManufacturer?.id || '')
  const deleteManufacturer = useDeleteManufacturer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingManufacturer) {
        await updateManufacturer.mutateAsync(formData)
        toast.success('Fabricante atualizado com sucesso!')
      } else {
        await createManufacturer.mutateAsync(formData)
        toast.success('Fabricante criado com sucesso!')
      }
      setDialogOpen(false)
      setEditingManufacturer(null)
      setFormData({ name: '', description: '' })
    } catch {
      toast.error(editingManufacturer ? 'Erro ao atualizar fabricante' : 'Erro ao criar fabricante')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fabricante?')) return
    
    try {
      await deleteManufacturer.mutateAsync(id)
      toast.success('Fabricante excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir fabricante')
    }
  }

  const openEditDialog = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer)
    setFormData({
      name: manufacturer.name,
      description: manufacturer.description || '',
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingManufacturer(null)
    setFormData({ name: '', description: '' })
    setDialogOpen(true)
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
              <DropdownMenuItem onClick={() => openEditDialog(manufacturer)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(manufacturer.id)}
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Fabricantes</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gerencie os fabricantes de ativos do sistema
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fabricante
        </Button>
      </div>

      {/* Table or Empty State */}
      {manufacturers.length === 0 && !isLoading ? (
        <EmptyState
          icon={Factory}
          title="Nenhum fabricante cadastrado"
          description="Comece criando seu primeiro fabricante para organizar os ativos"
          action={{
            label: 'Novo Fabricante',
            onClick: openCreateDialog,
          }}
        />
      ) : (
        <DataTable columns={columns} data={manufacturers} />
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setEditingManufacturer(null)
          setFormData({ name: '', description: '' })
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingManufacturer ? 'Editar Fabricante' : 'Novo Fabricante'}
            </DialogTitle>
            <DialogDescription>
              {editingManufacturer 
                ? 'Atualize as informações do fabricante abaixo.'
                : 'Preencha as informações do novo fabricante.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Dell, HP, Lenovo"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do fabricante"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createManufacturer.isPending || updateManufacturer.isPending}>
                {editingManufacturer ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
