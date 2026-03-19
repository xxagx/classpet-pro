// ClassPet Pro - 学生积分与宠物状态管理系统
// 实现积分管理、饥饿状态计算、状态同步等功能

// ==================== 数据模型定义 ====================

// 饥饿状态枚举
const HungerStatus = {
    HEALTHY: 'healthy',
    HUNGRY: 'hungry',
    DIZZY: 'dizzy',
    DYING: 'dying',
    DEAD: 'dead'
};

// 饥饿状态配置映射
const HUNGER_STATUS_CONFIG = {
    [HungerStatus.HEALTHY]: {
        text: '活力满满 😊',
        cssClass: 'pet-healthy',
        minDays: 0,
        maxDays: 0
    },
    [HungerStatus.HUNGRY]: {
        text: '好饿呀 🥺',
        cssClass: 'pet-hungry',
        minDays: 1,
        maxDays: 2
    },
    [HungerStatus.DIZZY]: {
        text: '快饿晕了 😵',
        cssClass: 'pet-dizzy',
        minDays: 3,
        maxDays: 4,
        scorePenalty: 5
    },
    [HungerStatus.DYING]: {
        text: '快要饿死了 💀',
        cssClass: 'pet-dying',
        minDays: 5,
        maxDays: 6,
        scorePenalty: 10
    },
    [HungerStatus.DEAD]: {
        text: '饿晕了 ❌',
        cssClass: 'pet-dead',
        minDays: 7,
        maxDays: Infinity,
        resetPet: true
    }
};

// ==================== 学生数据模型 ====================

class StudentModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.score = data.score || 0;
        this.lastScoreTime = data.lastScoreTime || new Date().toISOString();
        this.consecutiveDaysWithoutScore = data.consecutiveDaysWithoutScore || 0;
        this.rewards = data.rewards || [];
        this.createdAt = data.createdAt || Date.now();
    }

    toJSONObject() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            lastScoreTime: this.lastScoreTime,
            consecutiveDaysWithoutScore: this.consecutiveDaysWithoutScore,
            rewards: this.rewards,
            createdAt: this.createdAt
        };
    }

    static fromJSONObject(json) {
        return new StudentModel(json);
    }
}

// ==================== 宠物数据模型 ====================

class PetModel {
    constructor(data = {}) {
        this.petId = data.petId || 1;
        this.petName = data.petName || '小宠物';
        this.baseEmoji = data.baseEmoji || '🥚';
        this.hungerStatus = data.hungerStatus || HungerStatus.HEALTHY;
        this.hungerText = data.hungerText || HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].text;
        this.statusClass = data.statusClass || HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].cssClass;
        this.customImage = data.customImage || null;
        this.customImageEnabled = data.customImageEnabled || false;
        this.isAdopted = data.isAdopted !== undefined ? data.isAdopted : true;
        this.stats = data.stats || {
            hunger: 50,
            happiness: 50,
            energy: 50,
            lastFeedTime: Date.now(),
            lastPlayTime: Date.now(),
            lastRestTime: Date.now()
        };
    }

    toJSONObject() {
        return {
            petId: this.petId,
            petName: this.petName,
            baseEmoji: this.baseEmoji,
            hungerStatus: this.hungerStatus,
            hungerText: this.hungerText,
            statusClass: this.statusClass,
            customImage: this.customImage,
            customImageEnabled: this.customImageEnabled,
            isAdopted: this.isAdopted,
            stats: this.stats
        };
    }

    static fromJSONObject(json) {
        return new PetModel(json);
    }
}

// ==================== 积分与宠物状态管理器 ====================

class ScorePetManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.init();
    }

    init() {
        this.migrateDataIfNeeded();
        this.updateAllStudentsStatus();
    }

    // 数据迁移：为现有数据添加新字段
    migrateDataIfNeeded() {
        const students = this.dataManager.students;
        let needsSave = false;

        students.forEach(student => {
            if (!student.lastScoreTime) {
                student.lastScoreTime = new Date().toISOString();
                needsSave = true;
            }
            if (student.consecutiveDaysWithoutScore === undefined) {
                student.consecutiveDaysWithoutScore = 0;
                needsSave = true;
            }
            if (!student.pet) {
                student.pet = this.createDefaultPet();
                needsSave = true;
            }
            if (student.pet.hungerStatus === undefined) {
                student.pet.hungerStatus = HungerStatus.HEALTHY;
                student.pet.hungerText = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].text;
                student.pet.statusClass = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].cssClass;
                student.pet.isAdopted = true;
                needsSave = true;
            }
        });

        if (needsSave) {
            this.dataManager.saveStudents();
        }
    }

    // 创建默认宠物
    createDefaultPet() {
        const freePets = (window.PET_DATABASE || []).filter(p => p.cost === 0);
        const randomPet = freePets.length > 0 
            ? freePets[Math.floor(Math.random() * freePets.length)]
            : { id: 1, name: '小宠物', emoji: '🥚' };

        return new PetModel({
            petId: randomPet.id,
            petName: randomPet.name || '小宠物',
            baseEmoji: randomPet.emoji || '🥚'
        }).toJSONObject();
    }

    // ==================== 核心业务逻辑 ====================

    // 计算连续未加分天数
    calculateDaysWithoutScore(lastScoreTime) {
        const lastTime = new Date(lastScoreTime).getTime();
        const now = Date.now();
        const diffMs = now - lastTime;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // 根据天数获取饥饿状态
    getHungerStatusByDays(days) {
        if (days === 0) {
            return HungerStatus.HEALTHY;
        } else if (days >= 1 && days <= 2) {
            return HungerStatus.HUNGRY;
        } else if (days >= 3 && days <= 4) {
            return HungerStatus.DIZZY;
        } else if (days >= 5 && days <= 6) {
            return HungerStatus.DYING;
        } else {
            return HungerStatus.DEAD;
        }
    }

    // 获取状态配置
    getStatusConfig(status) {
        return HUNGER_STATUS_CONFIG[status] || HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY];
    }

    // 更新学生宠物状态
    updateStudentPetStatus(student) {
        const days = this.calculateDaysWithoutScore(student.lastScoreTime);
        student.consecutiveDaysWithoutScore = days;

        const status = this.getHungerStatusByDays(days);
        const config = this.getStatusConfig(status);

        if (!student.pet) {
            student.pet = this.createDefaultPet();
        }

        student.pet.hungerStatus = status;
        student.pet.hungerText = config.text;
        student.pet.statusClass = config.cssClass;

        // 处理积分惩罚
        if (config.scorePenalty && !student.pet.penaltyApplied) {
            student.score = Math.max(0, student.score - config.scorePenalty);
            student.pet.penaltyApplied = true;
        }

        // 处理宠物死亡
        if (config.resetPet && !student.pet.deathApplied) {
            student.pet.isAdopted = false;
            student.pet.deathApplied = true;
        }

        return student;
    }

    // 更新所有学生状态
    updateAllStudentsStatus() {
        const students = this.dataManager.students;
        students.forEach(student => {
            this.updateStudentPetStatus(student);
        });
        this.dataManager.saveStudents();
    }

    // ==================== 加分操作 ====================

    // 给学生加分（核心方法）
    addScore(studentId, points = 10, reason = '表现优秀') {
        const student = this.dataManager.getStudent(studentId);
        if (!student) {
            return {
                success: false,
                error: '学生不存在'
            };
        }

        const oldScore = student.score;
        const oldStatus = student.pet ? student.pet.hungerStatus : HungerStatus.HEALTHY;

        // 1. 增加积分
        student.score = Math.max(0, student.score + points);

        // 2. 更新最后一次加分时间
        student.lastScoreTime = new Date().toISOString();

        // 3. 重置连续未加分天数
        student.consecutiveDaysWithoutScore = 0;

        // 4. 重置宠物状态为健康
        if (student.pet) {
            student.pet.hungerStatus = HungerStatus.HEALTHY;
            student.pet.hungerText = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].text;
            student.pet.statusClass = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].cssClass;
            student.pet.penaltyApplied = false;
            student.pet.deathApplied = false;
            
            // 如果宠物死亡了，复活它
            if (!student.pet.isAdopted) {
                student.pet.isAdopted = true;
            }
        }

        // 保存数据
        this.dataManager.saveStudents();

        // 获取阶段信息
        const oldStage = this.dataManager.getStage(oldScore);
        const newStage = this.dataManager.getStage(student.score);
        const evolved = oldStage.name !== newStage.name;

        return {
            success: true,
            student: student,
            pointsAdded: points,
            reason: reason,
            oldScore: oldScore,
            newScore: student.score,
            oldStatus: oldStatus,
            newStatus: HungerStatus.HEALTHY,
            evolved: evolved,
            oldStage: oldStage,
            newStage: newStage,
            timestamp: student.lastScoreTime
        };
    }

    // 批量加分
    addScoreToMultiple(studentIds, points = 10, reason = '批量加分') {
        const results = [];
        studentIds.forEach(id => {
            results.push(this.addScore(id, points, reason));
        });
        return results;
    }

    // 扣分
    subtractScore(studentId, points, reason = '违规扣分') {
        const student = this.dataManager.getStudent(studentId);
        if (!student) {
            return {
                success: false,
                error: '学生不存在'
            };
        }

        const oldScore = student.score;
        student.score = Math.max(0, student.score - points);
        this.dataManager.saveStudents();

        return {
            success: true,
            student: student,
            pointsSubtracted: points,
            reason: reason,
            oldScore: oldScore,
            newScore: student.score
        };
    }

    // ==================== 查询接口 ====================

    // 获取学生完整信息（包含宠物状态）
    getStudentFullInfo(studentId) {
        const student = this.dataManager.getStudent(studentId);
        if (!student) {
            return null;
        }

        // 更新状态
        this.updateStudentPetStatus(student);
        this.dataManager.saveStudents();

        const stage = this.dataManager.getStage(student.score);
        const nextStage = this.dataManager.getNextStage(student.score);
        const progress = this.dataManager.getProgress(student.score);
        const needScore = this.dataManager.getNeedScore(student.score);

        return {
            student: student,
            pet: student.pet,
            stage: stage,
            nextStage: nextStage,
            progress: progress,
            needScore: needScore,
            hungerStatus: student.pet ? student.pet.hungerStatus : HungerStatus.HEALTHY,
            hungerText: student.pet ? student.pet.hungerText : '',
            statusClass: student.pet ? student.pet.statusClass : '',
            daysWithoutScore: student.consecutiveDaysWithoutScore
        };
    }

    // 获取所有学生状态概览
    getAllStudentsOverview() {
        this.updateAllStudentsStatus();
        
        return this.dataManager.students.map(student => ({
            id: student.id,
            name: student.name,
            score: student.score,
            daysWithoutScore: student.consecutiveDaysWithoutScore,
            hungerStatus: student.pet ? student.pet.hungerStatus : HungerStatus.HEALTHY,
            hungerText: student.pet ? student.pet.hungerText : '',
            isPetAlive: student.pet ? student.pet.isAdopted : false
        }));
    }

    // 获取饥饿学生列表
    getHungryStudents() {
        this.updateAllStudentsStatus();
        
        return this.dataManager.students.filter(student => {
            const status = student.pet ? student.pet.hungerStatus : HungerStatus.HEALTHY;
            return status !== HungerStatus.HEALTHY;
        }).map(student => ({
            id: student.id,
            name: student.name,
            score: student.score,
            daysWithoutScore: student.consecutiveDaysWithoutScore,
            hungerStatus: student.pet.hungerStatus,
            hungerText: student.pet.hungerText
        }));
    }

    // 获取死亡宠物列表
    getDeadPets() {
        this.updateAllStudentsStatus();
        
        return this.dataManager.students.filter(student => {
            return student.pet && !student.pet.isAdopted;
        }).map(student => ({
            id: student.id,
            name: student.name,
            score: student.score,
            daysWithoutScore: student.consecutiveDaysWithoutScore
        }));
    }

    // ==================== 宠物管理 ====================

    // 复活宠物
    revivePet(studentId) {
        const student = this.dataManager.getStudent(studentId);
        if (!student || !student.pet) {
            return { success: false, error: '学生或宠物不存在' };
        }

        // 需要花费积分复活
        const reviveCost = 50;
        if (student.score < reviveCost) {
            return { 
                success: false, 
                error: `积分不足，需要 ${reviveCost} 分复活宠物` 
            };
        }

        student.score -= reviveCost;
        student.pet.isAdopted = true;
        student.pet.hungerStatus = HungerStatus.HEALTHY;
        student.pet.hungerText = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].text;
        student.pet.statusClass = HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].cssClass;
        student.pet.deathApplied = false;
        student.pet.penaltyApplied = false;
        student.lastScoreTime = new Date().toISOString();
        student.consecutiveDaysWithoutScore = 0;

        this.dataManager.saveStudents();

        return {
            success: true,
            student: student,
            cost: reviveCost
        };
    }

    // 重新认养宠物
    adoptNewPet(studentId, petId) {
        const student = this.dataManager.getStudent(studentId);
        if (!student) {
            return { success: false, error: '学生不存在' };
        }

        const petDatabase = window.PET_DATABASE || [];
        const pet = petDatabase.find(p => p.id === petId);
        if (!pet) {
            return { success: false, error: '宠物不存在' };
        }

        student.pet = new PetModel({
            petId: pet.id,
            petName: pet.name,
            baseEmoji: pet.emoji,
            isAdopted: true
        }).toJSONObject();

        student.lastScoreTime = new Date().toISOString();
        student.consecutiveDaysWithoutScore = 0;

        this.dataManager.saveStudents();

        return {
            success: true,
            student: student
        };
    }
}

