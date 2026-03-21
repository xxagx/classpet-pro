// ClassPet Pro - 学生端物品商城和穿戴系统（支持教师上传物品）

class StudentItemMall {
    constructor(studentId, options = {}) {
        this.studentId = studentId;
        this.options = options;
        this.itemDatabase = new ItemDatabaseManager();
        this.dataManager = window.dataManager || null;
        this.userItemManager = new UserItemManager(studentId, this.dataManager);
        this.currentFilter = {
            type: 'all',
            rarity: 'all',
            category: 'all'
        };
    }
    
    // 渲染商城界面
    renderMall(container) {
        const allItems = this.itemDatabase.getAllItems();
        
        container.innerHTML = `
            <div class="student-mall">
                <div class="mall-header">
                    <h2>🛍️ 物品商城</h2>
                    <div class="user-points">
                        💰 当前积分：<span class="points-value">${this.userItemManager.getPoints()}</span>
                    </div>
                </div>
                
                <div class="mall-filters">
                    <select id="filterType" class="filter-select">
                        <option value="all">全部类型</option>
                        <option value="accessory">配饰类</option>
                        <option value="temporary">临时类</option>
                        <option value="weapon">武器类</option>
                    </select>
                    
                    <select id="filterCategory" class="filter-select">
                        <option value="all">全部分类</option>
                        <!-- 动态加载 -->
                    </select>
                    
                    <select id="filterRarity" class="filter-select">
                        <option value="all">全部稀有度</option>
                        <option value="common">普通</option>
                        <option value="rare">稀有</option>
                        <option value="epic">史诗</option>
                        <option value="legendary">传说</option>
                        <option value="mythical">神话</option>
                    </select>
                    
                    <input type="text" id="searchInput" class="search-input" placeholder="搜索物品...">
                </div>
                
                <div class="items-grid" id="itemsGrid">
                    ${this.renderItemsGrid(allItems)}
                </div>
            </div>
        `;
        
        this.bindMallEvents(container);
        this.updateCategoryFilter();
    }
    
