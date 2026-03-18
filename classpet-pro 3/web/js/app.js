// ClassPet Pro - 核心应用逻辑

// ==================== 配置 ====================
const CONFIG = {
    teacherPassword: '1234',
    stages: [
        { name: '蛋', minScore: 0, emoji: '🥚', color: '#FFE4B5', bgClass: 'stage-egg' },
        { name: '幼崽', minScore: 50, emoji: '🐣', color: '#98FB98', bgClass: 'stage-baby' },
        { name: '成长期', minScore: 150, emoji: '🦊', color: '#87CEEB', bgClass: 'stage-young' },
        { name: '完全体', minScore: 300, emoji: '🦁', color: '#DDA0DD', bgClass: 'stage-adult' }
    ],
    rewards: [
        { id: 1, name: '免作业券', cost: 100, stock: 5 },
        { id: 2, name: '座位选择权', cost: 200, stock: 2 },
        { id: 3, name: '班长体验日', cost: 300, stock: 1 }
    ]
};

// 学生名单
const STUDENT_NAMES = [
    '陈心然', '邓林染', '冯奕川', '黄妤泽', '蒋秉骞', '冷宇轩', '柳昱哲', '罗云天',
    '马倩汐', '潘希予', '蒲睿彤', '覃琳涵', '谭萱绮', '唐嘉彤', '唐梓博', '田馨',
    '王涵霓', '王贺铭', '王弘谦', '王梓诺', '卫兆恒', '吴稷', '徐子杰', '颜之恒',
    '叶城昊', '叶汐', '叶梓萱', '张星程', '张栩源', '张语汐', '张玉欣', '周铭熙',
    '周宣宏', '周彦卿', '朱宵霖', '曾馨媛', '庄子荀', '黄枢芃'
];

// ==================== 数据管理 ====================
class DataManager {
    constructor() {
        this.students = this.loadStudents();
        this.config = this.loadConfig();
    }

    loadStudents() {
        const saved = localStorage.getItem('classpet_students');
        if (saved) {
            return JSON.parse(saved);
        }
        // 初始化学生数据
        return STUDENT_NAMES.map((name, index) => ({
            id: index + 1,
            name: name,
            score: Math.floor(Math.random() * 200), // 随机初始分数用于测试
            rewards: [],
            createdAt: Date.now()
        }));
    }

    saveStudents() {
        localStorage.setItem('classpet_students', JSON.stringify(this.students));
    }

    loadConfig() {
        const saved = localStorage.getItem('classpet_config');
        return saved ? JSON.parse(saved) : CONFIG;
    }

    saveConfig() {
        localStorage.setItem('classpet_config', JSON.stringify(this.config));
    }

    getStudent(id) {
        return this.students.find(s => s.id === id);
    }

    updateScore(studentId, delta) {
        const student = this.getStudent(studentId);
        if (!student) return null;

        const oldScore = student.score;
        student.score = Math.max(0, student.score + delta);
        
        const oldStage = this.getStage(oldScore);
        const newStage = this.getStage(student.score);
        const evolved = oldStage.name !== newStage.name;

        this.saveStudents();
        
        return {
            student,
            delta,
            oldScore,
            newScore: student.score,
            evolved,
            oldStage,
            newStage
        };
    }

    getStage(score) {
        for (let i = this.config.stages.length - 1; i >= 0; i--) {
            if (score >= this.config.stages[i].minScore) {
                return this.config.stages[i];
            }
        }
        return this.config.stages[0];
    }

    getNextStage(score) {
        const currentStage = this.getStage(score);
        const currentIndex = this.config.stages.findIndex(s => s.name === currentStage.name);
        return this.config.stages[currentIndex + 1] || null;
    }

    getProgress(score) {
        const currentStage = this.getStage(score);
        const nextStage = this.getNextStage(score);
        
        if (!nextStage) return 100;
        
        const range = nextStage.minScore - currentStage.minScore;
        const progress = score - currentStage.minScore;
        return Math.min(100, Math.max(0, (progress / range) * 100));
    }

    getNeedScore(score) {
        const nextStage = this.getNextStage(score);
        if (!nextStage) return 0;
        return nextStage.minScore - score;
    }
}

// ==================== 音效管理 ====================
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.initSounds();
    }

    initSounds() {
        // 使用Web Audio API生成简单音效
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playScoreUp() {
        // 欢快的上升音
        this.playTone(523, 0.1); // C5
        setTimeout(() => this.playTone(659, 0.1), 50); // E5
        setTimeout(() => this.playTone(784, 0.2), 100); // G5
    }

    playScoreDown() {
        // 下降音
        this.playTone(392, 0.1); // G4
        setTimeout(() => this.playTone(329, 0.2), 50); // E4
    }

    playEvolution() {
        // 进化庆祝音效
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15), i * 100);
        });
    }

    playClick() {
        this.playTone(800, 0.05);
    }

    playSuccess() {
        this.playTone(880, 0.1);
        setTimeout(() => this.playTone(1109, 0.2), 100);
    }
}

