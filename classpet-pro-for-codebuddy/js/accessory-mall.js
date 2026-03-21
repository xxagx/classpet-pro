// ClassPet Pro - 配饰商城系统

// 配饰分类
const ACCESSORY_CATEGORIES = {
    CLOTHES: 'clothes',      // 衣服
    SHOES: 'shoes',          // 鞋子
    HAT: 'hat',              // 帽子
    GLASSES: 'glasses',      // 眼镜
    HAIRPIN: 'hairpin',      // 发卡
    BAG: 'bag',              // 小背包
    JEWELRY: 'jewelry',      // 首饰
    BRACELET: 'bracelet'     // 手链
};

// 配饰商品数据库
const ACCESSORY_DATABASE = {
    // 衣服类
    clothes: [
        {
            id: 'cloth_001',
            name: '红色 T 恤',
            emoji: '👕',
            color: '#FF6B6B',
            points: 100,
            rarity: 'common',
            description: '经典的红色 T 恤，舒适百搭'
        },
        {
            id: 'cloth_002',
            name: '蓝色衬衫',
            emoji: '👔',
            color: '#4ECDC4',
            points: 150,
            rarity: 'common',
            description: '清爽的蓝色衬衫，适合正式场合'
        },
        {
            id: 'cloth_003',
            name: '粉色连衣裙',
            emoji: '👗',
            color: '#FF69B4',
            points: 300,
            rarity: 'rare',
            description: '优雅的粉色连衣裙，甜美可爱'
        },
        {
            id: 'cloth_004',
            name: '紫色卫衣',
            emoji: '🧥',
            color: '#9B59B6',
            points: 200,
            rarity: 'common',
            description: '时尚的紫色卫衣，休闲舒适'
        },
        {
            id: 'cloth_005',
            name: '金色礼服',
            emoji: '👘',
            color: '#FFD700',
            points: 800,
            rarity: 'legendary',
            description: '华丽的金色礼服，尊贵典雅'
        }
    ],
    
    // 鞋子类
    shoes: [
        {
            id: 'shoe_001',
            name: '白色运动鞋',
            emoji: '👟',
            color: '#FFFFFF',
            points: 120,
            rarity: 'common',
            description: '舒适的白色运动鞋，适合日常穿着'
        },
        {
            id: 'shoe_002',
            name: '红色靴子',
            emoji: '👢',
            color: '#E74C3C',
            points: 250,
            rarity: 'rare',
            description: '时尚的红色靴子，个性十足'
        },
        {
            id: 'shoe_003',
            name: '粉色凉鞋',
            emoji: '👡',
            color: '#FFB6C1',
            points: 180,
            rarity: 'common',
            description: '清凉的粉色凉鞋，夏日必备'
        },
        {
            id: 'shoe_004',
            name: '金色高跟鞋',
            emoji: '👠',
            color: '#FFD700',
            points: 500,
            rarity: 'epic',
            description: '华丽的金色高跟鞋，气场强大'
        }
    ],
    
    // 帽子类
    hat: [
        {
            id: 'hat_001',
            name: '蓝色棒球帽',
            emoji: '🧢',
            color: '#3498DB',
            points: 80,
            rarity: 'common',
            description: '休闲的蓝色棒球帽，青春活力'
        },
        {
            id: 'hat_002',
            name: '粉色蝴蝶结',
            emoji: '🎀',
            color: '#FFC0CB',
            points: 150,
            rarity: 'common',
            description: '可爱的粉色蝴蝶结，甜美加分'
        },
        {
            id: 'hat_003',
            name: '黄色草帽',
            emoji: '👒',
            color: '#F4D03F',
            points: 200,
            rarity: 'rare',
            description: '夏日风情的黄色草帽，度假必备'
        },
        {
            id: 'hat_004',
            name: '紫色魔法帽',
            emoji: '🧙♀️',
            color: '#9B59B6',
            points: 600,
            rarity: 'epic',
            description: '神秘的紫色魔法帽，充满魔力'
        },
        {
            id: 'hat_005',
            name: '金色皇冠',
            emoji: '👑',
            color: '#FFD700',
            points: 1000,
            rarity: 'legendary',
            description: '尊贵的金色皇冠，王者象征'
        }
    ],
    
    // 眼镜类
    glasses: [
        {
            id: 'glass_001',
            name: '黑色框架眼镜',
            emoji: '👓',
            color: '#2C3E50',
            points: 100,
            rarity: 'common',
            description: '经典的黑色框架眼镜，文艺范十足'
        },
        {
            id: 'glass_002',
            name: '粉色太阳镜',
            emoji: '🕶️',
            color: '#FFB6C1',
            points: 180,
            rarity: 'common',
            description: '时尚的粉色太阳镜，酷炫有型'
        },
        {
            id: 'glass_003',
            name: '蓝色墨镜',
            emoji: '🥽',
            color: '#5DADE2',
            points: 220,
            rarity: 'rare',
            description: '前卫的蓝色墨镜，未来感十足'
        },
        {
            id: 'glass_004',
            name: '金色单片眼镜',
            emoji: '🧐',
            color: '#FFD700',
            points: 450,
            rarity: 'epic',
            description: '复古的金色单片眼镜，绅士风范'
        }
    ],
    
    // 发卡类
    hairpin: [
        {
            id: 'hair_001',
            name: '红色发卡',
            emoji: '🎀',
            color: '#E74C3C',
            points: 60,
            rarity: 'common',
            description: '小巧的红色发卡，精致可爱'
        },
        {
            id: 'hair_002',
            name: '蓝色星星发卡',
            emoji: '⭐',
            color: '#3498DB',
            points: 120,
            rarity: 'common',
            description: '闪亮的蓝色星星发卡，梦幻迷人'
        },
        {
            id: 'hair_003',
            name: '粉色爱心发卡',
            emoji: '💗',
            color: '#FF69B4',
            points: 150,
            rarity: 'rare',
            description: '甜蜜的粉色爱心发卡，少女心爆棚'
        },
        {
            id: 'hair_004',
            name: '彩虹发卡套装',
            emoji: '🌈',
            color: '#FF6B6B',
            points: 350,
            rarity: 'epic',
            description: '绚丽的彩虹发卡套装，多彩多姿'
        }
    ],
    
    // 小背包类
    bag: [
        {
            id: 'bag_001',
            name: '粉色双肩包',
            emoji: '🎒',
            color: '#FFC0CB',
            points: 200,
            rarity: 'common',
            description: '实用的粉色双肩包，上学必备'
        },
        {
            id: 'bag_002',
            name: '棕色手提包',
            emoji: '👜',
            color: '#A0522D',
            points: 250,
            rarity: 'common',
            description: '优雅的棕色手提包，气质出众'
        },
        {
            id: 'bag_003',
            name: '紫色钱包',
            emoji: '👛',
            color: '#9B59B6',
            points: 150,
            rarity: 'common',
            description: '精致的紫色钱包，小巧便携'
        },
        {
            id: 'bag_004',
            name: '金色链条包',
            emoji: '💼',
            color: '#FFD700',
            points: 550,
            rarity: 'epic',
            description: '奢华的金色链条包，时尚百搭'
        }
    ],
    
    // 首饰类
    jewelry: [
        {
            id: 'jewel_001',
            name: '银色项链',
            emoji: '📿',
            color: '#C0C0C0',
            points: 300,
            rarity: 'rare',
            description: '优雅的银色项链，简约大方'
        },
        {
            id: 'jewel_002',
            name: '粉色珍珠项链',
            emoji: '🦪',
            color: '#FFB6C1',
            points: 450,
            rarity: 'epic',
            description: '高贵的粉色珍珠项链，气质典雅'
        },
        {
            id: 'jewel_003',
            name: '蓝色宝石吊坠',
            emoji: '💎',
            color: '#5DADE2',
            points: 600,
            rarity: 'epic',
            description: '璀璨的蓝色宝石吊坠，光彩夺目'
        },
        {
            id: 'jewel_004',
            name: '钻石项链',
            emoji: '🧿',
            color: '#FFFFFF',
            points: 1200,
            rarity: 'legendary',
            description: '稀有的钻石项链，奢华至极'
        }
    ],
    
    // 手链类
    bracelet: [
        {
            id: 'brace_001',
            name: '红色手绳',
            emoji: '🧵',
            color: '#E74C3C',
            points: 80,
            rarity: 'common',
            description: '传统的红色手绳，寓意吉祥'
        },
        {
            id: 'brace_002',
            name: '银色手链',
            emoji: '⛓️',
            color: '#C0C0C0',
            points: 180,
            rarity: 'common',
            description: '简约的银色手链，百搭时尚'
        },
        {
            id: 'brace_003',
            name: '粉色珠串手链',
            emoji: '📿',
            color: '#FFB6C1',
            points: 250,
            rarity: 'rare',
            description: '甜美的粉色珠串手链，温柔可人'
        },
        {
            id: 'brace_004',
            name: '金色手镯',
            emoji: '⌚',
            color: '#FFD700',
            points: 500,
            rarity: 'epic',
            description: '华丽的金色手镯，贵气十足'
        },
        {
            id: 'brace_005',
            name: '彩虹手环',
            emoji: '🌈',
            color: '#FF6B6B',
            points: 350,
            rarity: 'rare',
            description: '活力的彩虹手环，青春无限'
        }
    ]
};

