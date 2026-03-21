// ClassPet Pro - 宠物图片系统 - 8 阶段进化版

// 8 阶段进化系统配置
const EVOLUTION_STAGES = {
    stage1: { 
        name: '幼宠期', 
        minScore: 0, 
        maxScore: 50,
        size: 50,
        frameColor: '#4CAF50',
        frameEffect: 'simple-glow',
        description: '刚破壳的幼小宠物，需要悉心照料'
    },
    stage2: { 
        name: '启蒙期', 
        minScore: 51, 
        maxScore: 150,
        size: 60,
        frameColor: '#2196F3',
        frameEffect: 'star-twinkle',
        description: '开始认识世界，对周围充满好奇'
    },
    stage3: { 
        name: '成长期', 
        minScore: 151, 
        maxScore: 300,
        size: 70,
        frameColor: '#FFC107',
        frameEffect: 'bounce-light',
        description: '快速成长阶段，活力四射'
    },
    stage4: { 
        name: '进化学', 
        minScore: 301, 
        maxScore: 500,
        size: 80,
        frameColor: '#FF9800',
        frameEffect: 'rotate-halo',
        description: '开始发生质的飞跃，潜能觉醒'
    },
    stage5: { 
        name: '精英期', 
        minScore: 501, 
        maxScore: 750,
        size: 90,
        frameColor: '#9C27B0',
        frameEffect: 'particle-burst',
        description: '超越普通宠物，展现非凡能力'
    },
    stage6: { 
        name: '大师期', 
        minScore: 751, 
        maxScore: 1000,
        size: 100,
        frameColor: '#FFD700',
        frameEffect: 'aura-wave',
        description: '达到大师境界，气场强大'
    },
    stage7: { 
        name: '传奇期', 
        minScore: 1001, 
        maxScore: 1500,
        size: 110,
        frameColor: '#E91E63',
        frameEffect: 'meteor-trail',
        description: '成为传奇存在，万众瞩目'
    },
    stage8: { 
        name: '神话期', 
        minScore: 1501,
        maxScore: Infinity,
        size: 120,
        frameColor: '#FF1493',
        frameEffect: 'divine-glory',
        description: '登峰造极，成为班级守护神'
    }
};

