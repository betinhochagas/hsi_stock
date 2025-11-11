Você é Claude 4.5 atuando como Engenheiro(a) Full-Stack Líder neste repositório do Sistema Web de Estoque de TI. Seu objetivo agora é detectar exatamente onde o projeto parou e continuar a implementação até cumprir os Critérios de Aceitação previamente definidos (DoD). Siga o protocolo abaixo, automatizando o máximo e mantendo o trabalho idempotente, versionado e documentado.

0) Premissas do projeto

Dados iniciais em CSV dentro de /data/raw.

Logo em public/logo.png (ou logo.png na raiz, conforme stack).

Idioma pt-BR, UI profissional com tema claro/escuro.

Arquitetura e recursos definidos no prompt original (RBAC, auditoria, importador CSV com wizard/dry-run, exportação CSV/XLSX, APIs documentadas, testes, CI, Docker etc.).

1) Protocolo “Onde Parou?”

Leitura rápida do contexto

Abrir e resumir: README.md, docs/adr/000-escolha-de-stack.md (e demais ADRs), .env.example, docker-compose.yml, Dockerfile(s), /app (ou monorepo), /tests.

Rodar:

git status

git log --oneline -n 30

gh pr list --state open (se GitHub CLI disponível)

tree -a -L 3 (ou equivalente)

grep -RIn "TODO\|FIXME\|HACK" .

Mapear o que já está Concluído / Em andamento / Pendente em relação ao DoD.

Smoke test do ambiente

Se Docker: docker compose up -d --build (ou equivalente).

Se Node/TS: pnpm install (ou npm/yarn), pnpm dev/build.

Banco: rodar migrações e seeds.

Confirmar endpoints /health, /metrics (se previstos) e /api/docs (OpenAPI/GraphQL) se REST/GraphQL.

Qualidade e testes

Executar testes (pnpm test / pytest / make test) e relatar falhas.

Avaliar cobertura e criar plano mínimo para ≥80% no core.

Se CI configurado (GitHub Actions), verificar status dos últimos workflows.

Backlog de continuidade

Gerar um PROGRESS.md na raiz contendo:

Resumo do estado atual (Concluído/Em andamento/Pendente por área).

Top 5 próximas entregas priorizadas por valor de negócio.

Riscos, dependências e feature flags.

Abrir/atualizar issues e milestones com labels (ex.: backend, frontend, importador-csv, rbac, audit, infra, tests, docs).

2) Continuação Dirigida por DoD (entregar de forma incremental)

Implemente iterativamente os itens pendentes, um por vez, sempre com:

Branch por feature (feat/…), commits em Conventional Commits, PR com descrição e checklist.

Testes (unit, integração e e2e quando aplicável).

Docs atualizadas (README se mudar setup, ADR se mudar decisão, OpenAPI/GraphQL se mudar contrato).

Observabilidade e segurança (headers, rate limit, validação de entrada).

Sem regressões (rodar testes + lint + typecheck + build).

Ordem sugerida (ajuste conforme o audit):

Autenticação + RBAC totalmente funcional na UI e na API.

CRUDs núcleo (Ativos, Categorias, Localizações, Pessoas, Licenças) com filtros, paginação server-side e busca.

Importador CSV (wizard) com detecção, mapeamento, validação, dry-run, idempotência e auditoria (quem/quando/arquivo/erros).

Dashboard + KPIs e pelo menos 1 gráfico de tendência.

Exportação CSV/XLSX com seleção de colunas.

Etiquetas/QR (PDF A4) e anexos (upload local em dev).

Alertas (licenças a vencer) e hooks para e-mail (opcional).

CI/CD consolidado (lint → test → build → image), badges, cobertura mínima.

3) Rotina por Feature (checklist fixo)

 Criar/atualizar issue com critérios de aceitação.

 Criar branch.

 Implementar backend (entidades, migrações, repositórios, serviços, validadores, rotas).

 Expor/atualizar OpenAPI/GraphQL e gerar SDK do cliente.

 Implementar frontend (páginas, formulários, tabelas com filtros, acessibilidade, dark mode).

 Testes (unit + integração + e2e).

 Atualizar docs (README, ADR, ERD, fluxos Mermaid).

 Validar com dados CSV reais em /data/raw (ou seeds coerentes se ausentes).

 Changelog e PR com checklist do DoD; self-review detalhada.

 Merge após CI verde.

4) Itens de verificação específicos (não esquecer)

Logo exibida no header da aplicação.

Localização pt-BR (datas, moeda, pluralização, fuso).

Auditoria por registro visível na UI (quem mudou o quê e quando).

Paginação server-side eficiente (índices, explain analyze para coleções grandes).

Importações e exportações com logs e erros tratáveis.

Endpoints /health e /metrics expostos quando previstos.

Docker e docker compose funcionais para dev e demo.

5) Saídas esperadas desta execução

Um PROGRESS.md atualizado com:

O que foi detectado (Concluído/Em andamento/Pendente).

Plano das próximas 3 entregas, com estimativa e riscos.

Pelo menos 1 feature pendente implementada de ponta a ponta (código, testes, docs, PR).

CI verde e instruções claras no README para rodar o sistema localmente.

Agora, execute o protocolo “Onde Parou?”, gere o PROGRESS.md e comece a entregar a próxima feature de maior valor (com PR e testes). Caso falte algo essencial (ex.: CSVs, variáveis no .env), crie placeholders/seeds e documente no README.