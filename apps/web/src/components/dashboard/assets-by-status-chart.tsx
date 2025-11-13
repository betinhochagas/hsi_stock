'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface AssetsByStatusChartProps {
  data: {
    status: string;
    count: number;
  }[];
  loading?: boolean;
}

const STATUS_COLORS = {
  EM_ESTOQUE: '#00A3E0',
  EM_USO: '#33CC99',
  EM_MANUTENCAO: '#FFA500',
  INATIVO: '#9CA3AF',
  DESCARTADO: '#E64545',
};

const STATUS_LABELS = {
  EM_ESTOQUE: 'Em Estoque',
  EM_USO: 'Em Uso',
  EM_MANUTENCAO: 'Em Manutenção',
  INATIVO: 'Inativo',
  DESCARTADO: 'Descartado',
};

export function AssetsByStatusChart({ data, loading }: AssetsByStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ativos por Status</CardTitle>
          <CardDescription>Distribuição dos ativos por status</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#9CA3AF',
  }));

  const totalAssets = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalAssets === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ativos por Status</CardTitle>
          <CardDescription>Distribuição dos ativos por status</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum ativo cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ativos por Status</CardTitle>
        <CardDescription>Distribuição dos {totalAssets} ativos por status</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