// 稀有度配置
const RARITY_CONFIG = {
    common: { 
        name: '普通', 
        color: '#95A5A6',
        borderColor: '#BDC3C7',
        multiplier: 1
    },
    rare: { 
        name: '稀有', 
        color: '#3498DB',
        borderColor: '#5DADE2',
        multiplier: 1.5
    },
    epic: { 
        name: '史诗', 
        color: '#9B59B6',
        borderColor: '#BE85DC',
        multiplier: 2
    },
    legendary: { 
        name: '传说', 
        color: '#FFD700',
        borderColor: '#FFE082',
        multiplier: 3
    }
};

// 配饰商城管理器
class AccessoryMallManager {
    constructor() {
        this.database = ACCESSORY_DATABASE;
        this.categories = ACCESSORY_CATEGORIES;
        this.rarities = RARITY_CONFIG;
    }

    // 获取所有商品
    getAllAccessories() {
        const all = [];
        for (const category in this.database) {
            this.database[category].forEach(item => {
                all.push({
                    ...item,
                    categoryName: this.getCategoryName(category),
                    rarityName: this.rarities[item.rarity].name
                });
            });
        }
        return all;
    }

    // 按分类获取商品
    getAccessoriesByCategory(category) {
        if (!this.database[category]) {
            return [];
        }
        return this.database[category].map(item => ({
            ...item,
            categoryName: this.getCategoryName(category),
            rarityName: this.rarities[item.rarity].name
        }));
    }

