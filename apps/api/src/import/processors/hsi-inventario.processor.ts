import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetStatus } from '@prisma/client';

interface HSIInventarioRow {
  'Localização': string;
  'Beira Leito?': string;
  'N° do Carrinho': string;
  'Cadeado': string;
  'Andar': string;
  'Prédio': string;
  'Usuário conectado': string;
  'Hostname': string;
  'Patrimônio': string;
  'IP': string;
  'Serial Number CPU': string;
  'Nome de SO': string;
  'Os Release': string;
  'Fabricante': string;
  'Modelo': string;
  'Tipo de chassi': string;
  'Monitor 1': string;
  'Modelo 1': string;
  'Patrimônio 1': string;
  'Monitor 2': string;
  'Modelo 2': string;
  'Patrimônio 2': string;
  'Monitor 3': string;
  'Modelo 3': string;
  'Patrimônio 3': string;
  'Webcam': string;
  'Headset': string;
  'DATA': string;
  'última atualização por': string;
  // Index signature para permitir acesso dinâmico
  [key: string]: string;
}

@Injectable()
export class HSIInventarioProcessor {
  private cache = {
    locations: new Map<string, string>(),
    manufacturers: new Map<string, string>(),
    categories: new Map<string, string>(),
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Processar linha do inventário HSI
   */
  async processRow(row: HSIInventarioRow, userId: string): Promise<{
    computador?: string;
    monitores: string[];
    erros: string[];
  }> {
    const erros: string[] = [];
    const monitores: string[] = [];

    try {
      // 1. Criar/atualizar computador
      const computadorId = await this.processComputer(row, userId);

      // 2. Criar monitores vinculados
      for (let i = 1; i <= 3; i++) {
        const monitorId = await this.processMonitor(row, i, computadorId, userId);
        if (monitorId) {
          monitores.push(monitorId);
        }
      }

      return { computador: computadorId, monitores, erros };
    } catch (error) {
      erros.push(error.message);
      return { monitores, erros };
    }
  }

  /**
   * Processar computador (Desktop/Laptop)
   */
  private async processComputer(row: HSIInventarioRow, userId: string): Promise<string> {
    const patrimonio = this.normalize(row['Patrimônio']);
    const hostname = this.normalize(row['Hostname']);
    const serialNumber = this.normalize(row['Serial Number CPU']);
    const fabricante = this.normalize(row['Fabricante']);
    const modelo = this.normalize(row['Modelo']);
    const tipo = this.normalize(row['Tipo de chassi']).toLowerCase();
    const os = this.normalize(row['Nome de SO']);
    const osRelease = this.normalize(row['Os Release']);
    const ip = this.normalize(row['IP']);
    const usuarioConectado = row['Usuário conectado'];

    // Validação básica
    if (!patrimonio && !hostname) {
      throw new Error('Patrimônio ou Hostname obrigatório');
    }

    // Verificar se já existe
    const existente = await this.prisma.asset.findFirst({
      where: {
        OR: [
          patrimonio ? { assetTag: patrimonio } : {},
          serialNumber ? { serialNumber } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    // Determinar categoria (Desktop ou Notebook)
    const isLaptop = tipo.includes('laptop') || tipo.includes('notebook');
    const categoryId = await this.getOrCreateCategory(isLaptop ? 'Notebook' : 'Desktop');
    
    // Fabricante
    const manufacturerId = fabricante ? await this.getOrCreateManufacturer(fabricante) : null;

    // Localização
    const locationId = await this.getOrCreateLocation(
      this.normalize(row['Localização']),
      this.normalize(row['Andar']),
      this.normalize(row['Prédio']),
    );

    // Nome descritivo
    const name = hostname || `${tipo.toUpperCase()} ${patrimonio}`;

    // Descrição completa
    const description = [
      os && `SO: ${os} ${osRelease}`.trim(),
      ip && `IP: ${ip}`,
      usuarioConectado && `Usuário: ${this.extractUsername(usuarioConectado)}`,
      row['Beira Leito?'] === 'Sim' && 'Beira Leito',
      row['Webcam'] === 'Sim' && 'Webcam',
      row['Headset'] === 'Sim' && 'Headset',
    ].filter(Boolean).join(' | ');

    // Status
    const status = this.determineStatus(usuarioConectado);

    // Observações estruturadas
    const observations = JSON.stringify({
      hostname,
      ip,
      os,
      osRelease,
      tipo,
      usuarioConectado: this.extractUsername(usuarioConectado),
      beiraLeito: row['Beira Leito?'] === 'Sim',
      carrinho: row['N° do Carrinho'],
      cadeado: row['Cadeado'],
      ultimaAtualizacao: row['DATA'],
      atualizadoPor: row['última atualização por'],
    }, null, 2);

    // Criar ou atualizar
    if (existente) {
      const updated = await this.prisma.asset.update({
        where: { id: existente.id },
        data: {
          name,
          description,
          model: modelo || undefined,
          status,
          categoryId,
          manufacturerId: manufacturerId || undefined,
          locationId,
          observations,
        },
      });

      // Registrar movimentação se mudou de local
      if (existente.locationId !== locationId) {
        await this.prisma.movement.create({
          data: {
            type: 'TRANSFER',
            assetId: updated.id,
            fromLocationId: existente.locationId,
            toLocation: this.normalize(row['Localização']),
            reason: `Atualização do inventário HSI - ${row['DATA'] || 'sem data'}`,
            movedBy: 'Sistema - Importação HSI Inventário',
            movedAt: new Date(),
          },
        });
      }

      return updated.id;
    } else {
      const created = await this.prisma.asset.create({
        data: {
          assetTag: patrimonio || undefined,
          name,
          description,
          serialNumber: serialNumber || undefined,
          model: modelo || undefined,
          status,
          categoryId,
          manufacturerId: manufacturerId || undefined,
          locationId,
          createdById: userId,
          observations,
        },
      });

      // Registrar movimentação de entrada
      await this.prisma.movement.create({
        data: {
          type: status === 'EM_USO' ? 'ASSIGNMENT' : 'CHECK_IN',
          assetId: created.id,
          toLocation: this.normalize(row['Localização']),
          reason: `Importação HSI Inventário - ${row['DATA'] || 'sem data'}`,
          movedBy: 'Sistema - Importação HSI Inventário',
          movedAt: new Date(),
        },
      });

      return created.id;
    }
  }

  /**
   * Processar monitor
   */
  private async processMonitor(
    row: HSIInventarioRow,
    numero: number,
    computadorId: string,
    userId: string,
  ): Promise<string | null> {
    const fabricanteKey = numero === 1 ? 'Monitor 1' : `Monitor ${numero}`;
    const modeloKey = numero === 1 ? 'Modelo 1' : `Modelo ${numero}`;
    const patrimonioKey = numero === 1 ? 'Patrimônio 1' : `Patrimônio ${numero}`;

    const fabricante = this.normalize(row[fabricanteKey]);
    const modelo = this.normalize(row[modeloKey]);
    const patrimonio = this.normalize(row[patrimonioKey]);

    // Ignorar se vazio
    if (!fabricante && !modelo && !patrimonio) {
      return null;
    }

    // Verificar se já existe
    if (patrimonio) {
      const existente = await this.prisma.asset.findFirst({
        where: { assetTag: patrimonio },
      });
      if (existente) {
        return existente.id; // Já existe, retornar ID
      }
    }

    // Buscar categoria Monitor
    const categoryId = await this.getOrCreateCategory('Monitor');
    const manufacturerId = fabricante ? await this.getOrCreateManufacturer(fabricante) : null;

    // Buscar localização do computador
    const computador = await this.prisma.asset.findUnique({
      where: { id: computadorId },
      select: { locationId: true },
    });

    const name = `Monitor ${numero} - ${modelo || 'Sem modelo'}`;

    const monitor = await this.prisma.asset.create({
      data: {
        assetTag: patrimonio || undefined,
        name,
        description: `Monitor vinculado ao computador principal`,
        model: modelo || undefined,
        status: 'EM_USO',
        categoryId,
        manufacturerId: manufacturerId || undefined,
        locationId: computador?.locationId || undefined,
        createdById: userId,
        observations: JSON.stringify({
          numeroMonitor: numero,
          computadorVinculado: computadorId,
        }, null, 2),
      },
    });

    // Registrar movimentação
    await this.prisma.movement.create({
      data: {
        type: 'ASSIGNMENT',
        assetId: monitor.id,
        toLocation: this.normalize(row['Localização']),
        reason: `Monitor ${numero} vinculado ao computador`,
        movedBy: 'Sistema - Importação HSI Inventário',
        movedAt: new Date(),
      },
    });

    return monitor.id;
  }

  /**
   * Normalizar texto
   */
  private normalize(text: string | null | undefined): string {
    if (!text) return '';
    return text
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Extrair username de domínio
   */
  private extractUsername(usuario: string): string {
    if (!usuario) return '';
    const parts = usuario.split('\\');
    return parts.length > 1 ? parts[1].toLowerCase() : usuario.toLowerCase();
  }

  /**
   * Determinar status do ativo
   */
  private determineStatus(usuarioConectado: string): AssetStatus {
    const usuario = this.normalize(usuarioConectado).toLowerCase();
    
    if (!usuario || usuario === 'user' || usuario === 'acsc\\user' || usuario.includes('acsc\\user')) {
      return 'EM_ESTOQUE';
    }
    
    return 'EM_USO';
  }

  /**
   * Buscar ou criar localização
   */
  private async getOrCreateLocation(setor: string, andar: string, predio: string): Promise<string> {
    if (!setor) {
      throw new Error('Setor não pode estar vazio');
    }

    const key = `${setor}|${andar}|${predio}`;
    
    if (this.cache.locations.has(key)) {
      return this.cache.locations.get(key)!;
    }

    // Montar nome completo
    let name = setor;
    if (andar) name += ` - ${andar}º Andar`;
    if (predio && predio !== 'Principal') name += ` (${predio})`;

    let location = await this.prisma.location.findFirst({ where: { name } });

    if (!location) {
      location = await this.prisma.location.create({
        data: {
          name,
          description: 'Importado do inventário HSI',
          building: predio || null,
          floor: andar || null,
        },
      });
    }

    this.cache.locations.set(key, location.id);
    return location.id;
  }

  /**
   * Buscar ou criar fabricante
   */
  private async getOrCreateManufacturer(name: string): Promise<string> {
    if (this.cache.manufacturers.has(name)) {
      return this.cache.manufacturers.get(name)!;
    }

    let manufacturer = await this.prisma.manufacturer.findFirst({ where: { name } });

    if (!manufacturer) {
      manufacturer = await this.prisma.manufacturer.create({ data: { name } });
    }

    this.cache.manufacturers.set(name, manufacturer.id);
    return manufacturer.id;
  }

  /**
   * Buscar ou criar categoria
   */
  private async getOrCreateCategory(tipo: string): Promise<string> {
    const configs: Record<string, { nome: string; icone: string; cor: string }> = {
      'Desktop': { nome: 'Desktop', icone: 'monitor', cor: '#3B82F6' },
      'Notebook': { nome: 'Notebook', icone: 'laptop', cor: '#10B981' },
      'Monitor': { nome: 'Monitor', icone: 'tv', cor: '#8B5CF6' },
    };

    const config = configs[tipo] || configs.Desktop;

    if (this.cache.categories.has(config.nome)) {
      return this.cache.categories.get(config.nome)!;
    }

    let category = await this.prisma.category.findFirst({ where: { name: config.nome } });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: config.nome,
          icon: config.icone,
          color: config.cor,
          description: `Categoria ${config.nome}`,
        },
      });
    }

    this.cache.categories.set(config.nome, category.id);
    return category.id;
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.locations.clear();
    this.cache.manufacturers.clear();
    this.cache.categories.clear();
  }
}
