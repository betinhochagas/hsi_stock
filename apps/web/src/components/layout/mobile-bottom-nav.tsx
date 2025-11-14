'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, TrendingUp, FileKey, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Package,
    label: 'Ativos',
    href: '/assets',
  },
  {
    icon: TrendingUp,
    label: 'Movimentações',
    href: '/movements',
  },
  {
    icon: FileKey,
    label: 'Licenças',
    href: '/licenses',
  },
  {
    icon: MapPin,
    label: 'Locais',
    href: '/locations',
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div 
        className="flex items-center justify-around h-16 px-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 min-w-[60px] transition-colors touch-manipulation',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-accent'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
