// ClassPet Pro - 统一数据管理器
// 提取自 app.js 和 admin.js 的 DataManager 类，合并功能

// 默认配置
const DEFAULT_CONFIG = {
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
    ],
    className: '二年级一班'
};

// 默认学生名单
const DEFAULT_STUDENTS = [
    '陈心然', '邓林染', '冯奕川', '黄妤泽', '蒋秉骞', '冷宇轩', '柳昱哲', '罗云天',
    '马倩汐', '潘希予', '蒲睿彤', '覃琳涵', '谭萱绮', '唐嘉彤', '唐梓博', '田馨',
    '王涵霓', '王贺铭', '王弘谦', '王梓诺', '卫兆恒', '吴稷', '徐子杰', '颜之恒',
    '叶城昊', '叶汐', '叶梓萱', '张星程', '张栩源', '张语汐', '张玉欣', '周铭熙',
    '周宣宏', '周彦卿', '朱宵霖', '曾馨媛', '庄子荀', '黄枢芃'
];

class DataManager {
    constructor(autoInit = true) {
        this.config = this.loadConfig();
        this.students = autoInit ? this.loadStudents() : [];
    }

    // 加载配置
    loadConfig() {
        const saved = localStorage.getItem('classpet_config');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    }

    // 保存配置
    saveConfig() {
        localStorage.setItem('classpet_config', JSON.stringify(this.config));
    }

    // 加载学生数据
    loadStudents() {
        const saved = localStorage.getItem('classpet_students');
        if (saved) {
            const students = JSON.parse(saved);
            // 数据修复：确保学生姓名与默认列表一致
            this.students = this.repairStudentData(students);
            this.saveStudents();
            return this.students;
        }
        
        // 如果没有数据，初始化默认学生
        const defaultStudents = DEFAULT_STUDENTS.map((name, index) => ({
            id: index + 1,
            name: name,
            score: Math.floor(Math.random() * 100),
            rewards: [],
            pet: this.initDefaultPet(),
            createdAt: Date.now()
        }));
        
        this.students = defaultStudents;
        this.saveStudents();
        return defaultStudents;
    }

    // 修复学生数据，确保姓名一致
    repairStudentData(students) {
        // 检查是否有姓名不一致的情况
        let needsRepair = false;
        
        students.forEach((student, index) => {
            // 如果学生ID在默认列表范围内，确保姓名正确
            if (index < DEFAULT_STUDENTS.length) {
                const correctName = DEFAULT_STUDENTS[index];
                if (student.name !== correctName) {
                    console.log(`修复学生姓名: "${student.name}" -> "${correctName}"`);
                    student.name = correctName;
                    needsRepair = true;
                }
            }
            
            // 确保每个学生都有宠物数据
            if (!student.pet) {
                student.pet = this.initDefaultPet();
                needsRepair = true;
            }
            
            // 确保宠物有状态数据
            if (!student.pet.stats) {
                student.pet.stats = {
                    hunger: 50,
                    happiness: 50,
                    energy: 50,
                    lastFeedTime: Date.now(),
                    lastPlayTime: Date.now(),
                    lastRestTime: Date.now()
                };
                needsRepair = true;
            }
        });
        
        if (needsRepair) {
            console.log('学生数据已修复');
        }
        
        return students;
    }

    // 保存学生数据
    saveStudents() {
        localStorage.setItem('classpet_students', JSON.stringify(this.students));
    }

    // 初始化默认宠物
    initDefaultPet() {
        // 随机选择一个免费宠物
        const freePets = PET_DATABASE.filter(p => p.cost === 0);
        const randomPet = freePets[Math.floor(Math.random() * freePets.length)];

        return {
            petId: randomPet.id,
            customImage: null,
            customImageEnabled: false,
            stats: {
                hunger: 50,
                happiness: 50,
                energy: 50,
                lastFeedTime: Date.now(),
                lastPlayTime: Date.now(),
                lastRestTime: Date.now()
            }
        };
    }

    // 获取学生
    getStudent(id) {
        // 转换为数字进行比较
        const numericId = Number(id);
        return this.students.find(s => Number(s.id) === numericId);
    }

