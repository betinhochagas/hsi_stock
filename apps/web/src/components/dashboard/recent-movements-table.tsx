'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Movement } from '@/types/entities';
import { formatDateTime } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, UserPlus, UserMinus } from 'lucide-react';

interface RecentMovementsTableProps {
  movements: Movement[];
  loading?: boolean;
}

const MOVEMENT_ICONS = {
  CHECK_IN: ArrowDownRight,
  CHECK_OUT: ArrowUpRight,
  TRANSFER: ArrowRightLeft,
  ASSIGNMENT: UserPlus,
  RETURN: UserMinus,
};

const MOVEMENT_LABELS = {
  CHECK_IN: 'Check-in',
  CHECK_OUT: 'Check-out',
  TRANSFER: 'Transferência',
  ASSIGNMENT: 'Atribuição',
  RETURN: 'Devolução',
};

const MOVEMENT_COLORS = {
  CHECK_IN: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  CHECK_OUT: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  TRANSFER: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  ASSIGNMENT: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  RETURN: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
};

export function RecentMovementsTable({ movements, loading }: RecentMovementsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas movimentações registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas movimentações registradas</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhuma movimentação registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas {movements.length} movimentações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.map((movement) => {
            const Icon = MOVEMENT_ICONS[movement.type];
            const label = MOVEMENT_LABELS[movement.type];
            const colorClass = MOVEMENT_COLORS[movement.type];

            return (
              <div
                key={movement.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {movement.asset?.name || 'Ativo não identificado'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {movement.fromLocation?.name} → {movement.toLocation}
                  </p>
                  {movement.reason && (
                    <p className="text-xs text-muted-foreground italic">
                      {movement.reason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(movement.movedAt)}
                  </p>
                  {movement.movedBy && (
                    <p className="text-xs text-muted-foreground">
                      {movement.movedBy}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
