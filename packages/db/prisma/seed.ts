import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional - comentar em produção)
  await prisma.auditLog.deleteMany();
  await prisma.importLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.licenseAssignment.deleteMany();
  await prisma.license.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hsi.local',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
    },
  });

  const gestorPassword = await bcrypt.hash('gestor123', 10);
  const gestor = await prisma.user.create({
    data: {
      email: 'gestor@hsi.local',
      password: gestorPassword,
      name: 'Gestor TI',
      role: UserRole.GESTOR,
    },
  });

  const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
  const tecnico = await prisma.user.create({
    data: {
      email: 'tecnico@hsi.local',
      password: tecnicoPassword,
      name: 'Técnico Suporte',
      role: UserRole.TECNICO,
    },
  });

  console.log('✅ Usuários criados');

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Desktop',
        description: 'Computadores de mesa',
        icon: 'desktop',
        color: '#3b82f6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Notebook',
        description: 'Computadores portáteis',
        icon: 'laptop',
        color: '#8b5cf6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Monitor',
        description: 'Monitores e displays',
        icon: 'monitor',
        color: '#06b6d4',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Periféricos',
        description: 'Teclados, mouses, webcams, etc.',
        icon: 'mouse',
        color: '#10b981',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Rede',
        description: 'Cabos, adaptadores, roteadores',
        icon: 'network',
        color: '#f59e0b',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Impressora',
        description: 'Impressoras e scanners',
        icon: 'printer',
        color: '#ef4444',
      },
    }),
  ]);

  console.log('✅ Categorias criadas');

  // Criar localizações
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Almoxarifado TI',
        description: 'Estoque principal de TI',
        building: 'Bloco A',
        floor: '1º Andar',
      },
    }),
    prisma.location.create({
      data: {
        name: 'TI - Sala 102',
        description: 'Sala de suporte técnico',
        building: 'Bloco A',
        floor: '1º Andar',
        room: '102',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Ambulatório',
        description: 'Ambulatório de especialidades',
        building: 'Bloco B',
        floor: 'Térreo',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Diretoria',
        description: 'Sala da diretoria',
        building: 'Bloco A',
        floor: '2º Andar',
      },
    }),
  ]);

  console.log('✅ Localizações criadas');

  // Criar fabricantes
  const manufacturers = await Promise.all([
    prisma.manufacturer.create({
      data: {
        name: 'DELL',
        website: 'https://www.dell.com',
        supportPhone: '0800-970-3355',
      },
    }),
    prisma.manufacturer.create({
      data: {
        name: 'HP',
        website: 'https://www.hp.com',
        supportPhone: '0800-157-751',
      },
    }),
    prisma.manufacturer.create({
      data: {
        name: 'Lenovo',
        website: 'https://www.lenovo.com',
      },
    }),
  ]);

  console.log('✅ Fabricantes criados');

  // Criar fornecedores
  const supplier = await prisma.supplier.create({
    data: {
      name: 'TechSupply Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsupply.com',
      phone: '(11) 3456-7890',
    },
  });

  console.log('✅ Fornecedores criados');

  // Criar alguns ativos de exemplo
  const desktopCategory = categories.find((c) => c.name === 'Desktop');
  const monitorCategory = categories.find((c) => c.name === 'Monitor');
  const perifericos = categories.find((c) => c.name === 'Periféricos');
  const almoxarifado = locations.find((l) => l.name === 'Almoxarifado TI');
  const dell = manufacturers.find((m) => m.name === 'DELL');

  const assets = [];
  
  // Criar 10 desktops
  for (let i = 1; i <= 10; i++) {
    const asset = await prisma.asset.create({
      data: {
        assetTag: `HSI${String(230000 + i).padStart(6, '0')}`,
        name: 'Desktop OPTIPLEX 7020',
        description: 'Desktop Dell OptiPlex 7020',
        serialNumber: `${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        model: 'OptiPlex 7020',
        status: i <= 5 ? 'EM_USO' : 'EM_ESTOQUE',
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 3500.00,
        warrantyUntil: new Date('2027-01-15'),
        categoryId: desktopCategory!.id,
        manufacturerId: dell!.id,
        locationId: almoxarifado!.id,
        supplierId: supplier.id,
        createdById: admin.id,
        assignedToId: i <= 5 ? tecnico.id : undefined,
        assignedAt: i <= 5 ? new Date() : undefined,
      },
    });
    assets.push(asset);
  }

  // Criar 5 monitores
  for (let i = 1; i <= 5; i++) {
    const asset = await prisma.asset.create({
      data: {
        assetTag: `HSI${String(230100 + i).padStart(6, '0')}`,
        name: 'Monitor Dell P2425H',
        description: 'Monitor Dell 24" Full HD',
        serialNumber: `${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        model: 'P2425H',
        status: 'EM_ESTOQUE',
        purchaseDate: new Date('2024-07-01'),
        purchasePrice: 850.00,
        categoryId: monitorCategory!.id,
        manufacturerId: dell!.id,
        locationId: almoxarifado!.id,
        createdById: admin.id,
      },
    });
    assets.push(asset);
  }

  // Criar periféricos genéricos (sem patrimônio)
  await prisma.asset.create({
    data: {
      name: 'Mouse USB',
      description: 'Mouse óptico USB padrão',
      status: 'EM_ESTOQUE',
      categoryId: perifericos!.id,
      locationId: almoxarifado!.id,
      createdById: admin.id,
    },
  });

  console.log('✅ Ativos criados');

  // Criar licenças
  await prisma.license.create({
    data: {
      name: 'Microsoft Office 365 Business',
      licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
      totalSeats: 50,
      usedSeats: 35,
      purchaseDate: new Date('2024-01-01'),
      expirationDate: new Date('2025-12-31'),
      status: 'ATIVA',
      cost: 15000.00,
      vendor: 'Microsoft',
    },
  });

  await prisma.license.create({
    data: {
      name: 'Adobe Creative Cloud',
      totalSeats: 10,
      usedSeats: 8,
      purchaseDate: new Date('2024-03-01'),
      expirationDate: new Date('2025-02-28'),
      status: 'ATIVA',
      cost: 8000.00,
      vendor: 'Adobe',
    },
  });

  console.log('✅ Licenças criadas');

  // Criar movimentações
  await prisma.movement.create({
    data: {
      type: 'CHECK_IN',
      assetId: assets[0].id,
      toLocation: almoxarifado!.name,
      reason: 'Entrada inicial de estoque',
      movedBy: 'Guilherme Flores',
    },
  });

  await prisma.movement.create({
    data: {
      type: 'ASSIGNMENT',
      assetId: assets[0].id,
      userId: tecnico.id,
      toLocation: 'TI - Sala 102',
      reason: 'Atribuído para uso diário',
      ticketNumber: 'TKT-12345',
      movedBy: 'Guilherme Flores',
    },
  });

  console.log('✅ Movimentações criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('👤 Usuários criados:');
  console.log('   Admin: admin@hsi.local / admin123');
  console.log('   Gestor: gestor@hsi.local / gestor123');
  console.log('   Técnico: tecnico@hsi.local / tecnico123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
