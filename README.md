# 🏥 Sistema de Estoque TI HSI

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

Sistema completo de gerenciamento de estoque de TI para hospitais e instituições de saúde, com importação de dados via CSV, dashboard analítico, controle de ativos, licenças de software e auditoria completa.

**🚀 Status Atual:** Backend 100% completo | 56 endpoints REST | Docker parcialmente operacional (DB + Redis UP) | Swagger UI funcional | Database populado

---

## 🎯 Início Rápido

```powershell
# 1. Subir Docker
docker-compose up -d db redis

# 2. Criar banco
Get-Content create_schema.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# 3. Popular dados
Get-Content seed.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# 4. Iniciar API
docker-compose up api -d --build

# 5. Aguardar API inicializar (~30s)
docker logs estoque-hsi-api -f

# 6. Testar: http://localhost:3001/api/docs
```

**📚 Documentação:**
- **[QUICKSTART.md](QUICKSTART.md)** - Guia completo passo a passo
- **[SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)** - Troubleshooting detalhado

---

## 📋 Índice

- [Status do Projeto](#-status-do-projeto)
- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Documentation](#-api-documentation)
- [Importação de Dados](#-importação-de-dados)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)

---

---

## 📊 Status do Projeto

### Componentes Implementados ✅

| Componente | Status | Descrição |
|------------|--------|-----------|
| **Database Schema** | ✅ 100% | 17 tabelas, relacionamentos, índices |
| **Prisma ORM** | ✅ 100% | Client gerado, binary targets configurados |
| **Docker Environment** | ✅ 100% | PostgreSQL, Redis, API containerizados |
| **Auth Module** | ✅ 100% | JWT, bcrypt, Guards, Strategies |
| **Users CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Assets CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Categories CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Locations CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Manufacturers CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Suppliers CRUD** | ✅ 100% | 5 endpoints REST completos |
| **Licenses CRUD** | ✅ 100% | 8 endpoints REST (assign/revoke/expiring) |
| **Movements CRUD** | ✅ 100% | 5 endpoints REST (tracking completo) |
| **Swagger UI** | ✅ 100% | Documentação interativa completa |
| **Health Check** | ✅ 100% | 2 endpoints de monitoramento |

**Total:** 47 endpoints REST documentados e funcionando

### Pendente de Implementação ⏳

| Feature | Prioridade | Estimativa |
|---------|-----------|------------|
| Maintenances Module | � Média | 10h |
| Contracts Module | � Média | 8h |
| Attachments Module | 🟡 Média | 6h |
| Import CSV Wizard | 🔴 Alta | 18h |
| Frontend (Next.js) | 🔴 Alta | 42h |
| Testes (Unit + E2E) | 🟢 Baixa | 20h |

### Próximas Entregas

1. **Sprint 1:** Frontend MVP com Auth + Dashboard (14h) 🔴 PRÓXIMO
2. **Sprint 2:** Assets/Movements/Licenses UI (20h)
3. **Sprint 3:** Wizard de Importação CSV (18h)
4. **Sprint 4:** Testes e módulos secundários (24h)

**📄 Detalhes:** Ver [PROGRESS.md](PROGRESS.md) v5.0.0 (atualizado com backend 100%)

---

## 📚 Documentação Adicional

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de 10 minutos
- **[SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)** - Documentação detalhada do setup Docker
- **[PROGRESS-ATUAL.md](PROGRESS-ATUAL.md)** - Status detalhado do projeto
- **[ROADMAP.md](ROADMAP.md)** - Plano de desenvolvimento (150h)
- **[docs/arquitetura.md](docs/arquitetura.md)** - Diagramas de arquitetura
- **[docs/adr/](docs/adr/)** - Architecture Decision Records

---

## 🎯 Visão Geral

O **Sistema de Estoque TI HSI** é uma aplicação web moderna desenvolvida para gerenciar ativos de tecnologia da informação, incluindo:

- 💻 Hardware (desktops, notebooks, monitores, periféricos)
- 🔌 Equipamentos de rede (cabos, adaptadores, roteadores)
- 🖨️ Impressoras e scanners
- 📱 Dispositivos móveis
- 🔑 Licenças de software
- 📄 Contratos e garantias
- 🔧 Manutenções e ordens de serviço

### Destaques

- ✅ **Importação CSV avançada** com wizard em 3 passos, validação e dry-run
- ✅ **Dashboard analítico** com KPIs e gráficos de tendência
- ✅ **RBAC completo** (Admin, Gestor, Técnico, Leitor)
- ✅ **Auditoria total** de todas as operações
- ✅ **Geração de etiquetas/QR** em PDF para impressão
- ✅ **Exportação CSV/XLSX** com seleção de colunas
- ✅ **API REST documentada** com OpenAPI/Swagger
- ✅ **UI moderna e acessível** com tema claro/escuro
- ✅ **Responsivo** e otimizado para mobile

---

## 🏗️ Arquitetura

```mermaid
graph TB
    subgraph "Frontend"
        Web[Next.js 14<br/>React + TypeScript]
    end
    
    subgraph "Backend"
        API[NestJS<br/>REST API]
        Jobs[BullMQ<br/>Workers]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
        Redis[(Redis)]
    end
    
    subgraph "Storage"
        Files[Uploads<br/>Anexos/CSVs]
    end
    
    Web -->|HTTP/REST| API
    API --> Prisma
    Prisma --> DB
    API --> Jobs
    Jobs --> Redis
    API --> Files
    
    style Web fill:#0070f3
    style API fill:#e0234e
    style DB fill:#336791
    style Redis fill:#dc382d
```

### Decisões Arquiteturais (ADRs)

- [ADR 000: Escolha de Stack](docs/adr/000-escolha-de-stack.md) - TypeScript full-stack com Next.js e NestJS

---

## ✨ Funcionalidades

### 1. Dashboard e Relatórios
- KPIs: ativos totais, em uso, em estoque, inativos
- Alertas: licenças a vencer (30/60/90 dias)
- Gráficos de tendência e distribuição
- Relatórios por categoria, localização, responsável, status

### 2. Gestão de Ativos
- CRUD completo com validações
- Busca full-text (nome, patrimônio, serial)
- Filtros avançados e paginação server-side (100k+ registros)
- Atribuição a usuários/departamentos
- Histórico de movimentações
- Anexos (notas fiscais, fotos)

### 3. Licenças de Software
- Controle de seats (total vs. utilizados)
- Alertas de expiração
- Atribuição a dispositivos/usuários
- Gestão de chaves de ativação

### 4. Movimentações
- Check-in/Check-out
- Transferências entre localizações
- Atribuições e devoluções
- Histórico completo com auditoria

### 5. Manutenções e OS
- Abertura de chamados
- Acompanhamento de status
- Registro de custos e peças
- Técnicos responsáveis

### 6. Importação CSV (Wizard)
- **Passo 1:** Upload/detecção (separador, encoding, amostra)
- **Passo 2:** Mapeamento automático/manual de colunas
- **Passo 3:** Validação, dry-run e commit
- Jobs assíncronos para grandes volumes
- Auditoria de importações (sucessos/erros)

### 7. Exportação
- CSV e XLSX
- Seleção de colunas
- Filtros aplicados

### 8. Etiquetas/QR
- Geração de PDF A4 para impressão
- QR code com link para página do ativo
- Código de barras (asset tag)

### 9. Auditoria
- Trilha completa de mudanças (quem, quando, o quê)
- Logs de autenticação
- Logs de importação/exportação

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Frontend** | Next.js | 14.x | SSR, RSC, App Router, performance |
| **Frontend** | React | 18.x | Componentização, hooks, ecossistema |
| **Frontend** | TypeScript | 5.6.x | Tipagem forte, refatoração segura |
| **Frontend** | Tailwind CSS | 3.4.x | Utility-first, responsivo, customizável |
| **Frontend** | shadcn/ui | latest | Componentes acessíveis (Radix UI) |
| **Backend** | NestJS | 10.x | Arquitetura modular, DI, decorators |
| **Backend** | Node.js | 20.x | Performance em I/O, async/await |
| **ORM** | Prisma | 5.22.x | Type-safe, migrations, schema declarativo |
| **Database** | PostgreSQL | 15.x | ACID, JSON support, performance |
| **Cache/Jobs** | Redis | 7.x | BullMQ para jobs assíncronos |
| **Auth** | JWT | latest | Stateless, Bearer tokens |
| **API Docs** | Swagger/OpenAPI | 3.0 | Documentação automática |
| **Containerização** | Docker | latest | Ambiente reproduzível |
| **Monorepo** | Turborepo | 2.x | Build cache, paralelização |

---

## 📦 Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0 e **Docker Compose** >= 2.0 (para execução com containers)
- **PostgreSQL** >= 15.0 (se rodar sem Docker)
- **Redis** >= 7.0 (se rodar sem Docker)

---

## 🚀 Instalação

### 1. Clone o repositório

\`\`\`powershell
git clone https://github.com/seu-usuario/stock_hsi.git
cd stock_hsi
\`\`\`

### 2. Instale as dependências

\`\`\`powershell
npm install
\`\`\`

### 3. Configure as variáveis de ambiente

\`\`\`powershell
cp .env.example .env
\`\`\`

Edite o arquivo `.env` com suas configurações (veja seção [Configuração](#-configuração)).

### 4. Prepare o banco de dados

**⚠️ No Windows, use SQL direto** (Prisma tem problemas de autenticação com PostgreSQL Docker):

\`\`\`powershell
# Gerar cliente Prisma com binary targets para Docker
cd packages/db
npx prisma generate
cd ../..

# Subir PostgreSQL e Redis
docker-compose up -d db redis

# Aguardar containers ficarem healthy (~30s)
docker-compose ps

# Criar schema do banco
Get-Content create_schema.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# Popular com dados iniciais
Get-Content seed.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# Verificar dados
docker exec estoque-hsi-db psql -U estoque_user -d estoque_hsi -c "SELECT COUNT(*) FROM assets;"
\`\`\`

**ℹ️ Documentação completa:** [SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)

---

## ⚙️ Configuração

### Variáveis de Ambiente (`.env`)

\`\`\`env
# Aplicação
APP_PORT=3000
APP_BASE_URL=http://localhost:3000
NODE_ENV=development

# API
API_PORT=3001
API_PREFIX=/api/v1

# Banco de Dados
DATABASE_URL=postgresql://estoque_user:estoque_pass@localhost:5432/estoque_hsi

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=change_me_in_production_use_strong_random_string
JWT_EXPIRES_IN=7d

# Storage
STORAGE_DIR=./uploads
STORAGE_MAX_SIZE_MB=50

# SMTP (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@estoque-hsi.local

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000
\`\`\`

---

## 🎮 Execução

### Opção 1: Com Docker (Recomendado) ✅

\`\`\`powershell
# Subir todos os serviços (db, redis, api)
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f api

# Parar serviços
docker-compose down
\`\`\`

A aplicação estará disponível em:
- **API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **Web:** http://localhost:3000 (ainda não implementado)

**Status Atual:**
- ✅ Backend 100% completo em Docker
- ✅ 47 endpoints REST documentados (Swagger UI)
- ✅ Database populado com 37 registros seed
- ⏳ Frontend em desenvolvimento (próximo sprint)

### Opção 2: Desenvolvimento Local (sem Docker)

⚠️ **Não recomendado no Windows** devido a problemas de autenticação Prisma.

Se optar por desenvolver localmente:

#### Passo 1: Banco de dados e Redis

Você ainda precisará do Docker para PostgreSQL e Redis:

\`\`\`powershell
# Subir apenas DB e Redis
docker-compose up -d db redis
\`\`\`

#### Passo 2: Executar schema e seed

\`\`\`powershell
# Criar schema
Get-Content create_schema.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# Popular dados
Get-Content seed.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi
\`\`\`

#### Passo 3: Iniciar API localmente

\`\`\`powershell
cd apps/api
npm run dev
\`\`\`

---

## 📂 Estrutura do Projeto

\`\`\`
stock_hsi/
├── apps/
│   ├── api/                  # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/         # Autenticação JWT
│   │   │   ├── users/        # Gestão de usuários
│   │   │   ├── assets/       # CRUD de ativos
│   │   │   ├── categories/
│   │   │   ├── locations/
│   │   │   ├── licenses/
│   │   │   ├── movements/
│   │   │   ├── maintenances/
│   │   │   ├── import/       # Importação CSV
│   │   │   ├── export/       # Exportação
│   │   │   ├── reports/      # Relatórios
│   │   │   ├── prisma/       # Serviço Prisma
│   │   │   ├── health/       # Health check
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                  # Frontend Next.js
│       ├── src/
│       │   ├── app/          # App Router (Next 14)
│       │   ├── components/   # Componentes React
│       │   ├── lib/          # Utilitários
│       │   └── styles/
│       ├── public/
│       │   └── logo.png      # Logo do sistema
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── db/                   # Prisma + Client
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Schema do banco
│   │   │   └── seed.ts       # Dados iniciais
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── shared/               # DTOs, tipos compartilhados
│   │   └── src/
│   │
│   └── ui/                   # shadcn/ui components
│       └── src/
│
├── data/
│   ├── raw/                  # CSVs de entrada
│   ├── mappings/             # YAMLs de mapeamento
│   │   ├── balanco-estoque.yaml
│   │   ├── entrada.yaml
│   │   └── saida.yaml
│   └── processed/            # Relatórios gerados
│
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   │   └── 000-escolha-de-stack.md
│   ├── arquitetura.md        # Diagramas de arquitetura
│   └── erd.md                # Diagrama ER do banco
│
├── scripts/
│   ├── import_csv.ts         # Script de importação manual
│   └── seed.ts               # Script de seed
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── turbo.json
├── package.json
└── README.md
\`\`\`

---

## 📚 API Documentation

### OpenAPI/Swagger

A documentação interativa da API está disponível em:

**http://localhost:3001/api/docs**

### Principais Endpoints

#### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login de usuário |

#### Ativos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/assets` | Listar ativos (com filtros) |
| GET | `/api/v1/assets/:id` | Buscar ativo por ID |
| POST | `/api/v1/assets` | Criar novo ativo |
| PATCH | `/api/v1/assets/:id` | Atualizar ativo |
| DELETE | `/api/v1/assets/:id` | Remover ativo |

#### Importação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/import/upload` | Upload de CSV |
| POST | `/api/v1/import/detect` | Detectar formato e amostra |
| POST | `/api/v1/import/map` | Mapear colunas |
| POST | `/api/v1/import/validate` | Dry-run e validação |
| POST | `/api/v1/import/commit` | Confirmar importação |
| GET | `/api/v1/import/jobs/:id` | Status do job |

#### Exportação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/export/csv` | Exportar para CSV |
| POST | `/api/v1/export/xlsx` | Exportar para XLSX |

#### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/reports/dashboard` | Dados do dashboard |
| GET | `/api/v1/reports/assets-by-category` | Ativos por categoria |
| GET | `/api/v1/reports/licenses-expiring` | Licenças a vencer |

#### Health

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/health/metrics` | Métricas do sistema |

---

## 📊 Importação de Dados

### 🎯 Wizard de Importação CSV - Completo e Inteligente

O sistema possui um **wizard inteligente de 4 passos** para importação segura de dados via CSV:

#### 📤 Passo 1: Upload do Arquivo

**Endpoint:** `POST /api/v1/import/upload`

```bash
curl -X POST http://localhost:3001/api/v1/import/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@inventario.csv"
```

**Resposta:**
```json
{
  "filePath": "uploads/temp/inventario-1234567890.csv",
  "filename": "inventario.csv",
  "size": 524800
}
```

**Validações:**
- ✅ Tamanho máximo: 50MB
- ✅ Formatos aceitos: `.csv`, `.txt`
- ✅ Armazenamento temporário seguro

---

#### 🔍 Passo 2: Detecção Automática de Formato

**Endpoint:** `POST /api/v1/import/detect`

```bash
curl -X POST http://localhost:3001/api/v1/import/detect \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/temp/inventario-1234567890.csv",
    "skipRows": 0
  }'
```

**O sistema detecta automaticamente:**
- 🔤 **Encoding:** UTF-8, Latin1, etc.
- 📊 **Delimitador:** `;`, `,`, `\t`, `|`
- 📋 **Headers:** Extrai nomes das colunas
- 📁 **Tipo de arquivo:** Reconhece formatos especiais (ex: "HSI Inventário")
- 🎯 **Sugestões de mapeamento:** Mapeia colunas CSV → campos do sistema
- 📈 **Estatísticas:** Tempo estimado, linhas vazias, inconsistências

**Resposta:**
```json
{
  "encoding": "utf-8",
  "delimiter": ";",
  "headers": ["Localização", "Hostname", "Patrimônio", "Serial Number CPU"],
  "sample": [
    {
      "Localização": "TI - Sala 102",
      "Hostname": "DESKTOP-001",
      "Patrimônio": "PAT-12345",
      "Serial Number CPU": "SN123456789"
    }
  ],
  "totalRows": 1485,
  "fileType": "hsi-inventario",
  "suggestedMappings": [
    { "csvColumn": "Patrimônio", "systemField": "assetTag", "confidence": 1.0 },
    { "csvColumn": "Hostname", "systemField": "name", "confidence": 1.0 },
    { "csvColumn": "Serial Number CPU", "systemField": "serialNumber", "confidence": 1.0 }
  ],
  "stats": {
    "hasEmptyRows": false,
    "hasInconsistentColumns": false,
    "estimatedProcessingTime": "3 segundos"
  }
}
```

---

#### ✔️ Passo 3: Validação (Dry-Run)

**Endpoint:** `POST /api/v1/import/validate`

```bash
curl -X POST http://localhost:3001/api/v1/import/validate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/temp/inventario-1234567890.csv",
    "fileType": "hsi-inventario",
    "config": {
      "encoding": "utf-8",
      "delimiter": ";"
    }
  }'
