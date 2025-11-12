# 🎯 PRÓXIMAS AÇÕES - Sistema HSI Stock

**Data:** 12 de Novembro de 2025  
**Status:** AMBIENTE PRONTO, AGUARDANDO DOCKER ENGINE  
**Prioridade Atual:** Completar CRUD Assets

---

## ⚠️ BLOQUEADOR IMEDIATO

### Docker Engine Não Está Rodando

**Problema:** Docker instalado (v28.5.1) mas o serviço não está ativo.

**Erro ao tentar subir containers:**
```
unable to get image 'redis:7-alpine': error during connect: in the default daemon
configuration on Windows, the docker client must be run with elevated privileges
to connect: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine/v1.51/...": open
//./pipe/docker_engine: The system cannot find the file specified.
```

**Solução:**

1. **Opção 1: Docker Desktop (Recomendado)**
   - Abrir Docker Desktop da bandeja do sistema ou menu Iniciar
   - Aguardar inicialização completa (~30s)
   - Verificar se ícone está verde

2. **Opção 2: Serviço Docker (PowerShell Admin)**
   ```powershell
   # Abrir PowerShell como Administrador
   Start-Service docker
   
   # Verificar status
   Get-Service docker
   ```

3. **Após Docker iniciar:**
   ```powershell
   # Verificar
   docker ps
   
   # Subir banco e Redis
   docker-compose up -d db redis
   
   # Aguardar healthy (~30s)
   docker-compose ps
   
   # Executar migrations
   npm run db:migrate
   
   # Executar seed
   npm run db:seed
   
   # Iniciar API
   npm run dev --workspace=@estoque-hsi/api
   
   # Testar
   # http://localhost:3001/api/docs
   ```

**Tempo Estimado:** 5-10 minutos

---

## 🚀 DESENVOLVIMENTO SEM DOCKER (Alternativa)

Enquanto Docker não está disponível, podemos continuar o desenvolvimento do código sem precisar do banco.

### Opção: Implementar Assets CRUD Completo

Podemos implementar o código dos endpoints que faltam no módulo Assets, mesmo sem banco rodando.

**Vantagens:**
- Não bloqueia desenvolvimento
- Código pronto quando banco subir
- Progresso contínuo

**Tarefas:**
1. ✅ DTOs já existem (CreateAssetDto, UpdateAssetDto)
2. ⏳ Implementar POST em assets.controller.ts
3. ⏳ Implementar PATCH em assets.controller.ts
4. ⏳ Implementar DELETE em assets.controller.ts
5. ⏳ Implementar métodos no assets.service.ts
6. ⏳ Adicionar validações e documentação Swagger

---

## 📋 PLANO DE AÇÃO

### AGORA (Próximos 30 minutos)

**Opção A: Se conseguir iniciar Docker**
- [ ] Iniciar Docker Desktop/Service
- [ ] Executar setup database (comandos acima)
- [ ] Testar Swagger com dados reais
- [ ] Prosseguir para desenvolvimento com banco funcional

**Opção B: Se Docker não disponível**
- [x] Commitar código atual (✅ FEITO)
- [ ] Implementar métodos faltantes em Assets
- [ ] Validar código compilando sem erros
- [ ] Quando Docker disponível: testar tudo

### HOJE (Próximas 3 horas)

**Se Docker funcionar:**
1. [ ] Setup database completo
2. [ ] Implementar Assets CRUD completo
3. [ ] Testar todos endpoints no Swagger
4. [ ] Criar alguns ativos de teste

**Se Docker não funcionar:**
1. [ ] Implementar Assets CRUD completo (código)
2. [ ] Implementar Users CRUD completo (código)
3. [ ] Revisar validações e mensagens de erro
4. [ ] Atualizar documentação Swagger inline

### AMANHÃ (8 horas)

1. [ ] Garantir Docker funcionando (prioridade máxima)
2. [ ] Testar todo código implementado
3. [ ] Implementar Licenses CRUD + lógica seats
4. [ ] Iniciar testes unitários básicos

---

## 🎯 FEATURE ATUAL: Completar Assets CRUD

### Contexto

**Já implementado:**
- ✅ GET /assets (listagem com filtros)
- ✅ GET /assets/:id (busca por ID)
- ✅ Module, Service básico, Controller estruturado
- ✅ DTOs criados (CreateAssetDto, UpdateAssetDto)

