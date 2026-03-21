# ClassPet Pro 部署指南

让任何人都能随时随地访问您的 ClassPet Pro 系统！

---

## 🚀 快速部署方案

### 方案一：Vercel 一键部署（⭐⭐⭐⭐⭐ 强烈推荐）

**特点**：完全免费、5 分钟上线、自动 HTTPS、全球 CDN 加速

#### 部署步骤

##### 1. 上传代码到 GitHub

1. 访问 [GitHub.com](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `classpet-pro`
   - 选择 "Public"
   - 点击 "Create repository"

4. 上传代码（两种方式任选其一）：

   **方式 A: 网页上传（推荐新手）**
   ```
   - 点击 "uploading an existing file"
   - 将 classpet-pro-for-codebuddy 文件夹所有文件拖入
   - 点击 "Commit changes"
   ```

   **方式 B: Git 命令上传**
   ```bash
   cd "c:\Users\贝贝\Desktop\classpet-pro1.0-main (1)\classpet-pro1.0-main\classpet-pro-for-codebuddy"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/classpet-pro.git
   git push -u origin main
   ```

##### 2. 部署到 Vercel

1. 访问 [Vercel.com](https://vercel.com)
2. 点击 "Sign Up" 并用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择 "Import Git Repository"
5. 找到刚才创建的 `classpet-pro` 仓库
6. 点击 "Import"
7. 保持默认设置，直接点击 "Deploy"
8. 等待 1-2 分钟，部署完成！

##### 3. 访问您的系统

部署成功后，您会获得一个免费域名：
```
https://classpet-pro-xxx.vercel.app
```

任何人都可以通过这个链接访问您的系统！

---

### 方案二：Netlify 部署（备选方案）

**特点**：同样免费、拖拽上传、无需 Git

#### 部署步骤

1. 访问 [Netlify.com](https://netlify.com)
2. 注册账号（可用 GitHub 登录）
3. 点击 "Add new site" → "Deploy manually"
4. 将整个 `classpet-pro-for-codebuddy` 文件夹拖入上传区域
5. 等待上传完成（约 1 分钟）
6. 获得免费域名：`https://xxx-xxx-xxx.netlify.app`

---

### 方案三：GitHub Pages（完全免费）

**特点**：GitHub 原生、简单方便

#### 部署步骤

1. 确保代码已上传到 GitHub
2. 进入仓库页面
3. 点击 "Settings" → "Pages"
4. Source 选择 "main branch"
5. 点击 "Save"
6. 等待 2-3 分钟
7. 获得域名：`https://用户名.github.io/classpet-pro/`

---

## 🌐 自定义域名（可选）

如果您有自己的域名，可以绑定到部署平台：

### Vercel 绑定域名

1. 进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Domains"
3. 添加您的域名：`classpet.yourdomain.com`
4. 按提示配置 DNS 记录
5. 等待 DNS 生效（约 10 分钟）

### Netlify 绑定域名

1. 进入 Netlify 项目 Dashboard
2. 点击 "Domain settings"
3. 点击 "Add custom domain"
4. 输入您的域名
5. 按提示配置 DNS

---

## 📱 移动端优化

系统已自动适配移动端，学生可以通过手机访问：

- ✅ 响应式设计
- ✅ 触摸友好
- ✅ 横竖屏适配
- ✅ 加载速度快

---

## 🔒 安全设置

### 教师端保护

教师端已有密码保护（默认密码：1234），建议修改：

1. 访问教师端
2. 进入设置
3. 修改管理员密码

### 访问统计（可选）

添加百度统计或 Google Analytics：

```html
<!-- 在 admin.html 和 mobile.html 的 <head> 中添加 -->
<script>
// 百度统计代码
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?您的统计 ID";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

---

## 📊 访问方式对比

| 访问方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| **Vercel 链接** | 快速、稳定、免费 | 域名较长 | 日常使用 |
| **自定义域名** | 专业、易记 | 需购买域名（¥50-100/年） | 正式使用 |
| **二维码** | 手机扫码直接访问 | 需生成二维码 | 课堂分发 |

---

## 📱 生成访问二维码

### 方法一：在线生成

1. 访问 [二维码生成器](https://www.qr-code-generator.com/)
2. 输入您的 Vercel 链接
3. 下载 PNG 图片
4. 打印或发送给学生

### 方法二：使用浏览器扩展

安装 "QR Code Generator" 扩展，一键生成当前页面二维码。

---

## ⚠️ 注意事项

### 数据存储

- ⚠️ **当前版本使用 localStorage 存储数据**
- ✅ 数据保存在用户浏览器
- ⚠️ 清除浏览器缓存会丢失数据
- 💡 建议定期导出数据备份

### 数据备份方法

1. 访问教师端
2. 进入"数据管理"
3. 点击"导出数据"
4. 保存 JSON 文件到安全位置

### 恢复数据方法

1. 进入教师端"数据管理"
2. 点击"导入数据"
3. 选择之前导出的 JSON 文件
4. 确认导入

---

## 🎯 使用建议

### 课堂使用流程

1. **课前准备**
   - 打开教师端：`https://your-site.vercel.app/admin.html`
   - 登录教师账号

2. **课中操作**
   - 奖励/扣分操作
   - 上传自定义物品

3. **学生访问**
   - 扫码访问学生端：`https://your-site.vercel.app/mobile.html`
   - 选择自己的名字登录
   - 查看宠物状态和积分

4. **课后查看**
   - 学生随时访问查看宠物
   - 使用积分购买物品

---

## 🔧 常见问题

### Q1: 部署后访问很慢怎么办？

**A**: Vercel 使用全球 CDN，中国大陆访问可能需要优化：
- 使用国内 CDN 加速服务
- 或选择腾讯云/阿里云部署

### Q2: 数据会丢失吗？

**A**: 
- localStorage 数据在用户浏览器本地
- 清除缓存会丢失
- 建议每周导出备份

### Q3: 可以多人同时访问吗？

**A**: ✅ 可以！Vercel 免费版支持：
- 无限访问量
- 100GB/月 流量
- 足够 1000+ 学生使用

### Q4: 需要备案吗？

**A**: 
- Vercel/Netlify 是境外服务器
- ✅ 无需备案
- ⚠️ 但也不能使用国内域名

### Q5: 如何更新系统？

**A**: 
- GitHub 部署：更新代码后自动部署
- Netlify 部署：重新上传文件
- 更新后数据不会丢失（localStorage 保留）

---

## 📞 技术支持

如有问题，请查看：
- Vercel 文档：https://vercel.com/docs
- Netlify 文档：https://docs.netlify.com
- GitHub Pages：https://pages.github.com

---

**部署时间**: 5-10 分钟  
**成本**: 免费  
**维护**: 零维护  
**访问**: 全球可访问

---

*祝使用愉快！*
