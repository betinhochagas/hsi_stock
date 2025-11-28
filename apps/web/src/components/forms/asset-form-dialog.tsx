'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { assetSchema, type AssetFormData } from '@/lib/validations'
import { useCategories, useLocations, useManufacturers } from '@/hooks/use-metadata'
import { FormInput, FormTextarea, FormSelect } from './form-fields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AssetFormData) => Promise<void>
  defaultValues?: Partial<AssetFormData>
  isEdit?: boolean
}

const statusOptions = [
  { value: 'EM_ESTOQUE', label: 'Disponível' },
  { value: 'EM_USO', label: 'Em Uso' },
  { value: 'EM_MANUTENCAO', label: 'Manutenção' },
  { value: 'INATIVO', label: 'Inativo' },
]

export function AssetFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEdit = false,
}: AssetFormDialogProps) {
  const { data: categories = [] } = useCategories()
  const { data: locations = [] } = useLocations()
  const { data: manufacturers = [] } = useManufacturers()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: defaultValues || {
      status: 'EM_ESTOQUE',
    },
  })

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (open && defaultValues) {
      reset(defaultValues)
    } else if (open && !defaultValues) {
      reset({
        status: 'EM_ESTOQUE',
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  const locationOptions = [
    { value: '', label: 'Nenhuma' },
    ...(locations || []).map((loc) => ({
      value: loc.id,
      label: loc.name,
    })),
  ]

  const manufacturerOptions = [
    { value: '', label: 'Nenhum' },
    ...(manufacturers || []).map((mfr) => ({
      value: mfr.id,
      label: mfr.name,
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Ativo' : 'Novo Ativo'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações do ativo'
              : 'Preencha os dados do novo ativo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="name"
              label="Nome"
              placeholder="Desktop Dell OptiPlex 7010"
              required
              register={register}
              errors={errors}
            />

            <FormInput
              name="assetTag"
              label="Patrimônio"
              placeholder="HSI-001"
              register={register}
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="serialNumber"
              label="Número de Série"
              placeholder="SN123456789"
              register={register}
              errors={errors}
            />

            <FormInput
              name="model"
              label="Modelo"
              placeholder="OptiPlex 7010"
              register={register}
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  name="categoryId"
                  label="Categoria"
                  options={categoryOptions}
                  placeholder="Selecione a categoria"
                  required
                  errors={errors}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            <Controller
              name="manufacturerId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  name="manufacturerId"
                  label="Fabricante"
                  options={manufacturerOptions}
                  placeholder="Selecione o fabricante"
                  errors={errors}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="purchaseDate"
              label="Data de Compra"
              type="date"
              register={register}
              errors={errors}
            />

            <FormInput
              name="purchasePrice"
              label="Preço de Compra"
              type="number"
              placeholder="0.00"
              register={register}
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="warrantyUntil"
              label="Fim da Garantia"
              type="date"
              register={register}
              errors={errors}
            />

            <Controller
              name="locationId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  name="locationId"
                  label="Localização"
                  options={locationOptions}
                  placeholder="Selecione a localização"
                  errors={errors}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormSelect
                  name="status"
                  label="Status"
                  options={statusOptions}
                  required
                  errors={errors}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </div>

          <FormTextarea
            name="observations"
            label="Observações"
            placeholder="Informações adicionais sobre o ativo..."
            rows={3}
            register={register}
            errors={errors}
          />

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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
