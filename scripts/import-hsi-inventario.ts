/**
 * Script de Importação: HSI Inventário.csv
 * 
 * Importa dados completos do inventário de TI do HSI incluindo:
 * - Computadores (Desktop/Laptop)
 * - Monitores (até 3 por equipamento)
 * - Informações de localização (Setor, Andar, Prédio)
 * - Usuários conectados
 * - Dados de hardware (Serial Number, Modelo, Fabricante, IP)
 * - Periféricos (Webcam, Headset)
 */

import 'dotenv/config';
import { PrismaClient, AssetStatus, UserRole, MovementType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Configurar Prisma com URL explícita
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://estoque_user:admin@127.0.0.1:5432/estoque_hsi';
console.log('🔗 Conectando ao banco:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Configuração
const CSV_FILE = path.join(process.cwd(), 'HSI Inventário.csv');

// Cache para evitar duplicação
const cache = {
  locations: new Map<string, string>(),
  manufacturers: new Map<string, string>(),
  categories: new Map<string, string>(),
  users: new Map<string, string>(),
};

// Estatísticas
const stats = {
  computadores: 0,
  monitores: 0,
  localizacoes: 0,
  fabricantes: 0,
  erros: [] as Array<{ linha: number; erro: string; dados: any }>,
  avisos: [] as string[],
};

/**
 * Normalizar texto
 */
function normalizar(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Buscar ou criar localização
 */
async function obterLocalizacao(
  setor: string,
  andar: string,
  predio: string,
): Promise<string> {
  const setorNorm = normalizar(setor);
  const andarNorm = normalizar(andar);
  const predioNorm = normalizar(predio);

  if (!setorNorm) {
    throw new Error('Setor não pode estar vazio');
  }

  // Criar chave única
  const chave = `${setorNorm}|${andarNorm}|${predioNorm}`;

  if (cache.locations.has(chave)) {
    return cache.locations.get(chave)!;
  }

  // Montar nome completo da localização
  let nomeCompleto = setorNorm;
  if (andarNorm) nomeCompleto += ` - ${andarNorm}º Andar`;
  if (predioNorm && predioNorm !== 'Principal') nomeCompleto += ` (${predioNorm})`;

  // Buscar ou criar
  let location = await prisma.location.findFirst({
    where: { name: nomeCompleto },
  });

  if (!location) {
    location = await prisma.location.create({
      data: {
        name: nomeCompleto,
        description: `Importado automaticamente do inventário HSI`,
        building: predioNorm || null,
        floor: andarNorm || null,
      },
    });
    stats.localizacoes++;
    console.log(`  ✅ Localização criada: ${nomeCompleto}`);
  }

  cache.locations.set(chave, location.id);
  return location.id;
}

/**
 * Buscar ou criar fabricante
 */
async function obterFabricante(nome: string): Promise<string> {
  const nomeNorm = normalizar(nome);

  if (!nomeNorm || nomeNorm === 'N/A') {
    return '';
  }

  if (cache.manufacturers.has(nomeNorm)) {
    return cache.manufacturers.get(nomeNorm)!;
  }

  let manufacturer = await prisma.manufacturer.findFirst({
    where: { name: nomeNorm },
  });

  if (!manufacturer) {
    manufacturer = await prisma.manufacturer.create({
      data: {
        name: nomeNorm,
      },
    });
    stats.fabricantes++;
  }

  cache.manufacturers.set(nomeNorm, manufacturer.id);
  return manufacturer.id;
}

/**
 * Buscar ou criar categoria
 */
async function obterCategoria(tipo: string): Promise<string> {
  const categorias: Record<string, { nome: string; icone: string; cor: string }> = {
    desktop: { nome: 'Desktop', icone: 'monitor', cor: '#3B82F6' },
    laptop: { nome: 'Notebook', icone: 'laptop', cor: '#10B981' },
    monitor: { nome: 'Monitor', icone: 'tv', cor: '#8B5CF6' },
    webcam: { nome: 'Webcam', icone: 'video', cor: '#F59E0B' },
    headset: { nome: 'Headset', icone: 'headphones', cor: '#EF4444' },
  };

  const config = categorias[tipo] || categorias.desktop;

  if (cache.categories.has(config.nome)) {
    return cache.categories.get(config.nome)!;
  }

  let category = await prisma.category.findFirst({
    where: { name: config.nome },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: config.nome,
        icon: config.icone,
        color: config.cor,
        description: `Categoria ${config.nome}`,
      },
    });
  }

  cache.categories.set(config.nome, category.id);
  return category.id;
}

/**
 * Buscar usuário do sistema (para vinculação)
 */
async function obterUsuarioSistema(): Promise<string> {
  if (cache.users.has('sistema')) {
    return cache.users.get('sistema')!;
  }

  let user = await prisma.user.findFirst({
    where: { email: 'admin@hsi.local' },
  });

  if (!user) {
    throw new Error('Usuário admin não encontrado. Execute o seed primeiro.');
  }

  cache.users.set('sistema', user.id);
  return user.id;
}

/**
 * Extrair nome do usuário do domínio (ex: "ACSC\rafael.muller" -> "rafael.muller")
 */
function extrairUsuario(usuarioConectado: string): string {
  if (!usuarioConectado) return '';
  const partes = usuarioConectado.split('\\');
  return partes.length > 1 ? partes[1].toLowerCase() : usuarioConectado.toLowerCase();
}

/**
 * Determinar status do ativo
 */
function determinarStatus(usuarioConectado: string): AssetStatus {
  const usuario = normalizar(usuarioConectado).toLowerCase();
  
  if (!usuario || usuario === 'user' || usuario === 'acsc\\user') {
    return 'EM_ESTOQUE';
  }
  
  return 'EM_USO';
}

/**
 * Criar computador (Desktop/Laptop)
 */
async function criarComputador(
  linha: number,
  registro: any,
  userId: string,
): Promise<string | null> {
  try {
    const patrimonio = normalizar(registro['Patrimônio']);
    const hostname = normalizar(registro['Hostname']);
    const serialNumber = normalizar(registro['Serial Number CPU']);
    const fabricante = normalizar(registro['Fabricante']);
    const modelo = normalizar(registro['Modelo']);
    const tipo = normalizar(registro['Tipo de chassi']).toLowerCase();
    const os = normalizar(registro['Nome de SO']);
    const osRelease = normalizar(registro['Os Release']);
    const ip = normalizar(registro['IP']);
    const usuarioConectado = registro['Usuário conectado'];

    // Validações básicas
    if (!patrimonio && !hostname) {
      stats.avisos.push(`Linha ${linha}: Sem patrimônio ou hostname, registro ignorado`);
      return null;
    }

    // Verificar se já existe
    const existente = await prisma.asset.findFirst({
      where: {
        OR: [
          patrimonio ? { assetTag: patrimonio } : {},
          serialNumber ? { serialNumber } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    if (existente) {
      stats.avisos.push(`Linha ${linha}: Equipamento já existe (${patrimonio || hostname})`);
      return existente.id;
    }

    // Determinar categoria
    const isLaptop = tipo.includes('laptop') || tipo.includes('notebook');
    const categoriaId = await obterCategoria(isLaptop ? 'laptop' : 'desktop');
    const fabricanteId = fabricante ? await obterFabricante(fabricante) : '';

    // Obter localização
    const setor = normalizar(registro['Localização']);
    const andar = normalizar(registro['Andar']);
    const predio = normalizar(registro['Prédio']);
    const locationId = await obterLocalizacao(setor, andar, predio);

    // Criar nome descritivo
    const nomeEquipamento = hostname || `${tipo.toUpperCase()} ${patrimonio}`;

    // Criar descrição detalhada
    const descricao = [
      os && `Sistema Operacional: ${os} ${osRelease}`,
      ip && `IP: ${ip}`,
      usuarioConectado && `Usuário: ${extrairUsuario(usuarioConectado)}`,
      registro['Beira Leito?'] === 'Sim' && 'Beira Leito',
      registro['Webcam'] === 'Sim' && 'Com Webcam',
      registro['Headset'] === 'Sim' && 'Com Headset',
    ].filter(Boolean).join(' | ');

    // Determinar status
    const status = determinarStatus(usuarioConectado);

    // Criar ativo
    const computador = await prisma.asset.create({
      data: {
        assetTag: patrimonio || undefined,
        name: nomeEquipamento,
        description: descricao,
        serialNumber: serialNumber || undefined,
        model: modelo || undefined,
        status,
        categoryId: categoriaId,
        manufacturerId: fabricanteId || undefined,
        locationId,
        createdById: userId,
        observations: JSON.stringify({
          hostname,
          ip,
          os,
          osRelease,
          tipo,
          usuarioConectado: extrairUsuario(usuarioConectado),
          beiraLeito: registro['Beira Leito?'] === 'Sim',
          carrinho: registro['N° do Carrinho'],
          cadeado: registro['Cadeado'],
          ultimaAtualizacao: registro['DATA'],
          atualizadoPor: registro['última atualização por'],
        }, null, 2),
      },
    });

    // Criar movimentação de entrada
    await prisma.movement.create({
      data: {
        type: status === 'EM_USO' ? 'ASSIGNMENT' : 'CHECK_IN',
        assetId: computador.id,
        toLocation: setor,
        reason: `Importação automática do inventário HSI - ${registro['DATA'] || 'sem data'}`,
        movedBy: 'Sistema - Importação CSV Inventário',
        movedAt: new Date(),
      },
    });

    stats.computadores++;
    console.log(`  ✅ Computador criado: ${nomeEquipamento} (${patrimonio || 'sem patrimônio'})`);
    
    return computador.id;
  } catch (error) {
    const err = error as Error;
    stats.erros.push({
      linha,
      erro: err.message,
      dados: {
        patrimonio: registro['Patrimônio'],
        hostname: registro['Hostname'],
      },
    });
    console.error(`  ❌ Erro ao criar computador (linha ${linha}): ${err.message}`);
    return null;
  }
}

/**
 * Criar monitor
 */
async function criarMonitor(
  linha: number,
  computadorId: string,
  fabricante: string,
  modelo: string,
  patrimonio: string,
  numero: number,
  setor: string,
  userId: string,
): Promise<void> {
  try {
    const fabricanteNorm = normalizar(fabricante);
    const modeloNorm = normalizar(modelo);
    const patrimonioNorm = normalizar(patrimonio);

    if (!fabricanteNorm && !modeloNorm && !patrimonioNorm) {
      return; // Monitor vazio, ignorar
    }

    // Verificar se já existe
    if (patrimonioNorm) {
      const existente = await prisma.asset.findFirst({
        where: { assetTag: patrimonioNorm },
      });
      if (existente) {
        stats.avisos.push(`Linha ${linha}: Monitor ${numero} já existe (${patrimonioNorm})`);
        return;
      }
    }

    const categoriaId = await obterCategoria('monitor');
    const fabricanteId = fabricanteNorm ? await obterFabricante(fabricanteNorm) : '';

    // Buscar localização do computador
    const computador = await prisma.asset.findUnique({
      where: { id: computadorId },
      include: { location: true },
    });

    const locationId = computador?.locationId || '';

    const nome = `Monitor ${numero} - ${modeloNorm || 'Sem modelo'}`;

    const monitor = await prisma.asset.create({
      data: {
        assetTag: patrimonioNorm || undefined,
        name: nome,
        description: `Monitor vinculado ao computador principal`,
        model: modeloNorm || undefined,
        status: 'EM_USO',
        categoryId: categoriaId,
        manufacturerId: fabricanteId || undefined,
        locationId: locationId || undefined,
        createdById: userId,
        observations: JSON.stringify({
          numeroMonitor: numero,
          computadorVinculado: computadorId,
        }, null, 2),
      },
    });

    // Criar movimentação
    await prisma.movement.create({
      data: {
        type: 'ASSIGNMENT',
        assetId: monitor.id,
        toLocation: setor,
        reason: `Monitor ${numero} vinculado ao computador`,
        movedBy: 'Sistema - Importação CSV Inventário',
        movedAt: new Date(),
      },
    });

    stats.monitores++;
    console.log(`  ✅ Monitor ${numero} criado: ${nome} (${patrimonioNorm || 'sem patrimônio'})`);
  } catch (error) {
    const err = error as Error;
    stats.erros.push({
      linha,
      erro: `Monitor ${numero}: ${err.message}`,
      dados: { fabricante, modelo, patrimonio },
    });
    console.error(`  ❌ Erro ao criar monitor ${numero} (linha ${linha}): ${err.message}`);
  }
}

/**
 * Processar linha do CSV
 */
async function processarLinha(linha: number, registro: any, userId: string): Promise<void> {
  console.log(`\n📦 Processando linha ${linha}...`);

  // 1. Criar computador principal
  const computadorId = await criarComputador(linha, registro, userId);
  
  if (!computadorId) {
    return;
  }

  const setor = normalizar(registro['Localização']);

  // 2. Criar monitores (até 3)
  for (let i = 1; i <= 3; i++) {
    const fabricante = registro[i === 1 ? 'Monitor 1' : `Monitor ${i}`];
    const modelo = registro[i === 1 ? 'Modelo 1' : `Modelo ${i}`];
    const patrimonio = registro[i === 1 ? 'Patrimônio 1' : `Patrimônio ${i}`];

    if (fabricante || modelo || patrimonio) {
      await criarMonitor(
        linha,
        computadorId,
        fabricante,
        modelo,
        patrimonio,
        i,
        setor,
        userId,
      );
    }
  }
}

/**
 * Função principal
 */
async function importar() {
  console.log('🚀 INICIANDO IMPORTAÇÃO: HSI Inventário.csv\n');
  console.log('=' .repeat(80));

  try {
    // Verificar se arquivo existe
    if (!fs.existsSync(CSV_FILE)) {
      throw new Error(`Arquivo não encontrado: ${CSV_FILE}`);
    }

    // Obter usuário do sistema
    const userId = await obterUsuarioSistema();

    // Ler arquivo CSV
    console.log('\n📖 Lendo arquivo CSV...');
    const conteudo = fs.readFileSync(CSV_FILE, 'latin1');

    // Parsear CSV
    const registros = parse(conteudo, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      relax_column_count: true,
    });

    console.log(`✅ ${registros.length} linhas encontradas\n`);

    // Processar cada linha
    for (let i = 0; i < registros.length; i++) {
      await processarLinha(i + 2, registros[i], userId); // +2 porque linha 1 é header
      
      // Progresso a cada 10 linhas
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progresso: ${i + 1}/${registros.length} linhas processadas`);
      }
    }

    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('✅ IMPORTAÇÃO CONCLUÍDA!\n');
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   • Computadores criados: ${stats.computadores}`);
    console.log(`   • Monitores criados: ${stats.monitores}`);
    console.log(`   • Localizações criadas: ${stats.localizacoes}`);
    console.log(`   • Fabricantes criados: ${stats.fabricantes}`);
    console.log(`   • Avisos: ${stats.avisos.length}`);
    console.log(`   • Erros: ${stats.erros.length}`);

    if (stats.avisos.length > 0) {
      console.log('\n⚠️  AVISOS:');
      stats.avisos.slice(0, 20).forEach(aviso => console.log(`   ${aviso}`));
      if (stats.avisos.length > 20) {
        console.log(`   ... e mais ${stats.avisos.length - 20} avisos`);
      }
    }

    if (stats.erros.length > 0) {
      console.log('\n❌ ERROS:');
      stats.erros.slice(0, 10).forEach(erro => {
        console.log(`   Linha ${erro.linha}: ${erro.erro}`);
        console.log(`   Dados: ${JSON.stringify(erro.dados)}`);
      });
      if (stats.erros.length > 10) {
        console.log(`   ... e mais ${stats.erros.length - 10} erros`);
      }
    }

    console.log('\n' + '='.repeat(80));
  } catch (error) {
    const err = error as Error;
    console.error('\n❌ ERRO FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
importar();