// 预设宠物图库 - 8 阶段版本
const PET_GALLERY = {
    cute: {
        name: '萌宠风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼宠期', emoji: '🐱', color: '#98FB98' },
            { name: '启蒙期', emoji: '🐰', color: '#FFB6C1' },
            { name: '成长期', emoji: '🐈', color: '#87CEEB' },
            { name: '进化学', emoji: '🦊', color: '#DDA0DD' },
            { name: '精英期', emoji: '🐼', color: '#FF69B4' },
            { name: '大师期', emoji: '🐯', color: '#FFD700' },
            { name: '传奇期', emoji: '🦄', color: '#FF1493' },
            { name: '神话期', emoji: '👑', color: '#FF69B4' }
        ]
    },
    fantasy: {
        name: '幻想风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼宠期', emoji: '🐉', color: '#98FB98' },
            { name: '启蒙期', emoji: '🦎', color: '#FFB6C1' },
            { name: '成长期', emoji: '🦕', color: '#87CEEB' },
            { name: '进化学', emoji: '🦖', color: '#DDA0DD' },
            { name: '精英期', emoji: '🐲', color: '#FF69B4' },
            { name: '大师期', emoji: '🐉', color: '#FFD700' },
            { name: '传奇期', emoji: '⚡', color: '#FF1493' },
            { name: '神话期', emoji: '🌟', color: '#FF69B4' }
        ]
    },
    pixel: {
        name: '像素风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼宠期', emoji: '🐤', color: '#98FB98' },
            { name: '启蒙期', emoji: '🐥', color: '#FFB6C1' },
            { name: '成长期', emoji: '🐓', color: '#87CEEB' },
            { name: '进化学', emoji: '🦜', color: '#DDA0DD' },
            { name: '精英期', emoji: '🦅', color: '#FF69B4' },
            { name: '大师期', emoji: '🦢', color: '#FFD700' },
            { name: '传奇期', emoji: '🦚', color: '#FF1493' },
            { name: '神话期', emoji: '✨🦅', color: '#FF69B4' }
        ]
    },
    scifi: {
        name: '科幻风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#E0E0E0' },
            { name: '幼宠期', emoji: '🤖', color: '#00D4FF' },
            { name: '启蒙期', emoji: '👾', color: '#FF00FF' },
            { name: '成长期', emoji: '🛸', color: '#00FF00' },
            { name: '进化学', emoji: '🛰️', color: '#FF9800' },
            { name: '精英期', emoji: '🚀', color: '#FFD700' },
            { name: '大师期', emoji: '⚡🤖', color: '#FF1493' },
            { name: '传奇期', emoji: '🌌🛸', color: '#E91E63' },
            { name: '神话期', emoji: '💫', color: '#FF69B4' }
        ]
    },
    china: {
        name: '国潮风',
        stages: [
            { name: '蛋', emoji: '🥚', color: '#FFE4B5' },
            { name: '幼宠期', emoji: '🐼', color: '#FF6B6B' },
            { name: '启蒙期', emoji: '🐨', color: '#FFD93D' },
            { name: '成长期', emoji: '🐯', color: '#FF0000' },
            { name: '进化学', emoji: '🦁', color: '#FFA500' },
            { name: '精英期', emoji: '🐲', color: '#FFD700' },
            { name: '大师期', emoji: '☯️🐲', color: '#FF1493' },
            { name: '传奇期', emoji: '🔥', color: '#E91E63' },
            { name: '神话期', emoji: '🌸🐲', color: '#FF69B4' }
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
        const stages = ['蛋', '幼宠期', '启蒙期', '成长期', '进化学', '精英期', '大师期', '传奇期', '神话期'];
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

// 进化阶段管理器
class EvolutionManager {
    constructor() {
        this.stages = EVOLUTION_STAGES;
    }

    // 根据积分获取当前阶段
    getStageByScore(score) {
        for (const key in this.stages) {
            const stage = this.stages[key];
            if (score >= stage.minScore && score <= stage.maxScore) {
                return {
                    key: key,
                    ...stage
                };
            }
        }
        // 默认返回神话期
        return {
            key: 'stage8',
            ...this.stages.stage8
        };
    }

    // 获取阶段索引
    getStageIndex(stageKey) {
        const keys = Object.keys(this.stages);
        return keys.indexOf(stageKey);
    }

    // 获取下一阶段
    getNextStage(currentKey) {
        const keys = Object.keys(this.stages);
        const currentIndex = keys.indexOf(currentKey);
        if (currentIndex < keys.length - 1) {
            return {
                key: keys[currentIndex + 1],
                ...this.stages[keys[currentIndex + 1]]
            };
        }
        return null; // 已经是最高阶段
    }

    // 计算进度百分比
    getProgressPercentage(score, currentStage) {
        const range = currentStage.maxScore - currentStage.minScore;
        const progress = score - currentStage.minScore;
        return Math.min(100, Math.max(0, (progress / range) * 100));
    }

    // 获取升级所需分数
    getScoreForNextStage(score, currentStage) {
        if (currentStage.maxScore === Infinity) {
            return 0; // 已经是最高阶段
        }
        return currentStage.maxScore - score;
    }

    // 获取阶段描述
    getStageDescription(stageKey) {
        const stage = this.stages[stageKey];
        return stage ? stage.description : '未知阶段';
    }

    // 渲染阶段显示
    renderStageDisplay(container, score, petEmoji) {
        const currentStage = this.getStageByScore(score);
        const nextStage = this.getNextStage(currentStage.key);
        const progress = this.getProgressPercentage(score, currentStage);
        const needScore = this.getScoreForNextStage(score, currentStage);

        container.innerHTML = `
            <div class="evolution-display">
                <div class="stage-info">
                    <div class="stage-name">${currentStage.name}</div>
                    <div class="stage-description">${currentStage.description}</div>
                </div>
                
                <div class="stage-visual" style="
                    width: ${currentStage.size}px;
                    height: ${currentStage.size}px;
                    border-color: ${currentStage.frameColor};
                    animation: ${currentStage.frameEffect} 3s infinite;
                ">
                    <div class="pet-emoji" style="font-size: ${currentStage.size * 0.6}px;">
                        ${petEmoji}
                    </div>
                </div>
                
                <div class="stage-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="
                            width: ${progress}%;
                            background: ${currentStage.frameColor};
                        "></div>
                    </div>
                    <div class="progress-text">
                        ${score} / ${currentStage.maxScore === Infinity ? '∞' : currentStage.maxScore} 分
                        ${needScore > 0 ? ` (还需 ${needScore} 分升级)` : ' (已达最高阶段)'}
                    </div>
                </div>
                
                ${nextStage ? `
                    <div class="next-stage-preview">
                        <div class="next-stage-label">下一阶段</div>
                        <div class="next-stage-name">${nextStage.name}</div>
                        <div class="next-stage-require">需要 ${nextStage.minScore} 分</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 创建进化特效
    createEvolutionEffect(container, fromStage, toStage) {
        const effect = document.createElement('div');
        effect.className = 'evolution-effect';
        effect.innerHTML = `
            <div class="evolution-light"></div>
            <div class="evolution-particles"></div>
            <div class="evolution-text">
                <div class="evolve-from">${fromStage.name}</div>
                <div class="evolve-arrow">→</div>
                <div class="evolve-to">${toStage.name}</div>
            </div>
        `;
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        container.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 3000);
    }
}

// 导出
window.PET_GALLERY = PET_GALLERY;
window.PetImageManager = PetImageManager;
window.EvolutionManager = EvolutionManager;
window.EVOLUTION_STAGES = EVOLUTION_STAGES;
