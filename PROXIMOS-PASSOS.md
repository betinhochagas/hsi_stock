# 🚀 PRÓXIMOS PASSOS - Guia do Desenvolvedor

**Status Atual:** MVP 100% + Sprint 7 (25%)  
**Próxima Ação:** Completar Sprint 7 e preparar para produção  
**Última Atualização:** 26 de Novembro de 2025

---

## 🎯 ONDE VOCÊ ESTÁ AGORA

```
████████████████████████████████████░░░░░░░░░░  75% COMPLETO

✅ MVP Entregue (128h)
🟡 Sprint 7 (5h/20h) ← VOCÊ ESTÁ AQUI
⏳ Sprints 8-21 (199h planejadas)
```

**Sistema atual:** Funcional, testado manualmente, rodando em Docker  
**Próximo milestone:** Sistema em produção (7 dias úteis)

---

## 🔥 AÇÃO IMEDIATA - COMPLETAR SPRINT 7

### Contexto
Você iniciou o Sprint 7 (Testes Automatizados) e já completou 25%:
- ✅ Setup Jest + TypeScript (100%)
- ✅ 40 testes unitários passando (100%)
- ⏳ Faltam 15h de trabalho

### O Que Fazer AGORA (Próximas 2-3 horas)

#### Tarefa 1: Completar Unit Tests dos Services Restantes (6h)

**Prioridade:** 🔴 ALTA

**Services pendentes:**
1. `CategoriesService` (5 testes - 1h)
2. `LocationsService` (5 testes - 1h)
3. `ManufacturersService` (5 testes - 1h)
4. `SuppliersService` (5 testes - 1h)
5. `LicensesService` (8 testes - 1.5h)
6. `MovementsService` (8 testes - 1.5h)

**Como fazer:**

```bash
# 1. Abrir arquivo de teste existente como referência
code apps/api/src/assets/assets.service.spec.ts

# 2. Criar novo arquivo de teste
code apps/api/src/categories/categories.service.spec.ts

# 3. Copiar estrutura do assets.service.spec.ts

# 4. Adaptar para CategoriesService
# - Mudar mocks (mockPrismaClient().category.*)
# - Testar métodos: create(), findAll(), findOne(), update(), remove()

# 5. Rodar testes
cd apps/api
npm test -- --testPathPattern="categories.service.spec"

# 6. Verificar coverage
npm test -- --coverage --testPathPattern="categories.service.spec"
```

**Template rápido:**

```typescript
// apps/api/src/categories/categories.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = mockPrismaClient();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = { name: 'Nova Categoria' };
      (prisma.category.create as jest.Mock).mockResolvedValue({
        id: 'clx123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Nova Categoria');
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  // ... adicionar mais testes para findAll, findOne, update, remove
});
```

**Repetir para todos os 6 services.**

---

#### Tarefa 2: ImportService Tests (CRÍTICO - 2h)

**Prioridade:** 🔴 CRÍTICA

**Por que é crítico:**
- ImportService é o coração do wizard CSV
- Lida com lógica complexa (detecção, validação, processamento)
- Bugs aqui podem corromper dados

**Testes essenciais (12 testes):**

```typescript
describe('ImportService', () => {
  // Detecção
  it('should detect UTF-8 encoding')
  it('should detect delimiter semicolon')
  it('should detect HSI Inventário file type')
  it('should suggest correct mappings')
  
  // Validação
  it('should validate correct data')
  it('should reject missing required fields')
  it('should detect duplicates')
  it('should count new vs existing assets')
  
  // Processamento
  it('should process HSI Inventário format')
  it('should create assets and movements')
  it('should update existing assets')
  it('should handle errors gracefully')
});
```

**Arquivo:** `apps/api/src/import/import.service.spec.ts`

**Dica:** Usar CSV de teste em `data/raw/` para testes de integração.

---

### Progresso Esperado Após Estas Tarefas

```
Antes:  █████░░░░░░░░░░░░░░░  25% (40 testes)
Depois: ████████████░░░░░░░░  60% (80 testes)
```

**Tempo:** ~8h  
**Resultado:** >80% coverage nos services críticos

---

## 📅 PLANO DOS PRÓXIMOS 7 DIAS (Fase Alpha)

### Dia 1-2: Completar Sprint 7 (15h restantes)

**Segunda-feira:**
- Manhã (4h): Categories, Locations, Manufacturers, Suppliers tests
- Tarde (4h): Licenses, Movements tests

**Terça-feira:**
- Manhã (3h): ImportService tests (crítico)
- Tarde (4h): Integration tests (setup + endpoints principais)

**Resultado:** ✅ Sprint 7 completa (>80% coverage)

---

### Dia 3-4: Sprint 9 - Segurança Avançada (16h)

