#!/bin/bash
# Image Agent Workflow
# 执行图片生成工作流

echo "=== Image Agent Workflow ==="
echo "开始时间: $(date)"
echo ""

# 检查 Stable Diffusion 是否运行
echo "检查 Stable Diffusion API..."
if ! curl -s http://localhost:7860/sdapi/v1/samplers > /dev/null 2>&1; then
    echo "❌ 错误: Stable Diffusion API 未启动"
    echo "   请启动 SD WebUI 并添加 --api 参数"
    echo "   例如: ./webui.sh --api"
    exit 1
fi

echo "✅ Stable Diffusion API 正常"
echo ""

# 运行图片生成
echo "开始生成图片..."
python3 /Users/yr/.openclaw/workspace/content-system/image_agent/generate.py

echo ""
echo "=== 生成结果 ==="
for i in 1 2 3; do
    PKG_DIR="/Users/yr/.openclaw/workspace/output/article_package_$i"
    IMG_DIR="$PKG_DIR/images"
    
    echo "文章包 $i:"
    if [ -f "$IMG_DIR/cover.png" ]; then
        echo "  ✅ cover.png - 已生成"
    else
        echo "  ❌ cover.png - 未生成"
    fi
    
    for j in 1 2 3 4; do
        if [ -f "$IMG_DIR/img$j.png" ]; then
            echo "  ✅ img$j.png - 已生成"
        fi
    done
done

echo ""
echo "完成时间: $(date)"
echo "=========================="