    // 获取学生（别名方法，兼容 mobile.js 调用）
    getStudentById(id) {
        // 转换为数字进行比较
        const numericId = Number(id);
        return this.students.find(s => Number(s.id) === numericId);
    }

    // 保存数据（别名方法，兼容 mobile.js 调用）
    save() {
        this.saveStudents();
    }

    // 获取所有宠物列表
    getAllPets() {
        return window.PET_DATABASE || [];
    }

    // 获取宠物信息（兼容 mobile.js 调用）
    getPetById(petId) {
        if (window.getPetById) {
            return window.getPetById(petId);
        }
        return null;
    }

    // 更新学生分数
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

    // 获取学生当前阶段
    getStage(score) {
        for (let i = this.config.stages.length - 1; i >= 0; i--) {
            if (score >= this.config.stages[i].minScore) {
                return this.config.stages[i];
            }
        }
        return this.config.stages[0];
    }

    // 获取下一个阶段
    getNextStage(score) {
        const currentStage = this.getStage(score);
        const currentIndex = this.config.stages.findIndex(s => s.name === currentStage.name);
        return this.config.stages[currentIndex + 1] || null;
    }

    // 获取进化进度百分比
    getProgress(score) {
        const currentStage = this.getStage(score);
        const nextStage = this.getNextStage(score);
        
        if (!nextStage) return 100;
        
        const range = nextStage.minScore - currentStage.minScore;
        const progress = score - currentStage.minScore;
        return Math.min(100, Math.max(0, (progress / range) * 100));
    }

    // 获取还需要多少分升级
    getNeedScore(score) {
        const nextStage = this.getNextStage(score);
        if (!nextStage) return 0;
        return nextStage.minScore - score;
    }

    // 添加学生 (admin.js 中的功能)
    addStudent(name) {
        const newStudent = {
            id: Date.now(),
            name: name,
            score: 0,
            rewards: [],
            pet: {
                hunger: 50,      // 饱食度 0-100
                happiness: 50,   // 开心值 0-100
                energy: 50,       // 精力值 0-100
                lastFeedTime: Date.now(),
                lastPlayTime: Date.now(),
                lastRestTime: Date.now()
            },
            createdAt: Date.now()
        };
        this.students.push(newStudent);
        this.saveStudents();
        return newStudent;
    }

    // 喂食宠物
    feedPet(studentId) {
        const student = this.getStudent(studentId);
        if (!student) return null;

        // 初始化宠物数据（兼容旧数据）
        if (!student.pet) {
            student.pet = this.initDefaultPet();
        }

        // 喂食效果
        const hungerIncrease = 20;
        const happinessIncrease = 5;
        const energyIncrease = 5;

        student.pet.stats.hunger = Math.min(100, student.pet.stats.hunger + hungerIncrease);
        student.pet.stats.happiness = Math.min(100, student.pet.stats.happiness + happinessIncrease);
        student.pet.stats.energy = Math.min(100, student.pet.stats.energy + energyIncrease);
        student.pet.stats.lastFeedTime = Date.now();

        this.saveStudents();

        return {
            student,
            hunger: student.pet.stats.hunger,
            happiness: student.pet.stats.happiness,
            energy: student.pet.stats.energy
        };
    }

    // 和宠物玩耍
    playWithPet(studentId) {
        const student = this.getStudent(studentId);
        if (!student) return null;

        // 初始化宠物数据
        if (!student.pet) {
            student.pet = this.initDefaultPet();
        }

        // 玩耍需要消耗能量，但增加开心值
        const happinessIncrease = 20;
        const energyDecrease = 15;
        const hungerDecrease = 10;

        student.pet.stats.happiness = Math.min(100, student.pet.stats.happiness + happinessIncrease);
        student.pet.stats.energy = Math.max(0, student.pet.stats.energy - energyDecrease);
        student.pet.stats.hunger = Math.max(0, student.pet.stats.hunger - hungerDecrease);
        student.pet.stats.lastPlayTime = Date.now();

        this.saveStudents();

        return {
            student,
            hunger: student.pet.stats.hunger,
            happiness: student.pet.stats.happiness,
            energy: student.pet.stats.energy
        };
    }