```

**O sistema valida SEM persistir dados:**
- 🔍 Verifica campos obrigatórios
- 🔢 Valida tipos de dados
- 🔄 Detecta duplicatas
- 📊 Conta novos vs. existentes
- ⚠️ Lista erros e warnings detalhados
- 📈 Gera preview do que será criado/atualizado

**Resposta:**
```json
{
  "isValid": true,
  "validRows": 1480,
  "errorRows": 3,
  "warningRows": 2,
  "errors": [
    {
      "row": 5,
      "field": "Patrimônio/Hostname",
      "message": "Pelo menos um dos campos deve estar preenchido",
      "severity": "error"
    }
  ],
  "stats": {
    "totalRows": 1485,
    "validRows": 1480,
    "errorRows": 3,
    "warningRows": 2,
    "newAssets": 1470,
    "existingAssets": 10,
    "newLocations": 45,
    "newManufacturers": 12,
    "estimatedDuration": "3 segundos",
    "preview": {
      "assetsToCreate": 1470,
      "assetsToUpdate": 10,
      "movementsToCreate": 1485
    }
  },
  "preview": {
    "assetsToCreate": [
      { "name": "DESKTOP-001", "assetTag": "PAT-12345", "action": "create" },
      { "name": "DESKTOP-002", "assetTag": "PAT-12346", "action": "create" }
    ],
    "assetsToUpdate": [
      { "name": "DESKTOP-100", "assetTag": "PAT-12444", "action": "update", "existingId": "clx..." }
    ]
  }
}
```

---

#### 💾 Passo 4: Confirmação (Commit)

**Endpoint:** `POST /api/v1/import/commit`

```bash
curl -X POST http://localhost:3001/api/v1/import/commit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/temp/inventario-1234567890.csv",
    "fileType": "hsi-inventario",
    "config": {
      "encoding": "utf-8",
      "delimiter": ";"
    }
  }'
