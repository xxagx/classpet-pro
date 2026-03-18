#!/usr/bin/env python3
"""
视频自动生成脚本
输入：article.md
输出：final_video.mp4
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# 配置
WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

# 视频参数
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
DURATION_PER_SLIDE = 6  # 每张图6秒

def create_slide(text, subtitle=None, bg_color=(30, 30, 30)):
    """生成单张画面"""
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    # 尝试加载字体
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 80)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 48)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # 主标题
    if text:
        # 自动换行处理
        lines = []
        words = text
        current_line = ""
        for word in words:
            test_line = current_line + word
            bbox = draw.textbbox((0, 0), test_line, font=title_font)
            if bbox[2] - bbox[0] > VIDEO_WIDTH - 200:
                lines.append(current_line)
                current_line = word
            else:
                current_line = test_line
        lines.append(current_line)
        
        # 垂直居中
        total_height = len(lines) * 100
        start_y = (VIDEO_HEIGHT - total_height) // 2
        
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, start_y + i * 100), line, font=title_font, fill=(255, 255, 255))
    
    # 副标题
    if subtitle:
        bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        draw.text((x, VIDEO_HEIGHT - 300), subtitle, font=subtitle_font, fill=(200, 200, 200))
    
    return img

def generate_slides(topic):
    """生成视频画面序列"""
    slides_dir = OUTPUT_DIR / f"video_{topic}"
    slides_dir.mkdir(parents=True, exist_ok=True)
    
    # 基于春糖主题生成画面
    slides_data = [
        ("春糖酒店价格策略", "从躺赚到精算的生死转型"),
        ("ADR三年下滑", "2024: 1.9晚 → 2026: 1.3晚"),
        ("投诉率暴涨", "从8%到15%，复购归零"),
        ("高端酒店解法", "打包服务包，ADR+35%"),
        ("中端酒店解法", "私域拼团，入住率95%"),
        ("经济型酒店解法", "时间切片，RevPAR+25%"),
        ("今日行动", "查数据 → 设上限 → 建标签"),
        ("私信领资料", "《展会收益决策检查清单》"),
    ]
    
    for i, (title, subtitle) in enumerate(slides_data):
        img = create_slide(title, subtitle)
        img.save(slides_dir / f"slide_{i:02d}.png")
    
    return slides_dir, len(slides_data)

def generate_voiceover(text, output_path):
    """生成配音"""
    # 使用edge-tts
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-XiaoxiaoNeural"
    ]
    subprocess.run(cmd, check=True)

def generate_video(slides_dir, num_slides, voiceover_path, output_path):
    """合成视频"""
    
    # 生成图片序列视频
    slides_video = slides_dir / "slides.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-framerate", "1/6",  # 每张6秒
        "-i", str(slides_dir / "slide_%02d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-vf", f"scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}",
        str(slides_video)
    ]
    subprocess.run(cmd, check=True)
    
    # 合并音轨
    cmd = [
        "ffmpeg", "-y",
        "-i", str(slides_video),
        "-i", str(voiceover_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        str(output_path)
    ]
    subprocess.run(cmd, check=True)
    
    return output_path

def main():
    """主流程"""
    topic = "春糖酒店策略"
    date_str = "2026-03-10"
    
    print(f"[{date_str}] 开始生成视频: {topic}")
    
    # 1. 生成画面
    slides_dir, num_slides = generate_slides(topic)
    print(f"✅ 生成 {num_slides} 张画面")
    
    # 2. 生成配音
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从2024年的1.9晚，下滑到2026年的1.3晚。投诉率从8%暴涨到15%，复购几乎归零。三类酒店找到解法：高端打包服务，中端私域拼团，经济型时间切片。今天就能做的三件事：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    voiceover_path = slides_dir / "voiceover.mp3"
    generate_voiceover(voiceover_text, voiceover_path)
    print("✅ 生成配音")
    
    # 3. 合成视频
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}.mp4"
    generate_video(slides_dir, num_slides, voiceover_path, output_path)
    print(f"✅ 视频生成完成: {output_path}")
    
    return output_path

if __name__ == "__main__":
    try:
        result = main()
        print(f"\n🎬 视频文件: {result}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        sys.exit(1)
