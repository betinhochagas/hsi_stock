# Arquitetura do Sistema

## Visão Geral

O Sistema de Estoque TI HSI é uma aplicação monorepo TypeScript full-stack organizada em camadas bem definidas.

## Diagrama de Alto Nível

```mermaid
C4Context
    title Diagrama de Contexto - Sistema de Estoque TI HSI
    
    Person(user, "Usuário", "Técnico, Gestor, Admin")
    System(estoque, "Sistema de Estoque HSI", "Gestão de ativos de TI")
    System_Ext(smtp, "Servidor SMTP", "Envio de notificações")
    System_Ext(storage, "Storage", "Armazenamento de arquivos")
    
    Rel(user, estoque, "Usa")
    Rel(estoque, smtp, "Envia emails")
    Rel(estoque, storage, "Armazena anexos")
```

## Diagrama de Containers

```mermaid
C4Container
    title Diagrama de Containers - Sistema de Estoque TI HSI
    
    Person(user, "Usuário")
    
    Container_Boundary(frontend, "Frontend") {
        Container(web, "Aplicação Web", "Next.js 14, React", "Interface do usuário")
    }
    
    Container_Boundary(backend, "Backend") {
        Container(api, "API REST", "NestJS", "Lógica de negócio e endpoints")
        Container(workers, "Workers", "BullMQ", "Jobs assíncronos")
    }
    
    Container_Boundary(data, "Camada de Dados") {
        ContainerDb(db, "Banco de Dados", "PostgreSQL", "Dados persistentes")
        ContainerDb(cache, "Cache/Fila", "Redis", "Cache e jobs")
    }
    
    Container(files, "Storage", "Sistema de Arquivos", "Uploads e anexos")
    
    Rel(user, web, "Usa", "HTTPS")
    Rel(web, api, "Consome", "REST/JSON")
    Rel(api, db, "Lê/Escreve", "Prisma ORM")
    Rel(api, cache, "Usa", "Redis Client")
    Rel(api, files, "Armazena", "File System")
    Rel(workers, cache, "Consome jobs", "BullMQ")
    Rel(workers, db, "Atualiza", "Prisma ORM")
```

## Diagrama de Componentes (Backend)

```mermaid
graph TB
    subgraph "API (NestJS)"
        direction TB
        
        subgraph "Controllers"
            AuthCtrl[Auth Controller]
            AssetsCtrl[Assets Controller]
            ImportCtrl[Import Controller]
            ExportCtrl[Export Controller]
        end
        
        subgraph "Services"
            AuthSvc[Auth Service]
            AssetsSvc[Assets Service]
            ImportSvc[Import Service]
            ExportSvc[Export Service]
            AuditSvc[Audit Service]
        end
        
        subgraph "Guards & Middleware"
            JwtGuard[JWT Guard]
            RoleGuard[Role Guard]
            Throttler[Rate Limiter]
        end
        
        subgraph "Data Layer"
            Prisma[Prisma Service]
            Redis[Redis Service]
        end
    end
    
    AuthCtrl --> AuthSvc
    AssetsCtrl --> AssetsSvc
    ImportCtrl --> ImportSvc
    ExportCtrl --> ExportSvc
    
    AuthSvc --> Prisma
    AssetsSvc --> Prisma
    AssetsSvc --> AuditSvc
    ImportSvc --> Prisma
    ImportSvc --> Redis
    ExportSvc --> Prisma
    
    JwtGuard --> AuthSvc
    
    Prisma --> DB[(PostgreSQL)]
    Redis --> Cache[(Redis)]
```

## Diagrama de Sequência (Importação CSV)

```mermaid
sequenceDiagram
    actor User
    participant Web
    participant API
    participant ImportSvc
    participant Queue
    participant Worker
    participant DB
    
    User->>Web: Upload CSV
    Web->>API: POST /import/upload
    API->>ImportSvc: uploadFile()
    ImportSvc->>ImportSvc: detectFormat()
    ImportSvc-->>API: { encoding, delimiter, sample }
    API-->>Web: Dados detectados
    
    Web->>User: Exibe amostra e mapeamento
    User->>Web: Confirma mapeamento
    Web->>API: POST /import/validate
    API->>ImportSvc: dryRun()
    ImportSvc->>ImportSvc: validateRows()
    ImportSvc-->>API: { errors, warnings, stats }
    API-->>Web: Relatório de validação
    
    alt Validação OK
        Web->>User: Exibe pré-visualização
        User->>Web: Confirma importação
        Web->>API: POST /import/commit
        API->>ImportSvc: createJob()
        ImportSvc->>Queue: enqueue(job)
        Queue-->>ImportSvc: jobId
        ImportSvc-->>API: { jobId }
        API-->>Web: Job criado
        Web-->>User: Importação em andamento
        
        Worker->>Queue: dequeue()
        Worker->>DB: BEGIN TRANSACTION
        loop Para cada linha
            Worker->>DB: INSERT/UPDATE
        end
        Worker->>DB: COMMIT
        Worker->>DB: UPDATE ImportLog
        
        Web->>API: GET /import/jobs/:id
        API-->>Web: { status: "completed" }
        Web-->>User: Importação concluída
    else Validação com erros
        Web-->>User: Exibe erros
    end
```

