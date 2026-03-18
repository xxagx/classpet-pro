// ClassPet Pro - 宠物显示管理模块

class PetDisplayManager {
  constructor(dataManager) {
    this.data = dataManager;
  }

  // 获取宠物显示内容（emoji或自定义图片）
  getPetDisplay(student) {
    if (!student.pet || !student.pet.petId) {
      return { emoji: '🥚', image: null };
    }

    // 如果启用了自定义图片
    if (student.pet.customImageEnabled && student.pet.customImage) {
      return { emoji: '', image: student.pet.customImage };
    }

    // 否则使用当前阶段的emoji
    const petId = student.pet.petId;
    const stage = this.getCurrentStage(student);
    const emoji = getPetEmoji(petId, stage);

    return {
      emoji: emoji || '🥚',
      image: null
    };
  }

  // 根据积分获取当前进化阶段
  getCurrentStage(student) {
    const score = student.score;

    if (score >= 300) return 'ADULT';
    if (score >= 150) return 'YOUNG';
    if (score >= 50) return 'BABY';
    return 'EGG';
  }

  // 获取宠物信息（用于渲染）
  getPetInfo(student) {
    if (!student.pet || !student.pet.petId) {
      return null;
    }

    const pet = getPetById(student.pet.petId);
    const stage = this.getCurrentStage(student);
    const emoji = getPetEmoji(student.pet.petId, stage);

    return {
      petId: student.pet.petId,
      name: pet.name,
      style: pet.style,
      rarity: pet.rarity,
      stage: stage,
      emoji: emoji,
      stageName: PET_STAGES[stage].name,
      customImage: student.pet.customImage,
      customImageEnabled: student.pet.customImageEnabled
    };
  }

  // 渲染宠物到容器
  renderPet(container, student) {
    const display = this.getPetDisplay(student);

    if (display.image) {
      container.innerHTML = `<img src="${display.image}" alt="宠物" class="pet-image-custom">`;
    } else {
      container.innerHTML = `<div class="pet-emoji">${display.emoji}</div>`;
    }
  }

  // 渲染宠物卡片
  renderPetCard(container, student) {
    const petInfo = this.getPetInfo(student);
    if (!petInfo) {
      container.innerHTML = `
        <div class="pet-card no-pet">
          <div class="pet-image-container">
            <div class="pet-image">🥚</div>
          </div>
          <div class="student-name">${student.name}</div>
          <div class="score-display">${student.score}分</div>
        </div>
      `;
      return;
    }

    const display = this.getPetDisplay(student);
    const bgClass = this.getPetBgClass(student.score);

    container.innerHTML = `
      <div class="pet-card">
        <div class="pet-image-container ${bgClass}">
          ${display.image
            ? `<img src="${petInfo.customImage}" alt="宠物" class="pet-image-custom">`
            : `<div class="pet-image" style="font-size: 50px;">${petInfo.emoji}</div>`
          }
        </div>
        <div class="student-name">${student.name}</div>
        <div class="score-display">${student.score}分</div>
        <div class="pet-name-badge">${petInfo.name}</div>
      </div>
    `;
  }

  // 根据积分获取背景样式
  getPetBgClass(score) {
    if (score >= 300) return 'stage-adult';
    if (score >= 150) return 'stage-young';
    if (score >= 50) return 'stage-baby';
    return 'stage-egg';
  }
}

// 导出
window.PetDisplayManager = PetDisplayManager;
