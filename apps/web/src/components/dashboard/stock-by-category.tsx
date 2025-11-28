'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface StockByCategoryProps {
  data: {
    categoryName: string
    categoryId: string
    inStock: number
    inUse: number
    total: number
  }[]
  loading?: boolean
}

export function StockByCategory({ data, loading }: StockByCategoryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Categoria</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Categoria</CardTitle>
          <CardDescription>Veja quantos itens você tem de cada tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum ativo cadastrado
          </p>
        </CardContent>
      </Card>
    )
  }

  // Ordenar por quantidade em estoque (decrescente)
  const sortedData = [...data].sort((a, b) => b.inStock - a.inStock).slice(0, 10)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Estoque por Categoria</CardTitle>
          <CardDescription>Top 10 categorias com mais itens disponíveis</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reports">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((item) => (
            <Link
              key={item.categoryId}
              href={`/assets?categoryId=${item.categoryId}&status=EM_ESTOQUE`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.categoryName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.total} {item.total === 1 ? 'item' : 'itens'} no total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{item.inStock}</p>
                  <p className="text-xs text-muted-foreground">em estoque</p>
                </div>
                {item.inUse > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.inUse} em uso
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
