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
        this.studentImporter = null;
        this.authManager = new AuthManager(dataManager);
        this.selectedStudents = new Set();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderStudentList();
        this.bindEvents();
        this.updateHeaderInfo();
        this.initFeishuConfig();
        this.initStudentImporter();
    }

    initStudentImporter() {
        this.studentImporter = new StudentImporter(this.data, this.authManager);
    }

    updateHeaderInfo() {
        document.querySelector('.class-name').textContent = this.data.config.className || '三年级一班';
        document.querySelector('.student-count').textContent = `${this.data.students.length}人`;
    }

    renderStudentList(searchTerm = '') {
        const list = document.getElementById('studentList');
        const filtered = this.data.students.filter(s => {
            const name = String(s.name || '');
            return name.includes(searchTerm);
        });

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
        const searchStudent = document.getElementById('searchStudent');
        if (searchStudent) {
            searchStudent.addEventListener('input', (e) => {
                this.renderStudentList(e.target.value);
            });
        }

        // 快捷操作
        const btnAddScore = document.getElementById('btnAddScore');
        if (btnAddScore) {
            btnAddScore.addEventListener('click', () => {
                this.openBatchModal();
            });
        }

        const btnSettings = document.getElementById('btnSettings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }

        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                this.openExportModal();
            });
        }

        // 物品商城管理
        const btnItemMall = document.getElementById('btnItemMall');
        if (btnItemMall) {
            btnItemMall.addEventListener('click', () => {
                this.openItemMallModal();
            });
        }

        // 添加学生
        const btnAddStudent = document.getElementById('btnAddStudent');
        if (btnAddStudent) {
            btnAddStudent.addEventListener('click', () => {
                this.openAddStudentModal();
            });
        }

        // 批量导入学生
        const btnImportStudents = document.getElementById('btnImportStudents');
        if (btnImportStudents) {
            btnImportStudents.addEventListener('click', () => {
                this.openImportModal();
            });
        }

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
        document.getElementById('editPassword').value = '';
        document.getElementById('editScore').value = '0';
        document.getElementById('editStage').textContent = '🥚 蛋';
        document.getElementById('studentEditModal').classList.add('active');
    }

    saveStudentEdit() {
        const name = document.getElementById('editName').value.trim();
        const password = document.getElementById('editPassword').value.trim();
        const score = parseInt(document.getElementById('editScore').value) || 0;

        if (!name) {
            this.showToast('请输入学生姓名');
            return;
        }

        if (this.currentEditId) {
            // 编辑现有学生
            this.data.updateStudent(this.currentEditId, { name, score });
            this.showToast('更新成功');
        } else {
            // 添加新学生，需要验证密码
            if (!password || password.length < 4) {
                this.showToast('密码长度至少 4 位');
                return;
            }

            // 创建学生
            const student = this.data.addStudent(name);
            if (student) {
                // 更新积分
                this.data.updateStudent(student.id, { score });
                
                // 创建登录账号
                const username = name.trim().toLowerCase();
                const account = {
                    id: 'acc_' + Date.now(),
                    studentId: student.id,
                    username: username,
                    password: password,
                    status: 'active',
                    createdAt: Date.now(),
                    createdBy: 'teacher'
                };
                
                this.authManager.saveStudentAccount(account);
                
                this.showToast(`添加成功！\n学生姓名：${name}\n登录密码：${password}`);
            } else {
                this.showToast('添加失败');
                return;
            }
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

    openItemMallModal() {
        const modal = document.getElementById('itemMallModal');
        const content = document.getElementById('itemMallContent');
        
        // 初始化物品上传界面
        const uploader = new TeacherItemUploader(content, {
            onItemAdded: (item) => {
                console.log('物品已添加:', item);
                this.showToast('物品已添加到商城');
            },
            onItemRemoved: (itemId) => {
                console.log('物品已删除:', itemId);
                this.showToast('物品已从商城移除');
            }
        });
        
        modal.classList.add('active');
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

    // 打开批量导入弹窗
    openImportModal() {
        const modal = document.getElementById('importStudentModal');
        const closeBtn = document.getElementById('closeImportModal');
        
        modal.classList.add('active');
        
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };
        
        // 初始化导入界面
        this.studentImporter.createImportInterface('importContainer');
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

// ==================== 作业管理功能 ====================
class HomeworkManagerUI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.homeworkManager = initHomeworkManager(dataManager);
        this.currentReviewSubmission = null;
        this.richTextEditor = null;
        this.categoryManager = null;
        this.uploader = null;
        this.requirements = [];
        this.init();
    }

    init() {
        this.initRichTextEditor();
        this.initCategoryManager();
        this.initUploader();
        this.initRequirementsEditor();
        this.setupEventListeners();
        this.setupDefaultDueDate();
    }

    initRichTextEditor() {
        const editorContainer = document.getElementById('homeworkDescriptionEditor');
        if (editorContainer) {
            this.richTextEditor = new RichTextEditor('homeworkDescriptionEditor', {
                placeholder: '请输入作业详细描述，支持富文本格式...',
                maxHeight: 400,
                minHeight: 150
            });
            this.richTextEditor.init();
        }
    }

    initCategoryManager() {
        this.categoryManager = new HomeworkCategoryManager();
        this.categoryManager.createCategorySelector('categorySelector');
    }

    initUploader() {
        const uploadContainer = document.getElementById('attachmentUpload');
        if (uploadContainer) {
            this.uploader = new EnhancedUploader();
            this.uploader.initUploadComponent('attachmentUpload', {
                maxFiles: 10,
                maxSize: 10,
                allowEdit: true,
                autoSave: false
            });
        }
    }

    initRequirementsEditor() {
        this.requirements = [];
        this.renderRequirements();
        
        const input = document.getElementById('newRequirement');
        const addBtn = document.getElementById('btnAddRequirement');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addRequirement();
                }
            });
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addRequirement();
            });
        }
    }

    addRequirement() {
        const input = document.getElementById('newRequirement');
        const text = input.value.trim();
        
        if (text) {
            this.requirements.push(text);
            this.renderRequirements();
            input.value = '';
        }
    }

    removeRequirement(index) {
        this.requirements.splice(index, 1);
        this.renderRequirements();
    }

    renderRequirements() {
        const container = document.getElementById('requirementsList');
        if (!container) return;
        
        if (this.requirements.length === 0) {
            container.innerHTML = '<div class="no-requirements">暂无作业要求，请在下方输入框添加</div>';
            return;
        }
        
        let html = '';
        this.requirements.forEach((req, index) => {
            html += `
                <div class="requirement-item">
                    <span class="requirement-number">${index + 1}.</span>
                    <span class="requirement-text">${req}</span>
                    <button type="button" class="btn-remove-requirement" onclick="adminUI.homeworkUI.removeRequirement(${index})">✕</button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    setupEventListeners() {
        // 作业管理按钮
        document.getElementById('btnHomeworkManage').addEventListener('click', () => {
            this.openHomeworkModal();
        });

        // 作业弹窗关闭按钮
        document.getElementById('closeHomeworkModal').addEventListener('click', () => {
            this.closeHomeworkModal();
        });

        // 作业标签页切换
        document.querySelectorAll('.homework-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchHomeworkTab(e.target.getAttribute('data-tab'));
            });
        });

        // 作业表单提交
        document.getElementById('homeworkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.previewHomework();
        });

        // 作业预览按钮
        document.getElementById('btnPreviewHomework').addEventListener('click', () => {
            this.previewHomework();
        });

        // 确认发布按钮
        document.getElementById('btnConfirmPublish').addEventListener('click', () => {
            this.publishHomework();
        });

        // 关闭预览弹窗
        document.getElementById('closePreviewModal').addEventListener('click', () => {
            this.closePreviewModal();
        });

        // 返回编辑按钮
        document.getElementById('btnClosePreview').addEventListener('click', () => {
            this.closePreviewModal();
        });

        // 关闭物品商城弹窗
        document.getElementById('closeItemMallModal').addEventListener('click', () => {
            this.closeItemMallModal();
        });

        // 刷新作业列表
        document.getElementById('btnRefreshHomework').addEventListener('click', () => {
            this.loadHomeworkList();
        });

        // 作业审核过滤器
        document.getElementById('reviewHomeworkFilter').addEventListener('change', () => {
            this.loadSubmissionList();
        });

        // 审核弹窗按钮
        document.getElementById('closeReviewModal').addEventListener('click', () => {
            this.closeReviewModal();
        });

        document.getElementById('btnCancelReview').addEventListener('click', () => {
            this.closeReviewModal();
        });

        document.getElementById('btnApproveSubmission').addEventListener('click', () => {
            this.reviewSubmission(true);
        });

        document.getElementById('btnRejectSubmission').addEventListener('click', () => {
            this.reviewSubmission(false);
        });

        // 快捷时间按钮
        document.querySelectorAll('.quick-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                this.setQuickDueDate(days);
            });
        });

        // 保存草稿按钮
        const btnSaveDraft = document.getElementById('btnSaveDraft');
        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', () => {
                this.saveDraft();
            });
        }

        // 高级设置折叠
        document.querySelectorAll('.form-section.collapsible .section-title').forEach(title => {
            title.addEventListener('click', () => {
                const section = title.closest('.form-section');
                const content = section.querySelector('.section-content');
                const icon = title.querySelector('.toggle-icon');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    icon.textContent = '▶';
                }
            });
        });
    }

    setQuickDueDate(days) {
        const now = new Date();
        now.setDate(now.getDate() + days);
        now.setHours(23, 59, 0, 0);
        const dueDate = now.toISOString().slice(0, 16);
        document.getElementById('homeworkDueDate').value = dueDate;
    }

    saveDraft() {
        const formData = this.getHomeworkFormData();
        if (!formData) return;

        const draft = {
            ...formData,
            requirements: this.requirements,
            savedAt: Date.now()
        };

        localStorage.setItem('homework_draft', JSON.stringify(draft));
        this.showToast('草稿保存成功！');
    }

    loadDraft() {
        const saved = localStorage.getItem('homework_draft');
        if (!saved) return;

        try {
            const draft = JSON.parse(saved);
            
            document.getElementById('homeworkTitle').value = draft.title || '';
            document.getElementById('homeworkSubject').value = draft.subject || '语文';
            document.getElementById('homeworkPoints').value = draft.points || 10;
            document.getElementById('homeworkDifficulty').value = draft.difficulty || 'medium';
            document.getElementById('homeworkDueDate').value = draft.dueDate || '';
            
            if (this.richTextEditor && draft.description) {
                this.richTextEditor.setContent(draft.description);
            }
            
            if (draft.requirements) {
                this.requirements = draft.requirements;
                this.renderRequirements();
            }
            
            if (draft.categoryId) {
                this.categoryManager.createCategorySelector('categorySelector', draft.categoryId);
            }
            
            this.showToast('草稿已加载');
        } catch (error) {
            console.error('加载草稿失败:', error);
        }
    }

    setupDefaultDueDate() {
        const now = new Date();
        now.setDate(now.getDate() + 7); // 默认7天后
        const dueDate = now.toISOString().slice(0, 16);
        document.getElementById('homeworkDueDate').value = dueDate;
    }

    openHomeworkModal() {
        document.getElementById('homeworkModal').classList.add('active');
        this.loadHomeworkList();
        this.loadSubmissionList();
    }

    closeHomeworkModal() {
        document.getElementById('homeworkModal').classList.remove('active');
    }

    closeItemMallModal() {
        document.getElementById('itemMallModal').classList.remove('active');
    }

    switchHomeworkTab(tabName) {
        // 更新标签页状态
        document.querySelectorAll('.homework-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容面板
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');

        // 加载对应数据
        if (tabName === 'homework-list') {
            this.loadHomeworkList();
        } else if (tabName === 'review-homework') {
            this.loadSubmissionList();
        }
    }

    loadHomeworkList() {
        const homeworkList = document.getElementById('homeworkList');
        const homeworks = this.homeworkManager.getHomeworks('published');

        if (homeworks.length === 0) {
            homeworkList.innerHTML = '<div class="no-data">暂无已发布的作业</div>';
            return;
        }

        let html = '';
        homeworks.forEach(homework => {
            const dueDate = new Date(homework.dueDate).toLocaleString('zh-CN');
            const submissions = this.homeworkManager.submissions.filter(sub => 
                sub.homeworkId === homework.id
            );
            const submittedCount = submissions.filter(sub => 
                sub.status === 'submitted' || sub.status === 'reviewed'
            ).length;

            html += `
                <div class="homework-item">
                    <div class="homework-item-header">
                        <div>
                            <div class="homework-title">${homework.title}</div>
                            <div class="homework-meta">
                                <span>${homework.subject}</span>
                                <span>${homework.type === 'written' ? '书面' : homework.type === 'practical' ? '实践' : homework.type === 'creative' ? '创意' : '复习'}</span>
                                <span>${homework.points}积分</span>
                            </div>
                        </div>
                        <div class="homework-actions">
                            <button class="btn-view-submissions" onclick="adminUI.homeworkUI.viewSubmissions(${homework.id})">
                                查看提交 (${submittedCount}/${submissions.length})
                            </button>
                            <button class="btn-close-homework" onclick="adminUI.homeworkUI.closeHomework(${homework.id})">
                                关闭作业
                            </button>
                        </div>
                    </div>
                    <div class="homework-description">${homework.description}</div>
                    <div class="homework-meta">
                        <span>截止: ${dueDate}</span>
                        <span>难度: ${homework.difficulty === 'easy' ? '简单' : homework.difficulty === 'medium' ? '中等' : '困难'}</span>
                    </div>
                </div>
            `;
        });

        homeworkList.innerHTML = html;
    }

    loadSubmissionList() {
        const submissionList = document.getElementById('submissionList');
        const filter = document.getElementById('reviewHomeworkFilter').value;
        
        let submissions = this.homeworkManager.submissions;
        
        if (filter === 'submitted') {
            submissions = submissions.filter(sub => sub.status === 'submitted');
        } else if (filter === 'reviewed') {
            submissions = submissions.filter(sub => sub.status === 'reviewed');
        }

        if (submissions.length === 0) {
            submissionList.innerHTML = '<div class="no-data">暂无待审核的作业</div>';
            return;
        }

        let html = '';
        submissions.forEach(submission => {
            const homework = this.homeworkManager.homeworks.find(hw => hw.id === submission.homeworkId);
            if (!homework) return;

            const submittedAt = submission.submittedAt ? 
                new Date(submission.submittedAt).toLocaleString('zh-CN') : '未提交';

            html += `
                <div class="submission-item ${submission.status}">
                    <div class="submission-header">
                        <div class="submission-student">${submission.studentName}</div>
                        <div class="submission-status ${submission.status}">
                            ${submission.status === 'not_started' ? '未开始' : 
                              submission.status === 'in_progress' ? '进行中' : 
                              submission.status === 'submitted' ? '已提交' : 
                              submission.status === 'reviewed' ? '已审核' : '需修改'}
                        </div>
                    </div>
                    <div class="submission-meta">
                        <span>作业: ${homework.title}</span>
                        <span>提交时间: ${submittedAt}</span>
                    </div>
                    <div class="submission-actions">
                        <button class="btn-review" onclick="adminUI.homeworkUI.reviewSubmission(${submission.id})">
                            审核作业
                        </button>
                    </div>
                </div>
            `;
        });

        submissionList.innerHTML = html;
    }

    previewHomework() {
        const formData = this.getHomeworkFormData();
        if (!formData) return;

        const previewContent = document.getElementById('previewContent');
        const requirements = formData.requirements.split('\n').filter(req => req.trim());

        let html = `
            <div class="preview-homework">
                <h4>${formData.title}</h4>
                <div class="preview-meta">
                    <span style="color: ${formData.categoryColor}">${formData.categoryIcon} ${formData.type}</span>
                    <span>${formData.subject}</span>
                    <span>${formData.difficulty === 'easy' ? '⭐ 简单' : formData.difficulty === 'medium' ? '⭐⭐ 中等' : '⭐⭐⭐ 困难'}</span>
                    <span>${formData.points}积分</span>
                </div>
                <div class="preview-description">${formData.description}</div>
        `;

        if (requirements.length > 0) {
            html += `
                <div class="preview-requirements">
                    <h5>📋 作业要求：</h5>
                    <ul>
            `;
            requirements.forEach(req => {
                html += `<li>${req.trim()}</li>`;
            });
            html += `</ul></div>`;
        }

        if (formData.attachments && formData.attachments.length > 0) {
            html += `
                <div class="preview-attachments">
                    <h5>📎 附件：</h5>
                    <div class="attachment-list">
            `;
            formData.attachments.forEach(file => {
                html += `<div class="attachment-item">📄 ${file.name}</div>`;
            });
            html += `</div></div>`;
        }

        html += `
                <div class="preview-meta">
                    <span>截止时间: ${new Date(formData.dueDate).toLocaleString('zh-CN')}</span>
                    ${formData.publishTime ? `<span>发布时间: ${new Date(formData.publishTime).toLocaleString('zh-CN')}</span>` : ''}
                </div>
                <div class="preview-settings">
                    ${formData.allowLateSubmit ? '<span>✓ 允许迟交</span>' : ''}
                    ${formData.allowResubmit ? '<span>✓ 允许重新提交</span>' : ''}
                    ${formData.sendNotification ? '<span>✓ 发送通知</span>' : ''}
                </div>
            </div>
        `;

        previewContent.innerHTML = html;
        document.getElementById('homeworkPreviewModal').classList.add('active');
    }

    closePreviewModal() {
        document.getElementById('homeworkPreviewModal').classList.remove('active');
    }

    publishHomework() {
        const formData = this.getHomeworkFormData();
        if (!formData) return;

        const homework = this.homeworkManager.createHomework(formData);
        this.homeworkManager.publishHomework(homework.id);

        this.closePreviewModal();
        this.closeHomeworkModal();
        this.showToast('作业发布成功！');
        
        // 重置表单
        document.getElementById('homeworkForm').reset();
        this.requirements = [];
        this.renderRequirements();
        
        if (this.richTextEditor) {
            this.richTextEditor.clear();
        }
        
        if (this.uploader) {
            this.uploader.clearAllFiles();
        }
        
        // 清除草稿
        localStorage.removeItem('homework_draft');
        
        this.setupDefaultDueDate();
    }

    getHomeworkFormData() {
        const title = document.getElementById('homeworkTitle').value.trim();
        const dueDate = document.getElementById('homeworkDueDate').value;

        if (!title) {
            this.showToast('请填写作业标题');
            return null;
        }

        if (!dueDate) {
            this.showToast('请选择截止日期');
            return null;
        }

        // 获取分类
        const categoryId = document.getElementById('selectedCategory')?.value || '';
        const category = this.categoryManager ? this.categoryManager.getCategoryById(categoryId) : null;

        // 获取富文本内容
        const description = this.richTextEditor ? this.richTextEditor.getContent() : '';

        // 获取高级设置
        const allowLateSubmit = document.getElementById('allowLateSubmit')?.checked || false;
        const allowResubmit = document.getElementById('allowResubmit')?.checked || false;
        const sendNotification = document.getElementById('sendNotification')?.checked || true;
        const reminderTime = document.getElementById('reminderTime')?.value || '24';

        // 获取发布时间
        const publishTime = document.getElementById('homeworkPublishTime')?.value || null;

        return {
            title,
            description,
            type: category ? category.name : '书面作业',
            categoryId: categoryId,
            categoryIcon: category ? category.icon : '📝',
            categoryColor: category ? category.color : '#667eea',
            difficulty: document.getElementById('homeworkDifficulty').value,
            subject: document.getElementById('homeworkSubject').value.trim() || '语文',
            points: parseInt(document.getElementById('homeworkPoints').value) || 10,
            dueDate: new Date(dueDate).toISOString(),
            publishTime: publishTime ? new Date(publishTime).toISOString() : null,
            requirements: this.requirements.join('\n'),
            attachments: this.uploader ? this.uploader.getUploadedFiles() : [],
            allowLateSubmit,
            allowResubmit,
            sendNotification,
            reminderTime: parseInt(reminderTime)
        };
    }

    viewSubmissions(homeworkId) {
        // 切换到作业审核标签页
        this.switchHomeworkTab('review-homework');
        // 可以添加过滤功能，只显示该作业的提交
    }

    closeHomework(homeworkId) {
        if (confirm('确定要关闭这个作业吗？关闭后将无法提交新作业。')) {
            const homework = this.homeworkManager.homeworks.find(hw => hw.id === homeworkId);
            if (homework) {
                homework.status = 'closed';
                this.homeworkManager.saveHomeworks();
                this.loadHomeworkList();
                this.showToast('作业已关闭');
            }
        }
    }

    reviewSubmission(submissionId) {
        const submission = this.homeworkManager.submissions.find(sub => sub.id === submissionId);
        if (!submission) return;

        const homework = this.homeworkManager.homeworks.find(hw => hw.id === submission.homeworkId);
        if (!homework) return;

        this.currentReviewSubmission = submission;

        const reviewContent = document.getElementById('reviewContent');
        const images = this.homeworkManager.getSubmissionImages(submissionId);

        let html = `
            <div class="review-submission">
                <h4>${homework.title}</h4>
                <div class="review-student-info">
                    <strong>学生:</strong> ${submission.studentName}<br>
                    <strong>提交时间:</strong> ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('zh-CN') : '未提交'}
                </div>
                <div class="review-content-text">
                    <strong>作业内容:</strong><br>
                    ${submission.content || '无文字内容'}
                </div>
        `;

        if (images.length > 0) {
            html += `
                <div class="review-images">
                    <strong>上传图片:</strong><br>
            `;
            images.forEach(img => {
                html += `<img src="${img.url}" alt="${img.originalName}" class="review-image">`;
            });
            html += '</div>';
        }

        html += `
                <div class="review-feedback">
                    <strong>教师评语:</strong><br>
                    <textarea id="reviewFeedback" placeholder="请输入评语...">${submission.teacherFeedback || ''}</textarea>
                </div>
            </div>
        `;

        reviewContent.innerHTML = html;
        document.getElementById('reviewSubmissionModal').classList.add('active');
    }

    closeReviewModal() {
        document.getElementById('reviewSubmissionModal').classList.remove('active');
        this.currentReviewSubmission = null;
    }

    reviewSubmission(isApproved) {
        if (!this.currentReviewSubmission) return;

        const feedback = document.getElementById('reviewFeedback').value.trim();
        const points = isApproved ? this.homeworkManager.homeworks.find(hw => 
            hw.id === this.currentReviewSubmission.homeworkId
        ).points : 0;

        this.homeworkManager.reviewSubmission(
            this.currentReviewSubmission.id, 
            feedback, 
            points
        );

        this.closeReviewModal();
        this.loadSubmissionList();
        this.showToast(isApproved ? '作业审核通过' : '作业需修改');
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
    const homeworkUI = new HomeworkManagerUI(dataManager);

    window.AdminApp = {
        data: dataManager,
        ui: adminUI,
        homeworkUI: homeworkUI
    };

    console.log('ClassPet Pro 管理端已加载！');
});