```

**Processamento:**
- ✅ Cria registro de auditoria (`ImportLog`)
- ✅ Processa linha por linha
- ✅ Cria/atualiza ativos
- ✅ Registra movimentações
- ✅ Atualiza estatísticas em tempo real

**Resposta:**
```json
{
  "jobId": "sync_clx123456",
  "importLogId": "clx123456",
  "message": "Importação concluída: 1480 registros criados",
  "status": "COMPLETED",
  "totalRows": 1485,
  "successRows": 1480,
  "errorRows": 5
}
```

---

### 🚀 Formatos Suportados

#### 1. HSI Inventário (Detecção Automática)

**Colunas esperadas:**
- Localização, Hostname, Patrimônio
- Serial Number CPU, Fabricante, Modelo
- Tipo de chassi, Monitor 1/2/3, IP, etc.

**Processamento inteligente:**
- ✅ Identifica desktops vs. notebooks
- ✅ Vincula monitores aos computadores
- ✅ Detecta status (EM_USO vs. EM_ESTOQUE)
- ✅ Cria localizações hierárquicas (Setor - Andar - Prédio)
- ✅ Normaliza fabricantes e modelos
- ✅ Registra movimentações automáticas

#### 2. Formato Genérico

Para CSVs personalizados, use mapeamento manual:

```json
{
  "columnMapping": {
    "Nome do Item": "name",
    "Código": "assetTag",
    "Número de Série": "serialNumber",
    "Quantidade": "quantity"
  }
}
```

---

### 📝 Script de Teste Completo

Use o script `test-wizard-full.ts` para testar todo o fluxo:

```bash
# Dry-run (não persiste dados)
npm run tsx scripts/test-wizard-full.ts "HSI Inventário.csv"

