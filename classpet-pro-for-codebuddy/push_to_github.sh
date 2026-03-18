#!/bin/bash
# GitHub 推送脚本
# 请运行此脚本来推送项目到 GitHub

echo "=== GitHub 推送脚本 ==="
echo "项目目录: /Users/yr/.openclaw/workspace/classpet-pro-for-codebuddy"
echo ""

# 切换到正确目录
cd /Users/yr/.openclaw/workspace/classpet-pro-for-codebuddy

echo "1. 检查 Git 状态..."
git status

echo ""
echo "2. 检查远程仓库..."
git remote -v

echo ""
echo "3. 推送代码到 GitHub..."
echo "执行: git push origin main"

# 尝试推送
git push origin main

echo ""
echo "=== 如果推送成功 ==="
echo "接下来需要配置 GitHub Pages："
echo ""
echo "1. 访问 https://github.com/fwei19921-dotcom/classpet-pro1.0"
echo "2. 点击 Settings"
echo "3. 找到 Pages"
echo "4. 配置:"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main"
echo "   - Folder: / (root)"
echo "5. 点击 Save"
echo ""
echo "=== 测试链接 ==="
echo "等待几分钟后访问："
echo "- https://fwei19921-dotcom.github.io/classpet-pro1.0/deploy-test.html"
echo "- https://fwei19921-dotcom.github.io/classpet-pro1.0/index.html"
echo "- https://fwei19921-dotcom.github.io/classpet-pro1.0/admin.html"
echo "- https://fwei19921-dotcom.github.io/classpet-pro1.0/mobile.html"
echo ""
echo "=== 如果推送失败 ==="
echo "可能需要输入 GitHub 用户名和密码"
echo "或者使用 SSH 密钥配置"