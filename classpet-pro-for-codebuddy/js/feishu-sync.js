// ClassPet Pro - 飞书Bitable数据同步模块

class FeishuBitableSync {
    constructor() {
        this.appToken = null;  // 需要从Bitable获取
        this.tableId = null;   // 表格ID
        this.accessToken = null;  // 访问令牌
        this.baseUrl = 'https://open.feishu.cn/open-apis/bitable/v1';
        this.isConfigured = false;
        this.useCloudSync = false;  // 默认使用本地存储，需要配置后才启用云端同步
    }

    // 初始化配置
    init(config) {
        this.appToken = config.appToken;
        this.tableId = config.tableId;
        this.accessToken = config.accessToken;
        this.useCloudSync = config.useCloudSync || false;
        
        if (this.appToken && this.tableId && this.accessToken && this.useCloudSync) {
            this.isConfigured = true;
            console.log('飞书Bitable同步已配置');
        } else {
            console.log('飞书Bitable同步未完整配置，将使用本地存储');
        }
    }

    // 获取访问令牌（如果使用OAuth2）
    async getAccessToken() {
        // 这里简化处理，实际应该使用OAuth2流程
        // 用户需要在配置中提供tenant_access_token或user_access_token
        return this.accessToken;
    }

    // 通用API请求方法
    async apiRequest(method, endpoint, data = null) {
        if (!this.isConfigured || !this.useCloudSync) {
            console.log('云端同步未启用，跳过API请求');
            return null;
        }

        try {
            const token = await this.getAccessToken();
            const url = `${this.baseUrl}/${this.appToken}/tables/${this.tableId}/${endpoint}`;
            
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const options = {
                method: method,
                headers: headers
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            console.log(`飞书API请求: ${method} ${url}`);
            
            const response = await fetch(url, options);
            const result = await response.json();

            if (result.code !== 0) {
                console.error('飞书API错误:', result.msg);
                return null;
            }

            return result.data;
        } catch (error) {
            console.error('飞书API请求失败:', error);
            return null;
        }
    }

    // 从飞书Bitable读取学生数据
    async readFromBitable() {
        try {
            console.log('从飞书Bitable读取数据...');
            
            // 如果未配置云端同步，使用本地存储
            if (!this.isConfigured || !this.useCloudSync) {
                const localData = localStorage.getItem('classpet_students');
                if (localData) {
                    return JSON.parse(localData);
                }
                return [];
            }

            // 从云端读取
            const data = await this.apiRequest('GET', 'records');
            
            if (data && data.items) {
                // 转换飞书数据格式到本系统格式
                const students = data.items.map((item, index) => {
                    const fields = item.fields || {};
                    return {
                        id: fields['学号'] || index + 1,
                        name: fields['姓名'] || `学生${index + 1}`,
                        score: fields['积分'] || 0,
                        rewards: fields['奖励'] ? JSON.parse(fields['奖励']) : [],
                        createdAt: fields['创建时间'] || Date.now(),
                        updatedAt: fields['更新时间'] || Date.now(),
                        feishuRecordId: item.record_id  // 保存飞书记录ID用于更新
                    };
                });
                return students;
            }
            
            return [];
        } catch (error) {
            console.error('读取飞书Bitable失败:', error);
            return null;
        }
    }

    // 写入数据到飞书Bitable
    async writeToBitable(students) {
        try {
            console.log('写入数据到飞书Bitable...');
            
            // 如果未配置云端同步，使用本地存储
            if (!this.isConfigured || !this.useCloudSync) {
                localStorage.setItem('classpet_students_backup', JSON.stringify(students));
                console.log('数据已保存到本地备份');
                return true;
            }

            // 首先获取现有记录
            const existingData = await this.apiRequest('GET', 'records');
            const existingRecords = existingData?.items || [];
            
            // 构建记录映射
            const recordMap = new Map();
            existingRecords.forEach(item => {
                if (item.fields && item.fields['学号']) {
                    recordMap.set(item.fields['学号'], item.record_id);
                }
            });

            // 批量写入
            const batchSize = 50;
            for (let i = 0; i < students.length; i += batchSize) {
                const batch = students.slice(i, i + batchSize);
                const records = batch.map(student => ({
                    fields: {
                        '学号': student.id,
                        '姓名': student.name,
                        '积分': student.score,
                        '奖励': JSON.stringify(student.rewards || []),
                        '创建时间': student.createdAt || Date.now(),
                        '更新时间': Date.now()
                    }
                }));

                // 检查是新增还是更新
                for (let j = 0; j < records.length; j++) {
                    const record = records[j];
                    const student = batch[j];
                    
                    if (student.feishuRecordId) {
                        // 更新现有记录
                        await this.apiRequest('PUT', `records/${student.feishuRecordId}`, record);
                    } else if (recordMap.has(student.id)) {
                        // 根据学号更新
                        const recordId = recordMap.get(student.id);
                        await this.apiRequest('PUT', `records/${recordId}`, record);
                    } else {
                        // 新增记录
                        await this.apiRequest('POST', 'records', { records: [record] });
                    }
                }
            }

            console.log('数据已成功写入飞书Bitable');
            return true;
        } catch (error) {
            console.error('写入飞书Bitable失败:', error);
            return false;
        }
    }

    // 同步数据（双向）
    async sync() {
        const cloudData = await this.readFromBitable();
        const localData = JSON.parse(localStorage.getItem('classpet_students') || '[]');
        
        // 合并数据（以最新修改为准）
        const mergedData = this.mergeData(localData, cloudData);
        
        // 保存到本地
        localStorage.setItem('classpet_students', JSON.stringify(mergedData));
        
        // 上传到云端
        await this.writeToBitable(mergedData);
        
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

    // 导出为CSV格式（用于飞书Bitable导入）
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

    // 检查连接状态
    async checkConnection() {
        if (!this.isConfigured || !this.useCloudSync) {
            return false;
        }

        try {
            const data = await this.apiRequest('GET', 'records', { page_size: 1 });
            return data !== null;
        } catch (error) {
            return false;
        }
    }

    // 同步单个学生的分数
    async syncStudentScore(studentId, newScore) {
        if (!this.isConfigured || !this.useCloudSync) {
            return false;
        }

        try {
            // 查找该学生的记录
            const data = await this.apiRequest('GET', `records?filter={"学号":[${studentId}]}`);
            
            if (data && data.items && data.items.length > 0) {
                const record = data.items[0];
                const recordId = record.record_id;
                
                // 更新记录
                await this.apiRequest('PUT', `records/${recordId}`, {
                    fields: {
                        ...record.fields,
                        '积分': newScore,
                        '更新时间': Date.now()
                    }
                });
                
                console.log(`学生${studentId}的分数已同步到云端`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('同步学生分数失败:', error);
            return false;
        }
    }

    // 创建飞书Bitable表格（如果不存在）
    async createTableIfNotExists() {
        if (!this.isConfigured || !this.useCloudSync) {
            console.log('云端同步未启用，跳过创建表格');
            return false;
        }

        // 检查表格是否存在
        const tables = await this.apiRequest('GET', '');
        
        if (tables && tables.items) {
            const exists = tables.items.some(table => table.table_id === this.tableId);
            if (exists) {
                console.log('表格已存在');
                return true;
            }
        }

        // 创建新表格
        try {
            const newTable = await this.apiRequest('POST', 'tables', {
                table: {
                    name: '班级宠物数据',
                    fields: [
                        {
                            field_name: '学号',
                            type: 1  // Number
                        },
                        {
                            field_name: '姓名',
                            type: 1  // Text
                        },
                        {
                            field_name: '积分',
                            type: 2  // Number
                        },
                        {
                            field_name: '奖励',
                            type: 15  // Text
                        },
                        {
                            field_name: '创建时间',
                            type: 5  // DateTime
                        },
                        {
                            field_name: '更新时间',
                            type: 5  // DateTime
                        }
                    ]
                }
            });

            if (newTable) {
                this.tableId = newTable.table.table_id;
                console.log('表格创建成功:', this.tableId);
                return true;
            }

            return false;
        } catch (error) {
            console.error('创建表格失败:', error);
            return false;
        }
    }
}

// 自动同步管理器
class FeishuAutoSyncManager {
    constructor(syncInstance) {
        this.sync = syncInstance;
        this.interval = null;
        this.syncInterval = 30000; // 30秒同步一次
        this.lastSyncTime = 0;
        this.isSyncing = false;
        this.syncStatus = 'idle'; // idle, syncing, success, error
    }

    start() {
        if (this.interval) {
            console.log('自动同步已在运行');
            return;
        }

        // 立即同步一次
        this.performSync();

        // 定时同步
        this.interval = setInterval(() => {
            this.performSync();
        }, this.syncInterval);

        console.log('飞书Bitable自动同步已启动');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('飞书Bitable自动同步已停止');
        }
    }

    // 执行同步
    async performSync() {
        if (this.isSyncing) {
            console.log('正在同步中，跳过本次');
            return;
        }

        this.isSyncing = true;
        this.syncStatus = 'syncing';

        try {
            const result = await this.sync.sync();
            this.syncStatus = result ? 'success' : 'error';
            this.lastSyncTime = Date.now();
            
            console.log('同步完成:', result ? '成功' : '失败');
        } catch (error) {
            console.error('同步失败:', error);
            this.syncStatus = 'error';
        } finally {
            this.isSyncing = false;
        }
    }

    // 手动触发同步
    async forceSync() {
        return await this.performSync();
    }

    // 获取同步状态
    getStatus() {
        return {
            status: this.syncStatus,
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            nextSyncTime: this.lastSyncTime + this.syncInterval
        };
    }

    // 设置同步间隔
    setSyncInterval(interval) {
        this.syncInterval = interval;
        if (this.interval) {
            this.stop();
            this.start();
        }
    }
}

// 导出
window.FeishuBitableSync = FeishuBitableSync;
window.FeishuAutoSyncManager = FeishuAutoSyncManager;
