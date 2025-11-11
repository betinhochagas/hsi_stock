# 🏥 Sistema de Estoque TI HSI

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

Sistema completo de gerenciamento de estoque de TI para hospitais e instituições de saúde, com importação de dados via CSV, dashboard analítico, controle de ativos, licenças de software e auditoria completa.

---

## 📋 Índice

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

\`\`\`powershell
# Gerar cliente Prisma
npm run db:generate --workspace=@estoque-hsi/db

# Executar migrações
npm run db:migrate --workspace=@estoque-hsi/db

# Popular com dados iniciais
npm run db:seed --workspace=@estoque-hsi/db
\`\`\`

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

### Opção 1: Com Docker (Recomendado)

\`\`\`powershell
# Subir todos os serviços (db, redis, api, web)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
\`\`\`

A aplicação estará disponível em:
- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs

### Opção 2: Desenvolvimento Local (sem Docker)

#### Passo 1: Banco de dados e Redis

Certifique-se de que PostgreSQL e Redis estão rodando localmente ou ajuste `.env` para apontar para instâncias remotas.

\`\`\`powershell
# Se usar Docker apenas para DB e Redis
docker-compose up -d db redis
\`\`\`

#### Passo 2: Executar migrações e seed

\`\`\`powershell
npm run db:migrate
npm run db:seed
\`\`\`

#### Passo 3: Iniciar aplicações

Em terminais separados:

\`\`\`powershell
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
\`\`\`

Ou use o Turborepo para rodar todos os workspaces:

\`\`\`powershell
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

### Wizard de Importação (3 Passos)

#### Passo 1: Upload e Detecção

1. Faça upload do arquivo CSV
2. O sistema detecta automaticamente:
   - Separador (`;`, `,`, `\t`)
   - Encoding (`UTF-8`, `latin1`)
   - Cabeçalhos
3. Exibe amostra de 100 linhas

#### Passo 2: Mapeamento de Colunas

1. **Mapeamento Automático:** O sistema tenta mapear colunas por heurística
2. **Ajuste Manual:** Corrija mapeamentos incorretos
3. **Validação:** Defina tipos de dados, obrigatoriedade, transformações

#### Passo 3: Pré-visualização e Commit

1. **Dry-run:** Simula a importação sem persistir
2. **Relatório de Inconsistências:** Lista erros (linhas, motivos)
3. **Confirmação:** Só persiste após revisão

### Usando Mapeamentos YAML

Mapeamentos pré-configurados estão em `/data/mappings/*.yaml`. Exemplo:

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

- Hospital Santa Ignês (HSI)
- Comunidades Next.js, NestJS, Prisma
- shadcn/ui e Radix UI

---

## 📞 Suporte

- **Issues:** https://github.com/seu-usuario/stock_hsi/issues
- **Email:** suporte@hsi.local

---

**Desenvolvido com ❤️ para gestão eficiente de ativos de TI**