    // 渲染物品网格
    renderItemsGrid(items) {
        if (items.length === 0) {
            return '<div class="no-items">暂无物品，请老师先上传物品</div>';
        }
        
        return items.map(item => {
            const rarityConfig = ITEM_RARITY_CONFIG[item.rarity];
            const typeConfig = ITEM_TYPE_CONFIG[item.type];
            const canAfford = this.userItemManager.getPoints() >= item.points;
            const isOwned = this.userItemManager.hasItem(item.id);
            
            return `
                <div class="item-card ${item.rarity}" style="border-color: ${rarityConfig.borderColor}">
                    <div class="item-card-header">
                        <span class="item-type-badge" style="background: ${typeConfig.bgGradient}">
                            ${typeConfig.icon} ${typeConfig.name}
                        </span>
                        ${isOwned ? '<span class="owned-badge">✅ 已拥有</span>' : ''}
                    </div>
                    
                    <div class="item-card-body">
                        <div class="item-emoji-display" style="background: ${item.color}20">
                            ${item.image ? 
                                `<img src="${item.image}" class="item-custom-image">` : 
                                `<span style="font-size: 48px">${item.emoji}</span>`
                            }
                        </div>
                        
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-category">${this.itemDatabase.getCategoryName(item.category)}</div>
                            <div class="item-rarity" style="color: ${rarityConfig.color}">
                                ${rarityConfig.name}
                            </div>
                            ${item.description ? `
                                <div class="item-description">${item.description}</div>
                            ` : ''}
                            ${item.type === 'weapon' ? `
                                <div class="item-stats">
                                    ⚔️ 攻击：${item.attack} | 🔮 魔法：${item.magic}
                                </div>
                            ` : ''}
                            ${item.type === 'temporary' ? `
                                <div class="item-effect">
                                    ✨ ${item.effect.description || '特殊效果'}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="item-card-footer">
                        <div class="item-points">💰 ${item.points} 积分</div>
                        <button class="btn-buy ${canAfford && !isOwned ? '' : 'disabled'}" 
                                data-id="${item.id}" 
                                ${(!canAfford || isOwned) ? 'disabled' : ''}>
                            ${isOwned ? '已拥有' : (canAfford ? '购买' : '积分不足')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 绑定商城事件
    bindMallEvents(container) {
        const filterType = container.querySelector('#filterType');
        const filterCategory = container.querySelector('#filterCategory');
        const filterRarity = container.querySelector('#filterRarity');
        const searchInput = container.querySelector('#searchInput');
        
        // 类型筛选
        filterType.addEventListener('change', () => {
            this.currentFilter.type = filterType.value;
            this.updateCategoryFilter();
            this.applyFilters();
        });
        
        // 分类筛选
        filterCategory.addEventListener('change', () => {
            this.currentFilter.category = filterCategory.value;
            this.applyFilters();
        });
        
        // 稀有度筛选
        filterRarity.addEventListener('change', () => {
            this.currentFilter.rarity = filterRarity.value;
            this.applyFilters();
        });
        
        // 搜索
        searchInput.addEventListener('input', () => {
            this.applyFilters();
        });
        
        // 购买按钮
        container.querySelectorAll('.btn-buy:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                this.handlePurchase(itemId);
            });
        });
    }
    
    // 更新分类筛选
    updateCategoryFilter() {
        const filterCategory = document.querySelector('#filterCategory');
        const itemType = this.currentFilter.type;
        
        let categories = {};
        if (itemType === 'accessory') {
            categories = ACCESSORY_SUBCATEGORIES;
        } else if (itemType === 'temporary') {
            categories = TEMPORARY_SUBCATEGORIES;
        } else if (itemType === 'weapon') {
            categories = WEAPON_SUBCATEGORIES;
        }
        
        filterCategory.innerHTML = '<option value="all">全部分类</option>' +
            Object.entries(categories).map(([key, value]) => `
                <option value="${key}">${this.itemDatabase.getCategoryName(key)}</option>
            `).join('');
    }
    
    // 应用筛选
    applyFilters() {
        const container = document.querySelector('#itemsGrid');
        if (!container) return;
        
        let items = this.itemDatabase.getAllItems();
        
        // 类型筛选
        if (this.currentFilter.type !== 'all') {
            items = items.filter(item => item.type === this.currentFilter.type);
        }
        
        // 分类筛选
        if (this.currentFilter.category !== 'all') {
            items = items.filter(item => item.category === this.currentFilter.category);
        }
        
        // 稀有度筛选
        if (this.currentFilter.rarity !== 'all') {
            items = items.filter(item => item.rarity === this.currentFilter.rarity);
        }
        
        // 搜索
        const searchTerm = document.querySelector('#searchInput')?.value.toLowerCase() || '';
        if (searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        container.innerHTML = this.renderItemsGrid(items);
        
        // 重新绑定购买按钮
        container.querySelectorAll('.btn-buy:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                this.handlePurchase(itemId);
            });
        });
    }
    
    // 处理购买
    handlePurchase(itemId) {
        const item = this.itemDatabase.getItemById(itemId);
        if (!item) return;
        
        // 显示确认对话框
        this.showPurchaseConfirm(item, () => {
            const result = this.userItemManager.purchaseItem(item);
            
            if (result.success) {
                this.showSuccessToast(`成功购买 ${item.name}！`);
                this.applyFilters(); // 刷新界面
            } else {
                alert(result.message);
            }
        });
    }
    
    // 显示购买确认
    showPurchaseConfirm(item, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'purchase-confirm-modal';
        modal.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-title">确认购买</div>
                <div class="confirm-item">
                    <div class="confirm-emoji">
                        ${item.image ? 
                            `<img src="${item.image}" style="max-width: 80px;">` : 
                            `<span style="font-size: 60px">${item.emoji}</span>`
                        }
                    </div>
                    <div class="confirm-details">
                        <div class="confirm-name">${item.name}</div>
                        <div class="confirm-category">${ITEM_TYPE_CONFIG[item.type].icon} ${ITEM_TYPE_CONFIG[item.type].name} - ${this.itemDatabase.getCategoryName(item.category)}</div>
                        <div class="confirm-rarity" style="color: ${ITEM_RARITY_CONFIG[item.rarity].color}">
                            ${ITEM_RARITY_CONFIG[item.rarity].name}
                        </div>
                    </div>
                </div>
                <div class="confirm-points-info">
                    <div class="confirm-point-row">
                        <span>商品价格：</span>
                        <span style="color: #FFD700">${item.points} 积分</span>
                    </div>
                    <div class="confirm-point-row">
                        <span>当前积分：</span>
                        <span style="color: #4CAF50">${this.userItemManager.getPoints()} 积分</span>
                    </div>
                    <div class="confirm-point-row">
                        <span>购买后剩余：</span>
                        <span style="color: ${this.userItemManager.getPoints() - item.points >= 0 ? '#4CAF50' : '#E74C3C'}">
                            ${this.userItemManager.getPoints() - item.points} 积分
                        </span>
                    </div>
                </div>
                <div class="confirm-buttons">
                    <button class="btn-confirm">确认购买</button>
                    <button class="btn-cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.btn-confirm').addEventListener('click', () => {
            modal.remove();
            onConfirm();
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // 显示成功提示
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // 渲染库存界面
    renderInventory(container) {
        this.userItemManager.renderInventory(container, (itemId) => {
            this.handleWearItem(itemId);
        });
    }
    
    // 处理穿戴
    handleWearItem(itemId) {
        const result = this.userItemManager.wearItem(itemId);
        
        if (result.success) {
            this.showSuccessToast(result.message);
            setTimeout(() => {
                this.renderInventory(document.querySelector('#inventoryTab'));
            }, 500);
        } else {
            alert(result.message);
        }
    }
    
    // 获取用户物品管理器
    getUserItemManager() {
        return this.userItemManager;
    }
}

