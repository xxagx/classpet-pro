// ClassPet Pro - 批量导入学生功能
// 支持门店形式、道路形式导入，自动生成账号密码

class StudentImporter {
    constructor(dataManager, authManager) {
        this.dataManager = dataManager;
        this.authManager = authManager;
        this.importedData = [];
        this.validationErrors = [];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedFormats = ['csv', 'xlsx', 'xls'];
        this.importMode = 'normal'; // normal, store, road
    }

    // 创建导入界面
    createImportInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="student-importer">
                <div class="import-header">
                    <h3>📥 批量导入学生</h3>
                    <p class="import-description">支持 CSV 和 Excel 文件，最多导入 1000 名学生</p>
                </div>

                <!-- 导入模式选择 -->
                <div class="import-mode-selector">
                    <button class="mode-btn active" data-mode="normal">
                        <span class="mode-icon">👤</span>
                        <span class="mode-text">普通导入</span>
                    </button>
                    <button class="mode-btn" data-mode="store">
                        <span class="mode-icon">🏪</span>
                        <span class="mode-text">门店导入</span>
                    </button>
                    <button class="mode-btn" data-mode="road">
                        <span class="mode-icon">🛣️</span>
                        <span class="mode-text">道路导入</span>
                    </button>
                </div>

                <div class="import-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-text">上传文件</div>
                    </div>
                    <div class="step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-text">数据预览</div>
                    </div>
                    <div class="step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-text">导入结果</div>
                    </div>
                </div>

                <div class="import-content">
                    <!-- 步骤 1：上传文件 -->
                    <div class="step-content active" data-step="1">
                        <div class="upload-area" id="importUploadArea">
                            <div class="upload-icon">📁</div>
                            <div class="upload-text">
                                <p>拖拽文件到此处或点击上传</p>
                                <p class="upload-hint">支持 CSV、Excel (.xlsx, .xls) 格式，最大 5MB</p>
                            </div>
                            <input type="file" id="importFileInput" accept=".csv,.xlsx,.xls" style="display: none;">
                            <button class="btn-select-file" id="btnSelectFile">选择文件</button>
                        </div>

                        <div class="file-info" id="importFileInfo" style="display: none;">
                            <div class="file-icon">📄</div>
                            <div class="file-details">
                                <div class="file-name" id="importFileName"></div>
                                <div class="file-size" id="importFileSize"></div>
                            </div>
                            <button class="btn-remove-file" id="btnRemoveFile">✕</button>
                        </div>

                        <div class="template-download">
                            <p>没有模板？</p>
                            <button class="btn-download-template" id="btnDownloadNormalTemplate">📥 下载导入模板</button>
                        </div>
                    </div>

                    <!-- 步骤 2：数据预览 -->
                    <div class="step-content" data-step="2">
                        <div class="preview-header">
                            <h4>数据预览</h4>
                            <div class="preview-stats">
                                <span class="stat-item">
                                    <span class="stat-label">总行数:</span>
                                    <span class="stat-value" id="totalRows">0</span>
                                </span>
                                <span class="stat-item valid">
                                    <span class="stat-label">有效数据:</span>
                                    <span class="stat-value" id="validRows">0</span>
                                </span>
                                <span class="stat-item invalid">
                                    <span class="stat-label">无效数据:</span>
                                    <span class="stat-value" id="invalidRows">0</span>
                                </span>
                            </div>
                        </div>

                        <div class="preview-table-container">
                            <table class="preview-table" id="previewTable">
                                <thead>
                                    <tr id="previewTableHeader">
                                        <th>行号</th>
                                        <th>姓名 *</th>
                                        <th>学号</th>
                                        <th>性别</th>
                                        <th>账号</th>
                                        <th>密码</th>
                                        <th>验证状态</th>
                                    </tr>
                                </thead>
                                <tbody id="previewTableBody">
                                </tbody>
                            </table>
                        </div>

