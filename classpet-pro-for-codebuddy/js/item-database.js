// ClassPet Pro - 扩展物品分类系统（配饰、临时、武器）

// 物品大类
const ITEM_CATEGORIES = {
    ACCESSORY: 'accessory',    // 配饰类
    TEMPORARY: 'temporary',    // 临时类（消耗品）
    WEAPON: 'weapon'          // 武器类
};

// 配饰子分类
const ACCESSORY_SUBCATEGORIES = {
    CLOTHES: 'clothes',        // 衣服
    SHOES: 'shoes',            // 鞋子
    HAT: 'hat',                // 帽子
    GLASSES: 'glasses',        // 眼镜
    HAIRPIN: 'hairpin',        // 发卡
    BAG: 'bag',                // 小背包
    JEWELRY: 'jewelry',        // 首饰
    BRACELET: 'bracelet'       // 手链
};

// 临时物品子分类
const TEMPORARY_SUBCATEGORIES = {
    FOOD: 'food',              // 食物
    POTION: 'potion',          // 药水
    TOOL: 'tool',              // 工具
    TICKET: 'ticket'           // 票券
};

// 武器子分类
const WEAPON_SUBCATEGORIES = {
    SWORD: 'sword',            // 剑
    WAND: 'wand',              // 法杖
    BOW: 'bow',                // 弓
    STAFF: 'staff',            // 权杖
    DAGGER: 'dagger'           // 匕首
};

// 稀有度配置（扩展版）
const ITEM_RARITY_CONFIG = {
    common: { 
        name: '普通', 
        color: '#95A5A6',
        borderColor: '#BDC3C7',
        multiplier: 1,
        bgGradient: 'linear-gradient(135deg, #95A5A6, #7F8C8D)'
    },
    rare: { 
        name: '稀有', 
        color: '#3498DB',
        borderColor: '#5DADE2',
        multiplier: 1.5,
        bgGradient: 'linear-gradient(135deg, #3498DB, #2980B9)'
    },
    epic: { 
        name: '史诗', 
        color: '#9B59B6',
        borderColor: '#BE85DC',
        multiplier: 2,
        bgGradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)'
    },
    legendary: { 
        name: '传说', 
        color: '#FFD700',
        borderColor: '#FFE082',
        multiplier: 3,
        bgGradient: 'linear-gradient(135deg, #FFD700, #F39C12)'
    },
    mythical: { 
        name: '神话', 
        color: '#FF69B4',
        borderColor: '#FF1493',
        multiplier: 5,
        bgGradient: 'linear-gradient(135deg, #FF69B4, #C71585)'
    }
};

// 物品类型配置
const ITEM_TYPE_CONFIG = {
    accessory: {
        name: '配饰类',
        icon: '🎒',
        canWear: true,         // 可以穿戴
        permanent: true,       // 永久拥有
        categories: ACCESSORY_SUBCATEGORIES
    },
    temporary: {
        name: '临时类',
        icon: '',
        canWear: false,        // 不可穿戴
        permanent: false,      // 消耗品
        categories: TEMPORARY_SUBCATEGORIES
    },
    weapon: {
        name: '武器类',
        icon: '⚔️',
        canWear: true,         // 可以装备
        permanent: true,       // 永久拥有
        categories: WEAPON_SUBCATEGORIES
    }
};

// 基础物品数据结构
class BaseItem {
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name || '未命名物品';
        this.type = config.type || 'accessory'; // accessory, temporary, weapon
        this.category = config.category || ''; // 子分类
        this.emoji = config.emoji || '📦';
        this.image = config.image || null; // 自定义图片（base64）
        this.color = config.color || '#FFFFFF';
        this.points = config.points || 100;
        this.rarity = config.rarity || 'common';
        this.description = config.description || '';
        this.createdAt = config.createdAt || Date.now();
        this.createdBy = config.createdBy || 'system';
        
        // 类型特定属性
        if (this.type === 'temporary') {
            this.effect = config.effect || {}; // 临时物品效果
            this.duration = config.duration || 0; // 持续时间（秒）
        } else if (this.type === 'weapon') {
            this.attack = config.attack || 0; // 攻击力
            this.magic = config.magic || 0; // 魔法力
        }
        
