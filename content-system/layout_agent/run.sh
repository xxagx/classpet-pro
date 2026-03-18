#!/bin/bash
# Layout Agent Workflow
# 执行排版整合工作流

echo "=== Layout Agent Workflow ==="
echo "开始时间: $(date)"
echo ""

echo "开始整合排版..."
python3 /Users/yr/.openclaw/workspace/content-system/layout_agent/generate.py

echo ""
echo "完成时间: $(date)"
echo "=========================="
