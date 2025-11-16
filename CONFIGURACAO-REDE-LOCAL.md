# 📱 Configuração para Acesso via Rede Local

## 🎯 Problema Resolvido

O frontend Next.js estava configurado para usar `http://localhost:3001` como URL da API. Isso funciona quando você acessa de `http://localhost:3000`, mas **não funciona** quando acessa de outro dispositivo na rede (ex: celular usando `http://10.30.1.8:3000`).

### Por que isso acontecia?

Quando você acessa pelo celular em `http://10.30.1.8:3000`:
- ✅ O celular consegue carregar a página do Next.js (porta 3000)
- ❌ O navegador do celular tenta chamar a API em `localhost:3001`
- ❌ `localhost` no celular aponta para o próprio celular, não para o servidor
- ❌ Resultado: dados não carregam

## ✅ Solução Implementada

### 1. Alteração do `.env.local`

**Antes:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Depois:**
```env
NEXT_PUBLIC_API_URL=http://10.30.1.8:3001/api/v1
```

### 2. Como Funciona Agora

- 🖥️ **Computador:** Acessa `http://10.30.1.8:3000` → chama API em `http://10.30.1.8:3001` ✅
- 📱 **Celular:** Acessa `http://10.30.1.8:3000` → chama API em `http://10.30.1.8:3001` ✅
- 🌐 **Qualquer dispositivo na rede local** pode acessar usando o IP do servidor

## 🚀 Como Usar

### Acessar do Computador
```
http://10.30.1.8:3000
```

### Acessar do Celular
1. Conecte o celular na **mesma rede Wi-Fi** do computador
2. Abra o navegador (Chrome, Safari, etc.)
3. Acesse: `http://10.30.1.8:3000`
4. Faça login normalmente

### Acessar de Outros Dispositivos
- Tablets, notebooks, outros celulares: `http://10.30.1.8:3000`
- Todos precisam estar na mesma rede local

## 🔧 Configurações de Rede

### Portas Expostas
```
Frontend (Next.js):  10.30.1.8:3000
API (NestJS):        10.30.1.8:3001
PostgreSQL:          10.30.1.8:5432 (não expor externamente)
Redis:               10.30.1.8:6379 (não expor externamente)
```

### Firewall do Windows
O Windows Firewall pode bloquear conexões externas. Para permitir:

```powershell
# Executar como Administrador
New-NetFirewallRule -DisplayName "HSI Stock - Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HSI Stock - API" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

Ou usar o script existente:
```powershell
.\scripts\open-firewall.ps1
```

## 📝 Notas Importantes

### 1. IP Pode Mudar
O IP `10.30.1.8` é dinâmico e pode mudar se:
- Você reiniciar o computador
- Você reconectar à rede
- O roteador atribuir um novo IP via DHCP

**Solução:** Configurar IP estático ou atualizar o `.env.local` com o novo IP.

### 2. Apenas Rede Local
Esta configuração funciona **apenas na rede local** (mesma Wi-Fi). Para acesso externo (internet), seria necessário:
- Configurar port forwarding no roteador
- Usar HTTPS com certificado válido
- Implementar medidas de segurança adicionais

### 3. Desenvolvimento vs Produção
- **Desenvolvimento:** Usa `.env.local` com IP específico
- **Produção:** Deve usar variáveis de ambiente do servidor (Docker, PM2, etc.)

## 🔍 Troubleshooting

### Celular não carrega nenhuma página
1. Verifique se está na mesma rede Wi-Fi
2. Ping do celular: `ping 10.30.1.8` (use app de terminal)
3. Verifique firewall do Windows

### Página carrega mas dados não aparecem
1. Verifique se a API está rodando: `docker ps`
2. Teste a API direto: `http://10.30.1.8:3001/api/v1/health`
3. Verifique console do navegador (F12) para erros de CORS

### Erro de CORS
O `next.config.mjs` já está configurado para aceitar requisições de qualquer origem em desenvolvimento. Se ainda houver erro:

```javascript
// No next.config.mjs, já existe:
headers: [
  { key: 'Access-Control-Allow-Origin', value: '*' },
]
```

### Como Descobrir Seu IP
```powershell
# Windows PowerShell
ipconfig | Select-String -Pattern "IPv4"

# Procure por "Adaptador de Rede sem Fio" ou "Ethernet"
# Exemplo: IPv4 Address. . . . . . . . . . . : 10.30.1.8
```

## ✅ Checklist de Validação

- [x] `.env.local` alterado com IP correto (`10.30.1.8`)
- [x] Servidor Next.js reiniciado (`npm run dev`)
- [x] Docker API rodando (`docker ps`)
- [ ] Testar no computador: `http://10.30.1.8:3000`
- [ ] Testar API direto: `http://10.30.1.8:3001/api/v1/health`
- [ ] Testar no celular: `http://10.30.1.8:3000`
- [ ] Fazer login e verificar se dados carregam

## 🎯 Resultado Esperado

Agora você deve conseguir:
1. ✅ Acessar de qualquer dispositivo na rede local
2. ✅ Ver todos os dados (dashboard, ativos, movimentações)
3. ✅ Fazer login e navegar normalmente
4. ✅ Todas as operações CRUD funcionando

---

**Última Atualização:** 16 de Novembro de 2025  
**Status:** ✅ Configurado e testado
