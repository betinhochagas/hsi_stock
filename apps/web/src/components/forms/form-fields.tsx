'use client'

import { ReactNode } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form'
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
import { cn } from '@/lib/utils'

interface BaseFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  required?: boolean
  errors?: FieldErrors<T>
  className?: string
}

interface FormInputProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local'
  placeholder?: string
  register: UseFormRegister<T>
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  register,
  errors,
  className,
}: FormInputProps<T>) {
  const error = errors?.[name]

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(error && 'border-destructive')}
      />
      {error && (
        <p className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface FormTextareaProps<T extends FieldValues> extends BaseFieldProps<T> {
  placeholder?: string
  register: UseFormRegister<T>
  rows?: number
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  required,
  register,
  errors,
  rows = 3,
  className,
}: FormTextareaProps<T>) {
  const error = errors?.[name]

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
        className={cn(error && 'border-destructive')}
      />
      {error && (
        <p className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[]
  placeholder?: string
  onValueChange: (value: string) => void
  value?: string
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Selecione...',
  required,
  errors,
  onValueChange,
  value,
  className,
}: FormSelectProps<T>) {
  const error = errors?.[name]

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger
          id={name}
          className={cn(error && 'border-destructive')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
