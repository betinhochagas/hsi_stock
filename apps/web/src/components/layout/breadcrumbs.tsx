'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  assets: 'Ativos',
  movements: 'Movimentações',
  licenses: 'Licenças',
  categories: 'Categorias',
  locations: 'Localizações',
  reports: 'Relatórios',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter((segment) => segment !== '')

  if (segments.length === 0 || pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-xs lg:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors shrink-0 touch-manipulation"
      >
        <Home className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const name = routeNames[segment] || segment

        return (
          <div key={segment} className="flex items-center shrink-0">
            <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 mx-0.5 lg:mx-1" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[120px] lg:max-w-none">{name}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors truncate max-w-[100px] lg:max-w-none touch-manipulation"
              >
                {name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
