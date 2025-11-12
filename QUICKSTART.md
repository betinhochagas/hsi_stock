# 🚀 Guia de Início Rápido

Este guia vai te ajudar a ter o sistema rodando em **menos de 10 minutos**.

## Pré-requisitos

- ✅ Node.js >= 20.0.0
- ✅ Docker Desktop (Windows)
- ✅ Git

## Passo 1: Clone o repositório

\`\`\`powershell
git clone https://github.com/seu-usuario/stock_hsi.git
cd stock_hsi
\`\`\`

## Passo 2: Configure o ambiente

### Opção A: Script automatizado (Recomendado)

\`\`\`powershell
.\scripts\setup.ps1
\`\`\`

### Opção B: Manual

\`\`\`powershell
# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Gerar Prisma Client
cd packages/db
npm run db:generate
cd ../..
\`\`\`

## Passo 3: Edite o .env

Abra o arquivo `.env` e ajuste se necessário. Os valores padrão funcionam para desenvolvimento local com Docker.

## Passo 4: Inicie o banco de dados

\`\`\`powershell
docker-compose up -d db redis
\`\`\`

Aguarde ~10 segundos para o banco inicializar.

## Passo 5: Execute as migrações e seed

**⚠️ IMPORTANTE:** No Windows, use SQL direto (Prisma tem problemas de autenticação):

\`\`\`powershell
# Criar schema do banco
Get-Content create_schema.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# Popular com dados iniciais
Get-Content seed.sql | docker exec -i estoque-hsi-db psql -U estoque_user -d estoque_hsi

# Verificar
docker exec estoque-hsi-db psql -U estoque_user -d estoque_hsi -c "SELECT COUNT(*) FROM assets;"
\`\`\`

Isso vai criar as tabelas e popular com dados iniciais, incluindo usuários de teste.

## Passo 6: Inicie a aplicação

\`\`\`powershell
# Iniciar API em Docker (recomendado)
docker-compose up api -d --build

# OU desenvolvimento local (requer Node.js)
npm run dev
\`\`\`

Isso vai iniciar:
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs
- **Web:** http://localhost:3000 (se não usar Docker)

## Passo 7: Teste a API

Acesse http://localhost:3001/api/docs no Swagger UI e faça login:

| Email | Senha | Papel |
|-------|-------|-------|
| admin@hsi.local | admin123 | ADMIN |
| gestor@hsi.local | gestor123 | GESTOR |
| tecnico@hsi.local | tecnico123 | TECNICO |

Ou teste via PowerShell:

\`\`\`powershell
# Login
$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@hsi.local","password":"admin123"}'
$token = $response.access_token

# Listar assets
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/assets' -Headers @{ Authorization = "Bearer $token" }
\`\`\`

## 🎉 Pronto!

Você agora tem a API rodando em Docker com banco de dados populado.

**✅ Status Atual:**
- PostgreSQL: 16 assets, 3 usuários, 6 categorias
- API: 26+ endpoints documentados
- Swagger: Interface interativa para testes

**⚠️ Frontend ainda não implementado** - Use Swagger para testar a API.

## Próximos Passos

1. **Teste a API:** Use http://localhost:3001/api/docs
2. **Verifique os dados:** Login como admin e liste assets
3. **Desenvolver Frontend:** Next.js em `apps/web/` (pendente)
4. **Ler documentação completa:** [SETUP-DOCKER-COMPLETO.md](SETUP-DOCKER-COMPLETO.md)

## Troubleshooting

### Porta já em uso
\`\`\`powershell
# Altere no .env
APP_PORT=3002
API_PORT=3003
\`\`\`

### Erro de conexão com banco
\`\`\`powershell
# Verifique se está rodando
docker-compose ps

# Reinicie
docker-compose restart db
\`\`\`

### Prisma Client não encontrado
\`\`\`powershell
cd packages/db
npx prisma generate
# Incluir binary targets para Docker
cd ../..
docker-compose up api -d --build
\`\`\`

### Erro de autenticação Prisma (Windows → Docker)
**Solução:** Use SQL direto (já documentado no Passo 5)

### API não inicia no Docker
\`\`\`powershell
# Ver logs detalhados
docker logs estoque-hsi-api

# Rebuild completo
docker-compose down
docker-compose up -d --build
\`\`\`

## Parar o sistema

\`\`\`powershell
# Parar aplicação (Ctrl+C no terminal)

# Parar Docker
docker-compose down
\`\`\`

## Resetar banco de dados

\`\`\`powershell
npm run db:reset
npm run db:seed
\`\`\`

---

**Dúvidas?** Consulte o [README.md](README.md) completo ou abra uma [issue](https://github.com/seu-usuario/stock_hsi/issues).
