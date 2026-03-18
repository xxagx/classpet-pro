#!/usr/bin/env python3
"""
系统配置 - 超时设置
"""

# 超时配置（秒）
TIMEOUT_CONFIG = {
    "rss_fetch": 180,           # RSS抓取
    "ai_generation": 300,       # AI生成文章
    "chart_generation": 180,    # 图表生成
    "npm_install": 600,         # npm install
    "video_script": 180,        # 视频脚本生成
    "infographic": 180,         # 信息图生成
    "layout": 120,              # 排版整合
}

# 进度反馈间隔（秒）
PROGRESS_INTERVAL = 30

def get_timeout(task_name: str) -> int:
    """获取任务超时时间"""
    return TIMEOUT_CONFIG.get(task_name, 120)
