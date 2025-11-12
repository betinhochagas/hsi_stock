# 📚 Índice da Documentação - Sistema de Estoque HSI

Guia completo de toda a documentação do projeto organizada por categoria.

---

## 🚀 Começar Agora

Para iniciar rapidamente, siga nesta ordem:

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡ (10 minutos)
   - Setup básico em 7 passos
   - Ideal para primeira execução
   
2. **[SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)** 🐳 (leitura: 30min)
   - Guia detalhado com troubleshooting
   - Documentação de todos os problemas resolvidos
   - Recomendado se encontrar erros

3. **[README.md](README.md)** 📖 (leitura: 1h)
   - Documentação completa do projeto
   - Arquitetura, funcionalidades, APIs
   - Referência principal

---

## 📊 Status e Progresso

### Visão Geral do Projeto

- **[RESUMO-SETUP-12NOV2025.md](RESUMO-SETUP-12NOV2025.md)** 📋 (5 min)
  - Resumo executivo do último setup
  - O que foi feito em 12/11/2025
  - Estatísticas e métricas

- **[PROGRESS-ATUAL.md](PROGRESS-ATUAL.md)** 📈 (20 min)
  - Status detalhado de cada módulo
  - Progresso Backend: 55%
  - Progresso Frontend: 25%
  - Infraestrutura: 100%
  - Próximas entregas priorizadas

- **[ROADMAP.md](ROADMAP.md)** 🗺️ (30 min)
  - Plano de desenvolvimento completo
  - 150 horas de trabalho planejadas
  - Sprints e milestones

---

## 🏗️ Arquitetura e Decisões

### Documentação Técnica

- **[docs/arquitetura.md](docs/arquitetura.md)** 🏛️
  - Diagramas de arquitetura
  - Fluxos de dados
  - Componentes do sistema

- **[docs/erd.md](docs/erd.md)** 🗄️
  - Diagrama de Entidade-Relacionamento
  - 16 tabelas documentadas
  - Relacionamentos e cardinalidades

### Architecture Decision Records (ADRs)

- **[docs/adr/000-escolha-de-stack.md](docs/adr/000-escolha-de-stack.md)** 🎯
  - Por que TypeScript, Next.js, NestJS, Prisma
  - Justificativas técnicas

- **[docs/adr/001-autenticacao-rbac.md](docs/adr/001-autenticacao-rbac.md)** 🔐
  - JWT vs Sessions
  - Modelo de permissões RBAC

- **[docs/adr/002-importacao-csv.md](docs/adr/002-importacao-csv.md)** 📊
  - Wizard em 3 passos
  - Processamento assíncrono com BullMQ

---

## 🛠️ Guias de Desenvolvimento

### Setup e Configuração

- **[QUICKSTART.md](QUICKSTART.md)** ⚡
  - 7 passos para rodar o sistema
  - Ideal para desenvolvimento local

- **[SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)** 🐳
  - Processo detalhado com explicações
  - Troubleshooting de todos os problemas
  - Workarounds documentados
  - Como reproduzir do zero

### Comandos Úteis

- **[COMANDOS.md](COMANDOS.md)** 💻
  - Referência rápida de comandos
  - Docker, npm, Prisma, Git
  - Scripts úteis para dia a dia

---

## 📦 Features e Entregas

### Documentação de Features

- **[FEATURE-CATEGORIES-LOCATIONS.md](FEATURE-CATEGORIES-LOCATIONS.md)** 🏷️
  - Implementação de Categories CRUD
  - Implementação de Locations CRUD
  - Validações e testes

- **[ENTREGA-MANUFACTURERS-SUPPLIERS.md](ENTREGA-MANUFACTURERS-SUPPLIERS.md)** 🏭
  - Planejamento de Manufacturers
  - Planejamento de Suppliers
  - Integração com Assets

---

## 📝 Relatórios e Análises

### Execuções e Análises

- **[RELATORIO-EXECUCAO.md](RELATORIO-EXECUCAO.md)** 📑
  - Relatório de execução anterior
  - Análise de 11/11/2025
  - Problemas encontrados e resolvidos

