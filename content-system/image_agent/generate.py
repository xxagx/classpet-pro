# Image Agent v2 - Smart Image System
# 任务：智能获取/生成图片
# 策略：Pexels API 优先，SD 备用
# 输出：900px 宽度，适配微信公众号

import json
import os
import requests
import re
from datetime import datetime
from PIL import Image
from io import BytesIO
import base64

# Pexels API 配置
# 优先从环境变量读取，否则使用默认 Key
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "CvRplMQ8tYbLXqY4OTspo0UQ8yd9FLsOyCl6Nc3IqCgKChPwehTsA1BI")
PEXELS_API_URL = "https://api.pexels.com/v1/search"

# Stable Diffusion API 配置
SD_API_URL = "http://localhost:7860/sdapi/v1/txt2img"

# 图片尺寸配置
TARGET_WIDTH = 900  # 微信公众号最佳宽度
COVER_HEIGHT = 500  # 封面图高度
INLINE_HEIGHT = 600  # 段落配图高度

# 视觉风格预设（SD 备用）
SD_STYLE = "modern technology illustration, clean minimal design, futuristic style, blue white color scheme, professional business presentation, isometric 3D style, high quality"

def search_pexels(keyword: str, count: int = 5) -> list:
    """
    从 Pexels 搜索图片
    """
    if not PEXELS_API_KEY:
        print("   ⚠️ PEXELS_API_KEY 未设置，跳过 Pexels 搜索")
        return []
    
    try:
        headers = {"Authorization": PEXELS_API_KEY}
        params = {
            "query": keyword,
            "per_page": count,
            "orientation": "landscape"
        }
        
        response = requests.get(PEXELS_API_URL, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            photos = data.get("photos", [])
            
            results = []
            for photo in photos:
                results.append({
                    "id": photo["id"],
                    "url": photo["src"]["large"],  # 1024x768 或类似
                    "original_url": photo["src"]["original"],
                    "photographer": photo["photographer"],
                    "width": photo["width"],
                    "height": photo["height"]
                })
            
            print(f"   ✅ Pexels 找到 {len(results)} 张图片")
            return results
        else:
            print(f"   ❌ Pexels API 错误: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"   ❌ Pexels 请求失败: {e}")
        return []

def download_image(url: str, output_path: str) -> bool:
    """
    下载图片并调整尺寸
    """
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            # 打开图片
            img = Image.open(BytesIO(response.content))
            
            # 转换为 RGB（处理 PNG 透明通道）
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # 调整尺寸（保持比例，宽度 900px）
            ratio = TARGET_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((TARGET_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # 保存
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, "JPEG", quality=90)
            
            print(f"   ✅ 已下载并调整: {output_path} ({TARGET_WIDTH}x{new_height})")
            return True
        else:
            print(f"   ❌ 下载失败: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ 下载错误: {e}")
        return False

def generate_with_sd(prompt: str, output_path: str, height: int = 600) -> bool:
    """
    使用 Stable Diffusion 生成图片
    """
    try:
        full_prompt = f"{prompt}, {SD_STYLE}"
        
        payload = {
            "prompt": full_prompt,
            "negative_prompt": "blurry, low quality, distorted, ugly, bad anatomy, watermark, text",
            "width": TARGET_WIDTH,
            "height": height,
            "steps": 30,
            "cfg_scale": 7,
            "sampler_name": "DPM++ 2M Karras"
        }
        
        response = requests.post(SD_API_URL, json=payload, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                # 解码 base64
                image_data = base64.b64decode(result["images"][0])
                
                # 保存
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(image_data)
                
                print(f"   ✅ SD 生成: {output_path}")
                return True
        
        print(f"   ❌ SD 生成失败: {response.status_code}")
        return False
        
    except requests.exceptions.ConnectionError:
        print(f"   ❌ SD 未启动 (http://localhost:7860)")
        return False
    except Exception as e:
        print(f"   ❌ SD 错误: {e}")
        return False

def get_image(description: str, output_path: str, is_cover: bool = False) -> dict:
    """
    智能获取图片：Pexels 优先，SD 备用
    """
    height = COVER_HEIGHT if is_cover else INLINE_HEIGHT
    result = {
        "success": False,
        "source": None,
        "path": output_path,
        "description": description
    }
    
    print(f"🖼️  处理: {description[:40]}...")
    
    # 1. 尝试 Pexels
    print("   → 尝试 Pexels...")
    pexels_images = search_pexels(description, count=3)
    
    if pexels_images:
        # 尝试下载第一张合适的图片
        for img in pexels_images:
            if download_image(img["url"], output_path):
                result["success"] = True
                result["source"] = f"Pexels (ID: {img['id']}, by {img['photographer']})"
                return result
    
    # 2. Pexels 失败，尝试 SD
    print("   → Pexels 未找到，尝试 Stable Diffusion...")
    if generate_with_sd(description, output_path, height):
        result["success"] = True
        result["source"] = "Stable Diffusion (local)"
        return result
    
    # 3. 都失败
    print("   ❌ 所有来源都失败")
    return result

def extract_image_descriptions(article_path: str) -> list:
    """
    从文章中提取 [IMAGE: 描述] 标记
    """
    descriptions = []
    
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 查找所有 IMAGE 标记
    pattern = r'\[IMAGE:\s*([^\]]+)\]'
    matches = re.findall(pattern, content)
    
    for i, desc in enumerate(matches[:4], 1):
        descriptions.append({
            "id": f"img{i}",
            "description": desc.strip()
        })
    
    return descriptions

def process_article_package(package_dir: str, title: str) -> dict:
    """
    处理一个文章包，生成所有图片
    """
    article_path = os.path.join(package_dir, "article.md")
    images_dir = os.path.join(package_dir, "images")
    
    os.makedirs(images_dir, exist_ok=True)
    
    result = {
        "package": package_dir,
        "cover": None,
        "inline_images": [],
        "log": []
    }
    
    print(f"\n{'='*50}")
    print(f"📦 处理文章包: {os.path.basename(package_dir)}")
    print(f"   标题: {title[:40]}...")
    print(f"{'='*50}")
    
    # 1. 生成封面图
    print("\n🎯 生成封面图...")
    cover_path = os.path.join(images_dir, "cover.png")
    cover_result = get_image(title, cover_path, is_cover=True)
    
    if cover_result["success"]:
        result["cover"] = cover_result
        result["log"].append(f"封面: {cover_result['source']}")
    
    # 2. 提取并生成段落配图
    if os.path.exists(article_path):
        descriptions = extract_image_descriptions(article_path)
        
        if descriptions:
            print(f"\n📝 发现 {len(descriptions)} 个配图标记")
            
            for desc in descriptions:
                img_path = os.path.join(images_dir, f"{desc['id']}.png")
                img_result = get_image(desc["description"], img_path, is_cover=False)
                
                if img_result["success"]:
                    result["inline_images"].append(img_result)
                    result["log"].append(f"{desc['id']}: {img_result['source']}")
    
    # 输出日志
    print(f"\n📋 图片源记录:")
    for log in result["log"]:
        print(f"   • {log}")
    
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
    
    # 输出总结果
    print(f"\n{'='*50}")
    print("📊 总结果:")
    success_count = sum(1 for r in all_results if r["cover"] and r["cover"].get("success"))
    print(f"   封面图: {success_count}/3 成功")
    
    inline_count = sum(len(r["inline_images"]) for r in all_results)
    print(f"   段落配图: {inline_count} 张生成")
    print(f"{'='*50}")
    
    return all_results

if __name__ == "__main__":
    import sys
    
    # 检查 Pexels API Key
    if not PEXELS_API_KEY:
        print("⚠️  警告: PEXELS_API_KEY 环境变量未设置")
        print("   将只使用 Stable Diffusion 作为图片源")
        print("   设置方法: export PEXELS_API_KEY='your_api_key'")
        print("")
    
    if len(sys.argv) > 2:
        batch_process(sys.argv[1], sys.argv[2])
    else:
        today = datetime.now().strftime('%Y-%m-%d')
        batch_process(
            "/Users/yr/.openclaw/workspace/output",
            f"/Users/yr/.openclaw/workspace/data/selected_topics_{today}.json"
        )
