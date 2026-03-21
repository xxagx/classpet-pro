Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
strScriptPath = WScript.ScriptFullName
strDir = objFSO.GetParentFolderName(strScriptPath)

' 切换到该目录
WshShell.CurrentDirectory = strDir

MsgBox "正在启动 ClassPet Pro 服务器，请稍候...", vbInformation, "ClassPet Pro"

' 启动 Python 服务器
WshShell.Run "cmd /k python start_server.py", 1, False

' 等待 2 秒
WScript.Sleep 2000

' 打开浏览器
WshShell.Run "http://127.0.0.1:8080/mobile.html", 1, False
