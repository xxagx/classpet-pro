// ClassPet Pro - 作业任务管理系统
// 实现作业发布、提交、审核、积分管理等完整功能

// ==================== 数据模型定义 ====================

// 作业状态枚举
const HomeworkStatus = {
    DRAFT: 'draft',           // 草稿
    PUBLISHED: 'published',   // 已发布
    CLOSED: 'closed'          // 已关闭
};

// 作业类型枚举
const HomeworkType = {
    WRITTEN: 'written',       // 书面作业
    PRACTICAL: 'practical',   // 实践作业
    CREATIVE: 'creative',     // 创意作业
    REVIEW: 'review'          // 复习作业
};

// 难度级别枚举
const DifficultyLevel = {
    EASY: 'easy',             // 简单
    MEDIUM: 'medium',         // 中等
    HARD: 'hard'              // 困难
};

// 提交状态枚举
const SubmissionStatus = {
    NOT_STARTED: 'not_started',   // 未开始
    IN_PROGRESS: 'in_progress',    // 进行中
    SUBMITTED: 'submitted',        // 已提交
    REVIEWED: 'reviewed',          // 已审核
    NEEDS_REVISION: 'needs_revision' // 需修改
};

// ==================== 作业数据模型 ====================

class HomeworkModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || '';
        this.description = data.description || '';
        this.type = data.type || HomeworkType.WRITTEN;
        this.difficulty = data.difficulty || DifficultyLevel.MEDIUM;
        this.subject = data.subject || '语文';
        this.points = data.points || 10;
        this.dueDate = data.dueDate || this.getDefaultDueDate();
        this.status = data.status || HomeworkStatus.DRAFT;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.teacherId = data.teacherId || 'teacher';
        this.attachments = data.attachments || []; // 附件列表
        this.requirements = data.requirements || []; // 作业要求
        this.tags = data.tags || []; // 标签
    }

    getDefaultDueDate() {
        const date = new Date();
        date.setDate(date.getDate() + 7); // 默认7天后截止
        return date.toISOString();
    }

    toJSONObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            type: this.type,
            difficulty: this.difficulty,
            subject: this.subject,
            points: this.points,
            dueDate: this.dueDate,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            teacherId: this.teacherId,
            attachments: this.attachments,
            requirements: this.requirements,
            tags: this.tags
        };
    }

    static fromJSONObject(json) {
        return new HomeworkModel(json);
    }
}

// ==================== 作业提交数据模型 ====================

class HomeworkSubmissionModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.homeworkId = data.homeworkId;
        this.studentId = data.studentId;
        this.studentName = data.studentName || '';
        this.status = data.status || SubmissionStatus.NOT_STARTED;
        this.submittedAt = data.submittedAt || null;
        this.content = data.content || ''; // 文字内容
        this.images = data.images || []; // 图片列表
        this.teacherFeedback = data.teacherFeedback || '';
        this.reviewedAt = data.reviewedAt || null;
        this.pointsAwarded = data.pointsAwarded || 0;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    toJSONObject() {
        return {
            id: this.id,
            homeworkId: this.homeworkId,
            studentId: this.studentId,
            studentName: this.studentName,
            status: this.status,
            submittedAt: this.submittedAt,
            content: this.content,
            images: this.images,
            teacherFeedback: this.teacherFeedback,
            reviewedAt: this.reviewedAt,
            pointsAwarded: this.pointsAwarded,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSONObject(json) {
        return new HomeworkSubmissionModel(json);
    }
}

// ==================== 图片上传数据模型 ====================

class ImageUploadModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.filename = data.filename || '';
        this.originalName = data.originalName || '';
        this.size = data.size || 0;
        this.type = data.type || 'image/jpeg';
        this.url = data.url || '';
        this.uploadedAt = data.uploadedAt || Date.now();
        this.submissionId = data.submissionId || null;
        this.studentId = data.studentId || null;
    }

    toJSONObject() {
        return {
            id: this.id,
            filename: this.filename,
            originalName: this.originalName,
            size: this.size,
            type: this.type,
            url: this.url,
            uploadedAt: this.uploadedAt,
            submissionId: this.submissionId,
            studentId: this.studentId
        };
    }

    static fromJSONObject(json) {
        return new ImageUploadModel(json);
    }
}

// ==================== 通知数据模型 ====================

class NotificationModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.type = data.type || 'info';
        this.title = data.title || '';
        this.message = data.message || '';
        this.recipient = data.recipient || ''; // 'teacher' 或 studentId
        this.relatedId = data.relatedId || null; // 关联的作业或提交ID
        this.read = data.read || false;
        this.createdAt = data.createdAt || Date.now();
    }

    toJSONObject() {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            message: this.message,
            recipient: this.recipient,
            relatedId: this.relatedId,
            read: this.read,
            createdAt: this.createdAt
        };
    }

    static fromJSONObject(json) {
        return new NotificationModel(json);
    }
}

