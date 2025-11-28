# 🚧 Roadmap de Implementação - Próximas Etapas

Este documento descreve as funcionalidades que precisam ser implementadas para completar o sistema.

---

## ✅ O Que Já Está Pronto

- ✅ Estrutura completa do monorepo (Turborepo)
- ✅ Schema do banco de dados (16 entidades)
- ✅ Autenticação JWT + RBAC
- ✅ CRUD básico de Assets com filtros
- ✅ Health check e métricas
- ✅ Frontend estruturado (Next.js 14)
- ✅ Docker e CI/CD
- ✅ Documentação (README, ADRs, diagramas)
- ✅ Database seed com dados de teste (~64 registros)

---

## 🎯 Fase 1: Backend Core (Prioridade ALTA)

### 1.1 Completar CRUDs REST ⏱️ ~8h

**Categories**
- [ ] GET `/categories` - Listar todas
- [ ] POST `/categories` - Criar nova
- [ ] PATCH `/categories/:id` - Atualizar
- [ ] DELETE `/categories/:id` - Remover

**Locations**
- [ ] GET `/locations` - Listar todas
- [ ] POST `/locations` - Criar nova
- [ ] PATCH `/locations/:id` - Atualizar
- [ ] DELETE `/locations/:id` - Remover

**Manufacturers**
- [ ] GET `/manufacturers` - Listar todos
- [ ] POST `/manufacturers` - Criar novo
- [ ] PATCH `/manufacturers/:id` - Atualizar
- [ ] DELETE `/manufacturers/:id` - Remover

**Suppliers**
- [ ] GET `/suppliers` - Listar todos
- [ ] POST `/suppliers` - Criar novo
- [ ] PATCH `/suppliers/:id` - Atualizar
- [ ] DELETE `/suppliers/:id` - Remover

**Licenses**
- [ ] GET `/licenses` - Listar com filtro de expiração
- [ ] GET `/licenses/:id` - Buscar por ID
- [ ] POST `/licenses` - Criar nova
- [ ] PATCH `/licenses/:id` - Atualizar
- [ ] DELETE `/licenses/:id` - Remover
- [ ] POST `/licenses/:id/assign` - Atribuir seat
- [ ] DELETE `/licenses/:id/revoke/:assignmentId` - Revogar seat

**Movements**
- [ ] GET `/movements` - Listar com filtros (asset, tipo, data)
- [ ] POST `/movements` - Criar movimentação (check-in, check-out, transfer)
- [ ] GET `/assets/:id/movements` - Histórico de um ativo

**Maintenances**
- [ ] GET `/maintenances` - Listar com filtros (status, asset, técnico)
- [ ] POST `/maintenances` - Abrir OS
- [ ] PATCH `/maintenances/:id` - Atualizar status/solução
- [ ] GET `/assets/:id/maintenances` - Histórico de manutenções

**Contracts**
- [ ] GET `/contracts` - Listar com filtro de expiração
- [ ] POST `/contracts` - Criar contrato
- [ ] PATCH `/contracts/:id` - Atualizar
- [ ] DELETE `/contracts/:id` - Remover

**Attachments**
- [ ] POST `/attachments/upload` - Upload de arquivo
- [ ] GET `/attachments/:id` - Download
- [ ] DELETE `/attachments/:id` - Remover

### 1.2 Sistema de Importação CSV ⏱️ ~16h

**Nota:** Backend do wizard está implementado, mas importação de dados reais CSV ainda não foi executada.

**Módulo de Importação**
- [ ] POST `/import/upload` - Upload de CSV
- [ ] POST `/import/detect` - Detectar formato (encoding, delimiter)
  - Usar `chardet` para encoding
  - Heurística para detectar separador
  - Retornar amostra de 100 linhas
- [ ] POST `/import/map` - Mapear colunas
  - Match automático por similaridade
  - Sugestões baseadas em templates YAML
  - Salvar mapeamento como template
