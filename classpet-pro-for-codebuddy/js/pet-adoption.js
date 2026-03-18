// ClassPet Pro - 宠物认养功能模块

class PetAdoptionManager {
  constructor(dataManager) {
    this.data = dataManager;
    this.currentStudentId = null;
    this.currentStyle = 'all';
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 风格筛选按钮
    const filterBtns = document.querySelectorAll('.adoption-center .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const style = e.currentTarget.dataset.style;
        this.filterByStyle(style, e.currentTarget);
      });
    });

    // 关闭弹窗
    const closeBtn = document.querySelector('#adoptionCenterModal .close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // 点击弹窗外部关闭
    const modal = document.getElementById('adoptionCenterModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  }

  // 显示认养中心
  showAdoptionCenter(studentId) {
    this.currentStudentId = studentId;
    const student = this.data.getStudent(studentId);
    
    if (!student) {
      alert('学生不存在！');
      return;
    }

    // 显示当前宠物信息
    this.renderCurrentPet(student);
    
    // 显示学生积分
    document.getElementById('myScore').textContent = student.score;
    
    // 渲染可认养的宠物
    this.renderPetLibrary(student);
    
    // 显示弹窗
    this.showModal();
  }

  // 渲染当前宠物
  renderCurrentPet(student) {
    const container = document.getElementById('currentPetCard');
    
    if (!student.pet || !student.pet.petId) {
      container.innerHTML = '<div class="current-pet-empty">暂无宠物，请认养</div>';
      return;
    }

    const pet = getPetById(student.pet.petId);
    const stage = getStageByScore(student.score);
    const emoji = getPetEmoji(student.pet.petId, stage);
    const rarityInfo = RARITY_CONFIG[pet.rarity];

    container.innerHTML = `
      <div class="current-pet-emoji">${emoji}</div>
      <div class="current-pet-info">
        <div class="pet-name">${pet.name}</div>
        <div class="pet-meta">
          <span class="pet-style">${STYLE_CONFIG[pet.style].name}</span>
          <span class="pet-rarity" style="background-color: ${rarityInfo.bgColor}; color: ${rarityInfo.color};">${rarityInfo.name}</span>
        </div>
      </div>
    `;
  }

  // 渲染宠物库
  renderPetLibrary(student) {
    const container = document.getElementById('petLibraryGrid');
    if (!container) return;

    const availablePets = this.getAvailablePets(student);

    if (availablePets.length === 0) {
      container.innerHTML = '<div class="no-pets-message">暂无可认养的宠物</div>';
      return;
    }

    container.innerHTML = availablePets.map(pet => {
      const stageEmoji = getPetEmoji(pet.id, 'BABY');
      const rarityInfo = RARITY_CONFIG[pet.rarity];
      const canAfford = student.score >= pet.cost;
      const isCurrentPet = student.pet?.petId === pet.id;

      return `
        <div class="pet-library-item ${!canAfford ? 'disabled' : ''} ${isCurrentPet ? 'current' : ''}"
             data-pet-id="${pet.id}">
          <div class="pet-card-emoji">${stageEmoji}</div>
          <div class="pet-card-info">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-meta">
              <span class="pet-style-tag">${STYLE_CONFIG[pet.style].emoji}</span>
              <span class="pet-rarity-tag" style="background-color: ${rarityInfo.bgColor}; color: ${rarityInfo.color};">${rarityInfo.name}</span>
            </div>
          </div>
          <div class="pet-card-cost">
            ${pet.cost === 0 ? '免费' : `${pet.cost}分`}
          </div>
          ${isCurrentPet ? '<div class="pet-card-badge">已认养</div>' : ''}
        </div>
      `;
    }).join('');

    // 绑定点击事件
    container.querySelectorAll('.pet-library-item:not(.disabled):not(.current)').forEach(item => {
      item.addEventListener('click', () => {
        const petId = item.dataset.petId;
        this.adoptPet(petId);
      });
    });
  }

  // 获取可认养的宠物（排除当前宠物，按积分筛选）
  getAvailablePets(student) {
    const filtered = PET_DATABASE.filter(pet => {
      // 排除已认养的宠物
      if (student.pet?.petId === pet.id) return false;
      
      // 按风格筛选
      if (this.currentStyle !== 'all' && pet.style !== this.currentStyle) return false;
      
      // 按积分筛选
      return true;  // 显示所有，但标记不可用的
    });

    // 当前宠物的也显示但标记为已认养
    if (student.pet?.petId) {
      const currentPet = getPetById(student.pet.petId);
      if (currentPet) {
        filtered.unshift(currentPet);
      }
    }

    return filtered;
  }

  // 按风格筛选
  filterByStyle(style, btnElement) {
    this.currentStyle = style;

    // 更新按钮状态
    document.querySelectorAll('.adoption-center .filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    btnElement.classList.add('active');

    // 重新渲染
    const student = this.data.getStudent(this.currentStudentId);
    if (student) {
      this.renderPetLibrary(student);
    }
  }

  // 认养宠物
  adoptPet(petId) {
    const student = this.data.getStudent(this.currentStudentId);
    const pet = getPetById(petId);
    
    if (!pet) {
      alert('宠物不存在！');
      return false;
    }

    // 检查是否是当前宠物
    if (student.pet?.petId === petId) {
      alert('这是你当前的宠物！');
      return false;
    }

    // 检查积分
    if (student.score < pet.cost) {
      alert('积分不足！');
      return false;
    }

    // 确认认养
    const confirmed = confirm(`确定要认养${pet.name}吗？\n需要消耗 ${pet.cost === 0 ? '免费' : pet.cost + ' 分'}`);
    if (!confirmed) return false;

    // 扣除积分
    student.score -= pet.cost;

    // 更新宠物信息
    student.pet = {
      petId: petId,
      customImage: null,
      customImageEnabled: false,
      stats: {
        hunger: 50,
        happiness: 50,
        energy: 50,
        lastFeedTime: Date.now(),
        lastPlayTime: Date.now(),
        lastRestTime: Date.now()
      }
    };

    // 保存数据
    this.data.saveStudents();

    // 更新UI
    this.renderCurrentPet(student);
    this.renderPetLibrary(student);
    document.getElementById('myScore').textContent = student.score;

    // 刷新主页面的宠物显示
    if (window.ClassPet && window.ClassPet.ui && window.ClassPet.ui.renderPetGrid) {
      window.ClassPet.ui.renderPetGrid();
    }

    alert(`认养成功！${student.name}的宠物变成了${pet.name}！`);
    return true;
  }

  // 显示弹窗
  showModal() {
    const modal = document.getElementById('adoptionCenterModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  // 关闭弹窗
  closeModal() {
    const modal = document.getElementById('adoptionCenterModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

// 导出
window.PetAdoptionManager = PetAdoptionManager;

// 全局函数：显示认养中心（供HTML调用）
function showAdoptionCenter(studentId) {
  if (window.ClassPet && window.ClassPet.petAdoption) {
    window.ClassPet.petAdoption.showAdoptionCenter(studentId);
  }
}

function closeAdoptionCenter() {
  if (window.ClassPet && window.ClassPet.petAdoption) {
    window.ClassPet.petAdoption.closeModal();
  }
}
