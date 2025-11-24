'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const licenseSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  licenseKey: z.string().optional(),
  totalSeats: z.number().min(1, 'Deve ter pelo menos 1 seat'),
  purchaseDate: z.string().optional(),
  expirationDate: z.string().optional(),
  cost: z.number().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ATIVA', 'EXPIRADA', 'CANCELADA']).optional(),
})

type LicenseFormData = z.infer<typeof licenseSchema>

interface LicenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LicenseFormData & { status: 'ATIVA' | 'EXPIRADA' | 'CANCELADA' }) => Promise<void>
  defaultValues?: Partial<LicenseFormData>
  isEdit?: boolean
}

export function LicenseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEdit = false,
}: LicenseFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      status: (defaultValues?.status || 'ATIVA') as 'ATIVA' | 'EXPIRADA' | 'CANCELADA',
      totalSeats: defaultValues?.totalSeats || 1,
      ...defaultValues,
    },
  })

  const handleFormSubmit = async (data: LicenseFormData) => {
    try {
      // Convert string inputs to numbers where needed
      const submitData = {
        ...data,
        totalSeats: Number(data.totalSeats),
        cost: data.cost ? Number(data.cost) : undefined,
        status: (data.status || 'ATIVA') as 'ATIVA' | 'EXPIRADA' | 'CANCELADA',
      }
      await onSubmit(submitData)
      reset()
      onOpenChange(false)
    } catch {
      // Error handling is done in parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Licença' : 'Nova Licença'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações da licença' : 'Crie uma nova licença de software'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Software *</Label>
            <Input
              id="name"
              placeholder="Ex: Microsoft Office, Windows 11"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseKey">Chave da Licença</Label>
            <Input
              id="licenseKey"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              {...register('licenseKey')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Quantidade de Seats *</Label>
              <Input
                id="totalSeats"
                type="number"
                min="1"
                {...register('totalSeats')}
                disabled={isSubmitting}
              />
              {errors.totalSeats && (
                <p className="text-sm text-destructive">{errors.totalSeats.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={defaultValues?.status || 'ATIVA'}
                onValueChange={(value) => setValue('status', value as 'ATIVA' | 'EXPIRADA' | 'CANCELADA')}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVA">Ativa</SelectItem>
                  <SelectItem value="EXPIRADA">Expirada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Data de Compra</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register('purchaseDate')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de Validade</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('cost')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Fornecedor</Label>
              <Input
                id="vendor"
                placeholder="Ex: Microsoft, Adobe"
                {...register('vendor')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais"
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
              {isSubmitting ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