**Quarta-feira:**
- Manhã (4h): Implementar 2FA (backend)
  - Gerar QR code TOTP
  - Endpoints /auth/2fa/enable, /auth/2fa/verify
- Tarde (4h): Implementar 2FA (frontend)
  - Página de configuração
  - Verificação no login

**Quinta-feira:**
- Manhã (4h): Rate limiting por usuário + JWT refresh tokens
- Tarde (4h): Security headers (Helmet) + Secrets Management

**Resultado:** ✅ Sistema seguro (2FA, rate limit, refresh tokens)

---

### Dia 5: Sprint 20 - CI/CD Avançado (12h)

**Sexta-feira:**
- Manhã (4h): GitHub Actions completo
  - Workflow CI com lint, test, build
  - Matrix builds (Node 18, 20, 22)
  - Cache de dependências
- Tarde (4h): Docker multi-stage optimization
  - Reduzir imagens para <200MB
  - Build cache

**Sábado (opcional):**
- Manhã (4h): Terraform para provisionamento (AWS/DO)

**Resultado:** ✅ Pipeline CI/CD funcional

---

### Dia 6-7: Sprint 21 - Deploy Production (8h)

**Segunda-feira:**
- Manhã (4h): High Availability setup
  - Load balancer (AWS ALB ou NGINX)
  - Auto-scaling (min 2, max 10)
