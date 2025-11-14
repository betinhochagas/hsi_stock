'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function FloatingActionButton({ 
  onClick, 
  label = 'Adicionar',
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg',
        'lg:hidden',
        'touch-manipulation active:scale-95',
        'transition-all duration-200',
        className
      )}
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
