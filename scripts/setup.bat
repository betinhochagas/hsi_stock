@echo off
REM Script de setup para Windows (CMD)

echo ============================================
echo   Sistema de Estoque TI HSI - Setup
echo ============================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale Node.js ^>= 20.0.0
    pause
    exit /b 1
)
node --version
npm --version
echo OK
echo.

echo [2/5] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo OK
echo.

echo [3/5] Configurando .env...
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado. Configure antes de continuar.
) else (
    echo Arquivo .env ja existe
)
echo.

echo [4/5] Gerando Prisma Client...
cd packages\db
call npm run db:generate
if errorlevel 1 (
    echo ERRO: Falha ao gerar Prisma Client
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo OK
echo.

echo [5/5] Setup concluido!
echo.
echo Proximos passos:
echo   1. Configure o arquivo .env
echo   2. Inicie o banco: docker-compose up -d db redis
echo   3. Execute migracoes: npm run db:migrate
echo   4. Popule o banco: npm run db:seed
echo   5. Inicie o projeto: npm run dev
echo.
pause
