# 🚀 PLANO DE SPRINTS - Sistema HSI Stock Management

**Versão:** 1.0.0  
**Data:** 26 de Novembro de 2025  
**Status Atual:** MVP 100% Completo + 6 Sprints Entregues  
**Objetivo:** Transformar o sistema em uma solução enterprise-grade robusta e profissional

---

## 📊 RESUMO EXECUTIVO

### Status Atual
✅ **MVP Completo:** Backend (56 endpoints) + Frontend (17 páginas) + Database (3.082 registros)  
✅ **Sprints 1-6 Completos:** Wizard CSV, BullMQ, Reports, Admin UI, Export  
✅ **Sprint 7 Iniciado:** Testes Automatizados (25% - 40 testes unitários passando)  
✅ **Build:** Zero erros TypeScript em todos os workspaces  
✅ **Infraestrutura:** Docker operacional, CI/CD configurado

### O Que Falta para Ser Enterprise-Grade

| Categoria | Implementado | Pendente |
|-----------|--------------|----------|
| **Funcionalidades Core** | 100% | 0% |
| **Testes Automatizados** | 25% | 75% |
| **Segurança Avançada** | 60% | 40% |
| **Performance & Escalabilidade** | 70% | 30% |
| **Observabilidade** | 30% | 70% |
| **UX/UI Polish** | 80% | 20% |
| **Documentação** | 90% | 10% |
| **DevOps & Deploy** | 70% | 30% |

---

## 🎯 ROADMAP DE SPRINTS

### Fase 1: Qualidade e Testes (35h)
- Sprint 7: Testes Automatizados Completos
- Sprint 8: Coverage e Integration Tests

### Fase 2: Segurança e Compliance (28h)
- Sprint 9: Segurança Avançada
- Sprint 10: Auditoria e Compliance

### Fase 3: Performance e Escalabilidade (32h)
- Sprint 11: Otimização de Performance
- Sprint 12: Caching e Database Optimization

### Fase 4: Observabilidade e Monitoramento (24h)
- Sprint 13: Logging Estruturado
- Sprint 14: Monitoring e Alerting

### Fase 5: UX/UI Polish (20h)
- Sprint 15: Interface Refinement
- Sprint 16: Acessibilidade e Mobile

### Fase 6: Features Avançadas (40h)
- Sprint 17: Relatórios Avançados
- Sprint 18: Notificações e Automações
- Sprint 19: Integrations e API Webhooks

### Fase 7: DevOps e Deploy (20h)
- Sprint 20: CI/CD Avançado
- Sprint 21: Deploy Production-Ready

**Total Estimado:** 199 horas (~25 dias úteis)

---

## 📋 DETALHAMENTO DAS SPRINTS

---

## 🧪 FASE 1: QUALIDADE E TESTES

### Sprint 7: Testes Automatizados Completos ⏱️ 20h (25% completo)

**Status:** 🟡 EM ANDAMENTO  
**Prioridade:** 🔴 ALTA  
**Objetivo:** Garantir cobertura de testes >80% em todo o sistema

#### ✅ Concluído (5h)
- [x] Setup Jest com TypeScript
- [x] 40 testes unitários (AuthService, AssetsService, ReportsService, ExportService)
- [x] Coverage >80% nos services testados
- [x] Mock infrastructure (Prisma, JWT, bcrypt)

#### ⏳ Pendente (15h)

**Backend Unit Tests (6h):**
- [ ] CategoriesService (5 testes)
- [ ] LocationsService (5 testes)
- [ ] ManufacturersService (5 testes)
- [ ] SuppliersService (5 testes)
- [ ] LicensesService (8 testes)
- [ ] MovementsService (8 testes)
- [ ] ImportService (12 testes - crítico)
- [ ] QueuesService (6 testes)

**Integration Tests (5h):**
- [ ] Setup test database (Docker Testcontainers)
- [ ] Auth flow E2E (login, JWT, guards)
- [ ] Assets CRUD E2E (create, read, update, delete)
- [ ] Import workflow E2E (upload → detect → validate → commit)
- [ ] Export workflow E2E (CSV/XLSX generation)

**Frontend Tests (4h):**
- [ ] Setup React Testing Library + Jest
- [ ] Component tests (15 principais componentes)
  - [ ] LoginForm
  - [ ] AssetFormDialog
  - [ ] DataTable
  - [ ] ImportWizard (4 steps)
  - [ ] CommitStep (progress bar)
- [ ] Hook tests (use-auth, use-assets, use-import-wizard)

**Critérios de Aceitação:**
- ✅ >80% coverage total
- ✅ CI/CD rodando testes automaticamente
- ✅ All tests passing (0 falhas)
- ✅ <30s execution time (unit tests)

---

### Sprint 8: Coverage e Integration Tests ⏱️ 15h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Atingir 90%+ coverage e testes de integração robustos

