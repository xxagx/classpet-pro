#!/bin/bash
# 夜间内容生产任务
# 运行时间：凌晨01:00（低峰期）
# 任务：基于确认的选题，生成完整内容包

set -e

WORKSPACE="/Users/yr/.openclaw/workspace"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$WORKSPACE/logs/night_production_$DATE.log"

mkdir -p "$WORKSPACE/logs"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 夜间内容生产开始" >> "$LOG_FILE"

# 检查今日是否有确认的选题
TOPIC_FILE="$WORKSPACE/data/confirmed_topic_$DATE.txt"

if [ -f "$TOPIC_FILE" ]; then
    TOPIC=$(cat "$TOPIC_FILE")
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 确认选题: $TOPIC" >> "$LOG_FILE"
    
    # 1. 生成文章包
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始生成文章包..." >> "$LOG_FILE"
    openclaw sessions send --session main "执行内容生产: $TOPIC" >> "$LOG_FILE" 2>&1
    
    # 2. 生成视频
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始生成视频..." >> "$LOG_FILE"
    source ~/.openclaw/venv/bin/activate
    python3 "$WORKSPACE/scripts/video_production.py" >> "$LOG_FILE" 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 视频生成完成" >> "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 今日无确认选题，跳过生产" >> "$LOG_FILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 夜间内容生产完成" >> "$LOG_FILE"
