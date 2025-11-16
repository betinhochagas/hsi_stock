@echo off
REM Script para importar os 3 CSVs do HSI
REM Requer Python 3 com requests instalado

echo ========================================
echo   IMPORTACAO CSV - Sistema Estoque HSI
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado! Instale Python 3.
    pause
    exit /b 1
)

REM Verificar se requests está instalado
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando biblioteca requests...
    pip install requests
)

echo.
echo Importando arquivos CSV...
echo.

REM 1. Balanço Estoque (118 registros)
echo [1/3] Importando Balanco Estoque...
python scripts\import-csv.py "Estoque_HSI(Balanço Estoque).csv" balance
if %errorlevel% neq 0 (
    echo ERRO na importacao do Balanco Estoque!
    pause
    exit /b 1
)
echo.

REM 2. Entrada (622 registros)
echo [2/3] Importando Entradas...
python scripts\import-csv.py "Estoque_HSI(Entrada).csv" entry
if %errorlevel% neq 0 (
    echo ERRO na importacao das Entradas!
    pause
    exit /b 1
)
echo.

REM 3. Saída (980 registros)
echo [3/3] Importando Saidas...
python scripts\import-csv.py "Estoque_HSI(Saída).csv" exit
if %errorlevel% neq 0 (
    echo ERRO na importacao das Saidas!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   IMPORTACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Total esperado: ~1,720 registros
echo   - Balanco Estoque: 118 registros
echo   - Entradas: 622 registros
echo   - Saidas: 980 registros
echo.
pause
