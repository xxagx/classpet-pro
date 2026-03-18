# Layout Agent
# 任务：整合所有素材，生成最终公众号Markdown文章
# 输入：article.md + images/ + charts/ + infographics/
# 输出：final_article.md（完整排版）

import json
import os
import re
from datetime import datetime

LAYOUT_TEMPLATE = """# {title}

![封面](images/cover.png)

{intro}

---

{content}

---

## 📊 数据洞察

{data_section}

---

## 🎯 核心观点

{summary_section}

---

*本文数据来源：{data_source}*
*适合人群：{target_audience}*
*发布时间：{publish_date}*

---

**关于我们**

酒店渠道参谋 —— 帮中小酒店看清渠道成本、优化收益结构的实战顾问。

关注公众号，获取更多酒店运营干货。
"""

def scan_package(package_dir: str) -> dict:
    """
    扫描文章包，收集所有素材
    """
    result = {
        "article_md": None,
        "images": [],
        "charts": [],
        "infographics": []
    }
    
    # 检查文章
    article_path = os.path.join(package_dir, "article.md")
    if os.path.exists(article_path):
        result["article_md"] = article_path
    
    # 扫描图片
    images_dir = os.path.join(package_dir, "images")
    if os.path.exists(images_dir):
        for f in sorted(os.listdir(images_dir)):
            if f.endswith(('.png', '.jpg', '.jpeg')):
                result["images"].append(os.path.join("images", f))
    
    # 扫描图表
    charts_dir = os.path.join(package_dir, "charts")
    if os.path.exists(charts_dir):
        for f in sorted(os.listdir(charts_dir)):
            if f.endswith('.png'):
                result["charts"].append(os.path.join("charts", f))
    
    # 扫描信息图
    info_dir = os.path.join(package_dir, "infographics")
    if os.path.exists(info_dir):
        for f in sorted(os.listdir(info_dir)):
            if f.endswith('.png'):
                result["infographics"].append(os.path.join("infographics", f))
    
    return result

def parse_article(article_path: str) -> dict:
    """
    解析原始文章，提取各部分
    """
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取标题
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "无标题"
    
    # 提取导语（第一段）
    intro_match = re.search(r'^# .+\n\n(.+?)(?=\n\n##|$)', content, re.DOTALL)
    intro = intro_match.group(1).strip() if intro_match else ""
    
    # 提取正文（所有小节）
    sections = re.findall(r'## (.+?)\n\n(.+?)(?=\n\n##|\n\n---|$)', content, re.DOTALL)
    
    # 提取结尾
    conclusion_match = re.search(r'## .+说几句\n\n(.+?)(?=\n\n---|$)', content, re.DOTALL)
    conclusion = conclusion_match.group(1).strip() if conclusion_match else ""
    
    return {
        "title": title,
        "intro": intro,
        "sections": sections,
        "conclusion": conclusion,
        "raw_content": content
    }

def build_content_body(sections: list, images: list, charts: list) -> str:
    """
    构建正文内容，插入图片和图表
    """
    content_parts = []
    
    img_index = 0
    chart_index = 0
    
    for i, (section_title, section_content) in enumerate(sections):
        # 添加小标题
        content_parts.append(f"## {section_title}\n")
        
        # 清理内容中的 [IMAGE: xxx] 标记
        clean_content = re.sub(r'\[IMAGE:[^\]]+\]', '', section_content).strip()
        content_parts.append(clean_content)
        
        # 每隔2个小节插入一张图表（如果有）
        if i > 0 and i % 2 == 0 and chart_index < len(charts):
            content_parts.append(f"\n![数据图表]({charts[chart_index]})\n")
            chart_index += 1
        
        # 每隔3个小节插入一张信息图（如果有）
        if i > 0 and i % 3 == 0 and img_index < len(images) - 1:  # -1 保留封面
            img = images[img_index + 1]  # +1 跳过封面
            if 'img' in img:  # 段落配图
                content_parts.append(f"\n![配图]({img})\n")
                img_index += 1
        
        content_parts.append("\n")
    
    return "\n".join(content_parts)

def build_data_section(charts: list, infographics: list) -> str:
    """
    构建数据洞察部分
    """
    parts = []
    
    if charts:
        parts.append("### 关键数据趋势\n")
        for chart in charts[:2]:  # 最多2个图表
            parts.append(f"![{os.path.basename(chart)}]({chart})")
            parts.append("")
    
    if infographics:
        parts.append("### 行业结构分析\n")
        for info in infographics[:1]:  # 最多1个信息图
            parts.append(f"![{os.path.basename(info)}]({info})")
            parts.append("")
    
    if not parts:
        parts.append("*数据图表生成中...*")
    
    return "\n".join(parts)

def build_summary_section(infographics: list) -> str:
    """
    构建核心观点部分
    """
    if infographics and len(infographics) > 1:
        # 使用趋势总结信息图
        return f"![趋势总结]({infographics[0]})"
    
    return """1. **市场正在变化** — 传统客源结构需要调整
2. **新机会出现** — 银发、女性等高价值客群增长
3. **行动要趁早** — 现在布局比明年被迫转型更从容"""

def generate_final_article(package_dir: str, topic: dict) -> str:
    """
    生成最终排版文章
    """
    # 扫描素材
    assets = scan_package(package_dir)
    
    if not assets["article_md"]:
        print(f"   ❌ 找不到文章: {package_dir}")
        return None
    
    # 解析文章
    article = parse_article(assets["article_md"])
    
    # 构建各部分
    content_body = build_content_body(
        article["sections"], 
        assets["images"], 
        assets["charts"]
    )
    
    data_section = build_data_section(assets["charts"], assets["infographics"])
    summary_section = build_summary_section(assets["infographics"])
    
    # 填充模板
    final_content = LAYOUT_TEMPLATE.format(
        title=article["title"],
        intro=article["intro"],
        content=content_body,
        data_section=data_section,
        summary_section=summary_section,
        data_source=topic.get("source", "行业公开资料"),
        target_audience="酒店投资人、运营负责人",
        publish_date=datetime.now().strftime("%Y年%m月%d日")
    )
    
    # 保存
    output_path = os.path.join(package_dir, "final_article.md")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"   ✅ 最终文章已生成: {output_path}")
    return output_path

def batch_process(output_base_dir: str, topics_json_path: str):
    """
    批量处理3个文章包
    """
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    
    print(f"\n{'='*50}")
    print("📄 开始排版整合...")
    
    for i, topic in enumerate(data.get("selected_topics", [])[:3], 1):
        package_dir = os.path.join(output_base_dir, f"article_package_{i}")
        
        print(f"\n📦 处理文章包 {i}...")
        result = generate_final_article(package_dir, topic)
        
        if result:
            results.append({
                "package": f"article_package_{i}",
                "final_article": result
            })
    
    # 输出总结
    print(f"\n{'='*50}")
    print("📊 排版完成总结:")
    print(f"   成功生成: {len(results)}/3 篇最终文章")
    for r in results:
        print(f"   ✅ {r['package']}/final_article.md")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 2:
        batch_process(sys.argv[1], sys.argv[2])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        batch_process(
            "/Users/yr/.openclaw/workspace/output",
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json"
        )