                        <div class="validation-errors" id="validationErrors" style="display: none;">
                            <h5>⚠️ 验证错误</h5>
                            <div class="error-list" id="errorList"></div>
                        </div>
                    </div>

                    <!-- 步骤 3：导入结果 -->
                    <div class="step-content" data-step="3">
                        <div class="import-result">
                            <div class="result-icon" id="resultIcon">✅</div>
                            <div class="result-title" id="resultTitle">导入完成</div>
                            <div class="result-stats">
                                <div class="result-stat success">
                                    <div class="stat-number" id="successCount">0</div>
                                    <div class="stat-label">成功导入</div>
                                </div>
                                <div class="result-stat failed">
                                    <div class="stat-number" id="failedCount">0</div>
                                    <div class="stat-label">导入失败</div>
                                </div>
                            </div>

                            <div class="account-info-box" id="accountInfoBox" style="display: none;">
                                <h5>📋 账号信息</h5>
                                <p class="account-hint">学生可使用以下账号密码登录系统</p>
                                <div class="account-list" id="accountList"></div>
                            </div>

                            <div class="failed-records" id="failedRecords" style="display: none;">
                                <h5>失败记录</h5>
                                <div class="failed-list" id="failedList"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="import-actions">
                    <button class="btn-secondary" id="btnCancelImport">取消</button>
                    <button class="btn-primary" id="btnNextStep" disabled>下一步</button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        const uploadArea = document.getElementById('importUploadArea');
        const fileInput = document.getElementById('importFileInput');
        const btnSelectFile = document.getElementById('btnSelectFile');
        const btnRemoveFile = document.getElementById('btnRemoveFile');
        const btnCancelImport = document.getElementById('btnCancelImport');
        const btnNextStep = document.getElementById('btnNextStep');

