@echo off
chcp 65001 >nul
cls
echo ========================================
echo   ClassPet Pro 服务器启动工具
echo ========================================
echo.

:: 检查 Python 是否可用
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 Python 启动 HTTP 服务器...
    echo.
    echo 服务器地址:
    echo   http://127.0.0.1:8080/mobile.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    
    cd /d "%~dp0"
    python -m http.server 8080
) else (
    echo 未找到 Python，尝试使用 npx...
    echo.
    
    cd /d "%~dp0"
    npx http-server -p 8080 -c-1
)

pause