- [ ] POST `/import/validate` - Dry-run com validação
  - Validar tipos, obrigatoriedade, formatos
  - Retornar relatório de erros/warnings
  - Sem persistir no banco
- [ ] POST `/import/commit` - Enfileirar job assíncrono
  - Criar `ImportLog` com status PENDING
  - Adicionar job ao BullMQ
- [ ] GET `/import/jobs/:id` - Status do job
  - Retornar progresso (%)
  - Retornar status (PENDING, PROCESSING, COMPLETED, FAILED)

**Worker BullMQ**
- [ ] Configurar Redis + BullMQ
- [ ] Criar worker para processar importações
  - Processar CSV em chunks (streaming)
  - Usar transações Prisma
  - Atualizar `ImportLog` com progresso
  - Rollback em caso de erro crítico
- [ ] Implementar retry (3 tentativas)

**Templates YAML**
- [ ] Parser de YAML
- [ ] Aplicar transformações (normalize_empty, parse_date, etc.)
- [ ] Validações customizadas por template

### 1.3 Sistema de Exportação ⏱️ ~6h

- [ ] POST `/export/csv` - Exportar para CSV
  - Aceitar filtros (mesmos da listagem)
  - Seleção de colunas
  - Streaming para arquivos grandes
- [ ] POST `/export/xlsx` - Exportar para XLSX
  - Usar biblioteca `exceljs`
  - Formatação com cabeçalhos
  - Múltiplas abas (opcional)

### 1.4 Relatórios e Dashboard ⏱️ ~8h

- [ ] GET `/reports/dashboard` - KPIs do dashboard
  - Total de ativos
  - Ativos por status (EM_ESTOQUE, EM_USO, etc.)
  - Licenças a vencer (30, 60, 90 dias)
  - Manutenções abertas
  - Gráfico de tendência (últimos 6 meses)
- [ ] GET `/reports/assets-by-category` - Distribuição por categoria
- [ ] GET `/reports/assets-by-location` - Distribuição por localização
- [ ] GET `/reports/licenses-expiring` - Licenças expirando
- [ ] GET `/reports/maintenances-summary` - Resumo de manutenções

### 1.5 Geração de Etiquetas/QR ⏱️ ~4h

- [ ] POST `/labels/generate` - Gerar PDF com etiquetas
  - Receber array de assetIds
  - Gerar QR code com URL (usando `qrcode`)
  - Gerar código de barras do asset_tag (usando `bwip-js`)
  - Layout A4 otimizado para impressão (usando `pdfkit`)
  - Incluir: logo, nome, asset_tag, QR code

---

## 🎨 Fase 2: Frontend (Prioridade ALTA)

### 2.1 Autenticação e Layout ⏱️ ~8h

- [ ] Criar página de login (`/login`)
  - Formulário com email/senha
  - Validação client-side (react-hook-form + zod)
  - Integração com API `/auth/login`
- [ ] Context de autenticação
  - `useAuth()` hook
  - Armazenar token no localStorage
  - Injetar token em requests (axios interceptor)
- [ ] Layout principal
  - Sidebar com navegação
  - Header com logo + usuário + logout
  - Toggle de tema claro/escuro
- [ ] Proteção de rotas
  - Middleware do Next.js
  - Redirect para /login se não autenticado

### 2.2 Dashboard ⏱️ ~6h

- [ ] Página `/dashboard`
  - Cards com KPIs (totais)
  - Gráficos (recharts ou chart.js)
    - Ativos por status (pizza)
    - Tendência de movimentações (linha)
  - Alertas (licenças a vencer, manutenções pendentes)
  - Tabela de últimas movimentações

### 2.3 Gestão de Ativos ⏱️ ~12h

- [ ] Página `/assets` - Listagem
  - Tabela com TanStack Table
    - Paginação server-side
    - Filtros (status, categoria, localização, busca)
    - Ordenação por coluna
    - Bulk actions (exportar, remover)
  - Botão "Novo Ativo"
  - Botão "Importar CSV"
