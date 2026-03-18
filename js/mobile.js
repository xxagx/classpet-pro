// ClassPet Pro - Mobile App v2.0

document.addEventListener('DOMContentLoaded', () => {
    // 初始化数据管理器
    const dataManager = new DataManager();
    let currentStudent = null;

    // DOM元素
    const welcomeModal = document.getElementById('welcomeModal');
    const loginPage = document.getElementById('loginPage');
    const petPage = document.getElementById('petPage');
    const studentSelect = document.getElementById('studentSelect');
    const btnWelcome = document.getElementById('btnWelcome');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');

    // 背景音乐
    const bgMusic = document.getElementById('bgMusic');
    const btnMusicToggle = document.getElementById('btnMusicToggle');
    const btnMusicMini = document.getElementById('btnMusicMini');
    let isMusicPlaying = false;

    // 实时数据更新机制
    let statusUpdateInterval = null;
    const STATUS_UPDATE_INTERVAL = 30000;
    const STATUS_DECAY_RATE = 2;

    // 音乐控制
    function initMusic() {
        bgMusic.volume = 0.3;
        
        const savedMusicState = localStorage.getItem('classpet_music_enabled');
        if (savedMusicState === 'true') {
            isMusicPlaying = true;
        }
    }

    function playMusic() {
        if (bgMusic) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                localStorage.setItem('classpet_music_enabled', 'true');
                updateMusicUI();
            }).catch(err => {
                console.log('音乐播放需要用户交互:', err);
            });
        }
    }

    function pauseMusic() {
        if (bgMusic) {
            bgMusic.pause();
            isMusicPlaying = false;
            localStorage.setItem('classpet_music_enabled', 'false');
            updateMusicUI();
        }
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    function updateMusicUI() {
        if (btnMusicToggle) {
            const icon = btnMusicToggle.querySelector('.music-icon');
            if (icon) {
                icon.textContent = isMusicPlaying ? '🎵' : '🔇';
            }
            btnMusicToggle.classList.toggle('playing', isMusicPlaying);
        }
        if (btnMusicMini) {
            btnMusicMini.textContent = isMusicPlaying ? '🎵' : '🔇';
            btnMusicMini.classList.toggle('playing', isMusicPlaying);
        }
    }

    // 欢迎弹窗
    btnWelcome.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        loginPage.classList.add('active');
        playMusic();
    });

    // 音乐按钮事件
    if (btnMusicToggle) {
        btnMusicToggle.addEventListener('click', toggleMusic);
    }
    if (btnMusicMini) {
        btnMusicMini.addEventListener('click', toggleMusic);
    }

    function startStatusUpdates() {
        if (statusUpdateInterval) {
            clearInterval(statusUpdateInterval);
        }
        
        statusUpdateInterval = setInterval(() => {
            if (!currentStudent) return;
            decayPetStatus();
            updatePetDisplay();
        }, STATUS_UPDATE_INTERVAL);
    }

    function stopStatusUpdates() {
        if (statusUpdateInterval) {
            clearInterval(statusUpdateInterval);
            statusUpdateInterval = null;
        }
    }

    function decayPetStatus() {
        if (!currentStudent || !currentStudent.pet || !currentStudent.pet.stats) return;
        
        const stats = currentStudent.pet.stats;
        
        if (stats.hunger > 0) {
            stats.hunger = Math.max(0, stats.hunger - STATUS_DECAY_RATE);
        }
        
        if (stats.happiness > 0) {
            stats.happiness = Math.max(0, stats.happiness - STATUS_DECAY_RATE * 0.5);
        }
        
        if (stats.energy < 100) {
            stats.energy = Math.min(100, stats.energy + STATUS_DECAY_RATE * 0.3);
        }
        
        dataManager.save();
        currentStudent = dataManager.getStudentById(currentStudent.id);
    }

    // 填充学生列表
    function loadStudents() {
        studentSelect.innerHTML = '<option value="">请选择...</option>';
        
        dataManager.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });

        // 更新班级名称
        const classNameElements = document.querySelectorAll('.class-name, .welcome-class, #className');
        classNameElements.forEach(el => {
            el.textContent = '二年级一班';
        });
    }

    // 登录
    btnLogin.addEventListener('click', () => {
        const studentId = parseInt(studentSelect.value);
        if (!studentId) {
            showAlert('请选择你的名字', '提示');
            return;
        }

        currentStudent = dataManager.getStudentById(studentId);
        if (!currentStudent) {
            const selectedOption = studentSelect.options[studentSelect.selectedIndex];
            const studentName = selectedOption.textContent;
            currentStudent = dataManager.students.find(s => s.name === studentName);
            
            if (!currentStudent) {
                showAlert('学生信息不存在，请联系老师', '错误');
                console.error('找不到学生:', studentId, studentName);
                return;
            }
        }

        showPetPage();
    });

    // 登出
    btnLogout.addEventListener('click', () => {
        currentStudent = null;
        showLoginPage();
    });

    // 显示宠物页面
    function showPetPage() {
        loginPage.classList.remove('active');
        petPage.classList.add('active');
        updatePetDisplay();
        startStatusUpdates();
    }

    // 显示登录页面
    function showLoginPage() {
        stopStatusUpdates();
        petPage.classList.remove('active');
        loginPage.classList.add('active');
        studentSelect.value = '';
    }

    // 更新宠物显示
    function updatePetDisplay() {
        if (!currentStudent) return;

        const petInfo = getPetInfo(currentStudent);
        const petDisplay = getPetDisplay(currentStudent);

        document.getElementById('studentName').textContent = currentStudent.name;
        document.getElementById('studentScore').textContent = currentStudent.score;
        document.getElementById('petName').textContent = petInfo ? petInfo.name : '未认养';

        const imageContainer = document.getElementById('petImageContainer');
        const petEmoji = document.getElementById('petEmoji');
        const petStage = document.getElementById('petStage');

        if (petInfo) {
            petStage.textContent = petInfo.stageName;
            imageContainer.className = `pet-image-container ${petInfo.bgClass}`;
        } else {
            petStage.textContent = '蛋';
            imageContainer.className = 'pet-image-container stage-egg';
        }

        if (petDisplay.image) {
            petEmoji.innerHTML = `<img src="${petDisplay.image}" alt="宠物" class="pet-image-custom">`;
        } else {
            petEmoji.textContent = petDisplay.emoji;
        }

        const btnAdopt = document.getElementById('btnAdopt');
        btnAdopt.style.display = petInfo ? 'none' : 'block';

        updatePetStatusPanel();
    }

    // 更新宠物状态面板
    function updatePetStatusPanel() {
        const statusPanel = document.getElementById('petStatusPanel');
        const interactions = document.getElementById('petInteractions');
        
        if (!currentStudent || !currentStudent.pet) {
            statusPanel.style.display = 'none';
            interactions.style.display = 'none';
            return;
        }

        statusPanel.style.display = 'block';
        interactions.style.display = 'grid';

        const stats = currentStudent.pet.stats || { hunger: 50, happiness: 50, energy: 50 };

        const hunger = Math.round(stats.hunger);
        document.getElementById('hungerValue').textContent = hunger;
        document.getElementById('hungerBar').style.width = hunger + '%';
        updateStatusColor('hunger', hunger);

        const happiness = Math.round(stats.happiness);
        document.getElementById('happinessValue').textContent = happiness;
        document.getElementById('happinessBar').style.width = happiness + '%';
        updateStatusColor('happiness', happiness);

        const energy = Math.round(stats.energy);
        document.getElementById('energyValue').textContent = energy;
        document.getElementById('energyBar').style.width = energy + '%';
        updateStatusColor('energy', energy);

        updatePetMood(stats);
    }

    function updateStatusColor(type, value) {
        const bar = document.getElementById(type + 'Bar');
        bar.classList.remove('warning');
        
        if (value < 30) {
            bar.classList.add('warning');
        }
    }

    function updatePetMood(stats) {
        const moodElement = document.getElementById('petMood');
        const { hunger, happiness, energy } = stats;
        const avgStatus = (hunger + happiness + energy) / 3;

        let moodEmoji, moodText;

        if (hunger < 20) {
            moodEmoji = '😢';
            moodText = '好饿啊，快喂我吃东西！';
        } else if (energy < 20) {
            moodEmoji = '😴';
            moodText = '好累了，让我休息一下...';
        } else if (happiness < 30) {
            moodEmoji = '😔';
            moodText = '有点不开心，陪我玩玩吧';
        } else if (avgStatus >= 80) {
            moodEmoji = '🥰';
            moodText = '状态超棒！开心~';
        } else if (avgStatus >= 60) {
            moodEmoji = '😊';
            moodText = '状态良好，继续加油！';
        } else {
            moodEmoji = '🙂';
            moodText = '还可以，照顾我一下吧';
        }

        moodElement.innerHTML = `
            <span class="mood-emoji">${moodEmoji}</span>
            <span class="mood-text">${moodText}</span>
        `;
    }

    function getPetInfo(student) {
        if (!student.petId && (!student.pet || !student.pet.petId)) return null;
        const petId = student.petId || (student.pet && student.pet.petId);
        return dataManager.getPetById(petId);
    }

    function getPetDisplay(student) {
        const petInfo = getPetInfo(student);

        if (!petInfo) {
            return { emoji: '🥚', image: null };
        }

        if (student.customImage) {
            return { emoji: null, image: student.customImage };
        }

        const stages = dataManager.config.stages;
        let currentStage = stages[0];

        for (let i = stages.length - 1; i >= 0; i--) {
            if (student.score >= stages[i].minScore) {
                currentStage = stages[i];
                break;
            }
        }

        const stageKey = getStageByScore(student.score);
        const emoji = getPetEmoji(petInfo.id, stageKey);

        return {
            emoji: emoji || petInfo.emoji || '🥚',
            image: null,
            stage: currentStage
        };
    }

    function getStageByScore(score) {
        if (score >= 300) return 'ADULT';
        if (score >= 150) return 'YOUNG';
        if (score >= 50) return 'BABY';
        return 'EGG';
    }

    function getPetEmoji(petId, stage) {
        if (window.PET_STAGE_EMOJIS && window.PET_STAGE_EMOJIS[petId]) {
            return window.PET_STAGE_EMOJIS[petId][stage];
        }
        return null;
    }

    // 认养宠物
    const btnAdopt = document.getElementById('btnAdopt');
    const adoptModal = document.getElementById('adoptModal');
    const closeAdopt = document.getElementById('closeAdopt');
    const petOptions = document.getElementById('petOptions');

    btnAdopt.addEventListener('click', () => {
        showAdoptModal();
    });

    closeAdopt.addEventListener('click', () => {
        adoptModal.classList.remove('active');
    });

    function showAdoptModal() {
        document.getElementById('adoptScore').textContent = currentStudent.score;
        petOptions.innerHTML = '';

        const allPets = dataManager.getAllPets();
        if (!allPets || allPets.length === 0) {
            petOptions.innerHTML = '<p style="text-align: center; color: #999; grid-column: span 2;">暂无可认养的宠物</p>';
            adoptModal.classList.add('active');
            return;
        }

        const petsByRarity = {
            common: allPets.filter(p => p.rarity === 'common'),
            rare: allPets.filter(p => p.rarity === 'rare'),
            epic: allPets.filter(p => p.rarity === 'epic'),
            legendary: allPets.filter(p => p.rarity === 'legendary')
        };

        const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
        const rarityNames = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
        const rarityCosts = { common: 5, rare: 20, epic: 50, legendary: 100 };

        rarityOrder.forEach(rarity => {
            petsByRarity[rarity].forEach(pet => {
                const option = document.createElement('div');
                option.className = 'pet-option';
                
                const stageEmoji = getPetEmoji(pet.id, 'BABY') || '🐾';
                
                option.innerHTML = `
                    <div class="emoji">${stageEmoji}</div>
                    <div class="name">${pet.name}</div>
                    <div class="rarity rarity-${rarity}">${rarityNames[rarity]}</div>
                    <div class="cost">${rarityCosts[rarity]}分</div>
                `;

                option.addEventListener('click', () => {
                    if (currentStudent.score < rarityCosts[rarity]) {
                        showAlert(`积分不足！需要${rarityCosts[rarity]}分`, '提示');
                        return;
                    }

                    if (confirm(`确定认养${pet.name}吗？将消耗${rarityCosts[rarity]}分`)) {
                        if (!currentStudent.pet) {
                            currentStudent.pet = {};
                        }
                        currentStudent.pet.petId = pet.id;
                        currentStudent.score -= rarityCosts[rarity];
                        dataManager.save();
                        currentStudent = dataManager.getStudentById(currentStudent.id);
                        updatePetDisplay();
                        adoptModal.classList.remove('active');
                        showAlert('认养成功！', '成功');
                    }
                });

                petOptions.appendChild(option);
            });
        });

        adoptModal.classList.add('active');
    }

    // 自定义形象
    const btnCustomize = document.getElementById('btnCustomize');
    const customizeModal = document.getElementById('customizeModal');
    const closeCustomize = document.getElementById('closeCustomize');
    const saveCustomImage = document.getElementById('saveCustomImage');
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    btnCustomize.addEventListener('click', () => {
        if (!currentStudent.pet && !currentStudent.petId) {
            showAlert('请先认养宠物', '提示');
            return;
        }
        customizeModal.classList.add('active');
    });

    closeCustomize.addEventListener('click', () => {
        customizeModal.classList.remove('active');
    });

    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'upload-preview';
                img.style.maxWidth = '200px';
                img.style.borderRadius = '12px';

                uploadArea.querySelector('.upload-placeholder').innerHTML = '';
                uploadArea.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    saveCustomImage.addEventListener('click', () => {
        const img = uploadArea.querySelector('.upload-preview');
        if (img) {
            currentStudent.customImage = img.src;
            dataManager.save();
            updatePetDisplay();
            customizeModal.classList.remove('active');
            showAlert('自定义形象已保存！', '成功');
        } else {
            showAlert('请先上传图片', '提示');
        }
    });

    // 兑换奖励
    const btnRedeem = document.getElementById('btnRedeem');
    const redeemModal = document.getElementById('redeemModal');
    const closeRedeem = document.getElementById('closeRedeem');
    const rewardList = document.getElementById('rewardList');

    btnRedeem.addEventListener('click', () => {
        showRedeemModal();
    });

    closeRedeem.addEventListener('click', () => {
        redeemModal.classList.remove('active');
    });

    function showRedeemModal() {
        document.getElementById('redeemScore').textContent = currentStudent.score;
        rewardList.innerHTML = '';

        dataManager.config.rewards.forEach(reward => {
            const item = document.createElement('div');
            item.className = 'reward-item';
            item.innerHTML = `
                <div class="reward-info">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-cost">${reward.cost}分</div>
                    <div class="reward-stock">剩余: ${reward.stock}</div>
                </div>
                <button class="btn-redeem" ${currentStudent.score < reward.cost || reward.stock <= 0 ? 'disabled' : ''}>兑换</button>
            `;

            item.querySelector('.btn-redeem').addEventListener('click', () => {
                if (currentStudent.score < reward.cost) {
                    showAlert('积分不足！', '提示');
                    return;
                }
                if (reward.stock <= 0) {
                    showAlert('该奖励已兑换完毕！', '提示');
                    return;
                }

                if (confirm(`确定兑换${reward.name}吗？将消耗${reward.cost}分`)) {
                    currentStudent.score -= reward.cost;
                    reward.stock--;
                    if (!currentStudent.rewards) {
                        currentStudent.rewards = [];
                    }
                    currentStudent.rewards.push({
                        name: reward.name,
                        redeemedAt: Date.now()
                    });
                    dataManager.save();
                    updatePetDisplay();
                    redeemModal.classList.remove('active');
                    showAlert('兑换成功！', '成功');
                }
            });

            rewardList.appendChild(item);
        });

        redeemModal.classList.add('active');
    }

    // 提示弹窗
    const alertModal = document.getElementById('alertModal');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlert = document.getElementById('closeAlert');

    function showAlert(message, title = '提示') {
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertModal.classList.add('active');
    }

    closeAlert.addEventListener('click', () => {
        alertModal.classList.remove('active');
    });

    // 宠物互动按钮
    const btnFeed = document.getElementById('btnFeed');
    const btnPlay = document.getElementById('btnPlay');
    const btnRest = document.getElementById('btnRest');

    btnFeed.addEventListener('click', () => {
        if (!currentStudent) return;
        
        const result = dataManager.feedPet(currentStudent.id);
        if (result) {
            currentStudent = dataManager.getStudentById(currentStudent.id);
            updatePetDisplay();
            showStatusAnimation('hunger', '+20');
            showAlert('🍖 喂食成功！宠物饱食度+20', '喂食');
        }
    });

    btnPlay.addEventListener('click', () => {
        if (!currentStudent) return;
        
        const result = dataManager.playWithPet(currentStudent.id);
        if (result) {
            currentStudent = dataManager.getStudentById(currentStudent.id);
            updatePetDisplay();
            showStatusAnimation('happiness', '+20');
            showAlert('🎾 玩耍成功！开心值+20，精力-15', '玩耍');
        }
    });

    btnRest.addEventListener('click', () => {
        if (!currentStudent) return;
        
        const result = dataManager.restPet(currentStudent.id);
        if (result) {
            currentStudent = dataManager.getStudentById(currentStudent.id);
            updatePetDisplay();
            showStatusAnimation('energy', '+30');
            showAlert('😴 休息成功！精力值+30', '休息');
        }
    });

    function showStatusAnimation(type, delta) {
        const valueElement = document.getElementById(type + 'Value');
        if (!valueElement) return;
        
        const anim = document.createElement('span');
        anim.className = 'status-change-anim';
        anim.textContent = delta;
        anim.style.cssText = `
            position: absolute;
            color: ${delta.startsWith('+') ? '#4CAF50' : '#f44336'};
            font-weight: bold;
            font-size: 14px;
            animation: floatUp 1s ease-out forwards;
            margin-left: 5px;
        `;
        
        valueElement.style.position = 'relative';
        valueElement.appendChild(anim);
        
        setTimeout(() => anim.remove(), 1000);
    }

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopStatusUpdates();
            if (isMusicPlaying) {
                bgMusic.pause();
            }
        } else if (currentStudent) {
            startStatusUpdates();
            if (isMusicPlaying) {
                bgMusic.play().catch(() => {});
            }
            updatePetDisplay();
        }
    });

    // 初始化
    initMusic();
    loadStudents();
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
});
