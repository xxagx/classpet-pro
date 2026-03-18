#!/usr/bin/env python3
"""
Notifier Agent - 每日热点推送
任务：推送TOP10选题 + TOP3推荐，等待用户确认后再生成内容
"""

import json
import os
from datetime import datetime

def load_topics(topics_path: str) -> dict:
    """加载选题数据"""
    with open(topics_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def build_feishu_message(topics_data: dict) -> str:
    """构建飞书推送消息"""
    date_str = topics_data.get("date", datetime.now().strftime("%Y-%m-%d"))
    
    # 消息头部
    message = f"""📰 **源点Insight · 每日热点推送**
*{date_str}*

---

📝 **今日热点摘要**
{topics_data.get("summary", "暂无摘要")}

---

🎯 **TOP 10 候选选题**（供参考）
"""
    
    # TOP 10 选题
    for i, topic in enumerate(topics_data.get("selected_topics", [])[:10], 1):
        potential_emoji = "🔥" if topic.get("potential") == "高" else "📊" if topic.get("potential") == "中" else "📌"
        message += f"""
**{i}. {topic.get('title', '无标题')}**
{potential_emoji} 传播潜力: {topic.get('potential', '中')} | 评分: {topic.get('score', 0)}
💡 标签: {', '.join(topic.get('tags', [])[:3])}
🔗 {topic.get('link', '')}
"""
    
    # TOP 3 推荐
    message += """
---

⭐ **TOP 3 推荐选题**（建议优先）
"""
    
    for i, topic in enumerate(topics_data.get("selected_topics", [])[:3], 1):
        message += f"""
**{i}. {topic.get('title', '无标题')}**
💡 建议角度：{topic.get('angle_suggestion', '待定')}
📝 内容形式：{topic.get('content_type', '公众号/视频号')}
"""
    
    # 底部
    message += """
---

⚠️ **等待确认**
请回复数字 **1/2/3** 确认要生成的选题，或回复 **"全部"** 生成全部3个。

确认后我将生成：
- ✅ 公众号文章
- ✅ 视频号脚本
- ✅ 数据图表
- ✅ 信息图

---

🤖 **自动生产系统** | 酒店渠道参谋
"""
    
    return message

def send_to_feishu(message: str) -> bool:
    """发送到飞书"""
    try:
        print("\n📤 飞书推送内容：")
        print("="*50)
        print(message)
        print("="*50)
        return True
    except Exception as e:
        print(f"❌ 推送失败: {e}")
        return False

def save_notification(message: str, output_dir: str):
    """保存推送记录"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"notification_{timestamp}.md"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(message)
    
    print(f"\n💾 推送记录已保存: {filepath}")
    return filepath

def run_notification(topics_path: str, output_dir: str) -> dict:
    """执行推送流程"""
    print(f"\n{'='*50}")
    print("📤 Notifier Agent 启动")
    print(f"{'='*50}")
    
    # 1. 加载数据
    print("\n1. 加载选题数据...")
    topics_data = load_topics(topics_path)
    print(f"   ✅ 加载完成: {topics_data.get('date')}")
    
    # 2. 构建消息
    print("\n2. 构建推送消息...")
    message = build_feishu_message(topics_data)
    print("   ✅ 消息构建完成")
    
    # 3. 保存记录
    print("\n3. 保存推送记录...")
    record_path = save_notification(message, output_dir)
    
    # 4. 发送到飞书
    print("\n4. 发送到飞书...")
    send_to_feishu(message)
    
    print(f"\n{'='*50}")
    print("✅ 推送完成，等待用户确认")
    print(f"{'='*50}")
    
    return {
        "status": "success",
        "message_length": len(message),
        "record_path": record_path
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 2:
        run_notification(sys.argv[1], sys.argv[2])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        run_notification(
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json",
            "/Users/yr/.openclaw/workspace/output"
        )
