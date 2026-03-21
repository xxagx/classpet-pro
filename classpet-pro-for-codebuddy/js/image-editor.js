// ClassPet Pro - 图片编辑器组件
// 支持图片预览、裁剪、旋转等编辑操作

class ImageEditor {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.currentImage = null;
        this.rotation = 0;
        this.scale = 1;
        this.cropArea = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
    }

    // 初始化编辑器
    initEditor(containerId, imageSrc) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('编辑器容器不存在:', containerId);
            return;
        }

        container.innerHTML = `
            <div class="image-editor-container">
                <div class="editor-toolbar">
                    <button class="tool-btn" id="btnRotateLeft">🔄 左旋转</button>
                    <button class="tool-btn" id="btnRotateRight">🔄 右旋转</button>
                    <button class="tool-btn" id="btnCrop">✂️ 裁剪</button>
                    <button class="tool-btn" id="btnReset">🔄 重置</button>
                    <button class="tool-btn" id="btnZoomIn">➕ 放大</button>
                    <button class="tool-btn" id="btnZoomOut">➖ 缩小</button>
                </div>
                
                <div class="editor-canvas-container">
                    <canvas id="editorCanvas" width="400" height="400"></canvas>
                    <div class="crop-overlay" id="cropOverlay" style="display: none;">
                        <div class="crop-handle top-left"></div>
                        <div class="crop-handle top-right"></div>
                        <div class="crop-handle bottom-left"></div>
                        <div class="crop-handle bottom-right"></div>
                    </div>
                </div>
                
                <div class="editor-actions">
                    <button class="btn-secondary" id="btnCancelEdit">取消</button>
                    <button class="btn-primary" id="btnSaveEdit">保存修改</button>
                </div>
            </div>
        `;

        this.setupCanvas(imageSrc);
        this.setupEventListeners();
    }

    // 设置画布
    setupCanvas(imageSrc) {
        this.canvas = document.getElementById('editorCanvas');
        this.context = this.canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.drawImage();
        };
        img.src = imageSrc;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 旋转按钮
        document.getElementById('btnRotateLeft').addEventListener('click', () => {
            this.rotate(-90);
        });

        document.getElementById('btnRotateRight').addEventListener('click', () => {
            this.rotate(90);
        });

        // 裁剪按钮
        document.getElementById('btnCrop').addEventListener('click', () => {
            this.toggleCropMode();
        });

        // 重置按钮
        document.getElementById('btnReset').addEventListener('click', () => {
            this.reset();
        });

        // 缩放按钮
        document.getElementById('btnZoomIn').addEventListener('click', () => {
            this.zoom(1.1);
        });

        document.getElementById('btnZoomOut').addEventListener('click', () => {
            this.zoom(0.9);
        });

        // 保存按钮
        document.getElementById('btnSaveEdit').addEventListener('click', () => {
            this.saveEditedImage();
        });

        // 取消按钮
        document.getElementById('btnCancelEdit').addEventListener('click', () => {
            this.closeEditor();
        });

        // 裁剪区域拖拽
        this.setupCropHandlers();
    }

    // 设置裁剪处理器
    setupCropHandlers() {
        const cropOverlay = document.getElementById('cropOverlay');
        const canvas = this.canvas;

        cropOverlay.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            
            const rect = cropOverlay.getBoundingClientRect();
            this.cropArea = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.cropArea) return;

            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;

            cropOverlay.style.left = (this.cropArea.x + deltaX) + 'px';
            cropOverlay.style.top = (this.cropArea.y + deltaY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    // 绘制图片
    drawImage() {
        if (!this.currentImage) return;

        const canvas = this.canvas;
        const ctx = this.context;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 保存当前状态
        ctx.save();
        
        // 移动到画布中心
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // 应用旋转
        ctx.rotate(this.rotation * Math.PI / 180);
        
        // 应用缩放
        ctx.scale(this.scale, this.scale);
        
        // 绘制图片
        const width = this.currentImage.width;
        const height = this.currentImage.height;
        ctx.drawImage(this.currentImage, -width / 2, -height / 2, width, height);
        
        // 恢复状态
        ctx.restore();
    }

    // 旋转图片
    rotate(degrees) {
        this.rotation += degrees;
        this.drawImage();
    }

    // 缩放图片
    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.max(0.1, Math.min(5, this.scale)); // 限制缩放范围
        this.drawImage();
    }

    // 切换裁剪模式
    toggleCropMode() {
        const cropOverlay = document.getElementById('cropOverlay');
        if (cropOverlay.style.display === 'none') {
            cropOverlay.style.display = 'block';
            this.setupCropArea();
        } else {
            cropOverlay.style.display = 'none';
        }
    }

    // 设置裁剪区域
    setupCropArea() {
        const cropOverlay = document.getElementById('cropOverlay');
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // 设置初始裁剪区域（中心80%的区域）
        const width = canvasRect.width * 0.8;
        const height = canvasRect.height * 0.8;
        const x = (canvasRect.width - width) / 2;
        const y = (canvasRect.height - height) / 2;
        
        cropOverlay.style.width = width + 'px';
        cropOverlay.style.height = height + 'px';
        cropOverlay.style.left = x + 'px';
        cropOverlay.style.top = y + 'px';
    }

    // 重置编辑器
    reset() {
        this.rotation = 0;
        this.scale = 1;
        this.drawImage();
        
        const cropOverlay = document.getElementById('cropOverlay');
        cropOverlay.style.display = 'none';
    }

    // 保存编辑后的图片
    saveEditedImage() {
        if (!this.currentImage) return null;

        // 创建临时画布进行裁剪
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 设置画布尺寸
        tempCanvas.width = this.currentImage.width;
        tempCanvas.height = this.currentImage.height;
        
        // 应用旋转和缩放
        tempCtx.save();
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(this.rotation * Math.PI / 180);
        tempCtx.scale(this.scale, this.scale);
        tempCtx.drawImage(this.currentImage, -tempCanvas.width / 2, -tempCanvas.height / 2);
        tempCtx.restore();
        
        // 转换为Blob
        return new Promise((resolve) => {
            tempCanvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.8);
        });
    }

    // 关闭编辑器
    closeEditor() {
        const container = document.querySelector('.image-editor-container');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}

// 全局实例
let imageEditor = null;

// 初始化图片编辑器
function initImageEditor(containerId, imageSrc) {
    if (!imageEditor) {
        imageEditor = new ImageEditor();
    }
    imageEditor.initEditor(containerId, imageSrc);
    return imageEditor;
}

// 获取图片编辑器实例
function getImageEditor() {
    return imageEditor;
}