- **[RESUMO-EXECUTIVO.md](RESUMO-EXECUTIVO.md)** 📊
  - Visão executiva do projeto
  - KPIs e métricas
  - Status para stakeholders

---

## 🎓 Conceitos e Planejamento

### Documentação de Planejamento

- **[PROJETO.md](PROJETO.md)** 📐
  - Escopo do projeto
  - Objetivos de negócio
  - Requisitos funcionais

- **[ROADMAP.md](ROADMAP.md)** 🗺️
  - Plano de 150 horas
  - 15 milestones
  - Priorização de features

---

## 🧪 Testes e Qualidade

### Documentação de Testes

- **Status:** Configurado mas não implementado
- **Cobertura:** ~15%
- **Próximos passos:**
  - Testes unitários dos services
  - Testes de integração com DB
  - Testes E2E com Playwright

**Arquivos:**
- `apps/api/jest.config.js` - Configuração Jest
- Scripts: `npm run test`, `npm run test:cov`

---

## 🐳 Docker e DevOps

### Arquivos de Configuração

- **[docker-compose.yml](docker-compose.yml)** 🐋
  - 4 serviços: db, redis, api, web
  - Configuração de networks e volumes
  - Health checks

- **[apps/api/Dockerfile](apps/api/Dockerfile)** 🔧
  - Multi-stage build otimizado
  - Alpine Linux + OpenSSL
  - Prisma binary targets

### Scripts de Deploy

- **[scripts/setup.ps1](scripts/setup.ps1)** 🪟
  - Script PowerShell para Windows
  - Setup automatizado

- **[scripts/setup.bat](scripts/setup.bat)** 📜
  - Alternativa batch
  - Compatibilidade Windows legacy

---

## 🗄️ Database

### Schema e Seeds

- **[packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma)** 🗂️
  - 16 entidades modeladas
  - Relacionamentos completos
  - 434 linhas de schema

- **[create_schema.sql](create_schema.sql)** 📄
  - Schema SQL gerado (329 linhas)
  - Workaround para Prisma no Windows
  - Pronto para execução direta

- **[seed.sql](seed.sql)** 🌱
  - 48 registros de teste
  - 3 usuários, 16 assets, 6 categorias
  - Dados realistas para desenvolvimento

---

## 📊 Dados de Entrada

### CSVs Originais

Localizados em `Estoque_HSI(*.csv)`:

1. **Estoque_HSI(Balanço Estoque).csv**
   - Inventário completo
   - ~100 itens

2. **Estoque_HSI(Entrada).csv**
   - Movimentações de entrada
   - Compras e recebimentos

3. **Estoque_HSI(Estoque Clausura).csv**
   - Fechamento de estoque
   - Balanço final

4. **Estoque_HSI(Saída).csv**
   - Movimentações de saída
   - Atribuições e baixas

### Mapeamentos YAML

Localizados em `data/mappings/`:

- `balanco-estoque.yaml` - Mapeamento do balanço
- `entrada.yaml` - Mapeamento de entradas
- `saida.yaml` - Mapeamento de saídas

**Status:** Preparados, importação pendente

---

## 🔗 Links Rápidos

### URLs da Aplicação (quando rodando)

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Swagger UI** | http://localhost:3001/api/docs | Documentação interativa da API |
| **API Base** | http://localhost:3001/api/v1 | Base URL dos endpoints |
| **Health Check** | http://localhost:3001/api/v1/health | Status do sistema |
| **PostgreSQL** | localhost:5432 | Banco de dados |
| **Redis** | localhost:6379 | Cache e jobs |

### Repositórios e Recursos

- **GitHub:** https://github.com/betinhochagas/hsi_stock
- **Prisma Docs:** https://www.prisma.io/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs

---

## 🔐 Credenciais Padrão

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| admin@hsi.local | admin123 | ADMIN | Acesso total |
| gestor@hsi.local | gestor123 | GESTOR | Gestão de TI |
| tecnico@hsi.local | tecnico123 | TECNICO | Suporte técnico |

