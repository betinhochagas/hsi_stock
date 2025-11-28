'use client'

import { Package, TrendingUp, FileKey, AlertCircle } from 'lucide-react'
import { useDashboardStats, useStockByCategory } from '@/hooks/use-dashboard'
import { useRecentMovements } from '@/hooks/use-movements'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StockByCategory } from '@/components/dashboard/stock-by-category'
import { RecentMovementsTable } from '@/components/dashboard/recent-movements-table'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: stockData, isLoading: stockLoading } = useStockByCategory()
  const { data: movementsData, isLoading: movementsLoading } = useRecentMovements(10)

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Visão geral do sistema de gestão de ativos HSI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Ativos"
          value={stats?.totalAssets.toLocaleString('pt-BR') || '0'}
          description={stats ? formatCurrency(stats.totalValue) : 'Carregando...'}
          icon={Package}
          trend="neutral"
          loading={statsLoading}
        />
        <StatsCard
          title="Movimentações"
          value={stats?.recentMovements || '0'}
          description="Últimos 30 dias"
          icon={TrendingUp}
          trend="up"
          loading={statsLoading}
        />
        <StatsCard
          title="Licenças Ativas"
          value={stats?.totalLicenses || '0'}
          description={
            stats?.expiringLicenses
              ? `${stats.expiringLicenses} expirando em 30 dias`
              : 'Nenhuma expirando'
          }
          icon={FileKey}
          trend={stats?.expiringLicenses && stats.expiringLicenses > 0 ? 'down' : 'neutral'}
          loading={statsLoading}
        />
        <StatsCard
          title="Em Manutenção"
          value={stats?.assetsByStatus.EM_MANUTENCAO || '0'}
          description="Ativos em manutenção"
          icon={AlertCircle}
          trend={
            stats?.assetsByStatus.EM_MANUTENCAO && stats.assetsByStatus.EM_MANUTENCAO > 0
              ? 'down'
              : 'neutral'
          }
          loading={statsLoading}
        />
      </div>

      {/* Stock by Category */}
      <StockByCategory
        data={stockData || []}
        loading={stockLoading}
      />

      {/* Recent Activity */}
      <RecentMovementsTable
        movements={movementsData?.items || []}
        loading={movementsLoading}
      />
    </div>
  )
}
