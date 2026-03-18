#!/bin/bash
# Infographic Agent Workflow
# 执行信息图生成工作流

echo "=== Infographic Agent Workflow ==="
echo "开始时间: $(date)"
echo ""

echo "开始生成信息图..."
python3 /Users/yr/.openclaw/workspace/content-system/infographic_agent/generate.py

echo ""
echo "完成时间: $(date)"
echo "=========================="
