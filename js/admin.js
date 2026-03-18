// ClassPet Pro - 手机管理端

// ==================== 数据管理 =====================

// ==================== 飞书同步管理 =====================
class FeishuConfigManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.sync = new FeishuBitableSync();
        this.autoSync = new FeishuAutoSyncManager(this.sync);
        this.loadConfig();
    }

    // 加载飞书配置
    loadConfig() {
        const config = localStorage.getItem('classpet_feishu_config');
        if (config) {
            this.sync.init(JSON.parse(config));
        }
    }

    // 保存飞书配置
    saveConfig(config) {
        localStorage.setItem('classpet_feishu_config', JSON.stringify(config));
        this.sync.init(config);
    }

    // 启动自动同步
    startAutoSync() {
        if (this.sync.isConfigured && this.sync.useCloudSync) {
            this.autoSync.start();
            return true;
        }
        return false;
    }

    // 停止自动同步
    stopAutoSync() {
        this.autoSync.stop();
    }

    // 测试连接
    async testConnection() {
        return await this.sync.checkConnection();
    }

    // 创建表格
    async createTable() {
        return await this.sync.createTableIfNotExists();
    }

    // 手动同步
    async forceSync() {
        return await this.autoSync.forceSync();
    }

    // 获取同步状态
    getSyncStatus() {
        return this.autoSync.getStatus();
    }
}

// ==================== 统计报表管理 =====================
class StatsManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.statsData = new StatsDataManager(dataManager);
        this.chartRenderer = new ChartRenderer();
        this.init();
    }

    init() {
        // 记录今日快照
        this.statsData.recordDailySnapshot();
        this.renderCharts();
    }

    // 渲染所有图表
    renderCharts() {
        this.renderStatsCards();
        this.renderScoreTrend();
        this.renderStageDistribution();
        this.renderTopStudents();
    }

    // 渲染统计卡片
    renderStatsCards() {
        const stats = this.statsData.getClassStats();

        document.getElementById('statsTotalStudents').textContent = stats.totalStudents;
        document.getElementById('statsTotalScore').textContent = stats.totalScore;
        document.getElementById('statsAverageScore').textContent = stats.averageScore;
        document.getElementById('statsHighestScore').textContent = stats.highestScore;
    }

    // 渲染积分趋势图
    renderScoreTrend() {
        const trendData = this.statsData.getScoreTrend(7);
        this.chartRenderer.renderLineChart('scoreTrendChart', trendData, {
            title: '班级平均积分趋势'
        });
    }

    // 渲染阶段分布图
    renderStageDistribution() {
        const stats = this.statsData.getClassStats();
        this.chartRenderer.renderBarChart('stageDistributionChart', stats.stageDistribution, {
            title: '宠物阶段分布'
        });
    }

    // 渲染积分排行榜
    renderTopStudents() {
        const stats = this.statsData.getClassStats();
        const topStudentsList = document.getElementById('topStudentsList');

        topStudentsList.innerHTML = stats.topStudents.map((student, index) => {
            const stage = this.data.getStage(student.score);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return `
                <div class="top-student-item">
                    <div class="student-rank">${medal}</div>
                    <div class="student-avatar ${stage.bgClass}">${stage.emoji}</div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-stage">${stage.name}</div>
                    </div>
                    <div class="student-score">${student.score}</div>
                </div>
            `;
        }).join('');
    }

    // 刷新统计数据
    refresh() {
        this.statsData.recordDailySnapshot();
        this.renderCharts();
    }
}

// ==================== UI管理 ====================
class AdminUI {
    constructor(dataManager) {
        this.data = dataManager;
        this.feishuManager = new FeishuConfigManager(dataManager);
        this.statsManager = new StatsManager(dataManager);
        this.selectedStudents = new Set();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderStudentList();
        this.bindEvents();
        this.updateHeaderInfo();
        this.initFeishuConfig();
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

        // 飞书配置
        const useCloudSync = document.getElementById('enableCloudSync').checked;
        const syncInterval = parseInt(document.getElementById('syncInterval').value) || 30;

        const feishuConfig = {
            appToken: document.getElementById('feishuAppToken').value.trim(),
            tableId: document.getElementById('feishuTableId').value.trim(),
            accessToken: document.getElementById('feishuAccessToken').value.trim(),
            useCloudSync: useCloudSync,
            syncInterval: syncInterval
        };

        // 保存飞书配置
        this.feishuManager.saveConfig(feishuConfig);

        // 启动或停止自动同步
        if (useCloudSync && feishuConfig.appToken && feishuConfig.tableId && feishuConfig.accessToken) {
            this.feishuManager.startAutoSync();
            this.showToast('云端同步已启用');
        } else {
            this.feishuManager.stopAutoSync();
            this.showToast('云端同步已关闭');
        }

        this.data.saveConfig();
        this.updateHeaderInfo();
        document.getElementById('settingsModal').classList.remove('active');
        this.showToast('设置已保存');

        // 同时更新主页面的班级名称（如果主页打开）
        try {
            if (window.opener && window.opener.location.pathname.includes('index.html')) {
                window.opener.postMessage({ type: 'updateClassName', className: this.data.config.className }, '*');
            }
        } catch (e) {
            // 跨域或其他错误，忽略
        }
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

    // 初始化飞书配置界面
    initFeishuConfig() {
        const enableCheckbox = document.getElementById('enableCloudSync');
        const configSection = document.getElementById('feishuConfigSection');

        // 加载已保存的配置
        const savedConfig = localStorage.getItem('classpet_feishu_config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            enableCheckbox.checked = config.useCloudSync || false;
            document.getElementById('feishuAppToken').value = config.appToken || '';
            document.getElementById('feishuTableId').value = config.tableId || '';
            document.getElementById('feishuAccessToken').value = config.accessToken || '';
            document.getElementById('syncInterval').value = config.syncInterval || 30;

            if (enableCheckbox.checked) {
                configSection.style.display = 'block';
            }
        }

        // 监听启用/禁用复选框
        enableCheckbox.addEventListener('change', (e) => {
            configSection.style.display = e.target.checked ? 'block' : 'none';
        });

        // 测试连接
        document.getElementById('btnTestConnection').addEventListener('click', async () => {
            const statusDiv = document.getElementById('connectionStatus');
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#fff3cd';
            statusDiv.style.color = '#856404';
            statusDiv.textContent = '正在测试连接...';

            // 临时加载配置
            const tempConfig = {
                appToken: document.getElementById('feishuAppToken').value.trim(),
                tableId: document.getElementById('feishuTableId').value.trim(),
                accessToken: document.getElementById('feishuAccessToken').value.trim(),
                useCloudSync: true
            };

            this.feishuManager.sync.init(tempConfig);
            const result = await this.feishuManager.testConnection();

            if (result) {
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusDiv.textContent = '✅ 连接成功！飞书Bitable已连接';
            } else {
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.textContent = '❌ 连接失败，请检查配置参数';
            }
        });

        // 创建表格
        document.getElementById('btnCreateTable').addEventListener('click', async () => {
            const statusDiv = document.getElementById('connectionStatus');
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#fff3cd';
            statusDiv.style.color = '#856404';
            statusDiv.textContent = '正在创建表格...';

            const result = await this.feishuManager.createTable();

            if (result) {
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusDiv.textContent = '✅ 表格创建成功！';
            } else {
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.textContent = '❌ 表格创建失败，请检查权限和配置';
            }
        });
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
