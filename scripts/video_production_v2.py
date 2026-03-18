#!/usr/bin/env python3
"""
视频自动生成脚本 V2 - 去AI化风格
输入：article.md
输出：final_video.mp4
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 配置
WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

# 视频参数
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
DURATION_PER_SLIDE = 6  # 每张图6秒

def create_paper_texture(width, height):
    """创建纸张纹理背景"""
    # 深灰色黑板背景
    base = Image.new('RGB', (width, height), (25, 25, 30))
    
    # 添加细微噪点模拟黑板质感
    import random
    pixels = base.load()
    for i in range(0, width, 2):
        for j in range(0, height, 2):
            noise = random.randint(-5, 5)
            r = max(0, min(255, 25 + noise))
            g = max(0, min(255, 25 + noise))
            b = max(0, min(255, 30 + noise))
            pixels[i, j] = (r, g, b)
    
    return base

def add_hand_drawn_elements(draw, width, height):
    """添加手绘风格装饰元素"""
    # 随机手绘箭头
    import random
    
    # 左上角装饰箭头
    arrow_color = (200, 100, 80)  # 红褐色
    draw.line([(50, 150), (80, 120)], fill=arrow_color, width=3)
    draw.line([(80, 120), (70, 125)], fill=arrow_color, width=2)
    draw.line([(80, 120), (75, 130)], fill=arrow_color, width=2)
    
    # 右下角装饰圆圈
    circle_color = (100, 150, 200)  # 蓝色
    draw.ellipse([(width-120, height-200), (width-80, height-160)], outline=circle_color, width=2)
    
    # 荧光笔标记线（黄色半透明）
    highlight_color = (255, 220, 100)
    return highlight_color

def create_slide(title, subtitle=None, slide_type="content"):
    """生成单张画面 - 黑板风格"""
    img = create_paper_texture(VIDEO_WIDTH, VIDEO_HEIGHT)
    draw = ImageDraw.Draw(img)
    
    # 尝试加载字体
    try:
        # 手写风格标题字体
        title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 42)
        body_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 36)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
    
    # 添加装饰元素
    highlight_color = add_hand_drawn_elements(draw, VIDEO_WIDTH, VIDEO_HEIGHT)
    
    if slide_type == "title":
        # 标题页样式
        # 主标题 - 大字居中
        if title:
            lines = []
            current_line = ""
            for char in title:
                test_line = current_line + char
                bbox = draw.textbbox((0, 0), test_line, font=title_font)
                if bbox[2] - bbox[0] > VIDEO_WIDTH - 150:
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
                y = start_y + i * 90
                
                # 添加荧光笔背景效果
                draw.rectangle([(x-10, y+10), (x+text_width+10, y+70)], fill=(255, 220, 100, 100))
                draw.text((x, y), line, font=title_font, fill=(255, 255, 255))
        
        # 副标题
        if subtitle:
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            draw.text((x, VIDEO_HEIGHT - 400), subtitle, font=subtitle_font, fill=(180, 180, 180))
    
    else:
        # 内容页样式
        # 顶部标题
        if title:
            bbox = draw.textbbox((0, 0), title, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - text_width) // 2
            
            # 荧光笔标记
            draw.rectangle([(x-15, 120), (x+text_width+15, 190)], fill=(200, 100, 80))
            draw.text((x, 120), title, font=title_font, fill=(255, 255, 255))
        
        # 副标题/正文
        if subtitle:
            lines = []
            current_line = ""
            for char in subtitle:
                test_line = current_line + char
                bbox = draw.textbbox((0, 0), test_line, font=body_font)
                if bbox[2] - bbox[0] > VIDEO_WIDTH - 200:
                    lines.append(current_line)
                    current_line = char
                else:
                    current_line = test_line
            lines.append(current_line)
            
            start_y = 400
            for i, line in enumerate(lines):
                bbox = draw.textbbox((0, 0), line, font=body_font)
                text_width = bbox[2] - bbox[0]
                x = (VIDEO_WIDTH - text_width) // 2
                draw.text((x, start_y + i * 70), line, font=body_font, fill=(220, 220, 220))
    
    # 添加页码装饰
    draw.text((VIDEO_WIDTH - 100, VIDEO_HEIGHT - 100), "·", font=body_font, fill=(150, 150, 150))
    
    return img

def generate_slides(topic):
    """生成视频画面序列"""
    slides_dir = OUTPUT_DIR / f"video_{topic}_v2"
    slides_dir.mkdir(parents=True, exist_ok=True)
    
    # 基于春糖主题生成画面
    slides_data = [
        ("春糖酒店价格策略", "从躺赚到精算的生死转型", "title"),
        ("ADR三年下滑", "2024年: 1.9晚 → 2026年: 1.3晚", "content"),
        ("投诉率暴涨", "从8%到15%，复购几乎归零", "content"),
        ("高端酒店解法", "打包会展服务包，ADR提升35%", "content"),
        ("中端酒店解法", "散户拼团+私域运营，入住率95%", "content"),
        ("经济型酒店解法", "时间切片零售，RevPAR提升25%", "content"),
        ("今日行动", "查数据 → 设上限 → 建标签", "content"),
        ("私信领资料", "《展会收益决策检查清单》", "content"),
    ]
    
    for i, (title, subtitle, slide_type) in enumerate(slides_data):
        img = create_slide(title, subtitle, slide_type)
        img.save(slides_dir / f"slide_{i:02d}.png")
    
    return slides_dir, len(slides_data)

def generate_voiceover(text, output_path):
    """生成配音 - 使用Edge-TTS男声"""
    # 使用zh-CN-YunxiNeural（男声，更自然）
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-YunxiNeural",
        "--rate", "+10%"  # 稍微加快语速
    ]
    subprocess.run(cmd, check=True)

def add_background_music(video_path, output_path):
    """添加轻音乐背景"""
    # 使用ffmpeg添加轻音乐背景（降低音量到0.1）
    # 如果没有BGM文件，创建一个简单的轻音乐
    bgm_path = OUTPUT_DIR / "bgm_light.mp3"
    
    # 生成简单的轻音乐（使用sine波）
    if not bgm_path.exists():
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", "sine=frequency=400:duration=60",  # 60秒 sine波
            "-af", "volume=0.05",  # 音量降到5%
            str(bgm_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
    
    # 混合视频和BGM
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(bgm_path),
        "-filter_complex", "[0:a]volume=1.0[a0];[1:a]volume=0.08[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[outa]",
        "-map", "0:v",
        "-map", "[outa]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        str(output_path)
    ]
    subprocess.run(cmd, check=True)

def generate_video(slides_dir, num_slides, voiceover_path, output_path):
    """合成视频 - 修复版"""
    
    # 生成图片序列视频 - 修复参数
    slides_video = slides_dir / "slides_video.mp4"
    
    # 使用更可靠的ffmpeg参数
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-loop", "1",
        "-i", str(slides_dir / "slide_%02d.png"),
        "-vf", f"fps={FPS},scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}:force_original_aspect_ratio=decrease,pad={VIDEO_WIDTH}:{VIDEO_HEIGHT}:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-t", str(num_slides * DURATION_PER_SLIDE),
        "-r", str(FPS),
        str(slides_video)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    # 合并音轨
    temp_video = slides_dir / "temp_merged.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(slides_video),
        "-i", str(voiceover_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(temp_video)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    # 添加背景音乐
    add_background_music(temp_video, output_path)
    
    return output_path

def main():
    """主流程"""
    topic = "春糖酒店策略"
    date_str = "2026-03-10"
    
    print(f"[{date_str}] 开始生成视频 V2: {topic}")
    
    # 1. 生成画面
    slides_dir, num_slides = generate_slides(topic)
    print(f"✅ 生成 {num_slides} 张画面（黑板风格）")
    
    # 2. 生成配音（男声）
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从2024年的1.9晚，下滑到2026年的1.3晚。投诉率从8%暴涨到15%，复购几乎归零。三类酒店找到解法：高端打包服务，中端私域拼团，经济型时间切片。今天就能做的三件事：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    voiceover_path = slides_dir / "voiceover.mp3"
    generate_voiceover(voiceover_text, voiceover_path)
    print("✅ 生成配音（男声）")
    
    # 3. 合成视频
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}_v2.mp4"
    generate_video(slides_dir, num_slides, voiceover_path, output_path)
    print(f"✅ 视频生成完成: {output_path}")
    
    # 4. 检查文件大小
    file_size = output_path.stat().st_size / 1024 / 1024
    print(f"📁 文件大小: {file_size:.2f} MB")
    
    return output_path

if __name__ == "__main__":
    try:
        result = main()
        print(f"\n🎬 视频文件: {result}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
