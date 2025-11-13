import { ApiProperty } from '@nestjs/swagger';

export class AssetsByStatusDto {
  @ApiProperty()
  EM_ESTOQUE: number;

  @ApiProperty()
  EM_USO: number;

  @ApiProperty()
  EM_MANUTENCAO: number;

  @ApiProperty()
  INATIVO: number;

  @ApiProperty()
  DESCARTADO: number;
}

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total de ativos no sistema' })
  totalAssets: number;

  @ApiProperty({ description: 'Ativos por status', type: AssetsByStatusDto })
  assetsByStatus: AssetsByStatusDto;

  @ApiProperty({ description: 'Total de licenças ativas' })
  totalLicenses: number;

  @ApiProperty({ description: 'Licenças expirando em 30 dias' })
  expiringLicenses: number;

  @ApiProperty({ description: 'Movimentações nos últimos 30 dias' })
  recentMovements: number;

  @ApiProperty({ description: 'Valor total dos ativos (se disponível)' })
  totalValue: number;
}
