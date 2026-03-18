// ClassPet Pro - 统计报表模块

// 历史数据管理
class StatsDataManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.loadHistory();
    }

    // 加载历史数据
    loadHistory() {
        const saved = localStorage.getItem('classpet_score_history');
        if (saved) {
            this.history = JSON.parse(saved);
        } else {
            this.history = [];
        }
    }

    // 保存历史数据
    saveHistory() {
        localStorage.setItem('classpet_score_history', JSON.stringify(this.history));
    }

    // 记录每日数据
    recordDailySnapshot() {
        const today = new Date().toDateString();
        const lastSnapshot = this.history[this.history.length - 1];

        // 如果今天已经记录过，更新它
        if (lastSnapshot && lastSnapshot.date === today) {
            lastSnapshot.data = this.captureSnapshot();
        } else {
            // 添加新的快照
            this.history.push({
                date: today,
                timestamp: Date.now(),
                data: this.captureSnapshot()
            });
        }

        // 只保留最近30天的数据
        if (this.history.length > 30) {
            this.history = this.history.slice(-30);
        }

        this.saveHistory();
    }

    // 捕获当前数据快照
    captureSnapshot() {
        const students = this.data.students;
        return {
            totalStudents: students.length,
            totalScore: students.reduce((sum, s) => sum + s.score, 0),
            averageScore: Math.round(students.reduce((sum, s) => sum + s.score, 0) / students.length) || 0,
            highestScore: Math.max(...students.map(s => s.score)),
            lowestScore: Math.min(...students.map(s => s.score)),
            stageDistribution: this.getStageDistribution(students),
            topStudents: students
                .map(s => ({ name: s.name, score: s.score }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
        };
    }

    // 获取阶段分布
    getStageDistribution(students) {
        const distribution = {};
        students.forEach(student => {
            const stage = this.data.getStage(student.score).name;
            distribution[stage] = (distribution[stage] || 0) + 1;
        });
        return distribution;
    }

    // 获取积分趋势数据
    getScoreTrend(days = 7) {
        return this.history.slice(-days);
    }

    // 获取学生成长曲线
    getStudentGrowth(studentId) {
        // 这里简化处理，实际应该追踪每个学生的历史数据
        const student = this.data.getStudent(studentId);
        if (!student) return null;

        // 模拟成长数据
        const growth = [];
        const stages = this.data.config.stages;
        const currentStageIndex = stages.findIndex(s => s.name === this.data.getStage(student.score).name);

        for (let i = 0; i <= currentStageIndex; i++) {
            const stage = stages[i];
            const nextStage = stages[i + 1];
            const stageMinScore = stage.minScore;
            const stageMaxScore = nextStage ? nextStage.minScore : student.score;

            growth.push({
                stage: stage.name,
                minScore: stageMinScore,
                maxScore: stageMaxScore,
                currentScore: Math.min(stageMaxScore, Math.max(stageMinScore, student.score)),
                emoji: stage.emoji,
                color: stage.color
            });
        }

        return growth;
    }

    // 获取班级统计
    getClassStats() {
        const students = this.data.students;
        return {
            totalStudents: students.length,
            totalScore: students.reduce((sum, s) => sum + s.score, 0),
            averageScore: Math.round(students.reduce((sum, s) => sum + s.score, 0) / students.length) || 0,
            medianScore: this.getMedian(students.map(s => s.score)),
            highestScore: Math.max(...students.map(s => s.score)),
            lowestScore: Math.min(...students.map(s => s.score)),
            stageDistribution: this.getStageDistribution(students),
            topStudents: students
                .map(s => ({ name: s.name, score: s.score, id: s.id }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
        };
    }

    // 获取中位数
    getMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
}

// 图表渲染器
class ChartRenderer {
    constructor() {
        this.colors = ['#667eea', '#f093fb', '#51cf66', '#ffd43b', '#ff6b6b'];
    }

    // 绘制折线图（积分趋势）
    renderLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 300;
        ctx.scale(2, 2);

        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const chartWidth = canvas.offsetWidth - padding.left - padding.right;
        const chartHeight = 250 - padding.top - padding.bottom;

        // 清空画布
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 获取数据
        const scores = data.map(d => d.data.averageScore);
        const dates = data.map(d => d.date);
        const maxScore = Math.max(...scores) * 1.2;
        const minScore = 0;

        // 绘制网格线
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            // Y轴标签
            const value = Math.round(maxScore - (maxScore / 5) * i);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 4);
        }

        // 绘制X轴标签
        dates.forEach((date, i) => {
            const x = padding.left + (chartWidth / (dates.length - 1)) * i;
            ctx.fillStyle = '#666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            const shortDate = date.split(' ').slice(0, 2).join(' ');
            ctx.fillText(shortDate, x, padding.top + chartHeight + 20);
        });

        // 绘制数据线
        if (scores.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.colors[0];
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            scores.forEach((score, i) => {
                const x = padding.left + (chartWidth / (scores.length - 1)) * i;
                const y = padding.top + chartHeight - (score / maxScore) * chartHeight;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // 绘制数据点
            scores.forEach((score, i) => {
                const x = padding.left + (chartWidth / (scores.length - 1)) * i;
                const y = padding.top + chartHeight - (score / maxScore) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = this.colors[0];
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // 标题
        if (options.title) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(options.title, canvas.offsetWidth / 2, 25);
        }

        return ctx;
    }

    // 绘制柱状图（阶段分布）
    renderBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 300;
        ctx.scale(2, 2);

        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const chartWidth = canvas.offsetWidth - padding.left - padding.right;
        const chartHeight = 250 - padding.top - padding.bottom;

        // 清空画布
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const labels = Object.keys(data);
        const values = Object.values(data);
        const maxValue = Math.max(...values) * 1.2;

        // 绘制网格线
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            const value = Math.round(maxValue - (maxValue / 5) * i);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 4);
        }

        // 绘制柱子
        const barWidth = (chartWidth / labels.length) * 0.6;
        const gap = (chartWidth / labels.length) * 0.4;

        labels.forEach((label, i) => {
            const x = padding.left + (chartWidth / labels.length) * i + gap / 2;
            const barHeight = (data[label] / maxValue) * chartHeight;
            const y = padding.top + chartHeight - barHeight;

            // 渐变色
            const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
            gradient.addColorStop(0, this.colors[i % this.colors.length]);
            gradient.addColorStop(1, this.colors[i % this.colors.length] + '80');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // 标签
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barWidth / 2, padding.top + chartHeight + 20);

            // 数值
            ctx.fillStyle = '#666';
            ctx.fillText(data[label].toString(), x + barWidth / 2, y - 5);
        });

        // 标题
        if (options.title) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(options.title, canvas.offsetWidth / 2, 25);
        }

        return ctx;
    }

    // 绘制成长进度图
    renderGrowthChart(canvasId, growthData, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 200;
        ctx.scale(2, 2);

        const padding = { top: 40, right: 30, bottom: 30, left: 80 };
        const chartWidth = canvas.offsetWidth - padding.left - padding.right;
        const chartHeight = 150 - padding.top - padding.bottom;

        // 清空画布
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        growthData.forEach((stage, i) => {
            const y = padding.top + (chartHeight / growthData.length) * i;
            const progress = (stage.currentScore - stage.minScore) / (stage.maxScore - stage.minScore || 1);
            const barWidth = chartWidth * progress;

            // 背景条
            ctx.fillStyle = '#e9ecef';
            ctx.fillRect(padding.left, y, chartWidth, 30);

            // 进度条
            const gradient = ctx.createLinearGradient(padding.left, y, padding.left + barWidth, y);
            gradient.addColorStop(0, stage.color);
            gradient.addColorStop(1, stage.color + '80');
            ctx.fillStyle = gradient;
            ctx.fillRect(padding.left, y, barWidth, 30);

            // 阶段标签
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${stage.emoji} ${stage.stage}`, padding.left - 10, y + 20);

            // 分数显示
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${stage.currentScore}/${stage.maxScore}`, padding.left + chartWidth, y + 20);
        });

        // 标题
        if (options.title) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(options.title, canvas.offsetWidth / 2, 25);
        }

        return ctx;
    }
}

// 导出
window.StatsDataManager = StatsDataManager;
window.ChartRenderer = ChartRenderer;
