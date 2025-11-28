'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Supplier } from '@/types'

const supplierSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SupplierFormData) => Promise<void>
  supplier?: Supplier | null
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  onSubmit,
  supplier,
}: SupplierFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contactName: supplier.contactName || '',
        contactEmail: supplier.contactEmail || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      })
    } else {
      reset({
        name: '',
        contactName: '',
        contactEmail: '',
        phone: '',
        address: '',
        notes: '',
      })
    }
  }, [supplier, reset])

  const handleFormSubmit = async (data: SupplierFormData) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          <DialogDescription>
            {supplier ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor de equipamentos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              placeholder="Ex: Empresa XYZ Ltda"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do Contato</Label>
            <Input
              id="contactName"
              placeholder="Nome do representante"
              {...register('contactName')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contato@exemplo.com"
                {...register('contactEmail')}
                disabled={isSubmitting}
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 1234-5678"
                {...register('phone')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              placeholder="Endereço completo do fornecedor"
              rows={2}
              {...register('address')}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionais sobre o fornecedor"
              rows={3}
              {...register('notes')}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : supplier ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