- Tarde (2h): SSL/TLS (Let's Encrypt)
  - Certificado SSL
  - Forçar HTTPS

**Terça-feira:**
- Manhã (2h): Disaster Recovery
  - Backup automatizado (database + uploads)
  - Testar restore
- Tarde: Deploy e testes em produção

**Resultado:** ✅ Sistema em produção com HA

---

## 🎯 CHECKLIST - FASE ALPHA (7 DIAS)

### Sprint 7: Testes ⏱️ 15h
- [ ] Categories tests (1h)
- [ ] Locations tests (1h)
- [ ] Manufacturers tests (1h)
- [ ] Suppliers tests (1h)
- [ ] Licenses tests (1.5h)
- [ ] Movements tests (1.5h)
- [ ] ImportService tests (2h)
- [ ] Integration tests (5h)
- [ ] Frontend tests (4h) - opcional

### Sprint 9: Segurança ⏱️ 16h
- [ ] 2FA backend (4h)
- [ ] 2FA frontend (4h)
- [ ] Rate limiting por usuário (2h)
- [ ] JWT refresh tokens (2h)
- [ ] Security headers (1h)
- [ ] Secrets Management (2h)

### Sprint 20: CI/CD ⏱️ 12h
- [ ] GitHub Actions workflow (4h)
- [ ] Docker optimization (4h)
- [ ] Deploy automático staging (2h)
- [ ] Terraform/IaC (2h)

### Sprint 21: Deploy ⏱️ 8h
- [ ] Load balancer + Auto-scaling (4h)
- [ ] SSL/TLS (2h)
- [ ] Backup + DR (2h)
- [ ] Testes finais (incluído)

**Total:** 51h (~6.5 dias úteis com 8h/dia)

---

## 🚨 POSSÍVEIS BLOQUEADORES

### Bloqueador 1: Escolha do Provedor Cloud
**Status:** ⚠️ Decisão pendente  
**Impacto:** Afeta Sprints 20 e 21  
**Ação:** Decidir entre AWS, DigitalOcean ou Azure  

**Recomendação:** DigitalOcean (mais simples, menor custo inicial)

---

### Bloqueador 2: Registro de Domínio
**Status:** ⚠️ Não registrado  
**Impacto:** SSL/TLS (Sprint 21)  
**Ação:** Registrar domínio (ex: estoque-hsi.com.br)  

**Prazo:** Até dia 5 (antes do Sprint 21)

---

### Bloqueador 3: Acesso a Secrets Manager
**Status:** ⚠️ Não configurado  
**Impacto:** Sprint 9 (Secrets Management)  
**Ação:** Configurar AWS Secrets Manager ou HashiCorp Vault  

**Alternativa:** Usar dotenv-vault (mais simples)

---

## 💡 DICAS PARA PRODUTIVIDADE

### 1. Focus Time
**Problema:** Muitos contextos, pouco foco  
**Solução:**
- Bloquear 4h consecutivas de manhã (9h-13h)
- Desligar notificações
- Focar em 1 sprint por vez

### 2. Test-Driven Development (TDD)
**Benefício:** Menos bugs, mais confiança  
**Como:**
1. Escrever teste (Red)
2. Fazer passar (Green)
3. Refatorar (Blue)

### 3. Pair Programming
**Quando usar:** ImportService tests (complexo)  
**Com quem:** Outro dev ou AI (Claude, GitHub Copilot)

### 4. Commits Frequentes
**Padrão:** Commitar a cada teste completo
```bash
git add apps/api/src/categories/categories.service.spec.ts
git commit -m "test: adiciona testes unitários para CategoriesService (5 testes)"
```

### 5. Documentar Decisões
**Criar ADR se:**
- Escolher provedor cloud
- Escolher estratégia de cache
- Mudar arquitetura

---

## 📊 MÉTRICAS DE ACOMPANHAMENTO

### Diárias (Tracking)

**Todo dia às 17h:**
1. Atualizar checklist acima
2. Commitar progresso
3. Anotar bloqueadores no Slack/Notion

**Formato:**
```
📊 UPDATE DIA 1 (26/Nov)
✅ Completo: Categories tests (5/5)
🟡 Em andamento: Locations tests (3/5)
⏳ Próximo: Manufacturers tests
🚧 Bloqueadores: Nenhum
```

### Semanais (Review)

**Toda sexta às 16h:**
- Review de código (se pair)
- Demo para stakeholders (5min)
- Retrospectiva (o que funcionou, o que melhorar)
- Planejamento próxima semana

---

## 🎓 RECURSOS DE APOIO

### Documentação do Projeto
- `SPRINTS-PLANEJADAS.md` - Detalhes técnicos completos
- `ROADMAP-VISUAL.md` - Timeline e checklist
- `PROGRESS.md` - Status atual

### Documentação Externa
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest (Integration Tests)](https://github.com/ladjs/supertest)
- [React Testing Library](https://testing-library.com/react)
- [Terraform AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

### Ferramentas
- **Jest:** Testes unitários
- **Supertest:** Testes de integração API
- **Playwright:** Testes E2E frontend
- **Testcontainers:** Database para integration tests
- **K6/Artillery:** Load tests (Sprint 8)

---

## 🆘 SE ESTIVER TRAVADO

### Problema: "Não sei como testar X"
**Solução:**
1. Procurar teste similar (ex: assets.service.spec.ts)
2. Ler docs do Jest
3. Pedir ajuda (Slack, Claude, Stack Overflow)

### Problema: "Testes estão falhando"
**Debug:**
```bash
# Ver erro detalhado
npm test -- --verbose

# Rodar apenas um teste
npm test -- --testNamePattern="should create a category"

# Debug no VSCode
# 1. Colocar breakpoint
# 2. F5 (Debug: Jest Test)
```

### Problema: "Não tenho tempo"
**Priorizar:**
1. ✅ **Crítico:** ImportService tests (2h)
2. ✅ **Alto:** Licenses, Movements tests (3h)
3. 🟡 **Médio:** Outros services (6h)
4. 🟢 **Baixo:** Frontend tests (4h) - pode ficar para Sprint 8

**Com 5h disponíveis:** Focar em 1+2 (coverage de 60% já é bom para deploy inicial)

---

## ✅ DEFINIÇÃO DE PRONTO (Sprint 7)

**Critérios de aceitação:**
- [ ] >80% coverage em services críticos (Assets, Import, Licenses)
- [ ] Todos os testes passando (0 falhas)
- [ ] CI rodando testes automaticamente
- [ ] Documentação de testes atualizada

**Quando marcar como completo:**
- Todos os checkboxes acima marcados
- PR aprovado e merged
- `PROGRESS.md` atualizado para "Sprint 7: ✅ 100%"

---

## 🎉 APÓS COMPLETAR SPRINT 7

**Celebrar! 🎊**
- Sistema com >80% test coverage
- Confiança para deploy em produção
- Base sólida para Sprints 8-21

**Próxima ação:**
1. Atualizar `PROGRESS.md` (v7.14.0)
2. Criar tag de release: `git tag v1.1.0-alpha`
3. Iniciar Sprint 9 (Segurança)

---

## 📞 CONTATO

**Dúvidas ou bloqueadores?**
- Slack: #hsi-stock-dev
- Email: [tech lead]
- GitHub Issues: tag `help-wanted`

**Pair programming:**
- Agendar sessão de 1-2h para ImportService tests

---

## 🏁 RESUMO - O QUE FAZER AGORA

**HOJE (Próximas 2-3 horas):**
1. ✅ Completar Categories tests (1h)
2. ✅ Completar Locations tests (1h)
3. ✅ Commitar progresso

**AMANHÃ:**
4. ✅ Manufacturers, Suppliers tests (2h)
5. ✅ Licenses tests (1.5h)
6. ✅ Movements tests (1.5h)

**DIA 3:**
7. ✅ ImportService tests (2h) - CRÍTICO
8. ✅ Integration tests (5h)

**RESULTADO:** Sprint 7 completo, pronto para Sprint 9 (Segurança)

---

**Você está a 7 dias úteis de ter um sistema robusto em produção! 🚀**

**Foco, disciplina e bom código! 💪**

---

*Guia mantido por: Tech Lead HSI Stock*  
*Última atualização: 26 de Novembro de 2025*  
*Próxima review: Ao completar Sprint 7*
