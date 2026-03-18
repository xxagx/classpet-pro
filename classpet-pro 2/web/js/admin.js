// ClassPet Pro - 手机管理端

// ==================== 数据管理（复用大屏逻辑）====================
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
        // 如果没有数据，初始化默认学生
        const defaultStudents = [
            '陈心然', '邓林染', '冯奕川', '黄妤泽', '蒋秉骞', '冷宇轩', '柳昱哲', '罗云天',
            '马倩汐', '潘希予', '蒲睿彤', '覃琳涵', '谭萱绮', '唐嘉彤', '唐梓博', '田馨',
            '王涵霓', '王贺铭', '王弘谦', '王梓诺', '卫兆恒', '吴稷', '徐子杰', '颜之恒',
            '叶城昊', '叶汐', '叶梓萱', '张星程', '张栩源', '张语汐', '张玉欣', '周铭熙',
            '周宣宏', '周彦卿', '朱宵霖', '曾馨媛', '庄子荀', '黄枢芃'
        ].map((name, index) => ({
            id: index + 1,
            name: name,
            score: Math.floor(Math.random() * 100),
            rewards: [],
            createdAt: Date.now()
        }));
        this.students = defaultStudents;
        this.saveStudents();
        return defaultStudents;
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
        
        return { student, delta, oldScore, newScore: student.score, evolved, oldStage, newStage };
    }

    getStage(score) {
        for (let i = this.config.stages.length - 1; i >= 0; i--) {
            if (score >= this.config.stages[i].minScore) {
                return this.config.stages[i];
            }
        }
        return this.config.stages[0];
    }

    addStudent(name) {
        const newStudent = {
            id: Date.now(),
            name: name,
            score: 0,
            rewards: [],
            createdAt: Date.now()
        };
        this.students.push(newStudent);
        this.saveStudents();
        return newStudent;
    }

    updateStudent(id, updates) {
        const student = this.getStudent(id);
        if (!student) return null;
        
        Object.assign(student, updates);
        this.saveStudents();
        return student;
    }

    deleteStudent(id) {
        this.students = this.students.filter(s => s.id !== id);
        this.saveStudents();
    }

    exportToCSV() {
        const headers = ['姓名', '当前积分', '当前阶段', '已获得奖励'];
        const rows = this.students.map(s => {
            const stage = this.getStage(s.score);
            const rewards = s.rewards.map(r => r.name).join('; ') || '无';
            return [s.name, s.score, stage.name, rewards];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    exportToJSON() {
        return JSON.stringify({
            config: this.config,
            students: this.students,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
}

// ==================== UI管理 ====================
class AdminUI {
    constructor(dataManager) {
        this.data = dataManager;
        this.selectedStudents = new Set();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderStudentList();
        this.bindEvents();
        this.updateHeaderInfo();
    }

    updateHeaderInfo() {
        document.querySelector('.class-name').textContent = this.data.config.className || '三年级一班';
        document.querySelector('.student-count').textContent = `${this.data.students.length}人`;
    }

    renderStudentList(searchTerm = '') {
        const list = document.getElementById('studentList');
        const filtered = this.data.students.filter(s => 
            s.name.includes(searchTerm)
        );

        list.innerHTML = filtered.map(student => {
            const stage = this.data.getStage(student.score);
            return `
                <div class="student-item" data-id="${student.id}">
                    <div class="student-avatar ${stage.bgClass}">${stage.emoji}</div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-meta">${student.rewards.length}个奖励</div>
                    </div>
                    <div class="student-score">
                        <div class="score-value">${student.score}</div>
                        <div class="stage-tag ${stage.bgClass}">${stage.name}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        list.querySelectorAll('.student-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.openEditModal(id);
            });
        });
    }

    bindEvents() {
        // 搜索
        document.getElementById('searchStudent').addEventListener('input', (e) => {
            this.renderStudentList(e.target.value);
        });

        // 快捷操作
        document.getElementById('btnAddScore').addEventListener('click', () => {
            this.openBatchModal();
        });

        document.getElementById('btnSettings').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('btnExport').addEventListener('click', () => {
            this.openExportModal();
        });

        document.getElementById('btnAddStudent').addEventListener('click', () => {
            this.openAddStudentModal();
        });

        // 关闭弹窗
        document.querySelectorAll('.close-btn, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.remove('active');
            });
        });

        // 编辑学生
        document.getElementById('btnSaveStudent').addEventListener('click', () => {
            this.saveStudentEdit();
        });

        document.getElementById('btnDeleteStudent').addEventListener('click', () => {
            this.deleteStudent();
        });

        // 批量加分
        document.getElementById('btnConfirmBatch').addEventListener('click', () => {
            this.confirmBatchScore();
        });

        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.batch-student-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const id = parseInt(cb.dataset.id);
                if (e.target.checked) {
                    this.selectedStudents.add(id);
                } else {
                    this.selectedStudents.delete(id);
                }
            });
        });

        // 分数预设按钮
        document.querySelectorAll('.btn-score-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-score-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('batchScoreValue').value = btn.dataset.value;
            });
        });

        // 设置标签页
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.querySelector(`.tab-panel[data-panel="${tab}"]`).classList.add('active');
            });
        });

        // 保存设置
        document.getElementById('btnSaveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // 导出
        document.getElementById('exportExcel').addEventListener('click', () => {
            this.exportExcel();
        });

        document.getElementById('exportJSON').addEventListener('click', () => {
            this.exportJSON();
        });

        document.getElementById('shareData').addEventListener('click', () => {
            this.shareData();
        });
    }

    openEditModal(studentId) {
        this.currentEditId = studentId;
        const student = this.data.getStudent(studentId);
        if (!student) return;

        const stage = this.data.getStage(student.score);
        
        document.getElementById('editModalTitle').textContent = '编辑学生';
        document.getElementById('editName').value = student.name;
        document.getElementById('editScore').value = student.score;
        document.getElementById('editStage').textContent = stage.emoji + ' ' + stage.name;

        document.getElementById('studentEditModal').classList.add('active');
    }

    openAddStudentModal() {
        this.currentEditId = null;
        document.getElementById('editModalTitle').textContent = '添加学生';
        document.getElementById('editName').value = '';
        document.getElementById('editScore').value = '0';
        document.getElementById('editStage').textContent = '🥚 蛋';
        document.getElementById('studentEditModal').classList.add('active');
    }

    saveStudentEdit() {
        const name = document.getElementById('editName').value.trim();
        const score = parseInt(document.getElementById('editScore').value) || 0;

        if (!name) {
            this.showToast('请输入学生姓名');
            return;
        }

        if (this.currentEditId) {
            this.data.updateStudent(this.currentEditId, { name, score });
            this.showToast('更新成功');
        } else {
            this.data.addStudent(name);
            this.data.updateStudent(this.data.students[this.data.students.length - 1].id, { score });
            this.showToast('添加成功');
        }

        this.renderStudentList();
        this.updateHeaderInfo();
        document.getElementById('studentEditModal').classList.remove('active');
    }

    deleteStudent() {
        if (!this.currentEditId) return;
        
        if (confirm('确定删除这个学生吗？')) {
            this.data.deleteStudent(this.currentEditId);
            this.renderStudentList();
            this.updateHeaderInfo();
            document.getElementById('studentEditModal').classList.remove('active');
            this.showToast('删除成功');
        }
    }

    openBatchModal() {
        this.selectedStudents.clear();
        const list = document.getElementById('batchStudentList');
        
        list.innerHTML = this.data.students.map(student => {
            const stage = this.data.getStage(student.score);
            return `
                <div class="select-item">
                    <input type="checkbox" class="batch-student-checkbox" data-id="${student.id}">
                    <span>${student.name}</span>
                    <span style="margin-left: auto; color: #999;">${stage.name} ${student.score}分</span>
                </div>
            `;
        }).join('');

        // 绑定复选框事件
        list.querySelectorAll('.batch-student-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (e.target.checked) {
                    this.selectedStudents.add(id);
                } else {
                    this.selectedStudents.delete(id);
                }
            });
        });

        document.getElementById('batchScoreModal').classList.add('active');
    }

    confirmBatchScore() {
        const scoreInput = document.getElementById('batchScoreValue');
        const delta = parseInt(scoreInput.value) || 0;

        if (this.selectedStudents.size === 0) {
            this.showToast('请选择学生');
            return;
        }

        if (delta === 0) {
            this.showToast('请输入分数');
            return;
        }

        let count = 0;
        this.selectedStudents.forEach(id => {
            if (this.data.updateScore(id, delta)) {
                count++;
            }
        });

        this.showToast(`已为${count}名学生${delta > 0 ? '加分' : '扣分'}${Math.abs(delta)}分`);
        this.renderStudentList();
        document.getElementById('batchScoreModal').classList.remove('active');
        document.getElementById('selectAll').checked = false;
        scoreInput.value = '';
        document.querySelectorAll('.btn-score-preset').forEach(b => b.classList.remove('active'));
    }

    openSettingsModal() {
        // 加载当前设置
        document.getElementById('settingClassName').value = this.data.config.className || '三年级一班';
        document.getElementById('settingPassword').value = this.data.config.teacherPassword || '1234';

        // 渲染阶段设置
        const stagesList = document.getElementById('stagesList');
        stagesList.innerHTML = this.data.config.stages.map((stage, index) => `
            <div class="stage-setting-item">
                <span class="stage-emoji">${stage.emoji}</span>
                <div class="stage-info">
                    <div class="stage-name">${stage.name}</div>
                    <div class="stage-threshold">升级阈值</div>
                </div>
                <input type="number" value="${stage.minScore}" data-index="${index}" class="stage-threshold-input">
            </div>
        `).join('');

        // 渲染奖励设置
        const rewardsList = document.getElementById('rewardsList');
        rewardsList.innerHTML = this.data.config.rewards.map((reward, index) => `
            <div class="reward-setting-item" data-index="${index}">
                <div class="reward-info">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-cost">${reward.cost}分</div>
                </div>
                <button class="btn-secondary" onclick="this.closest('.reward-setting-item').remove()">删除</button>
            </div>
        `).join('');

        document.getElementById('settingsModal').classList.add('active');
    }

    saveSettings() {
        // 基础设置
        this.data.config.className = document.getElementById('settingClassName').value;
        this.data.config.teacherPassword = document.getElementById('settingPassword').value;

        // 阶段阈值
        document.querySelectorAll('.stage-threshold-input').forEach(input => {
            const index = parseInt(input.dataset.index);
            this.data.config.stages[index].minScore = parseInt(input.value) || 0;
        });

        this.data.saveConfig();
        this.updateHeaderInfo();
        document.getElementById('settingsModal').classList.remove('active');
        this.showToast('设置已保存');
    }

    openExportModal() {
        document.getElementById('exportModal').classList.add('active');
    }

    exportExcel() {
        const csv = this.data.exportToCSV();
        this.downloadFile(csv, 'classpet_data.csv', 'text/csv');
        document.getElementById('exportModal').classList.remove('active');
        this.showToast('Excel已导出');
    }

    exportJSON() {
        const json = this.data.exportToJSON();
        this.downloadFile(json, 'classpet_backup.json', 'application/json');
        document.getElementById('exportModal').classList.remove('active');
        this.showToast('JSON已导出');
    }

    shareData() {
        const json = this.data.exportToJSON();
        if (navigator.share) {
            navigator.share({
                title: 'ClassPet数据',
                text: json
            });
        } else {
            navigator.clipboard.writeText(json);
            this.showToast('数据已复制到剪贴板');
        }
        document.getElementById('exportModal').classList.remove('active');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const adminUI = new AdminUI(dataManager);

    window.AdminApp = {
        data: dataManager,
        ui: adminUI
    };

    console.log('ClassPet Pro 管理端已加载！');
});
