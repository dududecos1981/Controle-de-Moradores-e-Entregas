@echo off
chcp 65001 > nul
title Sistema de Portaria - Modo Produção (Otimizado)

echo ===============================================================================
echo     SISTEMA DE GESTÃO DE PORTARIA - MODO PRODUÇÃO OTIMIZADO
echo ===============================================================================
echo.

if exist "%~dp0nodejs\node.exe" (
    set "PATH=%~dp0nodejs;%PATH%"
)

cd /d "%~dp0"

echo [1/3] Iniciando Backend API...
start "Backend API" cmd /k "npm.cmd run start:dev --prefix backend"

echo [2/3] Iniciando Portaria Web (Produção)...
start "Portaria Web" cmd /k "npm.cmd run start:frontend"

echo [3/3] Iniciando App do Morador (Produção)...
start "App Morador" cmd /k "npm.cmd run start:mobile"

echo.
echo Aguardando inicialização dos serviços...
timeout /t 4 > nul

start http://localhost:3000
start http://localhost:3002

echo Sistema em execução! Para fechar, encerre as janelas de comando.
pause
