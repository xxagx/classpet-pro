// ClassPet Pro - Mobile App v3.0 - 优化版

document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const scorePetManager = new ScorePetManager(dataManager);
    const authManager = new AuthManager(dataManager);
    
    let currentStudent = null;
    let isMusicPlaying = false;

    const welcomeModal = document.getElementById('welcomeModal');
    const authPage = document.getElementById('loginPage'); // loginPage is the auth page
    const petPage = document.getElementById('petPage');
    const authContainer = document.getElementById('loginPage'); // Use loginPage as container
    const btnWelcome = document.getElementById('btnWelcome');
    const btnLogout = document.getElementById('btnLogout');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const bgMusic = document.getElementById('bgMusic');
    const btnMusicToggle = document.getElementById('btnMusicToggle');
    const btnMusicMini = document.getElementById('btnMusicMini');

    let statusUpdateInterval = null;
    const STATUS_UPDATE_INTERVAL = 30000;
    const STATUS_DECAY_RATE = 2;

    function showLoading(message = '加载中...') {
        loadingOverlay.querySelector('.loading-text').textContent = message;
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    function showAlert(message, title = '提示') {
        const alertModal = document.getElementById('alertModal');
        const alertTitle = document.getElementById('alertTitle');
        const alertMessage = document.getElementById('alertMessage');
        const closeAlert = document.getElementById('closeAlert');

        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertModal.classList.add('active');

        closeAlert.onclick = () => {
            alertModal.classList.remove('active');
        };
    }

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
        isMusicPlaying ? pauseMusic() : playMusic();
    }

    function updateMusicUI() {
        if (btnMusicToggle) {
            const icon = btnMusicToggle.querySelector('.music-icon');
            if (icon) icon.textContent = isMusicPlaying ? '🎵' : '🔇';
            btnMusicToggle.classList.toggle('playing', isMusicPlaying);
        }
        if (btnMusicMini) {
            btnMusicMini.textContent = isMusicPlaying ? '🎵' : '🔇';
            btnMusicMini.classList.toggle('playing', isMusicPlaying);
        }
    }

    function initStudentSelect() {
        const studentSelect = document.getElementById('studentSelect');
        const btnLogin = document.getElementById('btnLogin');
        
        if (!studentSelect || !btnLogin) {
            console.error('❌ 学生选择器或登录按钮不存在');
            return;
        }
        
        // 加载学生列表
        const students = dataManager.students || [];
        console.log('加载学生列表:', students.length);
        
        studentSelect.innerHTML = '<option value="">请选择...</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });
        
        // 绑定登录按钮事件
        btnLogin.addEventListener('click', () => {
            const selectedId = studentSelect.value;
            if (!selectedId) {
                showAlert('请选择你的名字', '提示');
                return;
            }
            
            // 触发自定义事件
            const event = new CustomEvent('loginSuccess', {
                detail: { studentId: selectedId }
            });
            authContainer.dispatchEvent(event);
        });
        
        console.log('✅ 学生选择器初始化完成');
    }

    function initAuthInterface() {
        // mobile.html 已经有登录界面，不需要重新创建
        // 只需要初始化学生选择器
        initStudentSelect();
        
        authContainer.addEventListener('loginSuccess', (e) => {
            const user = e.detail;
            handleLoginSuccess(user);
        });
    }

    function handleLoginSuccess(user) {
        showLoading('正在登录...');
        
        setTimeout(() => {
            // 确保 studentId 是数字类型
            const studentId = Number(user.studentId);
            currentStudent = dataManager.getStudentById(studentId);
            
            if (currentStudent) {
                showPetPage();
                hideLoading();
                showAlert(`欢迎回来，${currentStudent.name}！`, '登录成功');
            } else {
                hideLoading();
                showAlert('学生信息不存在，请联系老师', '错误');
            }
        }, 500);
    }

    function checkLoginStatus() {
        if (authManager.isLoggedIn()) {
            const user = authManager.getCurrentUser();
            const studentId = Number(user.studentId);
            currentStudent = dataManager.getStudentById(studentId);
            if (currentStudent) {
                // 已登录，直接显示宠物页面
                authPage.classList.remove('active');
                petPage.classList.add('active');
                updatePetDisplay();
                startStatusUpdates();
                return true;
            }
        }
        return false;
    }

    function showAuthPage() {
        stopStatusUpdates();
        petPage.classList.remove('active');
        authPage.classList.add('active');
        // 不需要重新创建登录界面，HTML 中已有
        initStudentSelect();
    }

    function showPetPage() {
        authPage.classList.remove('active');
        petPage.classList.add('active');
        updatePetDisplay();
        startStatusUpdates();
    }

    function updatePetDisplay() {
        if (!currentStudent) return;

        const fullInfo = scorePetManager.getStudentFullInfo(currentStudent.id);
        if (fullInfo) {
            currentStudent = fullInfo.student;
        }

        const petInfo = getPetInfo(currentStudent);
        const petDisplay = getPetDisplay(currentStudent);

        document.getElementById('studentName').textContent = currentStudent.name;
        document.getElementById('studentScore').textContent = currentStudent.score;

        const imageContainer = document.getElementById('petImageContainer');
        const petEmoji = document.getElementById('petEmoji');
        const petStage = document.getElementById('petStage');

        if (currentStudent.pet && currentStudent.pet.statusClass) {
            imageContainer.className = `pet-image-container ${currentStudent.pet.statusClass}`;
        } else if (petInfo) {
            petStage.textContent = petInfo.stageName;
            imageContainer.className = `pet-image-container ${petInfo.bgClass}`;
        } else {
            petStage.textContent = '蛋';
            imageContainer.className = 'pet-image-container stage-egg';
        }

        if (petInfo) {
            petStage.textContent = petInfo.stageName;
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

    function initPetInteractions() {
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
    }

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

    function initModals() {
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
                updateStudentInfo();
                showRedeemModal();
                showAlert(`成功兑换${reward.name}！`, '成功');
            }
        });
    }

    // 初始化物品商城
    function initItemMall() {
        window.openItemMall = function() {
            if (!currentStudent) {
                showAlert('请先登录', '提示');
                return;
            }

            const modal = document.getElementById('itemMallModal');
            const content = document.getElementById('itemMallContent');
            
            // 初始化学生端物品商城
            const studentMall = new StudentItemMall(currentStudent.id, {
                onPurchase: (item) => {
                    console.log('购买物品:', item);
                }
            });
            
            // 渲染商城界面
            studentMall.renderMall(content);
            
            modal.classList.add('active');
        };
    }

    function initHomeworkManagement() {
        const homeworkManager = new HomeworkManager(dataManager);
        const btnHomework = document.getElementById('btnHomework');
        const homeworkModal = document.getElementById('homeworkModal');
        const closeHomeworkModal = document.getElementById('closeHomeworkModal');
        
        const homeworkDetailModal = document.getElementById('homeworkDetailModal');
        const closeHomeworkDetail = document.getElementById('closeHomeworkDetail');
        
        const submitHomeworkModal = document.getElementById('submitHomeworkModal');
        const closeSubmitModal = document.getElementById('closeSubmitModal');
        const btnCancelSubmit = document.getElementById('btnCancelSubmit');
        const btnSubmitHomework = document.getElementById('btnSubmitHomework');
        
        const btnSaveDraft = document.getElementById('btnSaveDraft');
        const btnClearAll = document.getElementById('btnClearAll');
        const btnUploadImages = document.getElementById('btnUploadImages');
        
        let currentHomework = null;
        let imageUploader = null;
        let uploadedImages = [];

        // 初始化物品商城
        initItemMall();

        // 初始化图片上传组件
        function initImageUploader() {
            if (imageUploader) {
                imageUploader.clearAll();
            }
            
            imageUploader = new MobileImageUploader({
                containerId: 'mobileImageUploaderContainer',
                maxFiles: 9,
                maxFileSize: 10 * 1024 * 1024, // 10MB
                onFilesSelected: (files) => {
                    console.log('已选择文件:', files);
                },
                onUploadComplete: (result) => {
                    if (result.success) {
                        uploadedImages = result.uploadedFiles.map(f => ({
                            url: f.uploadedUrl || f.url,
                            name: f.name,
                            size: f.size
                        }));
                        showAlert(`上传成功 ${result.successCount} 张图片`, '成功');
                    } else {
                        showAlert(`上传完成：成功${result.successCount}张，失败${result.failCount}张`, '警告');
                    }
                }
            });
            
            imageUploader.init();
        }

        btnHomework.addEventListener('click', () => {
            if (!currentStudent) {
                showAlert('请先登录', '提示');
                return;
            }
            homeworkModal.classList.add('active');
            loadStudentHomeworkList();
        });

        closeHomeworkModal.addEventListener('click', () => {
            homeworkModal.classList.remove('active');
        });

        closeHomeworkDetail.addEventListener('click', () => {
            homeworkDetailModal.classList.remove('active');
        });

        closeSubmitModal.addEventListener('click', () => {
            submitHomeworkModal.classList.remove('active');
        });

        btnCancelSubmit.addEventListener('click', () => {
            submitHomeworkModal.classList.remove('active');
        });

        // 打开作业提交页面时初始化上传组件
        const originalOpenSubmitHomework = window.openSubmitHomework;
        window.openSubmitHomework = function(homeworkId) {
            const homework = homeworkManager.getHomeworkById(homeworkId);
            if (!homework) return;

            currentHomework = homework;
            document.getElementById('submitHomeworkTitle').textContent = homework.title;
            document.getElementById('submitHomeworkPoints').textContent = `积分：${homework.points}`;
            
            const requirementsList = document.getElementById('requirementsList');
            if (homework.requirements && homework.requirements.length > 0) {
                requirementsList.innerHTML = homework.requirements.map(req => `<li>${req}</li>`).join('');
            } else {
                requirementsList.innerHTML = '<li>暂无特殊要求</li>';
            }
            
            // 初始化图片上传组件
            uploadedImages = [];
            initImageUploader();
            
            submitHomeworkModal.classList.add('active');
        };

        // 上传图片按钮
        if (btnUploadImages) {
            btnUploadImages.addEventListener('click', () => {
                if (!imageUploader) {
                    showAlert('请先初始化上传组件', '错误');
                    return;
                }
                imageUploader.uploadFiles();
            });
        }

        // 保存草稿
        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', () => {
                const contentText = document.getElementById('homeworkContentText').value;
                const draft = {
                    homeworkId: currentHomework.id,
                    content: contentText,
                    images: uploadedImages,
                    savedAt: Date.now()
                };
                
                // 保存到 localStorage
                const drafts = JSON.parse(localStorage.getItem('homeworkDrafts') || '{}');
                drafts[currentHomework.id] = draft;
                localStorage.setItem('homeworkDrafts', JSON.stringify(drafts));
                
                showAlert('草稿已保存', '成功');
            });
        }

        // 清空
        if (btnClearAll) {
            btnClearAll.addEventListener('click', () => {
                if (confirm('确定要清空所有内容吗？')) {
                    document.getElementById('homeworkContentText').value = '';
                    document.getElementById('charCount').textContent = '0';
                    if (imageUploader) {
                        imageUploader.clearAll();
                    }
                    uploadedImages = [];
                }
            });
        }

        // 提交作业
        if (btnSubmitHomework) {
            btnSubmitHomework.addEventListener('click', () => {
                const contentText = document.getElementById('homeworkContentText').value.trim();
                
                if (!contentText && uploadedImages.length === 0) {
                    showAlert('请填写作业内容或上传图片', '提示');
                    return;
                }

                if (contentText.length > 500) {
                    showAlert('作业内容描述不能超过 500 字', '提示');
                    return;
                }

                showLoading('正在提交作业...');
                
                // 模拟提交
                setTimeout(() => {
                    const submission = {
                        id: Date.now(),
                        homeworkId: currentHomework.id,
                        studentId: currentStudent.id,
                        studentName: currentStudent.name,
                        content: contentText,
                        images: uploadedImages,
                        submittedAt: Date.now(),
                        status: 'submitted'
                    };

                    // 保存提交记录
                    homeworkManager.saveSubmission(submission);
                    
                    hideLoading();
                    submitHomeworkModal.classList.remove('active');
                    showAlert('作业提交成功！', '成功');
                    
                    // 刷新作业列表
                    loadStudentHomeworkList();
                }, 1000);
            });
        }

        function loadStudentHomeworkList() {
            const homeworkList = document.getElementById('studentHomeworkList');
            if (!homeworkList) return;
            
            const homeworks = homeworkManager.getHomeworksForStudent(currentStudent.id);
            
            if (homeworks.length === 0) {
                homeworkList.innerHTML = `
                    <div class="no-homework">
                        <div class="no-homework-icon">📚</div>
                        <div class="no-homework-text">暂无作业</div>
                        <div class="no-homework-hint">老师还没有发布作业哦</div>
                    </div>
                `;
                return;
            }
            
            homeworkList.innerHTML = homeworks.map(homework => {
                const submission = homeworkManager.getSubmission(currentStudent.id, homework.id);
                const dueDate = new Date(homework.dueDate);
                const now = new Date();
                const timeLeft = dueDate - now;
                const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                
                let statusText = '未开始';
                let statusClass = 'pending';
                
                if (submission) {
                    if (submission.status === 'submitted') {
                        statusText = '已提交';
                        statusClass = 'submitted';
                    } else if (submission.status === 'reviewed') {
                        statusText = '已审核';
                        statusClass = 'reviewed';
                    } else if (submission.status === 'needs_revision') {
                        statusText = '需修改';
                        statusClass = 'needs_revision';
                    }
                } else if (timeLeft < 0) {
                    statusText = '已过期';
                    statusClass = 'expired';
                } else if (daysLeft <= 1) {
                    statusText = '即将截止';
                    statusClass = 'urgent';
                }
                
                return `
                    <div class="homework-item ${statusClass}" data-id="${homework.id}">
                        <div class="homework-header">
                            <h3 class="homework-title">${homework.title}</h3>
                            <span class="homework-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="homework-meta">
                            <span class="homework-subject">${homework.subject}</span>
                            <span class="homework-points">${homework.points}分</span>
                            <span class="homework-due">${formatDate(homework.dueDate)}</span>
                        </div>
                        <div class="homework-actions">
                            <button class="btn-view-homework" data-id="${homework.id}">查看详情</button>
                            ${!submission || submission.status === 'needs_revision' ? 
                                `<button class="btn-submit-homework" data-id="${homework.id}">提交作业</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            document.querySelectorAll('.btn-view-homework').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const homeworkId = parseInt(e.target.dataset.id);
                    showHomeworkDetail(homeworkId);
                });
            });
            
            document.querySelectorAll('.btn-submit-homework').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const homeworkId = parseInt(e.target.dataset.id);
                    openSubmitHomework(homeworkId);
                });
            });
        }

        function showHomeworkDetail(homeworkId) {
            const homework = homeworkManager.getHomeworkById(homeworkId);
            if (!homework) return;
            
            const title = document.getElementById('homeworkDetailTitle');
            const content = document.getElementById('homeworkDetailContent');
            const actions = document.getElementById('homeworkActions');
            
            title.textContent = homework.title;
            
            const dueDate = new Date(homework.dueDate);
            const now = new Date();
            const timeLeft = dueDate - now;
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            
            content.innerHTML = `
                <div class="homework-info">
                    <div class="info-item">
                        <span class="info-label">科目：</span>
                        <span class="info-value">${homework.subject}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">积分：</span>
                        <span class="info-value">${homework.points}分</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">截止：</span>
                        <span class="info-value">${formatDate(homework.dueDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">剩余：</span>
                        <span class="info-value ${daysLeft <= 1 ? 'urgent' : ''}">${daysLeft}天</span>
                    </div>
                </div>
                <div class="homework-description">
                    <h4>作业描述</h4>
                    <p>${homework.description || '暂无详细描述'}</p>
                </div>
                ${homework.requirements && homework.requirements.length > 0 ? `
                <div class="homework-requirements">
                    <h4>作业要求</h4>
                    <ul>
                        ${homework.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            `;
            
            const submission = homeworkManager.getSubmission(currentStudent.id, homeworkId);
            if (submission) {
                actions.innerHTML = `
                    <div class="submission-info">
                        <h4>我的提交</h4>
                        <p>提交时间：${formatDate(submission.submittedAt)}</p>
                        ${submission.status === 'reviewed' && submission.teacherFeedback ? `
                            <div class="teacher-feedback">
                                <h5>教师反馈：</h5>
                                <p>${submission.teacherFeedback}</p>
                                <p class="points-awarded">获得积分：${submission.pointsAwarded || 0}分</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                actions.innerHTML = `
                    <button class="btn-primary" id="btnStartSubmit">开始提交作业</button>
                `;
                
                document.getElementById('btnStartSubmit').addEventListener('click', () => {
                    homeworkDetailModal.classList.remove('active');
                    window.openSubmitHomework(homeworkId);
                });
            }
            
            homeworkDetailModal.classList.add('active');
        }

        function openSubmitHomework(homeworkId) {
            const homework = homeworkManager.getHomeworkById(homeworkId);
            if (!homework) return;
            
            currentHomework = homework;
            document.getElementById('submitHomeworkTitle').textContent = homework.title;
            document.getElementById('submitHomeworkPoints').textContent = `积分: ${homework.points}`;
            
            const requirementsList = document.getElementById('requirementsList');
            if (homework.requirements && homework.requirements.length > 0) {
                requirementsList.innerHTML = homework.requirements.map(req => `<li>${req}</li>`).join('');
            } else {
                requirementsList.innerHTML = '<li>暂无特殊要求</li>';
            }
            
            submitHomeworkModal.classList.add('active');
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
    }

    function handleWelcomeClick() {
        console.log('🎵 开启旅程按钮被点击 - handleWelcomeClick called');
        
        try {
            // 确保按钮存在
            if (!btnWelcome) {
                console.error('❌ btnWelcome 元素不存在');
                return;
            }
            
            // 关闭欢迎弹窗
            if (welcomeModal) {
                console.log('关闭欢迎弹窗');
                welcomeModal.classList.remove('active');
            } else {
                console.error('❌ welcomeModal 元素不存在');
            }
            
            // 确保只显示登录界面，隐藏宠物界面
            if (petPage) {
                petPage.classList.remove('active');
                console.log('隐藏宠物页面');
            }
            
            // 检查登录状态
            const isLoggedIn = authManager.checkLoginStatus();
            console.log('登录状态:', isLoggedIn);
            
            if (!isLoggedIn) {
                if (authPage) {
                    authPage.classList.add('active');
                    console.log('显示登录页面');
                } else {
                    console.error('❌ authPage 元素不存在');
                }
            } else {
                // 如果已登录，直接显示宠物页面
                console.log('用户已登录，加载宠物数据');
                showPetPage();
            }
            
            // 播放音乐
            playMusic();
            
            console.log('✅ 欢迎流程完成');
        } catch (error) {
            console.error('❌ 欢迎按钮点击处理失败:', error);
            console.error('错误堆栈:', error.stack);
            // 如果出错，至少显示登录页面
            if (authPage && !authManager.checkLoginStatus()) {
                authPage.classList.add('active');
            }
        }
    }

    function initEventListeners() {
        console.log('🔧 初始化事件监听器...');
        
        // 欢迎按钮点击事件 - 同时支持 click 和 touchstart
        const welcomeBtn = document.getElementById('btnWelcome');
        if (welcomeBtn) {
            console.log('✅ 找到欢迎按钮');
            
            // 移除可能存在的重复事件监听器
            const newBtn = welcomeBtn.cloneNode(true);
            welcomeBtn.parentNode.replaceChild(newBtn, welcomeBtn);
            
            // 重新获取按钮引用
            const finalBtn = document.getElementById('btnWelcome');
            
            // 添加点击事件
            finalBtn.addEventListener('click', function(e) {
                console.log('🔴 点击事件触发 (click)');
                e.preventDefault();
                handleWelcomeClick();
            });
            
            // 为移动端添加触摸事件（防止 300ms 延迟）
            finalBtn.addEventListener('touchstart', function(e) {
                console.log('🔴 触摸事件触发 (touchstart)');
                e.preventDefault(); // 防止触发 click 事件
                handleWelcomeClick();
            }, { passive: false, capture: true });
            
            console.log('✅ 事件监听器绑定成功');
        } else {
            console.error('❌ 未找到欢迎按钮 (btnWelcome)');
        }

        if (btnMusicToggle) {
            btnMusicToggle.addEventListener('click', toggleMusic);
        }
        if (btnMusicMini) {
            btnMusicMini.addEventListener('click', toggleMusic);
        }

        btnLogout.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                authManager.logout();
                currentStudent = null;
                showAuthPage();
            }
        });

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

        // 物品商城按钮
        const btnItemMall = document.getElementById('btnItemMall');
        if (btnItemMall) {
            btnItemMall.addEventListener('click', () => {
                if (!currentStudent) {
                    showAlert('请先登录', '提示');
                    return;
                }
                openItemMall();
            });
        }

        // 关闭物品商城
        const closeItemMallModal = document.getElementById('closeItemMallModal');
        if (closeItemMallModal) {
            closeItemMallModal.addEventListener('click', () => {
                const itemMallModal = document.getElementById('itemMallModal');
                itemMallModal.classList.remove('active');
            });
        }
    }

    function initApp() {
        initMusic();
        initAuthInterface();
        initEventListeners();
        initPetInteractions();
        initModals();
        initHomeworkManagement();
        updateMusicUI();
        
        const classNameElements = document.querySelectorAll('.user-class, .class-name, .welcome-class');
        classNameElements.forEach(el => {
            el.textContent = '二年级一班';
        });
        
        // 初始化时不显示任何页面，等待用户点击"开始旅程"按钮
        // 确保 authPage 和 petPage 都没有 active 类
        authPage.classList.remove('active');
        petPage.classList.remove('active');
    }

    initApp();
});
