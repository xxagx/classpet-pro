#!/usr/bin/env python3
"""
微信公众号浏览器自动化抓取
使用 Playwright 模拟浏览器访问公众号历史页面
"""

import json
import re
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright 未安装，请先运行: pip install playwright && playwright install")

# 公众号配置
WECHAT_ACCOUNTS = {
    "hotel": [
        "酒店高参",
        "酒店评论",
        "酒管财经",
        "空间秘探",
        "嬉游",
    ],
    "business": [
        "刘润",
        "远川研究所",
        "笔记侠",
    ]
}

def fetch_wechat_sogou(account_name, max_articles=10):
    """
    通过搜狗微信搜索抓取公众号文章
    输入: 公众号名称
    输出: 文章列表
    """
    if not PLAYWRIGHT_AVAILABLE:
        return []
    
    articles = []
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        try:
            # 搜狗微信搜索
            search_url = f"https://weixin.sogou.com/weixin?type=2&query={account_name}"
            print(f"   🔍 搜索: {account_name}")
            
            page.goto(search_url, wait_until="networkidle", timeout=30000)
            
            # 等待文章列表加载
            page.wait_for_selector("ul.news-list li", timeout=10000)
            
            # 提取文章信息
            items = page.query_selector_all("ul.news-list li")[:max_articles]
            
            for item in items:
                try:
                    # 标题
                    title_elem = item.query_selector("h3 a")
                    if not title_elem:
                        continue
                    title = title_elem.inner_text().strip()
                    
                    # 链接
                    link = title_elem.get_attribute("href")
                    if link and link.startswith("/"):
                        link = f"https://weixin.sogou.com{link}"
                    
                    # 摘要
                    summary_elem = item.query_selector("p")
                    summary = summary_elem.inner_text().strip()[:200] if summary_elem else ""
                    
                    # 发布时间
                    time_elem = item.query_selector("span.s2")
                    pub_date = time_elem.inner_text().strip() if time_elem else ""
                    
                    articles.append({
                        "title": title,
                        "summary": summary,
                        "link": link,
                        "pubDate": pub_date,
                        "source": account_name
                    })
                    
                except Exception as e:
                    print(f"      ⚠️  解析单篇文章失败: {e}")
                    continue
            
            print(f"      ✅ 成功: {len(articles)}条")
            
        except Exception as e:
            print(f"      ❌ 失败: {e}")
        
        finally:
            browser.close()
    
    return articles

def fetch_all_wechat():
    """抓取所有配置的公众号"""
    results = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "type": "wechat_browser",
        "sources": []
    }
    
    total_items = 0
    
    for category, accounts in WECHAT_ACCOUNTS.items():
        for account in accounts:
            print(f"📡 抓取公众号: {account}...")
            articles = fetch_wechat_sogou(account, max_articles=10)
            
            results["sources"].append({
                "name": account,
                "category": category,
                "status": "success" if articles else "failed",
                "items": articles,
                "item_count": len(articles)
            })
            
            total_items += len(articles)
    
    results["summary"] = {
        "total_accounts": sum(len(acc) for acc in WECHAT_ACCOUNTS.values()),
        "total_items": total_items
    }
    
    # 保存结果
    output_dir = Path("/Users/yr/.openclaw/workspace/data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    filename = output_dir / f"wechat_feeds_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 公众号抓取完成: {total_items} 条内容")
    print(f"💾 已保存: {filename}")
    
    return results

def merge_with_rss(rss_file, wechat_file):
    """合并 RSS 和公众号数据"""
    with open(rss_file, 'r', encoding='utf-8') as f:
        rss_data = json.load(f)
    
    with open(wechat_file, 'r', encoding='utf-8') as f:
        wechat_data = json.load(f)
    
    # 合并源
    rss_data["sources"].extend(wechat_data["sources"])
    
    # 更新统计
    rss_data["summary"]["total_sources"] += len(wechat_data["sources"])
    rss_data["summary"]["success_sources"] += sum(1 for s in wechat_data["sources"] if s["status"] == "success")
    rss_data["summary"]["total_items"] += wechat_data["summary"]["total_items"]
    rss_data["summary"]["wechat_items"] = wechat_data["summary"]["total_items"]
    
    # 保存合并结果
    output_file = Path(rss_file).parent / f"merged_feeds_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(rss_data, f, ensure_ascii=False, indent=2)
    
    print(f"📦 合并完成: {output_file}")
    return rss_data

if __name__ == "__main__":
    print(f"{'='*50}")
    print("📡 微信公众号抓取 Agent 启动")
    print(f"{'='*50}")
    
    if not PLAYWRIGHT_AVAILABLE:
        print("\n❌ 请先安装 Playwright:")
        print("   pip install playwright")
        print("   playwright install chromium")
        exit(1)
    
    fetch_all_wechat()
