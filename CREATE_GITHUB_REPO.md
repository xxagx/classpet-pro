# GitHub 仓库创建指南

## 步骤 1: 创建 GitHub 仓库

1. **登录 GitHub**: https://github.com/login
2. **点击 "+"**: 右上角的 "+" 图标 → New repository
3. **填写信息**:
   - Repository name: `classpet-pro1.0`
   - Description: "班级宠物养成系统 - 教室希沃触摸一体机互动宠物系统"
   - Public (公开仓库)
   - 点击 Create repository

## 步骤 2: 设置远程仓库

创建完成后 GitHub 会显示仓库 URL：
- `https://github.com/fwei19921-dotcom/classpet-pro1.0.git`

在本地执行：
```bash
cd /Users/yr/.openclaw/workspace/classpet-pro-for-codebuddy
git remote add origin https://github.com/fwei19921-dotcom/classpet-pro1.0.git
```

## 步骤 3: 推送代码

```bash
git push -u origin main
```

## 步骤 4: GitHub Pages 配置

1. **访问仓库**: https://github.com/fwei19921-dotcom/classpet-pro1.0
2. **点击 Settings**
3. **找到 Pages**
4. **配置**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. **点击 Save**

## 步骤 5: 测试访问

等待几分钟后访问：
- https://fwei19921-dotcom.github.io/classpet-pro1.0/deploy-test.html
- https://fwei19921-dotcom.github.io/classpet-pro1.0/index.html

## 备选方案：使用 SSH

如果 HTTPS 推送失败，可以使用 SSH：

```bash
# 设置 SSH 远程仓库
git remote set-url origin git@github.com:fwei19921-dotcom/classpet-pro1.0.git

# 推送代码
git push origin main
```

## 问题解决

### 如果推送失败：
1. **检查远程仓库**: `git remote -v`
2. **确认 GitHub 账户**: 登录 GitHub 确认账户权限
3. **确认仓库存在**: https://github.com/fwei19921-dotcom/classpet-pro1.0
4. **可能需要输入密码**: 使用 HTTPS 可能需要用户名/密码

### 如果 GitHub Pages 404：
1. **等待 5 分钟**: GitHub Pages 部署需要时间
2. **检查配置**: Settings → Pages 是否正确
3. **查看 Actions**: 仓库的 Actions 页面查看部署状态

## 项目信息

- **仓库名称**: classpet-pro1.0
- **GitHub 用户名**: fwei19921-dotcom
- **本地目录**: /Users/yr/.openclaw/workspace/classpet-pro-for-codebuddy
- **远程 URL**: https://github.com/fwei19921-dotcom/classpet-pro1.0.git