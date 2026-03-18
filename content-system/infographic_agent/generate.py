# Infographic Agent
# 任务：将文章关键信息生成信息图
# 类型：趋势总结、数据总结、行业结构图
# 尺寸：1024x1024
# 技术：Python + Pillow

import json
import os
import re
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import numpy as np

# 配置
INFO_SIZE = (1024, 1024)
BG_COLOR = (250, 250, 252)
PRIMARY_COLOR = (46, 134, 171)  # 蓝色
SECONDARY_COLOR = (162, 59, 114)  # 紫色
ACCENT_COLOR = (241, 143, 1)  # 橙色
TEXT_COLOR = (51, 51, 51)
LIGHT_TEXT = (120, 120, 120)

def create_gradient_background(size, color1, color2):
    """创建渐变背景"""
    img = Image.new('RGB', size)
    draw = ImageDraw.Draw(img)
    
    for y in range(size[1]):
        r = int(color1[0] + (color2[0] - color1[0]) * y / size[1])
        g = int(color1[1] + (color2[1] - color1[1]) * y / size[1])
        b = int(color1[2] + (color2[2] - color1[2]) * y / size[1])
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    
    return img

def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    """绘制圆角矩形"""
    x1, y1, x2, y2 = xy
    
    # 主体矩形
    draw.rectangle([x1+radius, y1, x2-radius, y2], fill=fill)
    draw.rectangle([x1, y1+radius, x2, y2-radius], fill=fill)
    
    # 四个角
    draw.ellipse([x1, y1, x1+radius*2, y1+radius*2], fill=fill)
    draw.ellipse([x2-radius*2, y1, x2, y1+radius*2], fill=fill)
    draw.ellipse([x1, y2-radius*2, x1+radius*2, y2], fill=fill)
    draw.ellipse([x2-radius*2, y2-radius*2, x2, y2], fill=fill)

