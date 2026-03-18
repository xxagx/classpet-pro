#!/bin/bash
# 每日RSS热点抓取脚本
# 运行时间：每晚21:00

set -e

WORKSPACE="/Users/yr/.openclaw/workspace"
VENV="$HOME/.openclaw/venv"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$WORKSPACE/logs/rss-digest.log"

# 创建日志目录
mkdir -p "$WORKSPACE/logs"

# 记录开始时间
echo "[$(date '+%Y-%m-%d %H:%M:%S')] RSS抓取开始" >> "$LOG_FILE"

# 激活虚拟环境并执行RSS抓取
source "$VENV/bin/activate" && cd "$WORKSPACE" && python3 content-system/rss_agent/fetch_v2.py >> "$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] RSS抓取完成" >> "$LOG_FILE"
