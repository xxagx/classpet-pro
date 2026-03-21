// ClassPet Pro - 手机端图片上传组件
// 支持拍照、相册选择、图片预览、压缩上传等功能

class MobileImageUploader {
    constructor(options = {}) {
        this.config = {
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            maxFiles: options.maxFiles || 9, // 最多 9 张
            minWidth: options.minWidth || 100, // 最小宽度
            minHeight: options.minHeight || 100, // 最小高度
            quality: options.quality || 0.8, // 压缩质量
            outputFormat: options.outputFormat || 'jpeg', // 输出格式
            containerId: options.containerId,
            onFilesSelected: options.onFilesSelected || null,
            onUploadProgress: options.onUploadProgress || null,
            onUploadComplete: options.onUploadComplete || null,
            onUploadError: options.onUploadError || null
        };

        this.selectedFiles = [];
        this.uploadingFiles = [];
        this.uploadedFiles = [];
        this.fileInput = null;
        this.cameraInput = null;
    }

    // 初始化上传组件
    init() {
        if (!this.config.containerId) {
            console.error('未指定容器 ID');
            return;
        }

        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error('容器不存在:', this.config.containerId);
            return;
        }

        this.renderUploadInterface(container);
        this.bindEvents();
    }

    // 渲染上传界面
    renderUploadInterface(container) {
        container.innerHTML = `
            <div class="mobile-image-uploader">
                <!-- 上传区域 -->
                <div class="upload-area" id="uploadArea">
                    <div class="upload-options">
                        <button type="button" class="upload-option-btn camera" id="btnCamera">
                            <div class="option-icon">📷</div>
                            <div class="option-text">拍照</div>
                        </button>
                        <button type="button" class="upload-option-btn gallery" id="btnGallery">
                            <div class="option-icon">🖼️</div>
                            <div class="option-text">相册</div>
                        </button>
                    </div>
                    <div class="upload-hint">
                        <span>支持 JPG、PNG 格式</span>
                        <span>最多${this.config.maxFiles}张，每张不超过${this.config.maxFileSize / 1024 / 1024}MB</span>
                    </div>
                </div>

                <!-- 隐藏的文件输入 -->
                <input 
                    type="file" 
                    id="galleryInput" 
                    accept="image/*" 
                    multiple 
                    hidden
                    capture=""
                >
                <input 
                    type="file" 
                    id="cameraInput" 
                    accept="image/*" 
                    capture="environment"
                    hidden
                >

                <!-- 已选文件预览 -->
                <div class="selected-files-preview" id="selectedFilesPreview">
                    <!-- 动态生成 -->
                </div>

                <!-- 上传进度 -->
                <div class="upload-progress-container" id="uploadProgressContainer" style="display: none;">
                    <div class="progress-header">
                        <span class="progress-text">正在上传...</span>
                        <span class="progress-percent" id="uploadPercent">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>

                <!-- 上传状态 -->
                <div class="upload-status" id="uploadStatus" style="display: none;">
                    <div class="status-icon"></div>
                    <div class="status-message"></div>
                </div>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        const btnCamera = document.getElementById('btnCamera');
        const btnGallery = document.getElementById('btnGallery');
        this.cameraInput = document.getElementById('cameraInput');
        this.fileInput = document.getElementById('galleryInput');

        if (btnCamera) {
            btnCamera.addEventListener('click', () => {
                this.cameraInput.click();
            });
        }

        if (btnGallery) {
            btnGallery.addEventListener('click', () => {
                this.fileInput.click();
            });
        }

        // 拍照选择
        if (this.cameraInput) {
            this.cameraInput.addEventListener('change', (e) => {
                this.handleFilesSelected(e.target.files);
            });
        }

        // 相册选择
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                this.handleFilesSelected(e.target.files);
            });
        }
    }

    // 处理文件选择
    async handleFilesSelected(files) {
        const fileArray = Array.from(files);
        
        // 验证文件数量
        if (this.selectedFiles.length + fileArray.length > this.config.maxFiles) {
            this.showStatus('error', `最多只能选择${this.config.maxFiles}张图片`);
            return;
        }

        // 验证并处理每个文件
        for (const file of fileArray) {
            const validationResult = await this.validateFile(file);
            
            if (!validationResult.valid) {
                this.showStatus('error', validationResult.message);
                continue;
            }

            // 压缩图片
            try {
                const compressedFile = await this.compressImage(file);
                this.selectedFiles.push({
                    file: compressedFile,
                    preview: await this.createPreview(compressedFile),
                    status: 'pending',
                    progress: 0
                });
            } catch (error) {
                console.error('图片处理失败:', error);
                this.showStatus('error', `图片处理失败：${error.message}`);
            }
        }

        // 更新预览
        this.renderSelectedFiles();

        // 回调
        if (this.config.onFilesSelected) {
            this.config.onFilesSelected(this.selectedFiles);
        }
    }

    // 验证文件
    async validateFile(file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                message: '请选择图片文件'
            };
        }

        // 检查文件大小
        if (file.size > this.config.maxFileSize) {
            return {
                valid: false,
                message: `图片大小不能超过${this.config.maxFileSize / 1024 / 1024}MB`
            };
        }

        // 检查图片尺寸
        try {
            const dimensions = await this.getImageDimensions(file);
            if (dimensions.width < this.config.minWidth || dimensions.height < this.config.minHeight) {
                return {
                    valid: false,
                    message: `图片尺寸不能小于${this.config.minWidth}x${this.config.minHeight}`
                };
            }
        } catch (error) {
            console.error('获取图片尺寸失败:', error);
        }

        return { valid: true };
    }

    // 获取图片尺寸
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
                URL.revokeObjectURL(url);
            };
            
            img.onerror = () => {
                reject(new Error('无法加载图片'));
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        });
    }

    // 压缩图片
    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 计算缩放比例
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 1920; // 最大边长
                    
                    if (width > maxSize || height > maxSize) {
                        const ratio = Math.min(maxSize / width, maxSize / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 绘制图片
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换为 Blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File(
                                    [blob],
                                    file.name.replace(/\.[^/.]+$/, '.jpg'),
                                    { type: 'image/jpeg' }
                                );
                                resolve(compressedFile);
                            } else {
                                reject(new Error('压缩失败'));
                            }
                        },
                        'image/jpeg',
                        this.config.quality
                    );
                };
                
                img.onerror = () => {
                    reject(new Error('图片加载失败'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    // 创建预览
    createPreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    // 渲染已选文件
    renderSelectedFiles() {
        const container = document.getElementById('selectedFilesPreview');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="selected-files-grid">
                ${this.selectedFiles.map((item, index) => `
                    <div class="selected-file-item" data-index="${index}">
                        <img src="${item.preview}" alt="预览">
                        <div class="file-info">
                            <span class="file-name">${item.file.name}</span>
                            <span class="file-size">${this.formatFileSize(item.file.size)}</span>
                        </div>
                        <div class="file-status ${item.status}">
                            ${item.status === 'pending' ? '⏳' : 
                              item.status === 'uploading' ? `⬆️ ${item.progress}%` :
                              item.status === 'success' ? '✅' : '❌'}
                        </div>
                        <button type="button" class="remove-file-btn" data-index="${index}">
                            ✕
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // 绑定删除事件
        container.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFile(index);
            });
        });
    }

    // 删除文件
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderSelectedFiles();
        
        if (this.config.onFilesSelected) {
            this.config.onFilesSelected(this.selectedFiles);
        }
    }

    // 上传文件
    async uploadFiles(uploadUrl = '/api/upload') {
        if (this.selectedFiles.length === 0) {
            this.showStatus('error', '请先选择图片');
            return;
        }

        const pendingFiles = this.selectedFiles.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) {
            this.showStatus('error', '没有需要上传的文件');
            return;
        }

        this.showProgress();

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < pendingFiles.length; i++) {
            const fileItem = pendingFiles[i];
            const index = this.selectedFiles.indexOf(fileItem);
            
            try {
                // 更新状态
                fileItem.status = 'uploading';
                this.renderSelectedFiles();

                // 模拟上传（实际使用时替换为真实上传逻辑）
                const uploadedFile = await this.simulateUpload(fileItem.file, i, pendingFiles.length);
                
                // 上传成功
                fileItem.status = 'success';
                fileItem.uploadedUrl = uploadedFile.url;
                this.uploadedFiles.push(uploadedFile);
                successCount++;

            } catch (error) {
                console.error('上传失败:', error);
                fileItem.status = 'error';
                fileItem.errorMessage = error.message;
                failCount++;
            }

            // 更新进度
            const progress = Math.round(((i + 1) / pendingFiles.length) * 100);
            this.updateProgress(progress);
            this.renderSelectedFiles();
        }

        // 上传完成
        this.hideProgress();

        // 显示结果
        if (failCount === 0) {
            this.showStatus('success', `上传成功 ${successCount} 张图片`);
        } else {
            this.showStatus('error', `上传完成：成功${successCount}张，失败${failCount}张`);
        }

        // 回调
        if (this.config.onUploadComplete) {
            this.config.onUploadComplete({
                success: failCount === 0,
                successCount,
                failCount,
                uploadedFiles: this.uploadedFiles,
                failedFiles: this.selectedFiles.filter(f => f.status === 'error')
            });
        }
    }

    // 模拟上传（替换为真实上传逻辑）
    simulateUpload(file, index, total) {
        return new Promise((resolve, reject) => {
            // 模拟网络延迟
            const delay = 500 + Math.random() * 1000;
            
            setTimeout(() => {
                // 模拟 90% 成功率
                if (Math.random() > 0.1) {
                    resolve({
                        name: file.name,
                        size: file.size,
                        url: `/uploads/${Date.now()}_${file.name}`,
                        uploadedAt: new Date().toISOString()
                    });
                } else {
                    reject(new Error('网络错误，上传失败'));
                }
            }, delay);
        });
    }

    // 真实上传到服务器
    async uploadToServer(file, uploadUrl) {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    if (this.config.onUploadProgress) {
                        this.config.onUploadProgress(percent);
                    }
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('响应解析失败'));
                    }
                } else {
                    reject(new Error(`上传失败：${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('网络错误'));
            });

            xhr.open('POST', uploadUrl);
            xhr.send(formData);
        });
    }

    // 显示进度
    showProgress() {
        const container = document.getElementById('uploadProgressContainer');
        if (container) {
            container.style.display = 'block';
        }
    }

    // 隐藏进度
    hideProgress() {
        const container = document.getElementById('uploadProgressContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    // 更新进度
    updateProgress(percent) {
        const fill = document.getElementById('progressFill');
        const percentText = document.getElementById('uploadPercent');
        
        if (fill) {
            fill.style.width = `${percent}%`;
        }
        
        if (percentText) {
            percentText.textContent = `${percent}%`;
        }
    }

    // 显示状态
    showStatus(type, message) {
        const container = document.getElementById('uploadStatus');
        if (!container) return;

        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        container.innerHTML = `
            <div class="status-icon">${iconMap[type] || 'ℹ️'}</div>
            <div class="status-message">${message}</div>
        `;
        container.style.display = 'flex';
        container.className = `upload-status ${type}`;

        // 3 秒后自动隐藏
        setTimeout(() => {
            container.style.display = 'none';
        }, 3000);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        }
    }

    // 获取已上传的文件
    getUploadedFiles() {
        return this.uploadedFiles;
    }

    // 清空所有文件
    clearAll() {
        this.selectedFiles = [];
        this.uploadingFiles = [];
        this.uploadedFiles = [];
        this.renderSelectedFiles();
        this.hideProgress();
    }
}

// 全局注册
window.MobileImageUploader = MobileImageUploader;