## Diagrama de Fluxo (Autenticação)

```mermaid
flowchart TD
    Start([Usuário acessa sistema]) --> Login[Página de Login]
    Login --> Submit[Envia email/senha]
    Submit --> ValidateCredentials{Credenciais válidas?}
    
    ValidateCredentials -->|Não| InvalidCred[Erro: Credenciais inválidas]
    InvalidCred --> Login
    
    ValidateCredentials -->|Sim| CheckActive{Usuário ativo?}
    CheckActive -->|Não| InactiveUser[Erro: Usuário inativo]
    InactiveUser --> Login
    
    CheckActive -->|Sim| GenerateJWT[Gerar JWT token]
    GenerateJWT --> ReturnToken[Retornar token + dados do usuário]
    ReturnToken --> StoreToken[Armazenar token no client]
    StoreToken --> Redirect[Redirecionar para Dashboard]
    
    Redirect --> ProtectedRoute[Acessa rota protegida]
    ProtectedRoute --> ValidateJWT{JWT válido?}
    
    ValidateJWT -->|Não| Unauthorized[401 Unauthorized]
    Unauthorized --> Login
    
    ValidateJWT -->|Sim| CheckPermission{Tem permissão?}
    CheckPermission -->|Não| Forbidden[403 Forbidden]
    Forbidden --> Dashboard
    
    CheckPermission -->|Sim| AllowAccess[Acesso permitido]
    AllowAccess --> End([Fim])
    
    Dashboard[Dashboard]
```

## Padrões Arquiteturais

### 1. Monorepo (Turborepo)
- **Workspaces:** `apps/api`, `apps/web`, `packages/db`, `packages/shared`
- **Cache compartilhado:** Builds incrementais
- **Dependências comuns:** Tipagem compartilhada

### 2. Camadas (Layered Architecture)
- **Presentation:** Next.js (SSR/CSR)
- **Application:** NestJS Controllers
- **Domain:** Services e lógica de negócio
- **Infrastructure:** Prisma, Redis, File System

### 3. Dependency Injection (NestJS)
- **Modules:** Organização modular
- **Providers:** Services injetáveis
- **Guards:** Autenticação e autorização

### 4. Repository Pattern (Prisma)
- **Abstração de dados:** Prisma Client
- **Migrations:** Versionadas e declarativas
- **Type-safety:** Geração automática de tipos

### 5. Queue Pattern (Jobs Assíncronos)
- **Producer:** API enfileira jobs
- **Consumer:** Workers processam em background
- **Retry:** Tentativas automáticas em caso de falha

## Fluxo de Dados

### Leitura (Query)
```
User → Web (Next.js) → API (NestJS) → Prisma → PostgreSQL
                                              ↓
                                         Cache (Redis)
```

### Escrita (Mutation)
```
User → Web → API → Prisma → PostgreSQL
                     ↓
                  AuditLog (registra mudança)
```

### Importação (Assíncrona)
```
User → Web → API → Queue (Redis/BullMQ)
                     ↓
                  Worker → Prisma → PostgreSQL
                            ↓
                        ImportLog (progresso)
```

## Segurança

- **Autenticação:** JWT Bearer tokens
- **Autorização:** RBAC (Guards baseados em role)
- **Senhas:** bcrypt (hash + salt)
- **Rate Limiting:** Throttler (60 req/min)
- **Headers:** Helmet (CSP, XSS, etc.)
- **Validação:** class-validator + DTOs
- **CORS:** Whitelist de origins

## Observabilidade

- **Logs:** Estruturados (JSON) com contexto
- **Health Check:** `/health` endpoint
- **Metrics:** `/health/metrics` (contadores básicos)
- **Auditoria:** Tabela `AuditLog` com todas as operações

## Escalabilidade

### Horizontal
- **API:** Stateless, pode rodar N instâncias atrás de load balancer
- **Workers:** Múltiplos workers consumindo da mesma fila Redis

### Vertical
- **PostgreSQL:** Otimização de índices, particionamento
- **Redis:** Clustering para alta disponibilidade

### Caching
- **Redis:** Cache de queries frequentes
- **Next.js:** Static Generation + ISR
