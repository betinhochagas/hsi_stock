'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend = 'neutral',
  loading = false,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-3 w-16 lg:h-4 lg:w-[120px]" />
          <Skeleton className="h-3 w-3 lg:h-4 lg:w-4 rounded" />
        </CardHeader>
        <CardContent className="pt-1">
          <Skeleton className="h-6 w-12 lg:h-8 lg:w-[80px] mb-1 lg:mb-2" />
          <Skeleton className="h-2 w-20 lg:h-3 lg:w-full" />
        </CardContent>
      </Card>
    );
  }

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow touch-manipulation active:scale-[0.98]', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2">
        <CardTitle className="text-xs lg:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-xl lg:text-2xl font-bold">{value}</div>
        {description && (
          <p className={cn('text-[10px] lg:text-xs mt-0.5 lg:mt-1 line-clamp-1', trendColors[trend])}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