// 用户物品管理器（扩展原 UserAccessoryManager）
class UserItemManager {
    constructor(studentId, dataManager) {
        this.studentId = studentId;
        this.dataManager = dataManager;
        this.storageKey = `classpet_user_items_${studentId}`;
        this.userData = this.loadUserData();
    }
    
    // 加载用户数据
    loadUserData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            studentId: this.studentId,
            points: 0,
            items: [], // 已购买物品
            wornItems: {}, // 当前穿戴/装备 {slot: itemId}
            purchaseHistory: [],
            pointsHistory: []
        };
    }
    
    // 保存用户数据
    saveUserData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
    }
    
    // 获取积分（从学生数据同步）
    getPoints() {
        // 如果有 dataManager，从学生数据获取积分
        if (this.dataManager) {
            const student = this.dataManager.getStudentById(this.studentId);
            if (student) {
                return student.score || 0;
            }
        }
        return this.userData.points;
    }
    
    // 更新积分（同步到学生数据）
    updatePoints(newPoints) {
        newPoints = Math.max(0, newPoints);
        
        // 更新到学生数据
        if (this.dataManager) {
            const student = this.dataManager.getStudentById(this.studentId);
            if (student) {
                student.score = newPoints;
                this.dataManager.save();
            }
        }
        
        this.userData.points = newPoints;
        this.saveUserData();
    }
    
    // 扣除积分
    deductPoints(amount, reason, description) {
        const currentPoints = this.getPoints();
        if (currentPoints < amount) {
            return { success: false, message: '积分不足' };
        }
        
        const newPoints = currentPoints - amount;
        this.updatePoints(newPoints);
        
        // 记录积分变动
        this.userData.pointsHistory.unshift({
            timestamp: Date.now(),
            type: 'deduct',
            amount: amount,
            balance: newPoints,
            reason: reason,
            description: description
        });
        
        // 保留最近 50 条记录
        if (this.userData.pointsHistory.length > 50) {
            this.userData.pointsHistory = this.userData.pointsHistory.slice(0, 50);
        }
        
        this.saveUserData();
        
        return {
            success: true,
            newPoints: newPoints
        };
    }
    
    // 增加积分
    addPoints(amount, reason, description) {
        const currentPoints = this.getPoints();
        const newPoints = currentPoints + amount;
        this.updatePoints(newPoints);
        
        // 记录积分变动
        this.userData.pointsHistory.unshift({
            timestamp: Date.now(),
            type: 'add',
            amount: amount,
            balance: newPoints,
            reason: reason,
            description: description
        });
        
        // 保留最近 50 条记录
        if (this.userData.pointsHistory.length > 50) {
            this.userData.pointsHistory = this.userData.pointsHistory.slice(0, 50);
        }
        
        this.saveUserData();
        
        return {
            success: true,
            newPoints: newPoints
        };
    }
    
    // 购买物品
    purchaseItem(item) {
        if (this.hasItem(item.id)) {
            return { success: false, message: '已拥有该物品' };
        }
        
        if (this.userData.points < item.points) {
            return { success: false, message: '积分不足' };
        }
        
        // 扣除积分
        this.userData.points -= item.points;
        
        // 添加物品
        this.userData.items.push({
            itemId: item.id,
            name: item.name,
            type: item.type,
            category: item.category,
            emoji: item.emoji,
            image: item.image,
            color: item.color,
            rarity: item.rarity,
            points: item.points,
            purchaseTime: Date.now()
        });
        
        // 记录购买历史
        this.userData.purchaseHistory.unshift({
            timestamp: Date.now(),
            itemId: item.id,
            name: item.name,
            type: item.type,
            points: item.points
        });
        
        // 保留最近 50 条记录
        if (this.userData.purchaseHistory.length > 50) {
            this.userData.purchaseHistory = this.userData.purchaseHistory.slice(0, 50);
        }
        
        this.saveUserData();
        
        return {
            success: true,
            message: `成功购买 ${item.name}！`,
            newPoints: this.userData.points
        };
    }
    
    // 检查是否拥有
    hasItem(itemId) {
        return this.userData.items.some(item => item.itemId === itemId);
    }
    
    // 获取所有物品
    getAllItems() {
        return this.userData.items;
    }
    
    // 按类型获取物品
    getItemsByType(type) {
        return this.userData.items.filter(item => item.type === type);
    }
    
    // 穿戴/装备物品
    wearItem(itemId) {
        const item = this.userData.items.find(i => i.itemId === itemId);
        
        if (!item) {
            return { success: false, message: '未拥有该物品' };
        }
        
        const typeConfig = ITEM_TYPE_CONFIG[item.type];
        if (!typeConfig || !typeConfig.canWear) {
            return { success: false, message: '该物品无法穿戴/装备' };
        }
        
        const slot = item.type === 'accessory' ? item.category : 'weapon';
        
        // 替换当前装备
        const previousWorn = this.userData.wornItems[slot];
        this.userData.wornItems[slot] = itemId;
        
        this.saveUserData();
        
        return {
            success: true,
            message: `已装备 ${item.name}`,
            slot: slot,
            previousWorn: previousWorn
        };
    }
    
    // 脱下物品
    removeItem(slot) {
        const previousWorn = this.userData.wornItems[slot];
        
        if (previousWorn) {
            delete this.userData.wornItems[slot];
            this.saveUserData();
            
            return {
                success: true,
                message: '已脱下装备',
                previousWorn: previousWorn
            };
        }
        
        return { success: false, message: '该槽位未装备物品' };
    }
    
    // 获取当前穿戴/装备的物品
    getWornItems() {
        const worn = {};
        
        for (const slot in this.userData.wornItems) {
            const itemId = this.userData.wornItems[slot];
            const item = this.userData.items.find(i => i.itemId === itemId);
            if (item) {
                worn[slot] = item;
            }
        }
        
        return worn;
    }
    
    // 渲染库存界面
    renderInventory(container, onWear) {
        const wornItems = this.getWornItems();
        
        // 构建所有槽位
        const allSlots = {
            ...ACCESSORY_SUBCATEGORIES,
            weapon: '武器'
        };
        
        const slotIcons = {
            clothes: '👕',
            shoes: '👟',
            hat: '🧢',
            glasses: '👓',
            hairpin: '🎀',
            bag: '🎒',
            jewelry: '📿',
            bracelet: '⌚',
            weapon: '⚔️'
        };
        
        container.innerHTML = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <h2>🎒 我的物品库</h2>
                    <div class="user-points">
                        💰 当前积分：<span class="points-value">${this.getPoints()}</span>
                    </div>
                    <div class="inventory-stats">
                        📦 拥有物品：<span>${this.getAllItems().length}</span> 件
                    </div>
                </div>
                
                <div class="worn-section">
                    <h3>✨ 当前装备</h3>
                    <div class="worn-grid">
                        ${Object.entries(allSlots).map(([slot, name]) => {
                            const worn = wornItems[slot];
                            return `
                                <div class="worn-slot ${worn ? 'worn' : 'empty'}" data-slot="${slot}">
                                    <div class="slot-label">
                                        ${slotIcons[slot] || '📦'} ${name}
                                    </div>
                                    ${worn ? `
                                        <div class="worn-item">
                                            <div class="worn-emoji">
                                                ${worn.image ? 
                                                    `<img src="${worn.image}" style="width: 40px; height: 40px;">` : 
                                                    `<span>${worn.emoji}</span>`
                                                }
                                            </div>
                                            <div class="worn-name">${worn.name}</div>
                                            <button class="btn-remove-wear" data-slot="${slot}">脱下</button>
                                        </div>
                                    ` : `
                                        <div class="empty-slot">未装备</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="inventory-tabs">
                    <button class="tab-btn active" data-tab="all">全部</button>
                    <button class="tab-btn" data-tab="accessory">配饰</button>
                    <button class="tab-btn" data-tab="weapon">武器</button>
                    <button class="tab-btn" data-tab="temporary">消耗品</button>
                </div>
                
                <div class="inventory-grid" id="inventoryGrid">
                    ${this.renderInventoryGrid(this.getAllItems())}
                </div>
            </div>
        `;
        
        // 绑定事件
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const type = e.target.dataset.tab;
                const items = type === 'all' 
                    ? this.getAllItems()
                    : this.getItemsByType(type);
                
                document.querySelector('#inventoryGrid').innerHTML = 
                    this.renderInventoryGrid(items);
                
                // 重新绑定穿戴按钮
                this.bindInventoryEvents(container, onWear);
            });
        });
        
        container.querySelectorAll('.btn-remove-wear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const slot = e.target.dataset.slot;
                this.removeItem(slot);
                this.renderInventory(container, onWear);
            });
        });
        
        this.bindInventoryEvents(container, onWear);
    }
    
    // 渲染库存网格
    renderInventoryGrid(items) {
        if (items.length === 0) {
            return '<div class="no-items">暂无物品，去商城逛逛吧~</div>';
        }
        
        const wornItems = this.getWornItems();
        
        return items.map(item => {
            const slot = item.type === 'accessory' ? item.category : 'weapon';
            const isWorn = wornItems[slot] && wornItems[slot].itemId === item.itemId;
            
            return `
                <div class="inventory-item ${item.type} ${isWorn ? 'worn' : ''}">
                    <div class="item-emoji" style="background: ${item.color}20">
                        ${item.image ? 
                            `<img src="${item.image}" style="width: 40px; height: 40px;">` : 
                            `<span style="font-size: 40px">${item.emoji}</span>`
                        }
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-type">${ITEM_TYPE_CONFIG[item.type].icon} ${ITEM_TYPE_CONFIG[item.type].name}</div>
                        <div class="item-purchase-time">购买：${this.formatDate(item.purchaseTime)}</div>
                        ${item.type !== 'temporary' ? `
                            <button class="btn-wear ${isWorn ? 'wearing' : ''}" data-id="${item.itemId}">
                                ${isWorn ? '已装备' : '装备'}
                            </button>
                        ` : `
                            <button class="btn-use" data-id="${item.itemId}">使用</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 绑定库存事件
    bindInventoryEvents(container, onWear) {
        container.querySelectorAll('.btn-wear:not(.wearing)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                if (onWear) {
                    onWear(itemId);
                }
            });
        });
        
        container.querySelectorAll('.btn-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                this.useItem(itemId);
            });
        });
    }
    
    // 使用消耗品
    useItem(itemId) {
        const item = this.userData.items.find(i => i.itemId === itemId);
        if (!item || item.type !== 'temporary') return;
        
        // 这里可以实现使用效果
        alert(`使用了 ${item.name}：${item.effect?.description || '特殊效果'}`);
        
        // 消耗品使用后删除
        const index = this.userData.items.findIndex(i => i.itemId === itemId);
        if (index !== -1) {
            this.userData.items.splice(index, 1);
            this.saveUserData();
        }
    }
    
    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        if (diff < 48 * 60 * 60 * 1000) {
            return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

// 导出
window.StudentItemMall = StudentItemMall;
window.UserItemManager = UserItemManager;
