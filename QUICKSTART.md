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

\`\`\`powershell
npm run db:migrate
npm run db:seed
\`\`\`

Isso vai criar as tabelas e popular com dados iniciais, incluindo usuários de teste.

## Passo 6: Inicie a aplicação

\`\`\`powershell
npm run dev
\`\`\`

Isso vai iniciar:
- **API:** http://localhost:3001
- **Web:** http://localhost:3000
- **API Docs:** http://localhost:3001/api/docs

## Passo 7: Faça login

Acesse http://localhost:3000/login e use:

| Email | Senha | Papel |
|-------|-------|-------|
| admin@hsi.local | admin123 | ADMIN |
| gestor@hsi.local | gestor123 | GESTOR |
| tecnico@hsi.local | tecnico123 | TECNICO |

## 🎉 Pronto!

Você agora tem o sistema rodando localmente.

## Próximos Passos

1. **Explore o Dashboard:** Veja KPIs e gráficos
2. **Importe CSVs:** Use o wizard de importação em `/import`
3. **Gerencie Ativos:** CRUD completo em `/assets`
4. **Teste a API:** Acesse http://localhost:3001/api/docs

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
npm run db:generate
cd ../..
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
