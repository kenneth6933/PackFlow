@echo off
cd /d "%~dp0"
if not exist node_modules (
 call npm install --ignore-scripts --no-audit --no-fund
 if errorlevel 1 goto end
)
echo PackFlow - Process pending password reset requests
node manager.mjs resets
:end
pause

