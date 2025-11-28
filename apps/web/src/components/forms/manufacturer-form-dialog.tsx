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
import { Manufacturer } from '@/types'

const manufacturerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
})

type ManufacturerFormData = z.infer<typeof manufacturerSchema>

interface ManufacturerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ManufacturerFormData) => Promise<void>
  manufacturer?: Manufacturer | null
}

export function ManufacturerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  manufacturer,
}: ManufacturerFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
  })

  useEffect(() => {
    if (manufacturer) {
      reset({
        name: manufacturer.name,
        website: manufacturer.website || '',
        contactEmail: manufacturer.contactEmail || '',
        contactPhone: manufacturer.contactPhone || '',
        address: manufacturer.address || '',
      })
    } else {
      reset({
        name: '',
        website: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
      })
    }
  }, [manufacturer, reset])

  const handleFormSubmit = async (data: ManufacturerFormData) => {
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
          <DialogTitle>{manufacturer ? 'Editar Fabricante' : 'Novo Fabricante'}</DialogTitle>
          <DialogDescription>
            {manufacturer ? 'Atualize as informações do fabricante' : 'Cadastre um novo fabricante de equipamentos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Dell, HP, Lenovo"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.exemplo.com"
              {...register('website')}
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contato</Label>
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
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input
                id="contactPhone"
                placeholder="(11) 1234-5678"
                {...register('contactPhone')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              placeholder="Endereço completo do fabricante"
              rows={3}
              {...register('address')}
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
              {isSubmitting ? 'Salvando...' : manufacturer ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
