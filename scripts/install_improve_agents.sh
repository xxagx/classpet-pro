#!/bin/bash
# 凌晨安装 improve agent 脚本
# 运行时间：02:00

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始安装 improve agent..."

# 安装 improve-skill
echo "安装 improve-skill..."
clawhub install improve-skill --force 2>&1 || echo "improve-skill 安装失败或已安装"

# 安装 recursive-self-improvement
echo "安装 recursive-self-improvement..."
clawhub install recursive-self-improvement --force 2>&1 || echo "recursive-self-improvement 安装失败或已安装"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 安装完成"
