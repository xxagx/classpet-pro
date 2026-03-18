#!/usr/bin/env python3
"""
Writer Agent - AI Powered Article Generation (Kimi)
任务：调用Kimi AI模型生成完整公众号文章
"""

import json
import os
import sys
import requests
from datetime import datetime

# 禁止使用的AI套路词
BANNED_PHRASES = [
    "首先", "其次", "最后", "综上所述", "总的来说",
    "在当今时代", "随着发展", "随着科技的进步",
    "不可忽视", "值得注意的是", "不难发现",
    "从某种意义上说", "从某种程度上看"
]

def call_kimi(prompt: str) -> str:
    """
    调用Kimi AI生成内容
    """
    try:
        # 从配置文件读取API信息
        api_key = "sk-sp-95cab16bf33b4a4284ed7c844d173544"
        base_url = "https://coding.dashscope.aliyuncs.com/v1"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "kimi-k2.5",
            "messages": [
                {"role": "system", "content": "你是一位资深酒店行业内容策划，擅长撰写专业但有温度的公众号文章。去AI化，口语化，有观点。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        # 设置代理
        proxies = {
            "http": "http://127.0.0.1:7897",
            "https": "http://127.0.0.1:7897"
        }
        
        response = requests.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json=data,
            proxies=proxies,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return content
        else:
            print(f"   ⚠️ Kimi API错误: {response.status_code} - {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"   ⚠️ Kimi调用失败: {e}")
        return None

def generate_article_with_ai(topic: dict) -> str:
    """
    使用AI生成完整文章内容
    """
    title = topic.get("title", "")
    source = topic.get("source", "")
    tags = topic.get("tags", [])
    link = topic.get("link", "")
    
    # 构建提示词
    prompt = f"""为"酒店渠道参谋"公众号撰写一篇文章。

【选题信息】
- 原标题：{title}
- 来源：{source}
- 标签：{', '.join(tags)}

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

【禁止使用的词】
首先、其次、最后、综上所述、总的来说、在当今时代、随着发展、不可忽视、值得注意的是、不难发现、从某种意义上说

【推荐使用的口语化表达】
很多人忽略了一个问题、真正重要的是、背后的逻辑其实很简单、说白了、换个角度想、实际情况是、你会发现、有意思的是、更关键的是

【输出格式】
直接输出完整的Markdown格式文章，包含：
- 文章标题（# 开头）
- 导语（痛点引入）
- 4-5个小节（## 开头）
- 结尾总结
- 文末标注数据来源和适合人群

请开始撰写：
"""

    print(f"   🤖 正在调用Kimi生成文章...")
    content = call_kimi(prompt)
    
    if content and len(content) > 500:
        # 清理AI套路词
        for phrase in BANNED_PHRASES:
            content = content.replace(phrase, "")
        print(f"   ✅ AI生成成功，字数: {len(content)}")
        return content
    else:
        print(f"   ⚠️ AI生成失败，使用备用内容")
        return generate_fallback_content(topic)

def generate_fallback_content(topic: dict) -> str:
    """
    备用内容生成（当AI调用失败时使用）
    """
    title = topic.get("title", "")
    source = topic.get("source", "")
    
    return f"""# {title}

你的酒店是不是还在用老办法应对新市场？

{source}最近发布的数据值得关注。这篇文章聊聊背后的机会。

## 这个数据很刺眼

{title}释放了一个明确信号：市场正在发生变化。

很多人还在观望，但机会窗口不会永远敞开。

## 为什么是现在？

背后的逻辑其实很简单：

- 消费结构在调整
- 客群需求在变化  
- 渠道逻辑在重构

看懂趋势的人已经开始行动。

## 酒店该怎么应对

说白了，需要三个调整：

**第一，重新审视客源结构。** 你的核心客群是谁？他们的需求变了吗？

**第二，优化产品和服务。** 是否匹配新客群的品质要求？

**第三，调整营销渠道。** 你的目标客群在哪里获取信息？

## 案例参考

某中端酒店通过调整客源结构，在淡季实现了入住率提升15%。关键是提前布局，而不是等到被迫转型。

## 最后说几句

市场变化不会等人。

这不是周期性波动，而是结构性调整。看懂的人已经开始行动，看不懂的人还在抱怨环境不好。

你的选择是什么？

---
*数据来源：{source}及公开资料整理*
*适合人群：酒店投资人、运营负责人*
"""

def batch_generate(topics_json_path: str, output_base_dir: str):
    """
    批量为TOP3选题生成文章
    """
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    
    print(f"\n{'='*50}")
    print("📝 Writer Agent (Kimi Powered)")
    print(f"{'='*50}")
    
    for i, topic in enumerate(data.get("selected_topics", [])[:3], 1):
        print(f"\n📄 处理选题 {i}: {topic.get('title', '')[:40]}...")
        
        # 创建输出目录
        output_dir = os.path.join(output_base_dir, f"article_package_{i}")
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "charts"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "infographics"), exist_ok=True)
        
        # 生成文章
        article_content = generate_article_with_ai(topic)
        
        # 保存文章
        article_path = os.path.join(output_dir, "article.md")
        with open(article_path, 'w', encoding='utf-8') as f:
            f.write(article_content)
        
        print(f"   ✅ 文章已保存: {article_path}")
        
        results.append({
            "topic": topic["title"],
            "output_path": article_path,
            "package": f"article_package_{i}",
            "word_count": len(article_content)
        })
    
    # 输出总结
    print(f"\n{'='*50}")
    print("📊 文章生成总结:")
    for r in results:
        print(f"   ✅ {r['package']}: {r['word_count']}字")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        batch_generate(sys.argv[1], "/Users/yr/.openclaw/workspace/output")
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        batch_generate(
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json",
            "/Users/yr/.openclaw/workspace/output"
        )