**Faltam:**
- ❌ POST /assets (criar)
- ❌ PATCH /assets/:id (atualizar)
- ❌ DELETE /assets/:id (remover)

### Implementação - POST /assets

**Arquivo:** `apps/api/src/assets/assets.controller.ts`

```typescript
@Post()
@ApiOperation({ summary: 'Criar novo ativo' })
@ApiResponse({ status: 201, description: 'Ativo criado com sucesso' })
@ApiResponse({ status: 400, description: 'Dados inválidos' })
@ApiResponse({ status: 409, description: 'Conflito (assetTag/serialNumber duplicado)' })
async create(@Body() createAssetDto: CreateAssetDto) {
  return this.assetsService.create(createAssetDto);
}
```

**Arquivo:** `apps/api/src/assets/assets.service.ts`

```typescript
async create(createAssetDto: CreateAssetDto) {
  // Validar duplicidade de assetTag
  if (createAssetDto.assetTag) {
    const existingTag = await this.prisma.asset.findUnique({
      where: { assetTag: createAssetDto.assetTag },
    });
    if (existingTag) {
      throw new ConflictException(
        `Ativo com patrimônio "${createAssetDto.assetTag}" já existe`,
      );
    }
  }

  // Validar duplicidade de serialNumber
  if (createAssetDto.serialNumber) {
    const existingSerial = await this.prisma.asset.findFirst({
      where: { serialNumber: createAssetDto.serialNumber },
    });
    if (existingSerial) {
      throw new ConflictException(
        `Ativo com serial "${createAssetDto.serialNumber}" já existe`,
      );
    }
  }

  // Validar relacionamentos existem
  if (createAssetDto.categoryId) {
    const category = await this.prisma.category.findUnique({
      where: { id: createAssetDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria com ID "${createAssetDto.categoryId}" não encontrada`,
      );
    }
  }

  if (createAssetDto.locationId) {
    const location = await this.prisma.location.findUnique({
      where: { id: createAssetDto.locationId },
    });
    if (!location) {
      throw new NotFoundException(
        `Localização com ID "${createAssetDto.locationId}" não encontrada`,
      );
    }
  }

  if (createAssetDto.manufacturerId) {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id: createAssetDto.manufacturerId },
    });
    if (!manufacturer) {
      throw new NotFoundException(
        `Fabricante com ID "${createAssetDto.manufacturerId}" não encontrado`,
      );
    }
  }

  if (createAssetDto.supplierId) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createAssetDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(
        `Fornecedor com ID "${createAssetDto.supplierId}" não encontrado`,
      );
    }
  }

  // Criar ativo
  return this.prisma.asset.create({
    data: createAssetDto,
    include: {
      category: true,
      location: true,
      manufacturer: true,
      supplier: true,
      assignedTo: true,
      createdBy: true,
    },
  });
}
```

### Implementação - PATCH /assets/:id

**Controller:**
```typescript
@Patch(':id')
@ApiOperation({ summary: 'Atualizar ativo' })
@ApiResponse({ status: 200, description: 'Ativo atualizado com sucesso' })
@ApiResponse({ status: 404, description: 'Ativo não encontrado' })
@ApiResponse({ status: 409, description: 'Conflito' })
async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
  return this.assetsService.update(id, updateAssetDto);
}
```

**Service:**
```typescript
async update(id: string, updateAssetDto: UpdateAssetDto) {
  // Verificar se ativo existe
  await this.findOne(id);

  // Validar duplicidade de assetTag (se alterado)
  if (updateAssetDto.assetTag) {
    const existing = await this.prisma.asset.findUnique({
      where: { assetTag: updateAssetDto.assetTag },
    });
    if (existing && existing.id !== id) {
      throw new ConflictException(
        `Ativo com patrimônio "${updateAssetDto.assetTag}" já existe`,
      );
    }
  }

  // Validar duplicidade de serialNumber (se alterado)
  if (updateAssetDto.serialNumber) {
    const existing = await this.prisma.asset.findFirst({
      where: { serialNumber: updateAssetDto.serialNumber },
    });
    if (existing && existing.id !== id) {
      throw new ConflictException(
        `Ativo com serial "${updateAssetDto.serialNumber}" já existe`,
      );
    }
  }

  // Validar relacionamentos (mesmo do create)
  // ... código de validação ...

  return this.prisma.asset.update({
    where: { id },
    data: updateAssetDto,
    include: {
      category: true,
      location: true,
      manufacturer: true,
      supplier: true,
      assignedTo: true,
      createdBy: true,
    },
  });
}
```

### Implementação - DELETE /assets/:id

**Controller:**
```typescript
@Delete(':id')
@ApiOperation({ summary: 'Remover ativo' })
@ApiResponse({ status: 200, description: 'Ativo removido com sucesso' })
@ApiResponse({ status: 404, description: 'Ativo não encontrado' })
@ApiResponse({ status: 409, description: 'Ativo possui vínculos' })
async remove(@Param('id') id: string) {
  return this.assetsService.remove(id);
}
```

**Service:**
```typescript
async remove(id: string) {
  // Verificar se existe
  const asset = await this.findOne(id);

  // Verificar vínculos com movimentações
  const movementCount = await this.prisma.movement.count({
    where: { assetId: id },
  });

  if (movementCount > 0) {
    throw new ConflictException(
      `Não é possível remover o ativo "${asset.name}" pois existem ${movementCount} movimentação(ões) vinculada(s). Considere inativá-lo ao invés de removê-lo.`,
    );
  }

  // Verificar vínculos com manutenções
  const maintenanceCount = await this.prisma.maintenance.count({
    where: { assetId: id },
  });

  if (maintenanceCount > 0) {
    throw new ConflictException(
      `Não é possível remover o ativo "${asset.name}" pois existem ${maintenanceCount} manutenção(ões) vinculada(s).`,
    );
  }

  // Opção 1: Hard delete
  await this.prisma.asset.delete({
    where: { id },
  });

  // Opção 2: Soft delete (preferível)
  // await this.prisma.asset.update({
  //   where: { id },
  //   data: { status: 'DESCARTADO' },
  // });

  return { message: 'Ativo removido com sucesso' };
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Assets CRUD Completo

- [ ] Adicionar método `create()` no controller
- [ ] Implementar lógica `create()` no service com validações
- [ ] Adicionar método `update()` no controller
- [ ] Implementar lógica `update()` no service com validações
- [ ] Adicionar método `remove()` no controller
- [ ] Implementar lógica `remove()` no service com validações
- [ ] Atualizar imports necessários
- [ ] Compilar sem erros: `npm run build --workspace=@estoque-hsi/api`
- [ ] (Quando Docker disponível) Testar no Swagger
- [ ] (Quando Docker disponível) Criar casos de teste E2E

---

## 📊 PROGRESSO ESPERADO

### Após Implementar Assets CRUD

**Backend:**
- Antes: 65% (21 endpoints)
- Depois: **68%** (24 endpoints) ⬆️ +3%

**Projeto Total:**
- Antes: 61%
- Depois: **62%** ⬆️ +1%

### Após Setup Database + Testes

**Projeto Total:**
- **63%** (validação funcional completa)

---

## 🎯 OBJETIVO DO DIA

**Até o final do dia:**
- ✅ PROGRESS.md atualizado
- ✅ Código commitado
- [ ] Assets CRUD implementado (código)
- [ ] Docker rodando (bloqueador resolvido)
- [ ] Assets CRUD testado no Swagger

**Status esperado EOD:** 63% do projeto concluído

---

## 📞 REFERÊNCIAS RÁPIDAS

**Swagger (após Docker):** http://localhost:3001/api/docs  
**Health Check:** http://localhost:3001/health  
**Credenciais:** admin@hsi.local / admin123

**Arquivos a editar:**
- `apps/api/src/assets/assets.controller.ts`
- `apps/api/src/assets/assets.service.ts`

**Comando para compilar:**
```powershell
npm run build --workspace=@estoque-hsi/api
```

**Comando para testar (quando Docker ok):**
```powershell
npm run dev --workspace=@estoque-hsi/api
```

---

**Status:** ✅ PLANO DEFINIDO  
**Bloqueador:** Docker Engine (em resolução)  
**Próxima ação:** Implementar Assets CRUD OU iniciar Docker  
**Tempo estimado:** 2-3h (implementação) + 0.5h (testes)

---

*Criado por: Claude 4.5 Sonnet*  
*Data: 12/11/2025 13:15 BRT*
