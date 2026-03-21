// ClassPet Pro - 教师端物品上传和管理系统

class TeacherItemUploader {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            onItemAdded: options.onItemAdded || (() => {}),
            onItemRemoved: options.onItemRemoved || (() => {}),
            ...options
        };
        this.itemDatabase = new ItemDatabaseManager();
        this.currentItemType = 'accessory';
        this.render();
    }
    
    // 渲染界面
    render() {
        this.container.innerHTML = `
            <div class="teacher-uploader">
                <div class="uploader-header">
                    <h2>🎨 物品上传管理</h2>
                    <div class="item-count">
                        📦 已上传：<span>${this.itemDatabase.getAllItems().length}</span> 件物品
                    </div>
                </div>
                
                <!-- 物品类型选择 -->
                <div class="item-type-selector">
                    <button class="type-btn ${this.currentItemType === 'accessory' ? 'active' : ''}" 
                            data-type="accessory">
                        🎒 配饰类
                    </button>
                    <button class="type-btn ${this.currentItemType === 'temporary' ? 'active' : ''}" 
                            data-type="temporary">
                        🧪 临时类
                    </button>
                    <button class="type-btn ${this.currentItemType === 'weapon' ? 'active' : ''}" 
                            data-type="weapon">
                        ⚔️ 武器类
                    </button>
                </div>
                
                <!-- 上传表单 -->
                <div class="upload-form-container">
                    <form id="itemUploadForm" class="upload-form">
                        <div class="form-section">
                            <h3>📝 基本信息</h3>
                            
                            <div class="form-group">
                                <label>物品名称 *</label>
                                <input type="text" name="name" required placeholder="输入物品名称">
                            </div>
                            
                            <div class="form-group">
                                <label>物品类型</label>
                                <select name="type" id="itemTypeSelect" disabled>
                                    <option value="accessory" selected>配饰类</option>
                                    <option value="temporary">临时类</option>
                                    <option value="weapon">武器类</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>子分类 *</label>
                                <select name="category" id="itemCategorySelect" required>
                                    <!-- 动态加载 -->
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>🎨 外观设置</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Emoji 图标</label>
                                    <input type="text" name="emoji" placeholder="📦" maxlength="2">
                                </div>
                                
                                <div class="form-group">
                                    <label>颜色</label>
                                    <input type="color" name="color" value="#3498DB">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>自定义图片</label>
                                <div class="image-upload-area">
                                    <input type="file" id="itemImageInput" accept="image/*" class="image-input">
                                    <div class="image-preview" id="imagePreview">
                                        <span class="preview-placeholder">点击上传图片或选择 Emoji</span>
                                    </div>
                                    <button type="button" class="btn-remove-image" id="removeImageBtn" style="display: none;">
                                        删除图片
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>💰 价格和稀有度</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>所需积分 *</label>
                                    <input type="number" name="points" required min="1" value="100">
                                </div>
                                
                                <div class="form-group">
                                    <label>稀有度 *</label>
                                    <select name="rarity" required>
                                        <option value="common">普通</option>
                                        <option value="rare">稀有</option>
                                        <option value="epic">史诗</option>
                                        <option value="legendary">传说</option>
                                        <option value="mythical">神话</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section" id="temporaryEffectSection" style="display: none;">
                            <h3>⚡ 临时物品效果</h3>
                            
                            <div class="form-group">
                                <label>效果描述</label>
                                <textarea name="effectDescription" rows="3" placeholder="例如：使用后积分 +50"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>持续时间（秒）</label>
                                <input type="number" name="duration" min="0" value="0" placeholder="0 表示立即生效">
                            </div>
                        </div>
                        
                        <div class="form-section" id="weaponStatsSection" style="display: none;">
                            <h3>⚔️ 武器属性</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>攻击力</label>
                                    <input type="number" name="attack" min="0" value="0">
                                </div>
                                
                                <div class="form-group">
                                    <label>魔法力</label>
                                    <input type="number" name="magic" min="0" value="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>📖 描述信息</h3>
                            
                            <div class="form-group">
                                <label>物品描述</label>
                                <textarea name="description" rows="3" placeholder="输入物品描述..."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-upload">⬆️ 上传物品</button>
                            <button type="reset" class="btn-reset">🔄 重置表单</button>
                        </div>
                    </form>
                </div>
                
                <!-- 已上传物品列表 -->
                <div class="uploaded-items-section">
                    <h3>📋 已上传物品</h3>
                    
                    <div class="items-filter">
                        <select id="filterType">
                            <option value="all">全部类型</option>
                            <option value="accessory">配饰类</option>
                            <option value="temporary">临时类</option>
                            <option value="weapon">武器类</option>
                        </select>
                        
                        <select id="filterRarity">
                            <option value="all">全部稀有度</option>
                            <option value="common">普通</option>
                            <option value="rare">稀有</option>
                            <option value="epic">史诗</option>
                            <option value="legendary">传说</option>
                            <option value="mythical">神话</option>
                        </select>
                        
                        <input type="text" id="searchInput" placeholder="搜索物品..." class="search-input">
                    </div>
                    
                    <div class="uploaded-items-grid" id="uploadedItemsGrid">
                        <!-- 动态加载 -->
                    </div>
                </div>
            </div>
        `;
        
        this.bindEvents();
        this.updateCategorySelect();
        this.renderUploadedItems();
    }
    
    // 绑定事件
    bindEvents() {
        // 类型选择
        this.container.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentItemType = e.target.dataset.type;
                this.updateCategorySelect();
                this.updateFormSections();
            });
        });
        
        // 表单提交
        const form = this.container.querySelector('#itemUploadForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload(new FormData(form));
        });
        
        // 图片上传
        const imageInput = this.container.querySelector('#itemImageInput');
        imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
        
        // 删除图片
        const removeImageBtn = this.container.querySelector('#removeImageBtn');
        removeImageBtn.addEventListener('click', () => {
            this.container.querySelector('#itemImageInput').value = '';
            this.container.querySelector('#imagePreview').innerHTML = 
                '<span class="preview-placeholder">点击上传图片或选择 Emoji</span>';
            removeImageBtn.style.display = 'none';
            this.previewImage = null;
        });
        
        // 筛选和搜索
        const filterType = this.container.querySelector('#filterType');
        const filterRarity = this.container.querySelector('#filterRarity');
        const searchInput = this.container.querySelector('#searchInput');
        
        filterType.addEventListener('change', () => this.renderUploadedItems());
        filterRarity.addEventListener('change', () => this.renderUploadedItems());
        searchInput.addEventListener('input', () => this.renderUploadedItems());
    }
    
    // 更新分类选择
    updateCategorySelect() {
        const categorySelect = this.container.querySelector('#itemCategorySelect');
        const typeSelect = this.container.querySelector('#itemTypeSelect');
        
        // 更新类型选择
        typeSelect.value = this.currentItemType;
        
        // 获取子分类
        let categories = {};
        if (this.currentItemType === 'accessory') {
            categories = ACCESSORY_SUBCATEGORIES;
        } else if (this.currentItemType === 'temporary') {
            categories = TEMPORARY_SUBCATEGORIES;
        } else if (this.currentItemType === 'weapon') {
            categories = WEAPON_SUBCATEGORIES;
        }
        
        // 填充选项
        categorySelect.innerHTML = Object.entries(categories).map(([key, value]) => `
            <option value="${key}">${this.itemDatabase.getCategoryName(key)}</option>
        `).join('');
        
        // 更新表单区域
        this.updateFormSections();
    }
    
    // 更新表单区域显示
    updateFormSections() {
        const temporarySection = this.container.querySelector('#temporaryEffectSection');
        const weaponSection = this.container.querySelector('#weaponStatsSection');
        
        temporarySection.style.display = this.currentItemType === 'temporary' ? 'block' : 'none';
        weaponSection.style.display = this.currentItemType === 'weapon' ? 'block' : 'none';
    }
    
    // 处理图片上传
    handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage = e.target.result;
            const preview = this.container.querySelector('#imagePreview');
            preview.innerHTML = `<img src="${this.previewImage}" class="preview-img">`;
            this.container.querySelector('#removeImageBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // 处理上传
    handleUpload(formData) {
        const itemData = {
            name: formData.get('name'),
            type: this.currentItemType,
            category: formData.get('category'),
            emoji: formData.get('emoji') || '📦',
            color: formData.get('color'),
            points: parseInt(formData.get('points')),
            rarity: formData.get('rarity'),
            description: formData.get('description'),
            image: this.previewImage,
            createdBy: 'teacher'
        };
        
        // 临时物品特殊字段
        if (this.currentItemType === 'temporary') {
            itemData.effect = {
                description: formData.get('effectDescription')
            };
            itemData.duration = parseInt(formData.get('duration')) || 0;
        }
        
        // 武器特殊字段
        if (this.currentItemType === 'weapon') {
            itemData.attack = parseInt(formData.get('attack')) || 0;
            itemData.magic = parseInt(formData.get('magic')) || 0;
        }
        
        // 添加到数据库
        const item = this.itemDatabase.addItem(itemData);
        
        // 触发回调
        this.options.onItemAdded(item);
        
        // 刷新列表
        this.renderUploadedItems();
        
        // 显示成功提示
        this.showSuccessToast(`成功上传物品：${item.name}`);
        
        // 重置表单
        this.container.querySelector('#itemUploadForm').reset();
        this.previewImage = null;
        this.container.querySelector('#imagePreview').innerHTML = 
            '<span class="preview-placeholder">点击上传图片或选择 Emoji</span>';
        this.container.querySelector('#removeImageBtn').style.display = 'none';
    }
    
    // 渲染已上传物品
    renderUploadedItems() {
        const grid = this.container.querySelector('#uploadedItemsGrid');
        const filterType = this.container.querySelector('#filterType').value;
        const filterRarity = this.container.querySelector('#filterRarity').value;
        const searchTerm = this.container.querySelector('#searchInput').value.toLowerCase();
        
        let items = this.itemDatabase.getAllItems();
        
        // 筛选
        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }
        
        if (filterRarity !== 'all') {
            items = items.filter(item => item.rarity === filterRarity);
        }
        
        if (searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (items.length === 0) {
            grid.innerHTML = '<div class="no-items">暂无物品</div>';
            return;
        }
        
        grid.innerHTML = items.map(item => {
            const rarityConfig = ITEM_RARITY_CONFIG[item.rarity];
            const typeConfig = ITEM_TYPE_CONFIG[item.type];
            
            return `
                <div class="uploaded-item-card ${item.rarity}" style="border-color: ${rarityConfig.borderColor}">
                    <div class="item-card-header">
                        <span class="item-type-badge" style="background: ${typeConfig.bgGradient}">
                            ${typeConfig.icon} ${typeConfig.name}
                        </span>
                        <button class="btn-delete-item" data-id="${item.id}">🗑️</button>
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
                            <div class="item-points">💰 ${item.points} 积分</div>
                        </div>
                    </div>
                    
                    <div class="item-card-footer">
                        <div class="item-created">
                            ${this.formatDate(item.createdAt)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定删除事件
        grid.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = e.target.dataset.id;
                this.deleteItem(itemId);
            });
        });
    }
    
    // 删除物品
    deleteItem(itemId) {
        if (!confirm('确定要删除这个物品吗？学生将无法再购买。')) {
            return;
        }
        
        const success = this.itemDatabase.removeItem(itemId);
        if (success) {
            this.options.onItemRemoved(itemId);
            this.renderUploadedItems();
            this.showSuccessToast('物品已删除');
        }
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
    
    // 获取物品数据库
    getDatabase() {
        return this.itemDatabase;
    }
}

// 导出
window.TeacherItemUploader = TeacherItemUploader;