    // 按稀有度筛选
    getAccessoriesByRarity(rarity) {
        const all = this.getAllAccessories();
        return all.filter(item => item.rarity === rarity);
    }

    // 获取分类名称
    getCategoryName(category) {
        const names = {
            clothes: '衣服',
            shoes: '鞋子',
            hat: '帽子',
            glasses: '眼镜',
            hairpin: '发卡',
            bag: '小背包',
            jewelry: '首饰',
            bracelet: '手链'
        };
        return names[category] || category;
    }

    // 根据 ID 获取商品
    getAccessoryById(id) {
        for (const category in this.database) {
            const item = this.database[category].find(acc => acc.id === id);
            if (item) {
                return {
                    ...item,
                    categoryName: this.getCategoryName(category),
                    rarityName: this.rarities[item.rarity].name
                };
            }
        }
        return null;
    }

    // 渲染商城界面
    renderMall(container, userPoints, onPurchase) {
        const allAccessories = this.getAllAccessories();
        
        container.innerHTML = `
            <div class="mall-container">
                <div class="mall-header">
                    <h2>🛍️ 配饰商城</h2>
                    <div class="user-points">
                        💰 当前积分：<span class="points-value">${userPoints}</span>
                    </div>
                </div>
                
                <div class="category-filter">
                    <button class="category-btn active" data-category="all">全部</button>
                    ${Object.keys(this.categories).map(key => `
                        <button class="category-btn" data-category="${this.categories[key]}">
                            ${this.getCategoryName(this.categories[key])}
                        </button>
                    `).join('')}
                </div>
                
                <div class="rarity-filter">
                    <button class="rarity-btn active" data-rarity="all">全部稀有度</button>
                    ${Object.keys(this.rarities).map(key => `
                        <button class="rarity-btn" data-rarity="${key}">
                            ${this.rarities[key].name}
                        </button>
                    `).join('')}
                </div>
                
                <div class="accessories-grid" id="accessoriesGrid">
                    ${this.renderAccessoriesGrid(allAccessories, userPoints)}
                </div>
            </div>
        `;

        // 绑定分类筛选
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.dataset.category;
                const filtered = category === 'all' 
                    ? allAccessories 
                    : this.getAccessoriesByCategory(category);
                
                const rarityFilter = container.querySelector('.rarity-btn.active').dataset.rarity;
                const finalFiltered = rarityFilter === 'all'
                    ? filtered
                    : filtered.filter(item => item.rarity === rarityFilter);
                
                document.getElementById('accessoriesGrid').innerHTML = 
                    this.renderAccessoriesGrid(finalFiltered, userPoints);
                
                // 重新绑定购买按钮
                this.bindPurchaseButtons(container, onPurchase);
            });
        });

        // 绑定稀有度筛选
        container.querySelectorAll('.rarity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.rarity-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const rarity = e.target.dataset.rarity;
                const categoryFilter = container.querySelector('.category-btn.active').dataset.category;
                
                let filtered = categoryFilter === 'all'
                    ? allAccessories
                    : this.getAccessoriesByCategory(categoryFilter);
                
                if (rarity !== 'all') {
                    filtered = filtered.filter(item => item.rarity === rarity);
                }
                
                document.getElementById('accessoriesGrid').innerHTML = 
                    this.renderAccessoriesGrid(filtered, userPoints);
                
                // 重新绑定购买按钮
                this.bindPurchaseButtons(container, onPurchase);
            });
        });

        // 绑定购买按钮
        this.bindPurchaseButtons(container, onPurchase);
    }

    // 渲染商品网格
    renderAccessoriesGrid(accessories, userPoints) {
        if (accessories.length === 0) {
            return '<div class="no-items">暂无商品</div>';
        }

        return accessories.map(item => {
            const canAfford = userPoints >= item.points;
            const rarityConfig = this.rarities[item.rarity];
            
            return `
                <div class="accessory-card ${item.rarity}" style="border-color: ${rarityConfig.borderColor}">
                    <div class="accessory-emoji" style="background: ${item.color}20">
                        <span style="font-size: 48px">${item.emoji}</span>
                    </div>
                    <div class="accessory-info">
                        <div class="accessory-name">${item.name}</div>
                        <div class="accessory-category">${item.categoryName}</div>
                        <div class="accessory-rarity" style="color: ${rarityConfig.color}">
                            ${item.rarityName}
                        </div>
                        <div class="accessory-description">${item.description}</div>
                        <div class="accessory-points">
                            💰 ${item.points} 积分
                        </div>
                        <button class="btn-purchase ${canAfford ? '' : 'disabled'}" 
                                data-id="${item.id}" 
                                ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? '购买' : '积分不足'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 绑定购买按钮
    bindPurchaseButtons(container, onPurchase) {
        container.querySelectorAll('.btn-purchase:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accessoryId = e.target.dataset.id;
                const accessory = this.getAccessoryById(accessoryId);
                if (accessory) {
                    onPurchase(accessory);
                }
            });
        });
    }
}

// 导出
window.ACCESSORY_DATABASE = ACCESSORY_DATABASE;
window.ACCESSORY_CATEGORIES = ACCESSORY_CATEGORIES;
window.RARITY_CONFIG = RARITY_CONFIG;
window.AccessoryMallManager = AccessoryMallManager;
