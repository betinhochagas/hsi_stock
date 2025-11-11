# 🚨 SETUP BLOQUEADO - AÇÃO NECESSÁRIA

## ⚠️ Problema Detectado

**Node.js/npm não está disponível no PATH do PowerShell**

```
npm : O termo 'npm' não é reconhecido como nome de cmdlet...
```

## ✅ Solução

### Opção 1: Instalar Node.js (Recomendado)

1. Baixe Node.js 20 LTS: https://nodejs.org/
2. Execute o instalador
3. Reinicie o PowerShell
4. Verifique: `node --version` e `npm --version`

### Opção 2: Usar Node.js já instalado

Se Node.js já está instalado mas não está no PATH:

```powershell
# Encontrar instalação do Node
where.exe node

# Adicionar ao PATH da sessão atual
$env:Path += ";C:\Program Files\nodejs"

# Verificar
node --version
npm --version
```

### Opção 3: Usar nvm-windows

```powershell
# Instalar nvm-windows
winget install CoreyButler.NVMforWindows

# Instalar Node 20
nvm install 20
nvm use 20
```

## 📋 Próximos Passos Após Instalar Node.js

```powershell
# 1. Voltar ao diretório do projeto
cd c:\Users\t144116\Documents\hsi_stock

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npm run db:generate --workspace=@estoque-hsi/db

# 4. Subir Docker (se disponível)
docker-compose up -d db redis

# 5. Executar migrations
npm run db:migrate

# 6. Popular banco
npm run db:seed

# 7. Iniciar desenvolvimento
npm run dev
```

## 🔄 Status do Setup

- [x] Git inicializado
- [x] .env criado
- [x] .gitignore configurado
- [ ] ❌ Node.js/npm disponível (BLOQUEADOR)
- [ ] Dependências instaladas
- [ ] Prisma Client gerado
- [ ] Docker rodando
- [ ] Banco migrado e populado
- [ ] Aplicação rodando

## 📞 Precisa de Ajuda?

Consulte o [README.md](README.md) seção "Pré-requisitos" ou [QUICKSTART.md](QUICKSTART.md).

---

**Aguardando instalação do Node.js para continuar...**
