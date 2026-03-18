#!/usr/bin/env python3
"""
Chart Agent - 数据图表生成
任务：自动检测文章中的数据，生成数据图表
技术：Python + Matplotlib + 中文字体支持
"""

import json
import os
import re
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager

# 配置中文字体
CHINESE_FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
font_manager.fontManager.addfont(CHINESE_FONT)
plt.rcParams['font.family'] = 'Heiti TC'
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 图表样式配置
CHART_WIDTH = 900
CHART_HEIGHT = 600
DPI = 100

def extract_data_from_text(text: str) -> list:
    """从文本中提取数据点"""
    data_points = []
    
    # 模式1: 年份 + 数值
    year_pattern = r'(20\d{2})[年]?.*?([\d.]+)[万亿]?元'
    for match in re.finditer(year_pattern, text):
        year = match.group(1)
        value = float(match.group(2))
        unit = '亿' if '亿' in match.group(0) else '万' if '万' in match.group(0) else ''
        data_points.append({
            'type': 'year_value',
            'year': int(year),
            'value': value,
            'unit': unit,
            'context': match.group(0)
        })
    
    # 模式2: 增长率
    growth_pattern = r'(?:增长|下降|增幅|降幅).*?([\d.]+)%'
    for match in re.finditer(growth_pattern, text):
        value = float(match.group(1))
        data_points.append({
            'type': 'growth_rate',
            'value': value,
            'context': match.group(0)
        })
    
    # 模式3: 百分比
    percent_pattern = r'([\d.]+)%'
    for match in re.finditer(percent_pattern, text):
        value = float(match.group(1))
        if value <= 100:
            data_points.append({
                'type': 'percentage',
                'value': value,
                'context': match.group(0)
            })
    
    return data_points

def generate_line_chart(data: list, title: str, output_path: str) -> bool:
    """生成折线图"""
    try:
        year_data = [d for d in data if d['type'] == 'year_value']
        if len(year_data) < 2:
            return False
        
        year_data.sort(key=lambda x: x['year'])
        years = [d['year'] for d in year_data]
        values = [d['value'] for d in year_data]
        
        fig, ax = plt.subplots(figsize=(CHART_WIDTH/DPI, CHART_HEIGHT/DPI), dpi=DPI)
        
        # 绘制折线
        ax.plot(years, values, marker='o', linewidth=2.5, markersize=8, 
                color='#2E86AB', markerfacecolor='#A23B72')
        
        # 添加数据标签
        for year, value in zip(years, values):
            ax.annotate(f'{value}', (year, value), 
                       textcoords="offset points", xytext=(0,10), 
                       ha='center', fontsize=10, fontweight='bold')
        
        # 样式 - 使用中文
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.set_xlabel('年份', fontsize=12)
        unit = year_data[0].get('unit', '')
        ax.set_ylabel(f'数值 ({unit})', fontsize=12)
        ax.grid(True, alpha=0.3)
        
        # 设置刻度字体
        ax.tick_params(axis='both', labelsize=10)
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.tight_layout()
        plt.savefig(output_path, dpi=DPI, bbox_inches='tight', facecolor='white')
        plt.close()
        
        print(f"   ✅ 折线图已生成: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ 折线图生成失败: {e}")
        return False

def generate_bar_chart(data: list, title: str, output_path: str) -> bool:
    """生成柱状图"""
    try:
        pct_data = [d for d in data if d['type'] == 'percentage'][:5]
        if len(pct_data) < 2:
            return False
        
        labels = [f'项目{i+1}' for i in range(len(pct_data))]
        values = [d['value'] for d in pct_data]
        
        fig, ax = plt.subplots(figsize=(CHART_WIDTH/DPI, CHART_HEIGHT/DPI), dpi=DPI)
        
        colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E']
        bars = ax.bar(labels, values, color=colors[:len(labels)], edgecolor='white', linewidth=1.5)
        
        # 添加数值标签
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height}%',
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom', fontsize=11, fontweight='bold')
        
        # 样式 - 使用中文
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.set_ylabel('百分比 (%)', fontsize=12)
        ax.grid(True, alpha=0.3, axis='y')
        ax.tick_params(axis='both', labelsize=10)
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.tight_layout()
        plt.savefig(output_path, dpi=DPI, bbox_inches='tight', facecolor='white')
        plt.close()
        
        print(f"   ✅ 柱状图已生成: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ 柱状图生成失败: {e}")
        return False

def process_article(article_path: str, charts_dir: str) -> list:
    """处理单篇文章，生成图表"""
    results = []
    
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    data_points = extract_data_from_text(content)
    
    if not data_points:
        print("   ℹ️ 未检测到数据点")
        return results
    
    print(f"   检测到 {len(data_points)} 个数据点")
    
    # 生成折线图
    year_data = [d for d in data_points if d['type'] == 'year_value']
    if len(year_data) >= 2:
        chart_path = os.path.join(charts_dir, "chart_trend.png")
        if generate_line_chart(year_data, "市场趋势变化", chart_path):
            results.append({"type": "trend", "path": chart_path})
    
    # 生成柱状图
    pct_data = [d for d in data_points if d['type'] == 'percentage']
    if len(pct_data) >= 2:
        chart_path = os.path.join(charts_dir, "chart_comparison.png")
        if generate_bar_chart(pct_data, "数据对比分析", chart_path):
            results.append({"type": "comparison", "path": chart_path})
    
    return results

def batch_process(output_base_dir: str):
    """批量处理文章包"""
    results = []
    
    for i in range(1, 4):
        package_dir = os.path.join(output_base_dir, f"article_package_{i}")
        article_path = os.path.join(package_dir, "article.md")
        charts_dir = os.path.join(package_dir, "charts")
        
        print(f"\n📦 处理文章包 {i}...")
        
        if os.path.exists(article_path):
            charts = process_article(article_path, charts_dir)
            results.append({
                "package": f"article_package_{i}",
                "charts": charts
            })
        else:
            print(f"   ❌ 文章不存在: {article_path}")
    
    print(f"\n{'='*50}")
    print("📊 图表生成总结:")
    total_charts = sum(len(r["charts"]) for r in results)
    print(f"   总计生成: {total_charts} 张图表")
    for r in results:
        print(f"   {r['package']}: {len(r['charts'])} 张")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        batch_process(sys.argv[1])
    else:
        batch_process("/Users/yr/.openclaw/workspace/output")
