// ClassPet Pro - 作业类型分类系统
// 包含预设分类和自定义分类功能

class HomeworkCategoryManager {
    constructor() {
        this.categories = this.loadCategories();
        this.customCategories = this.loadCustomCategories();
    }

    // 预设分类
    getDefaultCategories() {
        return [
            {
                id: 'homework_practice',
                name: '课后练习',
                icon: '📝',
                description: '课后巩固练习作业',
                color: '#667eea'
            },
            {
                id: 'unit_test',
                name: '单元测验',
                icon: '📊',
                description: '单元知识检测',
                color: '#f44336'
            },
            {
                id: 'practical_work',
                name: '实践作业',
                icon: '🔧',
                description: '动手实践操作',
                color: '#4caf50'
            },
            {
                id: 'creative_work',
                name: '创意作业',
                icon: '🎨',
                description: '创意设计作品',
                color: '#ff9800'
            },
            {
                id: 'reading_task',
                name: '阅读任务',
                icon: '📚',
                description: '课外阅读任务',
                color: '#9c27b0'
            },
            {
                id: 'oral_practice',
                name: '口语练习',
                icon: '🗣️',
                description: '口语表达训练',
                color: '#00bcd4'
            },
            {
                id: 'writing_task',
                name: '写作任务',
                icon: '✍️',
                description: '写作练习作业',
                color: '#795548'
            },
            {
                id: 'project_work',
                name: '项目作业',
                icon: '📁',
                description: '综合性项目任务',
                color: '#607d8b'
            },
            {
                id: 'review_task',
                name: '复习任务',
                icon: '📖',
                description: '知识复习巩固',
                color: '#e91e63'
            },
            {
                id: 'group_work',
                name: '小组作业',
                icon: '👥',
                description: '团队协作任务',
                color: '#3f51b5'
            }
        ];
    }

