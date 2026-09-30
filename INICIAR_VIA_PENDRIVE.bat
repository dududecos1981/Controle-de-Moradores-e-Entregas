@echo off
chcp 65001 > nul
title Sistema de Portaria e Moradores - Execução Portátil

echo ===============================================================================
echo       SISTEMA DE GESTÃO DE PORTARIA, ENCOMENDAS E MORADORES
echo ===============================================================================
echo.

:: 1. Verifica se existe Node.js portátil dentro do Pen Drive (pasta \nodejs)
if exist "%~dp0nodejs\node.exe" (
    echo [INFO] Utilizando Node.js Portátil do Pen Drive...
    set "PATH=%~dp0nodejs;%PATH%"
) else (
    :: 2. Verifica se o Node.js está instalado no computador
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERRO] Node.js não foi encontrado neste computador nem na pasta 'nodejs' do Pen Drive.
        echo.
        echo Para rodar em qualquer PC sem instalar nada:
        echo 1. Baixe o Node.js zip para Windows em: https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip
        echo 2. Descompacte o conteúdo na pasta 'nodejs' dentro do seu Pen Drive.
        echo.
        pause
        exit /b 1
    )
    echo [INFO] Utilizando Node.js instalado no Windows...
)

echo [OK] Node.js detectado com sucesso:
node -v
echo.

cd /d "%~dp0"

echo [1/3] Iniciando Servidor Backend API (Porta 3001)...
start "Backend API - Portaria" cmd /k "npm.cmd run dev:backend"

echo [2/3] Iniciando Portal da Portaria Web (Porta 3000)...
start "Frontend Web - Portaria" cmd /k "npm.cmd run dev:frontend"

echo [3/3] Iniciando App Mobile do Morador (Porta 3002)...
start "App Mobile - Morador" cmd /k "npm.cmd run dev:mobile"

echo.
echo ===============================================================================
echo  SISTEMA EM EXECUÇÃO NO PEN DRIVE!
echo  - Portaria Web:       http://localhost:3000
echo  - App do Morador:     http://localhost:3002
echo  - API Backend & Docs: http://localhost:3001/api/docs
echo ===============================================================================
echo.
echo Abrindo o navegador automaticamente em 5 segundos...
timeout /t 5 > nul

start http://localhost:3000
start http://localhost:3002

echo.
echo Para encerrar o sistema, feche as janelas pretas que foram abertas.
pause
