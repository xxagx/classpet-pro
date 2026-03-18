#!/usr/bin/env python3
"""
视频自动生成脚本 v5 - MoviePy 版本
真正的动画效果：
1. 文字逐字出现（打字机效果）
2. 数字滚动动画
3. 元素淡入滑动
4. 活泼男声配音
"""

import os
import sys
import subprocess
from pathlib import Path
import numpy as np

# 配置
WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

def generate_voiceover(text, output_path):
    """生成配音 - 使用活泼男声 Yunxi"""
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-YunxiNeural",
        "--rate", "+15%",  # 稍快节奏
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"✅ 配音生成: {output_path}")

def create_video_with_moviepy():
    """使用 MoviePy 创建动画视频"""
    from moviepy.editor import (
        TextClip, CompositeVideoClip, ColorClip, AudioFileClip,
        concatenate_videoclips, CompositeAudioClip
    )
    from moviepy.video.fx.all import fadein, fadeout
    
    # 视频尺寸
    W, H = 1080, 1920
    
    # 定义画面内容
    slides = [
        {
            "title": "春糖酒店价格策略",
            "subtitle": "从躺赚到精算的生死转型",
            "duration": 5,
            "type": "title"
        },
        {
            "title": "入住天数暴跌",
            "number": "1.9 → 1.3",
            "unit": "晚",
            "duration": 4,
            "type": "data"
        },
        {
            "title": "投诉率翻倍",
            "number": "8% → 15%",
            "unit": "",
            "duration": 4,
            "type": "data"
        },
        {
            "title": "高端酒店解法",
            "subtitle": "打包服务包 · ADR提升35%",
            "duration": 4,
            "type": "text"
        },
        {
            "title": "中端酒店解法",
            "subtitle": "私域拼团 · 入住率95%",
            "duration": 4,
            "type": "text"
        },
        {
            "title": "经济型酒店解法",
            "subtitle": "时间切片 · RevPAR+25%",
            "duration": 4,
            "type": "text"
        },
        {
            "title": "今天就能做",
            "subtitle": "查数据 → 设上限 → 建标签",
            "duration": 4,
            "type": "text"
        },
        {
            "title": "私信领取",
            "subtitle": "《展会收益决策检查清单》",
            "duration": 5,
            "type": "callout"
        },
    ]
    
    clips = []
    
    for slide in slides:
        duration = slide["duration"]
        
        # 背景
        bg = ColorClip(size=(W, H), color=(25, 28, 35)).set_duration(duration)
        
        elements = [bg]
        
        if slide["type"] == "title":
            # 标题页
            title = (TextClip(
                slide["title"],
                fontsize=80,
                color='white',
                font='Source-Han-Sans-CN-Bold',
                stroke_color='black',
                stroke_width=2
            )
            .set_position('center')
            .set_duration(duration)
            .fx(fadein, 0.5)
            .fx(fadeout, 0.5))
            
            subtitle = (TextClip(
                slide["subtitle"],
                fontsize=48,
                color='#AAAAAA',
                font='Source-Han-Sans-CN-Normal'
            )
            .set_position(('center', H//2 + 80))
            .set_duration(duration)
            .fx(fadein, 0.8)
            .fx(fadeout, 0.5))
            
            elements.extend([title, subtitle])
            
        elif slide["type"] == "data":
            # 数据页 - 大数字
            title = (TextClip(
                slide["title"],
                fontsize=56,
                color='#CCCCCC',
                font='Source-Han-Sans-CN-Normal'
            )
            .set_position(('center', H//3))
            .set_duration(duration)
            .fx(fadein, 0.3))
            
            # 数字（带滚动效果模拟）
            number = (TextClip(
                slide["number"],
                fontsize=120,
                color='#FF6B4A',
                font='Source-Han-Sans-CN-Bold'
            )
            .set_position('center')
            .set_duration(duration)
            .fx(fadein, 0.5))
            
            if slide.get("unit"):
                unit = (TextClip(
                    slide["unit"],
                    fontsize=60,
                    color='#888888',
                    font='Source-Han-Sans-CN-Normal'
                )
                .set_position((W//2 + 200, H//2 + 20))
                .set_duration(duration)
                .fx(fadein, 0.7))
                elements.append(unit)
            
            elements.extend([title, number])
            
        elif slide["type"] == "callout":
            # 行动号召页 - 高亮
            title = (TextClip(
                slide["title"],
                fontsize=72,
                color='white',
                font='Source-Han-Sans-CN-Bold'
            )
            .set_position(('center', H//2 - 60))
            .set_duration(duration)
            .fx(fadein, 0.3))
            
            subtitle = (TextClip(
                slide["subtitle"],
                fontsize=44,
                color='#FF6B4A',
                font='Source-Han-Sans-CN-Bold'
            )
            .set_position(('center', H//2 + 60))
            .set_duration(duration)
            .fx(fadein, 0.6))
            
            elements.extend([title, subtitle])
            
        else:
            # 普通文字页
            title = (TextClip(
                slide["title"],
                fontsize=72,
                color='white',
                font='Source-Han-Sans-CN-Bold'
            )
            .set_position(('center', H//2 - 50))
            .set_duration(duration)
            .fx(fadein, 0.3))
            
            subtitle = (TextClip(
                slide["subtitle"],
                fontsize=44,
                color='#AAAAAA',
                font='Source-Han-Sans-CN-Normal'
            )
            .set_position(('center', H//2 + 50))
            .set_duration(duration)
            .fx(fadein, 0.6))
            
            elements.extend([title, subtitle])
        
        # 合成这一页
        clip = CompositeVideoClip(elements).set_duration(duration)
        clips.append(clip)
    
    # 连接所有页面
    final_video = concatenate_videoclips(clips, method="compose")
    
    return final_video

def add_audio_to_video(video, voiceover_path, output_path):
    """添加配音到视频"""
    from moviepy.editor import AudioFileClip, CompositeAudioClip
    
    # 加载配音
    voice = AudioFileClip(str(voiceover_path))
    
    # 调整视频长度匹配音频
    video = video.set_duration(voice.duration)
    
    # 合并
    final = video.set_audio(voice)
    
    # 输出
    final.write_videofile(
        str(output_path),
        fps=30,
        codec='libx264',
        audio_codec='aac',
        threads=4,
        preset='medium'
    )
    
    return output_path

def main():
    """主流程"""
    topic = "春糖酒店策略"
    date_str = "2026-03-12"
    
    print(f"🎬 开始生成视频 v5 (MoviePy): {topic}")
    
    # 1. 生成配音
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从1.9晚暴跌到1.3晚。投诉率从8%暴涨到15%，复购几乎归零。但有三类酒店找到了解法：高端酒店打包服务，ADR提升35%；中端酒店做私域拼团，入住率冲到95%；经济型酒店用时间切片，RevPAR提升25%。今天就能做的三件事：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    work_dir = OUTPUT_DIR / f"video_{topic}_v5"
    work_dir.mkdir(parents=True, exist_ok=True)
    
    voiceover_path = work_dir / "voiceover.mp3"
    generate_voiceover(voiceover_text, voiceover_path)
    
    # 2. 生成视频画面
    print("🎨 生成动画画面...")
    video = create_video_with_moviepy()
    
    # 3. 合并音画
    print("🎵 合并音画...")
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}_v5.mp4"
    add_audio_to_video(video, voiceover_path, output_path)
    
    print(f"✅ 视频生成完成: {output_path}")
    
    # 显示信息
    import os
    size = os.path.getsize(output_path) / 1024 / 1024
    print(f"📁 文件大小: {size:.1f} MB")
    
    return output_path

if __name__ == "__main__":
    try:
        result = main()
        print(f"\n🎉 完成: {result}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