- [ ] Modal/Página `/assets/new` - Criar ativo
  - Formulário com todos os campos
  - Upload de anexos
  - Validação
- [ ] Modal/Página `/assets/:id/edit` - Editar ativo
- [ ] Página `/assets/:id` - Detalhes do ativo
  - Informações completas
  - Histórico de movimentações
  - Histórico de manutenções
  - Anexos
  - Botões de ação (editar, movimentar, manutenção)

### 2.4 CRUDs Adicionais ⏱️ ~16h

Criar páginas similares para:
- [ ] `/categories` - Categorias
- [ ] `/locations` - Localizações
- [ ] `/manufacturers` - Fabricantes
- [ ] `/suppliers` - Fornecedores
- [ ] `/licenses` - Licenças
  - Incluir visualização de seats disponíveis/usados
  - Modal para atribuir/revogar seats
- [ ] `/users` - Usuários (apenas ADMIN)

### 2.5 Wizard de Importação ⏱️ ~16h

- [ ] Página `/import` - Wizard em 3 passos

**Passo 1: Upload**
- [ ] Drag & drop ou file picker
- [ ] Chamar `/import/upload` e `/import/detect`
- [ ] Exibir amostra (tabela com 10 linhas)
- [ ] Mostrar encoding e separador detectados
- [ ] Botão "Próximo"

**Passo 2: Mapeamento**
- [ ] Para cada coluna do CSV, dropdown com campos do sistema
- [ ] Highlight de sugestões automáticas (verde se confiança alta)
- [ ] Preview do mapeamento (mostrar transformações)
- [ ] Botão "Validar"

**Passo 3: Validação e Commit**
- [ ] Chamar `/import/validate`
- [ ] Exibir estatísticas (total, válidos, inválidos)
- [ ] Tabela de erros/warnings (linha, campo, mensagem)
- [ ] Se OK: botão "Importar" (chama `/import/commit`)
- [ ] Redirecionar para página de progresso
- [ ] Polling de `/import/jobs/:id` para atualizar progresso

### 2.6 Funcionalidades Extras ⏱️ ~8h

- [ ] Página `/reports` - Relatórios
  - Seleção de tipo de relatório
  - Filtros
  - Preview
  - Exportar (CSV/XLSX)
- [ ] Página `/labels` - Geração de etiquetas
  - Seleção de ativos (checkboxes)
  - Preview do PDF
  - Download
- [ ] Notificações in-app (toast)
  - Sucesso/erro em operações
  - Alertas de expiração

---

## 🧪 Fase 3: Testes (Prioridade MÉDIA)

### 3.1 Backend ⏱️ ~12h

- [ ] Testes unitários dos services
  - AssetsService
  - AuthService
  - ImportService
  - ExportService
- [ ] Testes de integração com banco
  - CRUDs completos
  - Validações
- [ ] Testes E2E
  - Fluxo de login
  - Fluxo de importação
  - Fluxo de CRUD de ativos

### 3.2 Frontend ⏱️ ~8h

- [ ] Testes de componentes (React Testing Library)
  - Formulários
  - Tabelas
  - Wizard de importação
- [ ] Testes E2E (Playwright)
  - Login
  - CRUD de ativos
  - Importação CSV

---

## 🔧 Fase 4: Refinamentos (Prioridade BAIXA)

### 4.1 Observabilidade ⏱️ ~4h

- [ ] Logs estruturados (Winston)
- [ ] Integração com Sentry
- [ ] Prometheus metrics endpoint
- [ ] Grafana dashboards (opcional)

### 4.2 Notificações ⏱️ ~6h

- [ ] Configurar SMTP
- [ ] Email de boas-vindas
- [ ] Email de licenças expirando
- [ ] Email de manutenções atrasadas
- [ ] Agendamento com cron jobs

