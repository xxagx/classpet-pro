// ClassPet Pro - 腾讯文档数据同步模块

class TencentDocSync {
    constructor() {
        this.apiBase = 'https://docs.qq.com/api/v1';
        this.docId = null;
        this.sheetId = null;
    }

    // 初始化配置
    init(config) {
        this.docId = config.docId;
        this.sheetId = config.sheetId || 'sheet1';
    }

    // 从腾讯文档读取学生数据
    async readFromDoc() {
        try {
            // 实际实现需要调用腾讯文档API
            // 这里使用模拟数据，实际部署时替换为真实API调用
            console.log('从腾讯文档读取数据...');
            
            // 模拟API调用延迟
            await this.delay(500);
            
            // 返回本地存储的数据（实际应从腾讯文档获取）
            const localData = localStorage.getItem('classpet_students');
            if (localData) {
                return JSON.parse(localData);
            }
            return [];
        } catch (error) {
            console.error('读取腾讯文档失败:', error);
            return null;
        }
    }

    // 写入数据到腾讯文档
    async writeToDoc(students) {
        try {
            console.log('写入数据到腾讯文档...');
            
            // 模拟API调用延迟
            await this.delay(500);
            
            // 实际实现：调用腾讯文档API写入数据
            // 这里仅保存到本地，实际部署时替换为真实API调用
            localStorage.setItem('classpet_students_backup', JSON.stringify(students));
            
            return true;
        } catch (error) {
            console.error('写入腾讯文档失败:', error);
            return false;
        }
    }

    // 同步数据（双向）
    async sync() {
        const cloudData = await this.readFromDoc();
        const localData = JSON.parse(localStorage.getItem('classpet_students') || '[]');
        
        // 合并数据（以最新修改为准）
        const mergedData = this.mergeData(localData, cloudData);
        
        // 保存到本地
        localStorage.setItem('classpet_students', JSON.stringify(mergedData));
        
        // 上传到云端
        await this.writeToDoc(mergedData);
        
        return mergedData;
    }

    // 合并数据逻辑
    mergeData(local, cloud) {
        if (!cloud || cloud.length === 0) return local;
        if (!local || local.length === 0) return cloud;
        
        const merged = [...local];
        
        cloud.forEach(cloudStudent => {
            const localIndex = merged.findIndex(s => s.id === cloudStudent.id);
            if (localIndex >= 0) {
                // 比较更新时间，取最新
                const localTime = merged[localIndex].updatedAt || 0;
                const cloudTime = cloudStudent.updatedAt || 0;
                if (cloudTime > localTime) {
                    merged[localIndex] = cloudStudent;
                }
            } else {
                merged.push(cloudStudent);
            }
        });
        
        return merged;
    }

    // 导出为CSV格式（用于腾讯文档导入）
    exportToCSV(students) {
        const headers = ['ID', '姓名', '积分', '阶段', '奖励数量', '更新时间'];
        const rows = students.map(s => {
            const stage = this.getStageName(s.score);
            return [
                s.id,
                s.name,
                s.score,
                stage,
                s.rewards ? s.rewards.length : 0,
                new Date(s.updatedAt || Date.now()).toLocaleString()
            ];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    getStageName(score) {
        if (score >= 300) return '完全体';
        if (score >= 150) return '成长期';
        if (score >= 50) return '幼崽';
        return '蛋';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 自动同步管理器
class AutoSyncManager {
    constructor(syncInstance) {
        this.sync = syncInstance;
        this.interval = null;
        this.syncInterval = 30000; // 30秒同步一次
    }

    start() {
        // 立即同步一次
        this.sync.sync();
        
        // 定时同步
        this.interval = setInterval(() => {
            this.sync.sync();
        }, this.syncInterval);
        
        console.log('自动同步已启动');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // 手动触发同步
    async forceSync() {
        return await this.sync.sync();
    }
}

// 导出
window.TencentDocSync = TencentDocSync;
window.AutoSyncManager = AutoSyncManager;
