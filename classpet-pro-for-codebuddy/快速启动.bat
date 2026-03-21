@echo off
chcp 65001 >nul
cls
echo ========================================
echo   ClassPet Pro 快速启动工具
echo ========================================
echo.
echo 正在检查服务器状态...
echo.

:: 检查服务器是否在运行
netstat -ano | findstr ":8080" >nul 2>&1
if %errorlevel% neq 0 (
    echo 服务器未运行，正在启动...
    cd /d "%~dp0"
    start "ClassPet Pro 服务器" cmd /k "npx http-server -p 8080 -c-1"
    timeout /t 3 /nobreak >nul
) else (
    echo 服务器已在运行
)

echo.
echo 正在打开浏览器...
echo.
echo 访问地址：
echo   http://127.0.0.1:8080/mobile.html
echo.
echo ========================================

:: 打开浏览器到正确地址
start http://127.0.0.1:8080/mobile.html

echo 浏览器已打开，请点击"开启旅程"按钮
echo.
echo 按任意键退出...
pause >nul
