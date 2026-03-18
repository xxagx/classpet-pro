#!/usr/bin/env python3
"""
视频自动生成脚本 V3 - 简单可靠版
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
SLIDE_DURATION = 6

def create_simple_slide(title, subtitle, index, total):
    """生成简单可靠的画面"""
    # 深色背景
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), (20, 20, 25))
    draw = ImageDraw.Draw(img)
    
    # 加载字体
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 70)
        body_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 40)
        small_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 30)
    except:
        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # 标题 - 白色
    if title:
        bbox = draw.textbbox((0, 0), title, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        draw.text((x, 300), title, font=title_font, fill=(255, 255, 255))
    
    # 副标题 - 灰色
    if subtitle:
        bbox = draw.textbbox((0, 0), subtitle, font=body_font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        draw.text((x, 500), subtitle, font=body_font, fill=(180, 180, 180))
    
    # 页码
    page_text = f"{index + 1}/{total}"
    draw.text((VIDEO_WIDTH - 150, VIDEO_HEIGHT - 100), page_text, font=small_font, fill=(100, 100, 100))
    
    return img

def main():
    topic = "春糖酒店策略"
    date_str = "2026-03-10"
    
    slides_dir = OUTPUT_DIR / f"video_{topic}_v3"
    slides_dir.mkdir(parents=True, exist_ok=True)
    
    # 内容
    slides_data = [
        ("春糖酒店价格策略", "从躺赚到精算的生死转型"),
        ("ADR三年下滑", "2024年1.9晚 → 2026年1.3晚"),
        ("投诉率暴涨", "从8%到15%，复购归零"),
        ("高端酒店解法", "打包服务包，ADR+35%"),
        ("中端酒店解法", "私域拼团，入住率95%"),
        ("经济型酒店解法", "时间切片，RevPAR+25%"),
        ("今日行动", "查数据 → 设上限 → 建标签"),
        ("私信领资料", "《展会收益决策检查清单》"),
    ]
    
    num_slides = len(slides_data)
    
    # 生成画面
    print("生成画面...")
    for i, (title, subtitle) in enumerate(slides_data):
        img = create_simple_slide(title, subtitle, i, num_slides)
        img.save(slides_dir / f"slide_{i:02d}.png")
    print(f"✅ 生成 {num_slides} 张画面")
    
    # 生成配音
    print("生成配音...")
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从2024年的1.9晚，下滑到2026年的1.3晚。投诉率从8%暴涨到15%，复购几乎归零。三类酒店找到解法：高端打包服务，中端私域拼团，经济型时间切片。今天就能做的三件事：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    voiceover_path = slides_dir / "voiceover.mp3"
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", voiceover_text,
        "--write-media", str(voiceover_path),
        "--voice", "zh-CN-YunxiNeural"
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print("✅ 配音完成")
    
    # 生成视频 - 使用图片序列
    print("合成视频...")
    
    # 先生成带时长的图片视频
    slides_video = slides_dir / "video_raw.mp4"
    
    # 创建文件列表
    filelist_path = slides_dir / "filelist.txt"
    with open(filelist_path, 'w') as f:
        for i in range(num_slides):
            f.write(f"file 'slide_{i:02d}.png'\n")
            f.write(f"duration {SLIDE_DURATION}\n")
        f.write(f"file 'slide_{num_slides-1:02d}.png'\n")  # 最后一张
    
    # 使用concat demuxer
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(filelist_path),
        "-vf", f"fps={FPS},format=yuv420p",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        str(slides_video)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    # 合并音频
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}_v3.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(slides_video),
        "-i", str(voiceover_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(output_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    print(f"✅ 视频生成完成: {output_path}")
    
    # 检查文件
    size = output_path.stat().st_size / 1024 / 1024
    print(f"📁 文件大小: {size:.2f} MB")
    
    return output_path

if __name__ == "__main__":
    try:
        result = main()
        print(f"\n🎬 完成: {result}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
