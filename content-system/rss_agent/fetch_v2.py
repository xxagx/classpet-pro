#!/usr/bin/env python3
"""
RSS Agent v2 - 修复版
移除失效的公众号源，补充可用源
"""

import json
import feedparser
from datetime import datetime
import os

RSS_SOURCES = {
    "hotel_ota": [
        {"name": "Skift", "url": "https://skift.com/feed/"},
        {"name": "品橙旅游", "url": "https://www.pinchain.com/rss"},
        # 以下源暂时不可用：环球旅讯(空内容), Hospitality Net(空内容), PhocusWire(405)
    ],
    "business": [
        {"name": "虎嗅", "url": "https://www.huxiu.com/rss/0.xml"},
        {"name": "36氪", "url": "https://36kr.com/feed"},
        # 晚点LatePost RSS失效
    ],
    "tech": [
        {"name": "TechCrunch", "url": "https://techcrunch.com/feed/"},
        {"name": "Wired", "url": "https://www.wired.com/feed/rss"},
        {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml"},
    ],
    "news": [
        {"name": "FT中文网", "url": "https://www.ftchinese.com/rss/news"},
        # 华尔街日报需要认证
    ],
    # 公众号源暂时注释，待浏览器自动化方案实现
    # "wechat_hotel": [],
    # "wechat_business": [],
}

def fetch_rss():
    """抓取所有RSS源"""
    results = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "sources": [],
        "wechat_note": "公众号源待浏览器自动化方案实现"
    }
    
    total_success = 0
    total_items = 0
    
    for category, sources in RSS_SOURCES.items():
        for source in sources:
            try:
                print(f"   📡 抓取: {source['name']}...")
                feed = feedparser.parse(source["url"])
                
                # 检查是否成功
                if hasattr(feed, 'status') and feed.status >= 400:
                    raise Exception(f"HTTP {feed.status}")
                
                items = []
                for entry in feed.entries[:10]:  # 每个源取前10条
                    items.append({
                        "title": entry.get("title", ""),
                        "summary": entry.get("summary", entry.get("description", ""))[:300],
                        "link": entry.get("link", ""),
                        "pubDate": entry.get("published", "")
                    })
                
                results["sources"].append({
                    "name": source["name"],
                    "category": category,
                    "status": "success",
                    "items": items,
                    "item_count": len(items)
                })
                total_success += 1
                total_items += len(items)
                print(f"      ✅ 成功: {len(items)}条")
                
            except Exception as e:
                print(f"      ❌ 失败: {e}")
                results["sources"].append({
                    "name": source["name"],
                    "category": category,
                    "status": "failed",
                    "error": str(e),
                    "items": [],
                    "item_count": 0
                })
    
    # 统计
    results["summary"] = {
        "total_sources": len([s for cat in RSS_SOURCES.values() for s in cat]),
        "success_sources": total_success,
        "failed_sources": len(results["sources"]) - total_success,
        "total_items": total_items
    }
    
    # 保存结果
    output_dir = "/Users/yr/.openclaw/workspace/data"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{output_dir}/raw_feeds_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 抓取完成: {total_success}/{results['summary']['total_sources']} 个源成功")
    print(f"📊 总计内容: {total_items} 条")
    print(f"💾 已保存: {filename}")
    
    return results

if __name__ == "__main__":
    print(f"{'='*50}")
    print("📡 RSS Agent v2 启动")
    print(f"{'='*50}")
    fetch_rss()
