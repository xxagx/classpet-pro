import http.server
import socketserver
import webbrowser
import os
import sys

# 切换到脚本所在目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8080

print("=" * 50)
print("  ClassPet Pro 服务器启动中...")
print("=" * 50)
print()
print(f"服务器地址:")
print(f"  本地访问：http://127.0.0.1:{PORT}/mobile.html")
print(f"  手机访问：http://192.168.1.237:{PORT}/mobile.html")
print()
print("正在打开浏览器...")
print()
print("按 Ctrl+C 停止服务器")
print("=" * 50)

# 打开浏览器
webbrowser.open(f'http://127.0.0.1:{PORT}/mobile.html')

# 启动服务器
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
        sys.exit(0)
