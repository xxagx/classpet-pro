// ClassPet Pro - 增强版文件上传组件
// 支持多种文件格式、进度反馈、自动保存、图片编辑等高级功能

class EnhancedUploader {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 10;
        this.supportedTypes = this.getSupportedTypes();
        this.uploadQueue = [];
        this.isUploading = false;
        this.draftData = null;
        this.autoSaveInterval = null;
        this.uploadStartTime = null;
        this.currentSubmissionId = null;
    }

    // 获取支持的文件类型
    getSupportedTypes() {
        return {
            // 图片格式
            images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
            // 文档格式
            documents: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'text/csv'
            ],
            // 压缩格式
            archives: [
                'application/zip',
                'application/x-rar-compressed',
                'application/x-7z-compressed'
            ]
        };
    }

    // 初始化上传组件
    initUploadComponent(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('上传容器不存在:', containerId);
            return;
        }

        const config = {
            maxFiles: 10,
            maxSize: 10,
            allowEdit: true,
            autoSave: true,
            submissionId: null,
            ...options
        };

        this.maxFiles = config.maxFiles;
        this.maxFileSize = config.maxSize * 1024 * 1024;
        this.currentSubmissionId = config.submissionId;

        container.innerHTML = this.createUploadInterface(config);
        this.setupEventListeners();
        
        if (config.autoSave) {
            this.startAutoSave();
        }
        
        this.loadDraftData();
    }

    // 创建上传界面
    createUploadInterface(config) {
        return `
            <div class="enhanced-upload-container">
                <!-- 上传头部 -->
                <div class="upload-header">
                    <h3>📁 文件上传</h3>
                    <div class="upload-info">
                        <span>支持图片、文档、压缩包等多种格式</span>
                        <span>最多${config.maxFiles}个文件，每个不超过${config.maxSize}MB</span>
                    </div>
                </div>

                <!-- 上传操作 -->
                <div class="upload-actions-grid">
                    <button type="button" class="upload-action-btn" id="btnCamera">
                        <span class="action-icon">📷</span>
                        <span class="action-text">拍照上传</span>
                    </button>
                    <button type="button" class="upload-action-btn" id="btnGallery">
                        <span class="action-icon">🖼️</span>
                        <span class="action-text">选择文件</span>
                    </button>
                    <button type="button" class="upload-action-btn" id="btnDocument">
                        <span class="action-icon">📄</span>
                        <span class="action-text">文档上传</span>
                    </button>
                    <button type="button" class="upload-action-btn" id="btnArchive">
                        <span class="action-icon">📦</span>
                        <span class="action-text">压缩包</span>
                    </button>
                </div>

                <!-- 文件输入 -->
                <input type="file" id="fileInput" accept="*/*" multiple style="display: none;">

                <!-- 上传预览 -->
                <div class="upload-preview" id="uploadPreview">
                    <div class="preview-placeholder">
                        <span class="placeholder-icon">📁</span>
                        <span class="placeholder-text">点击上方按钮上传文件</span>
                        <small class="placeholder-hint">支持图片、PDF、Word、Excel、压缩包等格式</small>
                    </div>
                </div>

                <!-- 上传进度 -->
                <div class="upload-progress-container" id="uploadProgress" style="display: none;">
                    <div class="progress-header">
                        <span>上传进度</span>
                        <span class="progress-percent">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-details">
                        <span class="progress-speed">速度: 0 KB/s</span>
                        <span class="progress-time">预计剩余: --</span>
                        <span class="progress-files">文件: 0/${config.maxFiles}</span>
                    </div>
                </div>

                <!-- 上传状态 -->
                <div class="upload-status" id="uploadStatus" style="display: none;">
                    <div class="status-item">
                        <span class="status-icon">📊</span>
                        <span class="status-text">准备上传</span>
                    </div>
                </div>

                <!-- 底部操作 -->
                <div class="upload-footer">
                    <button type="button" class="footer-btn secondary" id="btnClearAll">
                        🗑️ 清空所有
                    </button>
                    <button type="button" class="footer-btn" id="btnSaveDraft">
                        💾 保存草稿
                    </button>
                    <button type="button" class="footer-btn primary" id="btnStartUpload">
                        🚀 开始上传
                    </button>
                </div>

                <!-- 自动保存提示 -->
                <div class="auto-save-indicator" id="autoSaveIndicator">
                    <span class="save-icon">💾</span>
                    <span class="save-text">自动保存中...</span>
                    <span class="save-time" id="lastSaveTime"></span>
                </div>
            </div>
        `;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 上传按钮
        document.getElementById('btnCamera').addEventListener('click', () => {
            this.openCamera();
        });

        document.getElementById('btnGallery').addEventListener('click', () => {
            this.openFileSelector('*/*');
        });

        document.getElementById('btnDocument').addEventListener('click', () => {
            this.openFileSelector('.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv');
        });

        document.getElementById('btnArchive').addEventListener('click', () => {
            this.openFileSelector('.zip,.rar,.7z');
        });

        // 文件选择
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // 操作按钮
        document.getElementById('btnClearAll').addEventListener('click', () => {
            this.clearAllFiles();
        });

        document.getElementById('btnSaveDraft').addEventListener('click', () => {
            this.saveDraft();
        });

        document.getElementById('btnStartUpload').addEventListener('click', () => {
            this.startUpload();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveDraft();
            }
        });

        // 页面离开提示
        window.addEventListener('beforeunload', (e) => {
            if (this.uploadQueue.length > 0 && !this.isUploading) {
                e.preventDefault();
                e.returnValue = '您有未保存的文件，确定要离开吗？';
                return e.returnValue;
            }
        });
    }

    // 打开文件选择器
    openFileSelector(accept) {
        const fileInput = document.getElementById('fileInput');
        fileInput.accept = accept;
        fileInput.click();
    }

    // 处理文件选择
    handleFileSelect(files) {
        const validFiles = [];
        const errors = [];

        // 检查文件数量限制
        if (this.uploadQueue.length + files.length > this.maxFiles) {
            this.showError(`最多只能上传${this.maxFiles}个文件`);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 验证文件类型
            if (!this.isFileTypeSupported(file.type, file.name)) {
                errors.push(`${file.name}: 不支持的文件类型`);
                continue;
            }

            // 验证文件大小
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name}: 文件大小超过${this.maxFileSize / 1024 / 1024}MB限制`);
                continue;
            }

            validFiles.push(file);
        }

        // 显示错误信息
        if (errors.length > 0) {
            this.showError(errors.join('\n'));
        }

        // 处理有效文件
        if (validFiles.length > 0) {
            this.processFiles(validFiles);
        }
    }

    // 检查文件类型是否支持
    isFileTypeSupported(type, filename) {
        // 检查MIME类型
        const allTypes = [
            ...this.supportedTypes.images,
            ...this.supportedTypes.documents,
            ...this.supportedTypes.archives
        ];

        if (allTypes.includes(type)) {
            return true;
        }

        // 检查文件扩展名
        const extension = filename.split('.').pop().toLowerCase();
        const supportedExtensions = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed'
        };

        return supportedExtensions[extension] !== undefined;
    }

    // 处理文件
    async processFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // 生成文件预览
                const previewData = await this.generateFilePreview(file);
                
                // 添加到上传队列
                this.uploadQueue.push({
                    file: file,
                    preview: previewData,
                    status: 'pending',
                    progress: 0,
                    uploadTime: null,
                    size: file.size
                });

                // 更新界面
                this.updatePreview();
                this.updateProgress();
                
            } catch (error) {
                console.error('文件处理失败:', error);
                this.showError(`文件 ${file.name} 处理失败`);
            }
        }

        // 自动保存
        this.autoSave();
    }

    // 生成文件预览
    async generateFilePreview(file) {
        return new Promise((resolve) => {
            const fileType = this.getFileType(file.type, file.name);
            
            if (fileType === 'image') {
                // 图片预览
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        type: 'image',
                        url: e.target.result,
                        thumbnail: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            } else {
                // 其他文件类型
                const icon = this.getFileIcon(fileType);
                resolve({
                    type: fileType,
                    url: null,
                    thumbnail: icon,
                    filename: file.name,
                    size: this.formatFileSize(file.size)
                });
            }
        });
    }

    // 获取文件类型
    getFileType(mimeType, filename) {
        if (this.supportedTypes.images.includes(mimeType)) {
            return 'image';
        } else if (this.supportedTypes.documents.includes(mimeType)) {
            return 'document';
        } else if (this.supportedTypes.archives.includes(mimeType)) {
            return 'archive';
        } else {
            // 根据扩展名判断
            const ext = filename.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
                return 'image';
            } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].includes(ext)) {
                return 'document';
            } else if (['zip', 'rar', '7z'].includes(ext)) {
                return 'archive';
            }
            return 'unknown';
        }
    }

    // 获取文件图标
    getFileIcon(fileType) {
        const icons = {
            image: '🖼️',
            document: '📄',
            archive: '📦',
            unknown: '📁'
        };
        return icons[fileType] || '📁';
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 更新预览界面
    updatePreview() {
        const previewContainer = document.getElementById('uploadPreview');
        
        if (this.uploadQueue.length === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <span class="placeholder-icon">📁</span>
                    <span class="placeholder-text">点击上方按钮上传文件</span>
                    <small class="placeholder-hint">支持图片、PDF、Word、Excel、压缩包等格式</small>
                </div>
            `;
            return;
        }

        const filesHtml = this.uploadQueue.map((item, index) => {
            const file = item.file;
            const preview = item.preview;
            
            return `
                <div class="file-preview-item" data-index="${index}">
                    <div class="file-preview-content">
                        <div class="file-icon">${preview.thumbnail}</div>
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-details">
                                <span class="file-size">${this.formatFileSize(file.size)}</span>
                                <span class="file-status">${this.getStatusText(item.status)}</span>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="action-btn edit-btn" onclick="enhancedUploader.editFile(${index})">✏️</button>
                            <button class="action-btn remove-btn" onclick="enhancedUploader.removeFile(${index})">🗑️</button>
                        </div>
                    </div>
                    <div class="file-progress" style="display: ${item.status === 'uploading' ? 'block' : 'none'}">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        previewContainer.innerHTML = filesHtml;
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            pending: '等待上传',
            uploading: '上传中',
            completed: '已完成',
            error: '上传失败'
        };
        return statusMap[status] || '未知状态';
    }

    // 更新进度
    updateProgress() {
        const progressContainer = document.getElementById('uploadProgress');
        const totalFiles = this.uploadQueue.length;
        const uploadedFiles = this.uploadQueue.filter(item => item.status === 'completed').length;
        const progressPercent = totalFiles > 0 ? Math.round((uploadedFiles / totalFiles) * 100) : 0;

        if (this.isUploading) {
            progressContainer.style.display = 'block';
            
            // 更新进度条
            const progressFill = progressContainer.querySelector('.progress-fill');
            progressFill.style.width = progressPercent + '%';
            
            // 更新进度文本
            const progressPercentEl = progressContainer.querySelector('.progress-percent');
            progressPercentEl.textContent = progressPercent + '%';
            
            // 更新详细信息
            const progressDetails = progressContainer.querySelector('.progress-details');
            const speed = this.calculateUploadSpeed();
            const remainingTime = this.calculateRemainingTime();
            
            progressDetails.innerHTML = `
                <span class="progress-speed">速度: ${speed}</span>
                <span class="progress-time">预计剩余: ${remainingTime}</span>
                <span class="progress-files">文件: ${uploadedFiles}/${totalFiles}</span>
            `;
        } else {
            progressContainer.style.display = 'none';
        }
    }

    // 计算上传速度
    calculateUploadSpeed() {
        if (!this.uploadStartTime) return '0 KB/s';
        
        const elapsedTime = (Date.now() - this.uploadStartTime) / 1000; // 秒
        if (elapsedTime === 0) return '0 KB/s';
        
        const uploadedBytes = this.uploadQueue
            .filter(item => item.status === 'completed')
            .reduce((sum, item) => sum + item.size, 0);
        
        const speedKBps = (uploadedBytes / 1024) / elapsedTime;
        return speedKBps.toFixed(1) + ' KB/s';
    }

    // 计算剩余时间
    calculateRemainingTime() {
        if (!this.uploadStartTime) return '--';
        
        const uploadedBytes = this.uploadQueue
            .filter(item => item.status === 'completed')
            .reduce((sum, item) => sum + item.size, 0);
        
        const totalBytes = this.uploadQueue
            .reduce((sum, item) => sum + item.size, 0);
        
        const remainingBytes = totalBytes - uploadedBytes;
        if (remainingBytes <= 0) return '--';
        
        const elapsedTime = (Date.now() - this.uploadStartTime) / 1000;
        const speedBps = uploadedBytes / elapsedTime;
        
        if (speedBps === 0) return '--';
        
        const remainingSeconds = remainingBytes / speedBps;
        if (remainingSeconds < 60) {
            return Math.ceil(remainingSeconds) + '秒';
        } else if (remainingSeconds < 3600) {
            return Math.ceil(remainingSeconds / 60) + '分钟';
        } else {
            return Math.ceil(remainingSeconds / 3600) + '小时';
        }
    }

    // 开始上传
    async startUpload() {
        if (this.isUploading) {
            this.showError('上传正在进行中');
            return;
        }

        if (this.uploadQueue.length === 0) {
            this.showError('请先选择要上传的文件');
            return;
        }

        this.isUploading = true;
        this.uploadStartTime = Date.now();
        
        // 显示进度界面
        this.updateProgress();
        
        // 开始上传每个文件
        for (let i = 0; i < this.uploadQueue.length; i++) {
            if (this.uploadQueue[i].status === 'pending') {
                await this.uploadFile(i);
            }
        }
        
        this.isUploading = false;
        this.showSuccess('所有文件上传完成！');
        
        // 保存上传记录
        this.saveUploadRecord();
    }

    // 上传单个文件
    async uploadFile(index) {
        const item = this.uploadQueue[index];
        item.status = 'uploading';
        
        try {
            // 模拟上传过程
            for (let progress = 0; progress <= 100; progress += 10) {
                await this.delay(200); // 模拟网络延迟
                item.progress = progress;
                this.updateProgress();
            }
            
            item.status = 'completed';
            item.uploadTime = new Date().toISOString();
            
        } catch (error) {
            item.status = 'error';
            console.error('文件上传失败:', error);
            this.showError(`文件 ${item.file.name} 上传失败`);
        }
        
        this.updatePreview();
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 编辑文件
    editFile(index) {
        const item = this.uploadQueue[index];
        if (item.preview.type === 'image') {
            // 打开图片编辑器
            this.openImageEditor(item.file, index);
        } else {
            this.showInfo('该文件类型不支持编辑');
        }
    }

    // 移除文件
    removeFile(index) {
        this.uploadQueue.splice(index, 1);
        this.updatePreview();
        this.updateProgress();
        this.autoSave();
    }

    // 清空所有文件
    clearAllFiles() {
        if (this.uploadQueue.length === 0) {
            this.showInfo('没有文件需要清空');
            return;
        }
        
        if (confirm('确定要清空所有文件吗？')) {
            this.uploadQueue = [];
            this.updatePreview();
            this.updateProgress();
            this.clearDraft();
            this.showSuccess('所有文件已清空');
        }
    }

    // 自动保存
    autoSave() {
        const draftData = {
            files: this.uploadQueue.map(item => ({
                name: item.file.name,
                size: item.file.size,
                type: item.file.type,
                preview: item.preview,
                status: item.status
            })),
            timestamp: Date.now(),
            submissionId: this.currentSubmissionId
        };
        
        localStorage.setItem('upload_draft', JSON.stringify(draftData));
        this.updateLastSaveTime();
    }

    // 加载草稿数据
    loadDraftData() {
        const draftData = localStorage.getItem('upload_draft');
        if (draftData) {
            try {
                this.draftData = JSON.parse(draftData);
                this.showInfo('检测到未完成的草稿，已自动加载');
            } catch (error) {
                console.error('加载草稿失败:', error);
            }
        }
    }

    // 保存草稿
    saveDraft() {
        this.autoSave();
        this.showSuccess('草稿已保存');
    }

    // 清空草稿
    clearDraft() {
        localStorage.removeItem('upload_draft');
        this.draftData = null;
    }

    // 开始自动保存
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.uploadQueue.length > 0) {
                this.autoSave();
            }
        }, 30000); // 每30秒自动保存一次
    }

    // 停止自动保存
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // 更新最后保存时间
    updateLastSaveTime() {
        const lastSaveTimeEl = document.getElementById('lastSaveTime');
        if (lastSaveTimeEl) {
            const now = new Date();
            lastSaveTimeEl.textContent = now.toLocaleTimeString();
        }
    }

    // 保存上传记录
    saveUploadRecord() {
        const uploadRecord = {
            files: this.uploadQueue.filter(item => item.status === 'completed'),
            timestamp: Date.now(),
            submissionId: this.currentSubmissionId
        };
        
        // 保存到本地存储
        const records = JSON.parse(localStorage.getItem('upload_records') || '[]');
        records.push(uploadRecord);
        localStorage.setItem('upload_records', JSON.stringify(records));
        
        // 清空草稿
        this.clearDraft();
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            <span class="message-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="message-text">${message}</span>
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }
}

// 全局实例
let enhancedUploader = new EnhancedUploader();