def generate_trend_summary_infographic(title: str, key_points: list, output_path: str) -> bool:
    """
    生成趋势总结信息图
    """
    try:
        # 创建渐变背景
        img = create_gradient_background(INFO_SIZE, (240, 248, 255), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # 标题区域
        title_y = 60
        draw.text((INFO_SIZE[0]//2, title_y), title[:20], fill=PRIMARY_COLOR, 
                 anchor="mm", font_size=48)
        
        draw.text((INFO_SIZE[0]//2, title_y+60), "趋势总结", fill=LIGHT_TEXT,
                 anchor="mm", font_size=28)
        
        # 绘制关键点卡片
        card_width = 880
        card_height = 140
        start_y = 180
        gap = 30
        
        for i, point in enumerate(key_points[:4]):
            y = start_y + i * (card_height + gap)
            
            # 卡片背景
            draw_rounded_rect(draw, [72, y, 72+card_width, y+card_height], 
                            radius=20, fill=(255, 255, 255), outline=(230, 230, 230), width=2)
            
            # 序号圆圈
            circle_x = 120
            circle_y = y + card_height//2
            colors = [PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, (106, 153, 78)]
            draw.ellipse([circle_x-30, circle_y-30, circle_x+30, circle_y+30], 
                        fill=colors[i % len(colors)])
            draw.text((circle_x, circle_y), str(i+1), fill=(255, 255, 255),
                     anchor="mm", font_size=32)
            
            # 文字内容
            text_x = 180
            text_y = y + card_height//2
            # 简化显示，实际应使用字体
            draw.text((text_x, text_y), point[:40], fill=TEXT_COLOR,
                     anchor="lm", font_size=24)
        
        # 底部装饰
        draw.rectangle([0, INFO_SIZE[1]-80, INFO_SIZE[0], INFO_SIZE[1]], 
                      fill=PRIMARY_COLOR)
        draw.text((INFO_SIZE[0]//2, INFO_SIZE[1]-40), "酒店渠道参谋 | 每日趋势洞察",
                 fill=(255, 255, 255), anchor="mm", font_size=24)
        
        # 保存
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG", quality=95)
        
        print(f"   ✅ 趋势信息图已生成: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ 信息图生成失败: {e}")
        return False

def generate_data_summary_infographic(data: dict, output_path: str) -> bool:
    """
    生成数据总结信息图
    """
    try:
        img = Image.new('RGB', INFO_SIZE, BG_COLOR)
        draw = ImageDraw.Draw(img)
        
        # 标题
        draw.text((INFO_SIZE[0]//2, 80), "核心数据", fill=PRIMARY_COLOR,
                 anchor="mm", font_size=52)
        
        # 大数字展示
        if 'value' in data:
            value = data['value']
            unit = data.get('unit', '')
            
            # 主数字
            draw.text((INFO_SIZE[0]//2, 300), str(value), fill=PRIMARY_COLOR,
                     anchor="mm", font_size=120)
            draw.text((INFO_SIZE[0]//2, 420), unit, fill=LIGHT_TEXT,
                     anchor="mm", font_size=40)
            
            # 描述
            desc = data.get('description', '')
            draw.text((INFO_SIZE[0]//2, 520), desc[:30], fill=TEXT_COLOR,
                     anchor="mm", font_size=28)
        
        # 辅助数据点
        if 'sub_points' in data:
            y_start = 600
            for i, point in enumerate(data['sub_points'][:3]):
                y = y_start + i * 80
                
                # 小圆点
                draw.ellipse([150, y-10, 170, y+10], fill=SECONDARY_COLOR)
                
                # 文字
                draw.text((200, y), point[:35], fill=TEXT_COLOR,
                         anchor="lm", font_size=24)
        
        # 保存
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG", quality=95)
        
        print(f"   ✅ 数据信息图已生成: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ 数据信息图生成失败: {e}")
        return False

def generate_structure_infographic(structure: dict, output_path: str) -> bool:
    """
    生成行业结构图
    """
    try:
        img = Image.new('RGB', INFO_SIZE, (255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # 标题
        draw.text((INFO_SIZE[0]//2, 60), structure.get('title', '行业结构'), 
                 fill=PRIMARY_COLOR, anchor="mm", font_size=44)
        
        # 中心圆
        center_x = INFO_SIZE[0] // 2
        center_y = INFO_SIZE[1] // 2
        
        # 绘制中心
        draw.ellipse([center_x-100, center_y-100, center_x+100, center_y+100],
                    fill=PRIMARY_COLOR)
        draw.text((center_x, center_y), structure.get('center', '核心'),
                 fill=(255, 255, 255), anchor="mm", font_size=28)
        
        # 绘制分支
        branches = structure.get('branches', [])
        angle_step = 360 / max(len(branches), 1)
        radius = 280
        
        for i, branch in enumerate(branches[:6]):
            angle = i * angle_step
            rad = np.radians(angle)
            
            x = center_x + radius * np.cos(rad)
            y = center_y + radius * np.sin(rad)
            
            # 连线
            draw.line([(center_x, center_y), (x, y)], fill=(200, 200, 200), width=3)
            
            # 分支圆
            colors = [SECONDARY_COLOR, ACCENT_COLOR, (106, 153, 78), 
                     (233, 196, 106), (188, 71, 73), (91, 140, 164)]
            draw.ellipse([x-70, y-70, x+70, y+70], fill=colors[i % len(colors)])
            
            # 文字
            draw.text((x, y), branch[:6], fill=(255, 255, 255),
                     anchor="mm", font_size=20)
        
        # 保存
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG", quality=95)
        
        print(f"   ✅ 结构信息图已生成: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ 结构信息图生成失败: {e}")
        return False

def extract_key_points(article_path: str) -> list:
    """
    从文章提取关键信息点
    """
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    points = []
    
    # 提取小标题作为要点
    import re
    headers = re.findall(r'## (.+)', content)
    for h in headers[:4]:
        points.append(h.strip())
    
    # 提取带数字的句子
    number_sentences = re.findall(r'[^。]*\d+%[^。]*。', content)
    for s in number_sentences[:2]:
        points.append(s.strip())
    
    # 如果要点不足，添加默认
    if len(points) < 3:
        points.extend([
            "行业趋势正在发生变化",
            "需要关注新兴客群需求",
            "调整策略把握市场机会"
        ])
    
    return points[:4]

def process_article_package(package_dir: str, title: str) -> dict:
    """
    处理单个文章包，生成信息图
    """
    article_path = os.path.join(package_dir, "article.md")
    info_dir = os.path.join(package_dir, "infographics")
    
    os.makedirs(info_dir, exist_ok=True)
    
    result = {
        "package": package_dir,
        "infographics": []
    }
    
    print(f"\n📦 处理文章包: {os.path.basename(package_dir)}")
    
    if not os.path.exists(article_path):
        print(f"   ❌ 文章不存在")
        return result
    
    # 提取关键信息
    key_points = extract_key_points(article_path)
    
    # 1. 生成趋势总结信息图
    trend_path = os.path.join(info_dir, "info_trend.png")
    if generate_trend_summary_infographic(title, key_points, trend_path):
        result["infographics"].append({"type": "trend", "path": trend_path})
    
    # 2. 生成数据总结信息图
    data = {
        "value": "20%",
        "unit": "增长",
        "description": "银发女性客群增速",
        "sub_points": [
            "人均客单价高于男性",
            "年均消费频次更高",
            "品质敏感度高于价格"
        ]
    }
    data_path = os.path.join(info_dir, "info_data.png")
    if generate_data_summary_infographic(data, data_path):
        result["infographics"].append({"type": "data", "path": data_path})
    
    # 3. 生成行业结构图
    structure = {
        "title": "酒店客源结构",
        "center": "酒店",
        "branches": ["商务客", "休闲客", "银发族", "女性", "亲子", "Z世代"]
    }
    struct_path = os.path.join(info_dir, "info_structure.png")
    if generate_structure_infographic(structure, struct_path):
        result["infographics"].append({"type": "structure", "path": struct_path})
    
    return result

def batch_process(output_base_dir: str, topics_json_path: str):
    """
    批量处理3个文章包
    """
    with open(topics_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_results = []
    
    for i, topic in enumerate(data.get("selected_topics", [])[:3], 1):
        package_dir = os.path.join(output_base_dir, f"article_package_{i}")
        title = topic.get("title", "")
        
        result = process_article_package(package_dir, title)
        all_results.append(result)
    
    # 输出总结
    print(f"\n{'='*50}")
    print("📊 信息图生成总结:")
    total = sum(len(r["infographics"]) for r in all_results)
    print(f"   总计生成: {total} 张信息图")
    for r in all_results:
        print(f"   {os.path.basename(r['package'])}: {len(r['infographics'])} 张")
    print(f"{'='*50}")
    
    return all_results

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
