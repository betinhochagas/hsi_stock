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
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { useManufacturers, useCreateManufacturer, useUpdateManufacturer, useDeleteManufacturer } from '@/hooks/use-metadata'
import { Manufacturer } from '@/types'

export default function ManufacturersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    website: '', 
    supportEmail: '', 
    supportPhone: '' 
  })
  
  const { data: manufacturers = [], isLoading } = useManufacturers()
  const createManufacturer = useCreateManufacturer()
  const updateManufacturer = useUpdateManufacturer(editingManufacturer?.id || '')
  const deleteManufacturer = useDeleteManufacturer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const submitData = {
        name: formData.name,
        website: formData.website || undefined,
        supportEmail: formData.supportEmail || undefined,
        supportPhone: formData.supportPhone || undefined,
      }
      if (editingManufacturer) {
        await updateManufacturer.mutateAsync(submitData)
        toast.success('Fabricante atualizado com sucesso!')
      } else {
        await createManufacturer.mutateAsync(submitData)
        toast.success('Fabricante criado com sucesso!')
      }
      setDialogOpen(false)
      setEditingManufacturer(null)
      setFormData({ name: '', website: '', supportEmail: '', supportPhone: '' })
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
      website: manufacturer.website || '',
      supportEmail: manufacturer.supportEmail || '',
      supportPhone: manufacturer.supportPhone || '',
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingManufacturer(null)
    setFormData({ name: '', website: '', supportEmail: '', supportPhone: '' })
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
      accessorKey: 'website',
      header: 'Website',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('website') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'supportEmail',
      header: 'E-mail Suporte',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('supportEmail') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'supportPhone',
      header: 'Telefone Suporte',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue('supportPhone') || '-'}
        </div>
      ),
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
          setFormData({ name: '', website: '', supportEmail: '', supportPhone: '' })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">E-mail Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    placeholder="suporte@fabricante.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supportPhone">Telefone Suporte</Label>
                  <Input
                    id="supportPhone"
                    value={formData.supportPhone}
                    onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
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
