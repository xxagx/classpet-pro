#!/usr/bin/env python3
"""
视频生成MVP - 今晚能跑的版本
技术：Pillow生成帧 + FFmpeg合成 + Edge-TTS配音
"""

import os
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import tempfile

WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

# 视频参数
W, H = 1080, 1920
FPS = 30

def create_slide(text, subtext=None, bg_color=(25, 28, 35)):
    """生成单张画面"""
    img = Image.new('RGB', (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    
    # 使用系统自带字体
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 80)
        font_sub = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 48)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # 主标题（居中）
    bbox = draw.textbbox((0, 0), text, font=font_title)
    text_w = bbox[2] - bbox[0]
    x = (W - text_w) // 2
    draw.text((x, H//2 - 100), text, font=font_title, fill=(255, 255, 255))
    
    # 副标题
    if subtext:
        bbox = draw.textbbox((0, 0), subtext, font=font_sub)
        text_w = bbox[2] - bbox[0]
        x = (W - text_w) // 2
        draw.text((x, H//2 + 50), subtext, font=font_sub, fill=(180, 180, 180))
    
    return img

def generate_frames(work_dir, slides):
    """生成所有帧"""
    frames = []
    frame_count = 0
    
    for slide in slides:
        duration = slide['duration']  # 秒
        num_frames = duration * FPS
        
        # 生成静态图
        img = create_slide(slide['text'], slide.get('subtext'))
        
        # 保存每一帧
        for i in range(num_frames):
            frame_path = work_dir / f"frame_{frame_count:05d}.png"
            img.save(frame_path)
            frames.append(frame_path)
            frame_count += 1
    
    return frames

def generate_voiceover(text, output_path):
    """生成配音"""
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-YunxiNeural",
        "--rate", "+10%",
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def create_video(work_dir, output_path):
    """用FFmpeg合成视频"""
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", str(work_dir / "frame_%05d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-vf", "fade=t=in:st=0:d=0.5,fade=t=out:st=28:d=0.5",
        str(output_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def add_audio(video_path, voice_path, output_path):
    """添加配音"""
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(voice_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        str(output_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def main():
    """主流程"""
    print("🎬 开始生成MVP视频")
    
    work_dir = OUTPUT_DIR / "video_mvp"
    work_dir.mkdir(exist_ok=True)
    
    # 定义画面
    slides = [
        {"text": "云南民宿的觉醒", "subtext": "从歇脚处到生活场", "duration": 5},
        {"text": "三个房东", "subtext": "三种活法", "duration": 4},
        {"text": "审美驱动型", "subtext": "四鸣精舍·十年江庐", "duration": 5},
        {"text": "流量捕获型", "subtext": "能聪康巴·一条龙服务", "duration": 5},
        {"text": "文化翻译型", "subtext": "林登·喜林苑", "duration": 5},
        {"text": "民宿不是卖房间", "subtext": "而是卖生活", "duration": 5},
    ]
    
    # 1. 生成画面
    print("🎨 生成画面...")
    generate_frames(work_dir, slides)
    
    # 2. 生成配音
    print("🎙️ 生成配音...")
    voice_text = "云南民宿的觉醒，从歇脚处到生活场。三个房东，三种活法。审美驱动型，四鸣精舍，十年江庐。流量捕获型，能聪康巴，一条龙服务。文化翻译型，林登，喜林苑。民宿不是卖房间，而是卖生活。"
    voice_path = work_dir / "voice.mp3"
    generate_voiceover(voice_text, voice_path)
    
    # 3. 合成视频
    print("🎞️ 合成视频...")
    temp_video = work_dir / "temp.mp4"
    create_video(work_dir, temp_video)
    
    # 4. 添加配音
    print("🎵 添加配音...")
    output_path = OUTPUT_DIR / "video_mvp_yunnan_homestay.mp4"
    add_audio(temp_video, voice_path, output_path)
    
    # 清理
    for f in work_dir.glob("frame_*.png"):
        f.unlink()
    temp_video.unlink()
    
    print(f"✅ 完成: {output_path}")
    
    # 信息
    import os
    size = os.path.getsize(output_path) / 1024 / 1024
    print(f"📁 大小: {size:.1f} MB")
    print(f"⏱️ 时长: {sum(s['duration'] for s in slides)} 秒")
    
    return output_path

if __name__ == "__main__":
    main()