# Commit real (persiste dados)
npm run tsx scripts/test-wizard-full.ts "HSI Inventário.csv" --commit
```

**Saída do teste:**
```
═══════════════════════════════════════════════
🧪 TESTE COMPLETO DO WIZARD DE IMPORTAÇÃO CSV
═══════════════════════════════════════════════

🔐 Fazendo login...
✅ Login bem-sucedido (245ms)

📤 Upload do arquivo: HSI Inventário.csv
✅ Upload concluído (1523ms)
   - Arquivo: HSI Inventário.csv
   - Tamanho: 512.34 KB
   - Path: uploads/temp/HSI-Inventário-1234567890.csv

🔍 Detectando formato do CSV...
✅ Formato detectado (892ms)
   - Encoding: utf-8
   - Delimitador: ";"
   - Total de linhas: 1485
   - Tipo detectado: hsi-inventario
   - Headers (25): Localização, Hostname, Patrimônio...
   - Tempo estimado: 3 segundos

✔️  Validando importação (dry-run)...
✅ Validação concluída (4567ms)
   - Status: ✅ Válido
   - Linhas válidas: 1480
   - Linhas com erro: 3
   - Linhas com warning: 2
   - Novos ativos: 1470
   - Ativos existentes: 10

═══════════════════════════════════════════════
📊 RESUMO DO TESTE
═══════════════════════════════════════════════

