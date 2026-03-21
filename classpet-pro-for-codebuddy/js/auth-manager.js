// ClassPet Pro - 学生认证和权限管理系统
// 包含登录、注册、审核、权限控制功能

class AuthManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentUser = null;
        this.sessionKey = 'classpet_session';
        this.loadSession();
    }

    // 加载会话
    loadSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.expires > Date.now()) {
                    this.currentUser = sessionData.user;
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('加载会话失败:', error);
                this.logout();
            }
        }
    }

    // 保存会话
    saveSession(user, rememberMe = false) {
        const expires = rememberMe ? 
            Date.now() + 7 * 24 * 60 * 60 * 1000 : // 7天
            Date.now() + 24 * 60 * 60 * 1000; // 1天

        const sessionData = {
            user: user,
            expires: expires,
            createdAt: Date.now()
        };

        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        this.currentUser = user;
    }

    // 学生登录
    studentLogin(username, password) {
        // 将用户名转换为小写进行匹配（因为注册时姓名被转换为小写）
        const normalizedUsername = username.trim().toLowerCase();
        
        // 获取学生账号数据
        const accounts = this.getStudentAccounts();
        const account = accounts.find(acc => 
            acc.username === normalizedUsername && acc.password === password
        );

        if (!account) {
            return {
                success: false,
                message: '姓名或密码错误'
            };
        }

        if (account.status !== 'active') {
            return {
                success: false,
                message: '账号未激活，请联系教师审核'
            };
        }

        // 获取学生信息
        const student = this.dataManager.getStudentById(account.studentId);
        if (!student) {
            // 学生数据不存在，清理无效账号
            console.warn('清理无效账号:', account.username);
            this.removeStudentAccount(account.id);
            return {
                success: false,
                message: '学生信息不存在，请重新注册'
            };
        }

        // 保存会话
        const userSession = {
            id: account.id,
            studentId: account.studentId,
            username: account.username,
            name: student.name,
            role: 'student',
            loginTime: Date.now()
        };

        this.saveSession(userSession);

        return {
            success: true,
            message: '登录成功',
            user: userSession
        };
    }

    // 学生注册（仅供教师端批量导入使用，直接创建账号）
    studentRegister(registrationData) {
        const { name, studentId, gender, password } = registrationData;

        // 验证数据
        if (!name || name.trim() === '') {
            return {
                success: false,
                message: '请输入姓名'
            };
        }

        // 检查是否已存在同名学生
        const students = this.dataManager.students || [];
        const existingStudent = students.find(s => s.name === name);
        
        if (existingStudent) {
            // 检查是否已注册账号
            const accounts = this.getStudentAccounts();
            const existingAccount = accounts.find(acc => acc.studentId === existingStudent.id);
            
            if (existingAccount) {
                return {
                    success: false,
                    message: '该学生已注册账号，请直接登录'
                };
            }
        }

        // 检查密码强度
        if (!password || password.length < 4) {
            return {
                success: false,
                message: '密码长度至少 4 位'
            };
        }

        // 使用姓名作为用户名（转换为小写并去除空格）
        const username = name.trim().toLowerCase();

        // 直接创建学生账号（不再经过审核流程）
        const student = this.dataManager.addStudent(name);
        
        if (!student) {
            return {
                success: false,
                message: '创建学生失败'
            };
        }

        // 创建账号
        const account = {
            id: 'acc_' + Date.now(),
            studentId: student.id,
            username: username,
            password: password,
            status: 'active',
            createdAt: Date.now(),
            createdBy: 'teacher'
        };

        // 保存账号
        this.saveStudentAccount(account);

        return {
            success: true,
            message: '账号创建成功',
            account: {
                username: account.username,
                password: account.password,
                studentName: student.name
            }
        };
    }

    // 登出
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
    }

    // 检查登录状态
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查权限
    hasPermission(resource, action, resourceId = null) {
        if (!this.currentUser) {
            return false;
        }

        // 教师拥有所有权限
        if (this.currentUser.role === 'teacher') {
            return true;
        }

        // 学生权限检查
        if (this.currentUser.role === 'student') {
            switch (resource) {
                case 'pet':
                    // 学生只能操作自己的宠物
                    if (resourceId) {
                        const student = this.dataManager.getStudentById(this.currentUser.studentId);
                        return student && student.petId === resourceId;
                    }
                    return true; // 查看自己的宠物

                case 'homework':
                    // 学生可以查看和提交作业
                    return ['view', 'submit'].includes(action);

                case 'points':
                    // 学生只能查看自己的积分
                    return action === 'view';

                default:
                    return false;
            }
        }

        return false;
    }

    // 验证宠物访问权限
    canAccessPet(petId) {
        if (!this.currentUser) {
            return false;
        }

        if (this.currentUser.role === 'teacher') {
            return true;
        }

        const student = this.dataManager.getStudentById(this.currentUser.studentId);
        return student && student.petId === petId;
    }

    // 获取学生账号列表
    getStudentAccounts() {
        const saved = localStorage.getItem('student_accounts');
        return saved ? JSON.parse(saved) : [];
    }

    // 保存学生账号
    saveStudentAccount(account) {
        const accounts = this.getStudentAccounts();
        accounts.push(account);
        localStorage.setItem('student_accounts', JSON.stringify(accounts));
    }

    // 删除学生账号
    removeStudentAccount(accountId) {
        const accounts = this.getStudentAccounts();
        const filtered = accounts.filter(acc => acc.id !== accountId);
        localStorage.setItem('student_accounts', JSON.stringify(filtered));
    }

    // 创建登录界面
    createLoginInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-icon">🐾</div>
                    <h2>学生登录</h2>
                    <p>ClassPet Pro - 班级宠物管理系统</p>
                </div>

                <form class="login-form" id="studentLoginForm">
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" id="loginUsername" placeholder="请输入教师分配的账号" required autocomplete="username">
                    </div>

                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="loginPassword" placeholder="请输入密码" required autocomplete="current-password">
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe">
                            <span>记住我</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-login">登录</button>

                    <div class="login-footer">
                        <p>请联系教师获取账号信息</p>
                    </div>
                </form>
            </div>
        `;

        this.setupLoginEvents(container);
    }

    // 设置登录事件
    setupLoginEvents(container) {
        const form = document.getElementById('studentLoginForm');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const result = this.studentLogin(username, password);

            if (result.success) {
                // 触发登录成功事件
                const event = new CustomEvent('loginSuccess', { detail: result.user });
                container.dispatchEvent(event);
            } else {
                this.showLoginError(result.message);
            }
        });
    }

    // 显示登录错误
    showLoginError(message) {
        // 移除旧的错误提示
        const oldError = document.querySelector('.login-error');
        if (oldError) {
            oldError.remove();
        }
        
        // 创建新的错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.style.cssText = `
            background: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            text-align: center;
            animation: shake 0.3s ease-in-out;
        `;
        errorDiv.textContent = message;
        
        const form = document.getElementById('studentLoginForm');
        if (form) {
            form.insertBefore(errorDiv, form.querySelector('button'));
        }

        // 3 秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    }
}

// 全局实例
window.AuthManager = AuthManager;