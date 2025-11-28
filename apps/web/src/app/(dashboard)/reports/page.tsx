'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  MapPin, 
  AlertCircle,
  Download,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDashboardMetrics,
  useAssetsByCategoryReport,
  useAssetsByLocationReport,
  useLicensesExpiringReport,
} from '@/hooks/use-reports';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: dashboardMetrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: categoryReport, isLoading: loadingCategory } = useAssetsByCategoryReport();
  const { data: locationReport, isLoading: loadingLocation } = useAssetsByLocationReport();
  const { data: licenseReport, isLoading: loadingLicenses } = useLicensesExpiringReport(90);

  const isLoading = loadingMetrics || loadingCategory || loadingLocation || loadingLicenses;

  const handleExport = async (type: string, format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const endpoints: Record<string, string> = {
        dashboard: '/export/report/dashboard',
        category: '/export/report/by-category',
        location: '/export/report/by-location',
      };
      const names: Record<string, string> = {
        dashboard: 'dashboard_metrics',
        category: 'report_by_category',
        location: 'report_by_location',
      };
      await downloadFile(`${endpoints[type]}?format=${format}`, `${names[type]}_${new Date().toISOString().split('T')[0]}.${format}`);
      toast.success(`Relat\u00f3rio exportado em ${format.toUpperCase()} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar relat\u00f3rio');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: 'critical' | 'warning' | 'info') => {
    const variants = {
      critical: 'destructive',
      warning: 'default',
      info: 'secondary',
    };
    return variants[severity] as any;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise e métricas do sistema de gestão de ativos
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Dashboard'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('dashboard', 'csv')}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('dashboard', 'xlsx')}>
              Exportar como XLSX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Ativos"
          value={dashboardMetrics?.overview.totalAssets ?? 0}
          icon={Package}
          description="Ativos cadastrados no sistema"
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(dashboardMetrics?.overview.totalValue ?? 0)}
          icon={DollarSign}
          description="Valor total do inventário"
        />
        <StatsCard
          title="Usuários Ativos"
          value={dashboardMetrics?.overview.activeUsers ?? 0}
          icon={Users}
          description="Usuários com ativos alocados"
        />
        <StatsCard
          title="Movimentações"
          value={dashboardMetrics?.overview.totalMovements ?? 0}
          icon={Activity}
          description="Total de movimentações registradas"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="locations">Por Localização</TabsTrigger>
          <TabsTrigger value="licenses">Licenças</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Status atual dos ativos</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardMetrics?.byStatus ?? []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.status}: ${entry.percentage.toFixed(1)}%`}
                    >
                      {(dashboardMetrics?.byStatus ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências (6 meses)</CardTitle>
                <CardDescription>Movimentações e aquisições</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardMetrics?.trends ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="acquisitions" 
                      stroke="#8884d8" 
                      name="Aquisições"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="movements" 
                      stroke="#82ca9d" 
                      name="Movimentações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Quantidade de ativos por categoria</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryReport?.categories ?? []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                    >
                      {(categoryReport?.categories ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Categoria</CardTitle>
                <CardDescription>Valor total investido por categoria</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryReport?.categories ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="totalValue" fill="#8884d8" name="Valor Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalhes por Categoria</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('category', 'csv')}>
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('category', 'xlsx')}>
                    XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Percentual</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categoryReport?.categories ?? []).map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-right">{cat.count}</TableCell>
                      <TableCell className="text-right">{cat.percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.totalValue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.averageValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Localização</CardTitle>
                <CardDescription>Ativos por localização</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationReport?.locations ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inUse" fill="#8884d8" name="Em Uso" />
                    <Bar dataKey="available" fill="#82ca9d" name="Disponível" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Localização</CardTitle>
                <CardDescription>Valor total por localização</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationReport?.locations ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="totalValue" fill="#8884d8" name="Valor Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalhes por Localização</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('location', 'csv')}>
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('location', 'xlsx')}>
                    XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Em Uso</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(locationReport?.locations ?? []).map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell className="text-right">{loc.count}</TableCell>
                      <TableCell className="text-right">{loc.inUse}</TableCell>
                      <TableCell className="text-right">{loc.available}</TableCell>
                      <TableCell className="text-right">{formatCurrency(loc.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licenses Tab */}
        <TabsContent value="licenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Críticas</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseReport?.summary.critical ?? 0}</div>
                <p className="text-xs text-muted-foreground">Expirando em até 30 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atenção</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseReport?.summary.warning ?? 0}</div>
                <p className="text-xs text-muted-foreground">Expirando em 30-60 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Info</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseReport?.summary.info ?? 0}</div>
                <p className="text-xs text-muted-foreground">Expirando em 60-90 dias</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Licenças Expirando nos Próximos 90 Dias</CardTitle>
              <CardDescription>
                Valor total em risco: {formatCurrency(licenseReport?.summary.totalValue ?? 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead className="text-right">Dias Restantes</TableHead>
                    <TableHead className="text-right">Licenças</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Severidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(licenseReport?.expiringSoon ?? []).map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.name}</TableCell>
                      <TableCell>
                        {format(new Date(license.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">{license.daysUntilExpiry}</TableCell>
                      <TableCell className="text-right">
                        {license.usedSeats} / {license.totalSeats}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(license.cost)}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadge(license.severity)}>
                          {license.severity === 'critical' ? 'Crítico' : 
                           license.severity === 'warning' ? 'Atenção' : 'Info'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
