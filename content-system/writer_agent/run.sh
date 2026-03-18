#!/bin/bash
# Writer Agent Workflow
# 执行文章生成工作流

echo "=== Writer Agent Workflow ==="
echo "开始时间: $(date)"

# 检查输入文件
TOPICS_FILE="/Users/yr/.openclaw/workspace/data/selected_topics_$(date +%Y-%m-%d).json"

if [ ! -f "$TOPICS_FILE" ]; then
    echo "错误: 找不到选题文件 $TOPICS_FILE"
    echo "请先运行 Topic Agent"
    exit 1
fi

echo "选题文件: $TOPICS_FILE"

# 创建输出目录
mkdir -p /Users/yr/.openclaw/workspace/output/{article_package_1,article_package_2,article_package_3}/{images,charts,infographics}

# 运行文章生成
echo "正在生成文章..."
python3 /Users/yr/.openclaw/workspace/content-system/writer_agent/generate.py "$TOPICS_FILE" /Users/yr/.openclaw/workspace/output

# 检查结果
echo ""
echo "=== 生成结果 ==="
for i in 1 2 3; do
    PKG_DIR="/Users/yr/.openclaw/workspace/output/article_package_$i"
    if [ -f "$PKG_DIR/article.md" ]; then
        echo "✅ article_package_$i/article.md - 已生成"
        wc -c "$PKG_DIR/article.md" | awk '{print "   大小:", $1, "字节"}'
    else
        echo "❌ article_package_$i/article.md - 未生成"
    fi
done

echo ""
echo "完成时间: $(date)"
echo "=========================="
