// ClassPet Pro - 宠物图片系统

// 预设宠物图库
const PET_GALLERY = {
    cute: {
        name: '萌宠风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼崽', emoji: '🐱', color: '#98FB98' },
            { name: '成长期', emoji: '🐈', color: '#87CEEB' },
            { name: '完全体', emoji: '🐯', color: '#DDA0DD' }
        ]
    },
    fantasy: {
        name: '幻想风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼崽', emoji: '🐉', color: '#98FB98' },
            { name: '成长期', emoji: '🦕', color: '#87CEEB' },
            { name: '完全体', emoji: '🐲', color: '#DDA0DD' }
        ]
    },
    pixel: {
        name: '像素风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼崽', emoji: '🐤', color: '#98FB98' },
            { name: '成长期', emoji: '🐓', color: '#87CEEB' },
            { name: '完全体', emoji: '🦅', color: '#DDA0DD' }
        ]
    },
    scifi: {
        name: '科幻风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#E0E0E0' },
            { name: '幼崽', emoji: '🤖', color: '#00D4FF' },
            { name: '成长期', emoji: '👾', color: '#FF00FF' },
            { name: '完全体', emoji: '🚀', color: '#FFD700' }
        ]
    },
    china: {
        name: '国潮风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼崽', emoji: '🐼', color: '#FF6B6B' },
            { name: '成长期', emoji: '🦁', color: '#FFD93D' },
            { name: '完全体', emoji: '🐲', color: '#FF0000' }
        ]
    }
};

// 宠物图片管理器
class PetImageManager {
    constructor() {
        this.currentStyle = 'cute';
        this.customImages = this.loadCustomImages();
        this.init();
    }

    init() {
        this.loadSavedStyle();
    }

    // 加载保存的风格
    loadSavedStyle() {
        const saved = localStorage.getItem('classpet_pet_style');
        if (saved && PET_GALLERY[saved]) {
            this.currentStyle = saved;
        }
    }

    // 保存风格选择
    saveStyle(style) {
        this.currentStyle = style;
        localStorage.setItem('classpet_pet_style', style);
    }

    // 获取当前风格的宠物数据
    getCurrentPets() {
        const style = PET_GALLERY[this.currentStyle];
        return style.stages.map((stage, index) => {
            const custom = this.customImages[index];
            return {
                ...stage,
                image: custom ? custom.image : null,
                isCustom: !!custom
            };
        });
    }

    // 获取所有风格
    getAllStyles() {
        return Object.keys(PET_GALLERY).map(key => ({
            key,
            name: PET_GALLERY[key].name,
            preview: PET_GALLERY[key].stages[1].emoji // 用幼崽作为预览
        }));
    }

    // 上传自定义图片
    async uploadImage(stageIndex, file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('请上传图片文件'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                this.customImages[stageIndex] = {
                    image: imageData,
                    uploadedAt: Date.now()
                };
                this.saveCustomImages();
                resolve(imageData);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 删除自定义图片
    removeCustomImage(stageIndex) {
        delete this.customImages[stageIndex];
        this.saveCustomImages();
    }

    // 加载自定义图片
    loadCustomImages() {
        const saved = localStorage.getItem('classpet_custom_images');
        return saved ? JSON.parse(saved) : {};
    }

    // 保存自定义图片
    saveCustomImages() {
        localStorage.setItem('classpet_custom_images', JSON.stringify(this.customImages));
    }

    // 获取宠物显示内容
    getPetDisplay(stageName, size = 'normal') {
        const stageIndex = this.getStageIndex(stageName);
        const pets = this.getCurrentPets();
        const pet = pets[stageIndex];
        
        if (pet.image) {
            return `<img src="${pet.image}" class="pet-img pet-img-${size}" alt="${pet.name}">`;
        }
        return `<span class="pet-emoji pet-emoji-${size}">${pet.emoji}</span>`;
    }

    getStageIndex(stageName) {
        const stages = ['蛋', '幼崽', '成长期', '完全体'];
        return stages.indexOf(stageName);
    }

    // 渲染风格选择器
    renderStyleSelector(container) {
        const styles = this.getAllStyles();
        container.innerHTML = `
            <div class="style-selector">
                <h3>选择宠物风格</h3>
                <div class="style-grid">
                    ${styles.map(style => `
                        <div class="style-option ${this.currentStyle === style.key ? 'active' : ''}" 
                             data-style="${style.key}">
                            <div class="style-preview">${style.preview}</div>
                            <div class="style-name">${style.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="custom-upload">
                    <h4>自定义图片</h4>
                    <div class="upload-stages">
                        ${this.renderUploadStages()}
                    </div>
                </div>
            </div>
        `;

        // 绑定风格选择
        container.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', () => {
                const style = option.dataset.style;
                this.saveStyle(style);
                this.renderStyleSelector(container);
            });
        });

        // 绑定上传
        container.querySelectorAll('.upload-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                const stageIndex = parseInt(e.target.dataset.stage);
                const file = e.target.files[0];
                if (file) {
                    try {
                        await this.uploadImage(stageIndex, file);
                        this.renderStyleSelector(container);
                        alert('上传成功！');
                    } catch (err) {
                        alert('上传失败：' + err.message);
                    }
                }
            });
        });

        // 绑定删除
        container.querySelectorAll('.btn-remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stageIndex = parseInt(e.target.dataset.stage);
                this.removeCustomImage(stageIndex);
                this.renderStyleSelector(container);
            });
        });
    }

    renderUploadStages() {
        const stages = ['蛋', '幼崽', '成长期', '完全体'];
        return stages.map((stage, index) => {
            const custom = this.customImages[index];
            return `
                <div class="upload-stage">
                    <div class="stage-label">${stage}</div>
                    <div class="upload-preview">
                        ${custom ? 
                            `<img src="${custom.image}" class="preview-img">` : 
                            `<span class="preview-placeholder">点击上传</span>`
                        }
                    </div>
                    <input type="file" class="upload-input" data-stage="${index}" accept="image/*">
                    ${custom ? `<button class="btn-remove-image" data-stage="${index}">删除</button>` : ''}
                </div>
            `;
        }).join('');
    }
}

// 导出
window.PET_GALLERY = PET_GALLERY;
window.PetImageManager = PetImageManager;
