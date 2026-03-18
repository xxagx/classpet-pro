#!/bin/bash
# Video Script Agent Workflow
# 生成视频号脚本

echo "=== Video Script Agent ==="
echo "开始时间: $(date)"
echo ""

python3 /Users/yr/.openclaw/workspace/content-system/video_script_agent/generate.py

echo ""
echo "完成时间: $(date)"
echo "=========================="