        // 导入模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modeBtn = e.currentTarget;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                modeBtn.classList.add('active');
                this.importMode = modeBtn.dataset.mode;
                this.updateTableHeader();
            });
        });

        // 下载模板按钮
        document.getElementById('btnDownloadNormalTemplate').addEventListener('click', () => {
            this.downloadTemplate('normal');
        });

        // 下载模板
        document.getElementById('btnDownloadNormalTemplate').addEventListener('click', () => {
            this.downloadTemplate('normal');
        });

        // 选择文件按钮
        btnSelectFile.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });

        // 移除文件
        btnRemoveFile.addEventListener('click', () => {
            this.removeFile();
        });

        // 取消导入
        btnCancelImport.addEventListener('click', () => {
            this.cancelImport();
        });

        // 下一步
        btnNextStep.addEventListener('click', () => {
            this.nextStep();
        });
    }

    // 更新表格表头
    updateTableHeader() {
        const header = document.getElementById('previewTableHeader');
        if (this.importMode === 'store') {
            header.innerHTML = `
                <th>行号</th>
                <th>门店名称 *</th>
                <th>学生姓名 *</th>
                <th>学号</th>
                <th>性别</th>
                <th>账号</th>
                <th>密码</th>
                <th>验证状态</th>
            `;
        } else if (this.importMode === 'road') {
            header.innerHTML = `
                <th>行号</th>
                <th>道路名称 *</th>
                <th>学生姓名 *</th>
                <th>学号</th>
                <th>性别</th>
                <th>账号</th>
                <th>密码</th>
                <th>验证状态</th>
            `;
        } else {
            header.innerHTML = `
                <th>行号</th>
                <th>姓名 *</th>
                <th>学号</th>
                <th>性别</th>
                <th>账号</th>
                <th>密码</th>
                <th>验证状态</th>
            `;
        }
    }

    // 处理文件选择
    async handleFileSelect(file) {
        // 验证文件格式
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(extension)) {
            this.showError('不支持的文件格式，请上传 CSV 或 Excel 文件');
            return;
        }

        // 验证文件大小
        if (file.size > this.maxFileSize) {
            this.showError('文件大小超过 5MB 限制');
            return;
        }

        // 显示文件信息
        document.getElementById('importUploadArea').style.display = 'none';
        document.getElementById('importFileInfo').style.display = 'flex';
        document.getElementById('importFileName').textContent = file.name;
        document.getElementById('importFileSize').textContent = this.formatFileSize(file.size);

        // 解析文件
        try {
            if (extension === 'csv') {
                await this.parseCSV(file);
            } else {
                await this.parseExcel(file);
            }

            // 启用下一步按钮
            document.getElementById('btnNextStep').disabled = false;
        } catch (error) {
            this.showError('文件解析失败：' + error.message);
        }
    }

    // 解析 CSV 文件
    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    // 跳过标题行
                    const dataLines = lines.slice(1);
                    
                    this.importedData = dataLines.map((line, index) => {
                        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                        
                        if (this.importMode === 'store') {
                            return {
                                rowNumber: index + 2,
                                storeName: values[0] || '',
                                name: values[1] || '',
                                studentId: values[2] || '',
                                gender: values[3] || '男'
                            };
                        } else if (this.importMode === 'road') {
                            return {
                                rowNumber: index + 2,
                                roadName: values[0] || '',
                                name: values[1] || '',
                                studentId: values[2] || '',
                                gender: values[3] || '男'
                            };
                        } else {
                            return {
                                rowNumber: index + 2,
                                name: values[0] || '',
                                studentId: values[1] || '',
                                gender: values[2] || '男'
                            };
                        }
                    });

                    this.validateData();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    }

    // 解析 Excel 文件
    async parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    
                    // 使用 SheetJS 库解析 Excel
                    if (typeof XLSX === 'undefined') {
                        reject(new Error('Excel 解析库未加载'));
                        return;
                    }

                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    // 跳过标题行
                    const dataRows = jsonData.slice(1);
                    
                    this.importedData = dataRows.map((row, index) => {
                        if (this.importMode === 'store') {
                            return {
                                rowNumber: index + 2,
                                storeName: row[0] || '',
                                name: row[1] || '',
                                studentId: row[2] || '',
                                gender: row[3] || '男'
                            };
                        } else if (this.importMode === 'road') {
                            return {
                                rowNumber: index + 2,
                                roadName: row[0] || '',
                                name: row[1] || '',
                                studentId: row[2] || '',
                                gender: row[3] || '男'
                            };
                        } else {
                            return {
                                rowNumber: index + 2,
                                name: row[0] || '',
                                studentId: row[1] || '',
                                gender: row[2] || '男'
                            };
                        }
                    });

                    this.validateData();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 生成账号密码
    generateAccount(name, studentId) {
        // 账号：使用姓名（小写）+ 学号后 4 位（如果有学号）
        let username = name.trim().toLowerCase().replace(/\s+/g, '');
        if (studentId) {
            const idSuffix = String(studentId).slice(-4);
            username = username + idSuffix;
        }
        
        // 密码：固定 6 位随机数字
        const password = '123456';
        
        return { username, password };
    }

    // 验证数据
    validateData() {
        this.validationErrors = [];
        const existingStudents = this.dataManager.students || [];
        const existingNames = new Set(existingStudents.map(s => s.name));

        this.importedData.forEach((row, index) => {
            const errors = [];

            // 验证姓名
            if (!row.name || row.name.trim() === '') {
                errors.push('姓名不能为空');
            } else if (existingNames.has(row.name)) {
                errors.push('学生已存在');
            }

            // 验证门店/道路名称（如果适用）
            if (this.importMode === 'store' && (!row.storeName || row.storeName.trim() === '')) {
                errors.push('门店名称不能为空');
            }
            if (this.importMode === 'road' && (!row.roadName || row.roadName.trim() === '')) {
                errors.push('道路名称不能为空');
            }

            // 验证性别
            if (row.gender && !['男', '女'].includes(row.gender)) {
                errors.push('性别只能是"男"或"女"');
            }

            // 生成账号密码
            const { username, password } = this.generateAccount(row.name, row.studentId);
            row.username = username;
            row.password = password;

            row.errors = errors;
            row.isValid = errors.length === 0;

            if (errors.length > 0) {
                this.validationErrors.push({
                    row: row.rowNumber,
                    name: row.name,
                    errors: errors
                });
            }
        });
    }

    // 显示预览
    showPreview() {
        const tbody = document.getElementById('previewTableBody');
        
        // 更新统计
        const total = this.importedData.length;
        const valid = this.importedData.filter(r => r.isValid).length;
        const invalid = total - valid;

        document.getElementById('totalRows').textContent = total;
        document.getElementById('validRows').textContent = valid;
        document.getElementById('invalidRows').textContent = invalid;

        // 生成表格
        let html = '';
        this.importedData.forEach(row => {
            const statusClass = row.isValid ? 'valid' : 'invalid';
            const statusIcon = row.isValid ? '✅' : '❌';
            const statusText = row.isValid ? '有效' : row.errors.join(', ');

            let nameCell = row.name;
            if (this.importMode === 'store') {
                nameCell = `${row.storeName} - ${row.name}`;
            } else if (this.importMode === 'road') {
                nameCell = `${row.roadName} - ${row.name}`;
            }

            html += `
                <tr class="${statusClass}">
                    <td>${row.rowNumber}</td>
                    <td>${nameCell}</td>
                    <td>${row.studentId || '-'}</td>
                    <td>${row.gender}</td>
                    <td class="account-cell">${row.username || '-'}</td>
                    <td class="password-cell">${row.password || '-'}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusIcon} ${statusText}
                        </span>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // 显示验证错误
        if (this.validationErrors.length > 0) {
            document.getElementById('validationErrors').style.display = 'block';
            const errorList = document.getElementById('errorList');
            
            let errorHtml = '';
            this.validationErrors.forEach(error => {
                errorHtml += `
                    <div class="error-item">
                        <span class="error-row">第${error.row}行</span>
                        <span class="error-name">${error.name}</span>
                        <span class="error-message">${error.errors.join(', ')}</span>
                    </div>
                `;
            });
            
            errorList.innerHTML = errorHtml;
        }
    }

    // 执行导入
    async executeImport() {
        const validData = this.importedData.filter(r => r.isValid);
        const failedData = this.importedData.filter(r => !r.isValid);
        
        let successCount = 0;
        let failedCount = 0;
        const failedRecords = [];
        const createdAccounts = [];

        validData.forEach(row => {
            try {
                // 创建学生
                const student = this.dataManager.addStudent(row.name);

                if (student) {
                    successCount++;
                    
                    // 创建账号
                    const account = {
                        id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        studentId: student.id,
                        username: row.username,
                        password: row.password,
                        status: 'active',
                        createdAt: Date.now(),
                        createdBy: 'teacher'
                    };
                    
                    this.authManager.saveStudentAccount(account);
                    
                    createdAccounts.push({
                        name: row.name,
                        username: account.username,
                        password: account.password
                    });
                } else {
                    failedCount++;
                    failedRecords.push({
                        name: row.name,
                        reason: '创建失败'
                    });
                }
            } catch (error) {
                failedCount++;
                failedRecords.push({
                    name: row.name,
                    reason: error.message
                });
            }
        });

        // 添加无效数据到失败记录
        failedData.forEach(row => {
            failedCount++;
            failedRecords.push({
                name: row.name,
                reason: row.errors.join(', ')
            });
        });

        // 显示结果
        this.showResult(successCount, failedCount, failedRecords, createdAccounts);
    }

    // 显示导入结果
    showResult(successCount, failedCount, failedRecords, createdAccounts) {
        document.getElementById('successCount').textContent = successCount;
        document.getElementById('failedCount').textContent = failedCount;

        // 显示账号信息
        if (createdAccounts.length > 0) {
            document.getElementById('accountInfoBox').style.display = 'block';
            const accountList = document.getElementById('accountList');
            
            let html = '';
            createdAccounts.forEach(acc => {
                html += `
                    <div class="account-item">
                        <span class="account-name">${acc.name}</span>
                        <span class="account-username">账号：${acc.username}</span>
                        <span class="account-password">密码：${acc.password}</span>
                    </div>
                `;
            });
            
            accountList.innerHTML = html;
        }

        if (failedRecords.length > 0) {
            document.getElementById('failedRecords').style.display = 'block';
            const failedList = document.getElementById('failedList');
            
            let html = '';
            failedRecords.forEach(record => {
                html += `
                    <div class="failed-item">
                        <span class="failed-name">${record.name}</span>
                        <span class="failed-reason">${record.reason}</span>
                    </div>
                `;
            });
            
            failedList.innerHTML = html;
        }

        // 更新按钮
        document.getElementById('btnNextStep').textContent = '完成';
        document.getElementById('btnNextStep').onclick = () => {
            this.cancelImport();
        };
    }

    // 下一步
    nextStep() {
        const currentStep = document.querySelector('.step.active');
        const currentStepNum = parseInt(currentStep.dataset.step);

        if (currentStepNum === 1) {
            // 从上传到预览
            this.showPreview();
        } else if (currentStepNum === 2) {
            // 从预览到导入
            this.executeImport();
        }

        // 更新步骤状态
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        const nextStep = document.querySelector(`.step[data-step="${currentStepNum + 1}"]`);
        const nextContent = document.querySelector(`.step-content[data-step="${currentStepNum + 1}"]`);
        
        if (nextStep) nextStep.classList.add('active');
        if (nextContent) nextContent.classList.add('active');
    }

    // 移除文件
    removeFile() {
        document.getElementById('importUploadArea').style.display = 'flex';
        document.getElementById('importFileInfo').style.display = 'none';
        document.getElementById('importFileInput').value = '';
        this.importedData = [];
        this.validationErrors = [];
        document.getElementById('btnNextStep').disabled = true;
    }

    // 取消导入
    cancelImport() {
        this.removeFile();
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector('.step[data-step="1"]').classList.add('active');
        document.querySelector('.step-content[data-step="1"]').classList.add('active');
        document.getElementById('btnNextStep').textContent = '下一步';
        document.getElementById('validationErrors').style.display = 'none';
        document.getElementById('accountInfoBox').style.display = 'none';
    }

    // 下载模板
    downloadTemplate(mode = 'normal') {
        let headers, sampleData, filename;
        
        if (mode === 'store') {
            headers = ['门店名称', '学生姓名', '学号', '性别'];
            sampleData = [
                ['北京店', '张三', '001', '男'],
                ['北京店', '李四', '002', '女'],
                ['上海店', '王五', '003', '男']
            ];
            filename = '门店导入模板.csv';
        } else if (mode === 'road') {
            headers = ['道路名称', '学生姓名', '学号', '性别'];
            sampleData = [
                ['中山路', '张三', '001', '男'],
                ['中山路', '李四', '002', '女'],
                ['人民路', '王五', '003', '男']
            ];
            filename = '道路导入模板.csv';
        } else {
            headers = ['学生姓名', '学号', '性别'];
            sampleData = [
                ['张三', '001', '男'],
                ['李四', '002', '女'],
                ['王五', '003', '男']
            ];
            filename = '学生导入模板.csv';
        }

        // 创建 CSV 内容
        let csvContent = '\uFEFF'; // BOM for UTF-8
        csvContent += headers.join(',') + '\n';
        sampleData.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 显示错误
    showError(message) {
        alert('❌ ' + message);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}
