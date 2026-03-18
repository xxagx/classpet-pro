#!/usr/bin/env python3
"""
Writer Agent - AI Powered
任务：调用AI模型生成完整公众号文章
"""

import json
import os
import sys
from datetime import datetime

# 添加workspace到路径
sys.path.insert(0, '/Users/yr/.openclaw/workspace')

def generate_article_with_ai(topic: dict) -> str:
    """
    使用AI生成完整文章内容
    通过调用外部AI服务或子代理
    """
    title = topic.get("title", "")
    source = topic.get("source", "")
    tags = topic.get("tags", [])
    link = topic.get("link", "")
    
    # 构建提示词
    prompt = f"""你是一位资深酒店行业内容策划，为"酒店渠道参谋"公众号撰写文章。

【选题信息】
- 原标题：{title}
- 来源：{source}
- 标签：{', '.join(tags)}
- 原文链接：{link}

【文章要求】
1. 字数：1500-2000字
2. 风格：专业但有温度，像经验丰富的顾问在分享，去AI化，口语化
3. 结构：
   - 痛点引入（100字）：用反问或场景切入
   - 现象描述+数据（200字）：发生了什么
   - 深层原因分析（300字）：为什么会这样
   - 实操方法论（400字）：酒店该怎么做，3-4个具体建议
   - 案例佐证（200字）：真实案例
   - 总结+行动号召（100字）

【禁止使用的AI套路词】
首先、其次、最后、综上所述、总的来说、在当今时代、随着发展、不可忽视、值得注意的是、不难发现、从某种意义上说

【推荐使用的口语化表达】
很多人忽略了一个问题、真正重要的是、背后的逻辑其实很简单、说白了、换个角度想、实际情况是、你会发现、有意思的是、更关键的是

【输出格式】
直接输出完整的Markdown格式文章，包含：
- 文章标题（# 开头）
- 导语（痛点引入）
- 4-5个小节（## 开头）
- 结尾总结

请开始撰写：
"""

    # 保存提示词到文件，供外部AI调用
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prompt_file = f"/Users/yr/.openclaw/workspace/output/writer_prompt_{timestamp}.txt"
    
    with open(prompt_file, 'w', encoding='utf-8') as f:
        f.write(prompt)
    
    print(f"   📝 提示词已保存: {prompt_file}")
    
    # 返回提示词文件路径，由外部调用AI
    return prompt_file

def generate_all_articles(topics_json_path: str, output_base_dir: str):
    """
    批量为TOP3选题生成文章提示词
    """
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    
    print(f"\n{'='*50}")
    print("📝 Writer Agent (AI Powered)")
    print(f"{'='*50}")
    
    for i, topic in enumerate(data.get("selected_topics", [])[:3], 1):
        print(f"\n📄 处理选题 {i}: {topic.get('title', '')[:40]}...")
        
        # 生成提示词
        prompt_file = generate_article_with_ai(topic)
        
        # 创建输出目录
        pkg_dir = os.path.join(output_base_dir, f"article_package_{i}")
        os.makedirs(pkg_dir, exist_ok=True)
        os.makedirs(os.path.join(pkg_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(pkg_dir, "charts"), exist_ok=True)
        os.makedirs(os.path.join(pkg_dir, "infographics"), exist_ok=True)
        
        results.append({
            "package": f"article_package_{i}",
            "topic": topic.get("title"),
            "prompt_file": prompt_file
        })
    
    # 保存任务清单
    tasks_file = os.path.join(output_base_dir, "writer_tasks.json")
    with open(tasks_file, 'w', encoding='utf-8') as f:
        json.dump({
            "date": data.get("date"),
            "tasks": results,
            "status": "pending_ai_generation"
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*50}")
    print("✅ 提示词生成完成")
    print(f"   任务清单: {tasks_file}")
    print(f"   请使用AI模型生成完整文章内容")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    if len(sys.argv) > 2:
        generate_all_articles(sys.argv[1], sys.argv[2])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        generate_all_articles(
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json",
            "/Users/yr/.openclaw/workspace/output"
        )