#### Backend E2E Tests (6h)
- [ ] Setup Supertest + test database
- [ ] API endpoint tests completos:
  - [ ] /auth/* (login, JWT refresh)
  - [ ] /assets/* (CRUD + filtros + paginação)
  - [ ] /categories/* (CRUD)
  - [ ] /locations/* (CRUD)
  - [ ] /licenses/* (CRUD + assign/revoke)
  - [ ] /movements/* (CRUD + historical tracking)
  - [ ] /import/* (workflow completo)
  - [ ] /export/* (CSV/XLSX generation)
  - [ ] /reports/* (dashboard, by-category, by-location)
- [ ] Test RBAC permissions (Admin, Gestor, Técnico, Leitor)
- [ ] Test error handling (400, 401, 403, 404, 500)

#### Frontend E2E Tests (5h)
- [ ] Setup Playwright
- [ ] User flows completos:
  - [ ] Login flow (success, invalid credentials, inactive user)
  - [ ] Assets management (create, edit, delete, filters, search)
  - [ ] Import wizard (4 steps end-to-end)
  - [ ] Reports navigation (tabs, charts, export buttons)
  - [ ] Movements tracking
  - [ ] Theme toggle (light/dark)
- [ ] Responsive tests (desktop, tablet, mobile)

#### Performance Tests (2h)
- [ ] Load testing com K6 ou Artillery
- [ ] API endpoints críticos:
  - [ ] GET /assets (1000 requisições/s)
  - [ ] POST /import/commit (100 jobs simultâneos)
  - [ ] GET /reports/dashboard (500 requisições/s)
- [ ] Database query profiling (EXPLAIN ANALYZE)

#### Coverage Reports (2h)
- [ ] Configurar Istanbul/NYC para coverage completo
- [ ] Gerar relatórios HTML
- [ ] Integrar com CI/CD (SonarQube ou Codecov)
- [ ] Badge no README.md

**Critérios de Aceitação:**
- ✅ >90% coverage (statements, branches, functions)
- ✅ E2E tests passando em CI/CD
- ✅ Performance benchmarks documentados
- ✅ Coverage reports acessíveis via CI

---

## 🔒 FASE 2: SEGURANÇA E COMPLIANCE

### Sprint 9: Segurança Avançada ⏱️ 16h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🔴 ALTA  
**Objetivo:** Implementar camadas adicionais de segurança enterprise

#### Two-Factor Authentication (6h)
- [ ] Backend: Módulo 2FA (OTP via email ou Authenticator)
  - [ ] Gerar QR code (TOTP - Google Authenticator)
  - [ ] Endpoint POST /auth/2fa/enable
  - [ ] Endpoint POST /auth/2fa/verify
  - [ ] Armazenar secret encriptado no banco
- [ ] Frontend: Página de configuração 2FA
  - [ ] Exibir QR code
  - [ ] Input de verificação (6 dígitos)
  - [ ] Backup codes (10 códigos)
- [ ] Forçar 2FA para role ADMIN

#### Rate Limiting Avançado (3h)
- [ ] Rate limiting por usuário (não só IP)
- [ ] Rate limiting customizado por endpoint:
  - [ ] /auth/login: 5 tentativas/15min
  - [ ] /import/commit: 10 jobs/hora
  - [ ] /export/*: 30 requisições/hora
- [ ] Blacklist temporária de IPs suspeitos (Redis)
- [ ] Whitelist de IPs confiáveis

#### Token Management (4h)
- [ ] JWT refresh tokens (access token: 15min, refresh: 7 dias)
- [ ] Endpoint POST /auth/refresh
- [ ] Blacklist de tokens JWT revogados (Redis)
- [ ] Logout completo (invalidar refresh token)
- [ ] Expiração automática de sessões inativas (24h)

#### Security Headers (1h)
- [ ] Helmet configurado com CSP strict
- [ ] HSTS (HTTP Strict Transport Security)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: no-referrer

#### Secrets Management (2h)
- [ ] Migrar variáveis sensíveis para Vault ou AWS Secrets Manager
- [ ] Rotação automática de JWT_SECRET
- [ ] Encriptar DATABASE_URL em .env (dotenv-vault)
- [ ] Documentar processo de rotação de secrets

**Critérios de Aceitação:**
- ✅ 2FA funcional para ADMIN
- ✅ Rate limiting por usuário implementado
- ✅ Refresh tokens funcionando
- ✅ Security headers em todas as respostas
- ✅ Secrets Manager configurado

---

### Sprint 10: Auditoria e Compliance ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Garantir rastreabilidade completa e compliance

#### Auditoria Completa (5h)
- [ ] Expandir AuditLog:
  - [ ] Registrar IP do usuário
  - [ ] User-Agent (navegador)
  - [ ] Timestamp preciso (timezone UTC)
  - [ ] Diff de mudanças (old value → new value)
- [ ] Auditoria de operações sensíveis:
  - [ ] Criação/edição/deleção de ativos
  - [ ] Atribuição de licenças
  - [ ] Importações CSV (quem, quando, quantos registros)
  - [ ] Exportações (quem exportou, quantas linhas)
  - [ ] Mudanças de permissões de usuários

#### Trilha de Auditoria UI (4h)
- [ ] Página /audit-logs
  - [ ] Tabela com filtros (usuário, ação, recurso, data)
  - [ ] Visualização de diff (JSON diff viewer)
  - [ ] Export de logs (CSV/XLSX)
- [ ] Histórico por ativo (timeline de mudanças)
- [ ] Histórico de movimentações (quem moveu, de onde, para onde)

#### Compliance (2h)
- [ ] LGPD/GDPR compliance:
  - [ ] Endpoint DELETE /users/:id/data (anonimização)
  - [ ] Export de dados do usuário (JSON)
  - [ ] Consentimento de uso de dados (checkbox no cadastro)
- [ ] Políticas de retenção:
  - [ ] Logs de auditoria: 5 anos
  - [ ] Importações: 1 ano (auto-cleanup)

#### Backup e Recovery (1h)
- [ ] Script de backup automatizado (PostgreSQL dump)
  - [ ] Backup diário às 2h da manhã (cron job)
  - [ ] Retenção: 30 dias local, 1 ano em S3
- [ ] Documentar processo de restore
- [ ] Testar restore em ambiente de teste

**Critérios de Aceitação:**
- ✅ Todas operações sensíveis auditadas
- ✅ Página de Audit Logs funcional
- ✅ LGPD compliance implementado
- ✅ Backup automático configurado

---

## ⚡ FASE 3: PERFORMANCE E ESCALABILIDADE

### Sprint 11: Otimização de Performance ⏱️ 18h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Sistema escalável para 100k+ ativos e 1k+ usuários simultâneos

#### Database Optimization (6h)
- [ ] Análise de queries lentas (EXPLAIN ANALYZE)
- [ ] Criar índices compostos:
  - [ ] assets(status, categoryId, locationId)
  - [ ] movements(assetId, createdAt DESC)
  - [ ] audit_logs(userId, resourceType, createdAt DESC)
- [ ] Particionamento de tabelas grandes:
  - [ ] audit_logs por mês (12 partições)
  - [ ] movements por ano
- [ ] Vacuum e reindex periódicos (cron job)
- [ ] Connection pooling otimizado (min: 10, max: 100)

#### API Optimization (5h)
- [ ] Paginação otimizada (cursor-based em vez de offset)
- [ ] Eager loading com Prisma (include relations apenas quando necessário)
- [ ] N+1 query prevention (DataLoader pattern)
- [ ] Compressão de respostas (gzip/brotli)
- [ ] ETag caching (304 Not Modified)

#### Frontend Optimization (5h)
- [ ] Code splitting por rota (Next.js automatic)
- [ ] Lazy loading de componentes pesados (React.lazy)
- [ ] Virtual scrolling para listas grandes (react-window)
- [ ] Debounce em inputs de busca (300ms)
- [ ] Prefetch de rotas comuns (next/link prefetch)
- [ ] Image optimization (next/image)

#### Profiling e Benchmarks (2h)
- [ ] Lighthouse score >90 (Performance, SEO, Accessibility)
- [ ] Bundle size analysis (webpack-bundle-analyzer)
- [ ] API response time <200ms (p95)
- [ ] Database query time <50ms (p95)
- [ ] Documentar métricas baseline

**Critérios de Aceitação:**
- ✅ API response time p95 <200ms
- ✅ Database queries p95 <50ms
- ✅ Frontend Lighthouse score >90
- ✅ Bundle size <500KB (gzipped)

---

### Sprint 12: Caching e Database Optimization ⏱️ 14h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Reduzir carga no banco e melhorar throughput

#### Redis Caching (6h)
- [ ] Cache de queries frequentes:
  - [ ] GET /assets (por filtros, 5 minutos TTL)
  - [ ] GET /reports/dashboard (10 minutos TTL)
  - [ ] GET /categories (30 minutos TTL)
  - [ ] GET /locations (30 minutos TTL)
- [ ] Cache invalidation strategy:
  - [ ] Invalidar ao criar/editar/deletar
  - [ ] Tag-based invalidation (Redis SCAN)
- [ ] Cache warming (popular cache no startup)

#### Query Result Caching (4h)
- [ ] Prisma query result caching (Accelerate)
- [ ] Cache de agregações pesadas:
  - [ ] Dashboard metrics (10min)
  - [ ] Reports by-category (15min)
  - [ ] Licenses expiring (1h)
- [ ] Stale-while-revalidate pattern

#### Database Read Replicas (2h)
- [ ] Configurar read replica (PostgreSQL replication)
- [ ] Separar queries de leitura (SELECT) e escrita (INSERT/UPDATE)
- [ ] Load balancing entre replicas (pgpool ou HAProxy)

#### Full-Text Search (2h)
- [ ] PostgreSQL Full-Text Search (tsvector, tsquery)
- [ ] Índice GIN para busca rápida:
  - [ ] assets(name, description, assetTag, serialNumber)
- [ ] Ranking de resultados (ts_rank)
- [ ] Suporte a operadores (AND, OR, NOT)

**Critérios de Aceitação:**
- ✅ Cache hit rate >80% (queries frequentes)
- ✅ Read replica funcionando
- ✅ Full-text search <100ms
- ✅ Database CPU usage reduzido em 40%

---

## 📊 FASE 4: OBSERVABILIDADE E MONITORAMENTO

### Sprint 13: Logging Estruturado ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Logs estruturados e centralizados para debugging

#### Winston Logger (4h)
- [ ] Configurar Winston com transports:
  - [ ] Console (development)
  - [ ] File (production, rotation diária)
  - [ ] Syslog ou Sentry (errors críticos)
- [ ] Log levels: error, warn, info, http, debug
- [ ] Formato JSON estruturado:
  ```json
  {
    "timestamp": "2025-11-26T10:30:00Z",
    "level": "info",
    "message": "Asset created",
    "context": {
      "userId": "clx...",
      "assetId": "clx...",
      "action": "CREATE"
    },
    "trace": "request-uuid"
  }
  ```

#### Request Context (3h)
- [ ] Middleware para adicionar requestId (UUID)
- [ ] Correlação de logs (rastrear requisição completa)
- [ ] Log de entrada/saída de requests:
  - [ ] Method, URL, status code, duration
  - [ ] User-Agent, IP
- [ ] Sanitizar dados sensíveis (passwords, tokens)

#### Error Tracking (3h)
- [ ] Integração com Sentry:
  - [ ] Capturar exceções não tratadas
  - [ ] Stack traces completas
  - [ ] Contexto de requisição
  - [ ] User context (userId, email)
- [ ] Error boundaries no frontend (React)
- [ ] Toast notifications para erros de API

#### Log Management (2h)
- [ ] Configurar log aggregation (Loki ou CloudWatch)
- [ ] Criar dashboards no Grafana:
  - [ ] Errors por tipo
  - [ ] Requests por endpoint
  - [ ] Latência por endpoint
- [ ] Alertas para erros críticos (Slack ou email)

**Critérios de Aceitação:**
- ✅ Logs estruturados em JSON
- ✅ Sentry capturando erros
- ✅ Request correlation funcionando
- ✅ Dashboards no Grafana

---

### Sprint 14: Monitoring e Alerting ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Monitoramento proativo e alertas em tempo real

#### Prometheus Metrics (5h)
- [ ] Instrumentar API com Prometheus:
  - [ ] Contador de requests por endpoint
  - [ ] Histograma de latência
  - [ ] Gauge de conexões ativas
  - [ ] Contador de erros por tipo
- [ ] Métricas de negócio:
  - [ ] Ativos criados/dia
  - [ ] Importações concluídas/hora
  - [ ] Jobs BullMQ por status
- [ ] Endpoint /metrics para scraping

#### Grafana Dashboards (4h)
- [ ] Dashboard "System Overview":
  - [ ] CPU, Memória, Disco (Node.js)
  - [ ] Requests/s, Errors/s
  - [ ] P50, P95, P99 latência
- [ ] Dashboard "Business Metrics":
  - [ ] Ativos totais (gauge)
  - [ ] Movimentações/dia (line chart)
  - [ ] Importações ativas (counter)
- [ ] Dashboard "Database":
  - [ ] Connections pool usage
  - [ ] Query time (histogram)
  - [ ] Slow queries count

#### Health Checks (2h)
- [ ] Expandir /health endpoint:
  - [ ] Database status (ping query)
  - [ ] Redis status (ping)
  - [ ] Disk usage
  - [ ] Memory usage
- [ ] Liveness probe (Kubernetes)
- [ ] Readiness probe (Kubernetes)

#### Alerting (1h)
- [ ] Configurar Prometheus Alertmanager:
  - [ ] Alerta: API latency p95 >500ms (5 minutos)
  - [ ] Alerta: Error rate >5% (1 minuto)
  - [ ] Alerta: Database connections >80% pool
  - [ ] Alerta: Disk usage >85%
- [ ] Integração com Slack, PagerDuty ou email

**Critérios de Aceitação:**
- ✅ Prometheus coletando métricas
- ✅ 3 dashboards Grafana funcionais
- ✅ Health checks respondendo
- ✅ Alertas configurados e testados

---

## 🎨 FASE 5: UX/UI POLISH

### Sprint 15: Interface Refinement ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟢 BAIXA  
**Objetivo:** Polimento final da interface para excelência UX

#### Design System (4h)
- [ ] Documentar componentes (Storybook):
  - [ ] Buttons (variants, sizes, states)
  - [ ] Inputs (text, select, date, file)
  - [ ] Cards, Badges, Alerts
  - [ ] DataTable, Charts
- [ ] Consistency audit:
  - [ ] Cores (primary, secondary, accent)
  - [ ] Espaçamentos (padding, margin)
  - [ ] Tipografia (font sizes, weights)
  - [ ] Bordas (border-radius)

#### Micro-interactions (3h)
- [ ] Loading states suaves (skeleton screens)
- [ ] Transições entre páginas (framer-motion)
- [ ] Animações de sucesso (check animation)
- [ ] Hover effects em botões e cards
- [ ] Focus states para acessibilidade

#### Empty States (2h)
- [ ] Ilustrações customizadas:
  - [ ] Assets list vazia ("Nenhum ativo cadastrado")
  - [ ] Search sem resultados ("Nenhum resultado encontrado")
  - [ ] Reports sem dados ("Sem dados para exibir")
- [ ] Call-to-actions claros ("Cadastrar primeiro ativo")

#### Error States (2h)
- [ ] Páginas de erro customizadas:
  - [ ] 404 Not Found (ilustração + link Home)
  - [ ] 500 Internal Error (ilustração + "Tente novamente")
  - [ ] 403 Forbidden (ilustração + "Sem permissão")
- [ ] Inline error messages amigáveis
- [ ] Toast notifications consistentes

#### Onboarding (1h)
- [ ] Tour guiado (primeira vez):
  - [ ] Spotlight em features principais
  - [ ] Tooltips explicativos
  - [ ] Checklist de setup inicial

**Critérios de Aceitação:**
- ✅ Storybook com >30 componentes documentados
- ✅ Loading states em todas as páginas
- ✅ Empty states customizados
- ✅ Páginas de erro 404/500/403

---

### Sprint 16: Acessibilidade e Mobile ⏱️ 8h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟢 BAIXA  
**Objetivo:** Garantir acessibilidade WCAG 2.1 AA e UX mobile impecável

#### Acessibilidade (5h)
- [ ] Audit com Lighthouse Accessibility (score >95)
- [ ] Navegação por teclado completa (Tab, Enter, Esc)
- [ ] ARIA labels em todos os elementos interativos
- [ ] Foco visível em inputs e botões
- [ ] Contraste de cores WCAG AA (4.5:1)
- [ ] Screen reader friendly:
  - [ ] Testar com NVDA/JAWS
  - [ ] Anunciar mudanças dinâmicas (aria-live)
- [ ] Skip to content link
- [ ] Acessibilidade em modals (focus trap)

#### Mobile Responsiveness (3h)
- [ ] Audit responsivo (320px → 1920px)
- [ ] Sidebar colapsável em mobile (<768px)
- [ ] DataTable scrollável horizontalmente
- [ ] Botões touch-friendly (min 44px)
- [ ] Formulários otimizados:
  - [ ] Input type correto (email, tel, number)
  - [ ] Autocomplete atributos
  - [ ] Virtual keyboard otimizado
- [ ] Gestos mobile (swipe to delete, pull to refresh)

**Critérios de Aceitação:**
- ✅ Lighthouse Accessibility score >95
- ✅ Navegação por teclado 100%
- ✅ WCAG 2.1 AA compliance
- ✅ Mobile funcional em 320px-1920px

---

## 🚀 FASE 6: FEATURES AVANÇADAS

### Sprint 17: Relatórios Avançados ⏱️ 16h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Relatórios executivos e analíticos avançados

#### Relatórios Customizáveis (6h)
- [ ] Report Builder UI:
  - [ ] Seleção de campos (drag-and-drop)
  - [ ] Filtros avançados (AND/OR logic)
  - [ ] Agrupamentos customizados
  - [ ] Ordenação múltipla
- [ ] Salvar templates de relatórios
- [ ] Compartilhar relatórios (link público ou privado)

#### Gráficos Avançados (5h)
- [ ] Novos tipos de gráficos:
  - [ ] Heatmap (ativos por localização × categoria)
  - [ ] Treemap (distribuição hierárquica)
  - [ ] Gauge charts (utilização de licenças)
  - [ ] Sankey diagram (fluxo de movimentações)
- [ ] Interatividade:
  - [ ] Zoom, pan em gráficos
  - [ ] Drill-down (clicar em categoria → ver ativos)
  - [ ] Export de gráficos (PNG, SVG)

#### Scheduled Reports (3h)
- [ ] Agendar relatórios recorrentes:
  - [ ] Diário, semanal, mensal
  - [ ] Enviar por email (PDF anexo)
  - [ ] Configurar destinatários
- [ ] Job scheduler (BullMQ cron jobs)
- [ ] Preview antes de enviar

#### Dashboards Personalizados (2h)
- [ ] Múltiplos dashboards por usuário:
  - [ ] Dashboard Executivo (KPIs gerais)
  - [ ] Dashboard Técnico (OS, manutenções)
  - [ ] Dashboard Financeiro (custos, depreciação)
- [ ] Widgets customizáveis (resize, reorder)
- [ ] Salvar layouts por usuário

**Critérios de Aceitação:**
- ✅ Report Builder funcional
- ✅ 4 novos tipos de gráficos
- ✅ Scheduled reports enviando emails
- ✅ Dashboards personalizáveis

---

### Sprint 18: Notificações e Automações ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Notificações proativas e automações de processos

#### Notificações In-App (4h)
- [ ] Centro de notificações (bell icon):
  - [ ] Badge com contador de não lidas
  - [ ] Lista de notificações (últimas 50)
  - [ ] Marcar como lida/não lida
  - [ ] Filtrar por tipo (info, warning, error)
- [ ] Tipos de notificações:
  - [ ] Licença a vencer em 30 dias
  - [ ] Manutenção atrasada
  - [ ] Importação concluída
  - [ ] Asset atribuído a você
  - [ ] Aprovação pendente (workflows futuros)

#### Email Notifications (4h)
- [ ] Configurar SMTP (SendGrid, Mailgun ou AWS SES)
- [ ] Templates de email (Handlebars):
  - [ ] Bem-vindo (novo usuário)
  - [ ] Reset de senha
  - [ ] Licença expirando
  - [ ] Relatório agendado
  - [ ] Alerta de sistema (erro crítico)
- [ ] Preferências de notificação por usuário:
  - [ ] Ativar/desativar emails
  - [ ] Frequência (instantâneo, diário, semanal)
  - [ ] Tipos de notificação

#### Automações (4h)
- [ ] Workflows automáticos:
  - [ ] Licença expira → Notificar gestor
  - [ ] Asset parado >30 dias → Marcar como INATIVO
  - [ ] Movimentação → Atualizar status automaticamente
  - [ ] Importação falha → Notificar ADMIN
- [ ] Regras configuráveis (rule engine simples)
- [ ] Log de automações executadas

**Critérios de Aceitação:**
- ✅ Centro de notificações funcional
- ✅ Emails enviando via SMTP
- ✅ 4 automações configuradas
- ✅ Preferências de notificação por usuário

---

### Sprint 19: Integrations e API Webhooks ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟢 BAIXA  
**Objetivo:** Integração com sistemas externos

#### API Public Documentation (3h)
- [ ] Documentação pública da API:
  - [ ] Expandir Swagger com exemplos detalhados
  - [ ] Guia de autenticação (JWT)
  - [ ] Rate limits documentados
  - [ ] Exemplos em cURL, JavaScript, Python
- [ ] API versioning (v1, v2):
  - [ ] Rotas: /api/v1/*, /api/v2/*
  - [ ] Deprecation notices

#### API Keys (3h)
- [ ] Gerar API keys para integrações:
  - [ ] Página /settings/api-keys
  - [ ] Criar, listar, revogar keys
  - [ ] Permissões por key (read, write, admin)
- [ ] Middleware de autenticação via API key:
  - [ ] Header: `X-API-Key: <key>`
  - [ ] Verificar key no banco (hashed)

#### Webhooks (4h)
- [ ] Registrar webhooks:
  - [ ] URL, eventos (asset.created, license.expired)
  - [ ] Secret para validação (HMAC)
- [ ] Enviar eventos via HTTP POST:
  - [ ] Payload JSON com dados do evento
  - [ ] Retry automático (3x) se falhar
  - [ ] Log de entregas (success, failed)
- [ ] Webhook UI:
  - [ ] Listar webhooks ativos
  - [ ] Testar webhook (ping)
  - [ ] Ver histórico de entregas

#### Integrações Prontas (2h)
- [ ] Slack integration:
  - [ ] Notificar canal quando importação concluir
  - [ ] Alertas de licenças expirando
- [ ] Microsoft Teams integration (opcional)

**Critérios de Aceitação:**
- ✅ API public documentation publicada
- ✅ API keys funcionando
- ✅ Webhooks enviando eventos
- ✅ Integração Slack testada

---

## 🚢 FASE 7: DEVOPS E DEPLOY

### Sprint 20: CI/CD Avançado ⏱️ 12h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🟡 MÉDIA  
**Objetivo:** Pipeline CI/CD completo com deploy automatizado

#### GitHub Actions Enhancement (4h)
- [ ] Workflow CI completo:
  - [ ] Lint (ESLint, Prettier)
  - [ ] Type check (tsc --noEmit)
  - [ ] Unit tests (Jest)
  - [ ] Integration tests (Supertest)
  - [ ] E2E tests (Playwright)
  - [ ] Coverage report (Codecov)
- [ ] Matrix builds (Node 18, 20, 22)
- [ ] Cache de dependências (npm, Turbo)

#### Docker Multi-Stage (3h)
- [ ] Otimizar Dockerfiles:
  - [ ] Multi-stage builds (builder → runner)
  - [ ] Cache de layers (npm install)
  - [ ] Imagens mínimas (distroless ou alpine)
  - [ ] Tamanho <200MB (API), <100MB (Web)
- [ ] Docker Compose para CI (Testcontainers)

#### CD Pipeline (3h)
- [ ] Deploy automático em staging:
  - [ ] Trigger: push em branch `develop`
  - [ ] Deploy em AWS ECS ou DigitalOcean App Platform
  - [ ] Smoke tests após deploy
- [ ] Deploy manual em production:
  - [ ] Trigger: tag de release (v1.0.0)
  - [ ] Aprovação manual (GitHub Environments)
  - [ ] Rollback automático se health check falhar

#### Infrastructure as Code (2h)
- [ ] Terraform para provisionamento:
  - [ ] RDS PostgreSQL (production)
  - [ ] ElastiCache Redis (production)
  - [ ] ECS/Fargate para API
  - [ ] S3 para uploads
- [ ] Scripts de migrate e seed

**Critérios de Aceitação:**
- ✅ CI rodando em <5min
- ✅ Coverage reports no Codecov
- ✅ Deploy automático em staging
- ✅ Infrastructure as Code (Terraform)

---

### Sprint 21: Deploy Production-Ready ⏱️ 8h

**Status:** 🔵 PLANEJADA  
**Prioridade:** 🔴 ALTA  
**Objetivo:** Sistema pronto para produção com HA e DR

#### High Availability (3h)
- [ ] Load balancer (AWS ALB ou NGINX):
  - [ ] Distribuir tráfego entre N instâncias da API
  - [ ] Health checks (remover instâncias unhealthy)
  - [ ] SSL/TLS termination
- [ ] Auto-scaling:
  - [ ] Min: 2 instâncias, Max: 10
  - [ ] Scale up se CPU >70% (2 minutos)
  - [ ] Scale down se CPU <30% (5 minutos)

#### Disaster Recovery (2h)
- [ ] Backup automatizado:
  - [ ] Database: snapshots diários (retenção 30 dias)
  - [ ] Uploads: sync para S3 (versioning habilitado)
- [ ] Restore testado:
  - [ ] Procedimento documentado
  - [ ] RTO: <1 hora, RPO: <24 horas

#### SSL/TLS (1h)
- [ ] Certificado SSL (Let's Encrypt ou AWS ACM)
- [ ] Forçar HTTPS (redirect HTTP → HTTPS)
- [ ] HSTS header (max-age=31536000)

#### Domain e DNS (1h)
- [ ] Registrar domínio (ex: estoque-hsi.com.br)
- [ ] Configurar DNS (Route 53 ou Cloudflare):
  - [ ] A record: api.estoque-hsi.com.br → Load Balancer
  - [ ] CNAME: www.estoque-hsi.com.br → app.estoque-hsi.com.br
- [ ] CDN para assets estáticos (CloudFront)

#### Documentation Final (1h)
- [ ] Runbook de produção:
  - [ ] Como fazer deploy
  - [ ] Como fazer rollback
  - [ ] Como acessar logs
  - [ ] Contatos de emergência
- [ ] Atualizar README.md com URLs de produção

**Critérios de Aceitação:**
- ✅ Sistema rodando com HA (≥2 instâncias)
- ✅ Backup e restore testados
- ✅ SSL/TLS configurado
- ✅ Domínio público acessível

---

## 📊 RESUMO GERAL

### Esforço Total por Fase

| Fase | Sprints | Horas | Dias (8h) |
|------|---------|-------|-----------|
| 1. Qualidade e Testes | 2 | 35h | 4.5 dias |
| 2. Segurança e Compliance | 2 | 28h | 3.5 dias |
| 3. Performance e Escalabilidade | 2 | 32h | 4 dias |
| 4. Observabilidade e Monitoramento | 2 | 24h | 3 dias |
| 5. UX/UI Polish | 2 | 20h | 2.5 dias |
| 6. Features Avançadas | 3 | 40h | 5 dias |
| 7. DevOps e Deploy | 2 | 20h | 2.5 dias |
| **TOTAL** | **15** | **199h** | **25 dias** |

### Priorização Recomendada

**🔴 Alta Prioridade (Deploy Inicial):**
1. Sprint 7: Testes Automatizados ✅ 25% completo
2. Sprint 9: Segurança Avançada
3. Sprint 20: CI/CD Avançado
4. Sprint 21: Deploy Production-Ready

**Subtotal:** 56h (~7 dias) → **Sistema em produção seguro e testado**

---

**🟡 Média Prioridade (Pós-Deploy):**
5. Sprint 8: Coverage e Integration Tests
6. Sprint 10: Auditoria e Compliance
7. Sprint 11: Otimização de Performance
8. Sprint 13: Logging Estruturado
9. Sprint 14: Monitoring e Alerting
10. Sprint 17: Relatórios Avançados
11. Sprint 18: Notificações e Automações

**Subtotal:** 103h (~13 dias) → **Sistema enterprise-grade**

---

**🟢 Baixa Prioridade (Refinamento):**
12. Sprint 12: Caching e Database Optimization
13. Sprint 15: Interface Refinement
14. Sprint 16: Acessibilidade e Mobile
15. Sprint 19: Integrations e API Webhooks

**Subtotal:** 40h (~5 dias) → **Polimento final**

---

## 🎯 ESTRATÉGIA DE EXECUÇÃO

### Abordagem Recomendada: Phased Rollout

#### Fase Alpha (56h - 1.5 semanas)
**Objetivo:** Sistema pronto para deploy em produção

✅ Sprint 7: Completar testes automatizados  
✅ Sprint 9: Segurança avançada (2FA, rate limiting)  
✅ Sprint 20: CI/CD pipeline completo  
✅ Sprint 21: Deploy HA com SSL/TLS  

**Resultado:** Sistema 100% funcional em produção com testes e segurança

---

#### Fase Beta (103h - 3 semanas)
**Objetivo:** Features enterprise e observabilidade

✅ Sprint 8: Coverage 90%+  
✅ Sprint 10: Auditoria completa  
✅ Sprint 11: Performance otimizada  
✅ Sprint 13: Logs estruturados + Sentry  
✅ Sprint 14: Prometheus + Grafana  
✅ Sprint 17: Relatórios avançados  
✅ Sprint 18: Notificações e automações  

**Resultado:** Sistema enterprise-grade com observabilidade completa

---

#### Fase Gamma (40h - 1 semana)
**Objetivo:** Polimento e integrações

✅ Sprint 12: Caching Redis  
✅ Sprint 15: UI refinement + Storybook  
✅ Sprint 16: Acessibilidade WCAG AA  
✅ Sprint 19: API webhooks + integrações  

**Resultado:** Sistema polido, acessível e integrável

---

## 📈 MÉTRICAS DE SUCESSO

### Qualidade
- ✅ >90% test coverage
- ✅ Zero erros TypeScript
- ✅ Lighthouse score >90
- ✅ WCAG 2.1 AA compliance

### Performance
- ✅ API response time p95 <200ms
- ✅ Database query time p95 <50ms
- ✅ Frontend First Contentful Paint <1.5s
- ✅ Bundle size <500KB gzipped

### Segurança
- ✅ 2FA habilitado para ADMIN
- ✅ Rate limiting por usuário
- ✅ Secrets em Vault
- ✅ Security headers completos

### Observabilidade
- ✅ Logs estruturados em JSON
- ✅ Prometheus + Grafana dashboards
- ✅ Sentry error tracking
- ✅ Alertas configurados

### Deploy
- ✅ CI/CD pipeline <5min
- ✅ Deploy automático em staging
- ✅ HA com ≥2 instâncias
- ✅ Backup/restore testado

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Esta Semana)
1. **Finalizar Sprint 7** (15h restantes):
   - Completar testes unitários dos services restantes
   - Implementar integration tests
   - Configurar frontend tests (React Testing Library)

### Curto Prazo (Próximas 2 Semanas)
2. **Executar Fase Alpha** (56h):
   - Sprint 9: Segurança Avançada
   - Sprint 20: CI/CD Avançado
   - Sprint 21: Deploy Production

### Médio Prazo (Próximo Mês)
3. **Executar Fase Beta** (103h):
   - Sprints 8, 10, 11, 13, 14, 17, 18
   - Sistema enterprise-grade completo

### Longo Prazo (Próximos 2 Meses)
4. **Executar Fase Gamma** (40h):
   - Sprints 12, 15, 16, 19
   - Polimento e integrações finais

---

## 📝 CONCLUSÃO

Este plano de sprints transforma o sistema de **MVP funcional** para uma **solução enterprise-grade robusta e profissional** através de:

✅ **15 sprints bem definidas** (199h total)  
✅ **Priorização clara** (Alta → Média → Baixa)  
✅ **Phased rollout** (Alpha → Beta → Gamma)  
✅ **Métricas de sucesso** mensuráveis  
✅ **Critérios de aceitação** específicos  

**Sistema atual:** MVP 100% funcional, testado manualmente, rodando em Docker  
**Sistema futuro:** Enterprise-grade, HA, monitorado, testado (>90%), seguro, escalável

**Tempo estimado para produção:** 7-10 dias úteis (Fase Alpha)  
**Tempo estimado para enterprise-grade:** 25 dias úteis (todas as fases)

---

**Documento criado por:** Claude 4.5 Sonnet  
**Data:** 26 de Novembro de 2025  
**Versão:** 1.0.0
