// ClassPet Pro - 自定义图片上传模块

class PetCustomImageUploader {
  constructor(dataManager) {
    this.data = dataManager;
    this.currentStudentId = null;
    this.toggleSwitch = null;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 图片上传
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const fileInput = document.getElementById('customImageInput');

    if (uploadPlaceholder && fileInput) {
      uploadPlaceholder.addEventListener('click', () => {
        fileInput.click();
      });

      // 拖拽上传
      uploadPlaceholder.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadPlaceholder.classList.add('dragover');
      });

      uploadPlaceholder.addEventListener('dragleave', () => {
        uploadPlaceholder.classList.remove('dragover');
      });

      uploadPlaceholder.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadPlaceholder.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
          this.handleFileSelect(file);
        }
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleFileSelect(file);
        }
      });
    }

    // 自定义图片开关
    this.toggleSwitch = document.getElementById('customImageToggle');
    if (this.toggleSwitch) {
      this.toggleSwitch.addEventListener('change', (e) => {
        this.toggleCustomImage(e.target.checked);
      });
    }

    // 删除自定义图片
    const removeBtn = document.getElementById('btnRemoveImage');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.removeCustomImage();
      });
    }

    // 保存按钮
    const saveBtn = document.getElementById('btnSaveImage');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveAndClose();
      });
    }

    // 关闭弹窗
    const closeBtn = document.querySelector('#customImageModal .close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // 点击弹窗外部关闭
    const modal = document.getElementById('customImageModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  }

  // 显示上传界面
  showUploadModal(studentId) {
    this.currentStudentId = studentId;
    const student = this.data.getStudent(studentId);

    if (!student) {
      alert('学生不存在！');
      return;
    }

    if (!student.pet || !student.pet.petId) {
      alert('请先认养宠物！');
      return;
    }

    // 显示当前宠物信息
    const pet = getPetById(student.pet.petId);
    document.getElementById('uploadPetName').textContent = pet.name;

    const stage = this.getStageByScore(student.score);
    const emoji = getPetEmoji(student.pet.petId, stage);
    document.getElementById('uploadCurrentEmoji').textContent = emoji;

    // 显示当前自定义图片（如果有）
    const customImagePreview = document.getElementById('currentCustomImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');

    if (student.pet.customImage) {
      customImagePreview.src = student.pet.customImage;
      customImagePreview.hidden = false;
      uploadPlaceholder.hidden = true;
    } else {
      customImagePreview.hidden = true;
      uploadPlaceholder.hidden = false;
    }

    // 显示开关状态
    if (this.toggleSwitch) {
      this.toggleSwitch.checked = student.pet.customImageEnabled && !!student.pet.customImage;
    }

    // 显示弹窗
    this.showModal();
  }

  // 处理文件选择
  async handleFileSelect(file) {
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB！');
      return;
    }

    try {
      // 压缩图片
      const compressed = await this.compressImage(file);

      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        const customImagePreview = document.getElementById('currentCustomImage');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');

        customImagePreview.src = e.target.result;
        customImagePreview.hidden = false;
        uploadPlaceholder.hidden = true;

        // 暂存base64（点击保存时才真正保存）
        this.tempCustomImage = e.target.result;
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      alert('图片处理失败：' + error.message);
      console.error(error);
    }
  }

  // 压缩图片（限制512x512，质量0.85）
  compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 512;
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/png' }));
          }, 'image/png', 0.85);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 删除自定义图片
  removeCustomImage() {
    if (!confirm('确定要删除自定义图片吗？')) return;

    const student = this.data.getStudent(this.currentStudentId);
    if (student && student.pet) {
      student.pet.customImage = null;
      student.pet.customImageEnabled = false;

      this.data.saveStudents();

      // 更新UI
      const customImagePreview = document.getElementById('currentCustomImage');
      const uploadPlaceholder = document.getElementById('uploadPlaceholder');

      customImagePreview.hidden = true;
      uploadPlaceholder.hidden = false;

      if (this.toggleSwitch) {
        this.toggleSwitch.checked = false;
      }

      // 刷新主页面的宠物显示
      if (window.ClassPet && window.ClassPet.ui && window.ClassPet.ui.renderPetGrid) {
        window.ClassPet.ui.renderPetGrid();
      }

      alert('自定义图片已删除！');
    }
  }

  // 切换自定义图片开关
  toggleCustomImage(enabled) {
    const student = this.data.getStudent(this.currentStudentId);

    if (!student || !student.pet) return;

    // 启用：需要有自定义图片
    if (enabled && !student.pet.customImage) {
      alert('请先上传自定义图片！');
      this.toggleSwitch.checked = false;
      return;
    }

    student.pet.customImageEnabled = enabled;
    this.data.saveStudents();

    // 刷新主页面的宠物显示
    if (window.ClassPet && window.ClassPet.ui && window.ClassPet.ui.renderPetGrid) {
      window.ClassPet.ui.renderPetGrid();
    }
  }

  // 保存并关闭
  saveAndClose() {
    if (!this.tempCustomImage) {
      // 没有新图片，只是关闭
      this.closeModal();
      return;
    }

    const student = this.data.getStudent(this.currentStudentId);
    if (student && student.pet) {
      // 保存自定义图片
      student.pet.customImage = this.tempCustomImage;
      student.pet.customImageEnabled = true;

      this.data.saveStudents();

      // 更新开关状态
      if (this.toggleSwitch) {
        this.toggleSwitch.checked = true;
      }

      // 刷新主页面的宠物显示
      if (window.ClassPet && window.ClassPet.ui && window.ClassPet.ui.renderPetGrid) {
        window.ClassPet.ui.renderPetGrid();
      }

      // 清除临时数据
      this.tempCustomImage = null;

      alert('自定义图片保存成功！');
      this.closeModal();
    }
  }

  // 显示弹窗
  showModal() {
    const modal = document.getElementById('customImageModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  // 关闭弹窗
  closeModal() {
    const modal = document.getElementById('customImageModal');
    if (modal) {
      modal.classList.remove('active');
    }

    // 清除临时数据
    this.tempCustomImage = null;
  }

  // 根据积分获取阶段
  getStageByScore(score) {
    if (score >= 300) return 'ADULT';
    if (score >= 150) return 'YOUNG';
    if (score >= 50) return 'BABY';
    return 'EGG';
  }
}

// 导出
window.PetCustomImageUploader = PetCustomImageUploader;

// 全局函数：显示自定义图片上传界面（供HTML调用）
function showCustomImageUpload(studentId) {
  if (window.ClassPet && window.ClassPet.customImageUploader) {
    window.ClassPet.customImageUploader.showUploadModal(studentId);
  }
}
