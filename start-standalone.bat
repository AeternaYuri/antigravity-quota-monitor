@echo off
title Antigravity 实时配额监视器
cd /d "%~dp0"
echo ========================================================
echo   Antigravity 实时配额监视器 (独立桌面端)
echo   正在启动本地监控服务: http://127.0.0.1:39281
echo ========================================================
echo.
node src/server.mjs
pause