// ==================== 单元测试 ====================

class ScorePetManagerTest {
    constructor(scorePetManager) {
        this.manager = scorePetManager;
        this.testResults = [];
    }

    runAllTests() {
        console.log('========== 开始运行单元测试 ==========');
        
        this.testCalculateDaysWithoutScore();
        this.testGetHungerStatusByDays();
        this.testAddScore();
        this.testStatusTransition();
        this.testScorePenalty();
        this.testPetDeath();
        this.testPetRevive();
        
        this.printResults();
        return this.testResults;
    }

    assert(condition, testName, details = '') {
        const result = {
            name: testName,
            passed: condition,
            details: details
        };
        this.testResults.push(result);
        
        const icon = condition ? '✅' : '❌';
        console.log(`${icon} ${testName}${details ? ': ' + details : ''}`);
    }

    testCalculateDaysWithoutScore() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        this.assert(
            this.manager.calculateDaysWithoutScore(now.toISOString()) === 0,
            '计算0天',
            '当天应返回0天'
        );
        
        this.assert(
            this.manager.calculateDaysWithoutScore(yesterday.toISOString()) === 1,
            '计算1天',
            '昨天应返回1天'
        );
        
        this.assert(
            this.manager.calculateDaysWithoutScore(threeDaysAgo.toISOString()) === 3,
            '计算3天',
            '3天前应返回3天'
        );
        
