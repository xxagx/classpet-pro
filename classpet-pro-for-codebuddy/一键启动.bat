@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

:: 尝试使用 Python
python -c "import http.server; import socketserver; import webbrowser; import os; os.chdir(os.path.dirname(os.path.abspath('__file__'))); PORT=8080; print('Starting server...'); webbrowser.open('http://127.0.0.1:8080/mobile.html'); Handler=http.server.SimpleHTTPRequestHandler; socketserver.TCPServer.allow_reuse_address=True; httpd=socketserver.TCPServer(('',PORT),Handler); print('Server running at http://127.0.0.1:8080'); httpd.serve_forever()"

pause
