#!/usr/bin/env python3
"""
视频自动生成脚本 v6 - FFmpeg 动画版
用 FFmpeg 滤镜做真正的动画效果
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import tempfile

# 配置
WORKSPACE = Path("/Users/yr/.openclaw/workspace")
OUTPUT_DIR = WORKSPACE / "output"
VENV_PYTHON = Path.home() / ".openclaw/venv/bin/python"

def generate_voiceover(text, output_path):
    """生成配音 - 活泼男声"""
    cmd = [
        str(VENV_PYTHON), "-m", "edge_tts",
        "--text", text,
        "--write-media", str(output_path),
        "--voice", "zh-CN-YunxiNeural",
        "--rate", "+15%",
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"✅ 配音生成: {output_path}")

def create_animated_slides(work_dir):
    """
    创建带动画的视频片段
    使用 FFmpeg 的 filter_complex 做动画
    """
    
    # 定义画面内容
    slides = [
        {"text": "春糖酒店价格策略", "sub": "从躺赚到精算的生死转型", "dur": 5},
        {"text": "入住天数暴跌", "sub": "1.9晚 → 1.3晚", "dur": 4},
        {"text": "投诉率翻倍", "sub": "8% → 15%", "dur": 4},
        {"text": "高端酒店解法", "sub": "打包服务 · ADR+35%", "dur": 4},
        {"text": "中端酒店解法", "sub": "私域拼团 · 入住率95%", "dur": 4},
        {"text": "经济型酒店解法", "sub": "时间切片 · RevPAR+25%", "dur": 4},
        {"text": "今天就能做", "sub": "查数据 → 设上限 → 建标签", "dur": 4},
        {"text": "私信领取", "sub": "《展会收益决策检查清单》", "dur": 5},
    ]
    
    # 为每个画面生成视频片段
    segments = []
    
    for i, slide in enumerate(slides):
        segment_path = work_dir / f"segment_{i:02d}.mp4"
        
        # 使用 FFmpeg drawtext 滤镜生成文字动画
        # 效果：文字从下方滑入 + 淡入
        
        # 主文字 - 从下方滑入
        main_text = slide["text"].replace("'", "\\'")
        sub_text = slide["sub"].replace("'", "\\'")
        
        filter_complex = f"""
        color=c=#1a1d29:s=1080x1920:d={slide['dur']},
        
        # 主标题 - 从下方滑入
        drawtext=fontfile=/System/Library/Fonts/PingFang.ttc:
        text='{main_text}':
        fontsize=72:fontcolor=white:
        x=(w-text_w)/2:
        y=(h-text_h)/2-50+t*30:
        alpha='if(lt(t,0.3),t/0.3,if(gt(t,{slide['dur']-0.3}),({slide['dur']}-t)/0.3,1))',
        
        # 副标题 - 延迟淡入
        drawtext=fontfile=/System/Library/Fonts/PingFang.ttc:
        text='{sub_text}':
        fontsize=44:fontcolor=#aaaaaa:
        x=(w-text_w)/2:
        y=(h-text_h)/2+60:
        alpha='if(lt(t,0.6),0,if(lt(t,1.0),(t-0.6)/0.4,if(gt(t,{slide['dur']-0.3}),({slide['dur']}-t)/0.3,1)))'
        """
        
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", filter_complex.strip().replace('\n', ''),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-r", "30",
            "-t", str(slide['dur']),
            str(segment_path)
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            segments.append(segment_path)
            print(f"✅ 片段 {i+1}/{len(slides)}: {slide['text'][:10]}...")
        except subprocess.CalledProcessError as e:
            print(f"❌ 片段 {i+1} 失败: {e}")
            # 备用方案：生成静态图
            create_static_slide(slide, segment_path)
            segments.append(segment_path)
    
    return segments

def create_static_slide(slide, output_path):
    """备用：生成静态画面"""
    from PIL import Image, ImageDraw, ImageFont
    
    W, H = 1080, 1920
    img = Image.new('RGB', (W, H), (26, 29, 41))
    draw = ImageDraw.Draw(img)
    
    try:
        font1 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 72)
        font2 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 44)
    except:
        font1 = font2 = ImageFont.load_default()
    
    # 主文字
    bbox = draw.textbbox((0, 0), slide["text"], font=font1)
    x = (W - (bbox[2] - bbox[0])) // 2
    draw.text((x, H//2 - 80), slide["text"], font=font1, fill=(255, 255, 255))
    
    # 副文字
    bbox = draw.textbbox((0, 0), slide["sub"], font=font2)
    x = (W - (bbox[2] - bbox[0])) // 2
    draw.text((x, H//2 + 40), slide["sub"], font=font2, fill=(170, 170, 170))
    
    # 保存为临时图片
    temp_img = output_path.with_suffix('.png')
    img.save(temp_img)
    
    # 转成视频
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", str(temp_img),
        "-c:v", "libx264",
        "-t", str(slide["dur"]),
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    temp_img.unlink()

def concat_segments(segments, output_path):
    """合并视频片段"""
    # 创建 concat 列表文件
    list_file = segments[0].parent / "concat_list.txt"
    with open(list_file, 'w') as f:
        for seg in segments:
            f.write(f"file '{seg}'\n")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(output_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    list_file.unlink()
    
    return output_path

def add_audio(video_path, audio_path, output_path):
    """添加配音"""
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(audio_path),
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
    
    print(f"🎬 开始生成视频 v6 (FFmpeg动画): {topic}")
    
    work_dir = OUTPUT_DIR / f"video_{topic}_v6"
    work_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. 生成配音
    voiceover_text = "春糖酒店价格策略，从躺赚到精算的生死转型。糖酒会期间，酒店平均入住天数从1.9晚暴跌到1.3晚。投诉率从8%暴涨到15%，复购几乎归零。高端酒店打包服务，ADR提升35%；中端酒店私域拼团，入住率95%；经济型酒店时间切片，RevPAR提升25%。今天就能做：查数据，设上限，建标签。私信领取展会收益决策检查清单。"
    
    voiceover_path = work_dir / "voiceover.mp3"
    generate_voiceover(voiceover_text, voiceover_path)
    
    # 2. 生成动画片段
    print("🎨 生成动画画面...")
    segments = create_animated_slides(work_dir)
    
    # 3. 合并片段
    print("🎞️ 合并视频片段...")
    temp_video = work_dir / "temp_video.mp4"
    concat_segments(segments, temp_video)
    
    # 4. 添加配音
    print("🎵 添加配音...")
    output_path = OUTPUT_DIR / f"video_{date_str}_{topic}_v6.mp4"
    add_audio(temp_video, voiceover_path, output_path)
    
    # 清理
    temp_video.unlink()
    for seg in segments:
        seg.unlink()
    
    print(f"✅ 视频生成完成: {output_path}")
    
    # 信息
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
