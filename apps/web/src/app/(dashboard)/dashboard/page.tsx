'use client'

import { Package, TrendingUp, FileKey, AlertCircle } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { useRecentMovements } from '@/hooks/use-movements'
import { StatsCard } from '@/components/dashboard/stats-card'
import { AssetsByStatusChart } from '@/components/dashboard/assets-by-status-chart'
import { RecentMovementsTable } from '@/components/dashboard/recent-movements-table'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: movementsData, isLoading: movementsLoading } = useRecentMovements(10)

  // Preparar dados para o gráfico
  const chartData = stats?.assetsByStatus
    ? Object.entries(stats.assetsByStatus).map(([status, count]) => ({
        status,
        count,
      }))
    : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão de ativos HSI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Alertas"
          value={stats?.expiringLicenses || '0'}
          description="Licenças expirando"
          icon={AlertCircle}
          trend={stats?.expiringLicenses && stats.expiringLicenses > 0 ? 'down' : 'neutral'}
          loading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <AssetsByStatusChart data={chartData} loading={statsLoading} />
        
        {/* Placeholder for future chart */}
        <div className="hidden md:block">
          <AssetsByStatusChart data={chartData} loading={statsLoading} />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentMovementsTable
        movements={movementsData?.items || []}
        loading={movementsLoading}
      />
    </div>
  )
}
