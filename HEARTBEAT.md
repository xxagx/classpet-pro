# HEARTBEAT.md - 每日热点自动化工作流

## 触发时间
每天晚上 21:00（Asia/Shanghai）

## 执行清单

### 1. RSS 热点抓取
- [ ] 抓取 30 个 RSS 源（酒店/OTA/商业/管理/新闻）
- [ ] 保存原始数据到 `data/raw_feeds_{date}.json`
- [ ] 预估：120-300 条信息

### 2. AI 筛选选题
- [ ] 读取昨日 raw_feeds
- [ ] 按标准筛选 TOP 10 选题（时效性/冲突性/实操性/数据支撑/差异化）
- [ ] 输出 `data/selected_topics_{date}.json`
- [ ] 生成一句话趋势总结

### 3. 内容生产
- [ ] 生成 3 篇公众号文章 → `content/{date}_article_1/2/3.md`
- [ ] 生成 1 份视频号脚本 → `content/{date}_video_script.md`
- [ ] 生成 Seedance 画面 Prompt → `content/{date}_visual_prompts.md`
- [ ] 生成 5 组标题选项 → `content/{date}_title_options.md`
- [ ] 生成封面文案 → `content/{date}_cover_copy.md`

### 4. 飞书推送
- [ ] 组装推送消息（热点摘要 + TOP 3 选题 + 交付物清单）
- [ ] 发送到飞书（需要配置 webhook_url）

### 5. 记忆更新
- [ ] 更新 `memory/{date}.md` 记录今日产出

---

## 前置依赖检查

执行前确认：
- [ ] Firecrawl API Key 已配置（用于抓公众号等无 RSS 源）
- [ ] 飞书 Webhook URL 已配置
- [ ] RSS 源列表可正常访问

---

## 异常处理

| 场景 | 处理方式 |
|:---|:---|
| RSS 源失效 | 跳过该源，记录到日志，通知上位 |
| 抓取数量过少(<50条) | 扩大时间窗口重试，或通知上位 |
| AI 筛选质量差 | 放宽筛选条件，增加人工审核标记 |
| 飞书推送失败 | 本地保存，下次心跳时重试 |

---

## 手动触发命令

如需手动执行：
```
/run rss_workflow
```

---

*配置完成时间：2026-03-06*
*版本：v1.0*
