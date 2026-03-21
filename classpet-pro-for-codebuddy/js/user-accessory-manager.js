// ClassPet Pro - 用户配饰库存和积分管理系统

class UserAccessoryManager {
    constructor(studentId) {
        this.studentId = studentId;
        this.storageKey = `classpet_user_${studentId}`;
        this.userData = this.loadUserData();
    }

    // 加载用户数据
    loadUserData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        
        // 初始化用户数据
        return {
            studentId: this.studentId,
            points: 0,
            accessories: [], // 已购买的配饰
            wornAccessories: {}, // 当前穿戴的配饰 { category: accessoryId }
            purchaseHistory: [], // 购买记录
            pointsHistory: [] // 积分变动记录
        };
    }

    // 保存用户数据
    saveUserData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
    }

    // 获取当前积分
    getPoints() {
        return this.userData.points;
    }

    // 更新积分
    updatePoints(newPoints) {
        const oldPoints = this.userData.points;
        this.userData.points = Math.max(0, newPoints);
        
        // 记录积分变动
        if (oldPoints !== this.userData.points) {
            this.addPointsHistory(
                this.userData.points - oldPoints,
                '积分更新',
                `从 ${oldPoints} 变更为 ${this.userData.points}`
            );
        }
        
        this.saveUserData();
        return this.userData.points;
    }

    // 添加积分（奖励等）
    addPoints(amount, reason = '奖励', description = '') {
        const oldPoints = this.userData.points;
        this.userData.points += amount;
        
        this.addPointsHistory(amount, reason, description || `获得 ${amount} 积分`);
        this.saveUserData();
        
        return this.userData.points;
    }

    // 扣除积分（购买等）
    deductPoints(amount, reason = '消费', description = '') {
        if (this.userData.points < amount) {
            return { success: false, message: '积分不足' };
        }
        
        const oldPoints = this.userData.points;
        this.userData.points -= amount;
        
        this.addPointsHistory(-amount, reason, description || `消费 ${amount} 积分`);
        this.saveUserData();
        
        return { success: true, newPoints: this.userData.points };
    }

    // 记录积分变动
    addPointsHistory(amount, reason, description) {
        this.userData.pointsHistory.unshift({
            timestamp: Date.now(),
            amount: amount,
            reason: reason,
            description: description,
            balance: this.userData.points
        });
        
        // 只保留最近 100 条记录
        if (this.userData.pointsHistory.length > 100) {
            this.userData.pointsHistory = this.userData.pointsHistory.slice(0, 100);
        }
    }

    // 购买配饰
    purchaseAccessory(accessory) {
        // 检查是否已拥有
        if (this.hasAccessory(accessory.id)) {
            return { success: false, message: '已拥有该配饰' };
        }
        
        // 扣除积分
        const deductResult = this.deductPoints(
            accessory.points,
            '购买配饰',
            `购买 ${accessory.name} (${accessory.points} 积分)`
        );
        
        if (!deductResult.success) {
            return deductResult;
        }
        
        // 添加配饰到库存
        this.userData.accessories.push({
            accessoryId: accessory.id,
            name: accessory.name,
            emoji: accessory.emoji,
            color: accessory.color,
            category: this.getCategoryFromId(accessory.id),
            points: accessory.points,
            purchaseTime: Date.now()
        });
        
        // 记录购买历史
        this.userData.purchaseHistory.unshift({
            timestamp: Date.now(),
            accessoryId: accessory.id,
            name: accessory.name,
            points: accessory.points,
            category: this.getCategoryFromId(accessory.id)
        });
        
        // 只保留最近 50 条购买记录
        if (this.userData.purchaseHistory.length > 50) {
            this.userData.purchaseHistory = this.userData.purchaseHistory.slice(0, 50);
        }
        
        this.saveUserData();
        
        return {
            success: true,
            message: `成功购买 ${accessory.name}！`,
            newPoints: this.userData.points
        };
    }

    // 检查是否拥有某个配饰
    hasAccessory(accessoryId) {
        return this.userData.accessories.some(acc => acc.accessoryId === accessoryId);
    }

    // 获取所有配饰
    getAllAccessories() {
        return this.userData.accessories;
    }

    // 按分类获取配饰
    getAccessoriesByCategory(category) {
        return this.userData.accessories.filter(acc => acc.category === category);
    }

    // 穿戴配饰
    wearAccessory(accessoryId) {
        const accessory = this.userData.accessories.find(acc => acc.accessoryId === accessoryId);
        
        if (!accessory) {
            return { success: false, message: '未拥有该配饰' };
        }
        
        // 获取配饰分类
        const category = accessory.category;
        
        // 替换当前穿戴的配饰
        const previousWorn = this.userData.wornAccessories[category];
        this.userData.wornAccessories[category] = accessoryId;
        
        this.saveUserData();
        
        return {
            success: true,
            message: `已穿戴 ${accessory.name}`,
            previousWorn: previousWorn,
            currentWorn: accessoryId
        };
    }

    // 脱下配饰
    removeAccessory(category) {
        const previousWorn = this.userData.wornAccessories[category];
        
        if (previousWorn) {
            delete this.userData.wornAccessories[category];
            this.saveUserData();
            
            return {
                success: true,
                message: '已脱下配饰',
                previousWorn: previousWorn
            };
        }
        
        return { success: false, message: '该位置未穿戴配饰' };
    }

    // 获取当前穿戴的配饰
    getWornAccessories() {
        const worn = {};
        
        for (const category in this.userData.wornAccessories) {
            const accessoryId = this.userData.wornAccessories[category];
            const accessory = this.userData.accessories.find(acc => acc.accessoryId === accessoryId);
            if (accessory) {
                worn[category] = accessory;
            }
        }
        
        return worn;
    }

    // 获取某个分类当前穿戴的配饰
    getWornAccessory(category) {
        const accessoryId = this.userData.wornAccessories[category];
        if (!accessoryId) return null;
        
        return this.userData.accessories.find(acc => acc.accessoryId === accessoryId);
    }

    // 根据 ID 获取配饰
    getAccessoryById(accessoryId) {
        return this.userData.accessories.find(acc => acc.accessoryId === accessoryId);
    }

    // 获取购买历史
    getPurchaseHistory(limit = 20) {
        return this.userData.purchaseHistory.slice(0, limit);
    }

    // 获取积分历史
    getPointsHistory(limit = 20) {
        return this.userData.pointsHistory.slice(0, limit);
    }

    // 从配饰 ID 获取分类
    getCategoryFromId(accessoryId) {
        const parts = accessoryId.split('_');
        if (parts.length > 0) {
            const categoryKey = parts[0]; // cloth, shoe, hat 等
            
            const categoryMap = {
                cloth: 'clothes',
                shoe: 'shoes',
                hat: 'hat',
                glass: 'glasses',
                hair: 'hairpin',
                bag: 'bag',
                jewel: 'jewelry',
                brace: 'bracelet'
            };
            
            return categoryMap[categoryKey] || categoryKey;
        }
        return 'unknown';
    }

    // 渲染用户库存界面
    renderInventory(container, onWear, onRemove) {
        const wornAccessories = this.getWornAccessories();
        const categories = {
            clothes: { name: '衣服', icon: '👕' },
            shoes: { name: '鞋子', icon: '👟' },
            hat: { name: '帽子', icon: '🧢' },
            glasses: { name: '眼镜', icon: '👓' },
            hairpin: { name: '发卡', icon: '🎀' },
            bag: { name: '背包', icon: '🎒' },
            jewelry: { name: '首饰', icon: '📿' },
            bracelet: { name: '手链', icon: '⌚' }
        };
        
        container.innerHTML = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <h2>🎒 我的配饰库</h2>
                    <div class="user-points">
                        💰 当前积分：<span class="points-value">${this.getPoints()}</span>
                    </div>
                    <div class="inventory-stats">
                        📦 拥有配饰：<span>${this.getAllAccessories().length}</span> 件
                    </div>
                </div>
                
                <div class="worn-section">
                    <h3>✨ 当前穿戴</h3>
                    <div class="worn-grid">
                        ${Object.keys(categories).map(cat => {
                            const worn = wornAccessories[cat];
                            return `
                                <div class="worn-slot ${worn ? 'worn' : 'empty'}" data-category="${cat}">
                                    <div class="slot-label">
                                        ${categories[cat].icon} ${categories[cat].name}
                                    </div>
                                    ${worn ? `
                                        <div class="worn-item">
                                            <span class="worn-emoji">${worn.emoji}</span>
                                            <span class="worn-name">${worn.name}</span>
                                            <button class="btn-remove-wear" data-category="${cat}">
                                                脱下
                                            </button>
                                        </div>
                                    ` : `
                                        <div class="empty-slot">未穿戴</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="inventory-tabs">
                    <button class="tab-btn active" data-tab="all">全部</button>
                    ${Object.keys(categories).map(cat => `
                        <button class="tab-btn" data-tab="${cat}">
                            ${categories[cat].icon} ${categories[cat].name}
                        </button>
                    `).join('')}
                </div>
                
                <div class="inventory-grid" id="inventoryGrid">
                    ${this.renderInventoryGrid(this.getAllAccessories())}
                </div>
            </div>
        `;

        // 绑定分类标签
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.dataset.tab;
                const accessories = category === 'all'
                    ? this.getAllAccessories()
                    : this.getAccessoriesByCategory(category);
                
                document.getElementById('inventoryGrid').innerHTML = 
                    this.renderInventoryGrid(accessories);
                
                // 重新绑定穿戴按钮
                this.bindInventoryButtons(container, onWear);
            });
        });

        // 绑定脱下按钮
        container.querySelectorAll('.btn-remove-wear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = e.target.dataset.category;
                if (onRemove) {
                    onRemove(category);
                }
            });
        });

        // 绑定穿戴按钮
        this.bindInventoryButtons(container, onWear);
    }

    // 渲染库存网格
    renderInventoryGrid(accessories) {
        if (accessories.length === 0) {
            return '<div class="no-items">暂无配饰，去商城逛逛吧~</div>';
        }

        const wornAccessories = this.getWornAccessories();

        return accessories.map(acc => {
            const isWorn = wornAccessories[acc.category] && 
                          wornAccessories[acc.category].accessoryId === acc.accessoryId;
            
            return `
                <div class="inventory-item ${isWorn ? 'worn' : ''}">
                    <div class="item-emoji" style="background: ${acc.color}20">
                        <span style="font-size: 40px">${acc.emoji}</span>
                    </div>
                    <div class="item-info">
                        <div class="item-name">${acc.name}</div>
                        <div class="item-purchase-time">
                            购买：${this.formatDate(acc.purchaseTime)}
                        </div>
                        <button class="btn-wear ${isWorn ? 'wearing' : ''}" 
                                data-id="${acc.accessoryId}">
                            ${isWorn ? '已穿戴' : '穿戴'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 绑定库存按钮
    bindInventoryButtons(container, onWear) {
        container.querySelectorAll('.btn-wear:not(.wearing)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accessoryId = e.target.dataset.id;
                if (onWear) {
                    onWear(accessoryId);
                }
            });
        });
    }

    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // 今天
        if (diff < 24 * 60 * 60 * 1000) {
            return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 昨天
        if (diff < 48 * 60 * 60 * 1000) {
            return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 更早
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 渲染积分历史
    renderPointsHistory(container) {
        const history = this.getPointsHistory();
        
        container.innerHTML = `
            <div class="history-container">
                <h2>📊 积分变动记录</h2>
                <div class="history-list">
                    ${history.length === 0 ? 
                        '<div class="no-items">暂无积分变动记录</div>' :
                        history.map(record => `
                            <div class="history-item ${record.amount > 0 ? 'positive' : 'negative'}">
                                <div class="history-info">
                                    <div class="history-reason">${record.reason}</div>
                                    <div class="history-description">${record.description}</div>
                                    <div class="history-time">${this.formatDateTime(record.timestamp)}</div>
                                </div>
                                <div class="history-amount ${record.amount > 0 ? 'plus' : 'minus'}">
                                    ${record.amount > 0 ? '+' : ''}${record.amount}
                                </div>
                                <div class="history-balance">
                                    余额：${record.balance}
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    // 格式化日期时间
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
}

// 导出
window.UserAccessoryManager = UserAccessoryManager;