// ==================== UI管理 ====================
class UIManager {
    constructor(dataManager, soundManager) {
        this.data = dataManager;
        this.sound = soundManager;
        this.currentStudentId = null;
        this.init();
    }

    init() {
        this.renderPetGrid();
        this.bindEvents();
    }

    renderPetGrid() {
        const grid = document.getElementById('petGrid');
        grid.innerHTML = '';

        this.data.students.forEach(student => {
            const stage = this.data.getStage(student.score);
            const card = document.createElement('div');
            card.className = 'pet-card';
            card.dataset.id = student.id;
            
            card.innerHTML = `
                <div class="pet-image-container ${stage.bgClass}">
                    <div class="pet-image" style="font-size: 50px;">${stage.emoji}</div>
                </div>
                <div class="student-name">${student.name}</div>
                <div class="score-display">${student.score}分</div>
                <div class="stage-badge ${stage.name === '蛋' ? 'egg' : stage.name === '幼崽' ? 'baby' : stage.name === '成长期' ? 'young' : 'adult'}">${stage.name}</div>
            `;

            card.addEventListener('click', () => this.openStudentModal(student.id));
            grid.appendChild(card);
        });
    }

    updatePetCard(studentId) {
        const student = this.data.getStudent(studentId);
        const card = document.querySelector(`.pet-card[data-id="${studentId}"]`);
        if (!card || !student) return;

        const stage = this.data.getStage(student.score);
        
        card.querySelector('.pet-image').textContent = stage.emoji;
        card.querySelector('.pet-image-container').className = `pet-image-container ${stage.bgClass}`;
        card.querySelector('.score-display').textContent = `${student.score}分`;
        
        const badge = card.querySelector('.stage-badge');
        badge.textContent = stage.name;
        badge.className = `stage-badge ${stage.name === '蛋' ? 'egg' : stage.name === '幼崽' ? 'baby' : stage.name === '成长期' ? 'young' : 'adult'}`;
    }

    openStudentModal(studentId) {
        this.currentStudentId = studentId;
        const student = this.data.getStudent(studentId);
        if (!student) return;

        const stage = this.data.getStage(student.score);
        const nextStage = this.data.getNextStage(student.score);
        const progress = this.data.getProgress(student.score);
        const needScore = this.data.getNeedScore(student.score);

        document.getElementById('detailName').textContent = student.name;
        document.getElementById('detailScore').textContent = student.score;
        document.getElementById('detailPetImage').textContent = stage.emoji;
        document.getElementById('detailPetImage').parentElement.className = `pet-display ${stage.bgClass}`;
        
        document.getElementById('currentStage').textContent = stage.name;
        document.getElementById('nextStage').textContent = nextStage ? nextStage.name : '已满级';
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('needScore').textContent = needScore > 0 ? needScore : '0';

        // 奖励列表
        const rewardsList = document.getElementById('rewardsList');
        if (student.rewards && student.rewards.length > 0) {
            rewardsList.innerHTML = student.rewards.map(r => 
                `<span class="reward-item">${r.name}</span>`
            ).join('');
        } else {
            rewardsList.innerHTML = '<span class="no-rewards">暂无奖励</span>';
        }

        document.getElementById('studentModal').classList.add('active');
        this.sound.playClick();
    }

    closeStudentModal() {
        document.getElementById('studentModal').classList.remove('active');
        this.currentStudentId = null;
    }

    showScoreAnimation(element, delta) {
        const rect = element.getBoundingClientRect();
        const anim = document.createElement('div');
        anim.className = `score-change ${delta > 0 ? 'up' : 'down'}`;
        anim.textContent = delta > 0 ? `+${delta}` : delta;
        anim.style.left = `${rect.left + rect.width / 2}px`;
        anim.style.top = `${rect.top}px`;
        document.body.appendChild(anim);
        
        setTimeout(() => anim.remove(), 1000);
    }

    showCelebration(student, newStage) {
        const modal = document.getElementById('celebrationModal');
        const petDiv = document.getElementById('celebrationPet');
        const textDiv = document.getElementById('celebrationText');

        petDiv.textContent = newStage.emoji;
        petDiv.style.background = `linear-gradient(135deg, ${newStage.color} 0%, white 100%)`;
        textDiv.textContent = `${student.name}的宠物进化成了${newStage.name}！`;

        modal.classList.add('active');
        this.sound.playEvolution();
    }

