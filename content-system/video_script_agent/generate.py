#!/usr/bin/env python3
"""
Video Script Agent
任务：将公众号文章转换为视频号脚本（75-85秒）
输出：PPT讲解脚本 + 画面提示词
"""

import json
import os
import re
import requests
from datetime import datetime

def call_kimi(prompt: str) -> str:
    """调用Kimi AI"""
    try:
        api_key = "sk-sp-95cab16bf33b4a4284ed7c844d173544"
        base_url = "https://coding.dashscope.aliyuncs.com/v1"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "kimi-k2.5",
            "messages": [
                {"role": "system", "content": "你是短视频脚本专家，擅长将长文转换为75-85秒的口播脚本。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        proxies = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
        
        response = requests.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json=data,
            proxies=proxies,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        return None
    except Exception as e:
        print(f"   ⚠️ API错误: {e}")
        return None

def extract_key_points(article_path: str) -> dict:
    """从文章提取关键信息"""
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取标题
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "无标题"
    
    # 提取核心数据
    numbers = re.findall(r'(\d+%?|\d+万|\d+亿)', content)
    key_data = numbers[:3] if numbers else []
    
    # 提取小标题作为要点
    headers = re.findall(r'^## (.+)$', content, re.MULTILINE)
    key_points = headers[:3] if headers else []
    
    # 提取结论
    conclusion_match = re.search(r'## .+说几句\n+(.+?)(?=\n\n---|$)', content, re.DOTALL)
    conclusion = conclusion_match.group(1).strip()[:100] if conclusion_match else ""
    
    return {
        "title": title,
        "key_data": key_data,
        "key_points": key_points,
        "conclusion": conclusion
    }

def generate_video_script(article_info: dict, topic: dict) -> str:
    """生成视频号脚本"""
    
    prompt = f"""将以下文章转换为75-85秒的视频号口播脚本。

【原文标题】{article_info['title']}

【核心数据】{', '.join(article_info['key_data'])}

【关键要点】
{chr(10).join(['- ' + p for p in article_info['key_points']])}

【结论】{article_info['conclusion']}

【脚本要求】
1. 时长：75-85秒，约250-280字
2. 结构：
   - 0-3秒：标题卡+痛点提问（钩子）
   - 3-15秒：问题放大（引发共鸣）
   - 15-60秒：核心内容（3个观点，每观点配1个数据）
   - 60-75秒：方法论总结（可记忆框架）
   - 75-85秒：转化钩子（引导私信/关注）

3. 风格：
   - 口语化，像朋友聊天
   - 短句为主，避免长难句
   - 每15秒一个信息点
   - 去AI化，不用"首先/其次/综上所述"

4. 输出格式：
   【0-3秒】...
   【3-15秒】...
   ...

请直接输出脚本：
"""
    
    print(f"   🤖 正在生成视频脚本...")
    script = call_kimi(prompt)
    
    if script:
        print(f"   ✅ 脚本生成成功，字数: {len(script)}")
        return script
    else:
        return generate_fallback_script(article_info)

def generate_fallback_script(article_info: dict) -> str:
    """备用脚本"""
    title = article_info['title']
    
    return f"""【0-3秒】
{title}，这个问题你注意到了吗？

【3-15秒】
很多人还在用老办法应对，但市场已经变了。

【15-45秒】
{article_info['key_points'][0] if article_info['key_points'] else '第一，需求结构变了。'}
{article_info['key_points'][1] if len(article_info['key_points']) > 1 else '第二，获客渠道变了。'}
{article_info['key_points'][2] if len(article_info['key_points']) > 2 else '第三，竞争逻辑变了。'}

【45-60秒】
说白了，需要三个调整：重新审视客源、优化产品、调整渠道。

【60-75秒】
看懂趋势的人已经开始行动，看不懂的人还在抱怨。

【75-85秒】
你的选择是什么？评论区聊聊，或私信领取完整方案。

---
*固定结尾：关注源点Insight，帮你算清每一笔账*
"""

def generate_visual_prompts(script: str) -> list:
    """生成画面提示词"""
    
    # 提取每个时间段的内容
    scenes = re.findall(r'【(\d+-\d+)秒】\n+(.+?)(?=\n+【|$)', script, re.DOTALL)
    
    prompts = []
    for time_range, content in scenes:
        prompt = f"""
场景：{time_range}
内容：{content[:50]}...
画面：专业商务PPT风格，深色背景，简洁文字，数据可视化
"""
        prompts.append({"time": time_range, "prompt": prompt.strip()})
    
    return prompts

def process_article_package(package_dir: str, topic: dict) -> dict:
    """处理单个文章包"""
    article_path = os.path.join(package_dir, "article.md")
    
    if not os.path.exists(article_path):
        print(f"   ❌ 文章不存在: {article_path}")
        return None
    
    # 提取关键信息
    article_info = extract_key_points(article_path)
    
    # 生成脚本
    script = generate_video_script(article_info, topic)
    
    # 生成画面提示词
    visual_prompts = generate_visual_prompts(script)
    
    # 保存脚本
    script_path = os.path.join(package_dir, "video_script.md")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(f"# 视频号脚本\n\n")
        f.write(f"**原文标题**：{article_info['title']}\n\n")
        f.write(f"**预计时长**：75-85秒\n\n")
        f.write(f"**字数**：{len(script)}字\n\n")
        f.write("---\n\n")
        f.write(script)
        f.write("\n\n---\n\n")
        f.write("## 画面提示词\n\n")
        for i, vp in enumerate(visual_prompts, 1):
            f.write(f"### PPT第{i}页 ({vp['time']})\n")
            f.write(f"{vp['prompt']}\n\n")
    
    print(f"   ✅ 视频脚本已保存: {script_path}")
    
    return {
        "package": os.path.basename(package_dir),
        "script_path": script_path,
        "word_count": len(script),
        "scenes": len(visual_prompts)
    }

def batch_process(topics_json_path: str, output_base_dir: str):
    """批量处理TOP3文章包"""
    
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    
    print(f"\n{'='*50}")
    print("🎬 Video Script Agent")
    print(f"{'='*50}")
    
    for i, topic in enumerate(data.get("selected_topics", [])[:3], 1):
        package_dir = os.path.join(output_base_dir, f"article_package_{i}")
        
        print(f"\n📦 处理文章包 {i}...")
        result = process_article_package(package_dir, topic)
        
        if result:
            results.append(result)
    
    # 输出总结
    print(f"\n{'='*50}")
    print("📊 视频脚本生成总结:")
    for r in results:
        print(f"   ✅ {r['package']}: {r['word_count']}字, {r['scenes']}个场景")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 2:
        batch_process(sys.argv[1], sys.argv[2])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        batch_process(
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json",
            "/Users/yr/.openclaw/workspace/output"
        )
