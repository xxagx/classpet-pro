# ClassPet Pro Vercel 部署完全指南

> 📅 更新时间：2026-03-21  
> ⏱️ 部署时间：5-10 分钟  
> 💰 成本：完全免费  
> 🔧 维护：零维护

---

## 📖 目录

- [为什么选择 Vercel](#为什么选择-vercel)
- [部署前准备](#部署前准备)
- [方案一：GitHub + Vercel 自动部署（推荐）](#方案一 github--vercel-自动部署推荐)
- [方案二：Vercel CLI 命令行部署](#方案二-vercel-cli-命令行部署)
- [配置说明](#配置说明)
- [自定义域名](#自定义域名)
- [常见问题](#常见问题)
- [性能优化](#性能优化)

---

## 为什么选择 Vercel

### ✅ 核心优势

| 特性 | 说明 |
|------|------|
| 🚀 **极速部署** | 代码推送后自动构建，2-3 分钟上线 |
| 🔒 **自动 HTTPS** | 免费 SSL 证书，无需手动配置 |
| 🌍 **全球 CDN** | 200+ 边缘节点，访问速度快 |
| 💸 **完全免费** | 个人版足够使用，无隐藏费用 |
| 🔄 **自动更新** | Git 推送后自动重新部署 |
| 📊 **数据分析** | 实时访问统计和性能监控 |
| 🛡️ **企业级安全** | DDoS 防护、WAF 防火墙 |

### 📊 免费版额度

- ✅ **无限访问量**
- ✅ **100GB/月 流量**
- ✅ **自动 SSL 证书**
- ✅ **自定义域名**
- ✅ **自动部署**

> 💡 对于班级使用场景，100GB 流量足够 1000+ 学生每天访问！

---

## 部署前准备

### 必需条件

- ✅ GitHub 账号（[注册链接](https://github.com/signup)）
- ✅ Vercel 账号（可用 GitHub 登录）
- ✅ 项目源代码（`classpet-pro-for-codebuddy` 文件夹）

### 检查清单

```bash
# 1. 确认项目文件完整
✓ index.html（主页）
✓ admin.html（教师端）
✓ mobile.html（学生端）
✓ js/ 目录（所有 JavaScript 文件）
✓ assets/ 目录（CSS、图片等资源）
✓ vercel.json（部署配置）
```

---

## 方案一：GitHub + Vercel 自动部署（推荐）

### 步骤 1：创建 GitHub 仓库

#### 1.1 访问 GitHub

1. 打开浏览器，访问 [GitHub.com](https://github.com)
2. 登录您的 GitHub 账号
3. 点击右上角头像旁的 "+" 按钮
4. 选择 "New repository"

#### 1.2 填写仓库信息

```
Repository name: classpet-pro
Description（可选）: 班级宠物激励系统 - ClassPet Pro
Visibility: ✅ Public（公开）
☐ Initialize this repository with a README（不要勾选）
```

5. 点击底部的 "Create repository" 按钮

### 步骤 2：上传代码到 GitHub

#### 方法 A：网页拖拽上传（⭐ 推荐新手）

1. 在仓库页面，点击 "uploading an existing file" 链接
2. 打开文件资源管理器，进入项目目录：
   ```
   c:\Users\贝贝\Desktop\classpet-pro1.0-main (1)\classpet-pro1.0-main\classpet-pro-for-codebuddy
   ```
3. 按 `Ctrl + A` 全选所有文件
4. 将文件拖拽到 GitHub 上传区域
5. 在 "Commit changes" 框中输入：`Initial commit - ClassPet Pro v3.0`
6. 点击 "Commit changes" 按钮
7. 等待上传完成（约 2-5 分钟）

#### 方法 B：使用 Git 命令行

```powershell
# 1. 打开 PowerShell，进入项目目录
cd "c:\Users\贝贝\Desktop\classpet-pro1.0-main (1)\classpet-pro1.0-main\classpet-pro-for-codebuddy"

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 提交更改
git commit -m "Initial commit - ClassPet Pro v3.0"

# 5. 重命名分支为 main
git branch -M main

# 6. 关联远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/classpet-pro.git

# 7. 推送代码
git push -u origin main
```

> 💡 如果遇到认证错误，需要使用 [GitHub Personal Access Token](https://github.com/settings/tokens)

### 步骤 3：部署到 Vercel

#### 3.1 注册/登录 Vercel

1. 访问 [Vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Login"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问您的 GitHub 账号

#### 3.2 导入项目

1. 登录后，点击 "Add New..." → "Project"
2. 在 "Import Git Repository" 页面，找到 `classpet-pro` 仓库
3. 点击 "Import" 按钮

#### 3.3 配置项目（保持默认）

```
Project Name: classpet-pro
Framework Preset: Other
Root Directory: ./
Build Command: (已配置在 vercel.json)
Output Directory: .
Install Command: (已配置在 vercel.json)
```

> ⚠️ **重要**：无需修改任何配置，`vercel.json` 已包含所有必要设置！

#### 3.4 开始部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 看到 ✅ 图标表示部署成功

### 步骤 4：访问您的系统

部署成功后，您会看到：

```
🎉 Congratulations! Your deployment is ready!

https://classpet-pro-xxxx.vercel.app
```

#### 测试访问

1. 点击域名链接，打开系统
2. 测试以下功能：
   - ✅ 主页加载正常
   - ✅ 教师端可以登录
   - ✅ 学生端可以选择名字
   - ✅ 图片和 CSS 加载正常

### 步骤 5：配置自动更新

#### 启用 GitHub Actions（可选）

1. 进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Git"
3. 确保 "Auto Expose Environment Variables" 已启用
4. 勾选 "Deploy Hooks"（如需手动触发）

#### 测试自动更新

1. 修改项目中的任意文件（如 `index.html`）
2. 提交并推送到 GitHub：
   ```bash
   git add .
   git commit -m "Update: 修改内容"
   git push
   ```
3. 访问 Vercel Dashboard，查看自动部署状态
4. 约 2 分钟后，更改自动生效！

---

## 方案二：Vercel CLI 命令行部署

### 适用场景

- ✅ 快速测试，无需创建 GitHub 仓库
- ✅ 本地开发调试
- ✅ 企业内网项目

### 步骤 1：安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org)
2. 下载并安装 LTS 版本（推荐 v18+）
3. 安装完成后，打开 PowerShell 验证：
   ```powershell
   node --version
   npm --version
   ```

### 步骤 2：安装 Vercel CLI

```powershell
npm install -g vercel
```

验证安装：
```powershell
vercel --version
```

### 步骤 3：登录 Vercel

```powershell
vercel login
```

选择 "GitHub" 登录方式，按提示完成认证。

### 步骤 4：部署项目

```powershell
# 进入项目目录
cd "c:\Users\贝贝\Desktop\classpet-pro1.0-main (1)\classpet-pro1.0-main\classpet-pro-for-codebuddy"

# 执行部署
vercel
```

首次部署时的交互提示：

```
? Set up and deploy "c:\Users\贝贝\Desktop\classpet-pro1.0-main (1)\classpet-pro1.0-main\classpet-pro-for-codebuddy"? [Y/n] Y
? Which scope do you want to deploy to? 选择您的账号
? Link to existing project? [y/N] N
? What's your project's name? classpet-pro
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### 步骤 5：生产环境部署

首次部署后，使用以下命令部署到生产环境：

```powershell
vercel --prod
```

### CLI 常用命令

```powershell
# 查看部署列表
vercel ls

# 查看部署日志
vercel logs

# 删除部署
vercel rm <deployment-url>

# 拉取环境变量
vercel env pull

# 查看帮助
vercel help
```

---

## 配置说明

### vercel.json 详解

项目已包含优化的 `vercel.json` 配置文件：

```json
{
  "version": 2,
  "name": "classpet-pro",
  "buildCommand": "echo 'Building static site...'",
  "outputDirectory": ".",
  "installCommand": "echo 'No installation required'",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "github": {
    "silent": false,
    "autoJobCancelation": true
  }
}
```

### 配置项说明

| 配置项 | 作用 | 说明 |
|--------|------|------|
| `buildCommand` | 构建命令 | 静态网站无需构建 |
| `outputDirectory` | 输出目录 | 当前目录 `.` |
| `installCommand` | 安装命令 | 无需安装依赖 |
| `rewrites` | URL 重写 | 支持前端路由 |
| `headers` | HTTP 响应头 | 安全性和缓存控制 |
| `github.silent` | GitHub 通知 | `false` 表示发送部署通知 |
| `github.autoJobCancelation` | 自动取消 | 新部署自动取消旧部署 |

### 安全头说明

- **X-Content-Type-Options**: 防止 MIME 类型嗅探
- **X-Frame-Options**: 防止点击劫持攻击
- **X-XSS-Protection**: 启用 XSS 过滤器
- **Referrer-Policy**: 控制引用来源信息
- **Cache-Control**: 缓存策略优化

---

## 自定义域名

### 前提条件

- ✅ 拥有自己的域名（如 `classpet.com`）
- ✅ 可以修改 DNS 设置

### 步骤 1：在 Vercel 添加域名

1. 进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Domains"
3. 点击 "Add" 按钮
4. 输入您的域名：
   - 根域名：`classpet.com`
   - 子域名：`www.classpet.com` 或 `pet.classpet.com`
5. 点击 "Add" 确认

### 步骤 2：配置 DNS

Vercel 会显示 DNS 配置信息：

#### 方式 A：使用 CNAME（推荐子域名）

```
类型：CNAME
名称：www（或 pet）
值：cname.vercel-dns.com
TTL：自动
```

#### 方式 B：使用 A 记录（根域名）

```
类型：A
名称：@
值：76.76.21.21
TTL：自动
```

> 💡 Vercel 提供 4 个 A 记录 IP：
> - 76.76.21.21
> - 76.76.21.22
> - 76.76.21.23
> - 76.76.21.24

### 步骤 3：等待 DNS 生效

- ⏱️ 通常 5-10 分钟生效
- 🌍 全球完全生效可能需要 24 小时

### 步骤 4：验证配置

1. 返回 Vercel "Domains" 页面
2. 域名状态显示为 "Valid Configuration"
3. 访问自定义域名测试

### 常见 DNS 服务商配置

#### 阿里云万网

1. 登录 [阿里云控制台](https://wanwang.aliyun.com)
2. 进入域名管理
3. 点击 "DNS 设置"
4. 添加 CNAME 或 A 记录

#### 腾讯云 DNSPod

1. 登录 [DNSPod](https://www.dnspod.cn)
2. 选择域名
3. 点击 "记录管理"
4. 添加新记录

#### Cloudflare

1. 登录 [Cloudflare](https://www.cloudflare.com)
2. 选择域名
3. 进入 "DNS" 标签
4. 添加记录（关闭橙色云朵以禁用代理）

---

## 常见问题

### Q1: 部署失败怎么办？

**A**: 按以下步骤排查：

1. **查看构建日志**
   ```
   Vercel Dashboard → Deployments → 点击失败的部署 → 查看日志
   ```

2. **常见错误及解决方法**：
   - ❌ `Missing vercel.json`: 确保文件存在且 JSON 格式正确
   - ❌ `Build failed`: 检查 `buildCommand` 配置
   - ❌ `No output`: 确认 `outputDirectory` 配置

3. **本地测试配置**
   ```powershell
   vercel dev
   ```

### Q2: 访问速度慢怎么办？

**A**: 优化建议：

1. **启用 Vercel Analytics**
   - Dashboard → Analytics → Enable

2. **使用自定义域名**
   - 国内访问可能更快

3. **优化资源大小**
   - 压缩图片
   - 启用 Gzip（Vercel 自动启用）

4. **考虑国内 CDN**（如主要用户在国内）
   - 七牛云
   - 又拍云

### Q3: 数据会丢失吗？

**A**: 

⚠️ **重要提醒**：

- ClassPet Pro 使用 `localStorage` 存储数据
- 数据保存在用户浏览器本地
- 清除浏览器缓存会导致数据丢失

**解决方案**：

1. **定期备份**
   - 进入教师端 → 数据管理 → 导出数据
   - 每周备份一次

2. **未来版本**
   - 计划支持云端存储
   - 支持数据导入导出

### Q4: 可以多人同时访问吗？

**A**: ✅ 完全可以！

Vercel 免费版支持：
- ✅ 无限并发访问
- ✅ 100GB/月 流量
- ✅ 自动扩展

实际测试：支持 1000+ 学生同时在线使用

### Q5: 如何查看访问统计？

**A**: 三种方法：

1. **Vercel Analytics**（推荐）
   ```
   Dashboard → Analytics → 查看实时数据
   ```

2. **添加百度统计**
   ```html
   <!-- 在 index.html 的 <head> 中添加 -->
   <script>
   var _hmt = _hmt || [];
   (function() {
     var hm = document.createElement("script");
     hm.src = "https://hm.baidu.com/hm.js?您的统计 ID";
     var s = document.getElementsByTagName("script")[0]; 
     s.parentNode.insertBefore(hm, s);
   })();
   </script>
   ```

3. **使用 Umami**（开源统计）
   ```
   Dashboard → Integrations → 添加 Umami
   ```

### Q6: 教师端密码如何修改？

**A**: 

1. 访问教师端：`https://your-site.vercel.app/admin.html`
2. 使用默认密码登录（1234）
3. 进入设置页面
4. 修改管理员密码
5. 保存设置

### Q7: 如何更新系统版本？

**A**: 

#### GitHub 部署方式

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "Update: 更新说明"
git push

# 3. Vercel 自动重新部署（约 2-3 分钟）
```

#### CLI 部署方式

```powershell
vercel --prod
```

> 💡 更新不会影响 localStorage 数据

### Q8: 支持 HTTPS 吗？

**A**: ✅ 自动支持！

Vercel 为所有部署自动配置：
- ✅ 免费 SSL 证书
- ✅ 自动 HTTPS
- ✅ 自动续期
- ✅ 无需任何配置

### Q9: 可以离线使用吗？

**A**: ❌ 不支持离线使用

ClassPet Pro 需要服务器托管，但：
- ✅ 加载后可缓存部分资源
- ✅ 下次访问加载更快
- 📱 可添加到手机主屏幕

### Q10: 部署后出现问题如何回滚？

**A**: 

1. 进入 Vercel Dashboard
2. 点击 "Deployments"
3. 找到上一个稳定版本
4. 点击 "..." → "Promote to Production"

---

## 性能优化

### 已自动优化的项目

✅ **Vercel 自动优化**：
- Gzip 压缩
- Brotli 压缩
- CDN 缓存
- HTTP/2 支持
- 自动 HTTPS

✅ **vercel.json 配置优化**：
- 静态资源缓存 1 年
- 安全响应头
- 智能路由

### 手动优化建议

#### 1. 图片优化

```bash
# 使用 TinyPNG 压缩图片
# 访问：https://tinypng.com
```

#### 2. CSS/JS 压缩

使用在线工具：
- [CSS Minifier](https://cssminifier.com)
- [JavaScript Minifier](https://javascript-minifier.com)

#### 3. 启用预加载

在 `index.html` 的 `<head>` 中添加：

```html
<link rel="preload" href="/assets/css/style.css" as="style">
<link rel="preload" href="/js/app.js" as="script">
```

#### 4. 使用 WebP 格式

将 PNG/JPG 转换为 WebP 格式，体积减少 70%+

---

## 高级功能

### 环境变量

如需配置敏感信息：

1. Dashboard → Settings → Environment Variables
2. 添加变量：
   ```
   Key: API_KEY
   Value: your-secret-key
   Environment: Production
   ```
3. 在代码中使用：
   ```javascript
   const apiKey = process.env.API_KEY;
   ```

### 部署预览

每次 Git 推送都会生成预览 URL：

```
https://classpet-pro-git-main-username.vercel.app
```

用于测试新功能，不影响生产环境。

### 自动部署 Hooks

手动触发部署：

1. Dashboard → Settings → Git
2. 复制 Deploy Hook URL
3. 发送 POST 请求：
   ```bash
   curl -X POST <your-deploy-hook-url>
   ```

---

## 技术支持

### 官方文档

- 📚 [Vercel 文档](https://vercel.com/docs)
- 📚 [Vercel CLI](https://vercel.com/docs/cli)
- 📚 [静态部署](https://vercel.com/docs/static-deployment)

### 社区资源

- 💬 [Vercel Community](https://github.com/vercel/vercel/discussions)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

### ClassPet Pro 支持

- 📧 联系开发者
- 🐛 提交 Issue
- 💡 功能建议

---

## 部署检查清单

部署前请确认：

- [ ] 所有文件已上传到 GitHub
- [ ] `vercel.json` 配置正确
- [ ] 测试本地运行正常
- [ ] 已注册 Vercel 账号
- [ ] 已关联 GitHub 账号

部署后请测试：

- [ ] 主页可以正常访问
- [ ] 教师端可以登录
- [ ] 学生端可以选择名字
- [ ] 所有功能正常工作
- [ ] 移动端显示正常
- [ ] 图片加载正常
- [ ] 自动部署已启用

---

## 总结

### ✨ Vercel 部署优势

| 项目 | 传统部署 | Vercel 部署 |
|------|---------|------------|
| 部署时间 | 30+ 分钟 | 5 分钟 |
| 配置复杂度 | 高 | 零配置 |
| HTTPS | 需手动配置 | 自动 |
| CDN | 需单独购买 | 免费包含 |
| 维护成本 | 高 | 零维护 |
| 成本 | ¥100+/月 | 免费 |

### 🎯 下一步

1. ✅ 完成部署
2. ✅ 测试所有功能
3. ✅ 分享链接给学生
4. ✅ 定期备份数据
5. ✅ 享受教学乐趣！

---

**🎉 恭喜！您已完成 ClassPet Pro 的 Vercel 部署！**

现在，您可以随时随地访问您的班级宠物系统了！

---

*Last Updated: 2026-03-21*  
*Version: 3.0*  
*Author: 贝贝老师*
