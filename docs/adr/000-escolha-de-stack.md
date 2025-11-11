# ADR 000: Escolha de Stack Tecnológica

**Status:** Aceito  
**Data:** 2025-11-11  
**Decisores:** Arquitetura de Software  
**Contexto:** Sistema de Estoque de TI HSI

## Contexto

Precisamos construir um sistema de estoque de TI completo, robusto e profissional com:
- Dashboard e relatórios avançados
- CRUDs completos com auditoria
- Importação/exportação CSV em larga escala (100k+ registros)
- Wizard de importação com validação e dry-run
- Controle de acesso baseado em papéis (RBAC)
- Geração de etiquetas/QR em PDF
- UI moderna, responsiva e acessível
- Observabilidade e métricas

## Opções Avaliadas

### Opção 1: TypeScript Full-Stack (Next.js + NestJS + Prisma + PostgreSQL)

**Prós:**
- ✅ Tipagem forte end-to-end (TypeScript compartilhado)
- ✅ Next.js 14+ com App Router, RSC, Server Actions
- ✅ NestJS: arquitetura modular, DI, decorators, OpenAPI nativo
- ✅ Prisma: ORM type-safe, migrations, schema declarativo
- ✅ Ecossistema rico (tRPC, Zod, TanStack Query, Radix UI)
- ✅ Performance excelente (SSR, streaming, edge)
- ✅ Comunidade massiva, documentação excepcional
- ✅ Facilidade de deploy (Vercel, Docker, qualquer cloud)
- ✅ BullMQ para jobs assíncronos
- ✅ Jest/Vitest, Playwright para testes

**Contras:**
- ⚠️ Requer conhecimento de async/await, promises
- ⚠️ Node.js pode ser verboso para validações complexas

**Stack detalhada:**
- **Backend:** NestJS (Node.js 20+), Prisma ORM, PostgreSQL 15+
- **Frontend:** Next.js 14+, React 18+, TypeScript, Tailwind CSS, shadcn/ui
- **Jobs:** BullMQ + Redis
- **Docs:** Swagger/OpenAPI 3.0
- **Testes:** Jest, Supertest, Playwright
- **Containerização:** Docker, docker-compose

---

### Opção 2: Python Full-Stack (Django + DRF + PostgreSQL)

**Prós:**
- ✅ Django: batteries included, admin integrado
- ✅ DRF: serialização, filtros, paginação robustos
- ✅ Pandas/NumPy para processamento CSV pesado
- ✅ Celery para jobs assíncronos
- ✅ Comunidade madura
- ✅ Django ORM estável

**Contras:**
- ❌ Sem tipagem forte no frontend (precisa de TypeScript separado)
- ❌ Frontend separado (React/Vue) aumenta complexidade
- ❌ Django admin não é UI/UX profissional para usuários finais
- ❌ Menor performance em I/O intensivo comparado a Node.js
- ❌ Integração frontend-backend menos coesa

---

### Opção 3: TypeScript Monolith (Remix + Prisma + PostgreSQL)

**Prós:**
- ✅ Remix: co-location de dados, progressive enhancement
- ✅ Full-stack em um único repo
- ✅ Performance excelente

**Contras:**
- ❌ Comunidade menor que Next.js
- ❌ Menos opções de deploy
- ❌ Menos componentes prontos

---

## Matriz de Decisão

| Critério                  | Peso | TypeScript | Python | Remix |
|---------------------------|------|------------|--------|-------|
| Tipagem forte E2E         | 10   | 10         | 5      | 10    |
| Produtividade             | 9    | 9          | 8      | 8     |
| Maturidade/Estabilidade   | 9    | 9          | 10     | 7     |
| Segurança                 | 10   | 9          | 9      | 9     |
| Performance (I/O)         | 8    | 10         | 7      | 10    |
| Ecossistema/Componentes   | 8    | 10         | 7      | 7     |
| Documentação/Comunidade   | 8    | 10         | 9      | 7     |
| Facilidade de Deploy      | 7    | 10         | 8      | 8     |
| Facilidade de Testes      | 8    | 9          | 9      | 8     |
| DX (Developer Experience) | 7    | 10         | 7      | 9     |
| **TOTAL PONDERADO**       |      | **741**    | **623**| **641**|

## Decisão

**Escolhemos a Opção 1: TypeScript Full-Stack (Next.js + NestJS + Prisma + PostgreSQL)**

### Justificativas-chave:

1. **Tipagem forte E2E:** Compartilhamos tipos entre frontend e backend, eliminando bugs de integração
2. **Monorepo coeso:** Turborepo permite gerenciar `apps/api`, `apps/web`, `packages/shared` com DX superior
3. **Performance:** Node.js + Next.js SSR/RSC + Prisma otimizado = excelente para 100k+ registros
4. **Importação CSV:** BullMQ + streams para processar grandes arquivos sem bloquear
5. **UI moderna:** shadcn/ui + Radix + Tailwind = componentes acessíveis, bonitos e customizáveis
6. **OpenAPI:** NestJS gera Swagger automaticamente via decorators
7. **Deploy:** Docker + qualquer cloud (AWS, GCP, Azure, Vercel Edge)
8. **Comunidade:** React + Next.js = maior ecossistema, mais componentes, mais tutoriais

### Estrutura do Monorepo (Turborepo):

```
/apps
  /api        → NestJS (backend REST + jobs)
  /web        → Next.js 14 (frontend SSR)
/packages
  /db         → Prisma schema + migrations
  /shared     → DTOs, Zod schemas, tipos compartilhados
  /ui         → shadcn/ui components
/data
  /raw        → CSVs de entrada
  /mappings   → YAML de mapeamento
  /processed  → Relatórios gerados
/docs
  /adr        → Architecture Decision Records
/scripts      → Scripts de seed, importação, deploy
docker-compose.yml
```

## Consequências

### Positivas
- Produtividade alta com inferência de tipos
- Refatorações seguras (TypeScript detecta quebras)
- UI moderna e acessível com componentes prontos
- Performance adequada para escala (100k+ ativos)
- Fácil onboarding (JavaScript/TypeScript é mainstream)

### Negativas
- Curva de aprendizado para NestJS (decorators, DI)
- Monorepo requer configuração inicial (Turborepo)
- Node.js requer boas práticas de memória para CSVs grandes (streams)

## Mitigações

- Documentação interna detalhada
- Tutoriais de onboarding
- Usar streaming para CSVs grandes
- Linting/formatting automatizado (ESLint, Prettier)
- CI/CD com testes obrigatórios

---

**Decisão final:** TypeScript Full-Stack com Next.js, NestJS, Prisma e PostgreSQL.
