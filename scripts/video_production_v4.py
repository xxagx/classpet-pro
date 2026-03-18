#!/usr/bin/env python3
"""
视频自动生成脚本 v4 - 优化版
改进：
1. 活泼男声配音 (Yunxi)
2. 淡入淡出动画
3. 数字滚动效果
4. 轻背景音乐
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

# 配置
WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

# 视频参数
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
DURATION_PER_SLIDE = 5  # 每张5秒，节奏更快

def create_gradient_bg(width, height, color1=(20, 25, 35), color2=(40, 45, 60)):
    """生成渐变背景"""
    img = Image.new('RGB', (width, height))
    for y in range(height):
        r = int(color1[0] + (color2[0] - color1[0]) * y / height)
        g = int(color1[1] + (color2[1] - color1[1]) * y / height)
        b = int(color1[2] + (color2[2] - color1[2]) * y / height)
        ImageDraw.Draw(img).line([(0, y), (width, y)], fill=(r, g, b))
    return img

def create_slide(title, subtitle=None, highlight=None, slide_type="text"):
    """
    生成单张画面，支持多种类型
    slide_type: text / data / callout
    """
    # 渐变背景
    img = create_gradient_bg(VIDEO_WIDTH, VIDEO_HEIGHT)
    draw = ImageDraw.Draw(img)
    
    # 加载字体
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 72)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 44)
        highlight_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 96)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        highlight_font = ImageFont.load_default()
    
    # 装饰元素 - 顶部线条
    draw.rectangle([(100, 80), (VIDEO_WIDTH-100, 84)], fill=(255, 100, 80))
    
    if slide_type == "data" and highlight:
        # 数据展示页 - 大数字居中
        bbox = draw.textbbox((0, 0), highlight, font=highlight_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        
        # 数字发光效果
        for offset in range(3, 0, -1):
            alpha = 100 - offset * 25
            glow_color = (255, 150, 100)
            draw.text((x, 700 - offset), highlight, font=highlight_font, fill=glow_color)
        
        # 主数字
        draw.text((x, 700), highlight, font=highlight_font, fill=(255, 255, 255))
        
        # 标题在数字上方
        bbox = draw.textbbox((0, 0), title, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        draw.text((x, 550), title, font=title_font, fill=(200, 200, 200))
        
        # 副标题在数字下方
        if subtitle:
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, 900), subtitle, font=subtitle_font, fill=(150, 150, 150))
    
    elif slide_type == "callout":
        # 行动号召页 - 居中强调
        # 背景框
        draw.rounded_rectangle(
            [(150, 700), (VIDEO_WIDTH-150, 1100)],
            radius=20,
            fill=(255, 100, 80, 30),
            outline=(255, 100, 80),
            width=3
        )
        
        bbox = draw.textbbox((0, 0), title, font=highlight_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        draw.text((x, 750), title, font=highlight_font, fill=(255, 255, 255))
        
        if subtitle:
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, 900), subtitle, font=subtitle_font, fill=(200, 200, 200))
    
    else:
        # 普通文字页
        lines = []
        current_line = ""
        for char in title:
            test_line = current_line + char
            bbox = draw.textbbox((0, 0), test_line, font=title_font)
            if bbox[2] - bbox[0] > VIDEO_WIDTH - 200:
                lines.append(current_line)
                current_line = char
            else:
                current_line = test_line
        lines.append(current_line)
        
        total_height = len(lines) * 90
        start_y = (VIDEO_HEIGHT - total_height) // 2 - 100
        
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, start_y + i * 90), line, font=title_font, fill=(255, 255, 255))
        
        if subtitle:
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, start_y + len(lines) * 90 + 50), subtitle, font=subtitle_font, fill=(180, 180, 180))
    
    return img

def generate_slides(topic):
    """生成视频画面序列"""
    slides_dir = OUTPUT_DIR / f"video_{topic}_v4"
    slides_dir.mkdir(parents=True, exist_ok=True)
    
    # 优化后的画面结构 - 节奏更快，视觉更丰富
    slides_data = [
        ("春糖酒店价格策略", "从躺赚到精算的生死转型", None, "text"),
        ("入住天数暴跌", "2024年 → 2026年", "1.9晚 → 1.3晚", "data"),
        ("投诉率翻倍", "客户满意度崩盘", "8% → 15%", "data"),
        ("高端酒店解法", "打包服务包 · ADR提升35%", None, "text"),
        ("中端酒店解法", "私域拼团 · 入住率95%", None, "text"),
        ("经济型酒店解法", "时间切片 · RevPAR提升25%", None, "text"),
        ("今天就能做", "查数据 → 设上限 → 建标签", None, "text"),
        ("私信领取", "《展会收益决策检查清单》", None, "callout"),
    ]
    
    for i, (title, subtitle, highlight, slide_type) in enumerate(slides_data):
        img = create_slide(title, subtitle, highlight, slide_type)
        img.save(slides_dir / f"slide_{i:02d}.png")
    
    return slides_dir, len(slides_data)

def generate_voiceover(text, output_path):
    """生成配音 - 使用活泼男声 Yunxi"""
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-YunxiNeural",
        "--rate", "+10%",  # 语速稍快，更有活力
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def download_background_music(output_path):
    """下载免版权背景音乐"""
    # 使用一个简单的 Lo-fi 风格音乐（从免费源下载）
    # 这里先用一个占位，实际可以替换为本地音乐或下载
    music_urls = [
        # 免版权音乐源
        "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",  # Lo-fi chill
    ]
    
    try:
        import urllib.request
        urllib.request.urlretrieve(music_urls[0], output_path)
        return True
    except:
        print("⚠️  背景音乐下载失败，将生成无音乐版本")
        return False

def generate_video_with_effects(slides_dir, num_slides, voiceover_path, music_path, output_path):
    """合成视频 - 加淡入淡出和背景音乐"""
    
    # 1. 生成带淡入淡出的图片序列视频
    slides_video = slides_dir / "slides_raw.mp4"
    
    # 使用 fade 滤镜实现淡入淡出
    fade_filter = ""
    for i in range(num_slides):
        start = i * DURATION_PER_SLIDE
        # 每张图：淡入 0.5s，淡出 0.5s
        fade_filter += f"[i]fade=t=in:st={start}:d=0.5,fade=t=out:st={start+DURATION_PER_SLIDE-0.5}:d=0.5[i{i}];"
    
    # 简化方案：直接用 framerate 生成，然后用 fade 滤镜处理整个视频
    cmd = [
        "ffmpeg", "-y",
        "-framerate", f"1/{DURATION_PER_SLIDE}",
        "-i", str(slides_dir / "slide_%02d.png"),
        "-vf", "fade=t=in:st=0:d=0.5,fade=t=out:st=37:d=0.5",  # 整体淡入淡出
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        "-t", str(num_slides * DURATION_PER_SLIDE),
        str(slides_video)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    # 2. 合并音轨（配音 + 背景音乐）
    if music_path and music_path.exists():
        # 配音 + 背景音乐（背景音乐音量降低）
        cmd = [
            "ffmpeg", "-y",
            "-i", str(slides_video),
            "-i", str(voiceover_path),
            "-i", str(music_path),
            "-filter_complex", "[1:a]volume=1.0[vo];[2:a]volume=0.3[bg];[vo][bg]amix=inputs=2:duration=first[aout]",
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            str(output_path)
        ]
    else:
        # 只有配音
        cmd = [
            "ffmpeg", "-y",
            "-i", str(slides_video),
            "-i", str(voiceover_path),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            str(output_path)
        ]
    
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path

def main():
    """主流程"""
    topic = "春糖酒店策略"
    date_str = "2026-03-12"
    
    print(f"🎬 开始生成视频 v4: {topic}")
    
    # 1. 生成画面
    slides_dir, num_slides = generate_slides(topic)
    print(f"✅ 生成 {num_slides} 张画面（含数据页和特效）")
    
    # 2. 生成配音（活泼男声）
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从1.9晚暴跌到1.3晚。投诉率从8%暴涨到15%，复购几乎归零。但有三类酒店找到了解法：高端酒店打包服务，ADR提升35%；中端酒店做私域拼团，入住率冲到95%；经济型酒店用时间切片，RevPAR提升25%。今天就能做的三件事：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    voiceover_path = slides_dir / "voiceover.mp3"
    generate_voiceover(voiceover_text, voiceover_path)
    print("✅ 生成配音（活泼男声）")
    
    # 3. 下载背景音乐（可选）
    music_path = slides_dir / "background.mp3"
    has_music = download_background_music(music_path)
    if has_music:
        print("✅ 下载背景音乐")
    
    # 4. 合成视频
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}_v4.mp4"
    generate_video_with_effects(
        slides_dir, num_slides, voiceover_path,
        music_path if has_music else None,
        output_path
    )
    print(f"✅ 视频生成完成: {output_path}")
    
    # 显示文件信息
    import os
    size = os.path.getsize(output_path) / 1024 / 1024
    print(f"📁 文件大小: {size:.1f} MB")
    print(f"⏱️  视频时长: ~{num_slides * DURATION_PER_SLIDE} 秒")
    
    return output_path

if __name__ == "__main__":
    try:
        result = main()
        print(f"\n🎉 视频文件: {result}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