    // 让宠物休息
    restPet(studentId) {
        const student = this.getStudent(studentId);
        if (!student) return null;

        // 初始化宠物数据
        if (!student.pet) {
            student.pet = this.initDefaultPet();
        }

        // 休息恢复能量，但略微降低饱食度
        const energyIncrease = 30;
        const hungerDecrease = 5;

        student.pet.stats.energy = Math.min(100, student.pet.stats.energy + energyIncrease);
        student.pet.stats.hunger = Math.max(0, student.pet.stats.hunger - hungerDecrease);
        student.pet.stats.lastRestTime = Date.now();

        this.saveStudents();

        return {
            student,
            hunger: student.pet.stats.hunger,
            happiness: student.pet.stats.happiness,
            energy: student.pet.stats.energy
        };
    }

    // 获取宠物状态文字描述
    getPetStatusText(student) {
        if (!student.pet || !student.pet.stats) {
            return {
                status: '正常',
                advice: '好好照顾你的宠物吧！'
            };
        }

        const { hunger, happiness, energy } = student.pet.stats;

        // 饥饿状态
        if (hunger < 20) {
            return {
                status: '🍽️ 饿了',
                advice: '快喂它吃点东西吧！',
                urgent: true
            };
        }

        // 累了状态
        if (energy < 20) {
            return {
                status: '😴 累了',
                advice: '让它休息一下吧',
                urgent: true
            };
        }

        // 不开心状态
        if (happiness < 30) {
            return {
                status: '😢 不开心',
                advice: '和它玩一会儿吧',
                urgent: false
            };
        }

        // 快乐状态
        if (happiness >= 80 && hunger >= 60 && energy >= 60) {
            return {
                status: '😊 开心',
                advice: '状态很好哦！',
                urgent: false
            };
        }

        return {
            status: '🙂 正常',
            advice: '继续保持~',
            urgent: false
        };
    }

    // 更新所有宠物状态（模拟时间流逝）
    updateAllPetStatus() {
        const now = Date.now();
        const hoursSinceUpdate = 1; // 每次调用模拟1小时

        this.students.forEach(student => {
            if (!student.pet || !student.pet.stats) return;

            // 自然消耗
            student.pet.stats.hunger = Math.max(0, student.pet.stats.hunger - 5 * hoursSinceUpdate);
            student.pet.stats.happiness = Math.max(0, student.pet.stats.happiness - 3 * hoursSinceUpdate);
            student.pet.stats.energy = Math.max(0, student.pet.stats.energy - 2 * hoursSinceUpdate);
        });

        this.saveStudents();
    }

    // 更新学生信息
    updateStudent(id, updates) {
        const student = this.getStudent(id);
        if (!student) return null;
        
        Object.assign(student, updates);
        this.saveStudents();
        return student;
    }

    // 删除学生
    deleteStudent(id) {
        this.students = this.students.filter(s => s.id !== id);
        this.saveStudents();
    }

    // 导出为 CSV 格式
    exportToCSV() {
        const headers = ['姓名', '当前积分', '当前阶段', '已获得奖励'];
        const rows = this.students.map(s => {
            const stage = this.getStage(s.score);
            const rewards = s.rewards.map(r => r.name).join('; ') || '无';
            return [s.name, s.score, stage.name, rewards];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // 导出为 JSON 格式
    exportToJSON() {
        return JSON.stringify({
            config: this.config,
            students: this.students,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    // 备份数据
    backupData() {
        const backup = {
            config: this.config,
            students: this.students,
            timestamp: Date.now()
        };
        localStorage.setItem('classpet_backup_' + Date.now(), JSON.stringify(backup));
        return backup;
    }

    // 恢复数据
    restoreData(backup) {
        if (backup.config) this.config = backup.config;
        if (backup.students) this.students = backup.students;
        
        this.saveConfig();
        this.saveStudents();
        return true;
    }

    // 获取班级信息
    getClassInfo() {
        return {
            name: this.config.className || '二年级一班',
            count: this.students.length,
            totalScore: this.students.reduce((sum, s) => sum + s.score, 0),
            averageScore: Math.round(this.students.reduce((sum, s) => sum + s.score, 0) / this.students.length) || 0
        };
    }
    
    // 获取所有学生数据
    getAllStudents() {
        return this.students;
    }
}

// 导出
window.DataManager = DataManager;
window.DEFAULT_CONFIG = DEFAULT_CONFIG;