### 4.3 Backup e Segurança ⏱️ ~4h

- [ ] Script de backup automatizado (PostgreSQL dump)
- [ ] Restore de backup
- [ ] Rate limiting por endpoint
- [ ] Blacklist de tokens JWT (Redis)
- [ ] 2FA (opcional)

### 4.4 SSO e Integrações ⏱️ ~8h

- [ ] OAuth 2.0 / OIDC
  - Azure AD
  - Google Workspace
- [ ] API keys para integrações externas

---

## 📊 Estimativas de Tempo

| Fase | Horas | Dias (8h/dia) |
|------|-------|---------------|
| Fase 1: Backend Core | ~42h | ~5 dias |
| Fase 2: Frontend | ~66h | ~8 dias |
| Fase 3: Testes | ~20h | ~2.5 dias |
| Fase 4: Refinamentos | ~22h | ~3 dias |
| **TOTAL** | **~150h** | **~19 dias** |

**Nota:** Estimativas para 1 desenvolvedor full-stack experiente.

---

## 🎯 Milestones

### Milestone 1: MVP Backend (Semana 1)
- ✅ CRUDs completos
- ✅ Importação CSV básica
- ✅ Exportação CSV/XLSX
- ✅ Relatórios do dashboard

### Milestone 2: MVP Frontend (Semana 2)
- ✅ Autenticação
- ✅ Dashboard
- ✅ CRUDs de ativos
- ✅ Wizard de importação

### Milestone 3: Qualidade (Semana 3)
- ✅ Testes backend (>70% cobertura)
- ✅ Testes frontend
- ✅ E2E críticos
- ✅ CI/CD verde

### Milestone 4: Produção (Semana 4)
- ✅ Observabilidade
- ✅ Notificações
- ✅ Deploy
- ✅ Documentação final

---

## 🚀 Como Começar

### Passo 1: Setup do ambiente
\`\`\`powershell
.\scripts\setup.ps1
docker-compose up -d db redis
npm run db:migrate
npm run db:seed
\`\`\`

### Passo 2: Escolher uma task

Recomendação: começar por **1.1 Completar CRUDs REST**, pois:
- Baixo risco
- Reuso de código (copiar de Assets)
- Rápido feedback

### Passo 3: Implementar + Testar

1. Criar branch: `git checkout -b feat/categories-crud`
2. Implementar service + controller + DTOs
3. Testar manualmente (Swagger)
4. Escrever testes unitários
5. Commit: `git commit -m "feat: implementa CRUD de categorias"`
6. Push + PR

### Passo 4: Repetir

Seguir a ordem do roadmap garante que dependências sejam respeitadas.

---

## 📚 Recursos Úteis

**Documentação de Referência:**
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Table](https://tanstack.com/table)
- [React Hook Form](https://react-hook-form.com/)

**Bibliotecas para Implementar:**
- `csv-parse`: Parser de CSV com streaming
- `chardet`: Detecção de encoding
- `exceljs`: Geração de XLSX
- `pdfkit`: Geração de PDF
- `qrcode`: Geração de QR codes
- `bwip-js`: Geração de códigos de barras
- `bullmq`: Filas assíncronas
- `recharts`: Gráficos React

---

## ✅ Checklist de Conclusão

Antes de considerar o projeto "completo":

- [ ] Todos os CRUDs implementados
- [ ] Importação CSV funcional (wizard + jobs)
- [ ] Exportação CSV/XLSX funcional
- [ ] Dashboard com KPIs e gráficos
- [ ] Autenticação + RBAC funcionando
- [ ] Testes com >70% de cobertura
- [ ] CI/CD verde
- [ ] Documentação atualizada
- [ ] Deploy em ambiente de staging
- [ ] Treinamento de usuários

---

**Boa sorte! 🚀**

Para dúvidas, consulte a documentação ou abra uma issue no repositório.
