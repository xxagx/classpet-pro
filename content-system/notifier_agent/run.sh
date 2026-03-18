#!/bin/bash
# Notifier Agent Workflow
# 执行飞书推送工作流

echo "=== Notifier Agent Workflow ==="
echo "开始时间: $(date)"
echo ""

echo "开始构建并发送推送..."
python3 /Users/yr/.openclaw/workspace/content-system/notifier_agent/notify.py

echo ""
echo "完成时间: $(date)"
echo "=========================="
