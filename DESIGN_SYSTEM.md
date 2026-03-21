# ClassPet Pro 设计系统文档

> 基于 CSS 变量系统的完整 UI/UX 设计规范

---

## 目录

1. [色彩系统](#1-色彩系统)
2. [字体系统](#2-字体系统)
3. [间距系统](#3-间距系统)
4. [圆角系统](#4-圆角系统)
5. [阴影系统](#5-阴影系统)
6. [动效系统](#6-动效系统)
7. [组件设计规范](#7-组件设计规范)

---

## 1. 色彩系统

### 1.1 主色调 (Primary Colors)

主色调用于品牌识别、主要按钮、重要交互元素。

```css
:root {
    /* 主色 - 紫蓝渐变 */
    --color-primary: #667eea;
    --color-primary-rgb: 102, 126, 234;
    --color-primary-dark: #764ba2;
    --color-primary-dark-rgb: 118, 75, 162;
    --color-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --color-primary-gradient-reverse: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
```

**使用示例：**

```css
/* 主按钮 */
.btn-primary {
    background: var(--color-primary-gradient);
    color: var(--color-white);
}

/* 文字渐变 */
.title {
    background: var(--color-primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* 边框高亮 */
.card:focus {
    border-color: var(--color-primary);
}
```

### 1.2 辅助色 (Secondary Colors)

辅助色用于次要操作、装饰元素、视觉平衡。

```css
:root {
    /* 辅助色 - 粉紫渐变 */
    --color-secondary: #f093fb;
    --color-secondary-rgb: 240, 147, 251;
    --color-secondary-dark: #f5576c;
    --color-secondary-dark-rgb: 245, 87, 108;
    --color-secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

**使用示例：**

```css
/* 次要按钮 */
.btn-secondary {
    background: var(--color-secondary-gradient);
    color: var(--color-white);
}

/* 装饰性背景 */
.decorative-bg {
    background: var(--color-secondary-gradient);
}
```

### 1.3 状态色 (Status Colors)

状态色用于表示操作结果、系统状态、反馈信息。

```css
:root {
    /* 成功 - 绿色渐变 */
    --color-success: #51cf66;
    --color-success-gradient: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
    
    /* 危险/错误 - 红色渐变 */
    --color-danger: #ff6b6b;
    --color-danger-gradient: linear-gradient(135deg, #ff6b6b 0%, #e03131 100%);
    
    /* 警告 - 橙色渐变 */
    --color-warning: #ff922b;
    --color-warning-gradient: linear-gradient(135deg, #ff922b 0%, #e67700 100%);
    
    /* 信息 - 蓝色渐变 */
    --color-info: #228be6;
    --color-info-gradient: linear-gradient(135deg, #228be6 0%, #1971c2 100%);
}
```

**使用示例：**

```css
/* 成功提示 */
.toast-success {
    background: var(--color-success-gradient);
}

/* 删除按钮 */
.btn-delete {
    background: var(--color-danger);
}

/* 警告标识 */
.badge-warning {
    background: var(--color-warning);
}

/* 信息链接 */
.link-info {
    color: var(--color-info);
}
```

### 1.4 中性色 (Neutral Colors)

中性色用于文字、背景、边框等基础元素。

```css
:root {
    /* 白色系 */
    --color-white: #ffffff;
    --color-light: #f8f9fa;
    --color-light-gray: #e9ecef;
    
    /* 灰色系 */
    --color-gray: #dee2e6;
    --color-gray-dark: #adb5bd;
    --color-dark: #495057;
    --color-darker: #343a40;
    
    /* 黑色系 */
    --color-black: #212529;
}
```

**使用示例：**

```css
/* 文字颜色层级 */
.text-primary { color: var(--color-black); }
.text-secondary { color: var(--color-dark); }
.text-tertiary { color: var(--color-gray-dark); }
.text-disabled { color: var(--color-gray); }

/* 背景色 */
.bg-light { background: var(--color-light); }
.bg-white { background: var(--color-white); }

/* 边框色 */
.border-default { border-color: var(--color-gray); }
.border-dark { border-color: var(--color-gray-dark); }
```

### 1.5 宠物阶段色 (Pet Stage Colors)

宠物阶段色用于区分不同成长阶段的宠物。

```css
:root {
    /* 蛋阶段 - 暖橙色系 */
    --color-stage-egg: linear-gradient(135deg, #FFE4B5 0%, #FFDAB9 100%);
    --color-stage-egg-bg: #FFF5E6;
    
    /* 幼年期 - 嫩绿色系 */
    --color-stage-baby: linear-gradient(135deg, #98FB98 0%, #90EE90 100%);
    --color-stage-baby-bg: #F0FFF4;
    
    /* 青年期 - 天蓝色系 */
    --color-stage-young: linear-gradient(135deg, #87CEEB 0%, #87CEFA 100%);
    --color-stage-young-bg: #E7F5FF;
    
    /* 成年期 - 粉紫色系 */
    --color-stage-adult: linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%);
    --color-stage-adult-bg: #FFF0F5;
}
```

**使用示例：**

```css
/* 宠物卡片阶段边框 */
.pet-card[data-stage="egg"] {
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-egg) border-box;
}

/* 阶段背景 */
.stage-badge-egg {
    background: var(--color-stage-egg-bg);
}

/* 阶段进度条 */
.progress-baby {
    background: var(--color-stage-baby);
}
```

---

## 2. 字体系统

### 2.1 字体族

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

### 2.2 标题字体 (Headings)

| 级别 | 字号 | 字重 | 行高 | 字间距 | 使用场景 |
|------|------|------|------|--------|----------|
| H1 | 36-40px | 800 | 1.2 | -0.5px | 页面主标题 |
| H2 | 28-32px | 700 | 1.3 | -0.3px | 章节标题 |
| H3 | 24-28px | 600 | 1.4 | 0 | 子章节标题 |
| H4 | 20-24px | 600 | 1.4 | 0 | 卡片标题 |

**使用示例：**

```css
/* 页面主标题 */
.page-title {
    font-size: clamp(36px, 3vw, 40px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.5px;
}

/* 章节标题 */
.section-title {
    font-size: clamp(28px, 2.5vw, 32px);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.3px;
}

/* 卡片标题 */
.card-title {
    font-size: clamp(20px, 2vw, 24px);
    font-weight: 600;
    line-height: 1.4;
}
```

### 2.3 正文字体 (Body Text)

| 类型 | 字号 | 字重 | 行高 | 使用场景 |
|------|------|------|------|----------|
| 大号正文 | 18-20px | 400 | 1.6 | 重要内容、阅读文本 |
| 标准正文 | 16px | 400 | 1.6 | 常规内容 |
| 小号正文 | 14px | 400 | 1.5 | 次要内容、说明文字 |

**使用示例：**

```css
/* 标准正文 */
.body-text {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.6;
}

/* 大号正文 */
.body-text-large {
    font-size: clamp(18px, 1.5vw, 20px);
    line-height: 1.6;
}

/* 小号正文 */
.body-text-small {
    font-size: 14px;
    line-height: 1.5;
}
```

### 2.4 辅助文字 (Auxiliary Text)

| 类型 | 字号 | 字重 | 行高 | 使用场景 |
|------|------|------|------|----------|
| 标注 | 13px | 400 | 1.4 | 表单提示、备注 |
| 标签 | 12px | 500 | 1.3 | 标签、徽章文字 |
| 说明 | 11px | 400 | 1.3 | 图注、版权信息 |

**使用示例：**

```css
/* 表单提示 */
.input-hint {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
    color: var(--color-gray-dark);
}

/* 标签文字 */
.badge-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
}

/* 说明文字 */
.caption {
    font-size: 11px;
    color: var(--color-gray-dark);
}
```

### 2.5 数字显示 (Numeric Display)

```css
/* 大数字（积分、统计数据） */
.score-value {
    font-size: 42px;
    font-weight: 700;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
}

/* 中等数字 */
.stat-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-black);
}
```

---

## 3. 间距系统

### 3.1 基础单位

基于 **4px** 作为基础间距单位，所有间距应为 4 的倍数。

```css
:root {
    --space-1: 4px;    /* 1x */
    --space-2: 8px;    /* 2x */
    --space-3: 12px;   /* 3x */
    --space-4: 16px;   /* 4x */
    --space-5: 20px;   /* 5x */
    --space-6: 24px;   /* 6x */
    --space-8: 32px;   /* 8x */
    --space-10: 40px;  /* 10x */
    --space-12: 48px;  /* 12x */
    --space-16: 64px;  /* 16x */
    --space-20: 80px;  /* 20x */
    --space-24: 96px;  /* 24x */
}
```

### 3.2 内边距 (Padding)

| 组件 | 内边距 | 使用场景 |
|------|--------|----------|
| 按钮 | 12px 28px | 标准按钮 |
| 小按钮 | 8px 16px | 紧凑按钮 |
| 卡片 | 20-25px | 内容卡片 |
| 输入框 | 10-12px | 表单输入 |
| 标签 | 5px 12px | 徽章标签 |

**使用示例：**

```css
/* 标准按钮 */
.btn {
    padding: 12px 28px;
}

/* 小按钮 */
.btn-sm {
    padding: 8px 16px;
}

/* 卡片 */
.card {
    padding: 24px;
}

/* 输入框 */
.input {
    padding: 12px 16px;
}
```

### 3.3 外边距 (Margin)

| 场景 | 间距值 | 说明 |
|------|--------|------|
| 段落间距 | 16-20px | 文本段落之间 |
| 卡片间距 | 20-24px | 卡片组件之间 |
| 区块间距 | 32-40px | 页面大区块之间 |
| 元素间距 | 8-12px | 相关元素之间 |

**使用示例：**

```css
/* 段落间距 */
p {
    margin-bottom: 16px;
}

/* 卡片间距 */
.card + .card {
    margin-top: 24px;
}

/* 按钮组间距 */
.btn-group {
    gap: 12px;
}

/* 表单组间距 */
.form-group {
    margin-bottom: 20px;
}
```

### 3.4 响应式间距

```css
/* 移动端减小间距 */
@media (max-width: 768px) {
    .card {
        padding: 16px;
    }
    
    .btn {
        padding: 10px 20px;
    }
}

/* 小屏手机 */
@media (max-width: 480px) {
    .card {
        padding: 12px;
    }
    
    .section {
        padding: 16px;
    }
}
```

---

## 4. 圆角系统

### 4.1 圆角等级

| 等级 | 值 | 使用场景 |
|------|-----|----------|
| XS | 4px | 小标签、图标容器、复选框 |
| SM | 8px | 按钮、输入框、小卡片 |
| MD | 16px | 标准卡片、弹窗、模态框 |
| LG | 24px | 大卡片、容器 |
| XL | 32px | 超大容器、装饰元素 |
| Pill | 9999px | 胶囊按钮、徽章 |
| Circle | 50% | 圆形头像、图标 |

```css
:root {
    --radius-xs: 4px;
    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-xl: 32px;
    --radius-pill: 9999px;
    --radius-circle: 50%;
}
```

### 4.2 使用示例

```css
/* 小标签 */
.badge {
    border-radius: var(--radius-xs);
}

/* 标准按钮 */
.btn {
    border-radius: var(--radius-sm);
}

/* 胶囊按钮 */
.btn-pill {
    border-radius: var(--radius-pill);
}

/* 输入框 */
.input {
    border-radius: var(--radius-sm);
}

/* 标准卡片 */
.card {
    border-radius: var(--radius-md);
}

/* 大卡片 */
.card-large {
    border-radius: var(--radius-lg);
}

/* 圆形头像 */
.avatar {
    border-radius: var(--radius-circle);
}
```

### 4.3 特殊圆角应用

```css
/* 渐变边框圆角 */
.pet-card {
    border-radius: var(--radius-md);
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-baby) border-box;
    border: 3px solid transparent;
}

/* 局部圆角（仅顶部） */
.modal-header {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* 局部圆角（仅底部） */
.modal-footer {
    border-radius: 0 0 var(--radius-md) var(--radius-md);
}
```

---

## 5. 阴影系统

### 5.1 阴影等级

| 等级 | 值 | 使用场景 |
|------|-----|----------|
| XS | 0 1px 3px rgba(0,0,0,0.08) | 轻微悬浮、卡片默认 |
| SM | 0 2px 8px rgba(0,0,0,0.1) | 标准卡片、按钮 |
| MD | 0 4px 20px rgba(0,0,0,0.12) | 弹窗、下拉菜单 |
| LG | 0 8px 30px rgba(0,0,0,0.15) | 模态框、悬浮层 |
| XL | 0 12px 40px rgba(0,0,0,0.2) | 重要悬浮、强调元素 |
| Glow | 0 0 20px rgba(主色，0.3) | 发光效果、聚焦状态 |

```css
:root {
    --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.15);
    --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.2);
    --shadow-glow: 0 0 20px rgba(var(--color-primary-rgb), 0.3);
}
```

### 5.2 使用示例

```css
/* 卡片默认状态 */
.card {
    box-shadow: var(--shadow-sm);
}

/* 卡片悬浮状态 */
.card:hover {
    box-shadow: var(--shadow-xl);
}

/* 按钮 */
.btn {
    box-shadow: var(--shadow-sm);
}

/* 按钮悬浮 */
.btn:hover {
    box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
}

/* 模态框 */
.modal {
    box-shadow: var(--shadow-lg);
}

/* 下拉菜单 */
.dropdown {
    box-shadow: var(--shadow-md);
}

/* 聚焦发光效果 */
.input:focus {
    box-shadow: var(--shadow-glow);
}
```

### 5.3 组合阴影效果

```css
/* 悬浮卡片（阴影 + 位移） */
.float-card {
    box-shadow: var(--shadow-xl), 0 0 30px rgba(var(--color-primary-rgb), 0.2);
    transform: translateY(-8px);
}

/* 按钮点击效果 */
.btn:active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

/* 传奇物品发光效果 */
.legendary-item {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.legendary-item:hover {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}
```

---

## 6. 动效系统

### 6.1 过渡时间

| 类型 | 值 | 使用场景 |
|------|-----|----------|
| Fast | 0.15s | 按钮 hover、小状态变化 |
| Normal | 0.3s | 标准过渡、颜色变化 |
| Slow | 0.5s | 背景动画、大型动画 |

```css
:root {
    --transition-fast: 0.15s;
    --transition-normal: 0.3s;
    --transition-slow: 0.5s;
}
```

### 6.2 缓动函数

```css
:root {
    /* 标准缓动 */
    --ease-default: ease;
    
    /* 弹性缓动 */
    --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* 平滑缓动 */
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    
    /* 加速缓动 */
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    
    /* 减速缓动 */
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### 6.3 关键帧动画

#### 6.3.1 背景渐变动画

```css
@keyframes gradientShift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

body {
    background: var(--color-primary-gradient);
    background-size: 200% 200%;
    animation: gradientShift 15s ease infinite;
}
```

#### 6.3.2 文字闪烁动画

```css
@keyframes textShimmer {
    0%, 100% {
        filter: brightness(1);
    }
    50% {
        filter: brightness(1.2);
    }
}

.title {
    animation: textShimmer 3s ease-in-out infinite;
}
```

#### 6.3.3 卡片浮动动画

```css
@keyframes cardFloat {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

.pet-card {
    animation: cardFloat 6s ease-in-out infinite;
}

.pet-card:hover {
    animation: none;
    transform: translateY(-8px) scale(1.02);
}
```

#### 6.3.4 分数浮动动画

```css
@keyframes scoreFloat {
    0% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px);
    }
}

.score-change {
    animation: scoreFloat 1s ease-out forwards;
}
```

#### 6.3.5 淡入动画

```css
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal {
    animation: fadeIn 0.3s ease;
}
```

#### 6.3.6 滑入动画

```css
@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-content {
    animation: slideIn 0.3s ease;
}
```

#### 6.3.7 缩放进入动画

```css
@keyframes scaleIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.popup {
    animation: scaleIn 0.3s ease;
}
```

#### 6.3.8 按钮脉冲动画

```css
@keyframes pulseBtn {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.btn-welcome {
    animation: pulseBtn 2s infinite;
}
```

### 6.4 过渡效果应用

```css
/* 按钮过渡 */
.btn {
    transition: all var(--transition-normal);
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
}

/* 卡片过渡 */
.card {
    transition: all var(--transition-normal);
}

.card:hover {
    transform: translateY(-8px) scale(1.02);
}

/* 输入框过渡 */
.input {
    transition: border-color var(--transition-fast), 
                box-shadow var(--transition-fast);
}

.input:focus {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-glow);
}
```

---

## 7. 组件设计规范

### 7.1 按钮 (Buttons)

#### 7.1.1 主要按钮

```css
.btn-primary {
    /* 尺寸 */
    padding: 12px 28px;
    font-size: clamp(14px, 1.8vw, 16px);
    
    /* 样式 */
    background: var(--color-primary-gradient);
    color: var(--color-white);
    border: none;
    border-radius: var(--radius-pill);
    
    /* 字体 */
    font-weight: 600;
    letter-spacing: 0.5px;
    
    /* 效果 */
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.4);
    transition: all var(--transition-normal);
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.5);
}

.btn-primary:active {
    transform: translateY(-1px);
}
```

#### 7.1.2 次要按钮

```css
.btn-secondary {
    background: var(--color-secondary-gradient);
    color: var(--color-white);
    box-shadow: 0 4px 15px rgba(var(--color-secondary-dark-rgb), 0.4);
}

.btn-secondary:hover {
    box-shadow: 0 8px 25px rgba(var(--color-secondary-dark-rgb), 0.5);
}
```

#### 7.1.3 状态按钮

```css
/* 成功按钮 */
.btn-success {
    background: var(--color-success-gradient);
    color: var(--color-white);
}

/* 危险按钮 */
.btn-danger {
    background: var(--color-danger);
    color: var(--color-white);
}

/* 警告按钮 */
.btn-warning {
    background: var(--color-warning);
    color: var(--color-white);
}
```

#### 7.1.4 按钮尺寸

```css
/* 大按钮 */
.btn-lg {
    padding: 18px 40px;
    font-size: 20px;
}

/* 标准按钮 */
.btn {
    padding: 12px 28px;
    font-size: 16px;
}

/* 小按钮 */
.btn-sm {
    padding: 8px 16px;
    font-size: 14px;
}
```

#### 7.1.5 涟漪效果

```css
.btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
    width: 300px;
    height: 300px;
}
```

### 7.2 卡片 (Cards)

#### 7.2.1 标准卡片

```css
.card {
    /* 尺寸 */
    padding: 24px;
    min-height: 180px;
    
    /* 样式 */
    background: var(--color-white);
    border-radius: var(--radius-md);
    border: 3px solid transparent;
    
    /* 效果 */
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    animation: cardFloat 6s ease-in-out infinite;
}

.card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: var(--shadow-xl), 0 0 30px rgba(var(--color-primary-rgb), 0.2);
    animation: none;
}

.card:active {
    transform: translateY(-4px) scale(0.98);
}

.card:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 4px;
}
```

#### 7.2.2 阶段卡片

```css
.pet-card[data-stage="egg"] {
    border-color: transparent;
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-egg) border-box;
}

.pet-card[data-stage="baby"] {
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-baby) border-box;
}

.pet-card[data-stage="young"] {
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-young) border-box;
}

.pet-card[data-stage="adult"] {
    background: linear-gradient(white, white) padding-box,
                var(--color-stage-adult) border-box;
}
```

### 7.3 输入框 (Input Fields)

#### 7.3.1 标准输入框

```css
.input {
    /* 尺寸 */
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    
    /* 样式 */
    border: 1px solid var(--color-gray);
    border-radius: var(--radius-sm);
    background: var(--color-white);
    
    /* 过渡 */
    transition: border-color var(--transition-fast), 
                box-shadow var(--transition-fast);
}

.input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.input::placeholder {
    color: var(--color-gray-dark);
}
```

#### 7.3.2 表单组

```css
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-dark);
}

.form-hint {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-gray-dark);
}
```

#### 7.3.3 特殊输入框

```css
/* 大输入框（密码等） */
.input-lg {
    height: 60px;
    font-size: 32px;
    text-align: center;
    border: 3px solid var(--color-gray);
    letter-spacing: 10px;
}

.input-lg:focus {
    border-color: var(--color-primary);
}
```

### 7.4 模态框 (Modals)

#### 7.4.1 模态框容器

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    /* 尺寸 */
    max-width: 500px;
    width: 90%;
    padding: 40px;
    
    /* 样式 */
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    
    /* 动画 */
    animation: slideIn 0.3s ease;
}
```

### 7.5 徽章与标签 (Badges & Tags)

#### 7.5.1 状态徽章

```css
.badge {
    /* 尺寸 */
    padding: 5px 12px;
    font-size: 12px;
    
    /* 样式 */
    border-radius: var(--radius-pill);
    font-weight: 600;
    
    /* 状态颜色 */
}

.badge-success {
    background: var(--color-success);
    color: var(--color-white);
}

.badge-danger {
    background: var(--color-danger);
    color: var(--color-white);
}

.badge-warning {
    background: var(--color-warning);
    color: var(--color-white);
}

.badge-info {
    background: var(--color-info);
    color: var(--color-white);
}
```

### 7.6 进度条 (Progress Bars)

#### 7.6.1 标准进度条

```css
.progress-bar {
    width: 100%;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-pill);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--color-primary-gradient);
    border-radius: var(--radius-pill);
    transition: width 0.5s ease;
}

.progress-text {
    font-size: 14px;
    color: var(--color-white);
    opacity: 0.9;
}
```

### 7.7 头部导航 (Header)

#### 7.7.1 顶部导航栏

```css
.header {
    /* 尺寸 */
    height: var(--header-height);
    padding: 20px 40px;
    
    /* 样式 */
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-md);
    
    /* 布局 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.class-name {
    font-size: clamp(24px, 3vw, 36px);
    font-weight: 800;
    background: var(--color-primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
    animation: textShimmer 3s ease-in-out infinite;
}
```

### 7.8 交互按钮组 (Interaction Buttons)

#### 7.8.1 互动按钮

```css
.btn-interact {
    /* 尺寸 */
    padding: 15px 10px;
    
    /* 样式 */
    background: var(--color-white);
    border: 2px solid transparent;
    border-radius: var(--radius-md);
    
    /* 布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    /* 效果 */
    cursor: pointer;
    transition: all var(--transition-normal);
}

.btn-interact:hover {
    border-color: var(--color-primary);
    background: var(--color-light);
    transform: translateY(-3px);
}

.btn-interact:active {
    transform: translateY(-1px);
}

.btn-interact .emoji {
    font-size: 32px;
}

.btn-interact .label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-dark);
}
```

---

## 附录：快速参考

### CSS 变量速查表

```css
/* 颜色 */
--color-primary: #667eea
--color-secondary: #f093fb
--color-success: #51cf66
--color-danger: #ff6b6b
--color-warning: #ff922b
--color-info: #228be6

/* 阴影 */
--shadow-xs: 0 1px 3px rgba(0,0,0,0.08)
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1)
--shadow-md: 0 4px 20px rgba(0,0,0,0.12)
--shadow-lg: 0 8px 30px rgba(0,0,0,0.15)
--shadow-xl: 0 12px 40px rgba(0,0,0,0.2)

/* 圆角 */
--radius-xs: 4px
--radius-sm: 8px
--radius-md: 16px
--radius-lg: 24px
--radius-xl: 32px
--radius-pill: 9999px

/* 过渡 */
--transition-fast: 0.15s
--transition-normal: 0.3s
--transition-slow: 0.5s
```

---

## 更新日志

- **v1.0** (2026-03-21): 初始版本，基于现有 CSS 变量系统创建完整设计文档

---

*本文档由 ClassPet Pro 团队维护，遵循项目统一的 CSS 变量规范。*
