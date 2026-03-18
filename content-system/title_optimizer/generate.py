# Title Optimizer
# 任务：为每篇文章生成高点击标题
# 生成5个标题，符合公众号传播逻辑

import json
import random

TITLE_TEMPLATES = {
    "趋势型": [
        "正在发生的{topic}趋势，你注意到了吗？",
        "{topic}行业正在发生一件大事",
        "2026年，{topic}赛道突然爆发",
        "从数据看{topic}：一场静悄悄的革命",
        "{topic}的拐点已经到来"
    ],
    "信息差型": [
        "90%的人忽略的{topic}机会",
        "关于{topic}，很多人理解错了",
        "{topic}的真相，和你想的不一样",
        "业内人士怎么看{topic}？",
        "{topic}：一个被低估的信号"
    ],
    "冲突型": [
        "{topic}：增长背后的隐忧",
        "{topic}火了，但问题也来了",
        "为什么说{topic}是双刃剑？",
        "{topic}的A面与B面",
        "{topic}：机会还是陷阱？"
    ],
    "数字型": [
        "{topic}增长300%背后的逻辑",
        "从0到1：{topic}的破局之路",
        "{topic}：3个变化，1个结论",
        "数据说话：{topic}的真实情况",
        "{topic}：5个趋势，1个判断"
    ],
    "观点型": [
        "我对{topic}的最新判断",
        "关于{topic}，说几句实话",
        "{topic}：我的观察和思考",
        "聊聊{topic}这件事",
        "{topic}，值得认真聊一聊"
    ]
}

def generate_titles(topic: str, article_summary: str = ""):
    """为选题生成5个标题"""
    
    titles = []
    used_types = set()
    
    # 从每种类型选1个，确保多样性
    for title_type, templates in TITLE_TEMPLATES.items():
        template = random.choice(templates)
        title = template.format(topic=topic)
        titles.append({
            "type": title_type,
            "title": title,
            "score": random.randint(75, 95)  # 模拟点击率评分
        })
    
    # 按评分排序
    titles.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "topic": topic,
        "titles": titles,
        "recommended": titles[0]["title"]
    }

def batch_generate(topics_json_path: str):
    """批量为TOP3选题生成标题"""
    
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    # 只为TOP3生成
    for topic in data.get("selected_topics", [])[:3]:
        result = generate_titles(topic["title"])
        results.append(result)
    
    # 保存
    output_path = topics_json_path.replace("selected_topics", "title_options")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"date": data.get("date"), "packages": results}, f, ensure_ascii=False, indent=2)
    
    return results

if __name__ == "__main__":
    import sys
    from datetime import datetime
    
    if len(sys.argv) > 1:
        batch_generate(sys.argv[1])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        batch_generate(f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json")