// ==================== 作业管理系统主类 ====================

class HomeworkManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.homeworks = this.loadHomeworks();
        this.submissions = this.loadSubmissions();
        this.images = this.loadImages();
        this.notifications = this.loadNotifications();
    }

    // 加载作业数据
    loadHomeworks() {
        const saved = localStorage.getItem('classpet_homeworks');
        if (saved) {
            const data = JSON.parse(saved);
            return data.map(hw => HomeworkModel.fromJSONObject(hw));
        }
        return [];
    }

    // 加载提交数据
    loadSubmissions() {
        const saved = localStorage.getItem('classpet_homework_submissions');
        if (saved) {
            const data = JSON.parse(saved);
            return data.map(sub => HomeworkSubmissionModel.fromJSONObject(sub));
        }
        return [];
    }

    // 加载图片数据
    loadImages() {
        const saved = localStorage.getItem('classpet_homework_images');
        if (saved) {
            const data = JSON.parse(saved);
            return data.map(img => ImageUploadModel.fromJSONObject(img));
        }
        return [];
    }

    // 加载通知数据
    loadNotifications() {
        const saved = localStorage.getItem('classpet_homework_notifications');
        if (saved) {
            const data = JSON.parse(saved);
            return data.map(notif => NotificationModel.fromJSONObject(notif));
        }
        return [];
    }

    // 保存作业数据
    saveHomeworks() {
        localStorage.setItem('classpet_homeworks', JSON.stringify(this.homeworks.map(hw => hw.toJSONObject())));
    }

    // 保存提交数据
    saveSubmissions() {
        localStorage.setItem('classpet_homework_submissions', JSON.stringify(this.submissions.map(sub => sub.toJSONObject())));
    }

    // 保存图片数据
    saveImages() {
        localStorage.setItem('classpet_homework_images', JSON.stringify(this.images.map(img => img.toJSONObject())));
    }

    // 保存通知数据
    saveNotifications() {
        localStorage.setItem('classpet_homework_notifications', JSON.stringify(this.notifications.map(notif => notif.toJSONObject())));
    }

    // ==================== 作业管理功能 ====================

    // 创建新作业
    createHomework(homeworkData) {
        const homework = new HomeworkModel(homeworkData);
        this.homeworks.push(homework);
        this.saveHomeworks();
        
        // 创建通知
        this.createNotification({
            type: 'homework_created',
            title: '新作业发布',
            message: `教师发布了新作业：${homework.title}`,
            recipient: 'all_students'
        });
        
        return homework;
    }

    // 发布作业
    publishHomework(homeworkId) {
        const homework = this.homeworks.find(hw => hw.id === homeworkId);
        if (homework) {
            homework.status = HomeworkStatus.PUBLISHED;
            homework.updatedAt = Date.now();
            this.saveHomeworks();
            
            // 为每个学生创建提交记录
            this.createSubmissionsForAllStudents(homeworkId);
            
            return homework;
        }
        return null;
    }

    // 为所有学生创建提交记录
    createSubmissionsForAllStudents(homeworkId) {
        const students = this.dataManager.students;
        students.forEach(student => {
            const existing = this.submissions.find(sub => 
                sub.homeworkId === homeworkId && sub.studentId === student.id
            );
            
            if (!existing) {
                const submission = new HomeworkSubmissionModel({
                    homeworkId: homeworkId,
                    studentId: student.id,
                    studentName: student.name,
                    status: SubmissionStatus.NOT_STARTED
                });
                this.submissions.push(submission);
            }
        });
        
        this.saveSubmissions();
    }

    // 获取作业列表
    getHomeworks(status = null) {
        let filtered = this.homeworks;
        if (status) {
            filtered = filtered.filter(hw => hw.status === status);
        }
        
        // 按截止日期排序
        return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    // 获取学生作业列表
    getStudentHomeworks(studentId) {
        const studentSubmissions = this.submissions.filter(sub => sub.studentId === studentId);
        
        return studentSubmissions.map(submission => {
            const homework = this.homeworks.find(hw => hw.id === submission.homeworkId);
            return {
                ...homework.toJSONObject(),
                submission: submission.toJSONObject()
            };
        }).filter(item => item.id); // 过滤掉找不到作业的提交
    }

    // ==================== 提交管理功能 ====================

    // 更新提交状态
    updateSubmissionStatus(submissionId, status, content = '') {
        const submission = this.submissions.find(sub => sub.id === submissionId);
        if (submission) {
            submission.status = status;
            submission.content = content;
            submission.updatedAt = Date.now();
            
            if (status === SubmissionStatus.SUBMITTED) {
                submission.submittedAt = Date.now();
                
                // 创建教师通知
                this.createNotification({
                    type: 'submission_received',
                    title: '新作业提交',
                    message: `${submission.studentName} 提交了作业`,
                    recipient: 'teacher',
                    relatedId: submission.homeworkId
                });
            }
            
            this.saveSubmissions();
            return submission;
        }
        return null;
    }

    // 审核作业
    reviewSubmission(submissionId, feedback, pointsAwarded) {
        const submission = this.submissions.find(sub => sub.id === submissionId);
        if (submission) {
            submission.status = SubmissionStatus.REVIEWED;
            submission.teacherFeedback = feedback;
            submission.pointsAwarded = pointsAwarded;
            submission.reviewedAt = Date.now();
            submission.updatedAt = Date.now();
            
            // 给学生加分
            if (pointsAwarded > 0) {
                const scoreResult = this.dataManager.updateScore(submission.studentId, pointsAwarded);
                if (scoreResult) {
                    // 创建学生通知
                    this.createNotification({
                        type: 'submission_reviewed',
                        title: '作业已审核',
                        message: `您的作业已审核，获得 ${pointsAwarded} 积分`,
                        recipient: submission.studentId,
                        relatedId: submission.homeworkId
                    });
                }
            }
            
            this.saveSubmissions();
            return submission;
        }
        return null;
    }

    // ==================== 图片上传功能 ====================

    // 添加图片到提交
    addImageToSubmission(submissionId, imageData) {
        const image = new ImageUploadModel({
            ...imageData,
            submissionId: submissionId
        });
        
        this.images.push(image);
        this.saveImages();
        
        // 更新提交中的图片列表
        const submission = this.submissions.find(sub => sub.id === submissionId);
        if (submission) {
            submission.images.push(image.id);
            this.saveSubmissions();
        }
        
        return image;
    }

    // 获取提交的图片
    getSubmissionImages(submissionId) {
        return this.images.filter(img => img.submissionId === submissionId);
    }

    // ==================== 通知功能 ====================

    // 创建通知
    createNotification(notificationData) {
        const notification = new NotificationModel(notificationData);
        this.notifications.push(notification);
        this.saveNotifications();
        return notification;
    }

    // 获取用户通知
    getUserNotifications(userId) {
        return this.notifications.filter(notif => 
            notif.recipient === userId || notif.recipient === 'teacher' || notif.recipient === 'all_students'
        ).sort((a, b) => b.createdAt - a.createdAt);
    }

    // 标记通知为已读
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(notif => notif.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            return notification;
        }
        return null;
    }

    // ==================== 统计功能 ====================

    // 获取作业统计
    getHomeworkStats() {
        const total = this.homeworks.length;
        const published = this.homeworks.filter(hw => hw.status === HomeworkStatus.PUBLISHED).length;
        const closed = this.homeworks.filter(hw => hw.status === HomeworkStatus.CLOSED).length;
        
        return {
            total,
            published,
            closed,
            draft: total - published - closed
        };
    }

    // 获取学生作业完成统计
    getStudentHomeworkStats(studentId) {
        const studentSubmissions = this.submissions.filter(sub => sub.studentId === studentId);
        
        return {
            total: studentSubmissions.length,
            notStarted: studentSubmissions.filter(sub => sub.status === SubmissionStatus.NOT_STARTED).length,
            inProgress: studentSubmissions.filter(sub => sub.status === SubmissionStatus.IN_PROGRESS).length,
            submitted: studentSubmissions.filter(sub => sub.status === SubmissionStatus.SUBMITTED).length,
            reviewed: studentSubmissions.filter(sub => sub.status === SubmissionStatus.REVIEWED).length
        };
    }

    // ==================== 定时任务 ====================

    // 检查截止日期提醒
    checkDueDateReminders() {
        const now = new Date();
        const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        this.homeworks.forEach(homework => {
            if (homework.status === HomeworkStatus.PUBLISHED) {
                const dueDate = new Date(homework.dueDate);
                
                // 如果作业将在24小时内截止
                if (dueDate > now && dueDate <= oneDayLater) {
                    // 给未完成的学生发送提醒
                    const unfinishedSubmissions = this.submissions.filter(sub => 
                        sub.homeworkId === homework.id && 
                        (sub.status === SubmissionStatus.NOT_STARTED || sub.status === SubmissionStatus.IN_PROGRESS)
                    );
                    
                    unfinishedSubmissions.forEach(submission => {
                        this.createNotification({
                            type: 'due_date_reminder',
                            title: '作业即将截止',
                            message: `作业 "${homework.title}" 即将在24小时内截止，请尽快完成`,
                            recipient: submission.studentId,
                            relatedId: homework.id
                        });
                    });
                }
            }
        });
    }
}

// 全局实例
let homeworkManager = null;

// 初始化作业管理器
function initHomeworkManager(dataManager) {
    if (!homeworkManager) {
        homeworkManager = new HomeworkManager(dataManager);
    }
    return homeworkManager;
}

// 获取作业管理器实例
function getHomeworkManager() {
    return homeworkManager;
}