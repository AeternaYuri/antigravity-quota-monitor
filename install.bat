@echo off
setlocal
echo ========================================================
echo   Antigravity Quota Monitor - 安装程序
echo ========================================================
echo.

set "TARGET_DIR=%USERPROFILE%\.gemini\config\plugins\antigravity-quota-monitor"

echo [*] 正在安装插件至: %TARGET_DIR%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

xcopy /E /I /Y "%~dp0plugin.json" "%TARGET_DIR%\" >nul
xcopy /E /I /Y "%~dp0mcp_config.json" "%TARGET_DIR%\" >nul
xcopy /E /I /Y "%~dp0package.json" "%TARGET_DIR%\" >nul
xcopy /E /I /Y "%~dp0README.md" "%TARGET_DIR%\" >nul
xcopy /E /I /Y "%~dp0start-standalone.bat" "%TARGET_DIR%\" >nul

if not exist "%TARGET_DIR%\src" mkdir "%TARGET_DIR%\src"
xcopy /E /I /Y "%~dp0src\*" "%TARGET_DIR%\src\" >nul

if not exist "%TARGET_DIR%\sidecars" mkdir "%TARGET_DIR%\sidecars"
xcopy /E /I /Y "%~dp0sidecars\*" "%TARGET_DIR%\sidecars\" >nul

if not exist "%TARGET_DIR%\skills" mkdir "%TARGET_DIR%\skills"
xcopy /E /I /Y "%~dp0skills\*" "%TARGET_DIR%\skills\" >nul

echo [✓] 插件安装完成！
echo.
echo 使用方法:
echo 1. 在 Antigravity 对话中输入或点击药丸链接: sidecar://antigravity-quota-monitor/quota_viewer/
echo 2. 或双击运行桌面独立小窗: %TARGET_DIR%\start-standalone.bat
echo.
pause
