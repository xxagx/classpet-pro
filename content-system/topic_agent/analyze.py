# Topic Agent
# 任务：从RSS信息中筛选最有传播潜力的选题
# 筛选标准：行业趋势、新技术突破、商业机会、市场数据变化、工具盘点、趋势预测
# 输出：TOP10选题 + 传播潜力评分

import json
from datetime import datetime

def analyze_topics(raw_feeds_path: str):
    """分析RSS数据，筛选TOP10选题"""
    
    with open(raw_feeds_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 收集所有文章
    all_items = []
    for source in data.get("sources", []):
        if source.get("status") == "success":
            for item in source.get("items", []):
                all_items.append({
                    **item,
                    "source_name": source["name"],
                    "category": source["category"]
                })
    
    # 评分维度
    scoring_criteria = {
        "行业趋势": ["趋势", "变革", "转型", "升级", "重构"],
        "新技术突破": ["AI", "人工智能", "智能", "技术", "创新", "突破"],
        "商业机会": ["机会", "红利", "蓝海", "赛道", "增长", "爆发"],
        "市场数据": ["数据", "报告", "增长", "下降", "规模", "亿", "万"],
        "工具盘点": ["工具", "盘点", "推荐", "评测", "对比"],
        "趋势预测": ["预测", "未来", "2026", "2027", "趋势"]
    }
    
    # 简单评分（实际可用AI评分）
    scored_items = []
    for item in all_items:
        score = 0
        tags = []
        title = item.get("title", "")
        summary = item.get("summary", "")
        text = title + summary
        
        for category, keywords in scoring_criteria.items():
            for kw in keywords:
                if kw in text:
                    score += 10
                    if category not in tags:
                        tags.append(category)
        
        # 时效性加分
        if "2026" in text or "3月" in text or "本周" in text:
            score += 5
        
        scored_items.append({
            **item,
            "score": score,
            "tags": tags,
            "potential": "高" if score >= 30 else "中" if score >= 15 else "低"
        })
    
    # 排序取TOP10
    scored_items.sort(key=lambda x: x["score"], reverse=True)
    top10 = scored_items[:10]
    
    # 生成趋势总结
    trend_summary = generate_trend_summary(top10)
    
    result = {
        "date": data.get("date"),
        "summary": trend_summary,
        "selected_topics": [
            {
                "rank": i+1,
                "title": item["title"],
                "source": item["source_name"],
                "score": item["score"],
                "potential": item["potential"],
                "tags": item["tags"],
                "link": item["link"]
            }
            for i, item in enumerate(top10)
        ]
    }
    
    # 保存
    output_path = f"/Users/yr/.openclaw/workspace/data/selected_topics_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return result

def generate_trend_summary(topics):
    """生成一句话趋势总结"""
    # 提取关键词
    all_tags = []
    for t in topics:
        all_tags.extend(t.get("tags", []))
    
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    
    if top_tags:
        return f"今日热点聚焦：{ '、'.join([t[0] for t in top_tags]) }。"
    return "今日热点多元，建议关注行业变革与新技术应用。"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        analyze_topics(sys.argv[1])
    else:
        # 默认读取今日数据
        today = datetime.now().strftime('%Y-%m-%d')
        analyze_topics(f"/Users/yr/.openclaw/workspace/data/raw_feeds_{today}.json")