**⚠️ IMPORTANTE:** Alterar em produção!

---

## 📈 Métricas do Projeto

| Métrica | Valor | Atualizado |
|---------|-------|------------|
| **Linhas de Código (Backend)** | ~2,500 | 12/11/2025 |
| **Arquivos TypeScript** | ~30 | 12/11/2025 |
| **Endpoints REST** | 26+ | 12/11/2025 |
| **Tabelas Database** | 16 | 12/11/2025 |
| **Registros Seed** | 48 | 12/11/2025 |
| **Páginas Documentação** | 40+ | 12/11/2025 |
| **Progresso Total** | 63% | 12/11/2025 |
| **Commits** | 15+ | 12/11/2025 |

---

## 🎯 Fluxo de Leitura Recomendado

### Para Desenvolvedores (Primeira Vez)

1. ✅ [README.md](README.md) - Visão geral (10 min)
2. ✅ [QUICKSTART.md](QUICKSTART.md) - Setup rápido (10 min)
3. ✅ [SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md) - Troubleshooting (quando necessário)
4. ✅ [docs/arquitetura.md](docs/arquitetura.md) - Entender estrutura (15 min)
5. ✅ [PROGRESS-ATUAL.md](PROGRESS-ATUAL.md) - Ver o que está feito (10 min)
6. ✅ [ROADMAP.md](ROADMAP.md) - Planejar próximas tasks (20 min)

**Total:** ~1h15min

### Para Product Owners / Gestores

1. ✅ [RESUMO-SETUP-12NOV2025.md](RESUMO-SETUP-12NOV2025.md) - O que foi feito (5 min)
2. ✅ [PROGRESS-ATUAL.md](PROGRESS-ATUAL.md) - Status atual (15 min)
3. ✅ [ROADMAP.md](ROADMAP.md) - Próximas entregas (15 min)
4. ✅ [README.md](README.md) - Funcionalidades planejadas (20 min)

**Total:** ~55min

### Para Troubleshooting

1. ✅ [SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md) - Problemas e soluções
2. ✅ [COMANDOS.md](COMANDOS.md) - Comandos úteis
3. ✅ Swagger UI (http://localhost:3001/api/docs) - Testar endpoints

---

## 📞 Suporte e Contribuição

### Como Contribuir

1. Ler [README.md](README.md) seção "Contribuindo"
2. Criar branch: `git checkout -b feature/nova-feature`
3. Seguir [Conventional Commits](https://www.conventionalcommits.org/)
4. Abrir Pull Request

### Reportar Problemas

- **Issues GitHub:** https://github.com/betinhochagas/hsi_stock/issues
- **Email:** suporte@hsi.local

---

## 🏷️ Tags e Categorias

### Por Tipo

**📖 Documentação Geral:**
- README.md
- INDEX.md (este arquivo)
- PROJETO.md

**⚡ Guias de Setup:**
- QUICKSTART.md
- SETUP-DOCKER-COMPLETO.md
- COMANDOS.md

**📊 Status e Progresso:**
- PROGRESS-ATUAL.md
- RESUMO-SETUP-12NOV2025.md
- ROADMAP.md

**🏗️ Arquitetura:**
- docs/arquitetura.md
- docs/erd.md
- docs/adr/*.md

**🐳 DevOps:**
- docker-compose.yml
- Dockerfiles
- scripts/

### Por Prioridade de Leitura

**🔴 Essencial (ler primeiro):**
- README.md
- QUICKSTART.md

**🟡 Recomendado:**
- SETUP-DOCKER-COMPLETO.md
- PROGRESS-ATUAL.md
- docs/arquitetura.md

**🟢 Opcional (quando necessário):**
- ROADMAP.md
- ADRs
- COMANDOS.md

---

**Última Atualização:** 12 de Novembro de 2025  
**Versão do Índice:** 1.0  
**Responsável:** Claude 4.5 Sonnet