Total de passos: 4
✅ Sucesso: 4
❌ Falhou: 0
⏱️  Tempo total: 7227ms
```

---

### 🎯 Casos de Uso

#### Caso 1: Migração Inicial de Dados

```bash
# 1. Upload do inventário completo
curl -X POST .../upload -F "file=@inventario-completo.csv"

# 2. Detectar formato
curl -X POST .../detect -d '{"filePath": "..."}'

# 3. Validar (checar erros)
curl -X POST .../validate -d '{"filePath": "...", "fileType": "hsi-inventario"}'

# 4. Confirmar importação
curl -X POST .../commit -d '{"filePath": "...", "fileType": "hsi-inventario"}'
```

#### Caso 2: Atualização Incremental

```bash
# Mesmo fluxo, mas o sistema:
# - Detecta ativos existentes (por patrimônio ou serial)
# - Atualiza apenas campos modificados
# - Registra movimentações se localização mudou
```

---

### Usando Mapeamentos YAML (Futuro)

Mapeamentos pré-configurados estarão em `/data/mappings/*.yaml`. Exemplo:

\`\`\`yaml
# balanco-estoque.yaml
file_type: "balance"
encoding: "utf-8"
delimiter: ";"
skip_rows: 2

column_mappings:
  "Item": "name"
  "Quantidade em estoque": "quantity"

validations:
  - field: "name"
    required: true
    type: "string"
  
  - field: "quantity"
    required: true
    type: "integer"
    min: 0
\`\`\`

### Processamento de CSVs Existentes

Os arquivos CSV do repositório podem ser importados via:

\`\`\`powershell
# Usando script (implementação futura)
npm run import -- --file ./data/raw/Estoque_HSI(Entrada).csv --mapping ./data/mappings/entrada.yaml
\`\`\`

Ou via interface web no wizard de importação.

---

## 🧪 Testes

### Executar todos os testes

\`\`\`powershell
npm run test
\`\`\`

### Testes por workspace

\`\`\`powershell
# Backend (API)
cd apps/api
npm run test

# Frontend (Web)
cd apps/web
npm run test
\`\`\`

### Cobertura

\`\`\`powershell
npm run test:cov
\`\`\`

### Testes E2E

\`\`\`powershell
# Com Playwright (futuro)
npm run test:e2e
\`\`\`

---

## 🚢 Deploy

### Docker Compose (Produção)

1. Configure variáveis de ambiente de produção no `.env`
2. Build e deploy:

\`\`\`powershell
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
\`\`\`

### Deploy em Cloud

#### AWS (ECS + RDS)

1. Build das imagens:
   \`\`\`powershell
   docker build -t estoque-hsi-api -f apps/api/Dockerfile .
   docker build -t estoque-hsi-web -f apps/web/Dockerfile .
   \`\`\`

2. Push para ECR
3. Configure ECS Task Definitions
4. Configure RDS PostgreSQL e ElastiCache Redis
5. Deploy via ECS Service

#### Vercel (Frontend) + Heroku (Backend)

- **Frontend:** Deploy do `apps/web` na Vercel
- **Backend:** Deploy do `apps/api` no Heroku com Heroku Postgres

---

## 🔧 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
\`\`\`powershell
cd packages/db
npx prisma generate
\`\`\`

### Erro: "Port 3000/3001 already in use"

**Solução:** Altere as portas no `.env` ou mate o processo:
\`\`\`powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

### Erro: "Database connection failed"

**Verificações:**
1. PostgreSQL está rodando?
   \`\`\`powershell
   docker-compose ps
   \`\`\`
2. Credenciais no `.env` estão corretas?
3. DATABASE_URL está correta?

### Erro ao importar CSV

**Verificações:**
1. Arquivo está em UTF-8 ou latin1?
2. Separador está correto no YAML de mapeamento?
3. Linhas estão no formato esperado?

### Performance lenta em importações grandes

**Soluções:**
1. Use jobs assíncronos (BullMQ)
2. Importe em lotes menores
3. Aumente recursos do Redis
4. Configure índices no PostgreSQL

---

## 👥 Usuários Padrão (após seed)

| Email | Senha | Papel |
|-------|-------|-------|
| admin@hsi.local | admin123 | ADMIN |
| gestor@hsi.local | gestor123 | GESTOR |
| tecnico@hsi.local | tecnico123 | TECNICO |

**⚠️ IMPORTANTE:** Altere as senhas em produção!

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/nova-funcionalidade\`)
3. Commit suas mudanças (\`git commit -m 'feat: adiciona nova funcionalidade'\`)
4. Push para a branch (\`git push origin feature/nova-funcionalidade\`)
5. Abra um Pull Request

### Commits Convencionais

Use [Conventional Commits](https://www.conventionalcommits.org/):
- \`feat:\` nova funcionalidade
- \`fix:\` correção de bug
- \`docs:\` documentação
- \`refactor:\` refatoração
- \`test:\` testes
- \`chore:\` tarefas de build/config

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- Hospital Santa Isabel (HSI)
- Comunidades Next.js, NestJS, Prisma
- shadcn/ui e Radix UI

---

## 📞 Suporte

- **Issues:** https://github.com/seu-usuario/stock_hsi/issues
- **Email:** suporte@hsi.local

---

**Desenvolvido por Roberto Chagas**
