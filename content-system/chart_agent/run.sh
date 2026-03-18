#!/bin/bash
# Chart Agent Workflow
# 执行图表生成工作流

echo "=== Chart Agent Workflow ==="
echo "开始时间: $(date)"
echo ""

# 运行图表生成
echo "开始分析文章并生成图表..."
python3 /Users/yr/.openclaw/workspace/content-system/chart_agent/generate.py

echo ""
echo "完成时间: $(date)"
echo "=========================="