    // 加载分类
    loadCategories() {
        const saved = localStorage.getItem('homework_categories');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('加载分类失败:', error);
            }
        }
        return this.getDefaultCategories();
    }

    // 加载自定义分类
    loadCustomCategories() {
        const saved = localStorage.getItem('homework_custom_categories');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('加载自定义分类失败:', error);
            }
        }
        return [];
    }

    // 保存分类
    saveCategories() {
        localStorage.setItem('homework_categories', JSON.stringify(this.categories));
    }

    // 保存自定义分类
    saveCustomCategories() {
        localStorage.setItem('homework_custom_categories', JSON.stringify(this.customCategories));
    }

    // 获取所有分类
    getAllCategories() {
        return [...this.categories, ...this.customCategories];
    }

    // 获取分类ByID
    getCategoryById(id) {
        const all = this.getAllCategories();
        return all.find(cat => cat.id === id);
    }

    // 添加自定义分类
    addCustomCategory(category) {
        const newCategory = {
            id: 'custom_' + Date.now(),
            name: category.name,
            icon: category.icon || '📋',
            description: category.description || '',
            color: category.color || '#667eea',
            isCustom: true,
            createdAt: Date.now()
        };

        this.customCategories.push(newCategory);
        this.saveCustomCategories();
        
        return newCategory;
    }

    // 更新自定义分类
    updateCustomCategory(id, updates) {
        const index = this.customCategories.findIndex(cat => cat.id === id);
        if (index !== -1) {
            this.customCategories[index] = {
                ...this.customCategories[index],
                ...updates,
                updatedAt: Date.now()
            };
            this.saveCustomCategories();
            return this.customCategories[index];
        }
        return null;
    }

    // 删除自定义分类
    deleteCustomCategory(id) {
        const index = this.customCategories.findIndex(cat => cat.id === id);
        if (index !== -1) {
            this.customCategories.splice(index, 1);
            this.saveCustomCategories();
            return true;
        }
        return false;
    }

    // 重置为默认分类
    resetToDefault() {
        this.categories = this.getDefaultCategories();
        this.customCategories = [];
        this.saveCategories();
        this.saveCustomCategories();
    }

    // 创建分类选择器HTML
    createCategorySelector(containerId, selectedId = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const allCategories = this.getAllCategories();
        
        container.innerHTML = `
            <div class="category-selector">
                <div class="category-header">
                    <h4>选择作业类型</h4>
                    <button class="btn-add-category" id="btnAddCategory">+ 添加类型</button>
                </div>
                
                <div class="category-grid">
                    ${allCategories.map(cat => `
                        <div class="category-item ${selectedId === cat.id ? 'selected' : ''}" 
                             data-id="${cat.id}"
                             style="border-color: ${cat.color}">
                            <div class="category-icon">${cat.icon}</div>
                            <div class="category-name">${cat.name}</div>
                            ${cat.isCustom ? '<button class="btn-delete-category" data-id="' + cat.id + '">✕</button>' : ''}
                        </div>
                    `).join('')}
                </div>
                
                <input type="hidden" id="selectedCategory" value="${selectedId || ''}">
            </div>
        `;

        this.setupCategorySelectorEvents(container);
    }

    // 设置分类选择器事件
    setupCategorySelectorEvents(container) {
        // 分类项点击
        container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete-category')) {
                    return;
                }
                
                // 移除其他选中状态
                container.querySelectorAll('.category-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // 设置当前选中
                item.classList.add('selected');
                
                // 更新隐藏输入
                const categoryId = item.dataset.id;
                document.getElementById('selectedCategory').value = categoryId;
            });
        });

        // 删除自定义分类
        container.querySelectorAll('.btn-delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.id;
                
                if (confirm('确定要删除这个分类吗？')) {
                    this.deleteCustomCategory(categoryId);
                    this.createCategorySelector(container.id);
                }
            });
        });

        // 添加新分类
        const btnAddCategory = container.querySelector('#btnAddCategory');
        if (btnAddCategory) {
            btnAddCategory.addEventListener('click', () => {
                this.showAddCategoryModal(container.id);
            });
        }
    }

    // 显示添加分类模态框
    showAddCategoryModal(containerId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'addCategoryModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>添加自定义类型</h3>
                    <button class="close-btn" id="closeAddCategoryModal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>类型名称 *</label>
                        <input type="text" id="categoryName" placeholder="例如：实验报告" required>
                    </div>
                    
                    <div class="form-group">
                        <label>图标</label>
                        <div class="icon-selector">
                            ${['📝', '📊', '🔧', '🎨', '📚', '🗣️', '✍️', '📁', '📖', '👥', '🔬', '💻', '🎯', '⭐', '💡', '🎪'].map(icon => `
                                <button type="button" class="icon-btn" data-icon="${icon}">${icon}</button>
                            `).join('')}
                        </div>
                        <input type="hidden" id="categoryIcon" value="📋">
                    </div>
                    
                    <div class="form-group">
                        <label>描述</label>
                        <textarea id="categoryDescription" placeholder="简短描述这个类型..." rows="2"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>颜色</label>
                        <input type="color" id="categoryColor" value="#667eea">
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancelAddCategory">取消</button>
                    <button class="btn-primary" id="confirmAddCategory">确定添加</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 图标选择
        modal.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('categoryIcon').value = btn.dataset.icon;
            });
        });

        // 关闭模态框
        modal.querySelector('#closeAddCategoryModal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelAddCategory').addEventListener('click', () => {
            modal.remove();
        });

        // 确认添加
        modal.querySelector('#confirmAddCategory').addEventListener('click', () => {
            const name = document.getElementById('categoryName').value.trim();
            const icon = document.getElementById('categoryIcon').value;
            const description = document.getElementById('categoryDescription').value.trim();
            const color = document.getElementById('categoryColor').value;

            if (!name) {
                alert('请输入类型名称');
                return;
            }

            const newCategory = this.addCustomCategory({
                name,
                icon,
                description,
                color
            });

            modal.remove();
            this.createCategorySelector(containerId, newCategory.id);
        });
    }
}

// 全局实例
window.HomeworkCategoryManager = HomeworkCategoryManager;