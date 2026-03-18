# RSSHub Vercel 部署指南

## 1. 准备工作

- GitHub 账号
- Vercel 账号（用 GitHub 登录）

## 2. 部署步骤

### Fork RSSHub 仓库

1. 访问 https://github.com/DIYgod/RSSHub
2. 点击右上角 "Fork" 按钮
3. 等待 Fork 完成

### Vercel 部署

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 导入你 Fork 的 RSSHub 仓库
4. 框架预设选 "Other"
5. 点击 "Deploy"

### 配置环境变量（可选）

在 Vercel Dashboard → Project Settings → Environment Variables 添加：

```
CACHE_TYPE = memory
```

## 3. 使用你的 RSSHub

部署完成后，Vercel 会给你一个域名：
```
https://rsshub-xxx.vercel.app
```

RSS 地址格式：
```
https://rsshub-xxx.vercel.app/wechat/official/公众号名称
```

## 4. 限制说明

- 免费版有函数执行时间限制（10秒/30秒）
- 公众号源可能因超时失败
- 建议配合本地浏览器自动化使用

## 5. 配合本地脚本

修改本地 RSS 配置，将公众号源指向本地抓取脚本：
```python
# 公众号走本地浏览器自动化
"wechat_hotel": [
    {"name": "酒店高参", "url": "http://localhost:5000/rss/酒店高参"},
]
```
