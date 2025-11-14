'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { navigation } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-300 overflow-hidden',
        sidebarOpen ? 'w-[280px]' : 'w-[64px]'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">HSI</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Estoque TI</p>
                <p className="text-xs text-muted-foreground">Sistema HSI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
              aria-label="Recolher menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
            aria-label="Expandir menu"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <TooltipProvider delayDuration={0}>
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className="mb-4">
              {sidebarOpen && (
                <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                  {group.title}
                </p>
              )}
              {!sidebarOpen && groupIndex > 0 && <Separator className="my-2" />}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        !sidebarOpen && 'justify-center'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && <span>{item.title}</span>}
                    </Link>
                  );

                  if (!sidebarOpen) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 shrink-0">
        {sidebarOpen ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium">Sistema de Estoque</p>
              <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
              <p className="text-xs text-muted-foreground">Desenvolvido por <strong>Roberto Chagas</strong></p>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Ambiente de Desenvolvimento
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </aside>
  );
}
