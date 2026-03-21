// ClassPet Pro - 图片上传组件
// 实现手机端图片上传功能，支持拍照和相册选择

class ImageUploader {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 10;
        this.supportedTypes = [
            // 图片格式
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            // 文档格式
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
            // 压缩格式
            'application/zip', 'application/x-rar-compressed',
            'application/x-7z-compressed'
        ];
        this.uploadQueue = [];
        this.isUploading = false;
        this.draftData = null; // 草稿数据
        this.autoSaveInterval = null; // 自动保存定时器
    }

    // 初始化图片上传组件
    initUploadComponent(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('上传容器不存在:', containerId);
            return;
        }

        const { 
            maxFiles = 10, 
            maxSize = 10, 
            allowEdit = true,
            autoSave = true 
        } = options;

        this.maxFiles = maxFiles;
        this.maxFileSize = maxSize * 1024 * 1024;

        container.innerHTML = `
            <div class="image-upload-container">
                <div class="upload-header">
                    <h3>📁 文件上传</h3>
                    <div class="upload-info">
                        <span>支持图片、文档、压缩包</span>
                        <span>最多${maxFiles}个文件，每个不超过${maxSize}MB</span>
                    </div>
                </div>
                
                <div class="upload-actions">
                    <button type="button" class="btn-upload-camera" id="btnCamera">
                        📷 拍照上传
                    </button>
                    <button type="button" class="btn-upload-gallery" id="btnGallery">
                        🖼️ 选择文件
                    </button>
                    <button type="button" class="btn-upload-document" id="btnDocument">
                        📄 文档上传
                    </button>
                </div>
                
                <input type="file" id="fileInput" 
                       accept="*/*" 
                       multiple 
                       style="display: none;">
                
                <div class="upload-preview" id="uploadPreview">
                    <div class="preview-placeholder">
                        <span>📁 点击上方按钮上传文件</span>
                        <small>支持图片、PDF、Word、Excel、压缩包等格式</small>
                    </div>
                </div>
                
                <div class="upload-progress" id="uploadProgress" style="display: none;">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">上传中... 0%</div>
                        <div class="progress-speed">速度: 0 KB/s</div>
                    </div>
                </div>
                
                <div class="upload-status" id="uploadStatus" style="display: none;">
                    <div class="status-item">
                        <span class="status-icon">📊</span>
                        <span class="status-text">准备上传</span>
                    </div>
                </div>
                
                <div class="upload-actions-bottom">
                    <button type="button" class="btn-clear-all" id="btnClearAll">
                        🗑️ 清空所有
                    </button>
                    <button type="button" class="btn-save-draft" id="btnSaveDraft">
                        💾 保存草稿
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
        
        if (autoSave) {
            this.startAutoSave();
        }
        
        // 加载草稿数据
        this.loadDraftData();
    }

    // 设置事件监听器
    setupEventListeners() {
        const btnCamera = document.getElementById('btnCamera');
        const btnGallery = document.getElementById('btnGallery');
        const fileInput = document.getElementById('fileInput');

        if (btnCamera) {
            btnCamera.addEventListener('click', () => {
                this.openCamera();
            });
        }

        if (btnGallery) {
            btnGallery.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }
    }

    // 打开摄像头（移动端）
    openCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    this.showCameraInterface(stream);
                })
                .catch((error) => {
                    console.error('无法访问摄像头:', error);
                    this.showError('无法访问摄像头，请检查权限设置');
                    // 回退到文件选择
                    document.getElementById('fileInput').click();
                });
        } else {
            // 不支持摄像头，回退到文件选择
            console.log('不支持摄像头，使用文件选择');
            document.getElementById('fileInput').click();
        }
    }

    // 显示摄像头界面
    showCameraInterface(stream) {
        const container = document.getElementById('uploadPreview');
        container.innerHTML = `
            <div class="camera-interface">
                <video id="cameraVideo" autoplay playsinline></video>
                <div class="camera-controls">
                    <button class="btn-capture" id="btnCapture">📸 拍照</button>
                    <button class="btn-cancel" id="btnCancelCamera">❌ 取消</button>
                </div>
            </div>
        `;

        const video = document.getElementById('cameraVideo');
        video.srcObject = stream;

        document.getElementById('btnCapture').addEventListener('click', () => {
            this.capturePhoto(video);
        });

        document.getElementById('btnCancelCamera').addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            this.showUploadPlaceholder();
        });
    }

    // 拍照
    capturePhoto(video) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `camera_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                
                this.handleFileSelect([file]);
            }
        }, 'image/jpeg', 0.8);

        // 停止摄像头
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    // 处理文件选择
    handleFileSelect(files) {
        const validFiles = [];
        const errors = [];

        // 检查文件数量限制
        const currentFiles = this.getCurrentFileCount();
        if (currentFiles + files.length > this.maxFiles) {
            this.showError(`最多只能上传${this.maxFiles}张图片`);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 验证文件类型
            if (!this.supportedTypes.includes(file.type)) {
                errors.push(`${file.name}: 不支持的文件类型`);
                continue;
            }

            // 验证文件大小
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name}: 文件大小超过5MB限制`);
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

    // 处理文件
    async processFiles(files) {
        this.showProgress();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                await this.uploadFile(file);
                this.updateProgress((i + 1) / files.length * 100);
            } catch (error) {
                console.error('文件上传失败:', error);
                this.showError(`文件 ${file.name} 上传失败`);
            }
        }

        this.hideProgress();
        this.refreshPreview();
    }

    // 上传文件
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            // 模拟上传过程
            setTimeout(() => {
                try {
                    const imageData = {
                        filename: `homework_${Date.now()}_${file.name}`,
                        originalName: file.name,
                        size: file.size,
                        type: file.type,
                        url: this.createObjectURL(file),
                        uploadedAt: Date.now()
                    };

                    // 添加到上传队列
                    this.uploadQueue.push(imageData);
                    resolve(imageData);
                } catch (error) {
                    reject(error);
                }
            }, 1000); // 模拟上传延迟
        });
    }

    // 创建对象URL
    createObjectURL(file) {
        return URL.createObjectURL(file);
    }

    // 获取当前文件数量
    getCurrentFileCount() {
        const preview = document.getElementById('uploadPreview');
        const images = preview.querySelectorAll('.preview-image');
        return images.length;
    }

    // 刷新预览
    refreshPreview() {
        const preview = document.getElementById('uploadPreview');
        
        if (this.uploadQueue.length === 0) {
            this.showUploadPlaceholder();
            return;
        }

        let html = '<div class="preview-grid">';
        
        this.uploadQueue.forEach((image, index) => {
            html += `
                <div class="preview-item">
                    <div class="preview-image">
                        <img src="${image.url}" alt="${image.originalName}">
                        <button class="btn-remove" data-index="${index}">×</button>
                    </div>
                    <div class="preview-info">
                        <div class="file-name">${this.truncateFileName(image.originalName)}</div>
                        <div class="file-size">${this.formatFileSize(image.size)}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        preview.innerHTML = html;
        
        // 添加删除按钮事件
        preview.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeImage(index);
            });
        });
    }

    // 删除图片
    removeImage(index) {
        if (index >= 0 && index < this.uploadQueue.length) {
            // 释放对象URL
            URL.revokeObjectURL(this.uploadQueue[index].url);
            
            this.uploadQueue.splice(index, 1);
            this.refreshPreview();
        }
    }

    // 显示上传占位符
    showUploadPlaceholder() {
        const preview = document.getElementById('uploadPreview');
        preview.innerHTML = `
            <div class="preview-placeholder">
                <span>📁 点击上方按钮上传图片</span>
                <small>最多可上传5张图片，每张不超过5MB</small>
            </div>
        `;
    }

    // 显示进度条
    showProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) {
            progress.style.display = 'block';
        }
    }

    // 更新进度
    updateProgress(percent) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
        
        if (progressText) {
            progressText.textContent = `上传中... ${Math.round(percent)}%`;
        }
    }

    // 隐藏进度条
    hideProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    // 显示错误信息
    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        errorDiv.innerHTML = `
            <span>❌ ${message}</span>
            <button class="btn-close-error">×</button>
        `;
        
        const container = document.querySelector('.image-upload-container');
        container.insertBefore(errorDiv, container.firstChild);
        
        // 自动隐藏错误
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
        
        // 关闭按钮事件
        errorDiv.querySelector('.btn-close-error').addEventListener('click', () => {
            errorDiv.remove();
        });
    }

    // 获取上传的图片数据
    getUploadedImages() {
        return [...this.uploadQueue];
    }

    // 清空上传队列
    clearUploadQueue() {
        // 释放所有对象URL
        this.uploadQueue.forEach(image => {
            URL.revokeObjectURL(image.url);
        });
        
        this.uploadQueue = [];
        this.refreshPreview();
    }

    // 工具函数：截断文件名
    truncateFileName(filename, maxLength = 15) {
        if (filename.length <= maxLength) {
            return filename;
        }
        return filename.substring(0, maxLength - 3) + '...';
    }

    // 工具函数：格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 全局实例
let imageUploader = null;

// 初始化图片上传器
function initImageUploader() {
    if (!imageUploader) {
        imageUploader = new ImageUploader();
    }
    return imageUploader;
}

// 获取图片上传器实例
function getImageUploader() {
    return imageUploader;
}