    bindEvents() {
        // 关闭弹窗
        document.getElementById('closeModal').addEventListener('click', () => this.closeStudentModal());
        document.getElementById('closeRedeem').addEventListener('click', () => {
            document.getElementById('redeemModal').classList.remove('active');
        });
        document.getElementById('btnCelebrate').addEventListener('click', () => {
            document.getElementById('celebrationModal').classList.remove('active');
        });

        // 加减分按钮
        document.querySelectorAll('.btn-score').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delta = parseInt(e.target.dataset.value);
                this.handleScoreChange(delta);
            });
        });

        // 教师模式
        document.getElementById('btnTeacher').addEventListener('click', () => {
            document.getElementById('teacherModal').classList.add('active');
            this.sound.playClick();
        });

        // 数字键盘
        this.bindNumpad();

        // 兑换奖励
        document.getElementById('btnRedeem').addEventListener('click', () => {
            this.openRedeemModal();
        });

        // 点击弹窗外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && !modal.classList.contains('celebration')) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    handleScoreChange(delta) {
        if (!this.currentStudentId) return;

        const result = this.data.updateScore(this.currentStudentId, delta);
        if (!result) return;

        // 更新UI
        document.getElementById('detailScore').textContent = result.newScore;
        this.updatePetCard(this.currentStudentId);

        // 动画效果
        const scoreValue = document.getElementById('detailScore');
        this.showScoreAnimation(scoreValue, delta);

        // 音效
        if (delta > 0) {
            this.sound.playScoreUp();
        } else {
            this.sound.playScoreDown();
        }

        // 检查进化
        if (result.evolved) {
            setTimeout(() => {
                this.showCelebration(result.student, result.newStage);
                this.openStudentModal(this.currentStudentId);
            }, 500);
        } else {
            // 更新进度条
            const progress = this.data.getProgress(result.newScore);
            const needScore = this.data.getNeedScore(result.newScore);
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('needScore').textContent = needScore > 0 ? needScore : '0';
        }
    }

    bindNumpad() {
        const passwordInput = document.getElementById('teacherPassword');
        let password = '';

        document.querySelectorAll('.numpad button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.textContent;
                
                if (val === 'C') {
                    password = '';
                } else if (val === '✓') {
                    this.checkPassword(password);
                    password = '';
                } else {
                    if (password.length < 4) {
                        password += val;
                    }
                }
                
                passwordInput.value = password;
            });
        });
    }

    checkPassword(password) {
        if (password === this.data.config.teacherPassword) {
            document.getElementById('teacherModal').classList.remove('active');
            document.getElementById('adminModal').classList.add('active');
            this.sound.playSuccess();
            password = '';
            document.getElementById('teacherPassword').value = '';
        } else {
            this.sound.playScoreDown();
            alert('密码错误！');
            password = '';
            document.getElementById('teacherPassword').value = '';
        }
    }

    openRedeemModal() {
        const student = this.data.getStudent(this.currentStudentId);
        if (!student) return;

        const list = document.getElementById('redeemList');
        list.innerHTML = this.data.config.rewards.map(reward => {
            const canAfford = student.score >= reward.cost;
            return `
                <div class="redeem-item ${canAfford ? '' : 'disabled'}">
                    <div class="redeem-info">
                        <span class="redeem-name">${reward.name}</span>
                        <span class="redeem-cost">${reward.cost}分</span>
                    </div>
                    <button class="btn-redeem-item" ${canAfford ? '' : 'disabled'} 
                            data-id="${reward.id}">
                        ${canAfford ? '兑换' : '积分不足'}
                    </button>
                </div>
            `;
        }).join('');

        // 绑定兑换按钮
        list.querySelectorAll('.btn-redeem-item:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = parseInt(e.target.dataset.id);
                this.handleRedeem(rewardId);
            });
        });

        document.getElementById('redeemModal').classList.add('active');
    }

    handleRedeem(rewardId) {
        const reward = this.data.config.rewards.find(r => r.id === rewardId);
        const student = this.data.getStudent(this.currentStudentId);
        
        if (!reward || !student || student.score < reward.cost) return;

        // 扣除积分
        student.score -= reward.cost;
        student.rewards.push({
            name: reward.name,
            redeemedAt: Date.now()
        });

        this.data.saveStudents();
        
        // 更新UI
        this.updatePetCard(this.currentStudentId);
        this.openStudentModal(this.currentStudentId);
        document.getElementById('redeemModal').classList.remove('active');
        
        this.sound.playSuccess();
        alert(`兑换成功！${student.name}获得了${reward.name}`);
    }
}

// ==================== 设备检测 ====================
function detectDevice() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return { isTouch, isMobile };
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    const device = detectDevice();
    const dataManager = new DataManager();
    
    // 初始化新的音频系统
    const gameAudio = new GameAudio();
    const bgmManager = new BGMManager(gameAudio);
    
    // 初始化宠物图片系统
    const petManager = new PetImageManager();
    
    // 根据设备类型初始化不同界面
    if (device.isMobile) {
        // 手机端：管理界面
        window.location.href = 'admin.html';
        return;
    }
    
    // 大屏端：展示界面
    const uiManager = new UIManager(dataManager, gameAudio, petManager);
    
    // 启动背景音乐
    bgmManager.start();

    // 暴露到全局供调试
    window.ClassPet = {
        data: dataManager,
        audio: gameAudio,
        bgm: bgmManager,
        pets: petManager,
        ui: uiManager,
        device: device
    };

    console.log('ClassPet Pro 大屏端已加载！');
    console.log('背景音乐已启动，点击页面任意处开启音效');
});