        this.assert(
            this.manager.calculateDaysWithoutScore(weekAgo.toISOString()) === 7,
            '计算7天',
            '7天前应返回7天'
        );
    }

    testGetHungerStatusByDays() {
        this.assert(
            this.manager.getHungerStatusByDays(0) === HungerStatus.HEALTHY,
            '状态转换-健康',
            '0天应为健康状态'
        );
        
        this.assert(
            this.manager.getHungerStatusByDays(1) === HungerStatus.HUNGRY,
            '状态转换-饥饿',
            '1天应为饥饿状态'
        );
        
        this.assert(
            this.manager.getHungerStatusByDays(3) === HungerStatus.DIZZY,
            '状态转换-晕眩',
            '3天应为晕眩状态'
        );
        
        this.assert(
            this.manager.getHungerStatusByDays(5) === HungerStatus.DYING,
            '状态转换-垂死',
            '5天应为垂死状态'
        );
        
        this.assert(
            this.manager.getHungerStatusByDays(7) === HungerStatus.DEAD,
            '状态转换-死亡',
            '7天应为死亡状态'
        );
    }

    testAddScore() {
        const students = this.manager.dataManager.students;
        if (students.length === 0) {
            this.assert(false, '加分测试', '没有学生数据');
            return;
        }

        const student = students[0];
        const oldScore = student.score;
        const result = this.manager.addScore(student.id, 10, '测试加分');

        this.assert(
            result.success === true,
            '加分成功',
            '加分操作应成功'
        );
        
        this.assert(
            result.newScore === oldScore + 10,
            '积分增加',
            `积分应从${oldScore}增加到${oldScore + 10}`
        );
        
        this.assert(
            result.newStatus === HungerStatus.HEALTHY,
            '状态重置',
            '加分后状态应重置为健康'
        );
    }

    testStatusTransition() {
        this.assert(
            HUNGER_STATUS_CONFIG[HungerStatus.HEALTHY].text === '活力满满 😊',
            '健康状态文案',
            '验证健康状态文案'
        );
        
        this.assert(
            HUNGER_STATUS_CONFIG[HungerStatus.HUNGRY].text === '好饿呀 🥺',
            '饥饿状态文案',
            '验证饥饿状态文案'
        );
        
        this.assert(
            HUNGER_STATUS_CONFIG[HungerStatus.DIZZY].scorePenalty === 5,
            '晕眩状态惩罚',
            '晕眩状态应扣5分'
        );
        
        this.assert(
            HUNGER_STATUS_CONFIG[HungerStatus.DYING].scorePenalty === 10,
            '垂死状态惩罚',
            '垂死状态应扣10分'
        );
        
        this.assert(
            HUNGER_STATUS_CONFIG[HungerStatus.DEAD].resetPet === true,
            '死亡状态重置',
            '死亡状态应重置宠物'
        );
    }

    testScorePenalty() {
        const students = this.manager.dataManager.students;
        if (students.length < 2) {
            this.assert(false, '积分惩罚测试', '学生数量不足');
            return;
        }

        const student = students[1];
        student.lastScoreTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        student.pet = student.pet || {};
        student.pet.penaltyApplied = false;
        
        const oldScore = student.score;
        this.manager.updateStudentPetStatus(student);

        this.assert(
            student.pet.hungerStatus === HungerStatus.DIZZY,
            '积分惩罚-状态',
            '3天后应为晕眩状态'
        );
    }

    testPetDeath() {
        const students = this.manager.dataManager.students;
        if (students.length < 3) {
            this.assert(false, '宠物死亡测试', '学生数量不足');
            return;
        }

        const student = students[2];
        student.lastScoreTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        student.pet = student.pet || { isAdopted: true };
        student.pet.deathApplied = false;
        
        this.manager.updateStudentPetStatus(student);

        this.assert(
            student.pet.hungerStatus === HungerStatus.DEAD,
            '宠物死亡-状态',
            '7天后应为死亡状态'
        );
    }

    testPetRevive() {
        const students = this.manager.dataManager.students;
        if (students.length < 4) {
            this.assert(false, '宠物复活测试', '学生数量不足');
            return;
        }

        const student = students[3];
        student.score = 100;
        student.pet = {
            isAdopted: false,
            hungerStatus: HungerStatus.DEAD
        };

        const result = this.manager.revivePet(student.id);

        this.assert(
            result.success === true,
            '宠物复活-成功',
            '复活应成功'
        );
        
        this.assert(
            student.score === 50,
            '宠物复活-扣分',
            '复活应扣50分'
        );
        
        this.assert(
            student.pet.isAdopted === true,
            '宠物复活-状态',
            '宠物应已复活'
        );
    }

    printResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log('========== 测试结果汇总 ==========');
        console.log(`总计: ${total} 个测试`);
        console.log(`通过: ${passed} 个`);
        console.log(`失败: ${total - passed} 个`);
        console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`);
    }
}

// ==================== 导出 ====================

window.StudentModel = StudentModel;
window.PetModel = PetModel;
window.ScorePetManager = ScorePetManager;
window.ScorePetManagerTest = ScorePetManagerTest;
window.HungerStatus = HungerStatus;
window.HUNGER_STATUS_CONFIG = HUNGER_STATUS_CONFIG;

console.log('✅ 学生积分与宠物状态管理系统已加载');
