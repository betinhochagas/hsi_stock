# Comandos Úteis - Sistema de Estoque TI HSI

## 📦 Instalação e Setup

```powershell
# Instalação completa (recomendado)
.\scripts\setup.ps1

# Instalação manual
npm install
cd packages/db
npm run db:generate
cd ../..
```

## 🗄️ Banco de Dados

```powershell
# Gerar Prisma Client
npm run db:generate --workspace=@estoque-hsi/db

# Criar migração
npm run db:migrate --workspace=@estoque-hsi/db

# Aplicar migrações (produção)
npm run db:migrate:deploy --workspace=@estoque-hsi/db

# Sincronizar schema sem migração
npm run db:push --workspace=@estoque-hsi/db

# Popular banco com dados iniciais
npm run db:seed --workspace=@estoque-hsi/db

# Resetar banco (CUIDADO: apaga tudo)
npm run db:reset --workspace=@estoque-hsi/db

# Abrir Prisma Studio (GUI)
npm run db:studio --workspace=@estoque-hsi/db
```

## 🚀 Desenvolvimento

```powershell
# Iniciar todos os workspaces (Turborepo)
npm run dev

# Iniciar apenas API
cd apps/api
npm run dev

# Iniciar apenas Web
cd apps/web
npm run dev

# Build de tudo
npm run build

# Limpar builds
npm run clean
```

## 🐳 Docker

```powershell
# Subir todos os serviços
docker-compose up -d

# Subir apenas banco e redis
docker-compose up -d db redis

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api

# Parar serviços
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Rebuild de imagens
docker-compose build

# Rebuild e restart
docker-compose up --build -d

# Executar comando dentro do container
docker-compose exec api npm run db:migrate

# Ver status dos containers
docker-compose ps

# Ver recursos utilizados
docker stats
```

## 🧪 Testes

```powershell
# Executar todos os testes
npm run test

# Testes em watch mode
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes E2E (quando implementado)
npm run test:e2e

# Testes apenas do backend
cd apps/api
npm run test

# Testes apenas do frontend
cd apps/web
npm run test
```

## ✅ Qualidade de Código

```powershell
# Lint de tudo
npm run lint

# Lint apenas da API
cd apps/api
npm run lint

# Formatação com Prettier
npm run format

# Verificar formatação
npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

## 📊 Prisma Studio

```powershell
# Abrir GUI para visualizar/editar banco
npm run db:studio
# Abre em http://localhost:5555
```

## 🔍 Debug

```powershell
# Ver logs estruturados da API
docker-compose logs -f api | grep ERROR

# Monitorar banco de dados
docker-compose exec db psql -U estoque_user -d estoque_hsi

# Consultas SQL úteis
docker-compose exec db psql -U estoque_user -d estoque_hsi -c "SELECT * FROM users;"
docker-compose exec db psql -U estoque_user -d estoque_hsi -c "SELECT COUNT(*) FROM assets;"

# Ver fila Redis
docker-compose exec redis redis-cli
# Dentro do redis-cli:
KEYS *
GET key_name
```

## 🧹 Limpeza

```powershell
# Limpar node_modules
Get-ChildItem -Recurse node_modules | Remove-Item -Recurse -Force

# Limpar builds
npm run clean

# Limpar Docker (CUIDADO)
docker system prune -a

# Limpar apenas containers parados
docker container prune

# Limpar volumes não usados
docker volume prune
```

## 📝 Git

```powershell
# Commit convencional
git commit -m "feat: adiciona importação de CSV"
git commit -m "fix: corrige validação de datas"
git commit -m "docs: atualiza README"

# Ver status
git status

# Ver diff
git diff

# Ver histórico
git log --oneline --graph
```

## 🔐 Segurança

```powershell
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Gerar novo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📦 Deploy

```powershell
# Build para produção
npm run build

# Testar build de produção localmente
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Tag e push de imagens Docker
docker build -t seu-registry/estoque-hsi-api:1.0.0 -f apps/api/Dockerfile .
docker push seu-registry/estoque-hsi-api:1.0.0

docker build -t seu-registry/estoque-hsi-web:1.0.0 -f apps/web/Dockerfile .
docker push seu-registry/estoque-hsi-web:1.0.0
```

## 🔧 Troubleshooting

```powershell
# Porta já em uso - matar processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Banco não conecta - verificar
docker-compose exec db pg_isready -U estoque_user

# Redis não conecta - verificar
docker-compose exec redis redis-cli ping

# Prisma Client desatualizado
cd packages/db
npm run db:generate
cd ../..

# Limpar cache do Turborepo
npx turbo clean

# Reinstalar tudo do zero
npm run clean
Remove-Item -Recurse -Force node_modules
npm install
```

## 📊 Monitoramento

```powershell
# Health check da API
curl http://localhost:3001/health

# Métricas da API
curl http://localhost:3001/health/metrics

# Swagger UI
start http://localhost:3001/api/docs

# Ver memória usada pelo Node
Get-Process node | Select-Object Name,Id,@{Name="Memory(MB)";Expression={[math]::round($_.WorkingSet64 / 1MB, 2)}}
```

## 🎨 Frontend

```powershell
# Adicionar novo componente shadcn/ui
npx shadcn-ui@latest add button

# Build otimizado Next.js
cd apps/web
npm run build

# Iniciar produção Next.js
npm run start

# Analisar bundle
npm run build && npm run analyze
```

## 📚 Documentação

```powershell
# Gerar nova documentação da API
cd apps/api
npm run build
# Swagger estará em /api/docs

# Ver ERD visual
start docs/erd.md
# Use extensão Mermaid Preview no VS Code
```

## ⚡ Performance

```powershell
# Analisar tempo de build
npm run build -- --verbose

# Ver cache do Turborepo
npx turbo run build --dry-run

# Limpar cache do Turborepo
rm -rf .turbo

# Benchmark de queries (quando implementado)
npm run benchmark
```

## 🔄 Atualizações

```powershell
# Verificar pacotes desatualizados
npm outdated

# Atualizar pacotes minor/patch
npm update

# Atualizar pacote específico
npm install @nestjs/common@latest

# Atualizar tudo (CUIDADO)
npx npm-check-updates -u
npm install
```

---

## 📋 Atalhos Úteis

### Desenvolvimento Diário

```powershell
# Rotina matinal
docker-compose up -d db redis  # Subir infraestrutura
npm run dev                     # Iniciar desenvolvimento

# Rotina ao fechar
docker-compose stop             # Parar containers
```

### Quando alterar schema do Prisma

```powershell
npm run db:migrate              # Criar e aplicar migração
npm run db:generate             # Regenerar cliente
```

### Antes de fazer commit

```powershell
npm run lint                    # Verificar código
npm run test                    # Executar testes
npm run build                   # Verificar se builda
```

### Deploy

```powershell
git tag v1.0.0
git push origin v1.0.0
docker-compose build
docker-compose push
```

---

**Dica:** Adicione estes comandos como aliases no seu perfil do PowerShell!

Edite `$PROFILE` e adicione:

```powershell
function dev { npm run dev }
function dbmigrate { npm run db:migrate --workspace=@estoque-hsi/db }
function dbseed { npm run db:seed --workspace=@estoque-hsi/db }
function dcup { docker-compose up -d }
function dcdown { docker-compose down }
```

Depois execute: `. $PROFILE`
