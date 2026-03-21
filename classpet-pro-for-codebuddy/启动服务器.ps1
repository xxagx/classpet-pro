# ClassPet Pro 服务器启动脚本
# 使用 PowerShell 启动 HTTP 服务器

$port = 8080
$url = "http://127.0.0.1:$port/mobile.html"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ClassPet Pro 服务器启动工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在启动 HTTP 服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "服务器地址:" -ForegroundColor Yellow
Write-Host "  本地访问：$url" -ForegroundColor White
Write-Host "  手机访问：http://192.168.1.237:$port/mobile.html" -ForegroundColor White
Write-Host ""
Write-Host "正在打开浏览器..." -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 打开浏览器
Start-Process $url

# 启动服务器
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "服务器已启动，监听端口 $port" -ForegroundColor Green
Write-Host "按任意键停止服务器..." -ForegroundColor Yellow

while ($true) {
    if ([Console]::KeyAvailable) {
        break
    }
    Start-Sleep -Milliseconds 100
}

$listener.Stop()
$listener.Close()
Write-Host "服务器已停止" -ForegroundColor Red
