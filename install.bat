@echo off
echo ========================================
echo Instalando dependencias del proyecto...
echo ========================================
cd /d "%~dp0"
call npm install
echo.
echo ========================================
echo Instalacion completada!
echo ========================================
echo.
echo Para iniciar el servidor de desarrollo:
echo   npm start
echo.
echo Para hacer un build de produccion:
echo   npm run build
echo.
pause