        // 穿戴属性
        if (this.canWear()) {
            this.wearSlot = config.wearSlot || this.getWearSlot();
        }
    }
    
    // 生成唯一 ID
    generateId() {
        const type = this.type || 'acc'; // 默认使用 accessory 的前缀
        const prefix = type.substring(0, 3);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 7);
        return `${prefix}_${timestamp}_${random}`;
    }
    
    // 是否可以穿戴/装备
    canWear() {
        const typeConfig = ITEM_TYPE_CONFIG[this.type];
        return typeConfig ? typeConfig.canWear : false;
    }
    
    // 是否是消耗品
    isConsumable() {
        const typeConfig = ITEM_TYPE_CONFIG[this.type];
        return typeConfig ? !typeConfig.permanent : false;
    }
    
    // 获取穿戴槽位
    getWearSlot() {
        if (this.type === 'accessory') {
            return this.category; // 配饰使用子分类作为槽位
        } else if (this.type === 'weapon') {
            return 'weapon'; // 武器使用统一槽位
        }
        return null;
    }
    
    // 转换为显示对象
    toDisplayObject() {
        const typeConfig = ITEM_TYPE_CONFIG[this.type];
        const rarityConfig = ITEM_RARITY_CONFIG[this.rarity];
        
        return {
            ...this,
            typeName: typeConfig ? typeConfig.name : this.type,
            typeIcon: typeConfig ? typeConfig.icon : '📦',
            rarityName: rarityConfig ? rarityConfig.name : this.rarity,
            canWear: this.canWear(),
            isConsumable: this.isConsumable()
        };
    }
}

// 物品管理器
class ItemDatabaseManager {
    constructor() {
        this.storageKey = 'classpet_item_database';
        this.database = this.loadDatabase();
    }
    
    // 加载物品数据库
    loadDatabase() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        
        // 初始化空数据库
        return {
            items: [],
            categories: {
                accessory: ACCESSORY_SUBCATEGORIES,
                temporary: TEMPORARY_SUBCATEGORIES,
                weapon: WEAPON_SUBCATEGORIES
            }
        };
    }
    
    // 保存数据库
    saveDatabase() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.database));
    }
    
    // 添加物品
    addItem(itemData) {
        const item = new BaseItem(itemData);
        this.database.items.push(item);
        this.saveDatabase();
        return item;
    }
    
    // 删除物品
    removeItem(itemId) {
        const index = this.database.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.database.items.splice(index, 1);
            this.saveDatabase();
            return true;
        }
        return false;
    }
    
    // 更新物品
    updateItem(itemId, updates) {
        const item = this.getItemById(itemId);
        if (item) {
            Object.assign(item, updates);
            this.saveDatabase();
            return item;
        }
        return null;
    }
    
    // 获取物品
    getItemById(itemId) {
        return this.database.items.find(item => item.id === itemId);
    }
    
    // 按类型获取物品
    getItemsByType(itemType) {
        return this.database.items.filter(item => item.type === itemType);
    }
    
    // 按分类获取物品
    getItemsByCategory(category) {
        return this.database.items.filter(item => item.category === category);
    }
    
    // 按稀有度获取物品
    getItemsByRarity(rarity) {
        return this.database.items.filter(item => item.rarity === rarity);
    }
    
    // 获取所有物品
    getAllItems() {
        return this.database.items;
    }
    
    // 搜索物品
    searchItems(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.database.items.filter(item => 
            item.name.toLowerCase().includes(lowerKeyword) ||
            item.description.toLowerCase().includes(lowerKeyword)
        );
    }
    
    // 获取分类名称
    getCategoryName(category) {
        const allCategories = {
            ...ACCESSORY_SUBCATEGORIES,
            ...TEMPORARY_SUBCATEGORIES,
            ...WEAPON_SUBCATEGORIES
        };
        
        const categoryNames = {
            clothes: '衣服',
            shoes: '鞋子',
            hat: '帽子',
            glasses: '眼镜',
            hairpin: '发卡',
            bag: '背包',
            jewelry: '首饰',
            bracelet: '手链',
            food: '食物',
            potion: '药水',
            tool: '工具',
            ticket: '票券',
            sword: '剑',
            wand: '法杖',
            bow: '弓',
            staff: '权杖',
            dagger: '匕首'
        };
        
        return categoryNames[category] || category;
    }
    
    // 清空数据库
    clearDatabase() {
        this.database.items = [];
        this.saveDatabase();
    }
}

// 导出
window.ITEM_CATEGORIES = ITEM_CATEGORIES;
window.ACCESSORY_SUBCATEGORIES = ACCESSORY_SUBCATEGORIES;
window.TEMPORARY_SUBCATEGORIES = TEMPORARY_SUBCATEGORIES;
window.WEAPON_SUBCATEGORIES = WEAPON_SUBCATEGORIES;
window.ITEM_RARITY_CONFIG = ITEM_RARITY_CONFIG;
window.ITEM_TYPE_CONFIG = ITEM_TYPE_CONFIG;
window.BaseItem = BaseItem;
window.ItemDatabaseManager = ItemDatabaseManager;
